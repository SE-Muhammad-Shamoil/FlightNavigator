# ✈️ Flight Navigator Simulator

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Language](https://img.shields.io/badge/Language-JavaScript_ES6-yellow)
![Course](https://img.shields.io/badge/Course-DAA-blue)

**Flight Navigator Simulator** is an interactive web-based application designed to visualize complex graph algorithms in real-world scenarios. Built as a semester project for **Design and Analysis of Algorithms (DAA)**, it simulates flight routing, network optimization, and pathfinding on a dynamic map.

## 🌟 Project Overview

This project moves beyond standard textbook theory by applying graph algorithms to a visual Flight Network. Users can find the cheapest flights, fastest routes, or minimum stops between international cities (including a detailed Pakistan region).

The application features a modern **Glassmorphism UI**, interactive **Map Panning/Zooming**, and a fully functional **Admin Mode** for dynamic graph manipulation.

## 🧠 Algorithms Implemented

This project demonstrates the practical application of the following algorithms:

| Algorithm | Usage in Project | Complexity |
| :--- | :--- | :--- |
| **Dijkstra's Algorithm** | Used for **"Cheapest ($)"** and **"Fastest (Time)"** routes. It calculates the shortest path in a weighted graph. | `O(V + E log V)` |
| **A* Search (A-Star)** | Used for **"Smart Search"**. Uses Euclidean distance heuristics to find the optimal path faster by prioritizing nodes closer to the destination. | `O(E)` (approx) |
| **Breadth-First Search (BFS)** | Used for **"Min Stops"**. Treats the graph as unweighted to find the path with the fewest connecting flights. | `O(V + E)` |
| **Prim's Algorithm** | Used for **"MST (Connect All)"**. Visualizes the Minimum Spanning Tree to connect all airports with the minimum possible wiring/cost. | `O(E log V)` |

## 🚀 Key Features

### 🗺️ Interactive Map
* **Pan & Drag:** Click and drag to move around the world map.
* **Zoom Controls:** Zoom in/out to focus on specific regions (like the Pakistan cluster) or view the global network.

### 🛠️ Admin Mode (Dynamic Graph)
* **Secure Toggle:** Switch to Admin Mode to edit the graph.
* **Add Airports:** Click anywhere on the map to create new nodes.
* **Add Routes:** Create custom flight paths with specific Costs and Time.
* **Delete Mode:** Remove nodes and their associated edges dynamically.
* **Visual Feedback:** The UI changes theme (Orange/Red) to indicate "Edit Mode".

### 🎨 User Experience
* **Glassmorphism Design:** Modern, semi-transparent panels with backdrop blur.
* **Animations:** Real-time visualization of the algorithm scanning process (Yellow nodes) and the final path (Green path).
* **Responsive Metrics:** Instantly calculates Total Cost, Flight Time, and Layovers.

## 📂 Project Structure

The project follows a modular ES6 JavaScript architecture for maintainability:

```text
FlightNavigator/
│
├── index.html        # Main entry point & layout
├── style.css         # Glassmorphism UI, Animations, & Map Styling
│
└── js/
    ├── main.js       # Entry point, Event Listeners, Data Loading
    ├── Graph.js      # Data Structures (Adjacency List, Priority Queue)
    ├── Algorithms.js # Logic for Dijkstra, A*, BFS, and Prim's
    └── UI.js         # DOM manipulation, Canvas rendering, Zoom/Pan logic
