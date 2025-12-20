import { Disaster } from '../types';
import { DISASTER_CONFIG, DisasterTypeKey } from '../config/disaster-config';

interface DetectionResult {
    effectiveType: string;
    displayTitle: string;
    image: string;
    label: string;
    confidence: number;
    factors: string[];
}

/**
 * Advanced Alert Classification Engine
 * Uses weighted keyword analysis to determine the most likely disaster type.
 */
export const getSmartDisasterDetails = (disaster: Disaster): DetectionResult => {
    const desc = disaster.description.toLowerCase();
    const apiType = disaster.type.toLowerCase();

    let bestMatch: DisasterTypeKey = 'default';
    let highestScore = 0;
    let matchingFactors: string[] = [];

    // 1. Evaluate all types against the description
    (Object.keys(DISASTER_CONFIG) as DisasterTypeKey[]).forEach((key) => {
        if (key === 'default') return;

        let score = 0;
        const config = DISASTER_CONFIG[key];
        const currentFactors: string[] = [];

        // Base score if API type matches (strong signal)
        if (apiType === key) {
            score += 0.5;
            currentFactors.push(`API Type match: ${key}`);
        }

        // Keyword analysis
        Object.entries(config.keywords).forEach(([keyword, weight]) => {
            if (desc.includes(keyword)) {
                score += weight;
                currentFactors.push(`Keyword: "${keyword}" (+${weight})`);
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = key;
            matchingFactors = currentFactors;
        }
    });

    // 2. Fallback if no strong match found (Threshold can be tuned, e.g., 0.3)
    if (highestScore < 0.3) {
        // Try to use API type if it maps to a valid config
        if (DISASTER_CONFIG[apiType as DisasterTypeKey]) {
            bestMatch = apiType as DisasterTypeKey;
            matchingFactors = ['Fallback to API Type'];
        } else {
            bestMatch = 'default'; // Or maybe keep it as default
        }
    }

    const config = DISASTER_CONFIG[bestMatch] || DISASTER_CONFIG.default;

    // 3. Generate Smart Title
    const locationName = disaster.location.state || disaster.location.name;
    let title = '';

    // Custom title formatting logic (could be moved to config too if needed)
    if (bestMatch === 'flood') title = `Severe Flood Reported in ${locationName}`;
    else if (bestMatch === 'fog') title = `Dense Fog Alert Issued for ${locationName}`;
    else if (bestMatch === 'thunderstorm') title = `Thunderstorm Warning in ${locationName}`;
    else if (bestMatch === 'earthquake') title = `Earthquake Alert Near ${locationName}`;
    else title = `Severe ${config.label} Reported in ${locationName}`;

    return {
        effectiveType: bestMatch,
        displayTitle: title,
        image: config.image,
        label: config.label.toUpperCase(),
        confidence: Math.min(highestScore, 1.0), // Cap at 1.0 for UI
        factors: matchingFactors
    };
};
