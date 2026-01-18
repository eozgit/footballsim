import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';

/**
 * CONFIGURATION
 */
const CONFIG = {
  outputJson: './cluster-analysis.json',
  sourcePath: 'src/**/*.ts',
  // Files to ignore for BOTH identification and caller detection
  // (Strict logic: we do not pander to test dependencies)
  ignoreFiles: ['test', 'vitestSetup'],
};

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths(CONFIG.sourcePath);

const functionRegistry = new Map(); // Key: "filepath:funcName"
const clusters = [];

/**
 * 1. REGISTRATION PHASE
 */
console.log('--- Phase 1: Registering functions ---');
project.getSourceFiles().forEach((sourceFile) => {
  const relPath = path.relative(process.cwd(), sourceFile.getFilePath());
  if (CONFIG.ignoreFiles.some((f) => relPath.includes(f))) return;

  const fileTotalLines = sourceFile.getEndLineNumber();

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
      fileTotalLines,
      line: start,
      lineCount: end - start + 1,
      callers: new Set(),
      helpers: [],
      node: Node.isVariableDeclaration(fn) ? fn.getNameNode() : fn.getNameNode(),
    });
  });
});

/**
 * 2. CALL TRACKING PHASE
 */
console.log('--- Phase 2: Tracking internal callers ---');
functionRegistry.forEach((data) => {
  const references = data.node.findReferencesAsNodes();

  references.forEach((ref) => {
    const refFile = path.relative(process.cwd(), ref.getSourceFile().getFilePath());

    // Strict identification: ignore calls from tests/ignored files
    if (CONFIG.ignoreFiles.some((f) => refFile.includes(f))) return;

    let parent = ref.getParent();
    while (parent) {
      if (
        Node.isFunctionDeclaration(parent) ||
        Node.isArrowFunction(parent) ||
        Node.isFunctionExpression(parent)
      ) {
        let parentName;
        if (Node.isFunctionDeclaration(parent)) {
          parentName = parent.getName();
        } else {
          const varDec = parent.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
          parentName = varDec?.getName();
        }

        if (parentName) {
          const parentId = `${refFile}:${parentName}`;
          if (parentId !== data.id) {
            data.callers.add(parentId);
          }
        }
        break;
      }
      parent = parent.getParent();
    }
  });
});

/**
 * 3. CLUSTERING PHASE
 */
console.log('--- Phase 3: Linking exclusive helpers ---');
functionRegistry.forEach((data) => {
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
    const familyLines = data.lineCount + data.helpers.reduce((sum, h) => sum + h.lines, 0);
    const density = ((familyLines / data.fileTotalLines) * 100).toFixed(1);

    clusters.push({
      mainFunction: data.name,
      helpers: data.helpers.map((h) => h.name),
      totalLines: familyLines,
      fileTotalLines: data.fileTotalLines,
      density: `${density}%`,
      details: {
        file: data.file,
        line: data.line,
        helperDetails: data.helpers,
      },
    });
  }
});

// Sort by total line count descending
clusters.sort((a, b) => b.totalLines - a.totalLines);

// Output JSON
fs.writeFileSync(CONFIG.outputJson, JSON.stringify(clusters, null, 2));
console.log(`\nResults saved to ${CONFIG.outputJson}`);

/**
 * TABLE VIEW (Expanded for clear view of all helpers)
 */
console.log('\n' + ''.padEnd(120, '-'));
console.log(
  `${'Main Function'.padEnd(30)} | ${'Exclusive Helpers'.padEnd(40)} | ${'Lines'.padEnd(6)} | ${'Density'.padEnd(8)} | ${'Location'}`,
);
console.log(''.padEnd(120, '-'));

clusters.forEach((c) => {
  const firstHelper = c.details.helperDetails[0];

  // Print first line with Main Function info
  console.log(
    `${c.mainFunction.padEnd(30)} | ${firstHelper.name.padEnd(40)} | ${String(c.totalLines).padEnd(6)} | ${c.density.padEnd(8)} | ${c.details.file}:${c.details.line}`,
  );

  // Print remaining helpers on individual lines
  for (let i = 1; i < c.details.helperDetails.length; i++) {
    console.log(
      `${''.padEnd(30)} | ${c.details.helperDetails[i].name.padEnd(40)} | ${''.padEnd(6)} | ${''.padEnd(8)} |`,
    );
  }
  console.log(''.padEnd(120, '.')); // Subtle separator between clusters
});
