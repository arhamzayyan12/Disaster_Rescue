import React, { useMemo } from 'react'
import { Disaster } from '../types'
import { getDisasterTypeColor as getTypeColor, getSeverityColor } from '../utils/disaster-utils'
import { useRelief } from '../contexts/ReliefContext'
import './DisasterAnalytics.css'

interface DisasterAnalyticsProps {
    disasters: Disaster[]
}

const DisasterAnalytics: React.FC<DisasterAnalyticsProps> = ({ disasters }) => {
    const { requests } = useRelief()

    // Aggregate Data
    const totalIncidents = disasters.length
    const activeIncidents = useMemo(() =>
        disasters.filter(d => d.status === 'active').length
        , [disasters])

    // Calculate funds from real-time context
    const { fundsRaised, fundingGoal } = useMemo(() => {
        const raised = requests
            .filter(r => r.status === 'fulfilled' && r.amount)
            .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

        const goal = requests
            .filter(r => r.status !== 'cancelled' && r.amount)
            .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

        return { fundsRaised: raised, fundingGoal: goal }
    }, [requests])

    // Type Breakdown
    const typeCounts = useMemo(() => disasters.reduce((acc, curr) => {
        const type = curr.type.charAt(0).toUpperCase() + curr.type.slice(1)
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {} as Record<string, number>), [disasters])

    // Sort states
    const locationCounts = useMemo(() => disasters.reduce((acc, curr) => {
        const loc = curr.location.name || curr.location.state || 'Unknown'
        acc[loc] = (acc[loc] || 0) + 1
        return acc
    }, {} as Record<string, number>), [disasters])

    const topLocations = useMemo(() => Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5), [locationCounts])

    // Calculate Affected Areas (unique locations)
    const affectedAreas = Object.keys(locationCounts).length

    const maxCount = useMemo(() => Math.max(...Object.values(typeCounts), 1), [typeCounts])

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h2 className="page-title">
                        <span className="material-symbols-outlined text-blue-500">analytics</span>
                        Disaster Analytics
                    </h2>
                    <p className="page-subtitle">Real-time analysis of ongoing disaster situations.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <span className="kpi-label">Total Incidents</span>
                    <span className="kpi-value">{totalIncidents}</span>
                    <span className="kpi-trend neutral">
                        <span className="material-symbols-outlined text-sm">update</span>
                        Live Data
                    </span>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Active Alerts</span>
                    <span className="kpi-value">{activeIncidents}</span>
                    <span className="kpi-trend neutral">
                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                        Live Updates
                    </span>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Affected Areas</span>
                    <span className="kpi-value">{affectedAreas}</span>
                    <span className="kpi-label text-xs mt-1">across {Object.keys(locationCounts).length} regions</span>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Relief Funds Raised</span>
                    <span className="kpi-value">₹{fundsRaised.toLocaleString()}</span>
                    <span className="kpi-trend neutral">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Goal: ₹{fundingGoal.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="charts-grid">
                {/* Disaster Type Distribution */}
                <div className="chart-card">
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

                {/* Most Affected Regions */}
                <div className="chart-card">
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
            </div>

            {/* Live Feed Table */}
            <div className="table-card">
                <h3 className="section-title">Recent Critical Incidents</h3>
                <div className="table-responsive">
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
                            {disasters.slice(0, 10).map(d => (
                                <tr key={d.id}>
                                    <td data-label="Status">
                                        <span className={`status-dot ${d.severity}`}></span>
                                        {d.status.toUpperCase()}
                                    </td>
                                    <td data-label="Type">{d.type.charAt(0).toUpperCase() + d.type.slice(1)}</td>
                                    <td data-label="Location">{d.location.name}, {d.location.state}</td>
                                    <td data-label="Reported">{new Date(d.reportedAt).toLocaleDateString()}</td>
                                    <td data-label="Severity" style={{ color: getSeverityColor(d.severity) }}>
                                        {d.severity.toUpperCase()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default DisasterAnalytics
