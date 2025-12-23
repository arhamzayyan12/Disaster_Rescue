import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './Toast'
import './Auth.css'

interface SignupProps {
    onSwitchToLogin: () => void // Kept for interface compatibility but unused in this new flow
    onClose?: () => void
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onClose }) => {
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
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        setLoading(true)
                        const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value
                        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
                        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value

                        if (!email || !password || !name) {
                            toast.error('Please fill in all fields')
                            setLoading(false)
                            return
                        }

                        if (password.length < 6) {
                            toast.error('Password must be at least 6 characters')
                            setLoading(false)
                            return
                        }

                        try {
                            await (useAuth() as any).signUpWithEmail(email, password, name)
                            if (onClose) onClose()
                            toast.success('Account created! Please check your email to verify.')
                        } catch (error: any) {
                            toast.error(error.message || 'Signup failed')
                        } finally {
                            setLoading(false)
                        }
                    }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <span className="material-symbols-outlined input-icon">badge</span>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password (min 6 chars)"
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
                                    Creating Account...
                                </div>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <span className="material-symbols-outlined">person_add</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

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

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="auth-link-btn"
                    >
                        Sign in
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

export default Signup
