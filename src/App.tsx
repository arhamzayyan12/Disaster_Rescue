import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import Header, { TabType } from './components/Header'
import MapDashboard from './components/MapDashboard'
import AuthModal from './components/AuthModal'
import NewsTicker from './components/NewsTicker'
import { Disaster } from './types'

import { fetchAllDisasters } from './services/disaster-data-service'
import './App.css'

// Lazy load heavy components
const ReliefDashboard = lazy(() => import('./components/ReliefDashboard'))
const SafetyGuidelines = lazy(() => import('./components/SafetyGuidelines'))
const LiveNews = lazy(() => import('./components/LiveNews'))
const DisasterAnalytics = lazy(() => import('./components/DisasterAnalytics'))

// Loading Fallback
const LoadingSpinner = () => (
  <div className="premium-loader-container">
    <div className="premium-spinner"></div>
    <p>Synchronizing Rescue Data...</p>
  </div>
)

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map')
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [reliefMode, setReliefMode] = useState<'victim' | 'volunteer' | undefined>()

  const [layers, setLayers] = useState({
    weather: true,
    disasters: true,
    shelters: false
  })

  const handleToggleLayer = (layer: 'weather' | 'disasters' | 'shelters') => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Could not get user location:', error)
          // Default to India center
          setUserLocation({ lat: 20.5937, lng: 78.9629 })
        }
      )
    } else {
      // Default to India center
      setUserLocation({ lat: 20.5937, lng: 78.9629 })
    }
  }, [])

  // Track if relief tab has been loaded
  const [reliefLoaded, setReliefLoaded] = useState(false)

  useEffect(() => {
    if (activeTab === 'relief' && !reliefLoaded) {
      setReliefLoaded(true)
    }
  }, [activeTab, reliefLoaded])

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchAllDisasters()
      if (data.length > 0) {
        setDisasters(data)
      }
    } catch (error) {
      console.error('Failed to fetch disasters:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 600000) // 10 mins
    return () => clearInterval(interval)
  }, [fetchData])

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <main className={`main-content ${['guidelines', 'news'].includes(activeTab) ? 'scrollable' : ''}`}>
        {/* Map View - Keep outside Suspense to prevent unmounting/remounting issues */}
        <div style={{ display: activeTab === 'map' ? 'block' : 'none', height: '100%', width: '100%' }}>
          <MapDashboard
            disasters={disasters}
            selectedDisaster={selectedDisaster}
            onDisasterSelect={setSelectedDisaster}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onNeedHelp={() => {
              setReliefMode('victim')
              setActiveTab('relief')
            }}
            onCanHelp={() => {
              setReliefMode('volunteer')
              setActiveTab('relief')
            }}
          />
        </div>

        {/* Relief View - Keep alive after first load */}
        <div style={{ display: activeTab === 'relief' ? 'block' : 'none', height: '100%', width: '100%' }}>
          {(activeTab === 'relief' || reliefLoaded) && (
            <Suspense fallback={<LoadingSpinner />}>
              <ReliefDashboard userLocation={userLocation} initialMode={reliefMode} />
            </Suspense>
          )}
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <DisasterAnalytics disasters={disasters} />
          )}

          {/* Guidelines View */}
          {activeTab === 'guidelines' && (
            <SafetyGuidelines />
          )}

          {/* News View */}
          {activeTab === 'news' && (
            <LiveNews
              disasters={disasters}
              isLoading={isLoading}
              onDisasterSelect={(disaster) => {
                // Validate coordinates before selecting disaster
                const lat = disaster.location.lat
                const lng = disaster.location.lng

                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                  setSelectedDisaster(disaster)
                  setActiveTab('map')
                  // Auto-enable shelters layer when selecting from news
                  setLayers(prev => ({ ...prev, shelters: true }))
                } else {
                  console.error('Cannot navigate to disaster with invalid coordinates:', disaster)
                  alert('Unable to show this location on the map. The coordinates are invalid.')
                }
              }}
            />
          )}
        </Suspense>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />

      {/* Global Intel Ticker */}
      <NewsTicker
        disasters={disasters}
        onDisasterSelect={(disaster) => {
          setSelectedDisaster(disaster)
          setActiveTab('map')
          setLayers(prev => ({ ...prev, shelters: true }))
        }}
      />
    </div >
  )
}

export default App
