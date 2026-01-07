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
  if (
    Node.isExportSpecifier(node) ||
    Node.isImportSpecifier(node) ||
    Node.isBindingElement(node)
  ) {
    return node.getName();
  }
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

/**
 * Resolves a node to its underlying implementation if it's an alias (import/export).
 */
function resolveToDefinition(node) {
  if (Node.isExportSpecifier(node) || Node.isImportSpecifier(node)) {
    const symbol = node.getSymbol();
    if (symbol && symbol.isAlias()) {
      const aliased = typeChecker.getAliasedSymbol(symbol);
      const decls = aliased?.getDeclarations();
      if (decls && decls.length > 0) return decls[0];
    }
  }
  return node;
}

const finalMap = {};

// 1. Process engine.ts and src/lib/ (excluding tests)
const sourceFiles = project.getSourceFiles().filter((sf) => {
  const filePath = sf.getFilePath();
  const isTarget =
    filePath.endsWith('engine.ts') || filePath.includes('/src/lib/');
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

      // Follow the alias to the actual definition file
      const effectiveSymbol = symbol.isAlias()
        ? typeChecker.getAliasedSymbol(symbol)
        : symbol;
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
    // Only keep if the module has logic flow and it isn't an isolated leaf function
    return true;
  }),
);

// Final Polish: Clean up calls so they only point to nodes that exist in our result set
Object.values(result).forEach((data) => {
  data.calls = data.calls.filter((calleeId) => result[calleeId]);
});

// 3. Output
const outputDir = path.join(projectRoot, 'scripts');
fs.writeFileSync(
  path.join(outputDir, 'fn-graph.json'),
  JSON.stringify(result, null, 2),
);

let mmd = 'graph TD\n';
const activeFiles = [...new Set(Object.values(result).map((d) => d.file))];
activeFiles.forEach((file) => {
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
    const targetNode = calleeId.replace(/[^a-zA-Z0-9]/g, '_');
    mmd += `  ${sourceNode} --> ${targetNode}\n`;
  });
});

fs.writeFileSync(path.join(outputDir, 'fn-graph.mmd'), mmd);
console.log(
  `Success! Fixed alias resolution for ${Object.keys(result).length} nodes.`,
);
