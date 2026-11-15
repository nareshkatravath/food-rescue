import React, { useState, useMemo, useEffect } from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { useLocation } from '../hooks/useLocation';
import { LocationStatusBanner } from './LocationStatusBanner';
import { LeafletMap } from './LeafletMap';
import { haversineDistanceKm, formatDistanceKm } from '../utils/geo';
import {
  ChevronLeft,
  Search,
  MapPin,
  Clock,
  Filter,
  CheckCircle,
  Sparkles,
  Map as MapIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AvailableFoodScreen: React.FC = () => {
  const {
    currentUser,
    foodListings,
    setActiveScreen,
    availableMapOpen,
    setAvailableMapOpen,
    requestFood,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    foodFilterTab,
    setFoodFilterTab,
    seedPosterRecords,
  } = useFoodRescue();

  const isAuthorized =
    currentUser?.userType === 'receiver' || currentUser?.userType === 'ngo';

  useEffect(() => {
    if (!isAuthorized) {
      setActiveScreen(currentUser?.userType === 'admin' ? 'admin' : 'home');
    }
  }, [isAuthorized, currentUser?.userType, setActiveScreen]);

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

  const [requestTargetFoodId, setRequestTargetFoodId] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestNote, setRequestNote] = useState('');

  const categories = ['All', 'Meals', 'Vegetables', 'Bakery', 'Dairy', 'Fruits'];

  const listingsWithDistance = useMemo(() => {
    return foodListings.map((food) => {
      const computedDistanceKm = userCoords
        ? haversineDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            food.latitude,
            food.longitude
          )
        : null;
      return { food, computedDistanceKm };
    });
  }, [foodListings, userCoords]);

  const filteredListings = useMemo(() => {
    const filtered = listingsWithDistance.filter(({ food, computedDistanceKm }) => {
      // Category filter
      if (selectedCategory !== 'All' && food.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (
        searchQuery &&
        !food.foodName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !food.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !food.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Tab filter
      if (foodFilterTab === 'Nearby') {
        if (computedDistanceKm === null) return true;
        return computedDistanceKm <= 5.0;
      }
      if (foodFilterTab === 'Expiring Soon') {
        return (
          food.availableUntil.toLowerCase().includes('1 hr') ||
          food.availableUntil.toLowerCase().includes('2:30') ||
          food.availableUntil.toLowerCase().includes('today')
        );
      }
      return true;
    });

    // Sort by nearest when user coordinates are available
    if (userCoords) {
      filtered.sort((a, b) => {
        const distA = a.computedDistanceKm ?? Number.POSITIVE_INFINITY;
        const distB = b.computedDistanceKm ?? Number.POSITIVE_INFINITY;
        return distA - distB;
      });
    }

    return filtered;
  }, [listingsWithDistance, selectedCategory, searchQuery, foodFilterTab, userCoords]);

  const handleRequestSubmit = () => {
    if (requestTargetFoodId) {
      const food = foodListings.find((f) => f.id === requestTargetFoodId);
      if (food) {
        requestFood(food.id, food.quantity, requestNote);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestTargetFoodId(null);
          setRequestSuccess(false);
        }, 1300);
      }
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Header matching Screen 5 in reference poster */}
      <div className="flex items-center justify-between mb-3 pb-1 shrink-0">
        <button
          onClick={() => setActiveScreen('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-extrabold text-slate-900 font-heading">
          Available Food
        </h2>
        <button
          type="button"
          onClick={() => setAvailableMapOpen(!availableMapOpen)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition ${
            availableMapOpen
              ? 'bg-emerald-50 text-[#087A28] border-emerald-200'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
          title="Toggle Map View"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
      </div>

      {/* Real Geolocation Status + Fallback Address */}
      <div className="mb-3 shrink-0">
        <LocationStatusBanner
          status={locationStatus}
          coords={userCoords}
          isUsingFallback={isUsingFallback}
          fallbackLabel={fallbackLocation?.label}
          errorMessage={locationError}
          onRetry={retryLocation}
          onSelectFallback={setFallbackLocation}
          onClearFallback={clearFallbackLocation}
        />
      </div>

      {/* Filter Tabs matching reference poster: All / Nearby / Expiring Soon */}
      <div className="flex items-center gap-1.5 mb-3 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
        {(['All', 'Nearby', 'Expiring Soon'] as const).map((tab) => {
          const isActive = foodFilterTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setFoodFilterTab(tab)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                isActive
                  ? 'bg-[#087A28] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#087A28]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food by name, location..."
          className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-100 text-[#087A28] border border-emerald-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Interactive Leaflet Map showing receiver position + nearby food pins */}
      {availableMapOpen && (filteredListings.length > 0 || userCoords) && (
        <div className="mb-3 shrink-0">
          <LeafletMap
            userPoint={
              userCoords
                ? {
                    lat: userCoords.latitude,
                    lng: userCoords.longitude,
                    label: isUsingFallback
                      ? `Fallback: ${fallbackLocation?.label || 'Selected address'}`
                      : 'Your current location',
                  }
                : null
            }
            foodMarkers={filteredListings.map(({ food, computedDistanceKm }) => ({
              id: food.id,
              lat: food.latitude,
              lng: food.longitude,
              title: food.foodName,
              subtitle:
                computedDistanceKm !== null
                  ? `${formatDistanceKm(computedDistanceKm)} • ${food.quantity}`
                  : `${food.quantity} • ${food.pickupLocation.split(',')[0]}`,
            }))}
            onSelectFood={(id) => setActiveScreen('details', id)}
            heightClass="h-44"
            zoom={13}
          />
        </div>
      )}

      {/* Food Cards List matching Screen 5 in reference poster */}
      <div className="flex-1 space-y-2.5">
        {filteredListings.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-emerald-300">
            <span className="text-3xl mb-2 block">🥗</span>
            <h4 className="text-xs font-bold text-slate-800 font-heading">
              {foodListings.length === 0 ? '0 Surplus Food Listings' : 'No Food Listings Found'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              {foodListings.length === 0
                ? 'No surplus food donations are currently available. Check back soon or recreate sample records.'
                : 'Try adjusting your search query or category filters.'}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              {foodListings.length === 0 ? (
                <button
                  onClick={seedPosterRecords}
                  className="px-3.5 py-1.5 bg-emerald-50 text-[#087A28] border border-emerald-200 text-xs font-bold rounded-xl"
                >
                  Recreate Records
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setFoodFilterTab('All');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-50 text-[#087A28] border border-emerald-200 text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredListings.map(({ food, computedDistanceKm }) => (
            <div
              key={food.id}
              onClick={() => setActiveScreen('details', food.id)}
              className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition cursor-pointer group"
            >
              {/* Food Image with veg badge */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={food.imageUrl}
                  alt={food.foodName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-1 left-1 w-3 h-3 bg-white rounded-xs border border-emerald-600 flex items-center justify-center p-0.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
              </div>

              {/* Food details matching reference card */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate min-w-0">
                    {food.foodName}
                  </h4>
                  {food.foodType === 'veg' && (
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold shrink-0">
                      Veg
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {food.quantity} •{' '}
                  <span className="text-amber-700 font-semibold">
                    {food.availableUntil.includes('Today')
                      ? food.availableUntil.replace('Today,', '')
                      : '3 hrs'}{' '}
                    left
                  </span>
                </p>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 min-w-0">
                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {computedDistanceKm !== null
                      ? `${formatDistanceKm(computedDistanceKm)} • `
                      : ''}
                    {food.pickupLocation.split(',')[0]}
                  </span>
                </div>
              </div>

              {/* Request Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRequestTargetFoodId(food.id);
                  setRequestSuccess(false);
                }}
                className="px-3 py-1.5 bg-[#087A28] hover:bg-[#066521] text-white text-[11px] font-bold rounded-xl shadow-2xs active:scale-95 transition shrink-0"
              >
                Request
              </button>
            </div>
          ))
        )}
      </div>

      {/* Request Modal */}
      {requestTargetFoodId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full shadow-xl">
            {requestSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#087A28] mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900">Request Sent!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The donor will review and confirm pickup location.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Request Food Donation
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Coordinate pickup with donor upon approval.
                </p>

                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Pickup Note (optional):
                  </label>
                  <input
                    type="text"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g. Volunteer arriving at 6:30 PM"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setRequestTargetFoodId(null)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestSubmit}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#087A28] hover:bg-[#066521] rounded-xl shadow-xs"
                  >
                    Confirm Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
