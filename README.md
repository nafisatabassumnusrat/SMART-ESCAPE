<div align="center">
  <img src="public/favicon.svg" alt="Logo" width="80" height="80">
  <h1 align="center">SMART ESCAPE</h1>
  <p align="center">
    <strong>Interactive Evacuation Route Simulator</strong>
  </p>
  <p align="center">
    <a href="https://reactjs.org/">
      <img src="https://img.shields.io/badge/React-19.3-blue.svg?style=for-the-badge&logo=react" alt="React" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=for-the-badge&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/Vite-8.3-purple.svg?style=for-the-badge&logo=vite" alt="Vite" />
    </a>
  </p>
</div>

<br />

## 🌟 Overview

**SMART ESCAPE** is a high-performance, interactive web application designed to simulate and visualize emergency evacuation routes in real-time. By uploading a structured building layout (`building.json`), the system instantly constructs a graph network of rooms, junctions, and exits. Using advanced pathfinding algorithms, it computes the absolute shortest and safest route to an open exit, dynamically adapting to real-time hazards like blocked corridors or closed doors.

Built with **React**, **TypeScript**, and **Vite**, SMART ESCAPE features a stunning, premium UI with smooth micro-animations, full mobile responsiveness, and built-in bilingual support (English & Bengali).

---

## ✨ Key Features

- 🗺️ **Dynamic Graph Visualization**: Renders an interactive, scalable SVG map of the building's topology.
- ⚡ **Real-Time Pathfinding**: Uses optimized graph algorithms (Dijkstra's) to instantly calculate the minimum-cost escape route.
- 🚧 **Interactive Hazard Simulation**: 
  - Block specific rooms or junctions.
  - Shut down specific corridors (edges).
  - Close specific exits.
  - The pathfinding algorithm dynamically recalculates and routes around hazards instantly.
- 📱 **Fully Responsive Layout**: An adaptive UI that gracefully scales from ultra-wide desktop monitors to mobile screens without losing functionality.
- 🌐 **Bilingual Support (i18n)**: One-click toggle between English and Bengali (বাংলা) across the entire application interface.
- 🛡️ **Robust Validation**: Strict JSON schema validation ensures that only properly formatted building datasets can be simulated.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nafisatabassumnusrat/SMART-ESCAPE.git
   cd SMART-ESCAPE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

---

## 📖 How to Use

1. **Import Building Data**: Click the **"Import Building"** zone on the left sidebar to upload your `building.json` file.
2. **Select Starting Location**: Click the **"Select Start"** interaction button, then click any non-exit node on the map to set where the evacuee is currently located.
3. **Simulate Hazards**: 
   - Click **"Block Node"** to simulate a fire or collapse in a specific room.
   - Click **"Block Corridor"** to simulate impassable hallways.
   - Click **"Close Exit"** to lock certain exit doors.
4. **View Route**: The map will instantly highlight the best escape path, and the right sidebar will display detailed statistics including total movement cost and the step-by-step path sequence.

---

## 🏗️ Data Structure (`building.json`)

The application requires a strictly formatted JSON array defining the building's graph structure. 

### Nodes
Nodes represent locations in the building.
- **id**: Unique string identifier (e.g., "R1", "J1", "E1")
- **label**: Human-readable name
- **type**: Must be `"room"`, `"junction"`, or `"exit"`
- **x / y**: Cartesian coordinates for rendering on the map

### Edges
Edges represent the corridors connecting the nodes.
- **from**: Node ID
- **to**: Node ID
- **cost**: Numeric value representing distance or difficulty (time to traverse)

<details>
<summary><b>Click here to see an example building.json</b></summary>

```json
{
  "nodes": [
    { "id": "R1", "label": "Office A", "type": "room", "x": 100, "y": 100 },
    { "id": "J1", "label": "Hallway", "type": "junction", "x": 200, "y": 100 },
    { "id": "E1", "label": "Main Exit", "type": "exit", "x": 300, "y": 100 }
  ],
  "edges": [
    { "from": "R1", "to": "J1", "cost": 10 },
    { "from": "J1", "to": "E1", "cost": 15 }
  ]
}
```

</details>

---

## 🛠️ Technology Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Vanilla CSS with CSS Variables & Modern Flexbox/Grid
- **Build Tool**: Vite
- **Icons**: Lucide React

---

<div align="center">
  <p>Built for the BUP Hackathon. 🚀</p>
</div>
