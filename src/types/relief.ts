// Relief Request Types

export type ReliefRequestType =
    | 'monetary'      // Money/financial aid
    | 'food'          // Food and water
    | 'medical'       // Medicine, first aid
    | 'shelter'       // Temporary housing
    | 'clothing'      // Clothes, blankets
    | 'rescue'        // Emergency rescue needed
    | 'other'         // Other supplies

export type RequestStatus =
    | 'pending'       // Waiting for help
    | 'in-progress'   // Someone is helping
    | 'fulfilled'     // Request completed
    | 'cancelled'     // Request cancelled

export type RequestUrgency =
    | 'critical'      // Life-threatening, immediate help needed
    | 'high'          // Urgent, help needed soon
    | 'medium'        // Important but not urgent
    | 'low'           // Can wait

export interface ReliefRequest {
    id: string
    type: ReliefRequestType
    urgency: RequestUrgency
    status: RequestStatus

    // Victim information
    victimName: string
    victimContact: string

    // Location
    location: {
        lat: number
        lng: number
        address: string
        landmark?: string
    }

    // Request details
    title: string
    description: string
    quantity?: string  // e.g., "5 people", "2 days food", "$500"

    // Timestamps
    createdAt: string
    updatedAt: string
    fulfilledAt?: string

    // Volunteer who responded
    volunteerId?: string
    volunteerName?: string
    volunteerContact?: string

    // Additional info
    imageUrl?: string
    verificationStatus?: 'unverified' | 'verified' | 'flagged'

    // Financial Aid
    amount?: string // INR value
    upiId?: string  // UPI ID for payment
    qrCodeUrl?: string // Optional QR code simulation (deprecated)
    qrCodeImage?: string // Base64 encoded QR code image uploaded by user
}

export interface VolunteerResponse {
    requestId: string
    volunteerId: string
    volunteerName: string
    volunteerContact: string
    message: string
    estimatedArrival?: string
    respondedAt: string
}
