import { supabase } from '../lib/supabase'
import { DisasterType, Severity } from '../types'

/**
 * NASA FIRMS Ingestion Service
 * Implementation of Point 1-11 for satellite wildfire integration.
 */
export class FirmsIngestionService {
    // Point 1 & 2: API Pattern and Parameters
    private static getFirmsUrl(): string {
        const MAP_KEY = import.meta.env.VITE_NASA_FIRMS_KEY;
        if (!MAP_KEY || MAP_KEY === 'YOUR_MAP_KEY_HERE') {
            console.warn('⚠️ NASA_FIRMS_KEY is missing or using placeholder. API calls will fail.');
        }

        const SOURCE = 'VIIRS_SNPP_NRT';
        const AREA_COORDINATES = '68,6,98,36'; // India bounding box
        const DAY_RANGE = '1'; // Last 24 hours

        // Point 1: /api/area/csv/{MAP_KEY}/{SOURCE}/{AREA_COORDINATES}/{DAY_RANGE}
        return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${SOURCE}/${AREA_COORDINATES}/${DAY_RANGE}`;
    }

    /**
     * Point 3: Polling & Scheduling
     * Processes live wildfire data from NASA FIRMS.
     */
    static async ingestWildfireData() {
        // Anti-Spam Throttle: Prevent calling more than once every 10 mins (Across reloads/tabs)
        const lastFetch = localStorage.getItem('firms_last_fetch_ts');
        const now = Date.now();
        if (lastFetch && now - parseInt(lastFetch) < 10 * 60 * 1000) {
            console.log('⏳ NASA FIRMS: Skipping poll to respect rate limits (Cooldown active).');
            return;
        }

        const url = this.getFirmsUrl();
        console.log('🔥 Initializing NASA FIRMS Ingestion Sequence...');

        try {
            const response = await fetch(url);

            // Update timestamp immediately on success or attempt
            localStorage.setItem('firms_last_fetch_ts', now.toString());

            // Point 3: Handle failures and rate limits
            if (response.status === 429) {
                console.error('❌ FIRMS API Rate Limit Exceeded (429). Backing off...');
                return;
            }

            if (!response.ok) {
                throw new Error(`FIRMS API Error: ${response.statusText} (${response.status})`);
            }

            const csvData = await response.text();

            // Point 3: Empty response handling
            if (!csvData || csvData.trim().length === 0 || csvData.includes('No data found')) {
                console.log('📍 NASA FIRMS: No active fire detections in the last 24h.');
                return;
            }

            // Point 4: CSV Parsing
            const points = this.parseFirmsCsv(csvData);
            if (points.length === 0) return;

            // Point 5: Clustering logic
            const clusters = this.clusterFirePoints(points);
            console.log(`📡 FIRMS: Extracted ${points.length} points into ${clusters.length} clusters.`);

            for (const cluster of clusters) {
                await this.processCluster(cluster);
            }

        } catch (error) {
            console.error('❌ FIRMS Ingestion Failed:', error);
        }
    }

    private static parseFirmsCsv(csv: string): any[] {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const record: any = {};
            headers.forEach((h, i) => {
                const val = values[i];
                record[h] = isNaN(Number(val)) ? val : Number(val);
            });
            // Point 4: Convert acq_date + acq_time into timestamp
            const timeStr = record.acq_time.toString().padStart(4, '0');
            const hours = timeStr.slice(0, 2);
            const mins = timeStr.slice(2, 4);
            record.timestamp = new Date(`${record.acq_date}T${hours}:${mins}:00Z`).toISOString();
            return record;
        });
    }

    /**
     * Point 5: Wildfire Event Logic (Clustering)
     * Radius: 5km, Window: 30 minutes
     */
    private static clusterFirePoints(points: any[]): any[][] {
        const clusters: any[][] = [];
        const RADIUS_KM = 5;
        const WINDOW_MS = 30 * 60 * 1000;

        points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        points.forEach(point => {
            let placed = false;
            const pTime = new Date(point.timestamp).getTime();

            for (const cluster of clusters) {
                const center = cluster[0];
                const cTime = new Date(center.timestamp).getTime();

                const distance = this.getHaversineDistance(point.latitude, point.longitude, center.latitude, center.longitude);
                const timeDiff = Math.abs(pTime - cTime);

                if (distance <= RADIUS_KM && timeDiff <= WINDOW_MS) {
                    cluster.push(point);
                    placed = true;
                    break;
                }
            }
            if (!placed) clusters.push([point]);
        });

        return clusters;
    }

    /**
     * Point 7: Deduplication Rules
     * Check for existing events within 3km and 30m window.
     */
    private static async processCluster(cluster: any[]) {
        const avgLat = cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length;
        const avgLng = cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length;
        const maxFrp = Math.max(...cluster.map(p => p.frp));
        const avgConf = cluster.reduce((sum, p) => sum + (typeof p.confidence === 'number' ? p.confidence : 80), 0) / cluster.length;
        const firstPoint = cluster[0];
        const lastPoint = cluster[cluster.length - 1];

        // Point 7: Search for duplicates in DB
        // We use a small bounding box query (approx 3km)
        const latOffset = 0.03;
        const lngOffset = 0.03;

        const { data: existing } = await supabase
            .from('disasters')
            .select('*')
            .eq('source', 'NASA_FIRMS_VIIRS')
            .gte('lat', avgLat - latOffset)
            .lte('lat', avgLat + latOffset)
            .gte('lng', avgLng - lngOffset)
            .lte('lng', avgLng + lngOffset)
            .gte('reported_at', new Date(new Date(firstPoint.timestamp).getTime() - 30 * 60000).toISOString())
            .lte('reported_at', new Date(new Date(lastPoint.timestamp).getTime() + 30 * 60000).toISOString())
            .maybeSingle();

        if (existing) {
            // Point 7: Merge/Skip. For this implementation, we skip if already recorded 
            // to avoid state thrashing, but ideally we'd update FRP if higher.
            return;
        }

        // Point 5: Severity Rules
        const severity = this.calculateSeverity(cluster.length, maxFrp);

        // Point 6: Unified Event Model
        const eventId = `firms-v1-${avgLat.toFixed(3)}-${avgLng.toFixed(3)}-${firstPoint.acq_date}`;

        const event = {
            id: eventId,
            type: 'fire' as DisasterType,
            severity,
            lat: avgLat,
            lng: avgLng,
            location_name: 'Satellite Detected Wildfire',
            state_name: 'Active Thermal Zone',
            description: `NASA FIRMS: Cluster of ${cluster.length} fire points detected. Peak intensity: ${maxFrp} MW. Ground truth via VIIRS SNPP.`,
            reported_at: firstPoint.timestamp,
            source: 'NASA_FIRMS_VIIRS',
            confidence: avgConf / 100,
            metadata: {
                frp: maxFrp,
                count: cluster.length,
                satellite: firstPoint.satellite,
                daynight: firstPoint.daynight
            }
        };

        const { error } = await supabase.from('disasters').insert(event);
        if (error && error.code !== '23505') console.error('DB Error:', error.message);
    }

    /**
     * Point 5: Severity Mapping
     * Low: 1–2 points. Medium: 3–5 points. High: >5 points.
     */
    private static calculateSeverity(count: number, frp: number): Severity {
        if (count > 5 || frp > 100) return 'high';
        if (count >= 3 || frp > 50) return 'medium';
        return 'low';
    }

    private static getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
