import React from 'react'
import { ReliefRequest } from '../types/relief'
import './QRCodeDisplayModal.css'

interface QRCodeDisplayModalProps {
    request: ReliefRequest
    onClose: () => void
}

const QRCodeDisplayModal: React.FC<QRCodeDisplayModalProps> = ({ request, onClose }) => {
    const handleDownload = () => {
        if (request.qrCodeImage) {
            const link = document.createElement('a')
            link.href = request.qrCodeImage
            link.download = `qr-code-${request.victimName.replace(/\s+/g, '-')}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="qr-display-modal-overlay" onClick={handleBackdropClick}>
            <div className="qr-display-modal-content">
                {/* Header */}
                <div className="qr-display-modal-header">
                    <div>
                        <h2>Send Financial Help</h2>
                        <p className="request-victim-name">{request.victimName}</p>
                    </div>
                    <button
                        className="qr-display-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Request Details */}
                <div className="qr-display-request-details">
                    <div className="detail-row">
                        <span className="detail-label">Amount Requested:</span>
                        <span className="detail-value amount">₹{request.amount}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{request.location.address}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Urgency:</span>
                        <span className={`detail-value urgency ${request.urgency}`}>
                            {request.urgency.toUpperCase()}
                        </span>
                    </div>
                    {request.description && (
                        <div className="detail-row full-width">
                            <span className="detail-label">Reason:</span>
                            <p className="detail-description">{request.description}</p>
                        </div>
                    )}
                </div>

                {/* QR Code Display */}
                {request.qrCodeImage ? (
                    <div className="qr-display-section">
                        <div className="qr-display-instructions">
                            <span className="material-symbols-outlined">qr_code_scanner</span>
                            <p>Scan this QR code with any UPI app to send payment</p>
                        </div>

                        <div className="qr-display-image-container">
                            <img
                                src={request.qrCodeImage}
                                alt={`UPI QR Code for ${request.victimName}`}
                                className="qr-display-image"
                            />
                        </div>

                        <div className="qr-display-upi-info">
                            {request.upiId && (
                                <div className="upi-id-display">
                                    <span className="material-symbols-outlined">account_balance</span>
                                    <span className="upi-id-text">{request.upiId}</span>
                                </div>
                            )}
                        </div>

                        <div className="qr-display-actions">
                            <button
                                className="qr-display-btn secondary"
                                onClick={handleDownload}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Download QR Code
                            </button>
                        </div>

                        <div className="qr-display-disclaimer">
                            <span className="material-symbols-outlined">info</span>
                            <div>
                                <p className="disclaimer-title">Payment Disclaimer</p>
                                <p className="disclaimer-text">
                                    Payments are made directly via UPI apps. This platform does not process,
                                    handle, or verify transactions. Please verify the recipient details before sending money.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="qr-display-no-qr">
                        <span className="material-symbols-outlined">qr_code_2</span>
                        <p>Monetary help not enabled for this request</p>
                        <p className="no-qr-subtitle">The requester has not uploaded a QR code yet</p>
                    </div>
                )}

                {/* Footer */}
                <div className="qr-display-modal-footer">
                    <button
                        className="qr-display-btn primary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QRCodeDisplayModal
