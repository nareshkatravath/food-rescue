import React, { useState, useEffect } from 'react';
import { useFoodRescue, getDefaultHomeScreen } from '../context/FoodRescueContext';
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  Award,
  Heart,
  Package,
  LogOut,
  Edit2,
  CheckCircle2,
  PlusCircle,
  Bell,
  Users,
  BarChart3,
  Github,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { GitHubDownloadModal } from './GitHubDownloadModal';

function parseKgFromQuantity(quantityText: string): number {
  const match = quantityText.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    setActiveScreen,
    setAdminTab,
    requests,
    foodListings,
    adminStats,
  } = useFoodRescue();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.fullName || '');
  const [editedPhone, setEditedPhone] = useState(currentUser?.phone || '');
  const [editedAddress, setEditedAddress] = useState(currentUser?.address || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setActiveScreen('login');
    }
  }, [currentUser, setActiveScreen]);

  if (!currentUser) {
    return null;
  }

  const role = currentUser.userType;

  // Real role-specific "My Impact" metrics (zero hardcoded fallbacks)
  const myListings = foodListings.filter((f) => f.donorId === currentUser.id);
  const donorIncomingRequests = requests.filter((r) => r.donorId === currentUser.id);
  const donorCollectedKg = donorIncomingRequests
    .filter((r) => r.requestStatus === 'collected')
    .reduce((sum, r) => sum + parseKgFromQuantity(r.quantityRequested), 0);

  const myRequests = requests.filter((r) => r.receiverId === currentUser.id);
  const myCollectedRequests = myRequests.filter((r) => r.requestStatus === 'collected');
  const receiverCollectedKg = myCollectedRequests.reduce(
    (sum, r) => sum + parseKgFromQuantity(r.quantityRequested),
    0
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.fullName = editedName;
    currentUser.phone = editedPhone;
    currentUser.address = editedAddress;
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100">
        <button
          onClick={() => setActiveScreen(getDefaultHomeScreen(role))}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-extrabold text-slate-900 font-heading">
          My Impact & Profile
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-[#087A28] flex items-center gap-1 hover:underline"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      {showSavedToast && (
        <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs mb-4 text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full mx-auto mb-2 overflow-hidden border-2 border-[#087A28] p-0.5 shadow-xs relative">
          <img
            src={
              currentUser.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={currentUser.fullName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h3 className="text-base font-extrabold text-slate-900 font-heading">
          {currentUser.fullName}
        </h3>

        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#087A28] uppercase tracking-wider">
            {role === 'ngo' ? 'NGO Partner' : role}
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>

        {currentUser.organizationName && (
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {currentUser.organizationName}
          </p>
        )}

        {/* Role-specific My Impact stats row */}
        {role === 'donor' && (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">DONATIONS</span>
              <span className="text-sm font-extrabold text-slate-800">{myListings.length}</span>
            </div>
            <div className="border-x border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">INCOMING</span>
              <span className="text-sm font-extrabold text-[#087A28]">
                {donorIncomingRequests.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">RESCUED</span>
              <span className="text-sm font-extrabold text-amber-600">
                {donorCollectedKg} kg
              </span>
            </div>
          </div>
        )}

        {(role === 'receiver' || role === 'ngo') && (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">REQUESTS</span>
              <span className="text-sm font-extrabold text-slate-800">{myRequests.length}</span>
            </div>
            <div className="border-x border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">COLLECTED</span>
              <span className="text-sm font-extrabold text-[#087A28]">
                {myCollectedRequests.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">RESCUED</span>
              <span className="text-sm font-extrabold text-amber-600">
                {receiverCollectedKg} kg
              </span>
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">DONATIONS</span>
              <span className="text-sm font-extrabold text-slate-800">
                {adminStats.totalDonations}
              </span>
            </div>
            <div className="border-x border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">COLLECTIONS</span>
              <span className="text-sm font-extrabold text-[#087A28]">
                {adminStats.successfulCollections}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">RESCUED</span>
              <span className="text-sm font-extrabold text-amber-600">
                {adminStats.foodRescuedTons} Tons
              </span>
            </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3 mb-4"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={editedPhone}
              onChange={(e) => setEditedPhone(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={editedAddress}
              onChange={(e) => setEditedAddress(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#087A28] text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3 mb-4">
          <div className="flex items-center gap-3 text-xs min-w-0">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 block font-semibold">EMAIL</span>
              <span className="text-slate-800 font-medium block truncate">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs pt-2 border-t border-slate-50 min-w-0">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 block font-semibold">PHONE (INDIA)</span>
              <span className="text-slate-800 font-medium block truncate">{currentUser.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs pt-2 border-t border-slate-50 min-w-0">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-400 block font-semibold">ADDRESS</span>
              <span className="text-slate-800 font-medium block break-words">
                {currentUser.address}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Role-Specific Menu Navigation Rows */}
      <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs space-y-1 mb-4">
        {role === 'donor' && (
          <>
            <button
              onClick={() => setActiveScreen('post')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-[#087A28]" />
                <span>Post Surplus Food</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('requests')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-500" />
                <span>My Donations & Incoming Requests</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('impact')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>My Impact</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('notifications')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Notifications</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          </>
        )}

        {(role === 'receiver' || role === 'ngo') && (
          <>
            <button
              onClick={() => setActiveScreen('available')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Find Available Food</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('requests')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-500" />
                <span>My Food Requests</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('impact')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>My Impact</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => setActiveScreen('notifications')}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Notifications</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button
              onClick={() => {
                setAdminTab('overview');
                setActiveScreen('admin');
              }}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-purple-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Admin Operations Dashboard</span>
              </div>
              <span className="text-purple-400">→</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('users');
                setActiveScreen('admin');
              }}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Manage Users</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('statistics');
                setActiveScreen('statistics');
              }}
              className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#087A28]" />
                <span>Platform Statistics</span>
              </div>
              <span className="text-slate-400">→</span>
            </button>
          </>
        )}
      </div>

      {/* App Install & GitHub Download */}
      <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs space-y-1.5 mb-4">
        <button
          type="button"
          onClick={() => setShowGitHubModal(true)}
          className="w-full p-2.5 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-800 font-bold"
        >
          <div className="flex items-center gap-2.5">
            <Github className="w-4 h-4 text-slate-900" />
            <span>Download App / Source via GitHub</span>
          </div>
          <span className="text-slate-400">→</span>
        </button>

        <div className="px-1 pb-1">
          <PWAInstallButton />
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-red-200/60"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Account</span>
      </button>

      <GitHubDownloadModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
      />
    </div>
  );
};
