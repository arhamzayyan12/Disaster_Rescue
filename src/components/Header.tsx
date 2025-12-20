import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

export type TabType = 'map' | 'relief' | 'guidelines' | 'news'

interface HeaderProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
    onLoginClick: () => void
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onLoginClick }) => {
    const { user, isAuthenticated, logout } = useAuth()

    const navItems: Array<{ id: TabType; label: string }> = [
        { id: 'map', label: 'Map Dashboard' },
        { id: 'relief', label: 'Relief Network' },
        { id: 'guidelines', label: 'Safety Guide' },
        { id: 'news', label: 'Live News' },
    ]

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="header-logo-icon">
                    <span className="material-symbols-outlined font-black" style={{ fontSize: '24px' }}>hub</span>
                </div>
                <div className="flex flex-col gap-0">
                    <h2 className="header-title">DISASTER RESCUE</h2>
                    <span className="text-[10px] text-muted -mt-1 font-bold tracking-tighter uppercase opacity-80">Global Strategic Operations</span>
                </div>
                <div className="status-badge-container ml-6 hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                    <span className="dot pulse-green w-1.5 h-1.5 rounded-full"></span>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Network Active</span>
                </div>
            </div>

            <div className="header-right">
                <div className="nav-links">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                            style={{ position: 'relative' }}
                        >
                            {item.label}
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="header-active-tab"
                                    className="active-tab-indicator"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {isAuthenticated && user ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="header-login-btn logout"
                        onClick={logout}
                    >
                        Logout
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="header-login-btn"
                        onClick={onLoginClick}
                    >
                        Login/Signup
                    </motion.button>
                )}
            </div>
        </header>
    )
}

export default Header

