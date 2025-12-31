/**
 * CORE DATA STRUCTURES
 */
class PriorityQueue {
    constructor() { this.values = []; }
    enqueue(node, priority) {
        this.values.push({ node, priority });
        this.values.sort((a, b) => a.priority - b.priority);
    }
    dequeue() { return this.values.shift(); }
    isEmpty() { return this.values.length === 0; }
}

class FlightGraph {
    constructor() {
        this.nodes = {}; // { id: {x, y, name} }
        this.adjacencyList = {}; // { id: [ {node, cost, time} ] }
    }

    addNode(id, name, x, y) {
        if(this.nodes[id]) return false; // Prevent duplicate IDs
        this.nodes[id] = { id, name, x, y };
        this.adjacencyList[id] = [];
        return true;
    }

    addEdge(source, dest, cost, time) {
        if(!this.nodes[source] || !this.nodes[dest]) return false;
        // Check if edge exists to update it, or push new
        const existing = this.adjacencyList[source].find(e => e.node === dest);
        if(existing) {
            existing.cost = cost;
            existing.time = time;
        } else {
            this.adjacencyList[source].push({ node: dest, cost, time });
        }
        return true;
    }
}

// --- GLOBAL STATE ---
const graph = new FlightGraph();
const canvas = document.getElementById('canvas');
let isAdmin = false;
let tempNodeCoords = null; // Stores X,Y when user clicks map in admin mode

// --- INITIAL DATA LOAD (Massive Dataset) ---
function loadDefaultData() {
    // 1. AMERICAS
    graph.addNode('JFK', 'New York', 280, 250);
    graph.addNode('LAX', 'Los Angeles', 100, 280);
    graph.addNode('ORD', 'Chicago', 220, 230);
    graph.addNode('MIA', 'Miami', 260, 320);
    graph.addNode('YYZ', 'Toronto', 260, 210);
    graph.addNode('GRU', 'Sao Paulo', 350, 550);
    graph.addNode('MEX', 'Mexico City', 180, 350);

    // 2. EUROPE / AFRICA
    graph.addNode('LHR', 'London', 550, 180);
    graph.addNode('CDG', 'Paris', 570, 210);
    graph.addNode('FRA', 'Frankfurt', 600, 190);
    graph.addNode('MAD', 'Madrid', 540, 240);
    graph.addNode('IST', 'Istanbul', 680, 230);
    graph.addNode('CAI', 'Cairo', 670, 300);
    graph.addNode('JNB', 'Johannesburg', 650, 600);
    graph.addNode('LOS', 'Lagos', 560, 400);

    // 3. ASIA / OCEANIA
    graph.addNode('DXB', 'Dubai', 750, 280);
    graph.addNode('BOM', 'Mumbai', 820, 310);
    graph.addNode('BKK', 'Bangkok', 950, 330);
    graph.addNode('SIN', 'Singapore', 970, 380);
    graph.addNode('HKG', 'Hong Kong', 1000, 290);
    graph.addNode('HND', 'Tokyo', 1100, 240);
    graph.addNode('SYD', 'Sydney', 1150, 550);
    graph.addNode('PEK', 'Beijing', 980, 220);

    // --- ROUTES (Source, Dest, Cost $, Time h) ---
    
    // Transatlantic
    graph.addEdge('JFK', 'LHR', 600, 7);
    graph.addEdge('JFK', 'CDG', 550, 7.5);
    graph.addEdge('MIA', 'LHR', 700, 8.5);
    graph.addEdge('YYZ', 'FRA', 650, 8);
    graph.addEdge('GRU', 'LHR', 900, 11);
    graph.addEdge('GRU', 'MAD', 800, 10);

    // US Domestic
    graph.addEdge('LAX', 'JFK', 300, 5.5);
    graph.addEdge('LAX', 'MIA', 350, 5);
    graph.addEdge('LAX', 'ORD', 250, 4);
    graph.addEdge('ORD', 'JFK', 200, 2.5);
    graph.addEdge('MEX', 'LAX', 250, 3.5);
    graph.addEdge('MEX', 'MIA', 200, 3);

    // Europe Internal
    graph.addEdge('LHR', 'CDG', 100, 1);
    graph.addEdge('LHR', 'FRA', 150, 1.5);
    graph.addEdge('CDG', 'MAD', 120, 2);
    graph.addEdge('FRA', 'IST', 250, 3);
    
    // Europe -> Asia/Africa
    graph.addEdge('LHR', 'DXB', 500, 7);
    graph.addEdge('CDG', 'CAI', 400, 4.5);
    graph.addEdge('FRA', 'JNB', 800, 10.5);
    graph.addEdge('IST', 'DXB', 300, 4);
    graph.addEdge('IST', 'BOM', 450, 6);

    // Middle East -> Asia
    graph.addEdge('DXB', 'BOM', 250, 3);
    graph.addEdge('DXB', 'SIN', 500, 7.5);
    graph.addEdge('DXB', 'HND', 700, 9.5);
    graph.addEdge('CAI', 'DXB', 200, 3);

    // Asia Internal
    graph.addEdge('BOM', 'BKK', 300, 4);
    graph.addEdge('BKK', 'HKG', 200, 3);
    graph.addEdge('HKG', 'HND', 350, 4);
    graph.addEdge('SIN', 'SYD', 600, 8);
    graph.addEdge('HKG', 'SYD', 700, 9);
    graph.addEdge('PEK', 'HND', 250, 3);
    graph.addEdge('PEK', 'HKG', 300, 3.5);

    // Transpacific
    graph.addEdge('HND', 'LAX', 900, 10);
    graph.addEdge('SYD', 'LAX', 1100, 14);
}

