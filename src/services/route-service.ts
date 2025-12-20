// OSRM routing service (free, no API key required)

export interface Route {
  distance: number // in meters
  duration: number // in seconds
  geometry: number[][] // coordinates [lng, lat]
}

/**
 * Get route from origin to destination using OSRM (free, no API key)
 */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<Route | null> {
  try {
    // OSRM expects coordinates as lng,lat
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry.coordinates // Already in [lng, lat] format
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching route from OSRM:', error)
    return null
  }
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}min`
}

/**
 * Open Google Maps with directions (fallback if OSRM fails)
 */
export function openGoogleMapsDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`
  window.open(url, '_blank')
}
