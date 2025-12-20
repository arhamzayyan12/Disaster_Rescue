import { Disaster, DisasterType, Severity } from '../types'
import { indianCities } from '../constants/locations'

// Simplified Indian cities lookup for location mapping
// (Now imported from constants/locations.ts)


// Extract location from text (returns first match)
function extractLocation(text: string): { name: string; state: string; lat: number; lng: number } | null {
  const locations = extractAllLocations(text)
  return locations.length > 0 ? locations[0] : null
}

// Extract all locations from text (RSS items may mention multiple cities)
function extractAllLocations(text: string): Array<{ name: string; state: string; lat: number; lng: number }> {
  const foundLocations: Array<{ name: string; state: string; lat: number; lng: number }> = []
  const foundCities = new Set<string>()

  for (const [city, coords] of Object.entries(indianCities)) {
    // Check if city name appears in text (as whole word to avoid partial matches)
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i')
    if (cityRegex.test(text) && !foundCities.has(city)) {
      foundCities.add(city)
      foundLocations.push({
        name: city.charAt(0).toUpperCase() + city.slice(1),
        state: coords.state,
        lat: coords.lat,
        lng: coords.lng
      })
    }
  }

  return foundLocations
}

// Extract state/region location when specific city not found
function extractStateLocation(text: string): { name: string; state: string; lat: number; lng: number } | null {
  const lowerText = text.toLowerCase()

  // Common state/region patterns in RSS alerts
  const statePatterns: Record<string, { name: string; state: string; lat: number; lng: number }> = {
    'tamil nadu': { name: 'Tamil Nadu', state: 'Tamil Nadu', lat: 11.1271, lng: 78.6569 },
    'andaman': { name: 'Andaman and Nicobar', state: 'Andaman and Nicobar Islands', lat: 11.6234, lng: 92.7265 },
    'nicobar': { name: 'Nicobar Islands', state: 'Andaman and Nicobar Islands', lat: 7.1395, lng: 93.7784 },
    'madhya pradesh': { name: 'Madhya Pradesh', state: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569 },
    'telangana': { name: 'Telangana', state: 'Telangana', lat: 18.1124, lng: 79.0193 },
    'pondicherry': { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083 },
    'karaikal': { name: 'Karaikal', state: 'Puducherry', lat: 10.9254, lng: 79.8380 }
  }

  for (const [pattern, location] of Object.entries(statePatterns)) {
    if (lowerText.includes(pattern)) {
      return location
    }
  }

  return null
}

// Detect disaster type from text (used as fallback when CAP event code not available)
function detectDisasterType(text: string): DisasterType {
  const lowerText = text.toLowerCase()

  // Check for heavy rain/flooding (most common in RSS feed)
  if (lowerText.includes('heavy rain') || lowerText.includes('heavy  rain') ||
    (lowerText.includes('rain') && (lowerText.includes('07-11 cm') || lowerText.includes('flood')))) {
    return 'flood'
  }
  if (lowerText.includes('flood') || lowerText.includes('flooding') || lowerText.includes('inundat')) {
    return 'flood'
  }
  if (lowerText.includes('earthquake') || lowerText.includes('quake') || lowerText.includes('seismic')) {
    return 'earthquake'
  }
  if (lowerText.includes('cyclone') || lowerText.includes('hurricane') || lowerText.includes('typhoon') ||
    lowerText.includes('squally weather') || lowerText.includes('strong wind')) {
    return 'cyclone'
  }
  if (lowerText.includes('drought') || lowerText.includes('water shortage') || lowerText.includes('scarcity')) {
    return 'drought'
  }
  if (lowerText.includes('fire') || lowerText.includes('blaze') || lowerText.includes('inferno') ||
    lowerText.includes('forest fire') || lowerText.includes('wildfire') || lowerText.includes('bush fire') ||
    lowerText.includes('explosion') || lowerText.includes('blast') || lowerText.includes('short circuit')) {
    return 'fire'
  }
  if (lowerText.includes('landslide') || lowerText.includes('mudslide') || lowerText.includes('rockfall')) {
    return 'landslide'
  }
  // Cold wave is a type of disaster (extreme weather)
  if (lowerText.includes('cold wave') || lowerText.includes('cold wave conditions') ||
    lowerText.includes('शीत लहर') || lowerText.includes('कोल्ड डे')) {
    return 'coldwave'
  }

  // Default: rain/thunderstorm alerts are weather-related, map to flood if heavy
  if (lowerText.includes('rain') || lowerText.includes('thunderstorm') || lowerText.includes('thunder')) {
    return 'flood' // Heavy rain can cause flooding
  }

  return 'flood' // default
}

