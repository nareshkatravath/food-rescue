import React, { useState, useEffect } from 'react';
import { useFoodRescue, AdminTab, getDefaultHomeScreen } from '../context/FoodRescueContext';
import { SDG_DETAILS } from '../data/mockData';
import {
  ChevronLeft,
  Utensils,
  CheckCircle2,
  Users,
  Leaf,
  Download,
  Trash2,
  Search,
  BarChart3,
  Truck,
  XCircle,
  Globe,
} from 'lucide-react';

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'listings', label: 'Donations' },
  { id: 'requests', label: 'Collections' },
  { id: 'statistics', label: 'Statistics' },
];

export const AdminDashboardScreen: React.FC = () => {
  const {
    adminStats,
    users,
    foodListings,
    requests,
    adminTab,
    setAdminTab,
    setActiveScreen,
    toggleUserActive,
    deleteUser,
    deleteFoodListing,
    updateRequestStatus,
    currentUser,
    resetToZero,
    seedPosterRecords,
  } = useFoodRescue();

  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [searchUser, setSearchUser] = useState('');

  const isAdmin = currentUser?.userType === 'admin';

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setActiveScreen(getDefaultHomeScreen(currentUser?.userType));
    }
  }, [currentUser, isAdmin, setActiveScreen]);

  if (!currentUser || !isAdmin) {
    return null;
  }

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'All' && u.userType !== userRoleFilter) return false;
    if (
      searchUser &&
      !u.fullName.toLowerCase().includes(searchUser.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchUser.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportReport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats: adminStats,
      totalUsers: users.length,
      totalActiveListings: foodListings.length,
      totalRequests: requests.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodrescue-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let rescuedKgToday = 0;
  requests
    .filter((r) => r.requestStatus === 'collected')
    .forEach((r) => {
      const match = r.quantityRequested.match(/(\d+(\.\d+)?)/);
      rescuedKgToday += match ? parseFloat(match[1]) : 5;
    });

  const renderMonthlyChart = () => (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-slate-800 font-heading flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#087A28]" />
          <span>Food Rescue Statistics</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-semibold">
          Monthly Surplus
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-32 flex items-end justify-between pt-4 px-2 pb-1 border-b border-slate-100 relative">
        <div className="absolute left-0 top-0 text-[8px] text-slate-400">
          {Math.max(10, adminStats.totalDonations)}
        </div>
        <div className="absolute left-0 top-1/2 text-[8px] text-slate-400">
          {Math.round(Math.max(10, adminStats.totalDonations) / 2)}
        </div>
        <div className="absolute left-0 bottom-1 text-[8px] text-slate-400">0</div>

        {adminStats.monthlyDonations.map((item, idx) => {
          const maxVal = Math.max(10, ...adminStats.monthlyDonations.map((m) => m.donations));
          const heightPercent =
            item.donations > 0
              ? Math.max(12, Math.min(100, Math.round((item.donations / maxVal) * 100)))
              : 4;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="text-[8px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                {item.donations}
              </div>
              <div
                className={`w-5 rounded-t-md transition-all duration-500 ${
                  item.donations > 0
                    ? 'bg-gradient-to-t from-[#087A28] to-[#66BB6A] hover:brightness-110'
                    : 'bg-slate-200'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[9px] font-bold text-slate-500 mt-1">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#087A28] shrink-0" />
          Monthly Donations {adminStats.totalDonations === 0 && '(Baseline: 0)'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToZero}
            className="text-red-600 font-bold hover:underline"
            title="Reset all records to zero"
          >
            Reset to 0
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={seedPosterRecords}
            className="text-[#087A28] font-bold hover:underline"
            title="Recreate sample records"
          >
            Recreate
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={exportReport}
            className="text-slate-600 font-bold flex items-center gap-0.5 hover:underline"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (adminTab === 'overview') {
                setActiveScreen('home');
              } else {
                setAdminTab('overview');
                setActiveScreen('admin');
              }
            }}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 font-heading truncate">
              Admin Operations
            </h2>
            <p className="text-[10px] font-semibold text-[#087A28] truncate">
              {ADMIN_TABS.find((t) => t.id === adminTab)?.label}
            </p>
          </div>
        </div>

        {/* Admin Profile Avatar */}
        <button
          onClick={() => setActiveScreen('profile')}
          className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-white border border-emerald-200 shadow-2xs hover:border-[#087A28] transition shrink-0"
          title="Admin Profile"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#087A28] shrink-0">
            <img
              src={
                currentUser.profileImage ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-800 max-w-[80px] truncate">
            {currentUser.fullName.split(' ')[0]}
          </span>
        </button>
      </div>

      {/* Management Navigation Tabs */}
      <div className="flex gap-1 mb-4 bg-white p-1 rounded-2xl border border-slate-100 shadow-2xs overflow-x-auto">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setAdminTab(tab.id);
              setActiveScreen(tab.id === 'statistics' ? 'statistics' : 'admin');
            }}
            className={`flex-1 min-w-[64px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
              adminTab === tab.id
                ? 'bg-[#087A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#087A28]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview Dashboard */}
      {adminTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setAdminTab('listings')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between text-left hover:border-orange-200 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Total Donations</span>
                <span className="text-lg font-black text-slate-900 font-heading">
                  {adminStats.totalDonations}
                </span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('requests')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between text-left hover:border-emerald-200 transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">
                  Successful Collections
                </span>
                <span className="text-lg font-black text-slate-900 font-heading">
                  {adminStats.successfulCollections}
                </span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between text-left hover:border-purple-200 transition"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Total Users</span>
                <span className="text-lg font-black text-slate-900 font-heading">
                  {adminStats.totalUsers.toLocaleString()}
                </span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('statistics')}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between text-left hover:border-emerald-300 transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#087A28] flex items-center justify-center mb-1">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Food Rescued</span>
                <span className="text-lg font-black text-[#087A28] font-heading">
                  {adminStats.foodRescuedTons} Tons
                </span>
              </div>
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Platform Health</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Active Donors:</span>
                <span className="font-bold text-slate-900">
                  {users.filter((u) => u.userType === 'donor').length}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Receivers:</span>
                <span className="font-bold text-slate-900">
                  {users.filter((u) => u.userType === 'receiver').length}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active NGOs / Charities:</span>
                <span className="font-bold text-slate-900">
                  {users.filter((u) => u.userType === 'ngo').length}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pending Pickup Requests:</span>
                <span className="font-bold text-amber-700">
                  {requests.filter((r) => r.requestStatus === 'requested').length}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Collected Weight:</span>
                <span className="font-bold text-[#087A28]">{rescuedKgToday} kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {adminTab === 'users' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-900">
              Registered Users ({filteredUsers.length})
            </h4>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg p-1"
            >
              <option value="All">All Roles</option>
              <option value="donor">Donors</option>
              <option value="receiver">Receivers</option>
              <option value="ngo">NGOs</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#087A28]"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-900 truncate min-w-0">
                      {u.fullName}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase shrink-0">
                      {u.userType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleUserActive(u.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      u.isActive
                        ? 'bg-emerald-100 text-[#087A28] hover:bg-red-100 hover:text-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-emerald-100 hover:text-[#087A28]'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete user"
                      aria-label="Delete user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Donations Moderation */}
      {adminTab === 'listings' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900">
            Manage Food Donations ({foodListings.length})
          </h4>
          {foodListings.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              0 food donation listings currently stored.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {foodListings.map((food) => (
                <div
                  key={food.id}
                  className="p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 text-xs"
                >
                  <button
                    onClick={() => setActiveScreen('details', food.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    <img
                      src={food.imageUrl}
                      alt={food.foodName}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 truncate">{food.foodName}</h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {food.quantity} • {food.donorName}
                      </p>
                    </div>
                  </button>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize shrink-0">
                    {food.status}
                  </span>

                  <button
                    onClick={() => deleteFoodListing(food.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
                    title="Remove listing"
                    aria-label="Remove listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Collections & Requests Audit */}
      {adminTab === 'requests' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900">
            Collections & Pickup Audit ({requests.length})
          </h4>
          {requests.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              0 collection requests currently recorded.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-2.5 rounded-xl border border-slate-100 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 truncate">{req.foodName}</h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {req.receiverName} ← {req.donorName}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize shrink-0">
                      {req.requestStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {(req.requestStatus === 'requested' ||
                    req.requestStatus === 'pickup_in_progress') && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-50">
                      {req.requestStatus === 'requested' && (
                        <button
                          onClick={() =>
                            updateRequestStatus(
                              req.id,
                              'pickup_in_progress',
                              'Approved by Admin'
                            )
                          }
                          className="flex-1 py-1.5 bg-[#087A28] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Approve Pickup</span>
                        </button>
                      )}
                      {req.requestStatus === 'pickup_in_progress' && (
                        <button
                          onClick={() =>
                            updateRequestStatus(
                              req.id,
                              'collected',
                              'Collection verified by Admin'
                            )
                          }
                          className="flex-1 py-1.5 bg-[#087A28] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Collected</span>
                        </button>
                      )}
                      <button
                        onClick={() =>
                          updateRequestStatus(req.id, 'cancelled', 'Cancelled by Admin')
                        }
                        className="px-2 py-1.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Full Admin Statistics (Platform Totals, Charts, and SDG Cards) */}
      {adminTab === 'statistics' && (
        <div className="space-y-4">
          {/* Platform Totals */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Total Donations</span>
              <span className="text-lg font-black text-slate-900 font-heading">
                {adminStats.totalDonations}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">
                Successful Collections
              </span>
              <span className="text-lg font-black text-emerald-700 font-heading">
                {adminStats.successfulCollections}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Total Users</span>
              <span className="text-lg font-black text-slate-900 font-heading">
                {adminStats.totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Food Rescued</span>
              <span className="text-lg font-black text-[#087A28] font-heading">
                {adminStats.foodRescuedTons} Tons
              </span>
            </div>
          </div>

          {renderMonthlyChart()}

          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Collection Breakdown</h4>
            <div className="flex justify-between text-slate-600">
              <span>Available Listings:</span>
              <span className="font-bold text-slate-900">
                {foodListings.filter((f) => f.status === 'available').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pickups In Progress:</span>
              <span className="font-bold text-amber-700">
                {requests.filter((r) => r.requestStatus === 'pickup_in_progress').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Completed Collections:</span>
              <span className="font-bold text-[#087A28]">
                {adminStats.successfulCollections}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cancelled Requests:</span>
              <span className="font-bold text-red-600">
                {requests.filter((r) => r.requestStatus === 'cancelled').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-100">
              <span>Total Food Rescued:</span>
              <span className="font-black text-[#087A28]">
                {rescuedKgToday} kg ({adminStats.foodRescuedTons} Tons)
              </span>
            </div>
          </div>

          {/* UN SDG Impact Cards */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-xs space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#087A28]" />
              <h4 className="text-xs font-black text-slate-900 font-heading">
                UN Sustainable Development Goals
              </h4>
            </div>
            <div className="space-y-2">
              {SDG_DETAILS.map((sdg) => (
                <div
                  key={sdg.number}
                  className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white font-extrabold shrink-0 shadow-2xs"
                    style={{ backgroundColor: sdg.color }}
                  >
                    <span className="text-[7px] uppercase opacity-90 leading-none">SDG</span>
                    <span className="text-sm font-black leading-none">{sdg.number}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs font-extrabold text-slate-900">{sdg.title}</h5>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sdg.badgeBg}`}
                      >
                        {sdg.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {sdg.impactText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
