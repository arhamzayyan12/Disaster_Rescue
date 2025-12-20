import React, { useState, useEffect } from 'react'
import { ReliefRequest, ReliefRequestType, RequestUrgency } from '../types/relief'
import {
    getAllReliefRequests,
    createReliefRequest,
    respondToRequest,
    fulfillRequest
} from '../services/relief-service'
import ReliefMap from './ReliefMap'
import QRCodeDisplayModal from './QRCodeDisplayModal'
import { useToast } from './Toast'
import { useAuth } from '../contexts/AuthContext'
import './ReliefDashboard.css'

interface ReliefDashboardProps {
    userLocation?: { lat: number; lng: number }
    initialMode?: UserMode
}

type UserMode = 'victim' | 'volunteer'

const ReliefDashboard: React.FC<ReliefDashboardProps> = ({ userLocation, initialMode }) => {
    const toast = useToast()
    const { user, isAuthenticated } = useAuth()
    const [mode, setMode] = useState<UserMode>(initialMode || user?.role || 'volunteer')

    useEffect(() => {
        if (initialMode) {
            setMode(initialMode)
        }
    }, [initialMode])

    const [requests, setRequests] = useState<ReliefRequest[]>([])
    // const [loading, setLoading] = useState(true) // Removed unused state
    const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'fulfilled'>('pending')
    const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null)
    const [showQRModal, setShowQRModal] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        type: 'food' as ReliefRequestType,
        urgency: 'high' as RequestUrgency,
        victimName: '',
        victimContact: '',
        address: '',
        description: '',
        amount: '',
        upiId: '',
        qrCodeImage: ''
    })

    useEffect(() => {
        if (user) {
            setMode(user.role)
        }
    }, [user])

    useEffect(() => {
        loadRequests()
        const interval = setInterval(loadRequests, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const loadRequests = async () => {
        // setLoading(true)
        try {
            const data = await getAllReliefRequests()
            // Filter financial requests to only show verified ones for volunteers
            // In a real app backend would handle this, but for now we filter client side for volunteer view
            // Actually, we'll filter in the render logic or here. 
            // Let's keep all requests in state and filter in the view.
            setRequests(data)
        } catch (error) {
            console.error('Failed to load relief requests:', error)
        } finally {
            // setLoading(false)
        }
    }

    const filteredRequests = requests.filter(req => {
        // Show all requests regardless of verification status
        if (filter === 'all') return true
        return req.status === filter
    })



    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated || !user) {
            toast.warning('Please login to submit a relief request')
            return
        }

        if (formData.type === 'monetary') {

            if (parseInt(formData.amount) <= 0) {
                toast.error('Amount must be greater than 0')
                return
            }
        }

        const loc = userLocation || { lat: 20.5937, lng: 78.9629 }

        try {
            await createReliefRequest({
                type: formData.type,
                urgency: formData.urgency,
                victimName: user.name || formData.victimName,
                victimContact: formData.victimContact,
                location: {
                    lat: loc.lat,
                    lng: loc.lng,
                    address: formData.address || '',
                },
                title: `${formData.type === 'monetary' ? 'Financial Aid' : formData.type + ' Assistance'}`,
                description: formData.description,
                quantity: formData.type === 'monetary' ? `₹${formData.amount}` : '1',
                verificationStatus: 'verified',
                amount: formData.amount,
                upiId: formData.upiId,
                qrCodeImage: formData.qrCodeImage
            })
            toast.success('Request submitted successfully.')
            loadRequests()
            // Reset form
            setFormData({
                type: 'food' as ReliefRequestType,
                urgency: 'high' as RequestUrgency,
                victimName: '',
                victimContact: '',
                address: '',
                description: '',
                amount: '',
                upiId: '',
                qrCodeImage: ''
            })
        } catch (error) {
            toast.error('Failed to submit request')
        }
    }

    const handleAction = async (req: ReliefRequest) => {
        if (!isAuthenticated || !user) return toast.warning('Login required')

        // For monetary requests, just show the QR code modal
        // Don't change status since payment happens externally
        if (req.type === 'monetary') {
            setSelectedRequest(req)
            setShowQRModal(true)
            return
        }

        // For non-monetary requests, handle status changes
        if (req.status === 'pending') {
            await respondToRequest(req.id, user.id, user.name, '')
            toast.success('You are now assigned to this request')
            loadRequests()
        } else if (req.status === 'in-progress') {
            // Mark as fulfilled
            try {
                await fulfillRequest(req.id)
                toast.success('Request marked as fulfilled')
                loadRequests()
            } catch (error) {
                toast.error('Failed to update request')
            }
        }
    }

    return (
        <div className="relief-dashboard">
            {/* Mode Toggle Header */}
            <div className="mode-toggle-wrapper relative">
                <div className="mode-toggle-inner">
                    <div
                        className={`mode-toggle-option ${mode === 'victim' ? 'active' : ''}`}
                        onClick={() => setMode('victim')}
                    >
                        I Need Help
                    </div>
                    <div
                        className={`mode-toggle-option ${mode === 'volunteer' ? 'active' : ''}`}
                        onClick={() => setMode('volunteer')}
                    >
                        I Can Help
                    </div>
                </div>

            </div>

            <div className="relief-content">
                {mode === 'victim' ? (
                    <div className="request-help-container">
                        <div className="request-content-wrapper">
                            <div className="page-heading">
                                <h1 className="page-title">Request Assistance</h1>
                                <p className="page-subtitle">Your safety is our priority. Connect with verified volunteers in minutes.</p>
                            </div>

                            {/* Trust Banner */}
                            <div className="trust-banner">
                                <div className="trust-item">
                                    <span className="material-symbols-outlined">verified_user</span>
                                    <span>Verified Responders</span>
                                </div>
                                <div className="trust-item">
                                    <span className="material-symbols-outlined">lock</span>
                                    <span>End-to-End Encryption</span>
                                </div>
                                <div className="trust-item">
                                    <span className="material-symbols-outlined">bolt</span>
                                    <span>Average 4m Response</span>
                                </div>
                            </div>

                            <form className="mt-6" onSubmit={handleSubmitRequest}>
                                {/* Needs */}
                                <div className="form-section">
                                    <h2 className="form-section-title">What do you need?</h2>
                                    <div className="needs-grid">
                                        {[
                                            { id: 'monetary', label: 'Financial Aid', icon: 'payments' },
                                            { id: 'food', label: 'Food', icon: 'restaurant' },
                                            { id: 'medical', label: 'Medical', icon: 'medical_services' },
                                            { id: 'rescue', label: 'Rescue', icon: 'sos' },
                                            { id: 'shelter', label: 'Shelter', icon: 'cottage' }
                                        ].map(item => (
                                            <div
                                                key={item.id}
                                                className={`need-card ${formData.type === item.id ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, type: item.id as ReliefRequestType })}
                                            >
                                                <span className="material-symbols-outlined need-icon">{item.icon}</span>
                                                <span className="need-label">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {formData.type === 'monetary' && (
                                    <div className="form-section">
                                        <h2 className="form-section-title">Financial Details</h2>
                                        <div className="input-padding">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount Required (INR)</label>
                                                    <input
                                                        className="text-input"
                                                        type="number"
                                                        placeholder="e.g. 5000"
                                                        value={formData.amount}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value)
                                                            if (val < 0) return
                                                            setFormData({ ...formData, amount: e.target.value })
                                                        }}
                                                        required={formData.type === 'monetary'}
                                                    />
                                                </div>
                                            </div>

                                            {/* QR Code Display (Permanent) */}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Scan to Donate
                                                </label>
                                                <div className="flex justify-center p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <img
                                                        src="/src/assets/donation-qr.png"
                                                        alt="Donation QR Code"
                                                        className="w-48 h-48 object-contain rounded-lg"
                                                    />
                                                </div>
                                                {/* Hidden input to maintain form data structure if needed, or update logic to use static QR */}
                                            </div>

                                            <div className="mt-3 text-xs text-secondary opacity-70 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <span className="material-symbols-outlined text-blue-400" style={{ fontSize: '16px' }}>info</span>
                                                    <div>
                                                        <p className="font-medium text-blue-300 mb-1">Payment Disclaimer</p>
                                                        <p className="text-gray-400">
                                                            Payments are made directly via UPI apps. This platform does not handle or verify transactions.
                                                            Upload your QR code so helpers can scan and send money directly to you.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                <div className="form-section">
                                    <h2 className="form-section-title">Where are you?</h2>
                                    <div className="input-padding">
                                        <input
                                            className="text-input"
                                            placeholder="Enter your address or drop a pin"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                        <button type="button" className="location-btn" onClick={() => {
                                            if (userLocation) setFormData({ ...formData, address: `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}` })
                                        }}>
                                            <span className="material-symbols-outlined">my_location</span>
                                            Use my current location
                                        </button>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="form-section">
                                    <h2 className="form-section-title">How can we reach you?</h2>
                                    <div className="input-padding">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                                <input
                                                    className="text-input"
                                                    value={formData.victimName}
                                                    onChange={e => setFormData({ ...formData, victimName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Number</label>
                                                <input
                                                    className="text-input"
                                                    value={formData.victimContact}
                                                    onChange={e => setFormData({ ...formData, victimContact: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Urgency */}
                                <div className="form-section">
                                    <h2 className="form-section-title">How urgent is it?</h2>
                                    <div className="urgency-container">
                                        <div className="urgency-selector">
                                            {['critical', 'high', 'medium'].map(u => (
                                                <div
                                                    key={u}
                                                    className={`urgency-option ${u} ${formData.urgency === u ? 'selected' : ''}`}
                                                    onClick={() => setFormData({ ...formData, urgency: u as RequestUrgency })}
                                                >
                                                    {u.charAt(0).toUpperCase() + u.slice(1)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="form-section">
                                    <h2 className="form-section-title">Additional Details</h2>
                                    <div className="input-padding">
                                        <textarea
                                            className="textarea-input"
                                            rows={4}
                                            placeholder={formData.type === 'monetary' ? "Explain why you need financial aid..." : "Describe situation..."}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="submit-container">
                                    <button type="submit" className="submit-btn highlight">Submit Request</button>
                                    <p className="privacy-note">
                                        <span className="material-symbols-outlined">shield</span>
                                        Your request is shared anonymously until a verified volunteer accepts.
                                    </p>
                                </div>
                            </form>

                            {/* Impact Section */}
                            <div className="impact-section">
                                <h2 className="section-subtitle">Real-Time Impact</h2>
                                <div className="impact-grid">
                                    <div className="impact-card">
                                        <h3>4.2k</h3>
                                        <p>Rescues Finalized</p>
                                    </div>
                                    <div className="impact-card active">
                                        <h3>128</h3>
                                        <p>Active Missions</p>
                                    </div>
                                    <div className="impact-card">
                                        <h3>15</h3>
                                        <p>Relief Camps</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Volunteer Mode
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
                                <h3 className="text-white fo nt-bold text-lg">Relief Map</h3>
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
                )}
            </div>

            {/* QR Code Display Modal */}
            {showQRModal && selectedRequest && (
                <QRCodeDisplayModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowQRModal(false)
                        setSelectedRequest(null)
                    }}
                />
            )}
        </div>
    )
}

export default ReliefDashboard
