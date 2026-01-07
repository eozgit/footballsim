import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'fn-graph.json');

const PORT = 3000;
const TOP_HOTSPOTS_COUNT = 8; // Increased for better visibility
const MAX_DEPTH = 5;

const graphData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

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
    .slice(0, TOP_HOTSPOTS_COUNT)
    .map((entry) => entry[0]);
}

// Utility to format Mermaid labels with metadata
const fmtLabel = (id) => {
  const d = graphData[id];
  if (!d) return id;
  // Using HTML-like labels for multi-line info
  return `<b>${d.name}</b><br/><i style='font-size:10px'>${d.file}:${d.line}</i>`;
};

const sanitize = (id) => id.replace(/[^a-zA-Z0-9]/g, '_');

function generateFlow(rootId, depth = 0, seen = new Set()) {
  if (depth > MAX_DEPTH || !graphData[rootId]) return '';
  seen.add(rootId);

  let mmd = '';
  const data = graphData[rootId];
  const sourceNode = sanitize(rootId);

  data.calls.forEach((calleeId) => {
    const targetNode = sanitize(calleeId);
    if (graphData[calleeId]) {
      mmd += `  ${sourceNode}["${fmtLabel(rootId)}"] --> ${targetNode}["${fmtLabel(calleeId)}"]\n`;
      if (!seen.has(calleeId)) {
        mmd += generateFlow(calleeId, depth + 1, seen);
      }
    }
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
      if (data.file === file) {
        mmd += `    ${sanitize(id)}["${fmtLabel(id)}"]\n`;
      }
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
    <!DOCTYPE html>
    <html>
      <head>
        <title>Logic Flow Engine</title>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          import svgPanZoom from 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/+esm';
          
          mermaid.initialize({ 
            startOnLoad: true, 
            securityLevel: 'loose',
            maxTextSize: 90000,
            theme: 'base',
            themeVariables: { primaryColor: '#e1f5fe' }
          });

          window.initZoom = () => {
            const svgElement = document.querySelector('.mermaid svg');
            if (svgElement) {
                // Ensure SVG is visible and has dimensions before initializing
                setTimeout(() => {
                  try {
                    svgElement.style.width = '100%';
                    svgElement.style.height = '100%';
                    window.panZoom = svgPanZoom(svgElement, {
                        zoomEnabled: true,
                        controlIconsEnabled: true,
                        fit: true,
                        center: true,
                        minZoom: 0.1,
                        maxZoom: 10
                    });
                  } catch (e) {
                    console.error("Zoom init failed:", e);
                  }
                }, 200); 
            }
          };

          window.filterMenu = (val) => {
            const links = document.querySelectorAll('nav a.item');
            links.forEach(link => {
                const text = link.innerText.toLowerCase();
                link.style.display = text.includes(val.toLowerCase()) ? 'block' : 'none';
            });
          };

          const observer = new MutationObserver(mutations => {
            const svg = document.querySelector('.mermaid svg');
            if (svg && !svg.getAttribute('data-processed')) {
                svg.setAttribute('data-processed', 'true');
                window.initZoom();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        </script>
        <style>
          body { font-family: 'Segoe UI', sans-serif; display: flex; margin: 0; background: #f9f9f9; height: 100vh; overflow: hidden; }
          nav { width: 350px; border-right: 1px solid #ddd; padding: 15px; height: 100vh; overflow-y: auto; background: white; flex-shrink: 0; }
          main { flex: 1; height: 100vh; background: #fff; position: relative; }
          .mermaid { height: 100%; width: 100%; overflow: hidden; }
          .search-box { width: 100%; padding: 10px; box-sizing: border-box; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; }
          h3 { font-size: 0.8rem; color: #888; text-transform: uppercase; margin-top: 20px; }
          a { text-decoration: none; color: #444; display: block; padding: 8px; border-radius: 4px; font-size: 13px; }
          a:hover { background: #f4f4f4; }
          .active { background: #007bff !important; color: white !important; }
          .loc { font-size: 10px; opacity: 0.7; font-style: italic; display: block; }
        </style>
      </head>
      <body>
        <nav>
          <input type="text" class="search-box" placeholder="Filter logic..." onkeyup="filterMenu(this.value)">
          <a href="/?id=full" class="item ${activeId === 'full' ? 'active' : ''}">🌐 Full Architecture Map</a>
          
          <h3>🚀 Entry Points</h3>
          ${entries
            .map((id) => {
              const d = graphData[id];
              return `<a href="/?id=${id}" class="item ${activeId === id ? 'active' : ''}">
              ${d.name} <span class="loc">${d.file}:${d.line}</span>
            </a>`;
            })
            .join('')}
          
          <h3>🔥 Hotspots</h3>
          ${hotspots
            .map((id) => {
              const d = graphData[id];
              return `<a href="/?id=${id}" class="item ${activeId === id ? 'active' : ''}">
              ${d.name} <span class="loc">${d.file}:${d.line}</span>
            </a>`;
            })
            .join('')}
        </nav>
        <main>
          <div class="mermaid">
            ${currentMmd}
          </div>
        </main>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Visualization server running at http://localhost:${PORT}`);
});
