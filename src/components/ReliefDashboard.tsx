import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ReliefRequest, ReliefRequestType, RequestUrgency } from '../types/relief'
import {
    createReliefRequest,
    respondToRequest,
    fulfillRequest,
    getUserProfile,
    updateUserProfile
} from '../services/relief-service'
import VictimForm from './relief/VictimForm'
import VolunteerDashboard from './relief/VolunteerDashboard'
import QRCodeDisplayModal from './QRCodeDisplayModal'
import { useToast } from './Toast'
import { useAuth } from '../contexts/AuthContext'
import { useRelief } from '../contexts/ReliefContext'
import './ReliefDashboard.css'

interface ReliefDashboardProps {
    userLocation?: { lat: number; lng: number }
    initialMode?: UserMode
}

type UserMode = 'victim' | 'volunteer'

const ReliefDashboard: React.FC<ReliefDashboardProps> = ({ userLocation, initialMode }) => {
    const toast = useToast()
    const { user, isAuthenticated, loading } = useAuth()
    const { requests, loading: requestsLoading, refreshRequests: loadRequests } = useRelief()

    const [mode, setMode] = useState<UserMode>(initialMode || user?.role || 'volunteer')
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
        if (initialMode) {
            setMode(initialMode)
        }
    }, [initialMode])

    useEffect(() => {
        if (user) {
            setMode(user.role)
            // Load saved QR code from Cloud Profile
            const loadProfile = async () => {
                const profile = await getUserProfile(user.id)
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        qrCodeImage: profile.qr_code_image || prev.qrCodeImage,
                        upiId: profile.upi_id || prev.upiId
                    }))
                }
            }
            loadProfile()
        }
    }, [user])

    const filteredRequests = useMemo(() => requests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
    }), [requests, filter])

    const handleSubmitRequest = useCallback(async (e: React.FormEvent) => {
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
            // No need to call loadRequests manually as subscription will handle it, 
            // but calling it once doesn't hurt for immediate feedback
            loadRequests()

            // Reset form
            setFormData(prev => ({
                ...prev,
                type: 'food' as ReliefRequestType,
                urgency: 'high' as RequestUrgency,
                address: '',
                description: '',
                amount: '',
            }))
        } catch (error) {
            toast.error('Failed to submit request')
        }
    }, [isAuthenticated, user, formData, userLocation, toast, loadRequests])

    const handleAction = useCallback(async (req: ReliefRequest) => {
        if (!isAuthenticated || !user) return toast.warning('Login required')

        if (req.type === 'monetary') {
            setSelectedRequest(req)
            setShowQRModal(true)
            return
        }

        if (req.status === 'pending') {
            await respondToRequest(req.id, user.id, user.name, '')
            toast.success('You are now assigned to this request')
            loadRequests()
        } else if (req.status === 'in-progress') {
            try {
                await fulfillRequest(req.id)
                toast.success('Request marked as fulfilled')
                loadRequests()
            } catch (error) {
                toast.error('Failed to update request')
            }
        }
    }, [isAuthenticated, user, toast, loadRequests])

    const handleQRCodeUpload = useCallback((base64Image: string) => {
        setFormData(prev => ({ ...prev, qrCodeImage: base64Image }))
        if (user?.id) {
            updateUserProfile(user.id, { qr_code_image: base64Image })
                .then(() => toast.success('QR Code saved to your cloud profile'))
                .catch(() => toast.error('Failed to save to cloud profile'))
        }
    }, [user, toast])

    const handleQRCodeRemove = useCallback(() => {
        setFormData(prev => ({ ...prev, qrCodeImage: '' }))
        if (user?.id) {
            updateUserProfile(user.id, { qr_code_image: '' })
        }
    }, [user])

    return (
        <div className="relief-dashboard">
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
                {(loading || (requestsLoading && requests.length === 0)) ? (
                    <div className="flex flex-col items-center justify-center h-full pb-20">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-medium">Synchronizing Rescue Data...</p>
                    </div>
                ) : mode === 'victim' ? (
                    <VictimForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmitRequest}
                        userLocation={userLocation}
                        onQRCodeUpload={handleQRCodeUpload}
                        onQRCodeRemove={handleQRCodeRemove}
                    />
                ) : (
                    !isAuthenticated ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                            <div className="bg-blue-500/10 p-6 rounded-full">
                                <span className="material-symbols-outlined text-blue-400" style={{ fontSize: '48px' }}>secure</span>
                            </div>
                            <h2 className="text-3xl font-bold font-outfit">Volunteer Access Restricted</h2>
                            <p className="text-gray-400 max-w-md">
                                You must be a verified user to access the responder network and view sensitive relief request data.
                            </p>
                            <button
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25"
                                onClick={() => toast.error('Please click "Login" in the top right corner.')}
                            >
                                Login to Respond
                            </button>
                        </div>
                    ) : (
                        <VolunteerDashboard
                            requests={requests}
                            filteredRequests={filteredRequests}
                            filter={filter}
                            setFilter={setFilter}
                            handleAction={handleAction}
                            userLocation={userLocation}
                            selectedRequest={selectedRequest}
                            setSelectedRequest={setSelectedRequest}
                        />
                    )
                )}
            </div>

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

export default React.memo(ReliefDashboard)
