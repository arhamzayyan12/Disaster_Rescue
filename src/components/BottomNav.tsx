import React from 'react'
import { motion } from 'framer-motion'
import { TabType } from './Header'
import { useAuth } from '../contexts/AuthContext'
import './BottomNav.css'

interface BottomNavProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
    onLoginClick: () => void
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onLoginClick }) => {
    const { isAuthenticated } = useAuth()

    const navItems = [
        { id: 'map', icon: 'map', label: 'Map' },
        { id: 'news', icon: 'notifications_active', label: 'Alerts' },
        { id: 'relief', icon: 'volunteer_activism', label: 'Relief' },
    ]

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => onTabChange(item.id as TabType)}
                >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {activeTab === item.id && (
                        <motion.div
                            layoutId="bottom-nav-indicator"
                            className="active-indicator"
                        />
                    )}
                </button>
            ))}
            <button
                className="nav-item"
                onClick={isAuthenticated ? () => onTabChange('analytics') : onLoginClick}
            >
                <span className="material-symbols-outlined">
                    {isAuthenticated ? 'analytics' : 'account_circle'}
                </span>
                <span className="nav-label">{isAuthenticated ? 'Stats' : 'Login'}</span>
            </button>
        </nav>
    )
}

export default BottomNav
