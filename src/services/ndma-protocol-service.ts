/**
 * NDMA Strategic Standards for Relief Camps (Based on NIDM PDF Pub 24)
 */
export const NDMA_STANDARDS = {
    SPACE: {
        MIN_FLOOR_AREA_PER_PERSON: 3.5, // sq meters
        MIN_CEILING_HEIGHT: 2.0, // meters
        BLOCK_BUFFER: 2.0, // meters between blocks
    },
    WATER: {
        DRINKING_PER_PERSON_DAY: 3.0, // Liters
        TOTAL_PER_PERSON_DAY: 18.0, // Total liters (drinking + washing + toilet)
        MAX_DISTANCE_TO_SOURCE: 500, // meters
    },
    SANITATION: {
        LATRINE_RATIO_EMERGENCY: 1 / 50, // 1 toilet per 50 people
        LATRINE_RATIO_OPTIMAL: 1 / 20, // 1 toilet per 20 people
        GARBAGE_CONTAINER_RATIO: 1 / 50, // 1 100L bin per 50 people
    },
    NUTRITION: {
        MIN_KCAL_PER_PERSON_DAY: 2400,
        CHILD_KCAL_PER_PERSON_DAY: 1700,
    },
    SITE_SELECTION: {
        PREFERED_SLOPE_MIN: 2, // 2%
        PREFERED_SLOPE_MAX: 4, // 4%
    }
};

export interface NDMACompliance {
    isCompliant: boolean;
    score: number; // 0-100
    requirements: {
        waterDailyLiters: number;
        maxOccupancy: number;
        toiletsEmergency: number;
        toiletsOptimal: number;
        garbageBins: number;
        minTotalKcal: number;
    };
    warnings: string[];
}

/**
 * Calculates NDMA Compliance based on floor area and target local population
 * @param area Floor area of the shelter in sq meters
 * @param targetPopulation Number of people to be housed (optional, defaults to max NDMA capacity)
 */
export function calculateNDMACompliance(area: number, targetPopulation?: number): NDMACompliance {
    const maxOccupancy = Math.floor(area / NDMA_STANDARDS.SPACE.MIN_FLOOR_AREA_PER_PERSON);

    // Calculate requirements for the target or for the max capacity of the site
    const people = targetPopulation || maxOccupancy;

    const waterDailyLiters = people * NDMA_STANDARDS.WATER.TOTAL_PER_PERSON_DAY;
    const toiletsEmergency = Math.ceil(people * NDMA_STANDARDS.SANITATION.LATRINE_RATIO_EMERGENCY);
    const toiletsOptimal = Math.ceil(people * NDMA_STANDARDS.SANITATION.LATRINE_RATIO_OPTIMAL);
    const garbageBins = Math.ceil(people * NDMA_STANDARDS.SANITATION.GARBAGE_CONTAINER_RATIO);
    const minTotalKcal = people * NDMA_STANDARDS.NUTRITION.MIN_KCAL_PER_PERSON_DAY;

    const warnings: string[] = [];
    if (targetPopulation && targetPopulation > maxOccupancy) {
        warnings.push(`EXCEEDED: Site Limit is ${maxOccupancy} persons.`);
    }

    if (area < 50) {
        warnings.push("PROTOCOL: Shelter area is below relief camp minimum standards.");
    }

    const score = Math.max(0, 100 - (warnings.length * 20));

    return {
        isCompliant: warnings.filter(w => w.includes('EXCEEDED')).length === 0,
        score,
        requirements: {
            waterDailyLiters,
            maxOccupancy,
            toiletsEmergency,
            toiletsOptimal,
            garbageBins,
            minTotalKcal
        },
        warnings
    };
}