// --- VISUALIZATION LOGIC ---

function render() {
    // Clear dynamic elements but keep legend
    const legend = document.querySelector('.legend');
    canvas.innerHTML = '';
    if(legend) canvas.appendChild(legend);

    // Draw Edges
    for (let u in graph.adjacencyList) {
        graph.adjacencyList[u].forEach(edge => {
            const v = edge.node;
            const src = graph.nodes[u];
            const dst = graph.nodes[v];
            drawEdge(u, v, src, dst, edge.cost, edge.time);
        });
    }

    // Draw Nodes
    for (let id in graph.nodes) {
        const n = graph.nodes[id];
        const el = document.createElement('div');
        el.className = 'node';
        el.id = `node-${id}`;
        el.style.left = `${n.x}px`;
        el.style.top = `${n.y}px`;
        el.innerHTML = `<span>${id}</span>`;
        el.setAttribute('data-label', n.name);
        canvas.appendChild(el);
    }
}

function drawEdge(u, v, src, dst, cost, time) {
    const length = Math.sqrt((dst.x - src.x)**2 + (dst.y - src.y)**2);
    const angle = Math.atan2(dst.y - src.y, dst.x - src.x) * 180 / Math.PI;

    const line = document.createElement('div');
    line.className = 'edge';
    line.id = `edge-${u}-${v}`;
    line.style.width = `${length}px`;
    line.style.left = `${src.x}px`; // No offset needed due to CSS transform origin
    line.style.top = `${src.y}px`;
    line.style.transform = `rotate(${angle}deg)`;
    canvas.appendChild(line);

    // Only show label if edges aren't too crowded (simple logic)
    if (length > 60) {
        const label = document.createElement('div');
        label.className = 'edge-label';
        label.innerHTML = `$${cost}`;
        label.style.left = `${(src.x + dst.x) / 2}px`;
        label.style.top = `${(src.y + dst.y) / 2}px`;
        canvas.appendChild(label);
    }
}

function updateDropdowns() {
    const selects = ['sourceSelect', 'destSelect', 'adminSource', 'adminDest'];
    
    // Save current selection
    const saved = {};
    selects.forEach(id => saved[id] = document.getElementById(id).value);

    // Clear options
    selects.forEach(id => document.getElementById(id).innerHTML = '');

    // Repopulate
    const ids = Object.keys(graph.nodes).sort();
    ids.forEach(nodeId => {
        const name = graph.nodes[nodeId].name;
        selects.forEach(selId => {
            const opt = new Option(`${name} (${nodeId})`, nodeId);
            document.getElementById(selId).add(opt);
        });
    });

    // Restore selection or default
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(saved[id] && graph.nodes[saved[id]]) el.value = saved[id];
    });
}

// --- ADMIN FEATURES ---

function toggleAdminMode() {
    isAdmin = !isAdmin;
    const btn = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminControls');
    const canvas = document.getElementById('canvas');

    if (isAdmin) {
        btn.classList.add('active');
        btn.innerText = "Admin Mode: ON";
        adminPanel.classList.remove('hidden');
        canvas.classList.add('admin-cursor');
    } else {
        btn.classList.remove('active');
        btn.innerText = "Admin Mode: OFF";
        adminPanel.classList.add('hidden');
        canvas.classList.remove('admin-cursor');
    }
}

// Click Canvas to Add Node
canvas.addEventListener('click', (e) => {
    if (!isAdmin) return;
    if (e.target.closest('.node') || e.target.closest('.edge')) return; // Ignore clicks on existing items

    const rect = canvas.getBoundingClientRect();
    tempNodeCoords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    document.getElementById('nodeModal').classList.remove('hidden');
    document.getElementById('newCode').focus();
});

function confirmNodeAdd() {
    const code = document.getElementById('newCode').value.toUpperCase();
    const name = document.getElementById('newName').value;

    if (!code || !name) {
        alert("Please enter both a code and a name.");
        return;
    }
    if (code.length !== 3) {
        alert("Code must be 3 letters (e.g. LAX).");
        return;
    }

    if (graph.addNode(code, name, tempNodeCoords.x, tempNodeCoords.y)) {
        render();
        updateDropdowns();
        cancelNodeAdd();
    } else {
        alert("Airport Code already exists!");
    }
}

