import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { ReliefRequest } from '../types/relief'
import { getRoute, formatDistance, formatDuration, Route } from '../services/route-service'
import './ReliefMap.css'

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

interface ReliefMapProps {
    requests: ReliefRequest[]
    userLocation?: { lat: number; lng: number }
    selectedRequest?: ReliefRequest | null
    onRequestSelect?: (request: ReliefRequest) => void
}

const ReliefMap: React.FC<ReliefMapProps> = ({
    requests,
    userLocation,
    selectedRequest,
    onRequestSelect
}) => {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.Marker[]>([])
    const routeLayerRef = useRef<L.Polyline | null>(null)
    const [routeInfo, setRouteInfo] = useState<Route | null>(null)
    const [loadingRoute, setLoadingRoute] = useState(false)

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return

        const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map)

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    // Add user location marker
    useEffect(() => {
        if (!mapRef.current || !userLocation) return

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-marker-icon">📍</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            })
        }).addTo(mapRef.current)

        userMarker.bindPopup('<b>Your Location</b>')

        return () => {
            userMarker.remove()
        }
    }, [userLocation])

    // Add request markers
    useEffect(() => {
        if (!mapRef.current) return

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // Add markers for each request
        requests.forEach(request => {
            if (request.status === 'fulfilled') return // Don't show fulfilled requests

            const isSelected = selectedRequest?.id === request.id

            const markerIcon = L.divIcon({
                className: `request-marker ${request.urgency} ${isSelected ? 'selected' : ''}`,
                html: `
          <div class="request-marker-icon">
            ${getTypeIcon(request.type)}
          </div>
        `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
            })

            const marker = L.marker(
                [request.location.lat, request.location.lng],
                { icon: markerIcon }
            ).addTo(mapRef.current!)

            marker.bindPopup(`
        <div class="request-popup">
          <h4>${request.title}</h4>
          <p class="popup-type">${getTypeIcon(request.type)} ${request.type}</p>
          <p class="popup-urgency" style="color: ${getUrgencyColor(request.urgency)}">${request.urgency.toUpperCase()}</p>
          <p>${request.description}</p>
          <p class="popup-contact">📞 ${request.victimContact}</p>
          <p class="popup-address">📍 ${request.location.address}</p>
        </div>
      `)

            marker.on('click', () => {
                onRequestSelect?.(request)
            })

            markersRef.current.push(marker)
        })

        // Fit bounds to show all markers (if there are any)
        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current)
            mapRef.current.fitBounds(group.getBounds().pad(0.1))
        }
    }, [requests, selectedRequest, onRequestSelect])

    // Show route when request is selected
    useEffect(() => {
        if (!mapRef.current || !selectedRequest || !userLocation) {
            // Clear route if no request selected
            if (routeLayerRef.current) {
                routeLayerRef.current.remove()
                routeLayerRef.current = null
                setRouteInfo(null)
            }
            return
        }

        // Fetch and display route
        const fetchRoute = async () => {
            setLoadingRoute(true)
            try {
                const route = await getRoute(
                    userLocation,
                    { lat: selectedRequest.location.lat, lng: selectedRequest.location.lng }
                )

                if (route && mapRef.current) {
                    // API route available
                    if (routeLayerRef.current) {
                        routeLayerRef.current.remove()
                    }

                    const latLngs: L.LatLngExpression[] = route.geometry.map(coord => [coord[1], coord[0]])

                    const routeLayer = L.polyline(latLngs, {
                        color: '#3b82f6',
                        weight: 4,
                        opacity: 0.8,
                    }).addTo(mapRef.current)

                    routeLayerRef.current = routeLayer
                    setRouteInfo(route)
                    mapRef.current.fitBounds(routeLayer.getBounds().pad(0.1))
                } else {
                    // Fallback: Draw straight line and calculate approximate distance
                    if (mapRef.current) {
                        if (routeLayerRef.current) {
                            routeLayerRef.current.remove()
                        }

                        // Draw straight dashed line to indicate it's approximate
                        const latLngs: L.LatLngExpression[] = [
                            [userLocation.lat, userLocation.lng],
                            [selectedRequest.location.lat, selectedRequest.location.lng]
                        ]

                        const routeLayer = L.polyline(latLngs, {
                            color: '#3b82f6',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10'
                        }).addTo(mapRef.current)

                        routeLayerRef.current = routeLayer

                        // Calculate straight-line distance (Haversine formula)
                        const R = 6371e3 // Earth's radius in meters
                        const φ1 = userLocation.lat * Math.PI / 180
                        const φ2 = selectedRequest.location.lat * Math.PI / 180
                        const Δφ = (selectedRequest.location.lat - userLocation.lat) * Math.PI / 180
                        const Δλ = (selectedRequest.location.lng - userLocation.lng) * Math.PI / 180

                        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                        const distance = R * c // Distance in meters

                        // Estimate duration (assuming 40 km/h average speed)
                        const duration = (distance / 1000) / 40 * 3600 // seconds

                        setRouteInfo({
                            distance,
                            duration,
                            geometry: [[userLocation.lng, userLocation.lat], [selectedRequest.location.lng, selectedRequest.location.lat]]
                        })

                        mapRef.current.fitBounds(routeLayer.getBounds().pad(0.1))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch route:', error)
            } finally {
                setLoadingRoute(false)
            }
        }

        fetchRoute()
    }, [selectedRequest, userLocation])

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            monetary: '💸',
            food: '🍽️',
            medical: '💊',
            shelter: '🏠',
            clothing: '👕',
            rescue: '🆘',
            other: '📦'
        }
        return icons[type] || '📦'
    }

    const getUrgencyColor = (urgency: string) => {
        const colors: Record<string, string> = {
            critical: '#ef4444',
            high: '#f97316',
            medium: '#eab308',
            low: '#22c55e'
        }
        return colors[urgency] || '#94a3b8'
    }

    return (
        <div className="relief-map-container">
            <div ref={mapContainerRef} className="relief-map" />

            {loadingRoute && (
                <div className="route-loading">
                    Calculating route...
                </div>
            )}

            {selectedRequest?.type === 'monetary' ? (
                <div className="financial-aid-panel glass-panel">
                    <div className="panel-header">
                        <h4>💸 Financial Aid Request</h4>
                    </div>

                    <div className="aid-amount">₹{selectedRequest.amount || selectedRequest.quantity?.replace(/[^0-9]/g, '') || '0'}</div>

                    <div className="aid-details">
                        <p><strong>To:</strong> {selectedRequest.victimName}</p>
                        <p><strong>For:</strong> {selectedRequest.description}</p>
                        <p className="upi-id"><strong>UPI:</strong> {selectedRequest.upiId}</p>
                    </div>

                    <div className="aid-actions">
                        <button
                            className="pay-now-btn"
                            onClick={() => {
                                const upiUrl = `upi://pay?pa=${selectedRequest.upiId}&pn=${encodeURIComponent(selectedRequest.victimName)}&am=${selectedRequest.amount}&cu=INR&tn=${encodeURIComponent('Disaster Relief Aid')}`
                                window.open(upiUrl, '_blank')
                            }}
                        >
                            Pay Now (UPI)
                        </button>
                        <button
                            className="mark-paid-btn"
                            style={{
                                marginTop: '8px',
                                padding: '10px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'var(--text-white)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                width: '100%'
                            }}
                            onClick={() => {
                                if (window.confirm('Have you completed the payment? This will mark the request as fulfilled.')) {
                                    // In real app: call fulfillRequest(selectedRequest.id)
                                    alert('Thank you! Request marked as fulfilled (Simulation).')
                                }
                            }}
                        >
                            Mark as Paid
                        </button>
                    </div>

                    <button className="report-btn" onClick={() => alert('Reported for review. Admin will check this request.')}>
                        Report Suspicious Activity
                    </button>

                    <div className="disclaimer-text">
                        * Verify the recipient before sending money. Platform is not responsible for transactions.
                    </div>


                </div>
            ) : (
                routeInfo && selectedRequest && (
                    <div className="route-info-panel">
                        <h4>🗺️ Navigation to Victim</h4>
                        <div className="route-details">
                            <div className="route-detail-item">
                                <span className="route-label">Distance:</span>
                                <span className="route-value">{formatDistance(routeInfo.distance)}</span>
                            </div>
                            <div className="route-detail-item">
                                <span className="route-label">Estimated Time:</span>
                                <span className="route-value">{formatDuration(routeInfo.duration)}</span>
                            </div>
                            <div className="route-detail-item">
                                <span className="route-label">Destination:</span>
                                <span className="route-value">{selectedRequest.location.address}</span>
                            </div>
                        </div>
                        <button
                            className="open-maps-btn"
                            onClick={() => {
                                if (userLocation) {
                                    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedRequest.location.lat},${selectedRequest.location.lng}&travelmode=driving`
                                    window.open(url, '_blank')
                                }
                            }}
                        >
                            Open in Google Maps
                        </button>
                    </div>
                )
            )}
        </div>
    )
}

export default ReliefMap
