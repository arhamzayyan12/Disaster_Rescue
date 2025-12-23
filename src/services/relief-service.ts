import { ReliefRequest, ReliefRequestType, RequestStatus } from '../types/relief'
import { supabase } from '../lib/supabase'

// Map DB row to ReliefRequest interface
const mapFromDb = (row: any): ReliefRequest => ({
    id: row.id,
    type: row.type,
    urgency: row.urgency,
    status: row.status,
    victimName: row.victim_name,
    victimContact: row.victim_contact,
    location: {
        lat: row.lat,
        lng: row.lng,
        address: row.address,
        landmark: row.landmark
    },
    title: row.title,
    description: row.description,
    quantity: row.quantity,
    amount: row.amount,
    upiId: row.upi_id,
    qrCodeImage: row.qr_code_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    verificationStatus: row.verification_status,
    volunteerId: row.volunteer_id,
    volunteerName: row.volunteer_name,
    volunteerContact: row.volunteer_contact,
    fulfilledAt: row.fulfilled_at
})

// Map ReliefRequest to DB row
const mapToDb = (req: Partial<ReliefRequest>) => {
    const dbRow: any = {}
    if (req.type) dbRow.type = req.type
    if (req.urgency) dbRow.urgency = req.urgency
    if (req.status) dbRow.status = req.status
    if (req.victimName) dbRow.victim_name = req.victimName
    if (req.victimContact) dbRow.victim_contact = req.victimContact
    if (req.location) {
        dbRow.lat = req.location.lat
        dbRow.lng = req.location.lng
        dbRow.address = req.location.address
        dbRow.landmark = req.location.landmark
    }
    if (req.title) dbRow.title = req.title
    if (req.description) dbRow.description = req.description
    if (req.quantity) dbRow.quantity = req.quantity
    if (req.amount) dbRow.amount = req.amount
    if (req.upiId) dbRow.upi_id = req.upiId
    if (req.qrCodeImage) dbRow.qr_code_image = req.qrCodeImage
    if (req.verificationStatus) dbRow.verification_status = req.verificationStatus
    if (req.volunteerId) dbRow.volunteer_id = req.volunteerId
    if (req.volunteerName) dbRow.volunteer_name = req.volunteerName
    if (req.volunteerContact) dbRow.volunteer_contact = req.volunteerContact
    if (req.fulfilledAt) dbRow.fulfilled_at = req.fulfilledAt
    dbRow.updated_at = new Date().toISOString()
    return dbRow
}



/**
 * Get all relief requests
 */
export async function getAllReliefRequests(): Promise<ReliefRequest[]> {
    const { data, error } = await supabase
        .from('relief_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching relief requests:', error)
        return []
    }

    return data.map(mapFromDb)
}

/**
 * Get relief requests by status
 */
export async function getReliefRequestsByStatus(status: RequestStatus): Promise<ReliefRequest[]> {
    const { data, error } = await supabase
        .from('relief_requests')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching requests by status:', error)
        return []
    }

    return data.map(mapFromDb)
}

/**
 * Get relief requests by type
 */
export async function getReliefRequestsByType(type: ReliefRequestType): Promise<ReliefRequest[]> {
    const { data, error } = await supabase
        .from('relief_requests')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching requests by type:', error)
        return []
    }

    return data.map(mapFromDb)
}

/**
 * Create a new relief request (for victims)
 */
export async function createReliefRequest(
    request: Omit<ReliefRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<ReliefRequest | null> {
    const dbRow = {
        ...mapToDb(request as any),
        status: 'pending',
        created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('relief_requests')
        .insert([dbRow])
        .select()
        .single()

    if (error) {
        console.error('Error creating relief request:', error)
        return null
    }

    return mapFromDb(data)
}

/**
 * Volunteer responds to a request
 */
export async function respondToRequest(
    requestId: string,
    volunteerId: string,
    volunteerName: string,
    volunteerContact: string
): Promise<ReliefRequest | null> {
    const { data, error } = await supabase
        .from('relief_requests')
        .update({
            status: 'in-progress',
            volunteer_id: volunteerId,
            volunteer_name: volunteerName,
            volunteer_contact: volunteerContact,
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error responding to request:', error)
        return null
    }

    return mapFromDb(data)
}

/**
 * Mark request as fulfilled
 */
export async function fulfillRequest(requestId: string): Promise<ReliefRequest | null> {
    const { data, error } = await supabase
        .from('relief_requests')
        .update({
            status: 'fulfilled',
            fulfilled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error fulfilling request:', error)
        return null
    }

    return mapFromDb(data)
}

/**
 * Cancel a request
 */
export async function cancelRequest(requestId: string): Promise<ReliefRequest | null> {
    const { data, error } = await supabase
        .from('relief_requests')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error cancelling request:', error)
        return null
    }

    return mapFromDb(data)
}

/**
 * Get requests near a location (within radius in km)
 * Note: Use Supabase PostGIS if available, but here's a fallback logic
 */
export async function getRequestsNearLocation(
    lat: number,
    lng: number,
    radiusKm: number = 50
): Promise<ReliefRequest[]> {
    // Basic filter to reduce data transferred
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

    const { data, error } = await supabase
        .from('relief_requests')
        .select('*')
        .gt('lat', lat - latDelta)
        .lt('lat', lat + latDelta)
        .gt('lng', lng - lngDelta)
        .lt('lng', lng + lngDelta)

    if (error) {
        console.error('Error fetching nearby requests:', error)
        return []
    }

    // Accurate Haversine filtering
    const toRad = (deg: number) => deg * (Math.PI / 180)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371
        const dLat = toRad(lat2 - lat1)
        const dLng = toRad(lng2 - lng1)
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    return data
        .map(mapFromDb)
        .filter(req => calculateDistance(lat, lng, req.location.lat, req.location.lng) <= radiusKm)
}

/**
 * User Profile Management
 */

export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }
    return data
}

export async function updateUserProfile(userId: string, updates: {
    upi_id?: string,
    qr_code_image?: string,
    full_name?: string,
    avatar_url?: string
}) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
        .select()

    if (error) {
        console.error('Error updating profile:', error)
        throw error
    }
    return data
}
