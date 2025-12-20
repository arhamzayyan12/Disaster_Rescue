import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Disaster, DisasterType } from '../types'
import Skeleton from './Skeleton'
import './LiveNews.css'

interface NewsArticle {
    id: string
    title: string
    description: string
    source: string
    publishedAt: string
    link: string
    disaster?: Disaster
    imageUrl?: string
}

interface LiveNewsProps {
    disasters: Disaster[]
    isLoading: boolean
    onDisasterSelect: (disaster: Disaster) => void
}

import { getSmartDisasterDetails } from '../utils/smart-detection'

const LiveNews: React.FC<LiveNewsProps> = ({ disasters, isLoading, onDisasterSelect }) => {
    const [selectedType, setSelectedType] = useState<DisasterType | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const news = React.useMemo(() => {
        const newsArticles: NewsArticle[] = disasters.map(disaster => {
            const { displayTitle, image, effectiveType } = getSmartDisasterDetails(disaster)

            // Debug: Check for invalid coordinates
            const lat = disaster.location.lat
            const lng = disaster.location.lng
            if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                console.error('LiveNews: Disaster with invalid coordinates detected:', {
                    id: disaster.id,
                    title: displayTitle,
                    location: disaster.location,
                    lat,
                    lng
                })
            }

            return {
                id: disaster.id,
                title: displayTitle,
                description: disaster.description,
                source: 'NDMA SACHET Alert System',
                publishedAt: disaster.reportedAt,
                link: '#',
                disaster: { ...disaster, type: effectiveType as DisasterType },
                imageUrl: image
            }
        })

        return newsArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    }, [disasters])

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr)
        const diffMs = new Date().getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours} hours ago`
        return `${Math.floor(diffHours / 24)} days ago`
    }

    // Filter news
    const filteredNews = news.filter(article => {
        const matchesType = selectedType === 'all' || article.disaster?.type === selectedType
        const matchesSearch = searchQuery === '' ||
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesType && matchesSearch
    })

    const disasterTypes: Array<{ value: DisasterType | 'all'; label: string; }> = [
        { value: 'all', label: 'All' },
        { value: 'flood', label: 'Floods' },
        { value: 'earthquake', label: 'Earthquakes' },
        { value: 'cyclone', label: 'Cyclones' },
        { value: 'fire', label: 'Wildfires' },
    ]

    return (
        <div className="live-news-container">
            <div className="layout-content-container">
                {/* Intelligence Header */}
                <div className="intelligence-header">
                    <h1 className="header-title">Strategic Intelligence Feed</h1>
                    <p className="text-muted text-sm font-bold uppercase tracking-widest">Centralized Verification: Active</p>
                </div>

                {/* Tactical Stats Section */}
                <div className="stats-row">
                    <div className="news-stat-card">
                        <p className="news-stat-label">Tactical Alerts</p>
                        <p className="news-stat-value">{disasters.length}</p>
                    </div>
                    <div className="news-stat-card">
                        <p className="news-stat-label">Tier 1 Incidents</p>
                        <p className="news-stat-value">{disasters.filter(d => d.severity === 'critical').length}</p>
                    </div>
                    <div className="news-stat-card">
                        <p className="news-stat-label">Operational Zones</p>
                        <p className="news-stat-value">{new Set(disasters.map(d => d.location.state)).size}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="filters-row">
                    <div className="search-container">
                        <div className="search-wrapper">
                            <div className="search-icon-wrapper">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="search-input"
                                placeholder="Search by location or keyword..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-pills">
                        {disasterTypes.map(type => (
                            <button
                                key={type.value}
                                className={`filter-pill ${selectedType === type.value ? 'active' : 'inactive'}`}
                                onClick={() => setSelectedType(type.value)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News Feed */}
                <div className="news-list">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            // Skeleton Loading State
                            [...Array(4)].map((_, i) => (
                                <div key={`skeleton-${i}`} className="news-card skeleton-card">
                                    <Skeleton variant="rectangular" height="200px" width="100%" />
                                    <div className="news-content">
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="text" width="90%" height="24px" />
                                        <Skeleton variant="text" width="100%" height="60px" />
                                        <div className="news-actions">
                                            <Skeleton variant="rectangular" width="100px" height="32px" />
                                            <Skeleton variant="rectangular" width="120px" height="32px" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredNews.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="no-news-message"
                            >
                                No updates found for your selection.
                            </motion.p>
                        ) : (
                            filteredNews.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="news-card"
                                    data-severity={article.disaster?.severity}
                                >
                                    <div
                                        className="news-image"
                                        style={{ backgroundImage: `url("${article.imageUrl}")` }}
                                    ></div>
                                    <div className="news-content">
                                        <p className="news-meta-info">
                                            {formatTimeAgo(article.publishedAt)} - {article.disaster?.location.name}, {article.disaster?.location.state}
                                        </p>
                                        <p className="news-title">{article.title}</p>
                                        <p className="news-description">{article.description}</p>
                                        <div className="news-actions">
                                            <div className={`severity-badge ${article.disaster?.severity}`}>
                                                {article.disaster?.severity === 'critical' ? 'High Severity' :
                                                    article.disaster?.severity === 'high' ? 'High Severity' :
                                                        article.disaster?.severity === 'medium' ? 'Moderate Severity' : 'Low Severity'}
                                            </div>
                                            <button
                                                className="view-details-btn"
                                                onClick={() => article.disaster && onDisasterSelect(article.disaster)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default LiveNews
