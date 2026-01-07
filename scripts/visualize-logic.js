import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'fn-graph.json');

// --- CONSTANTS ---
const PORT = 3000;
const TOP_HOTSPOTS_COUNT = 5;
const MAX_DEPTH = 3;

// --- DATA PROCESSING ---
const graphData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

/**
 * Identifies Entry Points: Functions that are never called by others in this set.
 */
function getEntryPoints() {
  const allCallees = new Set(Object.values(graphData).flatMap((d) => d.calls));
  return Object.keys(graphData).filter((id) => !allCallees.has(id));
}

/**
 * Identifies Hotspots: Functions called the most across the entire graph.
 */
function getHotspots() {
  const callCounts = {};
  Object.values(graphData).forEach((d) => {
    d.calls.forEach((callee) => {
      callCounts[callee] = (callCounts[callee] || 0) + 1;
    });
  });
  return Object.entries(callCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_HOTSPOTS_COUNT)
    .map((entry) => entry[0]);
}

/**
 * Generates Mermaid code for a specific node up to a certain depth.
 */
function generateFlow(rootId, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH || !graphData[rootId]) return '';
  seen.add(rootId);

  let mmd = '';
  const data = graphData[rootId];
  const sourceNode = rootId.replace(/[^a-zA-Z0-9]/g, '_');

  data.calls.forEach((calleeId) => {
    const targetNode = calleeId.replace(/[^a-zA-Z0-9]/g, '_');
    const targetData = graphData[calleeId];
    if (targetData) {
      mmd += `  ${sourceNode}["${data.name}"] --> ${targetNode}["${targetData.name}"]\n`;
      if (!seen.has(calleeId)) {
        mmd += generateFlow(calleeId, depth + 1, seen);
      }
    }
  });
  return mmd;
}

/**
 * Generates the full architecture map (the "big picture").
 */
function generateFullMap() {
  let mmd = 'graph TD\n';
  const files = [...new Set(Object.values(graphData).map((d) => d.file))];

  files.forEach((file) => {
    const subId = file.replace(/[^a-zA-Z0-9]/g, '_');
    mmd += `  subgraph ${subId} ["${file}"]\n`;
    Object.entries(graphData).forEach(([id, data]) => {
      if (data.file === file) {
        const nodeId = id.replace(/[^a-zA-Z0-9]/g, '_');
        mmd += `    ${nodeId}["${data.name}"]\n`;
      }
    });
    mmd += `  end\n`;
  });

  Object.entries(graphData).forEach(([id, data]) => {
    const sourceNode = id.replace(/[^a-zA-Z0-9]/g, '_');
    data.calls.forEach((calleeId) => {
      const targetNode = calleeId.replace(/[^a-zA-Z0-9]/g, '_');
      mmd += `  ${sourceNode} --> ${targetNode}\n`;
    });
  });
  return mmd;
}

// --- SERVER LOGIC ---
const app = express();

app.get('/', (req, res) => {
  const entries = getEntryPoints();
  const hotspots = getHotspots();
  const activeId = req.query.id;

  let currentMmd = '';
  if (activeId === 'full') {
    currentMmd = generateFullMap();
  } else if (activeId) {
    currentMmd = `graph TD\n${generateFlow(activeId)}`;
  }

  const html = `
    <html>
      <head>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true });
        </script>
        <style>
          body { font-family: sans-serif; display: flex; }
          nav { width: 300px; border-right: 1px solid #ccc; padding: 20px; height: 100vh; overflow-y: auto; }
          main { flex: 1; padding: 20px; }
          .active { font-weight: bold; color: blue; }
        </style>
      </head>
      <body>
        <nav>
          <h3>Main Maps</h3>
          <a href="/?id=full" class="${activeId === 'full' ? 'active' : ''}">Full Architecture Map</a>
          
          <h3>Entry Points (Orchestrators)</h3>
          ${entries.map((id) => `<a href="/?id=${id}" class="${activeId === id ? 'active' : ''}">${graphData[id].name}</a>`).join('<br>')}
          
          <h3>Hotspots (Critical Shared Logic)</h3>
          ${hotspots.map((id) => `<a href="/?id=${id}" class="${activeId === id ? 'active' : ''}">${graphData[id].name}</a>`).join('<br>')}
        </nav>
        <main>
          ${currentMmd ? `<pre class="mermaid">${currentMmd}</pre>` : '<h1>Select a diagram from the menu</h1>'}
        </main>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Visualization server running at http://localhost:${PORT}`);
  console.log(`- Entry points identified: ${getEntryPoints().length}`);
  console.log(`- Depth limit set to: ${MAX_DEPTH}`);
});
