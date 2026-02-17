import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import Header, { TabType } from './components/Header'
import MapDashboard from './components/MapDashboard'
import AuthModal from './components/AuthModal'
import NewsTicker from './components/NewsTicker'
import { Disaster } from './types'

import { fetchAllDisasters, subscribeToDisasters } from './services/disaster-data-service'
import { FirmsIngestionService } from './services/firms-service'
import { Analytics } from '@vercel/analytics/react'
import { ReliefProvider } from './contexts/ReliefContext'
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

import BottomNav from './components/BottomNav'

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
    shelters: false,
    wildfires: true
  })

  const handleToggleLayer = useCallback((layer: 'weather' | 'disasters' | 'shelters' | 'wildfires') => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  const handleLoginClick = useCallback(() => {
    setShowAuthModal(true)
  }, [])

  const handleAuthModalClose = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  const handleDisasterSelect = useCallback((disaster: Disaster | null) => {
    setSelectedDisaster(disaster)
  }, [])

  const handleNeedHelp = useCallback(() => {
    setReliefMode('victim')
    setActiveTab('relief')
  }, [])

  const handleCanHelp = useCallback(() => {
    setReliefMode('volunteer')
    setActiveTab('relief')
  }, [])

  const handleNewsDisasterSelect = useCallback((disaster: Disaster) => {
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
  }, [])

  const handleTickerDisasterSelect = useCallback((disaster: Disaster) => {
    setSelectedDisaster(disaster)
    setActiveTab('map')
    setLayers(prev => ({ ...prev, shelters: true }))
  }, [])

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

  // Auto-refresh & Real-time Sync
  useEffect(() => {
    fetchData()

    // 1. Subscribe to real-time database changes (Triggered by FIRMS or Admin)
    const subscription = subscribeToDisasters((payload) => {
      console.log('🌍 Real-time Disaster Sync:', payload.eventType)
      fetchData() // Simple re-fetch for UI consistency
    })

    // 2. NASA FIRMS Periodic Ingestion
    // Note: In production, this poller should run in a backend worker/Edge Function.
    // We implement it here to satisfy the "Autonomous Intelligence" requirement for the demo.
    const runFirmsIngest = () => {
      FirmsIngestionService.ingestWildfireData()
    }

    runFirmsIngest() // Initial run
    const firmsInterval = setInterval(runFirmsIngest, 15 * 60 * 1000) // Every 15 mins
    const dataInterval = setInterval(fetchData, 600000) // Every 10 mins

    return () => {
      subscription.unsubscribe()
      clearInterval(firmsInterval)
      clearInterval(dataInterval)
    }
  }, [fetchData])

  return (
    <ReliefProvider>
      <div className="app-container">
        {!showAuthModal && (
          <Header
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLoginClick={handleLoginClick}
          />
        )}

        {!showAuthModal && (
          <main className={`main-content ${['news', 'analytics', 'relief'].includes(activeTab) ? 'scrollable' : ''}`}>
            {/* Map View - Keep outside Suspense to prevent unmounting/remounting issues */}
            <div className={activeTab === 'map' ? 'flex-1 flex' : 'hidden'} style={{ height: '100%', width: '100%' }}>
              <MapDashboard
                disasters={disasters}
                selectedDisaster={selectedDisaster}
                onDisasterSelect={handleDisasterSelect}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onNeedHelp={handleNeedHelp}
                onCanHelp={handleCanHelp}
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
                  onDisasterSelect={handleNewsDisasterSelect}
                />
              )}
            </Suspense>
          </main>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode="login"
        />

        {/* Global Intel Ticker - Modified to sit above bottom nav on mobile */}
        {!showAuthModal && (
          <NewsTicker
            disasters={disasters}
            onDisasterSelect={handleTickerDisasterSelect}
          />
        )}

        {/* Mobile Bottom Navigation */}
        {!showAuthModal && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLoginClick={handleLoginClick}
          />
        )}

        {/* Vercel Analytics */}
        <Analytics />
      </div >
    </ReliefProvider>
  )
}

export default App
