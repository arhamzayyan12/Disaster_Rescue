import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ReliefRequest } from '../types/relief';
import { getAllReliefRequests, subscribeToReliefRequests } from '../services/relief-service';

interface ReliefContextType {
    requests: ReliefRequest[];
    loading: boolean;
    refreshRequests: () => Promise<void>;
}

const ReliefContext = createContext<ReliefContextType | undefined>(undefined);

export const ReliefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requests, setRequests] = useState<ReliefRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = useCallback(async () => {
        try {
            const data = await getAllReliefRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to load relief requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();

        // Subscribe to real-time updates
        const subscription = subscribeToReliefRequests((payload) => {
            console.log('Real-time update received:', payload);

            // We could update the state locally based on payload for maximum speed,
            // but for safety and handling deleted rows easily, a quick re-fetch is also viable
            // since this is a small-to-medium scale app.
            // Let's implement local update logic for "Premium" feel.

            if (payload.eventType === 'INSERT') {
                // Map the new row and add to top
                // We need the mapping function here or in the service
                // For now, let's just refresh to ensure consistency with existing filters
                loadRequests();
            } else if (payload.eventType === 'UPDATE') {
                loadRequests();
            } else if (payload.eventType === 'DELETE') {
                setRequests(prev => prev.filter(r => r.id !== payload.old.id));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [loadRequests]);

    return (
        <ReliefContext.Provider value={{ requests, loading, refreshRequests: loadRequests }}>
            {children}
        </ReliefContext.Provider>
    );
};

export const useRelief = () => {
    const context = useContext(ReliefContext);
    if (context === undefined) {
        throw new Error('useRelief must be used within a ReliefProvider');
    }
    return context;
};
