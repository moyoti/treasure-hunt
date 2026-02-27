/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate random offset from a point
 * @param maxMeters Maximum distance in meters
 */
export function getRandomOffset(maxMeters: number): { lat: number; lng: number } {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320;

  const randomMeters = Math.random() * maxMeters;
  const angle = Math.random() * 2 * Math.PI;

  const latOffset = (randomMeters * Math.cos(angle)) / metersPerDegreeLat;
  const lngOffset = (randomMeters * Math.sin(angle)) / metersPerDegreeLng;

  return { lat: latOffset, lng: lngOffset };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if a point is within collection radius
 */
export function isWithinCollectRange(
  userLat: number,
  userLng: number,
  itemLat: number,
  itemLng: number,
  radiusMeters: number = 50
): boolean {
  const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
  return distance <= radiusMeters;
}