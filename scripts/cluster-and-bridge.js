import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

/**
 * Analyzes a single file for internal function clusters and bridges.
 * @param {string} filePath - Path to the file to analyze.
 */
function analyzeFile(filePath) {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileFunctions = new Map();
  const functionNames = new Set();

  // 1. Collect all internal functions
  sourceFile.getFunctions().forEach((f) => {
    const name = f.getName();
    if (name) {
      fileFunctions.set(name, f);
      functionNames.add(name);
    }
  });

  const adjacencyList = {};
  functionNames.forEach((name) => (adjacencyList[name] = new Set()));

  // 2. Build local call graph (ignore 3rd party / external)
  fileFunctions.forEach((node, name) => {
    node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const callName = call.getExpression().getText().split('.').pop();
      if (functionNames.has(callName) && callName !== name) {
        adjacencyList[name].add(callName);
        adjacencyList[callName].add(name); // Treat as undirected for clustering
      }
    });
  });

  // 3. Find Clusters (Connected Components)
  const visited = new Set();
  const clusters = [];

  function bfs(startNode) {
    const cluster = [];
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const curr = queue.shift();
      cluster.push(curr);
      adjacencyList[curr].forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    return cluster;
  }

  functionNames.forEach((name) => {
    if (!visited.has(name)) {
      clusters.push(bfs(name));
    }
  });

  // 4. Identify Bridges
  // Definitions: A bridge here is a function in Cluster A that calls a function in Cluster B.
  // Since our BFS makes components perfectly isolated, "Internal Bridges" only exist if
  // we look at directed dependencies that don't imply mutual reachability.
  const bridges = [];
  fileFunctions.forEach((node, name) => {
    const myClusterIdx = clusters.findIndex((c) => c.includes(name));
    node.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const symbol = call.getExpression().getSymbol();
      if (symbol) {
        const callName = symbol.getName(); // Resolves the actual function name regardless of 'this.'
        if (functionNames.has(callName)) {
          // ... existing bridge logic ...
        }
      }
    });
  });

  // 5. Format and Print
  console.log(`\n=== ANALYSIS FOR: ${filePath} ===`);
  console.log(`Total Functions: ${functionNames.size}`);

  clusters.forEach((cluster, idx) => {
    console.log(`\nCluster ${idx}: [${cluster.length} fns]`);
    console.log(`  Members: ${cluster.join(', ')}`);
  });

  console.log(`\nBridges Detected: ${bridges.length}`);
  bridges.forEach((b) => console.log(`  Bridge: ${b}`));
  console.log('-'.repeat(50));
}

// Run for requested files
const targetFiles = ['src/lib/ballMovement.ts', 'src/lib/intentLogic.ts'];

targetFiles.forEach(analyzeFile);
