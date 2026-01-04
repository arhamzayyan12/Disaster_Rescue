import React from 'react'
import { ReliefRequestType, RequestUrgency } from '../../types/relief'
import QRCodeUpload from '../QRCodeUpload'
import ImpactSection from './ImpactSection'

interface VictimFormProps {
    formData: any
    setFormData: (data: any) => void
    onSubmit: (e: React.FormEvent) => void
    userLocation?: { lat: number; lng: number }
    onQRCodeUpload: (image: string) => void
    onQRCodeRemove: () => void
}

const VictimForm: React.FC<VictimFormProps> = ({
    formData,
    setFormData,
    onSubmit,
    userLocation,
    onQRCodeUpload,
    onQRCodeRemove
}) => {
    return (
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

                <form className="mt-6" onSubmit={onSubmit}>
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
                                <button
                                    type="button"
                                    key={item.id}
                                    className={`need-card ${formData.type === item.id ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, type: item.id as ReliefRequestType })}
                                    aria-pressed={formData.type === item.id}
                                    aria-label={`Select ${item.label} assistance`}
                                >
                                    <span className="material-symbols-outlined need-icon">{item.icon}</span>
                                    <span className="need-label">{item.label}</span>
                                </button>
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

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Upload UPI QR Code (Google Pay / PhonePe / Paytm)
                                    </label>
                                    <QRCodeUpload
                                        onImageUpload={onQRCodeUpload}
                                        onImageRemove={onQRCodeRemove}
                                        currentImage={formData.qrCodeImage}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Your QR code is backed up to your account securely.
                                    </p>
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
                                    <button
                                        type="button"
                                        key={u}
                                        className={`urgency-option ${u} ${formData.urgency === u ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, urgency: u as RequestUrgency })}
                                        aria-pressed={formData.urgency === u}
                                    >
                                        {u.charAt(0).toUpperCase() + u.slice(1)}
                                    </button>
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

                <ImpactSection />
            </div>
        </div>
    )
}

export default React.memo(VictimForm)
