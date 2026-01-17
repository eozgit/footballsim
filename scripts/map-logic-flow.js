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

/**
 * Robustly identifies names for functions, including those reached via exports/imports.
 */
function getFunctionName(node) {
  if (Node.isExportSpecifier(node) || Node.isImportSpecifier(node) || Node.isBindingElement(node)) {
    return node.getName();
  }
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getName() || '[Anonymous]';
  }
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    const variableDeclaration = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
    if (variableDeclaration) return variableDeclaration.getName();
  }
  return '[Anonymous]';
}

/**
 * Resolves a node to its underlying implementation if it's an alias (import/export).
 */
function resolveToDefinition(node) {
  let symbol = node.getSymbol();
  if (symbol && symbol.isAlias()) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  const decls = symbol?.getDeclarations() || [];

  // Prioritize actual code blocks
  const implementation = decls.find(
    (d) =>
      Node.isFunctionDeclaration(d) || Node.isMethodDeclaration(d) || Node.isVariableDeclaration(d),
  );

  if (implementation) return implementation;

  return decls[0] || node;
}

const finalMap = {};

// 1. Process engine.ts and src/lib/ (excluding tests)
const sourceFiles = project.getSourceFiles().filter((sf) => {
  const filePath = sf.getFilePath();
  const isTarget = filePath.endsWith('engine.ts') || filePath.includes('/src/lib/');
  return isTarget && !filePath.includes('/test/');
});

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
    const fnId = `${fileName}:${name}:${lc.line}`;

    const internalCallees = new Set();
    const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);

    calls.forEach((call) => {
      const symbol = typeChecker.getSymbolAtLocation(call.getExpression());
      if (!symbol) return;

      const effectiveSymbol = symbol.isAlias() ? typeChecker.getAliasedSymbol(symbol) : symbol;
      const decls = effectiveSymbol?.getDeclarations();
      if (!decls) return;

      for (const rawDecl of decls) {
        const decl = resolveToDefinition(rawDecl);
        const dSf = decl.getSourceFile();
        const dPath = dSf.getFilePath();

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

// 2. Pruning: Remove leaf functions and ensure link integrity
const nonLeafFns = Object.fromEntries(
  Object.entries(finalMap).filter(([_, data]) => data.calls.length > 0),
);

const result = Object.fromEntries(
  Object.entries(nonLeafFns).filter(([id, data]) => {
    return true;
  }),
);

Object.values(result).forEach((data) => {
  data.calls = data.calls.filter((calleeId) => result[calleeId]);
});

// 3. Output - JSON Only
const outputDir = path.join(projectRoot, 'scripts');
fs.writeFileSync(path.join(outputDir, 'fn-graph.json'), JSON.stringify(result, null, 2));

console.log(`Success! Logic map generated with ${Object.keys(result).length} nodes.`);
