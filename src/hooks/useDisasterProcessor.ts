import { useMemo } from 'react';
import { Disaster } from '../types';
import { getSmartDisasterDetails } from '../utils/smart-detection';

export interface EnrichedDisaster extends Disaster {
    smartAnalysis: {
        effectiveType: string;
        label: string;
        confidence: number;
        title: string;
    };
}

/**
 * Performance Hook: useDisasterProcessor
 * 
 * Pre-processes raw disaster data to add "Smart Detection" metadata.
 * This runs ONLY when the raw 'disasters' array changes, preventing
 * expensive re-calculations during map interactions or re-renders.
 */
export const useDisasterProcessor = (disasters: Disaster[]): EnrichedDisaster[] => {
    return useMemo(() => {
        return disasters.map((disaster) => {
            const details = getSmartDisasterDetails(disaster);

            return {
                ...disaster,
                // We override the 'type' for the map's sake if confidence is high, 
                // OR we just attach metadata. Let's attach metadata to keep original data pure.
                smartAnalysis: {
                    effectiveType: details.effectiveType,
                    label: details.label,
                    confidence: details.confidence,
                    title: details.displayTitle
                }
            };
        });
    }, [disasters]);
};
