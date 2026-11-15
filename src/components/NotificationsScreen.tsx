import React, { useState, useEffect } from 'react';
import { useFoodRescue, getDefaultHomeScreen } from '../context/FoodRescueContext';
import {
  ChevronLeft,
  Bell,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Truck,
  Package,
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const {
    currentUser,
    notifications,
    setActiveScreen,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
  } = useFoodRescue();

  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

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

  const displayedNotifications =
    filter === 'Unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleNotificationClick = (id: string, relatedId?: string) => {
    markNotificationRead(id);
    if (relatedId) {
      if (relatedId.startsWith('food_')) {
        setActiveScreen('details', relatedId);
      } else if (relatedId.startsWith('req_')) {
        setActiveScreen('requests');
      }
    }
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
        <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-1.5">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h2>
        <button
          onClick={markAllNotificationsRead}
          className="text-[10px] font-bold text-[#087A28] hover:underline flex items-center gap-0.5"
          title="Mark all as read"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Read all</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setFilter('All')}
          className={`py-1 px-3 rounded-full text-xs font-bold transition ${
            filter === 'All'
              ? 'bg-[#087A28] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={`py-1 px-3 rounded-full text-xs font-bold transition ${
            filter === 'Unread'
              ? 'bg-[#087A28] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 space-y-2.5">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800">No Notifications</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              You will receive push alerts when new food is posted or requests change.
            </p>
          </div>
        ) : (
          displayedNotifications.map((notif) => {
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.relatedId)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  !notif.isRead
                    ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-100 shadow-2xs opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'new_food'
                      ? 'bg-emerald-100 text-[#087A28]'
                      : notif.type === 'request_approved'
                      ? 'bg-blue-100 text-blue-700'
                      : notif.type === 'expiry_alert'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {notif.type === 'new_food' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : notif.type === 'request_approved' ? (
                    <Truck className="w-4 h-4" />
                  ) : notif.type === 'expiry_alert' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-1">
                      {notif.createdAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#087A28] shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
