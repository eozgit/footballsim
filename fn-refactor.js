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
      functionsInstrumented: 0,
      paramsInstrumented: 0,
      capturedVariants: 0,
    };
    this.runtimeStats = {};
    this.server = null;
  }

  log(step, description) {
    const time = new Date().toLocaleTimeString();
    console.log(`\n\x1b[35m[${time}] STEP ${step}:\x1b[0m ${description}`);
  }

  instrumentFunctions() {
    this.log(1, 'Instrumenting Function Arguments (any/unknown)');
    const libDir = path.join(process.cwd(), 'lib');
    const files = fs.readdirSync(libDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      if (file === 'typeSpy.js') continue;

      const fullPath = path.join(libDir, file);
      const code = fs.readFileSync(fullPath, 'utf8');
      const ast = parse(code, { parser: tsParser });
      let fileModified = false;

      ast.program.body = ast.program.body.filter((node) => {
        return !(
          n.ImportDeclaration.check(node) &&
          node.source.value.includes('typeSpy')
        );
      });

      const self = this;
      visit(ast, {
        visitFunctionDeclaration(path) {
          return self.processFn(this, path, file, () => (fileModified = true));
        },
        visitFunctionExpression(path) {
          return self.processFn(this, path, file, () => (fileModified = true));
        },
        visitArrowFunctionExpression(path) {
          return self.processFn(this, path, file, () => (fileModified = true));
        },
      });

      if (fileModified) {
        const importStmt = b.importDeclaration(
          [b.importSpecifier(b.identifier('__typeSpy'))],
          b.literal('./typeSpy.js'),
        );
        ast.program.body.unshift(importStmt);
        fs.writeFileSync(fullPath, print(ast).code);
      }
    }
  }

  processFn(visitorContext, path, fileName, onModified) {
    const node = path.node;
    const paramsToSpy = node.params.filter((p) => {
      if (n.Identifier.check(p)) {
        const typeNode = p.typeAnnotation?.typeAnnotation;
        return (
          !typeNode ||
          typeNode.type === 'TSAnyKeyword' ||
          typeNode.type === 'TSUnknownKeyword'
        );
      }
      return false;
    });

    if (paramsToSpy.length > 0) {
      onModified();
      this.stats.functionsInstrumented++;

      paramsToSpy.forEach((p) => {
        const spyCall = b.expressionStatement(
          b.callExpression(b.identifier('__typeSpy'), [
            b.literal(p.name),
            b.identifier(p.name),
            b.literal(`${fileName}:${node.loc?.start.line || 0}`),
          ]),
        );

        if (n.BlockStatement.check(node.body)) {
          node.body.body.unshift(spyCall);
          this.stats.paramsInstrumented++;
        } else {
          node.body = b.blockStatement([spyCall, b.returnStatement(node.body)]);
          this.stats.paramsInstrumented++;
        }
      });
    }
    visitorContext.traverse(path);
  }

  startCollector() {
    this.log(2, 'Starting Telemetry Collector');
    this.server = http
      .createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            data.forEach((entry) => {
              if (!this.runtimeStats[entry.key])
                this.runtimeStats[entry.key] = new Set();
              this.runtimeStats[entry.key].add(entry.shape);
              this.stats.capturedVariants++; // Count every incoming hit
            });
          } catch (e) {
            if (VERBOSE) console.error('Parse error in collector', e);
          }
          res.end();
        });
      })
      .listen(3000); // CRITICAL: Listen on port 3000
  }

  async run() {
    this.instrumentFunctions();
    this.startCollector();

    this.log(3, 'Running Tests to Collect Types');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch (e) {
      console.error(
        '  ! Test execution had failures, but we might still have data.',
      );
    }

    this.log(4, 'Waiting for telemetry to flush...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return new Promise((resolve) => {
      this.server.close(() => {
        this.log(5, 'Telemetry Collector Stopped');

        // Convert Sets to Arrays so JSON.stringify works
        const finalResults = {};
        for (const [key, set] of Object.entries(this.runtimeStats)) {
          const shapes = Array.from(set);
          finalResults[key] = shapes.length === 1 ? shapes[0] : shapes;
        }

        fs.writeFileSync(
          'fn-type-stats.json',
          JSON.stringify(finalResults, null, 2),
        );
        console.log('  > Inferred types saved to fn-type-stats.json');
        this.report();
        resolve();
      });
    });
  }

  report() {
    this.log(6, 'Execution Summary');
    const table = new Table({ head: ['Metric', 'Count'] });
    table.push(
      ['Functions Instrumented', this.stats.functionsInstrumented],
      ['Total Params Spied', this.stats.paramsInstrumented],
      ['Incoming Type Events', this.stats.capturedVariants],
      ['Unique Symbols Resolved', Object.keys(this.runtimeStats).length],
    );
    console.log(table.toString());
  }
  translateType(rawType) {
    if (Array.isArray(rawType)) {
      return rawType.map((t) => this.translateType(t)).join(' | ');
    }

    // Handle our custom tuple notation
    const tupleMatch = rawType.match(/(\w+)\[(\d+)\]/);
    if (tupleMatch) {
      const [_, type, count] = tupleMatch;
      // Special case: we know 2 items = [number, number], 3 items = [number, number, number]
      if (type === 'number') {
        return `[${new Array(Number(count)).fill('number').join(', ')}]`;
      }
      if (type === 'object') {
        return `any[]`; // object[11] is usually a team array, better as any[] for now
      }
    }

    // Map 'function' to a generic callable
    if (rawType === 'function') return '(...args: any[]) => any';

    return rawType;
  }

  // Helper to turn your JSON data into valid TS strings (Tuples, Unions, etc.)
  getTSTypeString(raw) {
    if (Array.isArray(raw)) {
      return raw.map((r) => this.getTSTypeString(r)).join(' | ');
    }

    // Handle our custom tuple notation "number[2]" -> "[number, number]"
    const tupleMatch = raw.match(/(\w+)\[(\d+)\]/);
    if (tupleMatch) {
      const [_, type, count] = tupleMatch;
      const inner = type === 'object' ? 'any' : type;
      return `[${new Array(Number(count)).fill(inner).join(', ')}]`;
    }

    if (raw === 'function') return '(...args: any[]) => any';
    if (raw === 'null' || raw === 'undefined') return 'any'; // Don't patch to just null

    return raw;
  }

  traceAndPatch() {
    this.log(7, 'Applying Inferred Types to Source');
    const libDir = path.join(process.cwd(), 'lib');
    const files = fs.readdirSync(libDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const fullPath = path.join(libDir, file);
      const code = fs.readFileSync(fullPath, 'utf8');
      const ast = parse(code, { parser: tsParser });
      let fileChanged = false;

      const self = this;
      visit(ast, {
        visitFunction(path) {
          // Handles declarations, expressions, and arrows
          const node = path.node;
          node.params.forEach((param) => {
            if (n.Identifier.check(param)) {
              // Construct key based on line number captured in JSON
              const key = `${file}:${node.loc.start.line}:${param.name}`;
              const rawData = self.runtimeStats[key];

              if (rawData) {
                const tsTypeStr = self.getTSTypeString(rawData);

                // Only patch if it's currently any/unknown or missing
                if (
                  !param.typeAnnotation ||
                  param.typeAnnotation.typeAnnotation.type === 'TSAnyKeyword' ||
                  param.typeAnnotation.typeAnnotation.type ===
                    'TSUnknownKeyword'
                ) {
                  // In Recast, we create a TypeReference for custom strings like [number, number]
                  param.typeAnnotation = b.tsTypeAnnotation(
                    b.tsTypeReference(b.identifier(tsTypeStr)),
                  );
                  fileChanged = true;
                }
              }
            }
          });
          this.traverse(path);
        },
      });

      if (fileChanged) {
        // Clean up instrumentation import while we're rewriting the file
        ast.program.body = ast.program.body.filter(
          (node) =>
            !(
              n.ImportDeclaration.check(node) &&
              node.source.value.includes('typeSpy')
            ),
        );
        fs.writeFileSync(fullPath, print(ast).code);
        console.log(`  + Patched: ${file}`);
      }
    }
  }
  // Helper to turn your JSON data into a valid TS string
  getTSLiteral(raw) {
    if (Array.isArray(raw)) {
      // Join multiple variants with a pipe for a Union Type
      return raw.map((r) => this.formatType(r)).join(' | ');
    }
    return this.formatType(raw);
  }

  formatType(typeStr) {
    // Convert "number[2]" -> "[number, number]"
    const tupleMatch = typeStr.match(/(\w+)\[(\d+)\]/);
    if (tupleMatch) {
      const [_, type, count] = tupleMatch;
      return `[${new Array(Number(count)).fill(type === 'object' ? 'any' : type).join(', ')}]`;
    }

    // Convert "function" -> generic callable
    if (typeStr === 'function') return '(...args: any[]) => any';

    return typeStr;
  }
}

new FnRefactorEngine().run();

async function startRefactor() {
  // 1. REVERT MANUALLY FIRST: git checkout lib/

  // 2. Load the "Brain" from the previous run
  if (fs.existsSync('fn-type-stats.json')) {
    engine.runtimeStats = JSON.parse(
      fs.readFileSync('fn-type-stats.json', 'utf8'),
    );

    // 3. Patch the clean files
    engine.traceAndPatch();
    console.log("\nRefactor Complete. Run 'npm test' to verify types!");
  } else {
    console.log(
      'No type stats found. Run the engine with instrumentation first.',
    );
  }
}

startRefactor();
