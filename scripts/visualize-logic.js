import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'fn-graph.json');

const PORT = 3000;
const TOP_COUNT = 10;
const MAX_DEPTH = 5;

const graphData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

// --- LOGIC ENGINES ---

function getEntryPoints() {
  const allCallees = new Set(Object.values(graphData).flatMap((d) => d.calls));
  return Object.keys(graphData).filter((id) => !allCallees.has(id));
}

function getHotspots() {
  const callCounts = {};
  Object.values(graphData).forEach((d) => {
    d.calls.forEach((callee) => {
      callCounts[callee] = (callCounts[callee] || 0) + 1;
    });
  });
  return Object.entries(callCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_COUNT)
    .map((entry) => entry[0]);
}

// Maps who calls who (Reverse Graph)
const reverseGraph = {};
Object.entries(graphData).forEach(([callerId, data]) => {
  data.calls.forEach((calleeId) => {
    if (!reverseGraph[calleeId]) reverseGraph[calleeId] = [];
    reverseGraph[calleeId].push(callerId);
  });
});

const fmtLabel = (id) => {
  const d = graphData[id];
  if (!d) return id;
  return `<b>${d.name}</b><br/><i style='font-size:10px'>${d.file}:${d.line}</i>`;
};

const sanitize = (id) => id.replace(/[^a-zA-Z0-9]/g, '_');

// Standard Downward Flow
function generateFlow(rootId, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH || !graphData[rootId]) return '';
  seen.add(rootId);
  let mmd = '';
  const data = graphData[rootId];
  data.calls.forEach((calleeId) => {
    if (graphData[calleeId]) {
      mmd += `  ${sanitize(rootId)}["${fmtLabel(rootId)}"] --> ${sanitize(calleeId)}["${fmtLabel(calleeId)}"]\n`;
      if (!seen.has(calleeId)) mmd += generateFlow(calleeId, depth + 1, seen);
    }
  });
  return mmd;
}

// Upward "Reverse" Flow
function generateReverseFlow(rootId, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH || !reverseGraph[rootId]) return '';
  seen.add(rootId);
  let mmd = '';
  reverseGraph[rootId].forEach((callerId) => {
    mmd += `  ${sanitize(callerId)}["${fmtLabel(callerId)}"] --> ${sanitize(rootId)}["${fmtLabel(rootId)}"]\n`;
    if (!seen.has(callerId))
      mmd += generateReverseFlow(callerId, depth + 1, seen);
  });
  return mmd;
}

function generateFullMap() {
  let mmd = 'graph TD\n';
  const files = [...new Set(Object.values(graphData).map((d) => d.file))];
  files.forEach((file) => {
    const subId = sanitize(file);
    mmd += `  subgraph ${subId} ["📁 ${file}"]\n`;
    Object.entries(graphData).forEach(([id, data]) => {
      if (data.file === file) mmd += `    ${sanitize(id)}["${fmtLabel(id)}"]\n`;
    });
    mmd += `  end\n`;
  });
  Object.entries(graphData).forEach(([id, data]) => {
    data.calls.forEach((calleeId) => {
      mmd += `  ${sanitize(id)} --> ${sanitize(calleeId)}\n`;
    });
  });
  return mmd;
}

// --- SERVER ---

const app = express();

app.get('/', (req, res) => {
  const entries = getEntryPoints();
  const hotspots = getHotspots();
  const activeId = req.query.id;
  const mode = req.query.mode || 'down'; // 'down' or 'up'

  let currentMmd = '';
  if (activeId === 'full') currentMmd = generateFullMap();
  else if (activeId) {
    currentMmd = `graph TD\n${mode === 'up' ? generateReverseFlow(activeId) : generateFlow(activeId)}`;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Logic Flow Dashboard</title>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          import svgPanZoom from 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/+esm';
          
          mermaid.initialize({ startOnLoad: true, securityLevel: 'loose', maxTextSize: 1000000, theme: 'neutral' });

          window.doZoom = (action) => {
            if (!window.pz) return;
            if (action === 'in') window.pz.zoomIn();
            if (action === 'out') window.pz.zoomOut();
            if (action === 'reset') { window.pz.resetZoom(); window.pz.center(); }
          };

          const initPZ = () => {
            const svg = document.querySelector('.mermaid svg');
            if (svg) {
              svg.style.width = '100%'; svg.style.height = '100%';
              window.pz = svgPanZoom(svg, { zoomEnabled: true, controlIconsEnabled: false, fit: true, center: true });
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

          window.filterMenu = (v) => {
            document.querySelectorAll('nav a.item').forEach(a => {
              a.style.display = a.innerText.toLowerCase().includes(v.toLowerCase()) ? 'block' : 'none';
            });
          };
        </script>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; margin: 0; height: 100vh; overflow: hidden; background: #f4f7f6; }
          nav { width: 380px; background: white; border-right: 1px solid #d1d9e6; padding: 20px; overflow-y: auto; flex-shrink: 0; }
          main { flex: 1; position: relative; background: white; display: flex; flex-direction: column; }
          .mermaid { flex: 1; width: 100%; height: 100%; cursor: grab; }
          .controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 100; }
          .btn { background: #333; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
          .search-box { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; box-sizing: border-box; }
          h3 { font-size: 11px; color: #888; text-transform: uppercase; margin: 25px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          a { text-decoration: none; color: #2c3e50; padding: 8px; border-radius: 4px; font-size: 13px; margin-bottom: 2px; display: block; }
          a:hover { background: #edf2f7; }
          .active { background: #3182ce !important; color: white !important; }
          .loc { font-size: 10px; opacity: 0.6; display: block; }
          .tag { font-size: 9px; padding: 2px 5px; border-radius: 3px; background: #e2e8f0; margin-left: 5px; color: #4a5568; vertical-align: middle; }
        </style>
      </head>
      <body>
        <nav>
          <input type="text" class="search-box" placeholder="Find function..." onkeyup="filterMenu(this.value)">
          <a href="/?id=full" class="item ${activeId === 'full' ? 'active' : ''}">🌐 Global System Map</a>
          
          <h3>🚀 Entry Points (Top-Down)</h3>
          ${entries.map((id) => `<a href="/?id=${id}&mode=down" class="item ${activeId === id && mode === 'down' ? 'active' : ''}">${graphData[id].name}<span class="loc">${graphData[id].file}:${graphData[id].line}</span></a>`).join('')}
          
          <h3>🔍 Impact Analysis (Who calls this?)</h3>
          ${hotspots.map((id) => `<a href="/?id=${id}&mode=up" class="item ${activeId === id && mode === 'up' ? 'active' : ''}">${graphData[id].name} <span class="tag">REVERSE</span><span class="loc">${graphData[id].file}:${graphData[id].line}</span></a>`).join('')}
        </nav>
        <main>
          <div class="controls">
            <button class="btn" onclick="doZoom('in')">+</button>
            <button class="btn" onclick="doZoom('reset')">Reset</button>
            <button class="btn" onclick="doZoom('out')">−</button>
          </div>
          <div class="mermaid">${currentMmd || '<div style="padding:50px"><h1>Logic Engine</h1><p>Select a mode from the sidebar to begin.</p></div>'}</div>
        </main>
      </body>
    </html>
  `);
});

app.listen(PORT, () =>
  console.log(`Dashboard active at http://localhost:${PORT}`),
);
