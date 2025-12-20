import React, { useState } from 'react'
import { useAuth, SignupData } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface SignupProps {
    onSwitchToLogin: () => void
    onClose?: () => void
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onClose }) => {
    const { signup } = useAuth()
    const toast = useToast()
    const [formData, setFormData] = useState<SignupData>({
        name: '',
        email: '',
        password: '',
        role: 'volunteer'
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password.length < 6) {
            toast.warning('Security: Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const success = await signup(formData)

            if (success) {
                toast.success('Strategy Activated: Welcome to the Network')
                onClose?.()
            } else {
                toast.error('Identity Conflict: This email is already registered')
            }
        } catch (error) {
            toast.error('Sync Failure: Connection lost during registration')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card signup-card">
                <div className="auth-header">
                    <div className="auth-icon-badge">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <h2>New Operative</h2>
                    <p>Register your credentials to join response teams</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Identity</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">badge</span>
                            <input
                                id="name"
                                type="text"
                                placeholder="Commander Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Global Registry Email</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">alternate_email</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@domain.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Security Protocol (Password)</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">key</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="role-selector">
                        <label>Mission Focus</label>
                        <div className="role-options">
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'volunteer' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                            >
                                <span className="material-symbols-outlined">volunteer_activism</span>
                                Volunteer
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'victim' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'victim' })}
                            >
                                <span className="material-symbols-outlined">emergency_record</span>
                                Affected
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <div className="btn-loading">
                                <span className="spinner-small"></span>
                                INITIALIZING...
                            </div>
                        ) : (
                            <>
                                ACTIVATE IDENTITY
                                <span className="material-symbols-outlined">bolt</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Registered already? <button onClick={onSwitchToLogin} className="auth-link-btn">ACCESS HUB</button></p>
                </div>
            </div>
        </div>
    )
}

export default Signup
