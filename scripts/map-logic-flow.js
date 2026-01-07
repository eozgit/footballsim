import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const project = new Project({
  tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
});
const typeChecker = project.getTypeChecker();

// 1. Filter: Strictly engine.ts and src/lib, excluding tests
const sourceFiles = project.getSourceFiles().filter((sf) => {
  const filePath = sf.getFilePath();
  const isEngine = filePath.endsWith('engine.ts');
  const isLib = filePath.includes('/src/lib/');
  const isTest = filePath.includes('/test/');
  return (isEngine || isLib) && !isTest;
});

function getFunctionName(node) {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getName() || '[Anonymous]';
  }
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    const variableDeclaration = node.getFirstAncestorByKind(
      SyntaxKind.VariableDeclaration,
    );
    if (variableDeclaration) return variableDeclaration.getName();
  }
  return '[Anonymous]';
}

const finalMap = {};

// 2. Map Functions
sourceFiles.forEach((sf) => {
  const fileName = sf.getBaseName();
  const relPath = path.relative(projectRoot, sf.getFilePath());

  const functions = [
    ...sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sf.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
  ];

  functions.forEach((fn) => {
    const name = getFunctionName(fn);
    const startPos = fn.getStart();
    const lc = sf.getLineAndColumnAtPos(startPos);

    // Unique ID for pinpointing: file:name:line
    const fnId = `${fileName}:${name}:${lc.line}`;

    const internalCallees = new Set();
    const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);

    calls.forEach((call) => {
      const symbol = typeChecker.getSymbolAtLocation(call.getExpression());
      if (!symbol) return;
      const decls = symbol.getDeclarations();
      if (!decls) return;

      for (const decl of decls) {
        const dSf = decl.getSourceFile();
        const dPath = dSf.getFilePath();

        // Match scope filter
        if (
          (dPath.endsWith('engine.ts') || dPath.includes('/src/lib/')) &&
          !dPath.includes('/test/')
        ) {
          const dName = getFunctionName(decl);
          const dLc = dSf.getLineAndColumnAtPos(decl.getStart());
          internalCallees.add(`${dSf.getBaseName()}:${dName}:${dLc.line}`);
        }
      }
    });

    finalMap[fnId] = {
      name,
      file: fileName,
      fullPath: relPath,
      line: lc.line,
      column: lc.column,
      signature: fn
        .getSignature()
        .getDeclaration()
        .getText()
        .split('{')[0]
        .trim()
        .replace(/\n/g, ' '),
      calls: Array.from(internalCallees),
    };
  });
});

// 3. Pruning logic
const nonLeafFns = Object.fromEntries(
  Object.entries(finalMap).filter(([_, data]) => data.calls.length > 0),
);

const activeFiles = new Set(Object.values(nonLeafFns).map((d) => d.file));
const result = Object.fromEntries(
  Object.entries(nonLeafFns).filter(([_, data]) => activeFiles.has(data.file)),
);

// 4. Save to scripts/
const outputJson = path.join(__dirname, 'fn-graph.json');
const outputMmd = path.join(__dirname, 'fn-graph.mmd');

fs.writeFileSync(outputJson, JSON.stringify(result, null, 2));

// Mermaid generation with Subgraphs (Boxes)
let mmd = 'graph TD\n';
const files = [...new Set(Object.values(result).map((d) => d.file))];

files.forEach((file) => {
  // Mermaid subgraph IDs cannot have dots
  const subId = file.replace(/[^a-zA-Z0-9]/g, '_');
  mmd += `  subgraph ${subId} ["${file}"]\n`;
  Object.entries(result).forEach(([id, data]) => {
    if (data.file === file) {
      const nodeId = id.replace(/[^a-zA-Z0-9]/g, '_');
      mmd += `    ${nodeId}["${data.name} (L${data.line})"]\n`;
    }
  });
  mmd += `  end\n`;
});

Object.entries(result).forEach(([id, data]) => {
  const sourceNode = id.replace(/[^a-zA-Z0-9]/g, '_');
  data.calls.forEach((calleeId) => {
    if (result[calleeId]) {
      const targetNode = calleeId.replace(/[^a-zA-Z0-9]/g, '_');
      mmd += `  ${sourceNode} --> ${targetNode}\n`;
    }
  });
});

fs.writeFileSync(outputMmd, mmd);
console.log(`Success! Saved to:\n - ${outputJson}\n - ${outputMmd}`);

// jq '.[] | select(.name == "[Anonymous]" and .file == "common.ts") | {line, signature}' scripts/fn-graph.json
