import React from 'react';
import { motion } from 'framer-motion';
import './EmergencyActionHub.css';

interface EmergencyActionHubProps {
    onNeedHelp: () => void;
    onCanHelp: () => void;
    onDismiss: () => void;
}

const EmergencyActionHub: React.FC<EmergencyActionHubProps> = ({
    onNeedHelp,
    onCanHelp,
    onDismiss
}) => {
    return (
        <div className="emergency-hub-overlay">
            <motion.div
                className="emergency-hub-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className="hq-badge">Global HQ Operations</div>
                <div className="emergency-hub-header">
                    <div className="pulse-sos">
                        <span className="material-symbols-outlined">shield_with_heart</span>
                    </div>
                    <h2>Crisis Response Command</h2>
                    <p>Coordinating global relief and local rescue in real-time.</p>
                </div>

                <div className="emergency-options-grid">
                    <motion.button
                        className="emergency-option-btn need-help"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNeedHelp}
                    >
                        <div className="option-icon-bg">
                            <span className="material-symbols-outlined">emergency_share</span>
                        </div>
                        <div className="option-text">
                            <h3>Request Emergency Support</h3>
                            <p>Direct priority line to verified response teams and aid.</p>
                        </div>
                        <span className="material-symbols-outlined arrow">chevron_right</span>
                    </motion.button>

                    <motion.button
                        className="emergency-option-btn can-help"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCanHelp}
                    >
                        <div className="option-icon-bg">
                            <span className="material-symbols-outlined">health_and_safety</span>
                        </div>
                        <div className="option-text">
                            <h3>Deploy as First Responder</h3>
                            <p>Join the 4,200+ specialized volunteers on the ground.</p>
                        </div>
                        <span className="material-symbols-outlined arrow">chevron_right</span>
                    </motion.button>
                </div>

                <div className="emergency-hub-footer">
                    <button className="dismiss-link" onClick={onDismiss}>
                        Continue to Situational Map
                    </button>
                    <div className="partner-badges">
                        <span className="badge-text text-muted">AHEAD IN PARTNERSHIP WITH</span>
                        <div className="badge-logos">
                            <div className="mini-logo">GLOBAL AID</div>
                            <div className="mini-logo">CRISIS CO.</div>
                        </div>
                    </div>
                    <div className="live-indicators">
                        <div className="indicator">
                            <span className="dot pulse-green"></span>
                            412 Active Rescuers
                        </div>
                        <div className="indicator">
                            <span className="dot pulse-blue"></span>
                            Global Tier-1 Node Active
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmergencyActionHub;
