import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface LoginProps {
    onSwitchToSignup: () => void
    onClose?: () => void
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onClose }) => {
    const { login } = useAuth()
    const toast = useToast()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const success = await login(formData.email, formData.password)

            if (success) {
                toast.success('Sync Successful: Welcome Back')
                onClose?.()
            } else {
                toast.error('Identity Mismatch: Invalid credentials')
            }
        } catch (error) {
            toast.error('Network Error: Sync failed')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-badge">
                        <span className="material-symbols-outlined">lock_open</span>
                    </div>
                    <h2>Operative Login</h2>
                    <p>Enter your credentials to access the hub</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                        <label htmlFor="password">Security Protocol</label>
                        <div className="input-wrapper">
                            <span className="material-symbols-outlined input-icon">key</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <div className="btn-loading">
                                <span className="spinner-small"></span>
                                VERIFYING...
                            </div>
                        ) : (
                            <>
                                ACCESS COMMAND
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New operative? <button onClick={onSwitchToSignup} className="auth-link-btn">CREATE PROFILE</button></p>
                </div>

                <div className="auth-demo-info">
                    <p className="demo-tag">TRUSTED ACCESS</p>
                    <div className="demo-pills">
                        <button type="button" onClick={() => setFormData({ email: 'volunteer@demo.com', password: 'demo123' })}>DEMO VOLUNTEER</button>
                        <button type="button" onClick={() => setFormData({ email: 'victim@demo.com', password: 'demo123' })}>DEMO AFFECTED</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
