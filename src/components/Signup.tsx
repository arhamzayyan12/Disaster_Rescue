import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface SignupProps {
    onSwitchToLogin: () => void // Kept for interface compatibility but unused in this new flow
    onClose?: () => void
}

const Signup: React.FC<SignupProps> = ({ }) => {
    const { signInWithGoogle } = useAuth()
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleGoogleSignup = async () => {
        setLoading(true)
        try {
            await signInWithGoogle()
            // Redirect happens automatically to Google/Supabase
        } catch (error) {
            console.error(error)
            toast.error('Failed to initiate Google Signup')
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-badge">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <h2>Create Account</h2>
                    <p>Join with your Google account to get started</p>
                </div>

                <div className="auth-form">
                    <button
                        onClick={handleGoogleSignup}
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
                                Sign up with Google
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

export default Signup
