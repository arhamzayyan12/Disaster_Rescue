# NDEM Analysis and Project Strategy

## Overview of NDEM (National Database for Emergency Management)
The NDEM is a national-level GIS portal maintained by NRSC (ISRO). It serves as a repository for disaster-related data and provides decision support tools for government authorities.

### Key Features
- **Multi-scale Database:** Detailed GIS data at 1:50,000 and 1:10,000 scales.
- **Decision Support System (DSS):** Tools for proximity analysis, routing, and resource management.
- **Data Integration:** Aggregates data from IMD (Weather), CWC (Floods), INCOIS (Ocean), and FSI (Fires).
- **Restricted Access:** Primary access is limited to authorized government officials.

## Feasibility of Extraction vs. Replication

### Can we extract data from NDEM?
**No.** NDEM does not provide a public API for its core geospatial database. Access is restricted to authorized users. Attempting to scrape or unauthorizedly access this government portal is not advisable and likely technically blocked.

### Can we replicate its functionality?
**Yes.** We can build a "Civilian NDEM" by aggregating data from the **same public sources** that feed into NDEM.

## Our Strategy: The "Open Rescue" Approach

Instead of relying on NDEM directly, we will replicate its core value proposition using open public APIs:

| NDEM Feature | Our Implementation Strategy | Status |
| :--- | :--- | :--- |
| **Disaster Alerts** | **NDMA SACHET (CAP Protocol)**: This is the same official alert source used by government bodies. | ✅ Implemented |
| **Weather Data** | **IMD / OpenWeatherMap**: We can integrate weather layers. | 🔄 In Progress |
| **Shelter Locations** | **Google Places API**: Dynamically finds schools, hospitals, and relief centers. | ✅ Implemented |
| **Routing/Evacuation** | **Google Maps Directions API**: Provides real-time safe routes. | ⏳ Planned |
| **Resource Management** | **Crowdsourcing**: Allow users to report resources (food, water). | ⏳ Planned |

## Conclusion
We are effectively building a modern, public-facing alternative to NDEM. By using **NDMA SACHET** for alerts and **Google Maps** for geospatial intelligence, we achieve the same goal—situational awareness and decision support—without needing access to the restricted NDEM database.
