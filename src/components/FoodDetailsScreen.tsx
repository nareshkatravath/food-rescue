import React, { useState } from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { useLocation } from '../hooks/useLocation';
import { LeafletMap } from './LeafletMap';
import { LocationStatusBanner } from './LocationStatusBanner';
import {
  haversineDistanceKm,
  formatDistanceKm,
  buildGoogleMapsDirectionsUrl,
} from '../utils/geo';
import {
  ChevronLeft,
  MapPin,
  Clock,
  Phone,
  Building,
  User,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Share2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FoodDetailsScreen: React.FC = () => {
  const {
    currentUser,
    selectedFoodId,
    foodListings,
    setActiveScreen,
    requestFood,
    deleteFoodListing,
  } = useFoodRescue();

  const role = currentUser?.userType;
  const canRequestFood = role === 'receiver' || role === 'ngo';
  const backScreen =
    role === 'donor' ? 'requests' : role === 'admin' ? 'admin' : 'available';

  const {
    status: locationStatus,
    coords: userCoords,
    isUsingFallback,
    fallbackLocation,
    errorMessage: locationError,
    retry: retryLocation,
    setFallbackLocation,
    clearFallbackLocation,
  } = useLocation({ watch: true });

  const [isRequesting, setIsRequesting] = useState(false);
  const [requestServings, setRequestServings] = useState('Full quantity');
  const [requestNote, setRequestNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const food = foodListings.find((f) => f.id === selectedFoodId) || foodListings[0];

  const distanceKm =
    food && userCoords
      ? haversineDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          food.latitude,
          food.longitude
        )
      : null;

  const handleShare = async () => {
    if (!food) return;
    const shareText = `${food.foodName} (${food.quantity}) available for pickup at ${food.pickupLocation}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: food.foodName, text: shareText });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleConfirmRequest = () => {
    requestFood(food.id, food.quantity, requestNote);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setShowSuccess(true);
    setTimeout(() => {
      setIsRequesting(false);
      setShowSuccess(false);
      setActiveScreen('requests');
    }, 1400);
  };

  if (!food) {
    return (
      <div className="flex-1 w-full p-6 flex flex-col items-center justify-center bg-[#FFFDF2] text-center">
        <p className="text-sm font-bold text-slate-700 mb-3">Listing not found</p>
        <button
          onClick={() => setActiveScreen('available')}
          className="px-4 py-2 bg-[#087A28] text-white text-xs font-bold rounded-xl"
        >
          Back to Available Food
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Hero Image with Floating Controls */}
      <div className="relative w-full min-h-56 bg-slate-100 shrink-0 flex flex-col justify-between p-4">
        <img
          src={food.imageUrl}
          alt={food.foodName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />

        {/* Back and Share buttons */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveScreen(backScreen)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-800 shadow-sm hover:bg-white active:scale-95 transition shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full shadow-xs shrink-0">
              {food.category}
            </span>
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-800 shadow-sm hover:bg-white active:scale-95 transition shrink-0"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {shareCopied && (
          <div className="relative z-10 self-end mt-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-xs">
            Listing details copied!
          </div>
        )}

        {/* Full Title on Image */}
        <div className="relative z-10 text-white mt-10">
          <div className="flex items-start gap-2 flex-wrap">
            <h1 className="text-lg font-black tracking-tight drop-shadow-sm font-heading leading-snug break-words min-w-0">
              {food.foodName}
            </h1>
            {food.foodType === 'veg' ? (
              <span className="w-3.5 h-3.5 mt-1 bg-white rounded-xs border border-emerald-600 flex items-center justify-center p-0.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </span>
            ) : (
              <span className="w-3.5 h-3.5 mt-1 bg-white rounded-xs border border-red-600 flex items-center justify-center p-0.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="break-words">
              {food.pickupLocation}
              {distanceKm !== null ? ` • ${formatDistanceKm(distanceKm)} away` : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-4 space-y-4">
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">QUANTITY</span>
            <span className="text-xs font-black text-slate-800">{food.quantity}</span>
          </div>
          <div className="border-x border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block">SERVINGS</span>
            <span className="text-xs font-black text-emerald-700">~{food.servings} people</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">AVAILABLE UNTIL</span>
            <span className="text-xs font-black text-amber-700">{food.availableUntil}</span>
          </div>
        </div>

        {/* Food Description */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
          <h3 className="text-xs font-extrabold text-slate-800 font-heading mb-1.5">
            About This Surplus Food
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {food.description}
          </p>

          {food.storageInstructions && (
            <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Storage & Handling: </span>
                {food.storageInstructions}
              </div>
            </div>
          )}
        </div>

        {/* Donor Information Card */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-[#087A28]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {food.donorName}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  Verified Food Partner • 48 Successful Donations
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-[#087A28] hover:bg-emerald-50 transition shrink-0"
              title="Call Donor"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Leaflet + OpenStreetMap Pickup Map */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-extrabold text-slate-800 font-heading flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#087A28]" />
              Pickup Location &amp; Route
            </h4>
            <div className="flex items-center gap-1.5">
              {distanceKm !== null && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {formatDistanceKm(distanceKm)} away
                </span>
              )}
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                OpenStreetMap
              </span>
            </div>
          </div>

          {locationStatus !== 'granted' && (
            <LocationStatusBanner
              status={locationStatus}
              coords={userCoords}
              isUsingFallback={isUsingFallback}
              fallbackLabel={fallbackLocation?.label}
              errorMessage={locationError}
              onRetry={retryLocation}
              onSelectFallback={setFallbackLocation}
              onClearFallback={clearFallbackLocation}
              compact
            />
          )}

          <LeafletMap
            pickupPoint={{
              lat: food.latitude,
              lng: food.longitude,
              label: `${food.foodName} — ${food.pickupLocation}`,
            }}
            userPoint={
              userCoords
                ? {
                    lat: userCoords.latitude,
                    lng: userCoords.longitude,
                    label: isUsingFallback
                      ? `Your fallback location (${fallbackLocation?.label || ''})`
                      : 'Your current location',
                  }
                : null
            }
            heightClass="h-44"
            zoom={14}
          />

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-[11px]">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-slate-800 block truncate">
                {food.pickupLocation}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {food.latitude.toFixed(4)}, {food.longitude.toFixed(4)}
              </span>
            </div>
            <a
              href={buildGoogleMapsDirectionsUrl(food.latitude, food.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#087A28] hover:bg-[#066521] text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shrink-0 transition shadow-2xs"
            >
              <span>Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-2 pb-4 flex gap-2">
          <button
            onClick={() => setShowContactModal(true)}
            className="px-4 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>

          {canRequestFood ? (
            <button
              onClick={() => setIsRequesting(true)}
              className="flex-1 py-3 bg-[#087A28] hover:bg-[#066521] text-white font-bold rounded-xl text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Request Food</span>
            </button>
          ) : (
            (role === 'admin' || (role === 'donor' && food.donorId === currentUser?.id)) && (
              <button
                onClick={() => {
                  if (deleteFoodListing(food.id)) {
                    setActiveScreen(backScreen);
                  }
                }}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <span>Remove Listing</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Request Confirmation Modal */}
      {isRequesting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full shadow-xl">
            {showSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#087A28] mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900">Request Sent!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Food donor notified. You can track this in My Requests.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Request {food.foodName}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Confirm the quantity you wish to collect.
                </p>

                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Requested Quantity:
                  </label>
                  <input
                    type="text"
                    value={food.quantity}
                    readOnly
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Pickup Note (optional):
                  </label>
                  <textarea
                    rows={2}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g. Volunteer vehicle arriving in 45 mins"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRequesting(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRequest}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#087A28] hover:bg-[#066521] rounded-xl shadow-xs"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Donor Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#087A28] flex items-center justify-center mx-auto mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{food.donorName}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{food.donorPhone}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Dispatch coordinates and pickup gate instructions will be sent via SMS / WhatsApp.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <a
                href={`tel:${food.donorPhone}`}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#087A28] rounded-xl flex items-center justify-center"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
