import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import './Auth.css'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: 'login' | 'signup'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="auth-modal-overlay" onClick={handleBackdropClick}>
            <div style={{ position: 'relative' }}>
                <button className="auth-modal-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                {mode === 'login' ? (
                    <Login
                        onSwitchToSignup={() => setMode('signup')}
                        onClose={onClose}
                    />
                ) : (
                    <Signup
                        onSwitchToLogin={() => setMode('login')}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    )
}

export default AuthModal
