# Disaster Rescue: The Ultimate Master Documentation
## Full Technical Specification and Implementation Guide

---

## 1. STRATEGIC VISION & PROJECT MISSION (The "Why")
The **Disaster Rescue** project was born from a critical observation of India's disaster response landscape: while organizations like the **NDMA (National Disaster Management Authority)** provide excellent high-level data via systems like **SACHET**, there is a "Last-Mile Gap." Information often fails to reach the community in a way that allows for immediate, coordinated peer-to-peer action.

### Core Objectives:
1.  **Unified Situational Awareness:** Combine official meteorology with official disaster alerts and community aid requests on a single vector map.
2.  **Autonomous Intelligence:** Use AI-inspired weighted analysis to classify raw text alerts into actionable data without human intervention.
3.  **Humanitarian Speed:** Reduce the "Discovery-to-Action" time for relief from hours to seconds using real-time synchronization.

---

## 2. SYSTEM ARCHITECTURE: THE 5-TIER STACK (The "How")
The system is built on a distributed modern stack optimized for low-latency and high-concurrency environments.

### Tier 1: Data Acquisition (The Ingestion Engine)
- **Primary Source:** NDMA SACHET CAP-RSS Feed.
- **Protocol:** Common Alerting Protocol (CAP) over XML.
- **Mechanism:** Asynchronous polling workers fetch live feeds every 10 minutes, bypassing CORS limitations via a logic-heavy proxy/fetcher in `disaster-data-service.ts`.

### Tier 2: The AACE Processing Layer (Smart Detection)
The **Advanced Alert Classification Engine (AACE)** is the "Brain" of the project. It doesn't just show text; it parses raw descriptions using a weighted keyword library:
- **Keyword Weights:** Every disaster type has associated keywords (e.g., "Inundation" = 0.9, "Flood" = 0.85).
- **Confidence Scoring:** The system calculates a confidence score to filter out noise and ensure that only verified, highly-relevant alerts are broadcast on the map.

### Tier 3: Persistence & Real-time Persistence (Supabase)
We utilize **Supabase** (a Firebase alternative built on PostgreSQL) to handle:
- **Authentication:** Secure login/signup for Responders and Victims.
- **PostgreSQL Database:** Storing profile information, aid request history, and disaster archives.
- **Real-time Engine:** Utilizing the PostgreSQL Write-Ahead Log (WAL) to broadcast database changes via WebSockets. When a record enters the `relief_requests` table, every client's map updates in `<200ms`.

### Tier 4: Geospatial & GIS Visualization (Leaflet/Windy)
- **Base Map:** Leaflet.js rendering OpenStreetMap tiles.
- **Weather Intelligence:** Live integration with the **Windy.com API**, allowing users to overlay ECMWF/GFS wind, rain, and pressure models over disaster markers to predict movement.
- **Geocoding:** Converting raw latitude/longitude from NDMA into human-readable city names for easier navigation.

### Tier 5: Presentation & P2P Interface (React/TypeScript)
The frontend is a high-performance Single Page Application (SPA) built with:
- **React 18:** For a responsive, state-driven UI.
- **TypeScript:** Ensuring type safety across complex disaster objects.
- **Context API:** Managing global states for user sessions and real-time alert counts.

---

## 3. CORE FUNCTIONAL MODULES: A DEEP DIVE

### A. The Alert Ingestion Pipeline
1.  **Fetch:** The system hits the NDMA endpoint.
2.  **Parse:** The XML is converted to JSON objects using specialized `xml-utils.ts`.
3.  **Validate:** The system checks for coordinate validity (NaN/Null checks) to prevent map crashes.
4.  **Enrich:** The AACE assigns an `effectiveType` (e.g., classifying a "Heavy Rain" alert as a "Flood Risk" if certain keywords are present).

### B. Peer-to-Peer Relief Coordination
This module allows victims to skip government bureaucracy by requesting help directly from the community:
1.  **"I Need Help" Tab:** Victims post a request (Food, Medical, Shelter) with their GPS location.
2.  **Proximity Matching:** The system uses the **Haversine Formula** to identify responders within a 50km radius.
3.  **Assignment Logic:** A volunteer can "Accept" a request, which immediately changes the status to `IN-PROGRESS` across all active dashboards, preventing double-effort.
4.  **Verification:** Integration with UPI IDs and Profile statuses ensures that monatory aid is transparent and direct.

### C. Shelter Finding Algorithm
Incorporating NDEM and NDMA standards:
- **Filtering:** The system queries OpenStreetMap for schools, community halls, and religious sites.
- **Scoring:** Locations are scored based on their proximity to the disaster zone and their distance from "No-Go" areas like rivers during floods.

---

## 4. DATABASE & SECURITY MODEL
The backend is strictly governed by **Row-Level Security (RLS)** to protect humanitarian safety:
- **Public Data:** Disaster alerts are readable by everyone.
- **Sensitive Data:** Victim phone numbers and donor IDs are only viewable by "Verified Volunteers."
- **Triggers:** A `handle_new_user()` trigger in PostgreSQL ensures that every time someone signs up via Supabase Auth, a corresponding `Profiles` record is created automatically with default roles.

---

## 5. CODEBASE DIRECTORY STRUCTURE
- `src/services/disaster-data-service.ts`: The heaviest file; contains ingestion, parsing, and classification logic.
- `src/utils/smart-detection.ts`: The logical implementation of the weighted keyword engine.
- `src/components/DisasterMap.tsx`: The primary UI engine that manages the Leaflet instance and Windy overlays.
- `src/lib/supabase.ts`: Configuration for the BaaS connection.
- `src/types/disaster.ts`: The "Source of Truth" for all TypeScript interfaces used in the project.

---

## 6. PROJECT EVOLUTION (The "When")
- **Initial Build:** Focused on a "Crisis Map" using mock data to prove the UI layout.
- **Mid-Dev:** Integrated Supabase; replaced `localStorage` with a persistent cloud database.
- **Final Refinement:** Removed simulated fire data and focused on the official **NDMA SACHET API**. This involved rewriting the parser to handle the specific XML schema provided by the Indian government.
- **Academic Transition:** Restructuring the project as a formal research contribution for **IEEE**, adding technical rigor to the AACE engine's description.

---

**This project serves as a blueprint for modern, decentralized disaster management where "Official Alerts meet Community Action."**

---
*Created and Maintained for the Disaster Rescue Research Initiative.*
