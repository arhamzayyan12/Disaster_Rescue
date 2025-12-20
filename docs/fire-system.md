# 🔥 NASA FIRMS Fire Monitoring System

## Overview
The Fire Monitoring System integrates real-time fire data from NASA's **Fire Information for Resource Management System (FIRMS)**. It provides two layers of visualization:
1.  **Satellite WMS Overlay**: A visual heatmap of fire activity using the VIIRS 375m NRT dataset.
2.  **Hotspot Markers**: Clickable markers for individual fire detections with detailed metadata.

## 🏗️ Architecture

### 1. State Management (`src/state/fire/`)
-   **`fireStore.tsx`**: React Context + Reducer for global fire state.
-   **`fireActions.ts`**: Async actions for fetching data and toggling layers.
-   **`fireTypes.ts`**: TypeScript definitions for FIRMS data structures.

### 2. Service Layer (`src/services/firmsService.ts`)
-   Handles API requests to NASA FIRMS.
-   Parses CSV responses into JSON.
-   Manages API keys and endpoints.

### 3. Components
-   **`FireMonitoringPanel.tsx`**: UI control panel in the sidebar.
-   **`DisasterMap.tsx`**: Renders the WMS layer and Marker clusters.

## 🔑 API Key Configuration
To use the live hotspot markers, you need a NASA FIRMS MAP KEY.

1.  Go to [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/map_key) and request a Map Key.
2.  Create a `.env` file in the project root (if not exists).
3.  Add your key:
    ```env
    VITE_FIRMS_API_KEY=your_map_key_here
    ```
    *(Note: A fallback key is currently hardcoded for demo purposes, but it may be rate-limited.)*

## 🛠️ Usage

### Toggling Layers
-   **Satellite Overlay**: Toggle "Satellite Overlay (WMS)" in the Fire Monitoring panel. This adds a visual layer on top of the map.
-   **Hotspot Markers**: Toggle "Hotspot Markers" to see individual fire points.

### Filtering
-   **Region**: Switch between "India" (Country mode) and "Global" (World view).
-   **Time Range**: Select 24h, 48h, or 7 days of data.

## ⚠️ Notes
-   **Global Mode**: Fetching global markers can be resource-intensive. Use the WMS overlay for global views to maintain performance.
-   **Data Latency**: NRT (Near Real-Time) data is usually available within 3 hours of satellite overpass.

## 🧹 Cleanup
All legacy fire code (India OGD service) has been removed and replaced with this system.
