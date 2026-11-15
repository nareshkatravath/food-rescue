import React, { useState, useEffect } from 'react';
import { useFoodRescue, getDefaultHomeScreen } from '../context/FoodRescueContext';
import { FoodRequest } from '../types';
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  PlusCircle,
  Trash2,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RequestsScreen: React.FC = () => {
  const {
    requests,
    foodListings,
    currentUser,
    donorRequestsTab,
    setDonorRequestsTab,
    setActiveScreen,
    updateRequestStatus,
    deleteFoodListing,
    seedPosterRecords,
  } = useFoodRescue();

  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<FoodRequest | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmDeleteFoodId, setConfirmDeleteFoodId] = useState<string | null>(null);

  const role = currentUser?.userType;
  const isAuthorized = role === 'donor' || role === 'receiver' || role === 'ngo';

  useEffect(() => {
    if (!currentUser || !isAuthorized) {
      setActiveScreen(getDefaultHomeScreen(role));
    }
  }, [currentUser, isAuthorized, role, setActiveScreen]);

  if (!currentUser || !isAuthorized) {
    return null;
  }

  const isDonor = role === 'donor';

  // Scoped records for the logged-in user
  const myDonations = isDonor
    ? foodListings.filter((f) => f.donorId === currentUser.id)
    : [];

  const scopedRequests = isDonor
    ? requests.filter((r) => r.donorId === currentUser.id)
    : requests.filter((r) => r.receiverId === currentUser.id);

  const activeRequests = scopedRequests.filter(
    (r) => r.requestStatus === 'requested' || r.requestStatus === 'pickup_in_progress'
  );

  const completedRequests = scopedRequests.filter(
    (r) => r.requestStatus === 'collected' || r.requestStatus === 'cancelled'
  );

  const displayedRequests = activeTab === 'Active' ? activeRequests : completedRequests;

  const handleApprovePickup = (req: FoodRequest) => {
    if (!isDonor) return;
    updateRequestStatus(req.id, 'pickup_in_progress', 'Pickup approved by donor');
  };

  const handleConfirmCollected = (req: FoodRequest) => {
    const ok = updateRequestStatus(req.id, 'collected', 'Food handoff verified and completed');
    if (ok) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleConfirmCancel = (reqId: string) => {
    updateRequestStatus(
      reqId,
      'cancelled',
      isDonor ? 'Cancelled by donor' : 'Cancelled by receiver'
    );
    setConfirmCancelId(null);
  };

  const renderRequestCard = (req: FoodRequest) => {
    const stepIndex =
      req.requestStatus === 'requested'
        ? 1
        : req.requestStatus === 'pickup_in_progress'
        ? 2
        : req.requestStatus === 'collected'
        ? 3
        : 0;

    return (
      <div
        key={req.id}
        className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3 relative overflow-hidden"
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            REQ #{req.id.slice(-4)}
          </span>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
              req.requestStatus === 'collected'
                ? 'bg-emerald-100 text-emerald-800'
                : req.requestStatus === 'pickup_in_progress'
                ? 'bg-amber-100 text-amber-800'
                : req.requestStatus === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {req.requestStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress Tracking Timeline */}
        {req.requestStatus !== 'cancelled' && (
          <div className="py-2 px-1">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
              <div
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#087A28] transition-all duration-500 z-0"
                style={{
                  width:
                    stepIndex === 1
                      ? '0%'
                      : stepIndex === 2
                      ? '50%'
                      : '100%',
                }}
              />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition ${
                    stepIndex >= 1
                      ? 'bg-[#087A28] text-white ring-4 ring-emerald-50'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 mt-1 text-center">
                  Requested
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition ${
                    stepIndex >= 2
                      ? 'bg-[#087A28] text-white ring-4 ring-emerald-50'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 mt-1 text-center">
                  Pickup<br />in Progress
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition ${
                    stepIndex >= 3
                      ? 'bg-[#087A28] text-white ring-4 ring-emerald-50'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 mt-1 text-center">
                  Collected
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card Main Body */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <img
              src={req.foodImageUrl}
              alt={req.foodName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {req.foodName}
            </h4>
            <p className="text-[11px] font-bold text-[#087A28] truncate">
              {req.quantityRequested}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {isDonor
                ? `Requested by: ${req.receiverName}${req.receiverOrg ? ` (${req.receiverOrg})` : ''}`
                : `Donor: ${req.donorName}`}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 min-w-0">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Pickup by: {req.pickupTime}</span>
            </p>
          </div>
        </div>

        {/* Inline Cancel Confirmation */}
        {confirmCancelId === req.id ? (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-red-800">
              Cancel this request?
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[10px] font-bold border border-slate-200"
              >
                Keep
              </button>
              <button
                onClick={() => handleConfirmCancel(req.id)}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setSelectedRequestDetails(req)}
              className="flex-1 min-w-[100px] py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition text-center shadow-2xs"
            >
              View Details
            </button>

            {/* Only Donor can approve pickup */}
            {isDonor && req.requestStatus === 'requested' && (
              <button
                onClick={() => handleApprovePickup(req)}
                className="flex-1 min-w-[120px] py-2 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Approve Pickup
              </button>
            )}

            {/* Receiver sees awaiting status badge instead of Approve Pickup */}
            {!isDonor && req.requestStatus === 'requested' && (
              <span className="px-2.5 py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 shrink-0">
                Awaiting Approval
              </span>
            )}

            {req.requestStatus === 'pickup_in_progress' && (
              <button
                onClick={() => handleConfirmCollected(req)}
                className="flex-1 min-w-[130px] py-2 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Collected</span>
              </button>
            )}

            {req.requestStatus === 'requested' && (
              <button
                onClick={() => setConfirmCancelId(req.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                title="Cancel Request"
                aria-label="Cancel Request"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full p-4 flex flex-col bg-[#FFFDF2] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-1">
        <button
          onClick={() => setActiveScreen(getDefaultHomeScreen(role))}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#087A28] shadow-2xs active:scale-95 transition"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-extrabold text-slate-900 font-heading">
          {isDonor ? 'Donations & Requests' : 'My Requests'}
        </h2>
        <div className="w-8" />
      </div>

      {/* Donor Top Tabs: My Donations vs Incoming Requests */}
      {isDonor && (
        <div className="flex items-center gap-2 mb-3 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setDonorRequestsTab('donations')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              donorRequestsTab === 'donations'
                ? 'bg-[#087A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#087A28]'
            }`}
          >
            <span>My Donations</span>
            <span
              className={`min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                donorRequestsTab === 'donations'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {myDonations.length}
            </span>
          </button>

          <button
            onClick={() => setDonorRequestsTab('incoming')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              donorRequestsTab === 'incoming'
                ? 'bg-[#087A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#087A28]'
            }`}
          >
            <span>Incoming Requests</span>
            <span
              className={`min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                donorRequestsTab === 'incoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {scopedRequests.length}
            </span>
          </button>
        </div>
      )}

      {/* Donor: My Donations View */}
      {isDonor && donorRequestsTab === 'donations' ? (
        <div className="flex-1 space-y-3">
          {myDonations.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-emerald-300">
              <span className="text-3xl mb-2 block">🍲</span>
              <h4 className="text-xs font-bold text-slate-800 font-heading">
                0 Donations Posted
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Post surplus food so nearby receivers and NGOs can request pickup right away.
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => setActiveScreen('post')}
                  className="px-3.5 py-1.5 bg-[#087A28] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Food</span>
                </button>
              </div>
            </div>
          ) : (
            myDonations.map((food) => {
              const relatedReqCount = scopedRequests.filter(
                (r) => r.foodId === food.id && r.requestStatus !== 'cancelled'
              ).length;

              return (
                <div
                  key={food.id}
                  className="bg-white border border-slate-100 rounded-3xl p-3.5 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={food.imageUrl}
                        alt={food.foodName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate min-w-0">
                          {food.foodName}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                            food.status === 'collected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : food.status === 'available'
                              ? 'bg-emerald-50 text-[#087A28]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {food.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#087A28] mt-0.5 truncate">
                        {food.quantity}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{food.pickupLocation}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold text-slate-500">
                          Until {food.availableUntil}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {relatedReqCount} {relatedReqCount === 1 ? 'request' : 'requests'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {confirmDeleteFoodId === food.id ? (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-red-800">
                        Remove this listing?
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setConfirmDeleteFoodId(null)}
                          className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[10px] font-bold border border-slate-200"
                        >
                          Keep
                        </button>
                        <button
                          onClick={() => {
                            deleteFoodListing(food.id);
                            setConfirmDeleteFoodId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                      <button
                        onClick={() => setActiveScreen('details', food.id)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition text-center"
                      >
                        View Details
                      </button>
                      {relatedReqCount > 0 && (
                        <button
                          onClick={() => setDonorRequestsTab('incoming')}
                          className="flex-1 py-2 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl transition text-center"
                        >
                          Manage Requests
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDeleteFoodId(food.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition shrink-0"
                        title="Remove Listing"
                        aria-label="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Requests List (Receiver/NGO Requests OR Donor Incoming Requests) */
        <>
          <div className="flex items-center gap-2 mb-4 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('Active')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'Active'
                  ? 'bg-[#087A28] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#087A28]'
              }`}
            >
              <span>Active</span>
              <span
                className={`min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                  activeTab === 'Active' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {activeRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Completed')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'Completed'
                  ? 'bg-[#087A28] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#087A28]'
              }`}
            >
              <span>Completed</span>
              <span
                className={`min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                  activeTab === 'Completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {completedRequests.length}
              </span>
            </button>
          </div>

          <div className="flex-1 space-y-4">
            {displayedRequests.length === 0 ? (
              <div className="text-center py-10 px-4 bg-white rounded-3xl border border-dashed border-emerald-300">
                <span className="text-3xl mb-2 block">📦</span>
                <h4 className="text-xs font-bold text-slate-800 font-heading">
                  0 {activeTab} {isDonor ? 'Incoming Requests' : 'Requests'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {isDonor
                    ? 'Incoming pickup requests from receivers and NGOs for your surplus food will appear here.'
                    : 'Find available surplus food nearby and place a pickup request to track collection in real time.'}
                </p>
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  {isDonor ? (
                    <button
                      onClick={() => setActiveScreen('post')}
                      className="px-3.5 py-1.5 bg-[#087A28] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Post Surplus Food</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveScreen('available')}
                      className="px-3.5 py-1.5 bg-[#087A28] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Find Food</span>
                    </button>
                  )}
                  {requests.length === 0 && (
                    <button
                      onClick={seedPosterRecords}
                      className="px-3.5 py-1.5 bg-emerald-50 text-[#087A28] border border-emerald-200 text-xs font-bold rounded-xl"
                    >
                      Load Sample Records
                    </button>
                  )}
                </div>
              </div>
            ) : (
              displayedRequests.map((req) => renderRequestCard(req))
            )}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-xs w-full shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Request Audit Details</h4>
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 py-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">FOOD ITEM</span>
                <span className="font-bold text-slate-800">
                  {selectedRequestDetails.foodName} ({selectedRequestDetails.quantityRequested})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">DONOR INFO</span>
                <span className="font-medium text-slate-700">
                  {selectedRequestDetails.donorName} • {selectedRequestDetails.donorPhone}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">RECEIVER / NGO</span>
                <span className="font-medium text-slate-700">
                  {selectedRequestDetails.receiverName} ({selectedRequestDetails.receiverPhone})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">PICKUP LOCATION</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#087A28] shrink-0" />
                  <span>{selectedRequestDetails.pickupLocation}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">STATUS TIMELINE LOG</span>
                <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                  {selectedRequestDetails.statusHistory.map((h, i) => (
                    <div key={i} className="text-[10px] text-slate-600 flex justify-between gap-2">
                      <span className="font-semibold capitalize text-emerald-800">
                        • {h.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400 shrink-0">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequestDetails(null)}
              className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
