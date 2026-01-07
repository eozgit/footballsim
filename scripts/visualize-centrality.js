import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'fn-graph.json');

const PORT = 3001;
const TOP_HUB_COUNT = 15; // Your "N" constant
const VISUAL_DEPTH_LIMIT = 2; // Your "D" constant

const graphData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

// --- BIDIRECTIONAL ENGINE ---

// Build a map that knows both directions: ID -> { callers: [], callees: [] }
const network = {};
Object.entries(graphData).forEach(([callerId, data]) => {
  if (!network[callerId]) network[callerId] = { in: new Set(), out: new Set() };

  data.calls.forEach((calleeId) => {
    network[callerId].out.add(calleeId);
    if (!network[calleeId])
      network[calleeId] = { in: new Set(), out: new Set() };
    network[calleeId].in.add(callerId);
  });
});

// Identify "Hubs" (Nodes with most total connections)
function getTopHubs() {
  return Object.entries(network)
    .map(([id, links]) => ({
      id,
      score: links.in.size + links.out.size,
      name: graphData[id]?.name || id,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_HUB_COUNT);
}

const sanitize = (id) => id.replace(/[^a-zA-Z0-9]/g, '_');
const fmtLabel = (id) => {
  const d = graphData[id];
  return d
    ? `<b>${d.name}</b><br/><i style='font-size:10px'>${d.file}</i>`
    : id;
};

// Generate a neighborhood graph (Up and Down D levels)
function generateNeighborhood(rootId) {
  const edges = new Set();
  const nodes = new Set([rootId]);

  const walk = (currentId, currentDepth) => {
    if (currentDepth >= VISUAL_DEPTH_LIMIT) return;

    // Explore Downstream (Callees)
    network[currentId]?.out.forEach((nextId) => {
      edges.add(`${sanitize(currentId)} --> ${sanitize(nextId)}`);
      nodes.add(nextId);
      walk(nextId, currentDepth + 1);
    });

    // Explore Upstream (Callers)
    network[currentId]?.in.forEach((prevId) => {
      edges.add(`${sanitize(prevId)} --> ${sanitize(currentId)}`);
      nodes.add(prevId);
      walk(prevId, currentDepth + 1);
    });
  };

  walk(rootId, 0);

  let mmd = 'graph LR\n'; // Left-to-Right often looks better for neighborhoods
  nodes.forEach((id) => {
    const style = id === rootId ? ':::rootNode' : '';
    mmd += `  ${sanitize(id)}["${fmtLabel(id)}"]${style}\n`;
  });
  mmd += Array.from(edges).join('\n');
  mmd += '\n  classDef rootNode fill:#f96,stroke:#333,stroke-width:4px;';
  return mmd;
}

function generateFullMap() {
  let mmd = 'graph TD\n';
  Object.entries(graphData).forEach(([id, data]) => {
    data.calls.forEach((calleeId) => {
      mmd += `  ${sanitize(id)}["${data.name}"] --> ${sanitize(calleeId)}["${graphData[calleeId]?.name || calleeId}"]\n`;
    });
  });
  return mmd;
}

// --- SERVER (Inherited UI logic) ---

const app = express();

app.get('/', (req, res) => {
  const hubs = getTopHubs();
  const activeId = req.query.id;
  let currentMmd =
    activeId === 'full'
      ? generateFullMap()
      : activeId
        ? generateNeighborhood(activeId)
        : '';

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Centrality Explorer</title>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          import svgPanZoom from 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/+esm';
          mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
          
          // Re-using your zoom and observer logic from visualize-logic.js
          const initPZ = () => {
            const svg = document.querySelector('.mermaid svg');
            if (svg) {
              window.pz = svgPanZoom(svg, { zoomEnabled: true, controlIconsEnabled: true, fit: true, center: true });
            }
          };
          const observer = new MutationObserver(() => {
            const svg = document.querySelector('.mermaid svg');
            if (svg && !svg.hasAttribute('data-zoom-init')) {
              svg.setAttribute('data-zoom-init', 'true');
              setTimeout(initPZ, 300);
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        </script>
        <style>
          body { font-family: sans-serif; display: flex; margin: 0; height: 100vh; background: #f0f2f5; }
          nav { width: 350px; background: white; border-right: 1px solid #ccc; padding: 20px; overflow-y: auto; }
          main { flex: 1; position: relative; background: white; }
          .mermaid { width: 100%; height: 100%; }
          .item { display: block; padding: 10px; text-decoration: none; color: #333; border-bottom: 1px solid #eee; }
          .item:hover { background: #eef; }
          .active { background: #3182ce; color: white; }
          .score { float: right; font-size: 10px; background: #edf2f7; color: #4a5568; padding: 2px 5px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/?id=full" class="item ${activeId === 'full' ? 'active' : ''}">🌐 Complete System Picture</a>
          <h3>🎯 Top ${TOP_HUB_COUNT} Logic Hubs</h3>
          ${hubs
            .map(
              (h) => `
            <a href="/?id=${h.id}" class="item ${activeId === h.id ? 'active' : ''}">
              ${h.name} <span class="score">links: ${h.score}</span>
            </a>
          `,
            )
            .join('')}
        </nav>
        <main>
          <div class="mermaid">${currentMmd || '<div style="padding:40px">Select a hub to map its influence.</div>'}</div>
        </main>
      </body>
    </html>
  `);
});

app.listen(PORT, () =>
  console.log(`Centrality Dashboard at http://localhost:${PORT}`),
);
