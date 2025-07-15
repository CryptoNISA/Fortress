

import * as React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen.tsx';
import MarketsScreen from './screens/MarketsScreen.tsx';
import SecondContractScreen from './screens/SecondContractScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import BottomNav from './components/BottomNav.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { Loader } from 'lucide-react';
import AdminRoute from './components/AdminRoute.tsx';
import AdminScreen from './screens/AdminScreen.tsx';
import TradingScreen from './screens/TradingScreen.tsx';
import AboutScreen from './screens/AboutScreen.tsx';
import SecurityScreen from './screens/SecurityScreen.tsx';
import ReferralScreen from './screens/ReferralScreen.tsx';
import OrderManagementScreen from './screens/OrderManagementScreen.tsx';
import InvestmentGuideScreen from './screens/InvestmentGuideScreen.tsx';
import CoinDetailScreen from './screens/CoinDetailScreen.tsx';

const App = () => {
  const { isLoggedIn, isInitialized } = useAuth();
  const location = useLocation();

  const pathsWithoutNav = ['/admin', '/about', '/security', '/referral', '/order-management', '/investment-guide', '/coin'];
  const hideBottomNav = pathsWithoutNav.some(path => location.pathname.startsWith(path));

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <main className={isLoggedIn && !hideBottomNav ? "pb-24" : ""}>
        <Routes>
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/markets" element={<ProtectedRoute><MarketsScreen /></ProtectedRoute>} />
          <Route path="/trading" element={<ProtectedRoute><SecondContractScreen /></ProtectedRoute>} />
          <Route path="/trading/:pair" element={<ProtectedRoute><TradingScreen /></ProtectedRoute>} />
          <Route path="/coin/:id" element={<ProtectedRoute><CoinDetailScreen /></ProtectedRoute>} />
          <Route path="/investment-guide" element={<ProtectedRoute><InvestmentGuideScreen /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><SecurityScreen /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><ReferralScreen /></ProtectedRoute>} />
          <Route path="/order-management" element={<ProtectedRoute><OrderManagementScreen /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminScreen /></AdminRoute>} />
          
          {/* If a user tries any other path, redirect them. */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/profile"} replace />} />
        </Routes>
      </main>
      {isLoggedIn && !hideBottomNav && <BottomNav />}
    </div>
  );
};

export default App;
