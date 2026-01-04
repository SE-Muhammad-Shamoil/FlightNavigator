import { FlightGraph } from './Graph.js';
import { Algorithms } from './Algorithms.js';
import { UI } from './UI.js';

// 1. Setup
const graph = new FlightGraph();
const ui = new UI(graph);
const algo = new Algorithms(graph, ui);

let isAdmin = false;
let isDeleteMode = false;
let tempCoords = null;

// Variables for Dragging
let isDragging = false;
let startX, startY;
let hasDragged = false; // To distinguish between a Click and a Drag

// 2. Load Data
function loadData() {
    // Americas
    graph.addNode('JFK', 'New York', 320, 280);
    graph.addNode('LAX', 'Los Angeles', 150, 310);
    graph.addNode('ORD', 'Chicago', 260, 260);
    graph.addNode('MIA', 'Miami', 300, 360);
    graph.addNode('GRU', 'Sao Paulo', 400, 580);
    
    // Europe/Africa
    graph.addNode('LHR', 'London', 580, 210);
    graph.addNode('CDG', 'Paris', 600, 240);
    graph.addNode('FRA', 'Frankfurt', 630, 220);
    graph.addNode('MAD', 'Madrid', 570, 270);
    graph.addNode('DXB', 'Dubai', 750, 320);
    
    // Pakistan
    graph.addNode('KHI', 'Karachi', 790, 345);
    graph.addNode('LHE', 'Lahore', 830, 295);
    graph.addNode('ISB', 'Islamabad', 820, 275);
    graph.addNode('PEW', 'Peshawar', 805, 265);
    graph.addNode('DIK', 'D.I. Khan', 800, 300);

    // Asia/Pacific
    graph.addNode('SIN', 'Singapore', 980, 420);
    graph.addNode('HND', 'Tokyo', 1100, 280);
    graph.addNode('SYD', 'Sydney', 1150, 600);

    // Routes
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
    
    // PK Routes
    graph.addBiDirectionalEdge('DXB', 'KHI', 150, 2);
    graph.addBiDirectionalEdge('DXB', 'ISB', 200, 3);
    graph.addBiDirectionalEdge('KHI', 'BOM', 180, 1.5);
    graph.addBiDirectionalEdge('BOM', 'SIN', 350, 4.5);
    graph.addBiDirectionalEdge('KHI', 'LHE', 100, 2);
    graph.addBiDirectionalEdge('KHI', 'ISB', 120, 2);
    graph.addBiDirectionalEdge('KHI', 'DIK', 90, 1.5);
    graph.addBiDirectionalEdge('LHE', 'ISB', 50, 0.8);
    graph.addBiDirectionalEdge('ISB', 'PEW', 40, 0.5);
    graph.addBiDirectionalEdge('PEW', 'DIK', 45, 0.8);
    graph.addBiDirectionalEdge('DIK', 'ISB', 60, 0.8);
}

// 3. Event Listeners
document.getElementById('btnCost').addEventListener('click', () => run('cost'));
document.getElementById('btnTime').addEventListener('click', () => run('time'));
document.getElementById('btnAstar').addEventListener('click', () => run('astar'));
document.getElementById('btnStops').addEventListener('click', () => run('stops'));
document.getElementById('btnMST').addEventListener('click', () => algo.run('mst'));

// Zoom Listeners
document.getElementById('btnZoomIn').addEventListener('click', () => ui.setZoom(0.2));
document.getElementById('btnZoomOut').addEventListener('click', () => ui.setZoom(-0.2));

// --- DRAG / PANNING LOGIC ---
const canvas = document.getElementById('canvas');

canvas.addEventListener('mousedown', (e) => {
    // Only allow drag if NOT in admin mode
    if (isAdmin) return;
    isDragging = true;
    hasDragged = false; // Reset drag status
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // If moved more than a few pixels, count it as a drag (not a click)
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged = true;

    ui.setPan(dx, dy);
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});


function run(type) {
    const s = document.getElementById('sourceSelect').value;
    const d = document.getElementById('destSelect').value;
    if (s && d && s !== d) algo.run(type, s, d);
    else alert("Please select different Source and Destination.");
}

// Admin Toggle
document.getElementById('adminToggle').addEventListener('click', () => {
    isAdmin = !isAdmin;
    if(!isAdmin) {
        isDeleteMode = false;
        updateDeleteModeUI();
    }
    document.getElementById('adminControls').classList.toggle('hidden');
    // document.getElementById('userControls').classList.toggle('hidden');

    updateCursor();
    document.getElementById('adminToggle').innerHTML = isAdmin 
        ? '<i class="fa-solid fa-times"></i> Close Admin' 
        : '<i class="fa-solid fa-toolbox"></i> Admin Mode';
});

document.getElementById('btnDeleteMode').addEventListener('click', () => {
    isDeleteMode = !isDeleteMode;
    updateDeleteModeUI();
    updateCursor();
});

function updateDeleteModeUI() {
    const btn = document.getElementById('btnDeleteMode');
    if (isDeleteMode) {
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> Toggle Delete Mode: ON';
        btn.style.boxShadow = "0 0 10px red";
    } else {
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> Toggle Delete Mode: OFF';
        btn.style.boxShadow = "none";
    }
}

function updateCursor() {
    if (isDeleteMode) {
        canvas.classList.add('delete-cursor');
        canvas.classList.remove('admin-cursor');
    } else if (isAdmin) {
        canvas.classList.add('admin-cursor');
        canvas.classList.remove('delete-cursor');
    } else {
        canvas.classList.remove('admin-cursor', 'delete-cursor');
    }
}

// Map Click Handler (Add/Delete/Node Select)
canvas.addEventListener('click', (e) => {
    // 1. If we just dragged the map, ignore the click
    if (hasDragged && !isAdmin) return;

    // 2. If NOT Admin, we do nothing on click (user was just viewing)
    if (!isAdmin) return;

    // 3. Admin Logic
    const nodeEl = e.target.closest('.node');

    if (nodeEl) {
        if (isDeleteMode) {
            const id = nodeEl.dataset.id;
            if (confirm(`Delete airport ${id}?`)) {
                graph.removeNode(id);
                ui.renderGraph();
                ui.updateDropdowns();
            }
        }
        return;
    }

    // Add Node Logic
    if (!isDeleteMode) {
        const rect = document.getElementById('zoom-layer').getBoundingClientRect();
        const scale = ui.scale || 1; 
        
        // Calculate coords relative to zoomed layer AND pan offset
        // Since rect includes transform, we can just take relative click and divide by scale
        // But we must subtract the current PAN values tracked in UI
        

        const canvasRect = canvas.getBoundingClientRect();
        tempCoords = { 
            x: (e.clientX - canvasRect.left - ui.panX) / scale, 
            y: (e.clientY - canvasRect.top - ui.panY) / scale 
        };
        document.getElementById('nodeModal').classList.remove('hidden');
    }
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
    console.log("Adding Edge");
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

// Set Defaults
document.getElementById('sourceSelect').value = 'ISB';
document.getElementById('destSelect').value = 'JFK';