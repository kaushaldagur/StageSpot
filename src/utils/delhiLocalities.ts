// Delhi localities with approximate coordinates
// Used for venue setup and location-based filtering

export interface LocalityData {
  name: string
  city: string
  lat: number
  lng: number
}

export const DELHI_LOCALITIES: LocalityData[] = [
  // Central Delhi
  { name: 'Connaught Place', city: 'New Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Chandni Chowk', city: 'Delhi', lat: 28.6505, lng: 77.2303 },
  { name: 'New Delhi', city: 'New Delhi', lat: 28.5667, lng: 77.1864 },

  // South Delhi
  { name: 'Hauz Khas', city: 'New Delhi', lat: 28.5494, lng: 77.2001 },
  { name: 'Hauz Khas Village', city: 'New Delhi', lat: 28.5535, lng: 77.1943 },
  { name: 'Saket', city: 'New Delhi', lat: 28.5244, lng: 77.1931 },
  { name: 'Lajpat Nagar', city: 'New Delhi', lat: 28.5677, lng: 77.2433 },
  { name: 'Malviya Nagar', city: 'New Delhi', lat: 28.5324, lng: 77.2011 },
  { name: 'Greater Kailash', city: 'New Delhi', lat: 28.5487, lng: 77.2361 },
  { name: 'Greater Kailash II', city: 'New Delhi', lat: 28.5344, lng: 77.2434 },
  { name: 'Safdarjung Enclave', city: 'New Delhi', lat: 28.5690, lng: 77.1946 },

  // West Delhi
  { name: 'Karol Bagh', city: 'New Delhi', lat: 28.6505, lng: 77.1819 },
  { name: 'Rajouri Garden', city: 'Delhi', lat: 28.6666, lng: 77.0664 },
  { name: 'Tilak Nagar', city: 'Delhi', lat: 28.6414, lng: 77.0967 },
  { name: 'Dwarka', city: 'Delhi', lat: 28.5921, lng: 77.0460 },

  // North Delhi
  { name: 'Paharganj', city: 'New Delhi', lat: 28.6433, lng: 77.2239 },
  { name: 'Kasturba Nagar', city: 'Delhi', lat: 28.6750, lng: 77.2306 },

  // East Delhi
  { name: 'Shakarpur', city: 'Delhi', lat: 28.5892, lng: 77.2879 },
  { name: 'Laxmi Nagar', city: 'Delhi', lat: 28.5775, lng: 77.2531 },

  // North East Delhi
  { name: 'Preet Vihar', city: 'Delhi', lat: 28.6027, lng: 77.2805 },
  { name: 'Mayur Vihar', city: 'Delhi', lat: 28.5788, lng: 77.2882 },

  // South West Delhi
  { name: 'Mehrauli', city: 'New Delhi', lat: 28.5244, lng: 77.1663 },
]

// Get locality by name
export function getLocalityByName(name: string): LocalityData | null {
  return DELHI_LOCALITIES.find(l => l.name.toLowerCase() === name.toLowerCase()) || null
}

// Get all unique cities
export function getCities(): string[] {
  return Array.from(new Set(DELHI_LOCALITIES.map(l => l.city)))
}

// Get localities for a specific city
export function getLocalitiesByCity(city: string): LocalityData[] {
  return DELHI_LOCALITIES.filter(l => l.city.toLowerCase() === city.toLowerCase())
}