function cancelNodeAdd() {
    document.getElementById('nodeModal').classList.add('hidden');
    document.getElementById('newCode').value = '';
    document.getElementById('newName').value = '';
}

function addCustomEdge() {
    const u = document.getElementById('adminSource').value;
    const v = document.getElementById('adminDest').value;
    const cost = parseInt(document.getElementById('newCost').value);
    const time = parseFloat(document.getElementById('newTime').value);

    if (u === v) { alert("Cannot fly to same airport."); return; }
    if (!cost || !time) { alert("Enter valid Cost and Time."); return; }

    graph.addEdge(u, v, cost, time);
    render();
    alert(`Flight added: ${u} -> ${v}`);
}

// --- ALGORITHMS (Dijkstra + BFS) ---

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let isRunning = false;

async function resetVisuals() {
    document.querySelectorAll('.node').forEach(n => {
        n.classList.remove('visiting', 'path');
    });
    document.querySelectorAll('.edge').forEach(e => {
        e.classList.remove('path');
        e.style.zIndex = 1;
    });
    
    document.getElementById('resStatus').innerText = "Running...";
    document.getElementById('resCost').innerText = "-";
    document.getElementById('resTime').innerText = "-";
    document.getElementById('resStops').innerText = "-";
    document.getElementById('resPath').innerText = "";
}

async function runAlgorithm(type) {
    if (isRunning) return;
    const start = document.getElementById('sourceSelect').value;
    const end = document.getElementById('destSelect').value;
    
    if(!start || !end) return;
    if (start === end) { alert("Already at destination!"); return; }

    isRunning = true;
    await resetVisuals();

    if (type === 'stops') await bfs(start, end);
    else await dijkstra(start, end, type);

    isRunning = false;
}

async function dijkstra(start, end, criteria) {
    const dist = {};
    const parents = {};
    const pq = new PriorityQueue();
    const visited = new Set();

    for(let id in graph.nodes) dist[id] = Infinity;
    dist[start] = 0;
    parents[start] = null;
    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        const { node: u } = pq.dequeue();

        if (visited.has(u)) continue;
        visited.add(u);

        // Visualization: Scanning
        if (u !== start && u !== end) {
            const el = document.getElementById(`node-${u}`);
            if(el) {
                el.classList.add('visiting');
                await sleep(200); 
            }
        }

        if (u === end) break;

        for (let edge of graph.adjacencyList[u]) {
            const weight = criteria === 'cost' ? edge.cost : edge.time;
            const newDist = dist[u] + weight;
            if (newDist < dist[edge.node]) {
                dist[edge.node] = newDist;
                parents[edge.node] = u;
                pq.enqueue(edge.node, newDist);
            }
        }
    }
    reconstructPath(parents, start, end);
}

async function bfs(start, end) {
    const queue = [start];
    const visited = new Set([start]);
    const parents = { [start]: null };
    let found = false;

    while (queue.length) {
        const u = queue.shift();

        if (u !== start && u !== end) {
            const el = document.getElementById(`node-${u}`);
            if(el) {
                el.classList.add('visiting');
                await sleep(200);
            }
        }

        if (u === end) { found = true; break; }

        for (let edge of graph.adjacencyList[u]) {
            if (!visited.has(edge.node)) {
                visited.add(edge.node);
                parents[edge.node] = u;
                queue.push(edge.node);
            }
        }
    }
    reconstructPath(parents, start, end);
}

function reconstructPath(parents, start, end) {
    if (!parents[end] && start !== end) {
        document.getElementById('resStatus').innerText = "No Route Found";
        return;
    }

    const path = [];
    let curr = end;
    let totalCost = 0;
    let totalTime = 0;

    while (curr !== null) {
        path.unshift(curr);
        const p = parents[curr];
        if (p) {
            const edge = graph.adjacencyList[p].find(e => e.node === curr);
            totalCost += edge.cost;
            totalTime += edge.time;
            
            // Highlight Edge
            const edgeEl = document.getElementById(`edge-${p}-${curr}`);
            if (edgeEl) edgeEl.classList.add('path');
        }
        curr = p;
    }

    // Highlight Nodes
    path.forEach(id => {
        const el = document.getElementById(`node-${id}`);
        if(el) {
            el.classList.remove('visiting');
            el.classList.add('path');
        }
    });

    document.getElementById('resStatus').innerText = "Route Found!";
    document.getElementById('resCost').innerText = `$${totalCost}`;
    document.getElementById('resTime').innerText = `${totalTime.toFixed(1)}h`;
    document.getElementById('resStops').innerText = path.length - 2 > 0 ? path.length - 2 : "Direct";
    document.getElementById('resPath').innerText = path.join(' ➔ ');
}

// --- INIT ---
loadDefaultData();
render();
updateDropdowns();