// Detect severity from text (used as fallback when CAP severity not available)
function detectSeverity(text: string): Severity {
  const lowerText = text.toLowerCase()

  // Check for critical indicators
  if (lowerText.includes('critical') || lowerText.includes('severe') || lowerText.includes('extreme') ||
    lowerText.includes('catastrophic') || lowerText.includes('very likely') && lowerText.includes('heavy') ||
    lowerText.includes('07-11 cm') || lowerText.includes('people are advised')) {
    return 'critical'
  }
  // Check for high severity
  if (lowerText.includes('heavy rain') || lowerText.includes('heavy  rain') ||
    lowerText.includes('high') || lowerText.includes('major') || lowerText.includes('significant') ||
    lowerText.includes('moderate rain') && lowerText.includes('very likely')) {
    return 'high'
  }
  // Check for medium severity
  if (lowerText.includes('moderate') || lowerText.includes('medium') ||
    lowerText.includes('moderate rain') || lowerText.includes('at a few places')) {
    return 'medium'
  }
  // Light rain, isolated places = low severity
  if (lowerText.includes('light rain') || lowerText.includes('isolated places') ||
    lowerText.includes('light to moderate')) {
    return 'low'
  }

  return 'medium' // default to medium for weather alerts
}

// Map CAP event codes to disaster types
function mapCAPEventToType(eventCode: string, event: string): DisasterType {
  const lowerEvent = event.toLowerCase()
  const lowerCode = eventCode.toLowerCase()

  if (lowerEvent.includes('flood') || lowerCode.includes('flood')) return 'flood'
  if (lowerEvent.includes('earthquake') || lowerCode.includes('quake') || lowerCode.includes('seismic')) return 'earthquake'
  if (lowerEvent.includes('cyclone') || lowerEvent.includes('hurricane') || lowerEvent.includes('typhoon') || lowerCode.includes('cyclone')) return 'cyclone'
  if (lowerEvent.includes('drought') || lowerCode.includes('drought')) return 'drought'
  if (lowerEvent.includes('fire') || lowerEvent.includes('wildfire') || lowerEvent.includes('forest fire') ||
    lowerEvent.includes('explosion') || lowerEvent.includes('blast') || lowerCode.includes('fire')) return 'fire'
  if (lowerEvent.includes('landslide') || lowerEvent.includes('mudslide') || lowerCode.includes('landslide')) return 'landslide'
  if (lowerEvent.includes('thunderstorm') || lowerEvent.includes('thunder') || lowerCode.includes('thunder')) return 'thunderstorm'
  if (lowerEvent.includes('heat wave') || lowerEvent.includes('heatwave') || lowerCode.includes('heat')) return 'heatwave'
  if (lowerEvent.includes('cold wave') || lowerEvent.includes('coldwave') || lowerCode.includes('cold')) return 'coldwave'

  return 'flood' // default
}

// Map CAP severity to our severity levels
function mapCAPSeverity(severity: string): Severity {
  const lower = severity.toLowerCase()

  if (lower === 'extreme' || lower === 'severe') return 'critical'
  if (lower === 'moderate') return 'high'
  if (lower === 'minor') return 'medium'

  return 'low'
}

// Helper to safely extract string content from XML object or string
function getStringContent(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    const v = val as Record<string, unknown>
    return String(v['#text'] || v.text || v.content || '')
  }
  return String(val)
}

