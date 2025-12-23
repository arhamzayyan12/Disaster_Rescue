import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface LoginProps {
    onSwitchToSignup?: () => void // Kept for interface compatibility but unused
    onClose?: () => void
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onClose }) => {
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
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        setLoading(true)
                        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
                        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

                        // Basic validation
                        if (!email || !password) {
                            toast.error('Please fill in all fields')
                            setLoading(false)
                            return
                        }

                        try {
                            await (useAuth() as any).signInWithEmail(email, password)
                            if (onClose) onClose()
                            toast.success('Logged in successfully')
                        } catch (error: any) {
                            toast.error(error.message || 'Login failed')
                        } finally {
                            setLoading(false)
                        }
                    }}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">mail</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">lock</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="btn-loading">
                                    <span className="spinner-small"></span>
                                    Signing In...
                                </div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="material-symbols-outlined">login</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

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

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="auth-link-btn"
                    >
                        Sign up
                    </button>
                </p>

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
