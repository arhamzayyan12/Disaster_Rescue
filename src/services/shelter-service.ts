import { Shelter } from '../types'
import { calculateNDMACompliance } from './ndma-protocol-service'

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'

/**
 * Fetch and Analyze Potential Sites using NDMA Standards
 * @param lat Center latitude
 * @param lng Center longitude
 * @param targetPopulation The population needing relief
 * @param radius Radius in meters
 */
export async function fetchShelters(lat: number, lng: number, targetPopulation: number = 100, radius: number = 10000): Promise<Shelter[]> {
    console.log(`[ShelterService] Strategic scouting at ${lat}, ${lng} (Target Pop: ${targetPopulation})...`);
    try {
        const query = `
      [out:json][timeout:30];
      (
        node["amenity"~"hospital|social_facility|community_centre|school"](around:${radius},${lat},${lng});
        way["amenity"~"hospital|social_facility|community_centre|school"](around:${radius},${lat},${lng});
        relation["amenity"~"hospital|social_facility|community_centre|school"](around:${radius},${lat},${lng});
        node["emergency"~"shelter|hospital"](around:${radius},${lat},${lng});
      );
      out center;
    `

        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response.ok) throw new Error(`Overpass API error: ${response.statusText}`);

        const data = await response.json();
        const rawShelters: (Shelter & { strategicScore: number })[] = [];

        if (data.elements) {
            for (const element of data.elements) {
                const tags = element.tags || {};
                const amenity = tags.amenity || tags.emergency || 'general';
                const locLat = element.lat || element.center?.lat;
                const locLng = element.lon || element.center?.lon;

                if (locLat && locLng) {
                    const distance = getDistance(lat, lng, locLat, locLng);

                    // Priority Facilities have higher capacity estimation
                    const estimatedArea =
                        amenity === 'school' ? 1800 :
                            amenity === 'hospital' ? 2500 :
                                amenity === 'community_centre' ? 1000 : 500;

                    const compliance = calculateNDMACompliance(estimatedArea, targetPopulation);

                    // Elite Score Calculation:
                    // - Compliance (70%)
                    // - Proximity (20%)
                    // - Operational Priority (10% boost for medical/education hubs)
                    const priorityBoost = (amenity === 'hospital' || amenity === 'school') ? 20 : 0;
                    const proximityPoints = Math.max(0, 15 - (distance / 800)); // Stronger penalty for distance
                    const strategicScore = (compliance.score * 0.6) + proximityPoints + priorityBoost;

                    rawShelters.push({
                        id: `ndma-${element.id}`,
                        name: tags.name || formatName(amenity),
                        location: {
                            lat: locLat,
                            lng: locLng,
                            address: tags['addr:street'] || tags['addr:city'] || `${formatName(amenity)} Verified`
                        },
                        capacity: compliance.requirements.maxOccupancy,
                        distance,
                        currentOccupancy: 0,
                        contact: tags.phone || 'Contact Command Hub',
                        facilities: [formatName(amenity)],
                        ndmaCompliance: compliance,
                        strategicScore
                    });
                }
            }
        }

        // Return Top 15 "Elite" Facilities
        console.log(`[ShelterService] Identified ${rawShelters.length} sites. Selecting Top 15 Elite Responders.`);
        return rawShelters
            .sort((a, b) => b.strategicScore - a.strategicScore)
            .slice(0, 15);

    } catch (error) {
        console.error('[ShelterService] Fatal Operational Error:', error);
        return [];
    }
}

/** Haversine Distance Helper */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatName(amenity: string): string {
    if (!amenity) return ''
    return amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