// Parse CAP XML/JSON alert
function parseCAPAlert(alert: Record<string, any>): Disaster | null {
  try {
    // Handle both XML (parsed) and JSON formats
    const info = alert.info || alert
    const event = getStringContent(info.event) || getStringContent(info.eventCode)
    const eventCode = getStringContent(info.eventCode)
    const severity = getStringContent(info.severity) || 'Unknown'
    const description = getStringContent(info.description) || getStringContent(info.headline)
    const area = getStringContent(info.area) || getStringContent(info.areaDesc)
    const sent = alert.sent || info.sent || new Date().toISOString()
    const expires = info.expires || alert.expires || undefined

    // Extract coordinates from CAP polygon or point
    let lat = 20.5937 // Default to India center
    let lng = 78.9629

    if (info.polygon || info.circle) {
      // Parse polygon or circle coordinates
      const coords = getStringContent(info.polygon || info.circle)
      const coordParts = coords.split(/[\s,]+/).filter((c: string) => c)
      if (coordParts.length >= 2) {
        lat = parseFloat(coordParts[0])
        lng = parseFloat(coordParts[1])
      }
    }

    // Try to extract location from area description
    const location = extractLocation(area + ' ' + description) || extractLocation(event)

    if (!location) {
      // Use coordinates if available, otherwise skip
      if (lat === 20.5937 && lng === 78.9629) {
        return null // Skip if no valid location
      }
    }

    const type = mapCAPEventToType(eventCode, event)
    const mappedSeverity = mapCAPSeverity(severity)

    // Ensure location has all required properties
    const finalLocation = location && location.name && location.state
      ? {
        name: String(location.name),
        state: String(location.state),
        lat: location.lat,
        lng: location.lng
      }
      : {
        name: String(area || 'India'),
        state: 'India',
        lat,
        lng
      }

    return {
      id: String(alert.identifier || `sachet-${Date.now()}-${Math.random()}`),
      type,
      location: finalLocation,
      severity: mappedSeverity,
      description: String(description || event || 'Disaster alert from NDMA SACHET'),
      reportedAt: String(sent),
      expires: expires ? String(expires) : undefined,
      status: alert.status === 'Actual' ? 'active' : 'contained',
      affectedPeople: undefined
    }
  } catch (error) {
    console.error('Error parsing CAP alert:', error)
    return null
  }
}

/**
 * Fetch disasters from NDMA SACHET (Common Alerting Protocol RSS Feed)
 * 
 * Only uses the official RSS feed: https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml
 * Filters to show only today's disaster alerts (not old alerts)
 * 
 * SACHET provides near real-time early warnings for all natural and man-made disasters
 * Uses RSS feed format with CAP data embedded
 */
