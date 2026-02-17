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
                {[
                    { label: 'Total Incidents', value: totalIncidents, icon: 'analytics', sub: 'Live Data', color: 'accent' },
                    { label: 'Active Alerts', value: activeIncidents, icon: 'notifications_active', sub: 'Urgent', color: 'rose' },
                    { label: 'Affected Regions', value: affectedAreas, icon: 'public', sub: `${Object.keys(locationCounts).length} zones`, color: 'amber' },
                    { label: 'Relief Funds', value: `₹${fundsRaised.toLocaleString()}`, icon: 'payments', sub: `Goal: ₹${fundingGoal.toLocaleString()}`, color: 'emerald' }
                ].map((kpi, i) => (
                    <div key={i} className="kpi-card premium">
                        <div className="kpi-header">
                            <span className="material-symbols-outlined kpi-icon">{kpi.icon}</span>
                            <span className="kpi-label">{kpi.label}</span>
                        </div>
                        <div className="kpi-body">
                            <span className="kpi-value">{kpi.value}</span>
                            <span className="kpi-subtext">{kpi.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                {/* Disaster Type Distribution */}
                <div className="chart-card glass">
                    <h3 className="section-title">Type Distribution</h3>
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
                <div className="chart-card glass">
                    <h3 className="section-title">Priority Locations</h3>
                    <div className="bar-chart-container">
                        {topLocations.map(([loc, count]) => (
                            <div key={loc} className="bar-item">
                                <span className="bar-label">{loc}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${(count / (topLocations[0]?.[1] || 1)) * 100}%`,
                                            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
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
            <div className="table-card glass">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="section-title mb-0">Operational Log</h3>
                    <span className="text-[10px] text-muted font-black tracking-widest uppercase">Last 10 Major Events</span>
                </div>
                <div className="table-responsive">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Incident</th>
                                <th>Regional Zone</th>
                                <th>Timestamp</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disasters.slice(0, 10).map(d => (
                                <tr key={d.id}>
                                    <td data-label="Status">
                                        <div className="flex items-center gap-2">
                                            <span className={`status-dot ${d.severity}`}></span>
                                            <span className="font-bold">{d.status.toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td data-label="Incident" className="font-heading font-bold">{d.type.charAt(0).toUpperCase() + d.type.slice(1)}</td>
                                    <td data-label="Regional Zone" className="text-secondary">{d.location.name}, {d.location.state}</td>
                                    <td data-label="Timestamp" className="text-muted text-sm">{new Date(d.reportedAt).toLocaleDateString()}</td>
                                    <td data-label="Priority">
                                        <span className="priority-tag" style={{ color: getSeverityColor(d.severity), borderColor: `${getSeverityColor(d.severity)}33` }}>
                                            {d.severity.toUpperCase()}
                                        </span>
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
