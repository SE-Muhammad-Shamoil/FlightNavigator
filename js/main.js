// js/main.js
import { FlightGraph } from './Graph.js';
import { Algorithms } from './Algorithms.js';
import { UI } from './UI.js';

// 1. Setup
const graph = new FlightGraph();
const ui = new UI(graph);
const algo = new Algorithms(graph, ui);
let isAdmin = false;
let tempCoords = null;

// 2. Load Data
function loadData() {
    // --- AMERICAS ---
    graph.addNode('JFK', 'New York', 320, 280);
    graph.addNode('LAX', 'Los Angeles', 150, 310);
    graph.addNode('ORD', 'Chicago', 260, 260);
    graph.addNode('MIA', 'Miami', 300, 360);
    graph.addNode('GRU', 'Sao Paulo', 400, 580);
    
    // --- EUROPE / AFRICA ---
    graph.addNode('LHR', 'London', 580, 210);
    graph.addNode('CDG', 'Paris', 600, 240);
    graph.addNode('FRA', 'Frankfurt', 630, 220);
    graph.addNode('MAD', 'Madrid', 570, 270);
    graph.addNode('DXB', 'Dubai', 750, 320); // Moved slightly left to fit PK
    
    // --- PAKISTAN REGION (New) ---
    // Placed between Dubai (750,320) and Mumbai (850,350)
    graph.addNode('KHI', 'Karachi', 790, 345);
    graph.addNode('LHE', 'Lahore', 830, 295);
    graph.addNode('ISB', 'Islamabad', 820, 275);
    graph.addNode('PEW', 'Peshawar', 805, 265);
    graph.addNode('DIK', 'D.I. Khan', 800, 300);

    // --- ASIA / PACIFIC ---
    graph.addNode('BOM', 'Mumbai', 870, 360);
    graph.addNode('SIN', 'Singapore', 980, 420);
    graph.addNode('HND', 'Tokyo', 1100, 280);
    graph.addNode('SYD', 'Sydney', 1150, 600);

    // --- INTERNATIONAL ROUTES ---
    graph.addBiDirectionalEdge('JFK', 'LHR', 600, 7);
    graph.addBiDirectionalEdge('JFK', 'LAX', 300, 5.5);
    graph.addBiDirectionalEdge('LAX', 'HND', 900, 10);
    graph.addBiDirectionalEdge('LHR', 'DXB', 500, 7);
    graph.addBiDirectionalEdge('LHR', 'CDG', 100, 1);
    graph.addBiDirectionalEdge('CDG', 'FRA', 120, 1.2);
    graph.addBiDirectionalEdge('FRA', 'DXB', 450, 6);
    graph.addBiDirectionalEdge('MIA', 'GRU', 500, 8);
    graph.addBiDirectionalEdge('JFK', 'MIA', 200, 3);
    graph.addBiDirectionalEdge('GRU', 'MAD', 750, 10);
    graph.addBiDirectionalEdge('MAD', 'LHR', 150, 2);
    graph.addBiDirectionalEdge('ORD', 'JFK', 150, 2);
    graph.addBiDirectionalEdge('ORD', 'LAX', 200, 4);
    graph.addBiDirectionalEdge('HND', 'SYD', 800, 9.5);
    graph.addBiDirectionalEdge('SIN', 'SYD', 600, 8);
    graph.addBiDirectionalEdge('SIN', 'HND', 550, 6.5);
    
    // --- ASIAN CONNECTIVITY ---
    // Connecting Pakistan to the World via Dubai & Mumbai
    graph.addBiDirectionalEdge('DXB', 'KHI', 150, 2);   // Dubai -> Karachi
    graph.addBiDirectionalEdge('DXB', 'ISB', 200, 3);   // Dubai -> Islamabad
    graph.addBiDirectionalEdge('KHI', 'BOM', 180, 1.5); // Karachi -> Mumbai
    graph.addBiDirectionalEdge('BOM', 'SIN', 350, 4.5); 

    // --- DOMESTIC PAKISTAN ROUTES ---
    // KHI is the hub
    graph.addBiDirectionalEdge('KHI', 'LHE', 100, 2);
    graph.addBiDirectionalEdge('KHI', 'ISB', 120, 2);
    graph.addBiDirectionalEdge('KHI', 'DIK', 90, 1.5);
    
    // Northern Connectivity
    graph.addBiDirectionalEdge('LHE', 'ISB', 50, 0.8);  // Short flight
    graph.addBiDirectionalEdge('ISB', 'PEW', 40, 0.5);  // Very short
    graph.addBiDirectionalEdge('PEW', 'DIK', 45, 0.8);
    graph.addBiDirectionalEdge('DIK', 'ISB', 60, 0.8);
}

// 3. Event Listeners
document.getElementById('btnCost').addEventListener('click', () => run('cost'));
document.getElementById('btnTime').addEventListener('click', () => run('time'));
document.getElementById('btnAstar').addEventListener('click', () => run('astar'));
document.getElementById('btnStops').addEventListener('click', () => run('stops'));
document.getElementById('btnMST').addEventListener('click', () => algo.run('mst'));

function run(type) {
    const s = document.getElementById('sourceSelect').value;
    const d = document.getElementById('destSelect').value;
    if (s && d && s !== d) algo.run(type, s, d);
    else alert("Please select different Source and Destination.");
}

// Admin Features
document.getElementById('adminToggle').addEventListener('click', () => {
    isAdmin = !isAdmin;
    document.getElementById('adminControls').classList.toggle('hidden');
    document.getElementById('canvas').style.cursor = isAdmin ? 'crosshair' : 'grab';
    document.getElementById('adminToggle').innerHTML = isAdmin 
        ? '<i class="fa-solid fa-times"></i> Close Admin' 
        : '<i class="fa-solid fa-toolbox"></i> Admin Mode';
});

document.getElementById('canvas').addEventListener('click', (e) => {
    if (!isAdmin || e.target.closest('.node')) return;
    const rect = document.getElementById('canvas').getBoundingClientRect();
    tempCoords = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    document.getElementById('nodeModal').classList.remove('hidden');
});

document.getElementById('btnConfirmNode').addEventListener('click', () => {
    const code = document.getElementById('newCode').value.toUpperCase();
    const name = document.getElementById('newName').value;
    if (code && name.length > 0) {
        if (graph.addNode(code, name, tempCoords.x, tempCoords.y)) {
            ui.renderGraph();
            ui.updateDropdowns();
            document.getElementById('nodeModal').classList.add('hidden');
        } else alert("Code exists!");
    }
});

document.getElementById('btnCancelNode').addEventListener('click', () => {
    document.getElementById('nodeModal').classList.add('hidden');
});

document.getElementById('btnAddEdge').addEventListener('click', () => {
    const u = document.getElementById('adminSource').value;
    const v = document.getElementById('adminDest').value;
    const c = parseInt(document.getElementById('newCost').value);
    const t = parseFloat(document.getElementById('newTime').value);
    if(u && v && u !== v && c && t) {
        graph.addBiDirectionalEdge(u, v, c, t);
        ui.renderGraph();
    }
});

// 4. Init
loadData();
ui.renderGraph();
ui.updateDropdowns();