export async function fetchDisastersFromSACHET(): Promise<Disaster[]> {
  // console.log('Fetching today\'s disasters from official NDMA SACHET RSS Feed...')

  try {
    const disasters: Disaster[] = []

    // Official SACHET RSS Feed - Only source
    const SACHET_RSS_URL = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml'

    // Use Vite dev server proxy to bypass CORS (configured in vite.config.ts)
    // In development: requests to /api/sachet are proxied to SACHET_RSS_URL
    // For production: set up a backend proxy server or use a CORS-enabled endpoint
    const USE_VITE_PROXY = import.meta.env.DEV
    const VITE_PROXY_PATH = '/api/sachet'

    // Fallback: Public CORS proxy (unreliable, may be down)
    const CORS_PROXY = 'https://api.allorigins.win/raw?url='

    // Get today's date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    const todayTimestamp = today.getTime()

    // Helper to check if a date is today or if the alert is still live
    const isLiveOrToday = (dateString: string, expiresString?: string): boolean => {
      try {
        if (!dateString) return false

        const alertDate = new Date(dateString)
        if (isNaN(alertDate.getTime())) {
          console.warn(`Invalid date string: ${dateString}`)
          return false
        }

        // Check if today
        const alertDay = new Date(alertDate)
        alertDay.setHours(0, 0, 0, 0)
        if (alertDay.getTime() === todayTimestamp) return true

        // Check if live (expires in future)
        if (expiresString) {
          const expires = new Date(expiresString)
          if (!isNaN(expires.getTime()) && expires > new Date()) return true
        }

        // If no expires date, but recent (within 24 hours), consider it relevant
        const diffHours = (new Date().getTime() - alertDate.getTime()) / (1000 * 60 * 60)
        if (diffHours < 24) return true

        return false
      } catch (error) {
        console.warn(`Error parsing date ${dateString}:`, error)
        return false
      }
    }

    // Fetch from official SACHET RSS feed only
    try {
      // console.log(`Fetching from official SACHET RSS feed via Vite proxy`)

      // Use Vite dev server proxy to avoid CORS issues
      // The proxy is configured in vite.config.ts
      const fetchUrl = USE_VITE_PROXY
        ? VITE_PROXY_PATH  // Use local Vite proxy (preferred for development)
        : `${CORS_PROXY}${encodeURIComponent(SACHET_RSS_URL)}` // Fallback to public CORS proxy

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      })

      if (!response.ok) {
        throw new Error(`SACHET RSS feed returned ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

      // Check for parse errors
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('Failed to parse RSS XML feed')
      }

      // Try to parse as RSS feed first
      const rssItems = xmlDoc.querySelectorAll('rss channel item, feed entry, item')

      if (rssItems.length > 0) {
        // This is an RSS feed - parse RSS items


        for (let i = 0; i < rssItems.length; i++) {
          const item = rssItems[i]
          const itemObj = xmlToObject(item) as Record<string, any>

          // Extract CAP data from RSS item
          // CAP data might be in description, content, or embedded CAP elements
          const title = getStringContent(itemObj.title)
          const description = getStringContent(itemObj.description) || getStringContent(itemObj.summary)
          const content = getStringContent(itemObj.content)
          const pubDate = getStringContent(itemObj.pubDate) || getStringContent(itemObj.published) || new Date().toISOString()

          // Filter: Only process alerts that are live or from today
          if (!isLiveOrToday(pubDate)) {

            continue
          }

          // Look for embedded CAP alert elements
          const capAlert = item.querySelector('alert, cap\\:alert, *[xmlns*="urn:oasis:names:tc:emergency:cap"]')

          if (capAlert) {
            // Parse embedded CAP alert
            const alertObj = xmlToObject(capAlert) as Record<string, any>
            const disaster = parseCAPAlert(alertObj)
            if (disaster && isLiveOrToday(disaster.reportedAt, disaster.expires)) {
              disasters.push(disaster)
            }
          } else {
            // Try to extract disaster info from RSS item content
            const fullText = title + ' ' + description + ' ' + content

            // Extract all locations mentioned in the text (RSS items may mention multiple cities)
            const locations = extractAllLocations(fullText)

            if (locations.length > 0) {
              const type = detectDisasterType(fullText)
              const severity = detectSeverity(fullText)
              // Handle GUID which might be an object or string
              let itemGuid: string
              if (typeof itemObj.guid === 'object' && itemObj.guid !== null) {
                const guidObj = itemObj.guid as Record<string, any>
                itemGuid = String(guidObj['#text'] || guidObj['@isPermaLink'] || guidObj) || `item-${i}`
              } else {
                itemGuid = String(itemObj.guid || `item-${i}-${Date.now()}`)
              }

              // Create a disaster entry for EACH location mentioned in the alert
              // This way each city gets its own marker on the map
              for (let locIndex = 0; locIndex < locations.length; locIndex++) {
                const location = locations[locIndex]

                // Ensure location has all required properties and valid coordinates
                if (location && location.name && location.state &&
                  typeof location.lat === 'number' && typeof location.lng === 'number' &&
                  !isNaN(location.lat) && !isNaN(location.lng) &&
                  isFinite(location.lat) && isFinite(location.lng)) {
                  disasters.push({
                    id: `sachet-rss-${itemGuid}-${locIndex}`,
                    type,
                    location: {
                      name: String(location.name),
                      state: String(location.state),
                      lat: location.lat,
                      lng: location.lng
                    },
                    severity,
                    description: String(description || title || 'Disaster alert from NDMA SACHET'),
                    reportedAt: String(pubDate),
                    status: 'active',
                    affectedPeople: undefined
                  })
                } else {
                  console.warn('Skipping disaster with invalid location:', location)
                }
              }
            } else {
              // If no specific city found, try to extract state/region info
              const stateLocation = extractStateLocation(fullText)
              if (stateLocation && stateLocation.name && stateLocation.state &&
                typeof stateLocation.lat === 'number' && typeof stateLocation.lng === 'number' &&
                !isNaN(stateLocation.lat) && !isNaN(stateLocation.lng) &&
                isFinite(stateLocation.lat) && isFinite(stateLocation.lng)) {
                const type = detectDisasterType(fullText)
                const severity = detectSeverity(fullText)
                // Handle GUID which might be an object or string
                let itemGuid: string
                if (typeof itemObj.guid === 'object' && itemObj.guid !== null) {
                  const guidObj = itemObj.guid as Record<string, any>
                  itemGuid = String(guidObj['#text'] || guidObj['@isPermaLink'] || guidObj) || `item-${i}`
                } else {
                  itemGuid = String(itemObj.guid || `item-${i}-${Date.now()}`)
                }

                disasters.push({
                  id: `sachet-rss-${itemGuid}`,
                  type,
                  location: {
                    name: String(stateLocation.name),
                    state: String(stateLocation.state),
                    lat: stateLocation.lat,
                    lng: stateLocation.lng
                  },
                  severity,
                  description: String(description || title || 'Disaster alert from NDMA SACHET'),
                  reportedAt: String(pubDate),
                  status: 'active',
                  affectedPeople: undefined
                })
              } else if (stateLocation) {
                console.warn('Skipping disaster with invalid state location:', stateLocation)
              }
            }
          }
        }
      } else {
        // Try to parse as direct CAP XML (not RSS)
        const alerts = xmlDoc.getElementsByTagName('alert')
        if (alerts.length > 0) {

          for (let i = 0; i < alerts.length; i++) {
            const alertElement = alerts[i]
            const alertObj = xmlToObject(alertElement) as Record<string, any>
            const disaster = parseCAPAlert(alertObj)
            if (disaster && isLiveOrToday(disaster.reportedAt, disaster.expires)) {
              disasters.push(disaster)
            }
          }
        }
      }

      // Filter to ensure only live/today's disasters
      const activeDisasters = disasters.filter(disaster => {
        return isLiveOrToday(disaster.reportedAt, disaster.expires)
      })


      return activeDisasters
    } catch (error) {
      console.error(`Error fetching from SACHET RSS feed:`, error)
      throw error // Re-throw to be handled by caller
    }
  } catch (error) {
    console.error('Error fetching from SACHET:', error)
    return []
  }
}

// Helper to convert XML element to object
function xmlToObject(element: Element): Record<string, any> | string {
  const obj: Record<string, any> = {}

  // Get text content
  if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
    return element.textContent
  }

  // Get attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    obj[`@${attr.name}`] = attr.value
  }

  // Get child elements
  const children = element.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childObj = xmlToObject(child)
    const tagName = child.tagName

    if (obj[tagName]) {
      if (!Array.isArray(obj[tagName])) {
        obj[tagName] = [obj[tagName]]
      }
      obj[tagName].push(childObj)
    } else {
      obj[tagName] = childObj
    }
  }

  // Add text content if exists
  const text = element.textContent?.trim()
  if (text && Object.keys(obj).length === 0) {
    return text
  } else if (text) {
    obj['#text'] = text
  }

  return obj
}

// Main function to get all disasters from SACHET
export async function fetchAllDisasters(): Promise<Disaster[]> {
  // Fetch from SACHET
  const sachetDisasters = await fetchDisastersFromSACHET()

  // Combine all disasters (currently just SACHET, will add new FIRMS later if needed here, or handle separately)
  const allDisasters = [...sachetDisasters]

  // Remove duplicates (same location + type + date)
  const uniqueDisasters = allDisasters.filter((disaster, index, self) =>
    index === self.findIndex(d =>
      d.id === disaster.id || (
        Math.abs(d.location.lat - disaster.location.lat) < 0.1 &&
        Math.abs(d.location.lng - disaster.location.lng) < 0.1 &&
        d.type === disaster.type &&
        d.reportedAt === disaster.reportedAt
      )
    )
  )


  return uniqueDisasters
}
