import React, { useState, useRef } from 'react'
import './QRCodeUpload.css'

interface QRCodeUploadProps {
    onImageUpload: (base64Image: string) => void
    onImageRemove: () => void
    currentImage?: string
    disabled?: boolean
}

const QRCodeUpload: React.FC<QRCodeUploadProps> = ({
    onImageUpload,
    onImageRemove,
    currentImage,
    disabled = false
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string>('')
    const [isEnlarged, setIsEnlarged] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg']

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!ACCEPTED_FORMATS.includes(file.type)) {
            return 'Please upload a PNG or JPG image only'
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 5MB'
        }

        return null
    }

    const handleFileRead = (file: File) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const base64 = e.target?.result as string
            onImageUpload(base64)
            setError('')
        }

        reader.onerror = () => {
            setError('Failed to read file. Please try again.')
        }

        reader.readAsDataURL(file)
    }

    const handleFileSelect = (file: File) => {
        const validationError = validateFile(file)

        if (validationError) {
            setError(validationError)
            return
        }

        handleFileRead(file)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleClick = () => {
        if (!disabled && !currentImage) {
            fileInputRef.current?.click()
        }
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onImageRemove()
        setError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleReplace = (e: React.MouseEvent) => {
        e.stopPropagation()
        fileInputRef.current?.click()
    }

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentImage) {
            const link = document.createElement('a')
            link.href = currentImage
            link.download = 'upi-qr-code.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleEnlarge = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsEnlarged(true)
    }

    return (
        <>
            <div className="qr-upload-container">
                <div
                    className={`qr-upload-zone ${isDragging ? 'dragging' : ''} ${currentImage ? 'has-image' : ''} ${disabled ? 'disabled' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                        disabled={disabled}
                    />

                    {!currentImage ? (
                        <div className="qr-upload-placeholder">
                            <span className="material-symbols-outlined qr-icon">qr_code_scanner</span>
                            <p className="qr-upload-title">Upload UPI QR Code</p>
                            <p className="qr-upload-subtitle">
                                Drag & drop or click to browse
                            </p>
                            <p className="qr-upload-formats">
                                PNG, JPG up to 5MB
                            </p>
                        </div>
                    ) : (
                        <div className="qr-preview-container">
                            <img
                                src={currentImage}
                                alt="UPI QR Code"
                                className="qr-preview-image"
                            />
                            <div className="qr-preview-overlay">
                                <div className="qr-preview-actions">
                                    <button
                                        type="button"
                                        className="qr-action-btn"
                                        onClick={handleEnlarge}
                                        title="View Full Size"
                                    >
                                        <span className="material-symbols-outlined">zoom_in</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="qr-action-btn"
                                        onClick={handleDownload}
                                        title="Download QR Code"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                    {!disabled && (
                                        <>
                                            <button
                                                type="button"
                                                className="qr-action-btn"
                                                onClick={handleReplace}
                                                title="Replace Image"
                                            >
                                                <span className="material-symbols-outlined">sync</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="qr-action-btn danger"
                                                onClick={handleRemove}
                                                title="Remove Image"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="qr-upload-error">
                        <span className="material-symbols-outlined">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {currentImage && (
                    <div className="qr-upload-success">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>QR Code uploaded successfully</span>
                    </div>
                )}
            </div>

            {/* Enlarged View Modal */}
            {isEnlarged && currentImage && (
                <div className="qr-modal-overlay" onClick={() => setIsEnlarged(false)}>
                    <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="qr-modal-close"
                            onClick={() => setIsEnlarged(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="qr-modal-header">
                            <h3>UPI QR Code</h3>
                            <p>Scan with any UPI app to send payment</p>
                        </div>
                        <div className="qr-modal-image-container">
                            <img src={currentImage} alt="UPI QR Code - Full Size" />
                        </div>
                        <div className="qr-modal-actions">
                            <button
                                className="qr-modal-btn"
                                onClick={handleDownload}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default QRCodeUpload
