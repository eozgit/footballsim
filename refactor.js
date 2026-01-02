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
const SILENT_TEST = ARGS.includes('--silent-test');

class RefactorEngine {
  constructor() {
    this.stats = {
      initialErrors: 0,
      instrumentedLines: 0,
      capturedVariants: 0,
      patchesApplied: 0,
    };
    this.runtimeStats = {};
    this.server = null;
  }

  log(step, description) {
    const time = new Date().toLocaleTimeString();
    console.log(`\n\x1b[35m[${time}] STEP ${step}:\x1b[0m ${description}`);
  }

  execute(cmd, desc) {
    try {
      if (desc) console.log(`  > Executing: ${desc}...`);
      return execSync(cmd, { stdio: SILENT_TEST ? 'pipe' : 'inherit' });
    } catch (e) {
      return e.stdout?.toString();
    }
  }

  // --- Step 1: Diagnostics ---
  runDiagnostics() {
    this.log(1, 'Diagnostic Generation');
    this.execute(
      'npx tsc --noEmit --extendedDiagnostics > type-check-report.txt',
      'TSC Diagnostics',
    );

    const content = fs.readFileSync('type-check-report.txt', 'utf8');
    const errors = content
      .split('\n')
      .map((line) => line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.*)$/))
      .filter((m) => m && m[4] === 'TS18046' && m[1].startsWith('lib/'))
      .map((m) => ({
        file: m[1],
        line: parseInt(m[2]),
        symbol: (m[5].match(/'(.+)'/) || [])[1],
      }));

    this.stats.initialErrors = errors.length;
    return errors;
  }

  // --- Step 2: Instrumentation ---
  instrument(errors) {
    this.log(2, 'AST-Based Instrumentation');
    const self = this;

    const fileGroups = errors.reduce((acc, e) => {
      acc[e.file] = acc[e.file] || [];
      acc[e.file].push(e);
      return acc;
    }, {});

    for (const [file, entries] of Object.entries(fileGroups)) {
      const fullPath = path.resolve(file);
      const code = fs.readFileSync(fullPath, 'utf8');
      const ast = parse(code, { parser: tsParser });

      let hasSpyImport = false;
      const injectedInThisFile = new Set();

      visit(ast, {
        visitImportDeclaration(path) {
          if (path.value.source.value === './typeSpy') hasSpyImport = true;
          this.traverse(path);
        },
        visitNode(path) {
          const node = path.value;
          if (!node.loc) return this.traverse(path);

          const error = entries.find((e) => node.loc.start.line === e.line);
          if (error) {
            const cleanSymbol = error.symbol.replace(/'/g, '').split(' ')[0];
            const lockKey = `${error.line}:${cleanSymbol}`;

            if (!injectedInThisFile.has(lockKey)) {
              let stmtPath = path;
              while (stmtPath && !n.Statement.check(stmtPath.value)) {
                stmtPath = stmtPath.parentPath;
              }

              if (stmtPath && n.Statement.check(stmtPath.value)) {
                const spyCall = b.expressionStatement(
                  b.callExpression(b.identifier('__typeSpy'), [
                    b.stringLiteral(cleanSymbol),
                    b.identifier(cleanSymbol),
                    b.stringLiteral(`${file}:${error.line}`),
                  ]),
                );

                const safeSpy = b.ifStatement(
                  b.binaryExpression(
                    '!==',
                    b.unaryExpression('typeof', b.identifier(cleanSymbol)),
                    b.stringLiteral('undefined'),
                  ),
                  spyCall,
                );

                const parentValue = stmtPath.parentPath.value;
                const isList =
                  Array.isArray(parentValue) ||
                  (parentValue && Array.isArray(parentValue.body));

                if (isList) {
                  stmtPath.insertBefore(safeSpy);
                } else {
                  stmtPath.replace(b.blockStatement([safeSpy, stmtPath.value]));
                }

                injectedInThisFile.add(lockKey);
                self.stats.instrumentedLines++;
              }
            }
          }
          this.traverse(path);
        },
      });

      let output = print(ast).code;
      if (!hasSpyImport) {
        output = `import { __typeSpy } from './typeSpy';\n` + output;
      }
      fs.writeFileSync(fullPath, output);
    }
  }

  // --- Step 3: Collector Server ---
  startCollector() {
    this.log(3, 'Starting Type Collector Server on port 3000');
    this.runtimeStats = {};

    this.server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const batch = JSON.parse(body);
            batch.forEach(({ key, symbol, location, shape }) => {
              if (!this.runtimeStats[key]) {
                this.runtimeStats[key] = { symbol, location, variants: {} };
              }
              this.runtimeStats[key].variants[shape] =
                (this.runtimeStats[key].variants[shape] || 0) + 1;
            });
          } catch (e) {
            /* Ignore malformed JSON */
          }
          res.end();
        });
      }
    });
    this.server.listen(3000);
  }

  async stopCollector() {
    this.log(
      3,
      'Simulation finished. Waiting 1.5s for final network packets...',
    );
    await new Promise((r) => setTimeout(r, 1500));

    const count = Object.keys(this.runtimeStats).length;
    this.stats.capturedVariants = count;

    fs.writeFileSync(
      'type-runtime-stats.json',
      JSON.stringify(this.runtimeStats, null, 2),
    );
    return new Promise((r) => this.server.close(r));
  }

  // --- Step 4: Patching (Fixed Logic) ---
  traceAndPatch() {
    this.log(4, 'Reverting & Surgical Patching');
    const self = this;
    this.execute('git checkout lib/', 'Restoring Original Line Numbers');

    if (!fs.existsSync('type-runtime-stats.json')) return;
    const runtimeData = JSON.parse(
      fs.readFileSync('type-runtime-stats.json', 'utf8'),
    );

    const fileGroups = {};
    for (const [_, data] of Object.entries(runtimeData)) {
      const [file] = data.location.split(':');
      fileGroups[file] = fileGroups[file] || [];
      fileGroups[file].push(data);
    }

    for (const [file, dataset] of Object.entries(fileGroups)) {
      const fullPath = path.resolve(file);
      const code = fs.readFileSync(fullPath, 'utf8');
      const ast = parse(code, { parser: tsParser });
      let fileChanged = false;

      dataset.forEach((data) => {
        const variants = Object.keys(data.variants);
        const totalHits = Object.values(data.variants).reduce(
          (a, b) => a + b,
          0,
        );

        // --- IMPROVED BREADCRUMBS ---
        if (VERBOSE) {
          console.log(`\n[Audit] Symbol: '${data.symbol}' at ${data.location}`);
          console.log(`  Hits: ${totalHits}`);
          variants.forEach((v) => {
            console.log(
              `  -> Detected Type: ${v.substring(0, 80)}${v.length > 80 ? '...' : ''} (${data.variants[v]} occurrences)`,
            );
          });
        }

        // Confidence Logic: Let's lower the threshold to 1 for "Solid" findings
        // but keep the variant check strict.
        if (variants.length !== 1) {
          if (VERBOSE)
            console.log(`  ! Rejected: Multi-type conflict (Ambiguous).`);
          return;
        }

        const inferredType = variants[0];
        if (inferredType.includes('{')) {
          if (VERBOSE)
            console.log(`  ! Rejected: Complex object (Skipping for now).`);
          return;
        }

        visit(ast, {
          visitIdentifier(path) {
            const node = path.value;
            if (node.name === data.symbol) {
              // --- AGNOSTIC USAGE ANALYSIS ---
              let isUsedAsObject = false;
              if (
                n.MemberExpression.check(path.parentPath.value) &&
                path.parentPath.value.object === node
              ) {
                isUsedAsObject = true;
              }

              const primitives = ['string', 'number', 'boolean'];
              if (isUsedAsObject && primitives.includes(inferredType)) {
                if (VERBOSE)
                  console.log(
                    `  ! Rejected: Symbol is used as object, but runtime saw primitive '${inferredType}'.`,
                  );
                return false;
              }

              if (n.AssignmentExpression.check(path.parentPath.value))
                return false;

              const isParam =
                n.FunctionDeclaration.check(path.parentPath.parentPath.value) ||
                n.FunctionExpression.check(path.parentPath.parentPath.value) ||
                n.ArrowFunctionExpression.check(
                  path.parentPath.parentPath.value,
                );
              const isVar = n.VariableDeclarator.check(path.parentPath.value);

              if (isParam || isVar) {
                if (
                  !node.typeAnnotation ||
                  node.typeAnnotation.typeAnnotation.type === 'TSUnknownKeyword'
                ) {
                  node.typeAnnotation = b.tsTypeAnnotation(
                    b.tsTypeReference(b.identifier(inferredType)),
                  );
                  self.stats.patchesApplied++;
                  fileChanged = true;
                  if (VERBOSE)
                    console.log(`  + SUCCESS: Patched as ${inferredType}`);
                  return false;
                }
              }
            }
            this.traverse(path);
          },
        });
      });

      if (fileChanged) fs.writeFileSync(fullPath, print(ast).code);
    }
  }

  report() {
    this.log(5, 'Final Stats');
    const summary = new Table({ head: ['Metric', 'Value'] });
    summary.push(
      ['Initial TS18046 Errors', this.stats.initialErrors],
      ['Instrumented Locations', this.stats.instrumentedLines],
      ['Runtime Symbols Captured', this.stats.capturedVariants],
      ['Safe Patches Applied', this.stats.patchesApplied],
    );
    console.log(summary.toString());
  }
}

const engine = new RefactorEngine();

(async () => {
  const errors = engine.runDiagnostics();
  engine.instrument(errors);
  engine.startCollector();
  engine.execute('npm test', 'Vitest Simulation');
  await engine.stopCollector();
  engine.traceAndPatch();
  engine.report();
})();
