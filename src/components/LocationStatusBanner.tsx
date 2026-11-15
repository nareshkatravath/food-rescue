import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Search,
  CheckCircle2,
  Navigation,
  Info,
} from 'lucide-react';
import { LocationStatus } from '../hooks/useLocation';
import { GeoPoint, NominatimResult, searchNominatimAddress } from '../utils/geo';

interface LocationStatusBannerProps {
  status: LocationStatus;
  coords: GeoPoint | null;
  isUsingFallback: boolean;
  fallbackLabel?: string | null;
  errorMessage: string;
  onRetry: () => void;
  onSelectFallback: (lat: number, lng: number, label: string) => void;
  onClearFallback?: () => void;
  compact?: boolean;
}

export const LocationStatusBanner: React.FC<LocationStatusBannerProps> = ({
  status,
  coords,
  isUsingFallback,
  fallbackLabel,
  errorMessage,
  onRetry,
  onSelectFallback,
  onClearFallback,
  compact = false,
}) => {
  const [addressQuery, setAddressQuery] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);

  // Automatically reveal fallback address input when location is denied/unavailable/timeout and no fallback is active
  useEffect(() => {
    if (
      (status === 'denied' || status === 'unavailable' || status === 'timeout') &&
      !isUsingFallback
    ) {
      setShowAddressInput(true);
    }
  }, [status, isUsingFallback]);

  // 1-second debounced OpenStreetMap Nominatim search
  useEffect(() => {
    const trimmed = addressQuery.trim();
    if (!trimmed || trimmed.length < 3) {
      setResults([]);
      setSearchError('');
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setSearchError('');

    const timer = window.setTimeout(async () => {
      try {
        const matches = await searchNominatimAddress(trimmed, controller.signal);
        setResults(matches);
        if (matches.length === 0) {
          setSearchError('No matching addresses found. Try adding your city or area name.');
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSearchError(
            err instanceof Error
              ? err.message
              : 'Could not look up that address right now. Please check your connection and try again.'
          );
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [addressQuery]);

  const handlePickResult = (item: NominatimResult) => {
    const shortLabel = item.displayName.split(',').slice(0, 3).join(', ');
    onSelectFallback(item.lat, item.lng, shortLabel);
    setAddressQuery('');
    setResults([]);
    setSearchError('');
    setShowAddressInput(false);
  };

  if (status === 'granted' && coords && !showAddressInput) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-emerald-900 truncate">
              Live GPS active
            </p>
            {!compact && (
              <p className="text-[10px] text-emerald-700 truncate">
                {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ''}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="text-[10px] font-bold text-[#087A28] hover:underline flex items-center gap-1 shrink-0"
          title="Refresh GPS location"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-3 text-xs space-y-2 ${
        status === 'loading'
          ? 'bg-sky-50/80 border-sky-200 text-sky-900'
          : isUsingFallback
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}
    >
      {/* Status Header Row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0 mt-0.5" />
          ) : isUsingFallback ? (
            <CheckCircle2 className="w-4 h-4 text-[#087A28] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold leading-snug">
              {status === 'loading'
                ? 'Detecting your current location...'
                : isUsingFallback
                ? `Using fallback address: ${fallbackLabel}`
                : status === 'denied'
                ? 'Location permission denied'
                : status === 'timeout'
                ? 'Location request timed out'
                : 'Location unavailable'}
            </p>
            {status !== 'loading' && !isUsingFallback && (
              <p className="text-[10px] opacity-85 mt-0.5 leading-relaxed">
                {errorMessage ||
                  'Enable location access or enter an address below to see nearby food distances.'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {status !== 'loading' && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-[#087A28] flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
          {isUsingFallback && (
            <button
              type="button"
              onClick={() => setShowAddressInput((v) => !v)}
              className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-[#087A28] shadow-2xs"
            >
              {showAddressInput ? 'Close' : 'Change'}
            </button>
          )}
        </div>
      </div>

      {/* Browser settings guide when permission is denied */}
      {status === 'denied' && (
        <div className="bg-white/80 border border-amber-200/80 rounded-xl p-2 text-[10px] text-slate-700 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">How to enable location: </span>
            Click the lock or settings icon in your browser&apos;s address bar, open{' '}
            <span className="font-semibold">Site settings / Permissions</span>, set{' '}
            <span className="font-semibold">Location</span> to <span className="font-semibold">Allow</span>, then tap{' '}
            <span className="font-semibold">Retry</span>.
          </div>
        </div>
      )}

      {/* Fallback Address Search (OpenStreetMap Nominatim with 1-second debounce) */}
      {(showAddressInput || (!isUsingFallback && status !== 'loading')) && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#087A28]" />
              <span>Enter fallback address or area:</span>
            </label>
            {isUsingFallback && onClearFallback && (
              <button
                type="button"
                onClick={onClearFallback}
                className="text-[10px] text-slate-500 hover:text-red-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder="e.g. Indiranagar, Bengaluru"
              className="w-full text-xs pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#087A28] focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-[#087A28] animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {searchError && (
            <p className="text-[10px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
              {searchError}
            </p>
          )}

          {results.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto shadow-xs">
              {results.map((item, idx) => (
                <button
                  key={`${item.lat}-${item.lng}-${idx}`}
                  type="button"
                  onClick={() => handlePickResult(item)}
                  className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 transition flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#087A28] shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-700 leading-snug break-words">
                    {item.displayName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
