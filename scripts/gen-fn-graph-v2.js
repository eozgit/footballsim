import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const typeChecker = project.getTypeChecker();
const sourceFiles = project.getSourceFiles('src/**/*.ts');

/**
 * Safely gets a name for any function-like node
 */
function getFunctionName(node) {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getName() || '[Anonymous]';
  }
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    // Try to find the variable name it's assigned to
    const variableDeclaration = node.getFirstAncestorByKind(
      SyntaxKind.VariableDeclaration,
    );
    if (variableDeclaration) {
      return variableDeclaration.getName();
    }
  }
  return '[Anonymous]';
}

function getFunctionId(node) {
  const file = node.getSourceFile().getBaseName();
  const name = getFunctionName(node);
  return `${file}:${name}`;
}

const rawGraph = new Map(); // Map<string, { file: string, calls: Set<string>, signature: string }>

// 1. Process all source files
sourceFiles.forEach((sf) => {
  const filePath = sf.getFilePath();
  if (filePath.includes('/test/') || filePath.includes('.d.ts')) return;

  const functions = [
    ...sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sf.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
    ...sf.getDescendantsOfKind(SyntaxKind.FunctionExpression),
  ];

  functions.forEach((fn) => {
    const fnId = getFunctionId(fn);
    const internalCallees = new Set();

    // Get signature for AI context
    const signature = fn
      .getSignature()
      .getDeclaration()
      .getText()
      .split('{')[0]
      .trim();

    // Find all calls inside this function
    const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
    calls.forEach((call) => {
      const symbol = typeChecker.getSymbolAtLocation(call.getExpression());
      if (!symbol) return;

      const declarations = symbol.getDeclarations();
      if (!declarations) return;

      for (const decl of declarations) {
        const declPath = decl.getSourceFile().getFilePath();
        // Filter: Only internal (src/), ignore node_modules
        if (declPath.includes('/src/') && !declPath.includes('node_modules')) {
          const calleeId = getFunctionId(decl);
          if (calleeId !== fnId) {
            internalCallees.add(calleeId);
          }
        }
      }
    });

    rawGraph.set(fnId, {
      file: sf.getBaseName(),
      signature,
      calls: internalCallees,
    });
  });
});

// 2. Pruning Logic
// Requirement: Exclude leaf functions (functions that call nothing internal)
const nonLeafFns = new Map();
rawGraph.forEach((data, id) => {
  if (data.calls.size > 0) {
    nonLeafFns.set(id, data);
  }
});

// Requirement: Exclude leaf modules (modules that have no remaining dependencies)
const modulesWithDeps = new Set();
nonLeafFns.forEach((data) => modulesWithDeps.add(data.file));

const finalGraph = {};
nonLeafFns.forEach((data, id) => {
  if (modulesWithDeps.has(data.file)) {
    // Only keep calls to functions that still exist in our "non-leaf" list
    const filteredCalls = Array.from(data.calls).filter((calleeId) =>
      nonLeafFns.has(calleeId),
    );

    // Check again after filtering callees: if it now calls nothing, we could prune it,
    // but the user asked for functions that AREN'T leaves in the original code.
    finalGraph[id] = {
      ...data,
      calls: filteredCalls,
    };
  }
});

// 3. Generate Outputs

// AI Optimized JSON (Includes Signatures)
fs.writeFileSync('fn-graph.json', JSON.stringify(finalGraph, null, 2));

// Mermaid for Web Visualization (with Subgraphs)
let mermaid = 'graph TD\n';
const files = [...new Set(Object.values(finalGraph).map((d) => d.file))];

files.forEach((file) => {
  mermaid += `  subgraph ${file}\n`;
  Object.entries(finalGraph).forEach(([id, data]) => {
    if (data.file === file) {
      // Clean ID for Mermaid compatibility (remove dots/special chars)
      const cleanId = id.replace(/[:.]/g, '_');
      mermaid += `    ${cleanId}["${id.split(':')[1]}"]\n`;
    }
  });
  mermaid += `  end\n`;
});

Object.entries(finalGraph).forEach(([id, data]) => {
  const sourceId = id.replace(/[:.]/g, '_');
  data.calls.forEach((calleeId) => {
    const targetId = calleeId.replace(/[:.]/g, '_');
    mermaid += `  ${sourceId} --> ${targetId}\n`;
  });
});

fs.writeFileSync('fn-graph.mmd', mermaid);
console.log(
  `Graph generated: ${Object.keys(finalGraph).length} orchestrator functions mapped.`,
);
