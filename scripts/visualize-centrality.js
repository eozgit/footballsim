import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'fn-graph.json');

const PORT = 3001;
const TOP_HUB_COUNT = 15;
const VISUAL_DEPTH_LIMIT = 2;

const graphData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

// --- BIDIRECTIONAL ENGINE ---
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

function generateNeighborhood(rootId) {
  const edges = new Set();
  const nodes = new Set([rootId]);

  const walk = (currentId, currentDepth) => {
    if (currentDepth >= VISUAL_DEPTH_LIMIT) return;
    network[currentId]?.out.forEach((nextId) => {
      edges.add(`${sanitize(currentId)} --> ${sanitize(nextId)}`);
      nodes.add(nextId);
      walk(nextId, currentDepth + 1);
    });
    network[currentId]?.in.forEach((prevId) => {
      edges.add(`${sanitize(prevId)} --> ${sanitize(currentId)}`);
      nodes.add(prevId);
      walk(prevId, currentDepth + 1);
    });
  };

  walk(rootId, 0);

  let mmd = 'graph LR\n';
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

// --- SERVER ---
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
        <title>Logic Centrality Explorer</title>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          import svgPanZoom from 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/+esm';
          
          mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', theme: 'neutral' });

          window.doZoom = (action) => {
            if (!window.pz) return;
            if (action === 'in') window.pz.zoomIn();
            if (action === 'out') window.pz.zoomOut();
            if (action === 'reset') { window.pz.resetZoom(); window.pz.center(); window.pz.fit(); }
          };

          const initPZ = () => {
            const svg = document.querySelector('.mermaid svg');
            if (svg) {
              svg.style.width = '100%'; 
              svg.style.height = '100%';
              window.pz = svgPanZoom(svg, { 
                zoomEnabled: true, 
                controlIconsEnabled: false, 
                fit: true, 
                center: true,
                minZoom: 0.1,
                maxZoom: 10
              });
            }
          };

          const observer = new MutationObserver(() => {
            const svg = document.querySelector('.mermaid svg');
            if (svg && !svg.hasAttribute('data-zoom-init')) {
              svg.setAttribute('data-zoom-init', 'true');
              setTimeout(initPZ, 200);
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        </script>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; margin: 0; height: 100vh; overflow: hidden; background: #f4f7f6; }
          nav { width: 380px; background: white; border-right: 1px solid #d1d9e6; padding: 20px; overflow-y: auto; flex-shrink: 0; }
          main { flex: 1; position: relative; background: white; display: flex; flex-direction: column; }
          .mermaid { flex: 1; width: 100%; height: 100%; cursor: grab; }
          .controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 100; }
          .btn { background: #333; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
          h3 { font-size: 11px; color: #888; text-transform: uppercase; margin: 25px 0 10px; border-bottom: 1px solid #eee; }
          .item { text-decoration: none; color: #2c3e50; padding: 10px; border-radius: 4px; font-size: 13px; margin-bottom: 2px; display: block; border-bottom: 1px solid #f0f0f0; }
          .item:hover { background: #edf2f7; }
          .active { background: #3182ce !important; color: white !important; }
          .score { float: right; font-size: 9px; padding: 2px 6px; border-radius: 10px; background: #e2e8f0; color: #4a5568; }
          .active .score { background: rgba(255,255,255,0.2); color: white; }
        </style>
      </head>
      <body>
        <nav>
          <a href="/?id=full" class="item ${activeId === 'full' ? 'active' : ''}">🌐 Complete System Picture</a>
          <h3>🎯 Top ${TOP_HUB_COUNT} Centrality Hubs</h3>
          ${hubs
            .map(
              (h) => `
            <a href="/?id=${h.id}" class="item ${activeId === h.id ? 'active' : ''}">
              ${h.name} <span class="score">${h.score} connections</span>
            </a>
          `,
            )
            .join('')}
        </nav>
        <main>
          <div class="controls">
            <button class="btn" onclick="doZoom('in')">+</button>
            <button class="btn" onclick="doZoom('reset')">Reset</button>
            <button class="btn" onclick="doZoom('out')">−</button>
          </div>
          <div class="mermaid">${currentMmd || '<div style="padding:50px"><h1>Centrality Engine</h1><p>Select a logic hub to analyze its local neighborhood.</p></div>'}</div>
        </main>
      </body>
    </html>
  `);
});

app.listen(PORT, () =>
  console.log(`Centrality Dashboard: http://localhost:${PORT}`),
);
