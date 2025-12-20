import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface LoginProps {
    onSwitchToSignup?: () => void // Kept for interface compatibility but unused
    onClose?: () => void
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const { signInWithGoogle } = useAuth()
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
            // Redirect happens automatically to Google/Supabase
        } catch (error) {
            console.error(error)
            toast.error('Failed to initiate Google Login')
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
                    <h2>Welcome to Disaster Rescue</h2>
                    <p>Sign in with your Google account to continue</p>
                </div>

                <div className="auth-form">
                    <button
                        onClick={handleGoogleLogin}
                        className="google-auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="btn-loading">
                                <span className="spinner-small"></span>
                                Connecting...
                            </div>
                        ) : (
                            <>
                                <img
                                    src="https://www.google.com/favicon.ico"
                                    alt="Google"
                                    className="google-icon"
                                />
                                Continue with Google
                            </>
                        )}
                    </button>
                </div>

                <div className="auth-footer">
                    <p className="text-secondary text-sm">
                        By continuing, you verify that you are a trusted entity.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
