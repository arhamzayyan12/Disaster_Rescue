import React from 'react'
import { motion } from 'framer-motion'
import { Disaster } from '../types'
import { getSmartDisasterDetails } from '../utils/smart-detection'
import './NewsTicker.css'

interface NewsTickerProps {
    disasters: Disaster[]
    onDisasterSelect: (disaster: Disaster) => void
}

const NewsTicker: React.FC<NewsTickerProps> = ({ disasters, onDisasterSelect }) => {
    // Filter for meaningful updates
    const updates = disasters.slice(0, 10).map(d => {
        const { displayTitle } = getSmartDisasterDetails(d)
        return {
            id: d.id,
            original: d,
            text: `${displayTitle} reported in ${d.location.state} • Severity: ${d.severity.toUpperCase()}`
        }
    })

    if (updates.length === 0) return null

    return (
        <div className="news-ticker-container">
            <div className="ticker-label">
                <span className="material-symbols-outlined">sensors</span>
                LIVE UPDATES
            </div>
            <div className="ticker-track">
                <motion.div
                    className="ticker-content"
                    animate={{ x: '-100%' }}
                    transition={{
                        duration: 200,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {/* Duplicate sequence for seamless loop */}
                    {[...updates, ...updates].map((update, idx) => (
                        <div
                            key={`${update.id}-${idx}`}
                            className="ticker-item clickable"
                            onClick={() => onDisasterSelect(update.original)}
                        >
                            <span className="ticker-bullet"></span>
                            {update.text}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default NewsTicker
