import React from 'react';
import { useFoodRescue, BottomTab } from '../context/FoodRescueContext';
import {
  Home,
  Utensils,
  Search,
  Package,
  Bell,
  Award,
  LayoutDashboard,
  Users,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab, unreadCount, currentUser } = useFoodRescue();

  if (!currentUser) return null;

  const role = currentUser.userType;

  let tabs: { id: BottomTab; label: string; icon: React.ReactNode; badge?: number }[] = [];

  if (role === 'donor') {
    tabs = [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-5 h-5" />,
      },
      {
        id: 'post',
        label: 'Post Food',
        icon: <Utensils className="w-5 h-5" />,
      },
      {
        id: 'requests',
        label: 'Donations',
        icon: <Package className="w-5 h-5" />,
      },
      {
        id: 'notifications',
        label: 'Alerts',
        icon: <Bell className="w-5 h-5" />,
        badge: unreadCount,
      },
      {
        id: 'impact',
        label: 'My Impact',
        icon: <Award className="w-5 h-5" />,
      },
    ];
  } else if (role === 'receiver' || role === 'ngo') {
    tabs = [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-5 h-5" />,
      },
      {
        id: 'available',
        label: 'Find Food',
        icon: <Search className="w-5 h-5" />,
      },
      {
        id: 'requests',
        label: 'Requests',
        icon: <Package className="w-5 h-5" />,
      },
      {
        id: 'notifications',
        label: 'Alerts',
        icon: <Bell className="w-5 h-5" />,
        badge: unreadCount,
      },
      {
        id: 'impact',
        label: 'My Impact',
        icon: <Award className="w-5 h-5" />,
      },
    ];
  } else if (role === 'admin') {
    tabs = [
      {
        id: 'admin-overview',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        id: 'admin-users',
        label: 'Users',
        icon: <Users className="w-5 h-5" />,
      },
      {
        id: 'admin-listings',
        label: 'Donations',
        icon: <Utensils className="w-5 h-5" />,
      },
      {
        id: 'admin-requests',
        label: 'Collections',
        icon: <CheckCircle2 className="w-5 h-5" />,
      },
      {
        id: 'admin-statistics',
        label: 'Statistics',
        icon: <BarChart3 className="w-5 h-5" />,
      },
    ];
  }

  return (
    <nav className="w-full bg-white border-t border-slate-100 py-1.5 px-2 flex justify-around items-center shrink-0 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = activeBottomTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveBottomTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all relative min-w-0 ${
              isActive ? 'text-[#087A28] font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {!!tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[68px] ${
                isActive ? 'font-bold text-[#087A28]' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
            {isActive && <span className="w-1 h-1 bg-[#087A28] rounded-full mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
};
