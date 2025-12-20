import React, { Suspense, lazy } from 'react'
import Sidebar from './Sidebar'
import EmergencyActionHub from './EmergencyActionHub'
import { Disaster } from '../types'
import { AnimatePresence } from 'framer-motion'

// Lazy load DisasterMap to reduce initial bundle size (Leaflet is heavy)
const DisasterMap = lazy(() => import('./DisasterMap'))

interface MapDashboardProps {
    disasters: Disaster[]
    selectedDisaster: Disaster | null
    onDisasterSelect: (disaster: Disaster | null) => void
    layers: {
        weather: boolean
        disasters: boolean
        shelters: boolean
    }
    onToggleLayer: (layer: 'weather' | 'disasters' | 'shelters') => void
    onNeedHelp: () => void
    onCanHelp: () => void
}

const MapLoading = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: '#f5f5f5',
        color: '#666',
        flexDirection: 'column',
        gap: '10px'
    }}>
        <div className="spinner" style={{
            width: '30px',
            height: '30px',
            border: '3px solid #ddd',
            borderTop: '3px solid #2196F3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}></div>
        <span>Loading Map...</span>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
)

const MapDashboard: React.FC<MapDashboardProps> = ({
    disasters,
    selectedDisaster,
    onDisasterSelect,
    layers,
    onToggleLayer,
    onNeedHelp,
    onCanHelp
}) => {
    const [showHub, setShowHub] = React.useState(false)

    React.useEffect(() => {
        const hasSeenHub = sessionStorage.getItem('hasSeenEmergencyHub')
        if (!hasSeenHub) {
            setShowHub(true)
        }
    }, [])

    const handleDismissHub = () => {
        setShowHub(false)
        sessionStorage.setItem('hasSeenEmergencyHub', 'true')
    }

    const handleNeedHelp = () => {
        handleDismissHub()
        onNeedHelp()
    }

    const handleCanHelp = () => {
        handleDismissHub()
        onCanHelp()
    }


    const [activeFilter, setActiveFilter] = React.useState<string>('total')

    // Calculate stats
    const stats = React.useMemo(() => {
        return {
            total: disasters.length,
            critical: disasters.filter(d => d.severity === 'critical').length,
            high: disasters.filter(d => d.severity === 'high').length,
            active: disasters.filter(d => d.status === 'active').length
        }
    }, [disasters])

    // Get recent alerts
    const recentAlerts = React.useMemo(() => {
        return [...disasters]
            .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
            .slice(0, 10)
    }, [disasters])



    const handleStatClick = (filter: string) => {
        setActiveFilter(prev => prev === filter ? 'total' : filter)
    }

    return (
        <div className="map-dashboard-container" style={{ display: 'flex', height: '100%', width: '100%' }}>
            <Sidebar
                stats={stats}
                layers={layers}
                onToggleLayer={onToggleLayer}
                recentAlerts={recentAlerts}
                onAlertClick={onDisasterSelect}
                activeFilter={activeFilter}
                onStatClick={handleStatClick}
            />
            <div style={{ flex: 1, position: 'relative' }}>
                <Suspense fallback={<MapLoading />}>
                    <DisasterMap
                        disasters={disasters}
                        layers={layers}
                        selectedDisaster={selectedDisaster}
                        onDisasterSelect={onDisasterSelect}
                        onToggleShelterLayer={() => onToggleLayer('shelters')}
                        activeFilter={activeFilter}
                    />
                </Suspense>
            </div>

            <AnimatePresence>
                {showHub && (
                    <EmergencyActionHub
                        onNeedHelp={handleNeedHelp}
                        onCanHelp={handleCanHelp}
                        onDismiss={handleDismissHub}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default MapDashboard
