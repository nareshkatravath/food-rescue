import React, { useState, useMemo } from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { FoodRescueLogo, GlobeIllustration } from './FoodRescueLogo';
import { useLocation } from '../hooks/useLocation';
import { haversineDistanceKm, formatDistanceKm } from '../utils/geo';
import {
  Bell,
  Utensils,
  Search,
  Package,
  BarChart3,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Award,
  Inbox,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HomeScreen: React.FC = () => {
  const {
    currentUser,
    foodListings,
    requests,
    adminStats,
    unreadCount,
    setActiveScreen,
    setAdminTab,
    setDonorRequestsTab,
    setAvailableMapOpen,
    requestFood,
    seedPosterRecords,
  } = useFoodRescue();

  const role = currentUser?.userType;
  const isDonor = role === 'donor';
  const isReceiverOrNgo = role === 'receiver' || role === 'ngo';
  const isAdmin = role === 'admin';

  const { coords: userCoords } = useLocation({ watch: isReceiverOrNgo });

  const [requestModalFood, setRequestModalFood] = useState<string | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleQuickRequest = (foodId: string) => {
    if (!isReceiverOrNgo) return;
    setRequestModalFood(foodId);
    setRequestSuccess(false);
  };

  const confirmRequest = () => {
    if (!isReceiverOrNgo) return;
    if (requestModalFood) {
      const selected = foodListings.find((f) => f.id === requestModalFood);
      if (selected) {
        const ok = requestFood(selected.id, selected.quantity, requestNote);
        if (!ok) return;
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestModalFood(null);
          setRequestSuccess(false);
        }, 1500);
      }
    }
  };

  const nearbyListings = useMemo(() => {
    const withDist = foodListings.map((food) => ({
      food,
      computedDistanceKm: userCoords
        ? haversineDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            food.latitude,
            food.longitude
          )
        : null,
    }));

    if (userCoords) {
      withDist.sort((a, b) => {
        const distA = a.computedDistanceKm ?? Number.POSITIVE_INFINITY;
        const distB = b.computedDistanceKm ?? Number.POSITIVE_INFINITY;
        return distA - distB;
      });
    }

    return withDist.slice(0, 4);
  }, [foodListings, userCoords]);

  const donorListings = useMemo(() => {
    if (!currentUser) return [];
    return foodListings.filter((f) => f.donorId === currentUser.id).slice(0, 4);
  }, [foodListings, currentUser]);

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5 pt-1 shrink-0">
        <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setActiveScreen('home')}>
          <FoodRescueLogo size={28} />
          <span className="text-xl font-black font-heading tracking-tight">
            <span className="text-[#087A28]">Food</span>
            <span className="text-[#F5A623]">Rescue</span>
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {/* Notification Bell (Donor, Receiver, NGO) */}
          {!isAdmin && (
            <button
              onClick={() => setActiveScreen('notifications')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 hover:text-[#087A28] relative transition shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Logged-in User Name & Avatar */}
          <button
            onClick={() => setActiveScreen(currentUser ? 'profile' : 'login')}
            className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition min-w-0"
            title={currentUser ? `${currentUser.fullName} — View Profile` : 'Sign In'}
          >
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={currentUser.fullName}
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-emerald-200"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#087A28] text-[10px] font-bold flex items-center justify-center shrink-0">
                {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
            <span className="text-xs font-bold text-slate-700 truncate max-w-[96px] sm:max-w-[150px]">
              {currentUser?.fullName || 'Sign In'}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Banner: "Together Let's End Food Waste" */}
      <div className="w-full shrink-0 bg-gradient-to-r from-[#087A28] to-[#129437] rounded-2xl py-5 px-5 min-h-[144px] text-white shadow-sm mb-4 relative overflow-hidden flex items-center">
        {/* Soft overlay patterns */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/20 blur-xl pointer-events-none" />

        {/* Decorative globe illustration in background */}
        <div
          aria-hidden="true"
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 opacity-25 sm:opacity-35 pointer-events-none select-none"
        >
          <GlobeIllustration className="w-full h-full drop-shadow-md" />
        </div>

        <div className="relative z-10 w-full pr-16 sm:pr-28 min-w-0">
          <div className="inline-flex items-center gap-1 text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full mb-2 font-semibold text-emerald-100">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span>Mission 2026</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black leading-tight font-heading break-words">
            Together Let&apos;s End Food Waste
          </h2>
          <p className="text-xs text-emerald-100 mt-1.5 font-medium leading-snug">
            Join 1,200+ donors &amp; charities across India
          </p>
        </div>
      </div>

      {/* Role-Based Quick-Action Tiles (2x2 Grid) */}
      {isDonor && (
        <div className="grid grid-cols-2 gap-2.5 mb-5 shrink-0">
          <button
            onClick={() => setActiveScreen('post')}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Post Food</span>
            <span className="text-[10px] text-slate-400">Share surplus</span>
          </button>

          <button
            onClick={() => {
              setDonorRequestsTab('donations');
              setActiveScreen('requests');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">My Donations</span>
            <span className="text-[10px] text-slate-400">Active listings</span>
          </button>

          <button
            onClick={() => {
              setDonorRequestsTab('incoming');
              setActiveScreen('requests');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Incoming Requests</span>
            <span className="text-[10px] text-slate-400">Approve pickups</span>
          </button>

          <button
            onClick={() => setActiveScreen('impact')}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">My Impact</span>
            <span className="text-[10px] text-slate-400">Meals &amp; stats</span>
          </button>
        </div>
      )}

      {isReceiverOrNgo && (
        <div className="grid grid-cols-2 gap-2.5 mb-5 shrink-0">
          <button
            onClick={() => {
              setAvailableMapOpen(false);
              setActiveScreen('available');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Find Food</span>
            <span className="text-[10px] text-slate-400">Browse nearby</span>
          </button>

          <button
            onClick={() => setActiveScreen('requests')}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">My Requests</span>
            <span className="text-[10px] text-slate-400">Live tracking</span>
          </button>

          <button
            onClick={() => {
              setAvailableMapOpen(true);
              setActiveScreen('available');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Nearby Map</span>
            <span className="text-[10px] text-slate-400">Live pickup pins</span>
          </button>

          <button
            onClick={() => setActiveScreen('impact')}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">My Impact</span>
            <span className="text-[10px] text-slate-400">Meals rescued</span>
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-2 gap-2.5 mb-5 shrink-0">
          <button
            onClick={() => {
              setAdminTab('overview');
              setActiveScreen('admin');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Admin Dashboard</span>
            <span className="text-[10px] text-slate-400">Platform overview</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('users');
              setActiveScreen('admin');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Users</span>
            <span className="text-[10px] text-slate-400">Manage accounts</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('listings');
              setActiveScreen('admin');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Donations</span>
            <span className="text-[10px] text-slate-400">All listings</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('requests');
              setActiveScreen('admin');
            }}
            className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group active:scale-97"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Collections</span>
            <span className="text-[10px] text-slate-400">Track handoffs</span>
          </button>
        </div>
      )}

      {/* Role-Based Lower Section */}
      {isDonor && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">
              My Donations
            </h3>
            <button
              onClick={() => {
                setDonorRequestsTab('donations');
                setActiveScreen('requests');
              }}
              className="text-[11px] font-bold text-[#087A28] hover:text-[#066521] flex items-center gap-0.5"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {donorListings.length === 0 ? (
              <div className="bg-white border border-dashed border-emerald-300 rounded-3xl p-5 text-center shadow-xs flex flex-col items-center justify-center my-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-2">
                  <Utensils className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 font-heading">
                  0 Active Donations
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Share your kitchen or event surplus with nearby verified receivers and NGOs.
                </p>
                <div className="flex gap-2 mt-3 w-full max-w-xs">
                  <button
                    onClick={() => setActiveScreen('post')}
                    className="flex-1 py-2 px-3 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    + Post Food
                  </button>
                  <button
                    onClick={seedPosterRecords}
                    className="py-2 px-3 bg-emerald-50 text-[#087A28] border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold rounded-xl transition"
                  >
                    Recreate Records
                  </button>
                </div>
              </div>
            ) : (
              donorListings.map((food) => {
                const incomingCount = requests.filter(
                  (r) => r.foodId === food.id && r.requestStatus !== 'cancelled'
                ).length;
                return (
                  <div
                    key={food.id}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition cursor-pointer"
                    onClick={() => setActiveScreen('details', food.id)}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={food.imageUrl}
                        alt={food.foodName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate min-w-0">
                          {food.foodName}
                        </h4>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold capitalize shrink-0">
                          {food.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {food.quantity} • {food.availableUntil}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 min-w-0">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{food.pickupLocation}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-xl shrink-0">
                      {incomingCount} req
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {isReceiverOrNgo && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">
              Nearby Surplus Food
            </h3>
            <button
              onClick={() => setActiveScreen('available')}
              className="text-[11px] font-bold text-[#087A28] hover:text-[#066521] flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {nearbyListings.length === 0 ? (
              <div className="bg-white border border-dashed border-emerald-300 rounded-3xl p-5 text-center shadow-xs flex flex-col items-center justify-center my-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-2">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 font-heading">
                  0 Surplus Food Records
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  No surplus food donations are posted right now. Check back shortly or load sample records.
                </p>
                <div className="flex gap-2 mt-3 w-full max-w-xs">
                  <button
                    onClick={() => setActiveScreen('available')}
                    className="flex-1 py-2 px-3 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Find Food
                  </button>
                  <button
                    onClick={seedPosterRecords}
                    className="py-2 px-3 bg-emerald-50 text-[#087A28] border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold rounded-xl transition"
                  >
                    Recreate Records
                  </button>
                </div>
              </div>
            ) : (
              nearbyListings.map(({ food, computedDistanceKm }) => (
                <div
                  key={food.id}
                  className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition cursor-pointer"
                  onClick={() => setActiveScreen('details', food.id)}
                >
                  {/* Food Image with Veg Badge */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      src={food.imageUrl}
                      alt={food.foodName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 w-3 h-3 bg-white rounded-xs border border-emerald-600 flex items-center justify-center p-0.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </span>
                  </div>

                  {/* Food Info */}
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
                          : '2 hrs'}{' '}
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
                      handleQuickRequest(food.id);
                    }}
                    className="px-3 py-1.5 bg-[#087A28] hover:bg-[#066521] text-white text-[11px] font-bold rounded-xl shadow-2xs active:scale-95 transition shrink-0"
                  >
                    Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">
              Platform Statistics
            </h3>
            <button
              onClick={() => {
                setAdminTab('statistics');
                setActiveScreen('statistics');
              }}
              className="text-[11px] font-bold text-[#087A28] hover:text-[#066521] flex items-center gap-0.5"
            >
              <span>Full Statistics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Total Donations</span>
              <span className="text-lg font-black text-slate-900 font-heading">
                {adminStats.totalDonations}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Collections</span>
              <span className="text-lg font-black text-emerald-700 font-heading">
                {adminStats.successfulCollections}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Total Users</span>
              <span className="text-lg font-black text-slate-900 font-heading">
                {adminStats.totalUsers}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Food Rescued</span>
              <span className="text-lg font-black text-[#087A28] font-heading">
                {adminStats.foodRescuedTons} Tons
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Request Confirmation Modal */}
      {requestModalFood && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full shadow-xl">
            {requestSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#087A28] mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-900">Request Sent!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The donor will be notified. Check tracking in My Requests.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Confirm Food Request
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Coordinate pickup with donor once accepted.
                </p>

                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Pickup Note / Beneficiary Count:
                  </label>
                  <input
                    type="text"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g. 20 packets for night shelter"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#087A28] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setRequestModalFood(null)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRequest}
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
