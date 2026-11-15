import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoPoint } from '../utils/geo';

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable' | 'timeout';

interface FallbackLocation {
  latitude: number;
  longitude: number;
  label: string;
}

const FALLBACK_STORAGE_KEY = 'foodrescue_fallback_location';
const FALLBACK_EVENT = 'foodrescue:fallback-location-changed';

function readStoredFallback(): FallbackLocation | null {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FallbackLocation;
    if (
      typeof parsed?.latitude === 'number' &&
      typeof parsed?.longitude === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export interface UseLocationOptions {
  watch?: boolean;
  autoRequest?: boolean;
}

export interface UseLocationResult {
  status: LocationStatus;
  coords: GeoPoint | null;
  gpsCoords: GeoPoint | null;
  fallbackLocation: FallbackLocation | null;
  isUsingFallback: boolean;
  errorMessage: string;
  requestLocation: () => void;
  retry: () => void;
  setFallbackLocation: (latitude: number, longitude: number, label: string) => void;
  clearFallbackLocation: () => void;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
  const { watch = false, autoRequest = true } = options;

  const [status, setStatus] = useState<LocationStatus>(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return 'unavailable';
    }
    return autoRequest ? 'loading' : 'unavailable';
  });
  const [gpsCoords, setGpsCoords] = useState<GeoPoint | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fallbackLocation, setFallbackState] = useState<FallbackLocation | null>(() =>
    readStoredFallback()
  );

  const watchIdRef = useRef<number | null>(null);

  // Sync fallback location across mounted screens
  useEffect(() => {
    const handleSync = () => {
      setFallbackState(readStoredFallback());
    };
    window.addEventListener(FALLBACK_EVENT, handleSync);
    return () => window.removeEventListener(FALLBACK_EVENT, handleSync);
  }, []);

  const clearWatch = useCallback(() => {
    if (
      watchIdRef.current !== null &&
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setGpsCoords({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    });
    setStatus('granted');
    setErrorMessage('');
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setStatus('denied');
        setErrorMessage(
          'Location permission was denied. Enable location access in your browser settings or enter an address below.'
        );
        break;
      case error.TIMEOUT:
        setStatus('timeout');
        setErrorMessage(
          'Location request timed out while waiting for a GPS fix. Please retry or enter an address.'
        );
        break;
      case error.POSITION_UNAVAILABLE:
      default:
        setStatus('unavailable');
        setErrorMessage(
          'Your current location is currently unavailable. Please retry or enter an address manually.'
        );
        break;
    }
  }, []);

  const startLocationLookup = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorMessage(
        'Geolocation is not supported by this browser. Enter your address manually below.'
      );
      return;
    }

    clearWatch();
    setStatus('loading');
    setErrorMessage('');

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        (err) => {
          // Only overwrite status if we don't already have a granted fix
          setGpsCoords((prev) => {
            if (!prev) {
              handleError(err);
            }
            return prev;
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    }
  }, [clearWatch, handleError, handleSuccess, watch]);

  useEffect(() => {
    if (autoRequest) {
      startLocationLookup();
    }
    return () => {
      clearWatch();
    };
  }, [autoRequest, startLocationLookup, clearWatch]);

  const setFallbackLocation = useCallback(
    (latitude: number, longitude: number, label: string) => {
      const next: FallbackLocation = { latitude, longitude, label };
      try {
        localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      setFallbackState(next);
      window.dispatchEvent(new Event(FALLBACK_EVENT));
    },
    []
  );

  const clearFallbackLocation = useCallback(() => {
    try {
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setFallbackState(null);
    window.dispatchEvent(new Event(FALLBACK_EVENT));
  }, []);

  const coords: GeoPoint | null =
    gpsCoords ||
    (fallbackLocation
      ? {
          latitude: fallbackLocation.latitude,
          longitude: fallbackLocation.longitude,
        }
      : null);

  return {
    status,
    coords,
    gpsCoords,
    fallbackLocation,
    isUsingFallback: !gpsCoords && Boolean(fallbackLocation),
    errorMessage,
    requestLocation: startLocationLookup,
    retry: startLocationLookup,
    setFallbackLocation,
    clearFallbackLocation,
  };
}
