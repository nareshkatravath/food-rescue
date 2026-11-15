import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  FoodListing,
  FoodRequest,
  AppNotification,
  AdminStats,
  RequestStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FOOD_LISTINGS,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

export type ScreenName =
  | 'splash'
  | 'login'
  | 'home'
  | 'post'
  | 'available'
  | 'details'
  | 'requests'
  | 'notifications'
  | 'impact'
  | 'profile'
  | 'admin'
  | 'statistics';

export type AdminTab = 'overview' | 'users' | 'listings' | 'requests' | 'statistics';
export type DonorRequestsTab = 'donations' | 'incoming';

export type BottomTab =
  | 'home'
  | 'post'
  | 'available'
  | 'requests'
  | 'notifications'
  | 'impact'
  | 'profile'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-listings'
  | 'admin-requests'
  | 'admin-statistics';

const VALID_SCREENS: ScreenName[] = [
  'splash',
  'login',
  'home',
  'post',
  'available',
  'details',
  'requests',
  'notifications',
  'impact',
  'profile',
  'admin',
  'statistics',
];

export function getDefaultHomeScreen(role?: UserRole): ScreenName {
  if (!role) return 'login';
  if (role === 'admin') return 'admin';
  return 'home';
}

export function canAccessScreen(role: UserRole | undefined, screen: ScreenName): boolean {
  if (!role) {
    return screen === 'splash' || screen === 'login';
  }
  if (screen === 'splash' || screen === 'login') {
    return true;
  }
  switch (role) {
    case 'donor':
      return ['home', 'post', 'details', 'requests', 'notifications', 'impact', 'profile'].includes(
        screen
      );
    case 'receiver':
    case 'ngo':
      return [
        'home',
        'available',
        'details',
        'requests',
        'notifications',
        'impact',
        'profile',
      ].includes(screen);
    case 'admin':
      return ['admin', 'statistics', 'home', 'details', 'profile'].includes(screen);
    default:
      return false;
  }
}

export function resolveAuthorizedScreen(
  role: UserRole | undefined,
  requestedScreen: ScreenName
): ScreenName {
  if (canAccessScreen(role, requestedScreen)) {
    return requestedScreen;
  }
  return getDefaultHomeScreen(role);
}

function parseScreenFromUrl(): ScreenName | null {
  if (typeof window === 'undefined') return null;
  const hashClean = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (VALID_SCREENS.includes(hashClean as ScreenName)) {
    return hashClean as ScreenName;
  }
  const pathClean = window.location.pathname.replace(/^\/+/, '').split('/')[0].trim().toLowerCase();
  if (VALID_SCREENS.includes(pathClean as ScreenName)) {
    return pathClean as ScreenName;
  }
  return null;
}

interface FoodRescueContextType {
  currentUser: User | null;
  users: User[];
  foodListings: FoodListing[];
  requests: FoodRequest[];
  notifications: AppNotification[];
  activeScreen: ScreenName;
  activeBottomTab: BottomTab;
  selectedFoodId: string | null;
  adminTab: AdminTab;
  donorRequestsTab: DonorRequestsTab;
  availableMapOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  foodFilterTab: 'All' | 'Nearby' | 'Expiring Soon';
  adminStats: AdminStats;
  unreadCount: number;

