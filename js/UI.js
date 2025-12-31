// js/UI.js

export class UI {
    constructor(graph) {
        this.graph = graph;
        this.canvas = document.getElementById('canvas');
        this.resStatus = document.getElementById('resStatus');
        this.resCost = document.getElementById('resCost');
        this.resTime = document.getElementById('resTime');
        this.resStops = document.getElementById('resStops');
        this.resPath = document.getElementById('resPath');
    }

    renderGraph() {
        // Keep grid background, clear nodes/edges
        this.canvas.innerHTML = '<div class="grid-bg"></div>';

        // Draw Edges
        for (let u in this.graph.adjacencyList) {
            this.graph.adjacencyList[u].forEach(edge => {
                const v = edge.node;
                if (u < v) this.drawEdge(u, v, this.graph.nodes[u], this.graph.nodes[v]);
            });
        }

        // Draw Nodes
        for (let id in this.graph.nodes) {
            const n = this.graph.nodes[id];
            const el = document.createElement('div');
            el.className = 'node';
            el.id = `node-${id}`;
            el.style.left = `${n.x}px`;
            el.style.top = `${n.y}px`;
            el.innerHTML = `<span>${id}</span><div class="node-label">${n.name}</div>`;
            this.canvas.appendChild(el);
        }
    }

    drawEdge(u, v, src, dst) {
        const length = Math.sqrt((dst.x - src.x)**2 + (dst.y - src.y)**2);
        const angle = Math.atan2(dst.y - src.y, dst.x - src.x) * 180 / Math.PI;

        const line = document.createElement('div');
        line.className = 'edge';
        line.id = `edge-${u}-${v}`;
        // Store bidirectional IDs for easy lookup
        line.dataset.u = u;
        line.dataset.v = v;
        
        line.style.width = `${length}px`;
        line.style.left = `${src.x}px`;
        line.style.top = `${src.y}px`;
        line.style.transform = `rotate(${angle}deg)`;
        this.canvas.appendChild(line);
    }

    updateDropdowns() {
        const ids = Object.keys(this.graph.nodes).sort();
        ['sourceSelect', 'destSelect', 'adminSource', 'adminDest'].forEach(selId => {
            const el = document.getElementById(selId);
            const oldVal = el.value;
            el.innerHTML = '';
            ids.forEach(id => {
                el.add(new Option(`${this.graph.nodes[id].name} (${id})`, id));
            });
            if (oldVal && this.graph.nodes[oldVal]) el.value = oldVal;
        });
    }

    // --- Animations & Updates ---

    resetVisuals() {
        document.querySelectorAll('.node').forEach(n => n.classList.remove('visiting', 'path'));
        document.querySelectorAll('.edge').forEach(e => {
            e.classList.remove('path', 'mst');
            e.style.zIndex = 1;
        });
        this.resStatus.innerText = "Processing...";
        this.resCost.innerText = "-";
        this.resTime.innerText = "-";
        this.resStops.innerText = "-";
        this.resPath.innerText = "Calculating...";
    }

    async animateNodeVisit(id) {
        const el = document.getElementById(`node-${id}`);
        if (el) {
            el.classList.add('visiting');
            await new Promise(r => setTimeout(r, 100));
        }
    }

    async animateEdgeMST(u, v) {
        // Try finding edge u-v or v-u
        let el = document.getElementById(`edge-${u}-${v}`);
        if (!el) el = document.getElementById(`edge-${v}-${u}`);
        
        if (el) {
            el.classList.add('mst');
            await new Promise(r => setTimeout(r, 100));
        }
    }

    highlightNode(id, className) {
        document.getElementById(`node-${id}`)?.classList.add(className);
    }

    highlightEdgePath(u, v) {
        let el = document.getElementById(`edge-${u}-${v}`);
        if (!el) el = document.getElementById(`edge-${v}-${u}`);
        if (el) el.classList.add('path');
    }

    updateResults(cost, time, stops, pathStr) {
        this.resStatus.innerText = "Route Found!";
        this.resCost.innerText = `$${cost}`;
        this.resTime.innerText = typeof time === 'number' ? `${time.toFixed(1)}h` : time;
        this.resStops.innerText = stops;
        this.resPath.innerText = pathStr;
    }
    
    setStatus(text) {
        this.resStatus.innerText = text;
    }
}