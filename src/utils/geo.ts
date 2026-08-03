// Geolocation utilities for location-based filtering

export interface Coordinates {
  lat: number
  lng: number
}

// Haversine formula to calculate distance between two points
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (b.lat - a.lat) * (Math.PI / 180)
  const dLng = (b.lng - a.lng) * (Math.PI / 180)
  const sin2Lat = Math.sin(dLat / 2) * Math.sin(dLat / 2)
  const sin2Lng = Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const a_ = sin2Lat + Math.cos(a.lat * (Math.PI / 180)) * Math.cos(b.lat * (Math.PI / 180)) * sin2Lng
  const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_))
  return R * c
}

// Sort venues by distance from origin
export function sortByDistance<T extends { coordinates: any }>(
  venues: T[],
  origin: Coordinates
): (T & { distance: number })[] {
  return venues
    .map(v => ({
      ...v,
      distance: haversineDistanceKm(origin, v.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance)
}

// Filter venues by distance radius
export function filterByDistance<T extends { coordinates: any }>(
  venues: T[],
  origin: Coordinates,
  radiusKm: number
): (T & { distance: number })[] {
  return sortByDistance(venues, origin).filter(v => v.distance <= radiusKm)
}
