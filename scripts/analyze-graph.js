import { Project, SyntaxKind } from 'ts-morph';
import express from 'express';
import path from 'path';

const CONFIG = {
  includePath: 'src/**/*.ts',
  excludePath: 'src/test/**/*.ts',
  useGroups: true,
  port: 3000,
};

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths([CONFIG.includePath, '!' + CONFIG.excludePath]);

const elements = [];
const processedEdges = new Set();
const directoryNodes = new Set();
const existingNodeIds = new Set();

// Track file order for spatial "hinting"
const sortedFiles = project
  .getSourceFiles()
  .map((f) => f.getFilePath())
  .sort();

// Helper for generating distinct colors from strings
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 'hsl(' + (Math.abs(hash) % 360) + ', 65%, 45%)';
}

// --- PHASE 1: DISCOVERY & HINTING ---
project.getSourceFiles().forEach(function (sourceFile) {
  const fileName = sourceFile.getBaseName();
  const filePath = sourceFile.getFilePath();
  const fileIndex = sortedFiles.indexOf(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // Group logic
  const parts = path.dirname(relativePath).split(path.sep);
  let currentPath = '';
  parts.forEach((part) => {
    const parentPath = currentPath;
    currentPath = currentPath ? path.join(currentPath, part) : part;
    if (!directoryNodes.has(currentPath)) {
      elements.push({
        data: {
          id: currentPath,
          label: part,
          parent: parentPath || undefined,
          isGroup: true,
          color: stringToColor(currentPath),
        },
      });
      directoryNodes.add(currentPath);
    }
  });

  const registerNode = function (name, nodeObj) {
    const id = fileName + ':' + name;
    if (!existingNodeIds.has(id)) {
      const lineNum = nodeObj.getStartLineNumber();
      elements.push({
        data: {
          id: id,
          label: name,
          parent: currentPath,
          color: stringToColor(currentPath),
          // HINT: Use fileIndex for X and lineNum for Y to organize clusters
          initialX: fileIndex * 300,
          initialY: lineNum * 5,
          metadata: { file: fileName, line: lineNum, fileIdx: fileIndex },
        },
      });
      existingNodeIds.add(id);
    }
  };

  sourceFile.getFunctions().forEach((fn) => registerNode(fn.getName(), fn));
  sourceFile.getVariableDeclarations().forEach((v) => {
    const init = v.getInitializer();
    if (
      init &&
      (init.getKind() === SyntaxKind.ArrowFunction ||
        init.getKind() === SyntaxKind.FunctionExpression)
    ) {
      registerNode(v.getName(), v);
    }
  });
});

// --- PHASE 2: EDGES ---
project.getSourceFiles().forEach(function (sourceFile) {
  const fileName = sourceFile.getBaseName();
  const processCalls = function (container, containerName) {
    const sourceId = fileName + ':' + containerName;
    container.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
      const symbol = call.getExpression().getSymbol();
      if (!symbol) return;
      symbol.getDeclarations().forEach((decl) => {
        const targetId = decl.getSourceFile().getBaseName() + ':' + symbol.getName();
        if (existingNodeIds.has(targetId)) {
          const edgeId = sourceId + '->' + targetId;
          if (!processedEdges.has(edgeId)) {
            elements.push({ data: { id: edgeId, source: sourceId, target: targetId } });
            processedEdges.add(edgeId);
          }
        }
      });
    });
  };
  sourceFile.getFunctions().forEach((fn) => processCalls(fn, fn.getName()));
  sourceFile.getVariableDeclarations().forEach((v) => {
    const init = v.getInitializer();
    if (
      init &&
      (init.getKind() === SyntaxKind.ArrowFunction ||
        init.getKind() === SyntaxKind.FunctionExpression)
    ) {
      processCalls(init, v.getName());
    }
  });
});

// --- PHASE 3: VISUALIZATION ---
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Architectural Call Graph</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.26.0/cytoscape.min.js"></script>
    <style>
        body { margin: 0; background: #121212; color: #eee; font-family: -apple-system, sans-serif; overflow: hidden; }
        #cy { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1; }
        .ui { position: absolute; top: 20px; left: 20px; z-index: 10; background: rgba(30,30,30,0.9); padding: 15px; border-radius: 8px; border: 1px solid #444; pointer-events: auto; }
        button { background: #0074D9; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold; }
        button:hover { background: #0056a3; }
        .hint { font-size: 11px; color: #888; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="ui">
        <strong>Graph Control</strong><br><br>
        <button onclick="cy.fit()">Center & Zoom</button>
        <button onclick="reLayout()">Run Layout</button>
        <div class="hint">Click node to highlight path.<br>Use mouse to drag & zoom.</div>
    </div>
    <div id="cy"></div>
    <script>
        const cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: ${JSON.stringify(elements)},
            userPanningEnabled: true,
            userZoomingEnabled: true,
            boxSelectionEnabled: false,
            style: [
                { selector: 'node', style: {
                    'label': 'data(label)', 'background-color': 'data(color)', 'color': '#fff',
                    'text-valign': 'center', 'font-size': '10px', 'width': '30px', 'height': '30px',
                    'text-outline-width': 1, 'text-outline-color': '#000'
                }},
                { selector: ':parent', style: {
                    'background-opacity': 0.08, 'background-color': 'data(color)', 'label': 'data(label)',
                    'text-valign': 'top', 'color': '#aaa', 'font-size': '14px', 'padding': '40px'
                }},
                { selector: 'edge', style: {
                    'width': 1.5, 'line-color': '#444', 'target-arrow-color': '#444',
                    'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'opacity': 0.4
                }},
                { selector: '.highlighted', style: { 'opacity': 1, 'line-color': '#fff', 'target-arrow-color': '#fff', 'width': 3, 'z-index': 999 }},
                { selector: '.faded', style: { 'opacity': 0.1 }}
            ],
            // Use metadata initial positions to prevent "the soup"
            layout: {
              name: 'cose',
              animate: false,
              initialTemp: 1000,
              nodeRepulsion: 15000,
              idealEdgeLength: 100,
              // Apply the metadata hints
              position: (node) => ({ x: node.data('initialX'), y: node.data('initialY') })
            }
        });

        function reLayout() {
            cy.layout({ name: 'cose', animate: true, nodeRepulsion: 20000, padding: 50 }).run();
        }

        cy.on('tap', 'node', function(evt){
            const node = evt.target;
            if (node.data('isGroup')) return;

            // Highlight Logic: Fade all, then show the path
            cy.elements().addClass('faded').removeClass('highlighted');
            node.removeClass('faded').addClass('highlighted');
            node.successors().removeClass('faded').addClass('highlighted');
            node.predecessors().removeClass('faded').addClass('highlighted');
        });

        cy.on('tap', function(evt){
            if(evt.target === cy){
                cy.elements().removeClass('faded highlighted');
            }
        });
    </script>
</body>
</html>
`;

const app = express();
app.get('/', (req, res) => res.send(htmlTemplate));
app.listen(CONFIG.port, () => console.log('Untangled Graph: http://localhost:' + CONFIG.port));
