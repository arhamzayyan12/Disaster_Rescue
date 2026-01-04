import React from 'react'
import { ReliefRequest } from '../../types/relief'
import ReliefMap from '../ReliefMap'

interface VolunteerDashboardProps {
    requests: ReliefRequest[]
    filteredRequests: ReliefRequest[]
    filter: string
    setFilter: (f: 'all' | 'pending' | 'in-progress' | 'fulfilled') => void
    handleAction: (req: ReliefRequest) => void
    userLocation?: { lat: number; lng: number }
    selectedRequest: ReliefRequest | null
    setSelectedRequest: (req: ReliefRequest | null) => void
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
    filteredRequests,
    filter,
    setFilter,
    handleAction,
    userLocation,
    selectedRequest,
    setSelectedRequest
}) => {
    return (
        <div className="volunteer-dashboard-container">
            <div className="volunteer-header">
                <h1>Volunteer Dashboard</h1>
                <p>Manage and respond to active help requests.</p>
            </div>

            <div className="volunteer-grid">
                {/* Left: Request Management */}
                <div className="requests-column">
                    <div className="filter-tabs">
                        {(['all', 'pending', 'in-progress', 'fulfilled'] as const).map(f => (
                            <button
                                key={f}
                                className={`filter-tab ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="requests-table-container">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>Request Type</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(req => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="font-medium text-white">{req.type.charAt(0).toUpperCase() + req.type.slice(1)}</div>
                                            <div className="text-xs text-gray-500">{req.urgency.toUpperCase()}</div>
                                        </td>
                                        <td>{req.location.address?.slice(0, 20)}...</td>
                                        <td>
                                            <span className={`status-badge ${req.status}`}>
                                                {req.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn"
                                                onClick={() => handleAction(req)}
                                            >
                                                {req.type === 'monetary'
                                                    ? 'View QR Code'
                                                    : req.status === 'pending'
                                                        ? 'Accept Request'
                                                        : req.status === 'in-progress'
                                                            ? 'Mark Complete'
                                                            : 'View Details'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Map */}
                <div className="map-column">
                    <h3 className="text-white font-bold text-lg">Relief Map</h3>
                    <div className="map-card">
                        <ReliefMap
                            requests={filteredRequests}
                            userLocation={userLocation}
                            selectedRequest={selectedRequest}
                            onRequestSelect={setSelectedRequest}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(VolunteerDashboard)
