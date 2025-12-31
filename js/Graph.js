// js/Graph.js

export class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(node, priority) {
        this.values.push({ node, priority });
        this.values.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.values.shift();
    }

    isEmpty() {
        return this.values.length === 0;
    }
}

export class FlightGraph {
    constructor() {
        this.nodes = {}; // { id: {x, y, name} }
        this.adjacencyList = {}; // { id: [ {node, cost, time} ] }
    }

    addNode(id, name, x, y) {
        if (this.nodes[id]) return false;
        this.nodes[id] = { id, name, x, y };
        this.adjacencyList[id] = [];
        return true;
    }

    addEdge(source, dest, cost, time) {
        if (!this.nodes[source] || !this.nodes[dest]) return false;
        
        const existing = this.adjacencyList[source].find(e => e.node === dest);
        if (existing) {
            existing.cost = cost;
            existing.time = time;
        } else {
            this.adjacencyList[source].push({ node: dest, cost, time });
        }
        return true;
    }

    // Helper to add bi-directional flights easily
    addBiDirectionalEdge(u, v, cost, time) {
        this.addEdge(u, v, cost, time);
        this.addEdge(v, u, cost, time);
    }
}