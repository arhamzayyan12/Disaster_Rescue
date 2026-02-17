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
        wildfires: boolean
    }
    onToggleLayer: (layer: 'weather' | 'disasters' | 'shelters' | 'wildfires') => void
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
        backgroundColor: '#0a0c10',
        color: '#fff',
        flexDirection: 'column',
        gap: '10px'
    }}>
        <div className="spinner" style={{
            width: '30px',
            height: '30px',
            border: '3px solid #333',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }}></div>
        <span>Syncing Map Intel...</span>
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

    const handleNeedHelpLocal = () => {
        handleDismissHub()
        onNeedHelp()
    }

    const handleCanHelpLocal = () => {
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
        <div className="map-dashboard-container flex" style={{ height: '100%', width: '100%', position: 'relative' }}>
            {/* Desktop Sidebar */}
            <div className="hidden md:block" style={{ width: '380px', flexShrink: 0 }}>
                <Sidebar
                    stats={stats}
                    layers={layers}
                    onToggleLayer={onToggleLayer}
                    recentAlerts={recentAlerts}
                    onAlertClick={(d) => onDisasterSelect(d)}
                    activeFilter={activeFilter}
                    onStatClick={handleStatClick}
                />
            </div>

            {/* Main Map Content */}
            <div className="flex-1 relative overflow-hidden">
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

                {/* Mobile Floating Stats Summary (Minimalist) */}
                <div className="md:hidden absolute flex" style={{
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    gap: '0.5rem',
                    width: '90%',
                    pointerEvents: 'none'
                }}>
                    <div className="flex-1 flex flex-col items-center" style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '0.75rem'
                    }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Critical</span>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#f43f5e' }}>{stats.critical}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center" style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '0.75rem'
                    }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Active</span>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#60a5fa' }}>{stats.active}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center" style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '0.75rem'
                    }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Total</span>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff' }}>{stats.total}</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showHub && (
                    <EmergencyActionHub
                        onNeedHelp={handleNeedHelpLocal}
                        onCanHelp={handleCanHelpLocal}
                        onDismiss={handleDismissHub}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default MapDashboard
