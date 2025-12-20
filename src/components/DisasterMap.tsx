import { useMemo, useEffect, useState, memo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet'

import L from 'leaflet'
import { Disaster, Shelter } from '../types'
import { fetchShelters } from '../services/shelter-service'
import DisasterDetailsPanel from './DisasterDetailsPanel'
import {
  getDisasterIconName,
  getDisasterTypeColor,
  getSeverityColor
} from '../utils/disaster-utils'
import { useDisasterProcessor, EnrichedDisaster } from '../hooks/useDisasterProcessor'

import './DisasterMap.css'


// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Center on India
const defaultCenter: [number, number] = [20.5937, 78.9629]
const defaultZoom = 5

interface DisasterMapProps {
  disasters: Disaster[]
  layers: {
    weather: boolean
    disasters: boolean
    shelters: boolean
  }
  selectedDisaster: Disaster | null
  onDisasterSelect: (disaster: Disaster | null) => void
  onToggleShelterLayer: () => void
  activeFilter: string
}



// --- OPTIMIZATION: Icon Caching & Helpers defined outside component ---

// Icon Cache to prevent recreating L.divIcon on every render
const iconCache: Record<string, L.DivIcon> = {};

const getDisasterIcon = (disaster: Disaster | EnrichedDisaster) => {
  // Normalize type to lowercase to ensure matching
  const type = (disaster as EnrichedDisaster).smartAnalysis?.effectiveType?.toLowerCase() || disaster.type.toLowerCase();
  const key = `${type}-${disaster.severity}`;

  if (!iconCache[key]) {
    const iconName = getDisasterIconName(type);
    const typeColor = getDisasterTypeColor(type);
    const severityColor = getSeverityColor(disaster.severity);

    // For white/light backgrounds (like coldwave), use dark icon text
    const isLightBackground = type === 'coldwave' || type === 'fog' || type === 'snow';
    const iconTextColor = isLightBackground ? '#333' : 'white';

    const iconHtml = `
      <div style="
        background-color: ${typeColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid ${severityColor};
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${iconTextColor};
      ">
        <span class="material-symbols-outlined" style="font-size: 20px;">${iconName}</span>
      </div>
    `
    iconCache[key] = L.divIcon({
      className: 'custom-disaster-marker',
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }

  return iconCache[key];
}

const getShelterIcon = (amenity: string = 'general') => {
  const normAmenity = amenity.toLowerCase();

  let iconName = 'cottage';
  let color = '#2196F3'; // Default blue

  if (normAmenity.includes('school')) {
    iconName = 'school';
    color = '#4CAF50'; // Green for schools
  } else if (normAmenity.includes('hospital') || normAmenity.includes('clinic')) {
    iconName = 'local_hospital';
    color = '#F44336'; // Red for medical
  } else if (normAmenity.includes('worship')) {
    iconName = 'account_balance';
    color = '#9C27B0'; // Purple for religious centers
  } else if (normAmenity.includes('community')) {
    iconName = 'groups';
    color = '#FF9800'; // Orange for community centers
  }

  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    ">
      <span class="material-symbols-outlined" style="font-size: 18px;">${iconName}</span>
    </div>
  `;

  return L.divIcon({
    className: 'custom-shelter-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Keep createShelterIcon for backward compatibility or simple usage
const createShelterIcon = (amenity?: string) => getShelterIcon(amenity);





// Component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number] | null, zoom: number }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      // Validate coordinates before flying to them
      const [lat, lng] = center
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        try {
          map.flyTo(center, zoom, {
            duration: 1.5
          })
        } catch (error) {
          console.error('Error flying to coordinates:', { lat, lng, error })
        }
      } else {
        console.warn('Invalid coordinates detected, skipping map navigation:', { lat, lng })
      }
    }
    // Ensure map renders correctly
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [center, zoom, map])

  return null
}

const DisasterMap: React.FC<DisasterMapProps> = memo(({
  disasters,
  layers,
  selectedDisaster,
  onDisasterSelect,
  onToggleShelterLayer,
  activeFilter
}) => {
  const [showWindMap, setShowWindMap] = useState(false)

  // 1. PERFORMANCE: Process data ONCE when props change
  // This hook ensures we don't recalculate smart types on every render/scroll
  const enrichedDisasters = useDisasterProcessor(disasters);

  // Safely compute map center from selectedDisaster
  const mapCenter = useMemo((): [number, number] | null => {
    if (!selectedDisaster) return null

    const lat = selectedDisaster.location.lat
    const lng = selectedDisaster.location.lng

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      console.warn('Selected disaster has invalid coordinates:', {
        id: selectedDisaster.id,
        location: selectedDisaster.location
      })
      return null
    }

    return [lat, lng]
  }, [selectedDisaster])


  // Filter disasters based on active layers and active filter
  const displayedDisasters = useMemo(() => {
    return enrichedDisasters.filter(d => {
      // Layer filtering
      const isWeather = d.severity === 'low' || d.severity === 'medium'
      const isDisaster = d.severity === 'high' || d.severity === 'critical'

      let layerVisible = false
      if (layers.weather && isWeather) layerVisible = true
      if (layers.disasters && isDisaster) layerVisible = true

      if (!layerVisible) return false

      // Active Filter logic
      if (activeFilter === 'total') return true
      if (activeFilter === 'critical' && d.severity === 'critical') return true
      if (activeFilter === 'high' && d.severity === 'high') return true
      if (activeFilter === 'active' && d.status === 'active') return true

      // If filter is specific but doesn't match, hide it
      if (activeFilter !== 'total') return false

      return true
    })
  }, [enrichedDisasters, layers, activeFilter])



  const [shelters, setShelters] = useState<Shelter[]>([])
  const [isLoadingShelters, setIsLoadingShelters] = useState(false)

  // Fetch shelters when layer is active
  useEffect(() => {
    if (layers.shelters) {
      setIsLoadingShelters(true)

      // Determine search center and target population
      const lat = selectedDisaster ? selectedDisaster.location.lat : defaultCenter[0]
      const lng = selectedDisaster ? selectedDisaster.location.lng : defaultCenter[1]
      const population = selectedDisaster?.affectedPeople || 250 // Tactical default if unknown

      fetchShelters(lat, lng, population)
        .then(data => {
          setShelters(data)
          setIsLoadingShelters(false)
        })
        .catch(err => {
          console.error('Error fetching shelters:', err)
          setIsLoadingShelters(false)
        })
    } else {
      setShelters([])
    }
  }, [layers.shelters, selectedDisaster])

  return (
    <div className="disaster-map-container">
      {/* Map Controls Overlay */}
      <div className="map-controls-overlay">
        <button
          className={`wind-toggle-btn ${showWindMap ? 'active' : ''}`}
          onClick={() => setShowWindMap(!showWindMap)}
        >
          {showWindMap ? '❌ Close Wind Map' : '🌪️ Live Cyclone View'}
        </button>
      </div>

      {showWindMap ? (
        <div className="wind-map-frame">
          <iframe
            width="100%"
            height="100%"
            src="https://embed.windy.com/embed2.html?lat=22.0&lon=80.0&detailLat=22.0&detailLon=80.0&width=650&height=450&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
            frameBorder="0"
            title="Live Wind Map"
          ></iframe>
        </div>
      ) : (
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>



          <MapUpdater
            center={mapCenter}
            zoom={selectedDisaster ? 9 : defaultZoom}
          />
          {displayedDisasters
            .filter((disaster) => {
              // Filter out disasters with invalid coordinates
              const lat = disaster.location.lat
              const lng = disaster.location.lng
              const isValid = !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
              if (!isValid) {
                console.warn('Skipping marker for disaster with invalid coordinates:', disaster.id, { lat, lng })
              }
              return isValid
            })
            .map((disaster) => (
              <Marker
                key={disaster.id}
                title={(disaster as EnrichedDisaster).smartAnalysis?.effectiveType || disaster.type}
                position={[disaster.location.lat, disaster.location.lng]}
                icon={getDisasterIcon(disaster)}
                eventHandlers={{
                  click: () => onDisasterSelect(disaster)
                }}
              >
                <Popup>
                  <div className="info-window-content">
                    <h3 style={{ borderBottom: `3px solid ${getSeverityColor(disaster.severity)}`, paddingBottom: '5px' }}>
                      {(disaster as EnrichedDisaster).smartAnalysis?.label || disaster.type.toUpperCase()}
                    </h3>
                    {(disaster as EnrichedDisaster).smartAnalysis && (
                      <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                        AI Confidence: {Math.round((disaster as EnrichedDisaster).smartAnalysis.confidence * 100)}%
                      </div>
                    )}
                    <p><strong>Location:</strong> {disaster.location.name}</p>
                    <p><strong>Severity:</strong> {disaster.severity.toUpperCase()}</p>
                    <p>{disaster.description.substring(0, 100)}...</p>
                  </div>
                </Popup>
              </Marker>
            ))}



          {layers.shelters && shelters
            .filter((shelter) => {
              // Filter out shelters with invalid coordinates
              const lat = shelter.location.lat
              const lng = shelter.location.lng
              const isValid = !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
              if (!isValid) {
                console.warn('Skipping marker for shelter with invalid coordinates:', shelter.id, { lat, lng })
              }
              return isValid
            })
            .map((shelter) => (
              <Marker
                key={shelter.id}
                position={[shelter.location.lat, shelter.location.lng]}
                icon={createShelterIcon(shelter.facilities?.[0] || 'general')}
              >
                <Popup>
                  <div className="info-window-content">
                    <h3>🏥 {shelter.name}</h3>
                    <p>{shelter.location.address}</p>
                    <p><strong>Capacity:</strong> {shelter.currentOccupancy}/{shelter.capacity}</p>
                    <p><strong>Contact:</strong> {shelter.contact}</p>
                    <button
                      className="popup-navigate-btn"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shelter.location.lat},${shelter.location.lng}`, '_blank')}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>directions</span>
                      Navigate
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

        </MapContainer >
      )}

      {
        isLoadingShelters && !showWindMap && (
          <div className="map-loading-indicator" style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid #333',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Searching for shelters...
          </div>
        )
      }

      {
        selectedDisaster && !showWindMap && (
          <DisasterDetailsPanel
            disaster={selectedDisaster}
            onClose={() => onDisasterSelect(null)}
            showShelters={layers.shelters}
            onToggleShelters={onToggleShelterLayer}
            nearbyShelters={shelters}
            isLoadingShelters={isLoadingShelters}
          />
        )
      }
    </div >
  )
})

export default DisasterMap
