import { Project, SyntaxKind } from 'ts-morph';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import edgeBetweenness from 'graphology-metrics/centrality/edge-betweenness.js';
import path from 'path';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths(['src/**/*.ts', '!src/test/**/*.ts']);

const graph = new Graph({ directed: true });

// --- PHASE 1: GRAPH BUILDING ---
project.getSourceFiles().forEach(sourceFile => {
  const fileName = sourceFile.getBaseName();
  const register = (name) => {
    const id = fileName + ':' + name;
    if (!graph.hasNode(id)) graph.addNode(id, { file: fileName, name });
  };

  sourceFile.getFunctions().forEach(f => register(f.getName()));
  sourceFile.getVariableDeclarations().forEach(v => {
    const init = v.getInitializer();
    if (init && init.getKind() === SyntaxKind.ArrowFunction) register(v.getName());
  });
});

project.getSourceFiles().forEach(sourceFile => {
  const fileName = sourceFile.getBaseName();
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
    const symbol = call.getExpression().getSymbol();
    const caller = call.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
      call.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
    if (!symbol || !caller) return;

    const sourceId = fileName + ':' + caller.getName();
    symbol.getDeclarations().forEach(decl => {
      const targetId = decl.getSourceFile().getBaseName() + ':' + symbol.getName();
      if (graph.hasNode(sourceId) && graph.hasNode(targetId) && sourceId !== targetId) {
        if (!graph.hasEdge(sourceId, targetId)) graph.addEdge(sourceId, targetId);
      }
    });
  });
});

// --- PHASE 2: COMMUNITY DETECTION (CLUSTERING) ---
// Louvain assigns a 'community' ID to every node
const communities = louvain(graph);
const clusters = {};

graph.forEachNode((node, attr) => {
  const cid = communities[node];
  if (!clusters[cid]) clusters[cid] = [];
  clusters[cid].push(node);
});

// --- PHASE 3: BRIDGE IDENTIFICATION ---
const bridges = [];
graph.forEachEdge((edge, attr, source, target) => {
  const sourceCluster = communities[source];
  const targetCluster = communities[target];

  if (sourceCluster !== targetCluster) {
    bridges.push({
      from: source,
      to: target,
      path: `${source} (C${sourceCluster}) -> ${target} (C${targetCluster})`
    });
  }
});

// --- PHASE 4: REPORTING ---
console.log('=== ARCHITECTURAL CLUSTER REPORT ===\n');

Object.keys(clusters).forEach(cid => {
  console.log(`Cluster ${cid} (${clusters[cid].length} functions)`);

  // Group by file to see if the cluster matches your folders
  const filesInCluster = [...new Set(clusters[cid].map(n => graph.getNodeAttribute(n, 'file')))];
  console.log(`  Files: ${filesInCluster.join(', ')}`);

  // Optional: List a few fns
  const sample = clusters[cid].slice(0, 5).map(n => graph.getNodeAttribute(n, 'name'));
  console.log(`  Sample fns: ${sample.join(', ')}${clusters[cid].length > 5 ? '...' : ''}`);
  console.log('');
});

console.log('=== CROSS-CLUSTER BRIDGES (The b -> f Ties) ===');
if (bridges.length === 0) {
  console.log('No bridges found. Modules are completely isolated.');
} else {
  bridges.forEach(b => console.log(`  ${b.path}`));
}