  // Navigation & View state
  login: (email: string, role?: UserRole) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  setActiveScreen: (screen: ScreenName, foodId?: string) => void;
  setActiveBottomTab: (tab: BottomTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setDonorRequestsTab: (tab: DonorRequestsTab) => void;
  setAvailableMapOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setFoodFilterTab: (tab: 'All' | 'Nearby' | 'Expiring Soon') => void;

  // Role-guarded Write Operations
  addFoodListing: (
    newListing: Omit<
      FoodListing,
      'id' | 'createdAt' | 'status' | 'donorId' | 'donorName' | 'donorPhone' | 'distanceKm'
    >
  ) => boolean;
  deleteFoodListing: (id: string) => boolean;
  requestFood: (foodId: string, quantity: string, notes?: string) => boolean;
  updateRequestStatus: (requestId: string, status: RequestStatus, note?: string) => boolean;

  // Notifications & Admin User Management
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleUserActive: (userId: string) => boolean;
  deleteUser: (userId: string) => boolean;
  resetToZero: () => boolean;
  seedPosterRecords: () => void;
}

const FoodRescueContext = createContext<FoodRescueContextType | undefined>(undefined);

export const FoodRescueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('foodrescue_zero_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('foodrescue_zero_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [foodListings, setFoodListings] = useState<FoodListing[]>(() => {
    const saved = localStorage.getItem('foodrescue_zero_listings');
    return saved ? JSON.parse(saved) : [];
  });

  const [requests, setRequests] = useState<FoodRequest[]>(() => {
    const saved = localStorage.getItem('foodrescue_zero_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('foodrescue_zero_notifications');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'notif_welcome',
            userId: 'all',
            title: 'FoodRescue Platform Ready (0 Records)',
            message:
              'All previous records have been reset. You can now post new surplus food and track donations from zero.',
            type: 'new_food',
            isRead: false,
            createdAt: 'Just now',
          },
        ];
  });

  const [activeScreen, setActiveScreenState] = useState<ScreenName>(() => {
    const urlScreen = parseScreenFromUrl();
    const initialRole = currentUser?.userType;
    return resolveAuthorizedScreen(initialRole, urlScreen || getDefaultHomeScreen(initialRole));
  });

