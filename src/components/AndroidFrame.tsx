import React, { useEffect } from 'react';
import {
  useFoodRescue,
  canAccessScreen,
  getDefaultHomeScreen,
} from '../context/FoodRescueContext';
import { BottomNavBar } from './BottomNavBar';
import { SplashScreen } from './SplashScreen';
import { LoginScreen } from './LoginScreen';
import { HomeScreen } from './HomeScreen';
import { PostFoodScreen } from './PostFoodScreen';
import { AvailableFoodScreen } from './AvailableFoodScreen';
import { FoodDetailsScreen } from './FoodDetailsScreen';
import { RequestsScreen } from './RequestsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ProfileScreen } from './ProfileScreen';
import { MyImpactScreen } from './MyImpactScreen';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { OfflineIndicator } from './PWAInstallButton';

export const AndroidFrame: React.FC = () => {
  const { activeScreen, currentUser, setActiveScreen } = useFoodRescue();
  const role = currentUser?.userType;

  const isAuthorized = canAccessScreen(role, activeScreen);
  const safeScreen = isAuthorized ? activeScreen : getDefaultHomeScreen(role);

  useEffect(() => {
    if (!isAuthorized) {
      setActiveScreen(getDefaultHomeScreen(role));
    }
  }, [isAuthorized, role, setActiveScreen]);

  // Render current authorized screen
  const renderScreen = () => {
    switch (safeScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'post':
        return role === 'donor' ? <PostFoodScreen /> : <HomeScreen />;
      case 'available':
        return role === 'receiver' || role === 'ngo' ? (
          <AvailableFoodScreen />
        ) : (
          <HomeScreen />
        );
      case 'details':
        return <FoodDetailsScreen />;
      case 'requests':
        return <RequestsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'impact':
        return role === 'donor' || role === 'receiver' || role === 'ngo' ? (
          <MyImpactScreen />
        ) : (
          <AdminDashboardScreen />
        );
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
      case 'statistics':
        return role === 'admin' ? <AdminDashboardScreen /> : <HomeScreen />;
      default:
        return role === 'admin' ? <AdminDashboardScreen /> : <HomeScreen />;
    }
  };

  const showBottomNav =
    Boolean(currentUser) &&
    safeScreen !== 'splash' &&
    safeScreen !== 'login' &&
    safeScreen !== 'details';

  return (
    <div
      className="h-dvh w-full bg-[#FFFDF2] text-slate-900 overflow-hidden flex flex-col relative font-sans select-none"
      style={{ backgroundColor: '#FFFDF2' }}
    >
      {/* Screen Content Body with Smooth Scrolling */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative">
        {renderScreen()}
      </div>

      {/* Offline PWA indicator */}
      <OfflineIndicator />

      {/* Role-based Bottom Navigation Bar */}
      {showBottomNav && <BottomNavBar />}
    </div>
  );
};
