import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parse, print, visit } from 'recast';
import * as tsParser from 'recast/parsers/typescript.js';
import { builders as b } from 'ast-types';

class FnHunter {
  constructor() {
    this.manifest = {};
    // Set target directory for data files
    this.scriptsDir = path.join(process.cwd(), 'scripts');
    this.logFile = path.join(this.scriptsDir, 'telemetry.log');
    this.reportFile = path.join(this.scriptsDir, 'fn-usage-report.json');
    this.bridgePath = path.join(process.cwd(), 'src/lib/telemetry-bridge.js');
  }

  // The bridge code is kept as a string to be deployed on-the-fly
  getBridgeCode() {
    return `
import fs from 'node:fs';
const registry = new Set();
globalThis.__fnTracker = {
  call(file, name, line) {
    const key = \`\${file}:\${name}:\${line}\`;
    if (registry.has(key)) return;
    registry.add(key);
    try {
      // Synchronous write to ensure data lands before test process exits
      fs.appendFileSync('${this.logFile.replace(/\\/g, '\\\\')}', key + '\\n', 'utf8');
    } catch (e) {}
  }
};
export default {};`;
  }

  setup() {
    console.log('Stage 1: Preparing scripts/ directory and deploying bridge...');
    // Create bridge file in src/lib so it can be resolved by imports
    fs.writeFileSync(this.bridgePath, this.getBridgeCode());
    // Clear any stale logs
    if (fs.existsSync(this.logFile)) fs.unlinkSync(this.logFile);
  }

  instrument() {
    console.log('Stage 2: Instrumenting src/lib...');
    const files = fs
      .readdirSync('./src/lib')
      .filter((f) => f.endsWith('.ts') && !f.includes('telemetry-bridge'));

    files.forEach((file) => {
      const filePath = `./src/lib/${file}`;
      const code = fs.readFileSync(filePath, 'utf8');
      const ast = parse(code, { parser: tsParser });
      const self = this;

      visit(ast, {
        visitFunctionDeclaration(path) {
          self.inject(path, file);
          this.traverse(path);
        },
        visitArrowFunctionExpression(path) {
          self.inject(path, file);
          this.traverse(path);
        },
        visitFunctionExpression(path) {
          self.inject(path, file);
          this.traverse(path);
        },
      });

      // Inject the bridge import at the top of the file
      const bridgeImport = b.importDeclaration([], b.literal('./telemetry-bridge.js'));
      ast.program.body.unshift(bridgeImport);
      fs.writeFileSync(filePath, print(ast).code);
    });
  }

  inject(path, file) {
    const node = path.node;
    if (!node.loc || !node.loc.start) return;

    const name = node.id ? node.id.name : 'anonymous';
    const line = node.loc.start.line;
    const key = `${file}:${name}:${line}`;

    // Initialize manifest with 0 calls
    this.manifest[key] = { file, name, line, calls: 0 };

    const instrumentation = b.expressionStatement(
      b.callExpression(
        b.memberExpression(b.identifier('globalThis.__fnTracker'), b.identifier('call')),
        [b.literal(file), b.literal(name), b.literal(line)],
      ),
    );

    // Inject at the beginning of the function body
    if (node.body && node.body.type === 'BlockStatement') {
      node.body.body.unshift(instrumentation);
    } else if (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement') {
      // Wrap implicit return arrows: () => x becomes () => { tracker(); return x; }
      node.body = b.blockStatement([instrumentation, b.returnStatement(node.body)]);
    }
  }

  cleanup() {
    console.log('Stage 4: Cleaning up src/lib...');
    try {
      if (fs.existsSync(this.bridgePath)) fs.unlinkSync(this.bridgePath);
      // Revert all instrumentation changes and injected imports
      execSync('git restore src/lib');
      console.log('Source code restored. Data preserved in scripts/ directory.');
    } catch (e) {
      console.error("Cleanup failed. Manual 'git restore src/lib' may be required.");
    }
  }

  async run() {
    try {
      this.setup();
      this.instrument();

      console.log('Stage 3: Running Tests...');
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (testError) {
        console.log('Tests finished (some may have failed). Proceeding to report generation...');
      }

      // Process the telemetry log into the final JSON map
      if (fs.existsSync(this.logFile)) {
        const hits = fs.readFileSync(this.logFile, 'utf8').split('\n').filter(Boolean);
        hits.forEach((key) => {
          if (this.manifest[key]) {
            this.manifest[key].calls = (this.manifest[key].calls || 0) + 1;
          }
        });
      }

      // Save the structured report to the scripts/ directory
      fs.writeFileSync(this.reportFile, JSON.stringify(this.manifest, null, 2));
      console.log(`Hunt Complete. Results saved to: ${this.reportFile}`);
    } finally {
      this.cleanup();
    }
  }
}

new FnHunter().run();
