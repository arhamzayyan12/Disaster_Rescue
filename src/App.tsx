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
import BottomNav from './components/BottomNav'
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

interface LayersState {
  weather: boolean
  disasters: boolean
  shelters: boolean
  wildfires: boolean
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map')
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [reliefMode, setReliefMode] = useState<'victim' | 'volunteer' | undefined>()

  const [layers, setLayers] = useState<LayersState>({
    weather: true,
    disasters: true,
    shelters: false,
    wildfires: true
  })

  const handleToggleLayer = useCallback((layer: keyof LayersState) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
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
    const lat = disaster.location.lat
    const lng = disaster.location.lng

    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      setSelectedDisaster(disaster)
      setActiveTab('map')
      setLayers((prev) => ({ ...prev, shelters: true }))
    } else {
      console.error('Cannot navigate to disaster with invalid coordinates:', disaster)
      alert('Unable to show this location on the map. The coordinates are invalid.')
    }
  }, [])

  const handleTickerDisasterSelect = useCallback((disaster: Disaster) => {
    setSelectedDisaster(disaster)
    setActiveTab('map')
    setLayers((prev) => ({ ...prev, shelters: true }))
  }, [])

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()

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
          setUserLocation({ lat: 20.5937, lng: 78.9629 })
        }
      )
    } else {
      setUserLocation({ lat: 20.5937, lng: 78.9629 })
    }
  }, [])

  const [reliefLoaded, setReliefLoaded] = useState(false)

  useEffect(() => {
    if (activeTab === 'relief' && !reliefLoaded) {
      setReliefLoaded(true)
    }
  }, [activeTab, reliefLoaded])

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

  useEffect(() => {
    fetchData()
    const subscription = subscribeToDisasters(() => {
      fetchData()
    })

    const runFirmsIngest = () => {
      FirmsIngestionService.ingestWildfireData()
    }

    runFirmsIngest()
    const firmsInterval = setInterval(runFirmsIngest, 15 * 60 * 1000)
    const dataInterval = setInterval(fetchData, 600000)

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

            <div style={{ display: activeTab === 'relief' ? 'block' : 'none', height: '100%', width: '100%' }}>
              {(activeTab === 'relief' || reliefLoaded) && (
                <Suspense fallback={<LoadingSpinner />}>
                  <ReliefDashboard userLocation={userLocation} initialMode={reliefMode} />
                </Suspense>
              )}
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === 'analytics' && (
                <DisasterAnalytics disasters={disasters} />
              )}
              {activeTab === 'guidelines' && (
                <SafetyGuidelines />
              )}
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

        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode="login"
        />

        {!showAuthModal && (
          <NewsTicker
            disasters={disasters}
            onDisasterSelect={handleTickerDisasterSelect}
          />
        )}

        {!showAuthModal && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLoginClick={handleLoginClick}
          />
        )}

        <Analytics />
      </div>
    </ReliefProvider>
  )
}

export default App
