export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NominatimResult {
  lat: number;
  lng: number;
  displayName: string;
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Computes the great-circle distance in kilometers between two lat/lng points
 * using the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(distanceKm: number): string {
  if (!Number.isFinite(distanceKm)) return '';
  if (distanceKm < 0.1) {
    return `${Math.max(10, Math.round(distanceKm * 1000))} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Searches addresses using OpenStreetMap Nominatim (no API key).
 */
export async function searchNominatimAddress(
  query: string,
  signal?: AbortSignal
): Promise<NominatimResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(
    trimmed
  )}`;

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Address lookup failed (status ${response.status}). Please try again.`);
  }

  const data = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name,
  }));
}

/**
 * Reverse-geocodes coordinates using OpenStreetMap Nominatim (no API key).
 * Returns a short readable address or null if unavailable.
 */
export async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;

    const response = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        suburb?: string;
        neighbourhood?: string;
        city?: string;
        town?: string;
        village?: string;
        road?: string;
      };
    };

    if (data.address) {
      const parts = [
        data.address.road,
        data.address.neighbourhood || data.address.suburb,
        data.address.city || data.address.town || data.address.village,
      ].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    return data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : null;
  } catch {
    return null;
  }
}

export function buildGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${lat},${lng}`
  )}`;
}
