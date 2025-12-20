import { Disaster, Shelter } from '../types'
import './DisasterDetailsPanel.css'
import { getSmartDisasterDetails } from '../utils/smart-detection'

interface DisasterDetailsPanelProps {
  disaster: Disaster
  onClose: () => void
  showShelters: boolean
  onToggleShelters: () => void
  nearbyShelters: Shelter[]
  isLoadingShelters?: boolean
}

const DisasterDetailsPanel: React.FC<DisasterDetailsPanelProps> = ({
  disaster,
  onClose,
  showShelters,
  onToggleShelters,
  nearbyShelters,
  isLoadingShelters
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Helper for title casing
  const titleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const { effectiveType, image, displayTitle } = getSmartDisasterDetails(disaster)

  return (
    <aside className="disaster-details-panel">
      {/* Header */}
      <div className="panel-header">
        <h2>{displayTitle}</h2>
        <button className="close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="panel-content">
        {/* Disaster Image */}
        <div className="detail-image-container" style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
          <img
            src={image}
            alt={effectiveType}
            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          />
        </div>

        {/* Severity */}
        <div className="detail-card">
          <p className="detail-label">Severity</p>
          <p className={`detail-value ${disaster.severity}`}>
            {titleCase(disaster.severity)}
          </p>
        </div>

        {/* Location */}
        <div className="detail-card">
          <p className="detail-label">Location</p>
          <p className="detail-value">{disaster.location.name}</p>
          <p className="detail-subtext">
            {disaster.location.lat.toFixed(4)}° N, {disaster.location.lng.toFixed(4)}° E
          </p>
        </div>

        {/* Timestamp */}
        <div className="detail-card">
          <p className="detail-label">Timestamp</p>
          <p className="detail-value">{formatDate(disaster.reportedAt)}</p>
        </div>

        {/* Description */}
        <div className="detail-card">
          <p className="detail-label">Description</p>
          <p className="detail-description">{disaster.description}</p>
        </div>

        {/* Shelters Toggle (Optional Integration) */}
        <button className="shelters-toggle-btn" onClick={onToggleShelters}>
          {showShelters ? 'Hide' : 'Show'} Nearby Shelters ({nearbyShelters.length})
        </button>

        {showShelters && (
          <div className="shelters-list">
            <h4 className="intel-title">Verified NDMA Scouting Hub</h4>
            {isLoadingShelters ? (
              <div className="shelter-loading">
                <div className="spinner-small"></div>
                <span>Strategic Scouting in progress...</span>
              </div>
            ) : nearbyShelters.length === 0 ? (
              <p className="no-shelters-text">No optimal sites found within 10km radius. Searching broader...</p>
            ) : (
              nearbyShelters.map(shelter => (
                <div key={shelter.id} className="shelter-item ndma-scouted">
                  <div className="shelter-header">
                    <div className="flex flex-col">
                      <p className="shelter-name">🛡️ {shelter.name}</p>
                      {shelter.distance && (
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                          {(shelter.distance / 1000).toFixed(1)} km from Epicenter
                        </span>
                      )}
                    </div>
                    {shelter.ndmaCompliance && (
                      <span className={`compliance-score ${shelter.ndmaCompliance.score >= 80 ? 'good' : 'fair'}`}>
                        {shelter.ndmaCompliance.score}% Match
                      </span>
                    )}
                  </div>
                  <p className="shelter-detail">{shelter.location.address}</p>

                  {shelter.ndmaCompliance && (
                    <div className="ndma-tactical-data">
                      <div className="tactical-requirement">
                        <span className="material-symbols-outlined">water_drop</span>
                        <span>{shelter.ndmaCompliance.requirements.waterDailyLiters.toLocaleString()}L</span>
                      </div>
                      <div className="tactical-requirement">
                        <span className="material-symbols-outlined">groups</span>
                        <span>Cap: {shelter.ndmaCompliance.requirements.maxOccupancy}</span>
                      </div>
                      <div className="tactical-requirement">
                        <span className="material-symbols-outlined">wc</span>
                        <span>{shelter.ndmaCompliance.requirements.toiletsEmergency}–{shelter.ndmaCompliance.requirements.toiletsOptimal}</span>
                      </div>
                      <div className="tactical-requirement">
                        <span className="material-symbols-outlined">restaurant</span>
                        <span>{(shelter.ndmaCompliance.requirements.minTotalKcal / 1000).toFixed(0)}k kcal</span>
                      </div>
                      <div className="tactical-requirement">
                        <span className="material-symbols-outlined">delete_sweep</span>
                        <span>{shelter.ndmaCompliance.requirements.garbageBins} Bins</span>
                      </div>
                    </div>
                  )}

                  {shelter.ndmaCompliance?.warnings.map((warning, i) => (
                    <p key={i} className="ndma-warning">⚠️ {warning}</p>
                  ))}

                  <button
                    className="navigate-btn"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shelter.location.lat},${shelter.location.lng}`, '_blank')}
                  >
                    <span className="material-symbols-outlined">directions</span>
                    Navigate to Shelter
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="panel-footer">
        <button className="action-btn primary">
          <span className="material-symbols-outlined">share</span>
          Share Alert
        </button>
        <button className="action-btn secondary">
          <span className="material-symbols-outlined">campaign</span>
          Request Aid
        </button>
      </div>
    </aside>
  )
}

export default DisasterDetailsPanel

