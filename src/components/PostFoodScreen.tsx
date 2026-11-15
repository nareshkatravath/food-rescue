import React, { useState, useEffect, useRef } from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { FoodCategory } from '../types';
import { useLocation } from '../hooks/useLocation';
import { LeafletMap } from './LeafletMap';
import { LocationStatusBanner } from './LocationStatusBanner';
import { reverseGeocodeNominatim } from '../utils/geo';
import {
  ChevronLeft,
  Camera,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Info,
  UploadCloud,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_IMAGES = [
  {
    title: 'Veg Meals Platter',
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Rice & Curry Box',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fresh Garden Salad',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Artisan Bakery',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fresh Fruit Basket',
    url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Dairy & Milk Packets',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  },
];

export const PostFoodScreen: React.FC = () => {
  const { currentUser, setActiveScreen, addFoodListing } = useFoodRescue();

  const {
    status: locationStatus,
    coords: userCoords,
    gpsCoords,
    isUsingFallback,
    fallbackLocation,
    errorMessage: locationError,
    requestLocation,
    retry: retryLocation,
    setFallbackLocation,
    clearFallbackLocation,
  } = useLocation({ autoRequest: false });

  // Form states matching reference screen 4
  const [foodName, setFoodName] = useState('Veg Meals & Rice Combo');
  const [category, setCategory] = useState<FoodCategory>('Meals');
  const [quantity, setQuantity] = useState('5 kg');
  const [servings, setServings] = useState(25);
  const [availableUntil, setAvailableUntil] = useState('Today, 7:00 PM');
  const [pickupLocation, setPickupLocation] = useState('Cafeteria, Main Block');
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [foodType, setFoodType] = useState<'veg' | 'non-veg'>('veg');
  const [description, setDescription] = useState(
    'Fresh hot buffet lunch meals untouched. Stored in stainless steel warm insulated chafing dishes.'
  );
  const [storageInstructions, setStorageInstructions] = useState(
    'Keep warm or distribute within 3 hours. Utensils provided.'
  );
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const shouldSyncGpsRef = useRef(false);

  // Route guard: only donors may access PostFoodScreen
  useEffect(() => {
    if (currentUser?.userType !== 'donor') {
      setActiveScreen(currentUser?.userType === 'admin' ? 'admin' : 'home');
    }
  }, [currentUser?.userType, setActiveScreen]);

  // When donor taps "Use my current location" and GPS coords arrive, place pin & update address
  useEffect(() => {
    if (shouldSyncGpsRef.current && gpsCoords) {
      shouldSyncGpsRef.current = false;
      setLatitude(gpsCoords.latitude);
      setLongitude(gpsCoords.longitude);
      setIsReverseGeocoding(true);
      reverseGeocodeNominatim(gpsCoords.latitude, gpsCoords.longitude)
        .then((resolved) => {
          if (resolved) {
            setPickupLocation(resolved);
          }
        })
        .finally(() => {
          setIsReverseGeocoding(false);
        });
    }
  }, [gpsCoords]);

  if (currentUser?.userType !== 'donor') {
    return null;
  }

  const handleUseCurrentLocation = () => {
    setHasRequestedLocation(true);
    shouldSyncGpsRef.current = true;
    requestLocation();
  };

  const handleSelectFallbackAddress = (lat: number, lng: number, label: string) => {
    setFallbackLocation(lat, lng, label);
    setLatitude(lat);
    setLongitude(lng);
    setPickupLocation(label);
  };

  const handlePinDragOrClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setIsReverseGeocoding(true);
    reverseGeocodeNominatim(lat, lng)
      .then((resolved) => {
        if (resolved) {
          setPickupLocation(resolved);
        }
      })
      .finally(() => {
        setIsReverseGeocoding(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = addFoodListing({
        foodName,
        category,
        description,
        quantity,
        servings: Number(servings) || 10,
        imageUrl: selectedImage,
        preparedAt: 'Today, 1:30 PM',
        availableUntil,
        pickupLocation,
        latitude,
        longitude,
        foodType,
        storageInstructions,
      });

      setIsSubmitting(false);
      if (!created) return;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setPostedSuccess(true);

      setTimeout(() => {
        setActiveScreen('requests');
      }, 1400);
    }, 600);
  };

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Top Bar with Back Arrow matching Screen 4 */}
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100">
        <button
          onClick={() => setActiveScreen('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-extrabold text-slate-900 font-heading">
          Post Surplus Food
        </h2>
        <div className="w-8" />
      </div>

      {postedSuccess ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#087A28] flex items-center justify-center mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 font-heading">
            Food Published Successfully!
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Nearby NGOs and verified receivers have been notified in real time.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 pb-6">
          {/* Food Image Banner / Upload Preview matching reference image */}
          <div>
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group">
              <img
                src={selectedImage}
                alt="Selected Food"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
                <span className="text-white text-xs font-bold drop-shadow-sm flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  Food Image
                </span>
                <span className="text-[10px] bg-white/90 text-slate-800 font-semibold px-2 py-0.5 rounded-full shadow-xs">
                  Change photo below
                </span>
              </div>
            </div>

            {/* Quick Image Selector */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    selectedImage === img.url
                      ? 'border-[#087A28] scale-105 shadow-2xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Food Name & Veg/Non-Veg */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Food Item Title *
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Rice & Curry Platter"
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Food Type / Category Dropdown matching reference image */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Food Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none font-medium"
              >
                <option value="Meals">Meals</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Bakery">Bakery</option>
                <option value="Dairy">Dairy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Veg / Non-Veg Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Dietary Type
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setFoodType('veg')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition flex items-center justify-center gap-1 ${
                    foodType === 'veg'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodType('non-veg')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold transition flex items-center justify-center gap-1 ${
                    foodType === 'non-veg'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Non-Veg
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Quantity Input matching reference image */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="5 kg"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none font-semibold"
                required
              />
            </div>

            {/* Servings */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Servings (Approx People)
              </label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                placeholder="25"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none"
              />
            </div>
          </div>

          {/* Available Until Date & Time matching reference image */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Available Until *
            </label>
            <div className="relative">
              <input
                type="text"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                placeholder="30 Oct 2026, 7:00 PM"
                className="w-full text-xs p-2.5 pr-10 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none font-medium"
                required
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Pickup Location + Real GPS & Draggable Map Pin */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="block text-[11px] font-bold text-slate-700">
                Pickup Location *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationStatus === 'loading' && hasRequestedLocation}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#087A28] border border-emerald-200 text-[11px] font-bold transition disabled:opacity-60"
              >
                {locationStatus === 'loading' && hasRequestedLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
                <span>Use my current location</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Cafeteria, Main Block"
                className="w-full text-xs p-2.5 pl-8 pr-8 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none font-medium"
                required
              />
              <MapPin className="w-4 h-4 text-[#087A28] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {isReverseGeocoding && (
                <Loader2 className="w-3.5 h-3.5 text-[#087A28] animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {hasRequestedLocation && (
              <LocationStatusBanner
                status={locationStatus}
                coords={userCoords}
                isUsingFallback={isUsingFallback}
                fallbackLabel={fallbackLocation?.label}
                errorMessage={locationError}
                onRetry={() => {
                  shouldSyncGpsRef.current = true;
                  retryLocation();
                }}
                onSelectFallback={handleSelectFallbackAddress}
                onClearFallback={clearFallbackLocation}
                compact
              />
            )}

            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  Drag pin or tap map to adjust pickup point
                </span>
                <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
              <LeafletMap
                pickupPoint={{
                  lat: latitude,
                  lng: longitude,
                  label: pickupLocation || 'Pickup location',
                }}
                draggablePickup
                onPickupChange={handlePinDragOrClick}
                userPoint={
                  gpsCoords
                    ? { lat: gpsCoords.latitude, lng: gpsCoords.longitude, label: 'Your GPS location' }
                    : null
                }
                heightClass="h-44"
                zoom={15}
              />
            </div>
          </div>

          {/* Storage instructions */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Storage Instructions & Food Safety
            </label>
            <textarea
              rows={2}
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
              placeholder="e.g. Keep warm in chafing dish, best consumed before 8 PM."
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none resize-none"
            />
          </div>

          {/* Big Solid Green Post Food Button matching reference image */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#087A28] hover:bg-[#066521] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 text-xs tracking-wide flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Publishing to Network...' : 'Post Food'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('home')}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
