export type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'drought' | 'fire' | 'landslide' | 'thunderstorm' | 'heatwave' | 'coldwave'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface Disaster {
  id: string
  type: DisasterType
  location: {
    lat: number
    lng: number
    name: string
    state: string
  }
  severity: Severity
  description: string
  reportedAt: string
  expires?: string
  affectedPeople?: number
  status: 'active' | 'contained' | 'resolved'
}

export interface Shelter {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address: string
  }
  capacity: number
  distance?: number
  currentOccupancy: number
  facilities: string[]
  contact: string
  ndmaCompliance?: {
    score: number
    isCompliant: boolean
    warnings: string[]
    requirements: {
      waterDailyLiters: number
      maxOccupancy: number
      toiletsEmergency: number
      toiletsOptimal: number
      garbageBins: number
      minTotalKcal: number
    }
  }
}

