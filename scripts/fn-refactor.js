import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import http from 'node:http';

import Table from 'cli-table3';
import { parse, print, visit } from 'recast';
import { builders as b, namedTypes as n } from 'ast-types';
import * as tsParser from 'recast/parsers/typescript.js';

const ARGS = process.argv.slice(2);
const VERBOSE = ARGS.includes('--verbose');

class FnRefactorEngine {
  constructor() {
    this.stats = {
      capturedVariants: 0,
      paramsInstrumented: 0,
      patchesApplied: 0,
    };
    this.runtimeStats = {};
    this.server = null;
    this.libDir = path.join(process.cwd(), 'src', 'lib');
  }

  log(step, description) {
    const time = new Date().toLocaleTimeString();
    console.log(`\n\x1b[35m[${time}] STEP ${step}:\x1b[0m ${description}`);
  }

  // ACT 1: Instrument (Pollute)
  instrument() {
    this.log(1, 'Instrumenting Function Arguments');
    const files = fs.readdirSync(this.libDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const fullPath = path.join(this.libDir, file);
      const code = fs.readFileSync(fullPath, 'utf8');
      const ast = parse(code, { parser: tsParser });
      let modified = false;

      const self = this;
      visit(ast, {
        visitFunction(path) {
          const node = path.node;
          // Guard against null loc
          const line = node.loc ? node.loc.start.line : 0;

          const paramsToSpy = node.params.filter((p) => n.Identifier.check(p));

          if (paramsToSpy.length > 0) {
            paramsToSpy.forEach((p) => {
              const spyCall = b.expressionStatement(
                b.callExpression(b.identifier('__typeSpy'), [
                  b.literal(p.name),
                  b.identifier(p.name),
                  b.literal(`${file}:${line}`),
                ]),
              );
              if (n.BlockStatement.check(node.body)) {
                node.body.body.unshift(spyCall);
              }
              self.stats.paramsInstrumented++;
            });
            modified = true;
          }
          this.traverse(path);
        },
      });

      if (modified) {
        ast.program.body.unshift(
          b.importDeclaration(
            [b.importSpecifier(b.identifier('__typeSpy'))],
            b.literal('../../scripts/typeSpy.js'),
          ),
        );
        fs.writeFileSync(fullPath, print(ast).code);
      }
    }
  }

  startCollector() {
    this.server = http
      .createServer((req, res) => {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            JSON.parse(body).forEach((e) => {
              if (!this.runtimeStats[e.key]) {
                this.runtimeStats[e.key] = new Set();
              }
              this.runtimeStats[e.key].add(e.shape);
              this.stats.capturedVariants++;
            });
          } catch {}
          res.end();
        });
      })
      .listen(3000);
  }

  // ACT 3: Revert (Midway Cleanup)
  revert() {
    this.log(4, 'Reverting Instrumentation (Cleaning Source)');
    const files = fs.readdirSync(this.libDir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
      const fullPath = path.join(this.libDir, file);
      const ast = parse(fs.readFileSync(fullPath, 'utf8'), {
        parser: tsParser,
      });

      // Remove spy imports
      ast.program.body = ast.program.body.filter(
        (node) =>
          !(
            n.ImportDeclaration.check(node) &&
            node.source.value.includes('typeSpy')
          ),
      );

      // Remove spy calls
      visit(ast, {
        visitCallExpression(path) {
          if (
            n.Identifier.check(path.node.callee) &&
            path.node.callee.name === '__typeSpy'
          ) {
            path.prune();
          }
          return false;
        },
      });
      fs.writeFileSync(fullPath, print(ast).code);
    }
  }

  // ACT 4: Patch (Refactor)
  getTSString(raw) {
    if (Array.isArray(raw)) {
      return raw.map((r) => this.getTSString(r)).join(' | ');
    }
    const match = raw.match(/(\w+)\[(\d+)\]/);
    if (match) {
      return `[${new Array(Number(match[2])).fill(match[1] === 'object' ? 'any' : match[1]).join(', ')}]`;
    }
    return raw === 'function' ? '(...args: any[]) => any' : raw;
  }

  patch() {
    this.log(5, 'Applying Strict Types & Tuples');
    const files = fs.readdirSync(this.libDir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
      const fullPath = path.join(this.libDir, file);
      const ast = parse(fs.readFileSync(fullPath, 'utf8'), {
        parser: tsParser,
      });
      let changed = false;

      const self = this;
      visit(ast, {
        visitFunction(path) {
          const line = path.node.loc ? path.node.loc.start.line : 0;
          path.node.params.forEach((p) => {
            if (n.Identifier.check(p)) {
              const key = `${file}:${line}:${p.name}`;
              if (self.runtimeStats[key]) {
                const tsType = self.getTSString(
                  Array.from(self.runtimeStats[key]),
                );
                p.typeAnnotation = b.tsTypeAnnotation(
                  b.tsTypeReference(b.identifier(tsType)),
                );
                self.stats.patchesApplied++;
                changed = true;
              }
            }
          });
          this.traverse(path);
        },
      });
      if (changed) {
        fs.writeFileSync(fullPath, print(ast).code);
      }
    }
  }

  async run() {
    this.instrument();
    this.startCollector();
    this.log(2, 'Running Tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch {}

    this.log(3, 'Waiting for telemetry flush...');
    await new Promise((r) => setTimeout(r, 2000));
    this.server.close();

    this.revert();
    this.patch();
    this.report();
  }

  report() {
    this.log(6, 'Final Summary');
    const table = new Table({ head: ['Metric', 'Count'] });
    table.push(
      ['Params Instrumented', this.stats.paramsInstrumented],
      ['Type Variants Captured', this.stats.capturedVariants],
      ['Safe Patches Applied', this.stats.patchesApplied],
    );
    console.log(table.toString());
  }
}

new FnRefactorEngine().run();
