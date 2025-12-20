import React from 'react'
import { Disaster } from '../types'
import { getDisasterTypeColor as getTypeColor, getSeverityColor } from '../utils/disaster-utils'
import './DisasterStatsModal.css'

interface DisasterStatsModalProps {
    isOpen: boolean
    onClose: () => void
    disasters: Disaster[]
}

const DisasterStatsModal: React.FC<DisasterStatsModalProps> = ({ isOpen, onClose, disasters }) => {
    if (!isOpen) return null

    // Aggregate Data
    const totalIncidents = disasters.length
    const activeIncidents = React.useMemo(() =>
        disasters.filter(d => d.status === 'active').length
        , [disasters])

    // Mock Data for "Story" elements - Memoized to prevent random values changing on re-render
    const { livesImpacted, fundsRaised } = React.useMemo(() => ({
        livesImpacted: Math.floor(totalIncidents * 1240),
        fundsRaised: Math.floor(totalIncidents * 5.2)
    }), [totalIncidents])

    // Type Breakdown
    const typeCounts = React.useMemo(() => disasters.reduce((acc, curr) => {
        const type = curr.type.charAt(0).toUpperCase() + curr.type.slice(1)
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {} as Record<string, number>), [disasters])

    // Sort states
    const locationCounts = React.useMemo(() => disasters.reduce((acc, curr) => {
        const loc = curr.location.name || curr.location.state || 'Unknown'
        acc[loc] = (acc[loc] || 0) + 1
        return acc
    }, {} as Record<string, number>), [disasters])

    const topLocations = React.useMemo(() => Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5), [locationCounts])

    const maxCount = React.useMemo(() => Math.max(...Object.values(typeCounts), 1), [typeCounts])

    return (
        <div className="stats-modal-overlay" onClick={onClose}>
            <div className="stats-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="stats-header">
                    <h2>
                        <span className="material-symbols-outlined text-3xl text-blue-500">analytics</span>
                        National Disaster Analytics
                    </h2>
                    <button className="close-stats-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="stats-content">
                    {/* KPI Cards */}
                    <div className="kpi-card">
                        <span className="kpi-label">Total Incidents</span>
                        <span className="kpi-value">{totalIncidents}</span>
                        <span className="kpi-trend up">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            +12% vs last month
                        </span>
                    </div>

                    <div className="kpi-card">
                        <span className="kpi-label">Active Alerts</span>
                        <span className="kpi-value">{activeIncidents}</span>
                        <span className="kpi-trend down">
                            <span className="material-symbols-outlined text-sm">trending_down</span>
                            -5% since yesterday
                        </span>
                    </div>

                    <div className="kpi-card">
                        <span className="kpi-label">Lives Impacted (Est.)</span>
                        <span className="kpi-value">{livesImpacted.toLocaleString()}</span>
                        <span className="kpi-label text-xs mt-1">across {Object.keys(locationCounts).length} regions</span>
                    </div>

                    <div className="kpi-card">
                        <span className="kpi-label">Relief Funds Raised</span>
                        <span className="kpi-value">₹{fundsRaised}Cr</span>
                        <span className="kpi-trend up">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Goal: ₹{(fundsRaised * 1.5).toFixed(1)}Cr
                        </span>
                    </div>

                    {/* Charts */}
                    <div className="chart-section half">
                        <h3 className="section-title">Disaster Type Distribution</h3>
                        <div className="bar-chart-container">
                            {Object.entries(typeCounts).map(([type, count]) => (
                                <div key={type} className="bar-item">
                                    <span className="bar-label">{type}</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${(count / maxCount) * 100}%`,
                                                backgroundColor: getTypeColor(type)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="bar-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-section half">
                        <h3 className="section-title">Most Affected Regions</h3>
                        <div className="bar-chart-container">
                            {topLocations.map(([loc, count]) => (
                                <div key={loc} className="bar-item">
                                    <span className="bar-label">{loc}</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${(count / (topLocations[0]?.[1] || 1)) * 100}%`,
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="bar-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Feed Table */}
                    <div className="chart-section full">
                        <h3 className="section-title">Recent Critical Incidents</h3>
                        <div className="overflow-x-auto">
                            <table className="events-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Type</th>
                                        <th>Location</th>
                                        <th>Reported</th>
                                        <th>Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disasters.slice(0, 5).map(d => (
                                        <tr key={d.id}>
                                            <td>
                                                <span className={`status-dot ${d.severity}`}></span>
                                                {d.status.toUpperCase()}
                                            </td>
                                            <td>{d.type.charAt(0).toUpperCase() + d.type.slice(1)}</td>
                                            <td>{d.location.name}, {d.location.state}</td>
                                            <td>{new Date(d.reportedAt).toLocaleDateString()}</td>
                                            <td style={{ color: getSeverityColor(d.severity) }}>
                                                {d.severity.toUpperCase()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helpers
// Using centralized utils now
export default DisasterStatsModal
