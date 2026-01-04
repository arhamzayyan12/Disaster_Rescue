import React from 'react'

interface ImpactCardProps {
    value: string
    label: string
    active?: boolean
}

const ImpactCard: React.FC<ImpactCardProps> = ({ value, label, active }) => (
    <div className={`impact-card ${active ? 'active' : ''}`}>
        <h3>{value}</h3>
        <p>{label}</p>
    </div>
)

const ImpactSection: React.FC = () => {
    return (
        <div className="impact-section">
            <h2 className="section-subtitle">Real-Time Impact</h2>
            <div className="impact-grid">
                <ImpactCard value="4.2k" label="Rescues Finalized" />
                <ImpactCard value="128" label="Active Missions" active />
                <ImpactCard value="15" label="Relief Camps" />
            </div>
        </div>
    )
}

export default React.memo(ImpactSection)
