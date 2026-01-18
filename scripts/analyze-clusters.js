import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';

/**
 * CONFIGURATION
 */
const CONFIG = {
  outputJson: './cluster-analysis.json',
  sourcePath: 'src/**/*.ts',
  // Files to ignore for "Main Function" identification (but scanned for calls)
  ignoreFiles: ['test', 'vitestSetup'],
};

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths(CONFIG.sourcePath);

const functionRegistry = new Map(); // Key: "filepath:funcName"

/**
 * 1. REGISTRATION PHASE
 * Identify every function in the codebase and record its metadata.
 */
console.log('--- Phase 1: Registering functions ---');
project.getSourceFiles().forEach((sourceFile) => {
  const relPath = path.relative(process.cwd(), sourceFile.getFilePath());
  if (CONFIG.ignoreFiles.some((f) => relPath.includes(f))) return;

  const functions = [
    ...sourceFile.getFunctions(),
    ...sourceFile
      .getVariableDeclarations()
      .filter(
        (v) =>
          v.getInitializerIfKind(SyntaxKind.ArrowFunction) ||
          v.getInitializerIfKind(SyntaxKind.FunctionExpression),
      ),
  ];

  functions.forEach((fn) => {
    const name = Node.isVariableDeclaration(fn) ? fn.getName() : fn.getName();
    if (!name) return;

    const start = fn.getStartLineNumber();
    const end = fn.getEndLineNumber();
    const id = `${relPath}:${name}`;

    functionRegistry.set(id, {
      id,
      name,
      file: relPath,
      line: start,
      lineCount: end - start + 1,
      callers: new Set(),
      helpers: [],
      node: fn,
    });
  });
});

/**
 * 2. LINKING PHASE
 * Analyze call expressions to see who calls whom.
 */
console.log('--- Phase 2: Analyzing call graph ---');
functionRegistry.forEach((data, id) => {
  const node = data.node;
  // Look for all call expressions inside this function body
  node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
    const symbol = call.getExpression().getSymbol();
    if (!symbol) return;

    const declarations = symbol.getDeclarations();
    declarations.forEach((decl) => {
      const declSourceFile = decl.getSourceFile();
      const declPath = path.relative(process.cwd(), declSourceFile.getFilePath());
      const declName = symbol.getName();
      const targetId = `${declPath}:${declName}`;

      // If the target is one of our registered internal functions
      if (functionRegistry.has(targetId) && targetId !== id) {
        functionRegistry.get(targetId).callers.add(id);
      }
    });
  });
});

/**
 * 3. CLUSTERING PHASE
 * Identify helpers with exactly one caller and group them under that caller.
 */
console.log('--- Phase 3: Identifying exclusive clusters ---');
const clusters = [];

functionRegistry.forEach((data) => {
  // If this function is a "Helper" (exactly 1 caller)
  if (data.callers.size === 1) {
    const parentId = Array.from(data.callers)[0];
    const parent = functionRegistry.get(parentId);
    if (parent) {
      parent.helpers.push({
        name: data.name,
        lines: data.lineCount,
        location: `${data.file}:${data.line}`,
      });
    }
  }
});

/**
 * 4. REPORTING PHASE
 */
functionRegistry.forEach((data) => {
  if (data.helpers.length > 0) {
    const totalLines = data.lineCount + data.helpers.reduce((sum, h) => sum + h.lines, 0);
    clusters.push({
      mainFunction: data.name,
      helpers: data.helpers.map((h) => h.name),
      totalLines,
      details: {
        file: data.file,
        line: data.line,
        helperDetails: data.helpers,
      },
    });
  }
});

// Sort by line count descending
clusters.sort((a, b) => b.totalLines - a.totalLines);

// Output JSON
fs.writeFileSync(CONFIG.outputJson, JSON.stringify(clusters, null, 2));
console.log(`\nResults saved to ${CONFIG.outputJson}`);

// Print Table
console.log('\n' + ''.padEnd(100, '-'));
console.log(
  `${'Main Function'.padEnd(25)} | ${'Exclusive Helpers'.padEnd(40)} | ${'Lines'.padEnd(6)} | ${'Location'}`,
);
console.log(''.padEnd(100, '-'));

clusters.forEach((c) => {
  const helpersStr =
    c.helpers.join(', ').substring(0, 38) + (c.helpers.join(', ').length > 38 ? '...' : '');
  console.log(
    `${c.mainFunction.padEnd(25)} | ${helpersStr.padEnd(40)} | ${String(c.totalLines).padEnd(6)} | ${c.details.file}:${c.details.line}`,
  );
});
