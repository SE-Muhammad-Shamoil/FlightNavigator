// js/Algorithms.js
import { PriorityQueue } from './Graph.js';

// Helper for delays
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export class Algorithms {
    constructor(graph, ui) {
        this.graph = graph;
        this.ui = ui; // Reference to UI to trigger animations
        this.isRunning = false;
    }

    async run(type, start, end) {
        if (this.isRunning) return;
        this.isRunning = true;
        
        this.ui.resetVisuals();

        if (type === 'astar') await this.aStar(start, end);
        else if (type === 'mst') await this.primMST();
        else if (type === 'stops') await this.bfs(start, end);
        else await this.dijkstra(start, end, type);

        this.isRunning = false;
    }

    // --- 1. DIJKSTRA ---
    async dijkstra(start, end, criteria) {
        const dist = {};
        const parents = {};
        const pq = new PriorityQueue();
        const visited = new Set();

        for (let id in this.graph.nodes) dist[id] = Infinity;
        dist[start] = 0;
        parents[start] = null;
        pq.enqueue(start, 0);

        while (!pq.isEmpty()) {
            const { node: u } = pq.dequeue();
            if (visited.has(u)) continue;
            visited.add(u);

            // Visual: Visiting Node
            if (u !== start && u !== end) await this.ui.animateNodeVisit(u);

            if (u === end) break;

            for (let edge of this.graph.adjacencyList[u]) {
                const weight = criteria === 'cost' ? edge.cost : edge.time;
                const newDist = dist[u] + weight;
                if (newDist < dist[edge.node]) {
                    dist[edge.node] = newDist;
                    parents[edge.node] = u;
                    pq.enqueue(edge.node, newDist);
                }
            }
        }
        this.reconstructPath(parents, start, end);
    }

    // --- 2. A* SEARCH ---
    async aStar(start, end) {
        const dist = {};
        const parents = {};
        const pq = new PriorityQueue();
        const visited = new Set();

        // Heuristic: Euclidean distance * scalar
        const heuristic = (nodeId) => {
            const n1 = this.graph.nodes[nodeId];
            const n2 = this.graph.nodes[end];
            return Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2) * 2; 
        };

        for (let id in this.graph.nodes) dist[id] = Infinity;
        dist[start] = 0;
        parents[start] = null;
        pq.enqueue(start, 0 + heuristic(start));

        while (!pq.isEmpty()) {
            const { node: u } = pq.dequeue();
            if (visited.has(u)) continue;
            visited.add(u);

            if (u !== start && u !== end) await this.ui.animateNodeVisit(u);
            if (u === end) break;

            for (let edge of this.graph.adjacencyList[u]) {
                const newDist = dist[u] + edge.cost;
                if (newDist < dist[edge.node]) {
                    dist[edge.node] = newDist;
                    parents[edge.node] = u;
                    const priority = newDist + heuristic(edge.node);
                    pq.enqueue(edge.node, priority);
                }
            }
        }
        this.reconstructPath(parents, start, end);
    }

    // --- 3. BFS (Min Stops) ---
    async bfs(start, end) {
        const queue = [start];
        const visited = new Set([start]);
        const parents = { [start]: null };

        while (queue.length) {
            const u = queue.shift();
            if (u !== start && u !== end) await this.ui.animateNodeVisit(u);
            if (u === end) break;

            for (let edge of this.graph.adjacencyList[u]) {
                if (!visited.has(edge.node)) {
                    visited.add(edge.node);
                    parents[edge.node] = u;
                    queue.push(edge.node);
                }
            }
        }
        this.reconstructPath(parents, start, end);
    }

    // --- 4. PRIM'S MST ---
    async primMST() {
        this.ui.setStatus("Building MST...", "Calculated");
        const startNode = Object.keys(this.graph.nodes)[0];
        const visited = new Set();
        const pq = new PriorityQueue();
        let totalCost = 0;

        visited.add(startNode);
        this.ui.highlightNode(startNode, 'visiting');

        this.graph.adjacencyList[startNode].forEach(e => {
            pq.enqueue({ src: startNode, dest: e.node, cost: e.cost }, e.cost);
        });

        while (!pq.isEmpty()) {
            const { node: edge } = pq.dequeue();
            const { src, dest, cost } = edge;

            if (visited.has(dest)) continue;
            visited.add(dest);
            totalCost += cost;

            this.ui.highlightNode(dest, 'visiting');
            await this.ui.animateEdgeMST(src, dest);

            this.graph.adjacencyList[dest].forEach(e => {
                if (!visited.has(e.node)) {
                    pq.enqueue({ src: dest, dest: e.node, cost: e.cost }, e.cost);
                }
            });
        }
        this.ui.updateResults(totalCost, 0, "All Connected", "Minimum Spanning Tree Complete");
    }

    reconstructPath(parents, start, end) {
        if (!parents[end] && start !== end) {
            this.ui.setStatus("No Route Found", "Failed");
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
                const edge = this.graph.adjacencyList[p].find(e => e.node === curr);
                totalCost += edge.cost;
                totalTime += edge.time;
                this.ui.highlightEdgePath(p, curr);
            }
            curr = p;
        }

        path.forEach(id => this.ui.highlightNode(id, 'path'));
        this.ui.updateResults(totalCost, totalTime, path.length - 2 > 0 ? path.length - 2 : "Direct", path.join(' ➔ '));
    }
}