# Disaster Data Sources - NDMA SACHET Integration

This project uses **NDMA SACHET (National Disaster Alert Portal)** for accurate, real-time disaster information for India.

## Primary Data Source: NDMA SACHET RSS Feed

**SACHET** (System for Alerting and Communication for Hazardous Events and Threats) is operated by the **National Disaster Management Authority (NDMA)** of India.

### Features:
- ✅ **Common Alerting Protocol (CAP)** based RSS feed
- ✅ Near real-time early warnings
- ✅ Covers all natural and man-made disasters
- ✅ Official government source - most accurate for India
- ✅ Machine-readable RSS format for easy integration
- ✅ Multi-media dissemination system

### How It Works:
1. Click "📡 Fetch from NDMA SACHET" button on the map
2. The system fetches the **CAP RSS Feed** from SACHET
3. RSS items containing CAP alerts are parsed
4. Disasters are extracted and displayed on the map with accurate locations
5. Each alert includes:
   - Disaster type (flood, earthquake, cyclone, etc.)
   - Severity level
   - Location coordinates
   - Description and status
   - Timestamp

## RSS Feed Endpoints

The system attempts to connect to SACHET through common CAP RSS feed URLs:
- `https://ndma.gov.in/sachet/cap/rss` - Primary CAP RSS feed
- `https://sachet.ndma.gov.in/cap/rss` - Alternative domain
- `https://ndma.gov.in/rss/cap` - RSS feed path
- `https://ndma.gov.in/sachet/rss.xml` - RSS XML feed
- `https://sachet.ndma.gov.in/rss.xml` - Alternative RSS
- `https://ndma.gov.in/api/cap/rss` - API RSS endpoint

**Note:** The actual SACHET RSS feed URL may vary. Check the [NDMA website](https://ndma.gov.in) for the current RSS feed URL. The RSS feed serves as a machine-readable alternative to a direct API.

## Fallback Options

If SACHET endpoints are not accessible, the system may try:
- **IMD (India Meteorological Department)** - Weather warnings and alerts
- **Sample Data** - For demonstration purposes when real data is unavailable

## Disaster Types Supported

- 🌊 **Floods** - Monsoon floods, river flooding
- 🌍 **Earthquakes** - Seismic events
- 🌀 **Cyclones** - Tropical cyclones, hurricanes
- ☀️ **Drought** - Water scarcity, agricultural impact
- 🔥 **Fires** - Wildfires, industrial fires
- ⛰️ **Landslides** - Mountain landslides, mudslides

## Data Format

SACHET uses **RSS Feed with Common Alerting Protocol (CAP)** format:
- **RSS XML** feed structure (`<rss><channel><item>...</item></channel></rss>`)
- CAP data embedded in RSS items (either as embedded CAP XML or in item descriptions)
- Standardized disaster alert structure following CAP standard
- Includes coordinates, severity, event type, and descriptions
- Timestamped alerts with status (Active/Contained/Resolved)
- Each RSS item represents a disaster alert

## Troubleshooting

### No Data Retrieved:
1. **Check Browser Console (F12)** - Look for connection errors
2. **Verify SACHET RSS Feed URL** - NDMA may have updated the RSS feed URL
3. **CORS Issues** - RSS feeds may require backend proxy due to CORS restrictions
4. **RSS Feed Format** - Ensure the RSS feed contains CAP data in the expected format

### To Get Current SACHET RSS Feed URL:
1. Visit [NDMA Website](https://ndma.gov.in)
2. Look for SACHET or "CAP RSS Feed" documentation
3. Find the official RSS feed URL (usually ends with `.rss` or `.xml`)
4. Update RSS feed URLs in `src/services/disaster-data-service.ts` (sachetRSSEndpoints array)
5. The RSS feed is publicly available - no API key required

## Implementation Details

The disaster data service:
- Fetches and parses RSS XML feeds
- Extracts RSS items containing CAP alerts
- Parses embedded CAP XML data from RSS items (if present)
- Falls back to extracting disaster info from RSS item titles/descriptions
- Extracts location coordinates from CAP polygons/circles or text parsing
- Maps CAP event codes to disaster types
- Converts CAP severity levels to our severity system
- Handles both RSS feed format and direct CAP XML format

## For Your Final Year Project

**Recommended Approach:**
1. **Contact NDMA** - Request official SACHET API access/documentation
2. **Backend Proxy** - Create a backend server to handle SACHET API calls (avoids CORS)
3. **Database Storage** - Store fetched alerts in a database
4. **Real-time Updates** - Use WebSockets or polling for live updates
5. **Admin Panel** - Allow manual entry of disasters if API is unavailable

## Additional Resources

- **NDMA Website**: https://ndma.gov.in
- **SACHET Portal**: Check NDMA website for current URL
- **CAP Standard**: https://docs.oasis-open.org/emergency/cap/v1.2/
- **India Disaster Resource Network**: https://idrn.nidm.gov.in

## Current Status

✅ **Implemented:**
- SACHET CAP feed parser
- Multiple endpoint support
- XML and JSON format handling
- Location extraction from CAP data
- Disaster type and severity mapping

🔄 **To Improve:**
- Get official SACHET API documentation
- Add backend proxy for CORS issues
- Implement WebSocket for real-time updates
- Add caching to reduce API calls
- Error handling for different CAP versions
