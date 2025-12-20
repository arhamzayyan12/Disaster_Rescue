import React from 'react'
import { motion } from 'framer-motion'
import { Disaster } from '../types'
import './Sidebar.css'

interface SidebarProps {
    stats: {
        total: number
        critical: number
        high: number
        active: number
    }
    layers: {
        weather: boolean
        disasters: boolean
        shelters: boolean
    }
    onToggleLayer: (layer: 'weather' | 'disasters' | 'shelters') => void
    recentAlerts: Disaster[]
    onAlertClick: (disaster: Disaster) => void
    activeFilter: string
    onStatClick: (filter: string) => void
    onOpenStats: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
    stats,
    layers,
    onToggleLayer,
    recentAlerts,
    onAlertClick,
    activeFilter,
    onStatClick,
    onOpenStats
}) => {
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr)
        const diffMs = new Date().getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        return `${Math.floor(diffHours / 24)} days ago`
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                {/* Operational Overview Section */}
                <div className="sidebar-section">
                    <div className="section-header flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <h3>Global Status Monitor</h3>
                            <span className="text-[10px] text-muted uppercase tracking-widest -mt-1 font-bold">Resilience & Response Index</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded transition-colors"
                            onClick={onOpenStats}
                        >
                            <span className="material-symbols-outlined text-sm">hub</span>
                            Command Center
                        </motion.button>
                    </div>
                    <div className="stats-grid">
                        {[
                            { id: 'total', label: 'Incidents Managed', value: stats.total, className: '' },
                            { id: 'critical', label: 'Tier 1 Crisis', value: stats.critical, className: 'critical' },
                            { id: 'high', label: 'Priority Alerts', value: stats.high, className: 'high' },
                            { id: 'active', label: 'Sectors Active', value: stats.active, className: 'active-now' }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`stat-card ${stat.className} ${activeFilter === stat.id ? 'active' : ''}`}
                                onClick={() => onStatClick(stat.id)}
                            >
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Map Layers Section */}
                <div className="sidebar-section">
                    <h3>Map Layers</h3>
                    <div className="layer-list">
                        {(['disasters', 'weather', 'shelters'] as const).map((layer, index) => (
                            <motion.label
                                key={layer}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="layer-item"
                            >
                                <input
                                    type="checkbox"
                                    className="layer-checkbox"
                                    checked={layers[layer]}
                                    onChange={() => onToggleLayer(layer)}
                                />
                                <p className="layer-text">{layer.charAt(0).toUpperCase() + layer.slice(1)}</p>
                            </motion.label>
                        ))}
                    </div>
                </div>

                {/* Latest Alerts Section */}
                <div className="sidebar-section">
                    <h3>Latest Alerts</h3>
                    <div className="alert-list">
                        {recentAlerts.map((alert, index) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                whileHover={{ x: 5 }}
                                className={`alert-item ${alert.severity}`}
                                onClick={() => onAlertClick(alert)}
                            >
                                <span className={`alert-dot ${alert.severity}`}></span>
                                <div className="alert-content">
                                    <p className="alert-title">
                                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert - {alert.location.state}
                                    </p>
                                    <p className="alert-time">{formatTimeAgo(alert.reportedAt)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}


export default Sidebar
