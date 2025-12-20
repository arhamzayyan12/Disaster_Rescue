import { Disaster, Shelter } from '../types'

// Mock disaster data for India
export const mockDisasters: Disaster[] = [
  {
    id: '1',
    type: 'flood',
    location: {
      lat: 22.5726,
      lng: 88.3639,
      name: 'Kolkata',
      state: 'West Bengal'
    },
    severity: 'high',
    description: 'Heavy monsoon rains causing flooding in low-lying areas. Multiple neighborhoods affected.',
    reportedAt: '2024-01-15T10:30:00Z',
    affectedPeople: 50000,
    status: 'active'
  },
  {
    id: '2',
    type: 'earthquake',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      name: 'Delhi',
      state: 'Delhi'
    },
    severity: 'medium',
    description: 'Moderate earthquake with magnitude 5.2. Minor structural damage reported.',
    reportedAt: '2024-01-14T08:15:00Z',
    affectedPeople: 12000,
    status: 'active'
  },
  {
    id: '3',
    type: 'cyclone',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      name: 'Chennai',
      state: 'Tamil Nadu'
    },
    severity: 'critical',
    description: 'Cyclone warning issued. Coastal areas at risk. Evacuation in progress.',
    reportedAt: '2024-01-15T14:00:00Z',
    affectedPeople: 150000,
    status: 'active'
  },
  {
    id: '4',
    type: 'drought',
    location: {
      lat: 18.5204,
      lng: 73.8567,
      name: 'Pune',
      state: 'Maharashtra'
    },
    severity: 'high',
    description: 'Severe water shortage in rural areas. Agricultural impact significant.',
    reportedAt: '2024-01-10T06:00:00Z',
    affectedPeople: 80000,
    status: 'active'
  },
  {
    id: '5',
    type: 'fire',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      name: 'Mumbai',
      state: 'Maharashtra'
    },
    severity: 'medium',
    description: 'Industrial fire in warehouse district. Fire department responding.',
    reportedAt: '2024-01-15T16:45:00Z',
    affectedPeople: 500,
    status: 'active'
  },
  {
    id: '6',
    type: 'landslide',
    location: {
      lat: 30.7333,
      lng: 79.0667,
      name: 'Uttarakhand',
      state: 'Uttarakhand'
    },
    severity: 'high',
    description: 'Landslide blocking major highway. Rescue operations underway.',
    reportedAt: '2024-01-13T11:20:00Z',
    affectedPeople: 2000,
    status: 'active'
  }
]

// Mock shelter data
export const mockShelters: Shelter[] = [
  {
    id: 's1',
    name: 'Kolkata Central Relief Camp',
    location: {
      lat: 22.5726,
      lng: 88.3639,
      address: 'Salt Lake City, Kolkata, West Bengal'
    },
    capacity: 5000,
    currentOccupancy: 3200,
    facilities: ['Medical Aid', 'Food', 'Water', 'Sanitation', 'Emergency Supplies'],
    contact: '+91-33-1234-5678'
  },
  {
    id: 's2',
    name: 'Delhi Emergency Shelter',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Connaught Place, New Delhi'
    },
    capacity: 3000,
    currentOccupancy: 1500,
    facilities: ['Medical Aid', 'Food', 'Water', 'Temporary Housing'],
    contact: '+91-11-2345-6789'
  },
  {
    id: 's3',
    name: 'Chennai Coastal Evacuation Center',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Marina Beach Area, Chennai, Tamil Nadu'
    },
    capacity: 10000,
    currentOccupancy: 7500,
    facilities: ['Medical Aid', 'Food', 'Water', 'Sanitation', 'Emergency Supplies', 'Transport'],
    contact: '+91-44-3456-7890'
  },
  {
    id: 's4',
    name: 'Pune Rural Relief Center',
    location: {
      lat: 18.5204,
      lng: 73.8567,
      address: 'Pune District, Maharashtra'
    },
    capacity: 2000,
    currentOccupancy: 1800,
    facilities: ['Food', 'Water', 'Medical Aid'],
    contact: '+91-20-4567-8901'
  },
  {
    id: 's5',
    name: 'Mumbai Emergency Shelter',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Andheri, Mumbai, Maharashtra'
    },
    capacity: 1500,
    currentOccupancy: 200,
    facilities: ['Medical Aid', 'Food', 'Water', 'Temporary Housing'],
    contact: '+91-22-5678-9012'
  },
  {
    id: 's6',
    name: 'Uttarakhand Mountain Relief Camp',
    location: {
      lat: 30.7333,
      lng: 79.0667,
      address: 'Dehradun, Uttarakhand'
    },
    capacity: 1000,
    currentOccupancy: 450,
    facilities: ['Medical Aid', 'Food', 'Water', 'Rescue Operations'],
    contact: '+91-135-6789-0123'
  }
]