  const [activeBottomTab, setActiveBottomTabState] = useState<BottomTab>(() => {
    return currentUser?.userType === 'admin' ? 'admin-overview' : 'home';
  });
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [donorRequestsTab, setDonorRequestsTab] = useState<DonorRequestsTab>('donations');
  const [availableMapOpen, setAvailableMapOpen] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodFilterTab, setFoodFilterTab] = useState<'All' | 'Nearby' | 'Expiring Soon'>('All');

  useEffect(() => {
    localStorage.setItem('foodrescue_zero_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('foodrescue_zero_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('foodrescue_zero_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('foodrescue_zero_listings', JSON.stringify(foodListings));
  }, [foodListings]);

  useEffect(() => {
    localStorage.setItem('foodrescue_zero_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('foodrescue_zero_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const syncBottomTabForScreen = useCallback(
    (screen: ScreenName, currentAdminTab: AdminTab) => {
      if (screen === 'home') setActiveBottomTabState('home');
      else if (screen === 'post') setActiveBottomTabState('post');
      else if (screen === 'available') setActiveBottomTabState('available');
      else if (screen === 'requests') setActiveBottomTabState('requests');
      else if (screen === 'notifications') setActiveBottomTabState('notifications');
      else if (screen === 'impact') setActiveBottomTabState('impact');
      else if (screen === 'profile') setActiveBottomTabState('profile');
      else if (screen === 'statistics') setActiveBottomTabState('admin-statistics');
      else if (screen === 'admin') {
        setActiveBottomTabState(`admin-${currentAdminTab}` as BottomTab);
      }
    },
    []
  );

  const navigateWithRole = useCallback(
    (role: UserRole | undefined, screen: ScreenName, foodId?: string) => {
      const authorized = resolveAuthorizedScreen(role, screen);
      setActiveScreenState(authorized);
      if (role === 'admin' && authorized === 'statistics') {
        setAdminTab('statistics');
      }
      if (foodId && canAccessScreen(role, screen)) {
        setSelectedFoodId(foodId);
      }
      if (typeof window !== 'undefined') {
        const targetHash = `#/${authorized}`;
        if (window.location.hash !== targetHash) {
          window.history.replaceState(null, '', targetHash);
        }
      }
      syncBottomTabForScreen(authorized, role === 'admin' && authorized === 'statistics' ? 'statistics' : adminTab);
    },
    [adminTab, syncBottomTabForScreen]
  );

  const setActiveScreen = useCallback(
    (screen: ScreenName, foodId?: string) => {
      navigateWithRole(currentUser?.userType, screen, foodId);
    },
    [currentUser?.userType, navigateWithRole]
  );

  // Enforce route guard whenever hash changes directly or user role changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseScreenFromUrl();
      if (parsed) {
        navigateWithRole(currentUser?.userType, parsed);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser?.userType, navigateWithRole]);

  useEffect(() => {
    if (!canAccessScreen(currentUser?.userType, activeScreen)) {
      navigateWithRole(currentUser?.userType, getDefaultHomeScreen(currentUser?.userType));
    }
  }, [currentUser?.userType, activeScreen, navigateWithRole]);

  const setActiveBottomTab = (tab: BottomTab) => {
    const role = currentUser?.userType;
    if (tab === 'home') {
      setActiveScreen('home');
      return;
    }
    if (tab === 'post') {
      setActiveScreen('post');
      return;
    }
    if (tab === 'available') {
      setActiveScreen('available');
      return;
    }
    if (tab === 'requests') {
      setActiveScreen('requests');
      return;
    }
    if (tab === 'notifications') {
      setActiveScreen('notifications');
      return;
    }
    if (tab === 'impact') {
      setActiveScreen('impact');
      return;
    }
    if (tab === 'profile') {
      setActiveScreen('profile');
      return;
    }
    if (tab.startsWith('admin-') && role === 'admin') {
      const subTab = tab.replace('admin-', '') as AdminTab;
      setAdminTab(subTab);
      setActiveBottomTabState(tab);
      setActiveScreen(subTab === 'statistics' ? 'statistics' : 'admin');
      return;
    }
    setActiveScreen(getDefaultHomeScreen(role));
  };

  const login = (email: string, role?: UserRole): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      navigateWithRole(existing.userType, getDefaultHomeScreen(existing.userType));
      return true;
    }

    const targetRole: UserRole = role || 'receiver';
    const formattedName =
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()) || 'New Rescuer';
    const newUser: User = {
      id: `user_${targetRole}_${Date.now()}`,
      fullName: formattedName,
      email: cleanEmail,
      phone: '+91 98765 43210',
      userType: targetRole,
      organizationName:
        targetRole === 'donor'
          ? 'Surplus Food Partner'
          : targetRole === 'ngo'
          ? 'Asha Hunger Relief NGO'
          : targetRole === 'admin'
          ? 'FoodRescue Operations'
          : '',
      address: 'Bengaluru, Karnataka, India',
      profileImage:
        targetRole === 'donor'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : targetRole === 'ngo'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : targetRole === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    navigateWithRole(newUser.userType, getDefaultHomeScreen(newUser.userType));
    return true;
  };

  const register = (userData: Partial<User>): boolean => {
    const targetRole: UserRole = userData.userType || 'receiver';
    const newUser: User = {
      id: `user_${targetRole}_${Date.now()}`,
      fullName: userData.fullName || 'New Food Rescuer',
      email: userData.email || 'user@example.com',
      phone: userData.phone || '+91 98765 00000',
      userType: targetRole,
      organizationName: userData.organizationName || '',
      address: userData.address || 'Bengaluru, India',
      profileImage:
        targetRole === 'donor'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : targetRole === 'ngo'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : targetRole === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    navigateWithRole(newUser.userType, getDefaultHomeScreen(newUser.userType));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    navigateWithRole(undefined, 'login');
  };

  // Write guard: creating a donation requires role === 'donor'
  const addFoodListing = (
    newListingData: Omit<
      FoodListing,
      'id' | 'createdAt' | 'status' | 'donorId' | 'donorName' | 'donorPhone' | 'distanceKm'
    >
  ): boolean => {
    if (!currentUser || currentUser.userType !== 'donor') {
      return false;
    }

    const newListing: FoodListing = {
      ...newListingData,
      id: `food_${Date.now()}`,
      donorId: currentUser.id,
      donorName: currentUser.organizationName || currentUser.fullName,
      donorPhone: currentUser.phone,
      donorOrg: currentUser.organizationName,
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    setFoodListings((prev) => [newListing, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'all',
      title: 'New Food Posted!',
      message: `${newListing.foodName} (${newListing.quantity}) is available for pickup at ${newListing.pickupLocation}.`,
      type: 'new_food',
      isRead: false,
      createdAt: 'Just now',
      relatedId: newListing.id,
    };
    setNotifications((prev) => [notif, ...prev]);
    return true;
  };

  // Write guard: deleting a listing requires admin or owning donor
  const deleteFoodListing = (id: string): boolean => {
    if (!currentUser) return false;
    const target = foodListings.find((item) => item.id === id);
    if (!target) return false;
    const isAuthorized =
      currentUser.userType === 'admin' ||
      (currentUser.userType === 'donor' && target.donorId === currentUser.id);
    if (!isAuthorized) return false;

    setFoodListings((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  // Write guard: creating a request requires role === 'receiver' or 'ngo'
  const requestFood = (foodId: string, quantity: string, notes?: string): boolean => {
    if (
      !currentUser ||
      (currentUser.userType !== 'receiver' && currentUser.userType !== 'ngo')
    ) {
      return false;
    }

    const food = foodListings.find((f) => f.id === foodId);
    if (!food) return false;

    const newRequest: FoodRequest = {
      id: `req_${Date.now()}`,
      foodId: food.id,
      foodName: food.foodName,
      foodImageUrl: food.imageUrl,
      category: food.category,
      donorId: food.donorId,
      donorName: food.donorName,
      donorPhone: food.donorPhone,
      receiverId: currentUser.id,
      receiverName: currentUser.fullName,
      receiverOrg: currentUser.organizationName,
      receiverPhone: currentUser.phone,
      quantityRequested: quantity || food.quantity,
      pickupLocation: food.pickupLocation,
      pickupTime: food.availableUntil,
      requestStatus: 'requested',
      statusHistory: [
        {
          status: 'requested',
          timestamp: 'Just now',
          note: notes || 'Request placed via FoodRescue app',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);

    const donorNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: food.donorId,
      title: 'New Food Request Received',
      message: `${currentUser.fullName} requested ${quantity || food.quantity} of ${food.foodName}.`,
      type: 'request_received',
      isRead: false,
      createdAt: 'Just now',
      relatedId: newRequest.id,
    };
    setNotifications((prev) => [donorNotif, ...prev]);

    return true;
  };

  // Write guard: check role & ownership before updating request status
  const updateRequestStatus = (
    requestId: string,
    nextStatus: RequestStatus,
    note?: string
  ): boolean => {
    if (!currentUser) return false;

    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return false;

    const isAdmin = currentUser.userType === 'admin';
    const isOwningDonor =
      currentUser.userType === 'donor' && targetReq.donorId === currentUser.id;
    const isOwningReceiver =
      (currentUser.userType === 'receiver' || currentUser.userType === 'ngo') &&
      targetReq.receiverId === currentUser.id;

    if (nextStatus === 'pickup_in_progress' && !isAdmin && !isOwningDonor) {
      return false;
    }
    if (
      (nextStatus === 'collected' || nextStatus === 'cancelled') &&
      !isAdmin &&
      !isOwningDonor &&
      !isOwningReceiver
    ) {
      return false;
    }

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updatedHistory = [
            ...req.statusHistory,
            {
              status: nextStatus,
              timestamp: 'Just now',
              note: note || `Status updated to ${nextStatus.replace('_', ' ')}`,
            },
          ];

          if (nextStatus === 'collected') {
            setFoodListings((listings) =>
              listings.map((l) => (l.id === req.foodId ? { ...l, status: 'collected' } : l))
            );
          }

          return {
            ...req,
            requestStatus: nextStatus,
            statusHistory: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );

    let notifType: AppNotification['type'] = 'request_approved';
    let title = 'Request Status Updated';
    let msg = `Your request for ${targetReq.foodName} is now ${nextStatus.replace('_', ' ')}.`;

    if (nextStatus === 'pickup_in_progress') {
      notifType = 'request_approved';
      title = 'Pickup in Progress!';
      msg = `Donor approved your pickup for ${targetReq.foodName}. You can proceed to ${targetReq.pickupLocation}.`;
    } else if (nextStatus === 'collected') {
      notifType = 'food_collected';
      title = 'Collection Completed! 🎉';
      msg = `${targetReq.foodName} has been confirmed as collected. Thank you for rescuing food!`;
    } else if (nextStatus === 'cancelled') {
      notifType = 'request_rejected';
      title = 'Request Cancelled';
      msg = `The request for ${targetReq.foodName} was cancelled.`;
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: targetReq.receiverId,
      title,
      message: msg,
      type: notifType,
      isRead: false,
      createdAt: 'Just now',
      relatedId: requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
    return true;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Write guard: toggling user active state requires role === 'admin'
  const toggleUserActive = (userId: string): boolean => {
    if (!currentUser || currentUser.userType !== 'admin') return false;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    return true;
  };

  // Write guard: deleting a user requires role === 'admin'
  const deleteUser = (userId: string): boolean => {
    if (!currentUser || currentUser.userType !== 'admin') return false;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  // Write guard: resetting platform records requires role === 'admin'
  const resetToZero = (): boolean => {
    if (!currentUser || currentUser.userType !== 'admin') return false;
    setFoodListings([]);
    setRequests([]);
    setNotifications([
      {
        id: `notif_zero_${Date.now()}`,
        userId: 'all',
        title: 'FoodRescue Restarted from Zero',
        message:
          'All previous records cleared. You are starting fresh with 0 donations, 0 requests, and 0 rescued food.',
        type: 'new_food',
        isRead: false,
        createdAt: 'Just now',
      },
    ]);
    localStorage.removeItem('foodrescue_zero_listings');
    localStorage.removeItem('foodrescue_zero_requests');
    localStorage.removeItem('foodrescue_zero_notifications');
    localStorage.removeItem('foodrescue_listings');
    localStorage.removeItem('foodrescue_requests');
    localStorage.removeItem('foodrescue_notifications');
    navigateWithRole(currentUser.userType, getDefaultHomeScreen(currentUser.userType));
    return true;
  };

  const seedPosterRecords = () => {
    if (!currentUser) return;
    setFoodListings(INITIAL_FOOD_LISTINGS);
    setRequests(INITIAL_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    navigateWithRole(currentUser.userType, getDefaultHomeScreen(currentUser.userType));
  };

  const totalDonations = foodListings.length + requests.length;
  const successfulCollections = requests.filter((r) => r.requestStatus === 'collected').length;
  const totalUsers = users.length;

  let totalKgRescued = 0;
  requests
    .filter((r) => r.requestStatus === 'collected')
    .forEach((r) => {
      const match = r.quantityRequested.match(/(\d+(\.\d+)?)/);
      totalKgRescued += match ? parseFloat(match[1]) : 5;
    });

  const foodRescuedTons = +(totalKgRescued / 1000).toFixed(3);

  const currentMonthDonations = totalDonations;
  const currentMonthCollections = successfulCollections;
  const adminStats: AdminStats = {
    totalDonations,
    successfulCollections,
    totalUsers,
    foodRescuedTons,
    monthlyDonations: [
      { month: 'Aug', donations: 0, collections: 0 },
      { month: 'Sep', donations: 0, collections: 0 },
      { month: 'Oct', donations: currentMonthDonations, collections: currentMonthCollections },
      { month: 'Nov', donations: 0, collections: 0 },
      { month: 'Dec', donations: 0, collections: 0 },
    ],
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <FoodRescueContext.Provider
      value={{
        currentUser,
        users,
        foodListings,
        requests,
        notifications,
        activeScreen,
        activeBottomTab,
        selectedFoodId,
        adminTab,
        donorRequestsTab,
        availableMapOpen,
        searchQuery,
        selectedCategory,
        foodFilterTab,
        adminStats,
        unreadCount,
        login,
        register,
        logout,
        setActiveScreen,
        setActiveBottomTab,
        setAdminTab,
        setDonorRequestsTab,
        setAvailableMapOpen,
        setSearchQuery,
        setSelectedCategory,
        setFoodFilterTab,
        addFoodListing,
        deleteFoodListing,
        requestFood,
        updateRequestStatus,
        markNotificationRead,
        markAllNotificationsRead,
        toggleUserActive,
        deleteUser,
        resetToZero,
        seedPosterRecords,
      }}
    >
      {children}
    </FoodRescueContext.Provider>
  );
};

export const useFoodRescue = () => {
  const context = useContext(FoodRescueContext);
  if (!context) {
    throw new Error('useFoodRescue must be used within a FoodRescueProvider');
  }
  return context;
};
