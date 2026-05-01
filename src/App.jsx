import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Add page imports here
import Home from './pages/Home';
import Staff from './pages/Staff';
import StaffOrders from './pages/StaffOrders';
import StaffProducts from './pages/StaffProducts';
import StaffCategories from './pages/StaffCategories';
import AdminAccounts from './pages/AdminAccounts';
import StaffCustomRequests from './pages/StaffCustomRequests';
import Checkout from './pages/Checkout';
import StaffHero from './pages/StaffHero';
import Category from './pages/Category';
import TrackOrder from './pages/TrackOrder';
import FAQ from './pages/FAQ';
import OrderConfirmed from './pages/OrderConfirmed';
import MyOrders from './pages/MyOrders';
import Custom from './pages/Custom';
import Pay from './pages/Pay';
import StaffPromoCodes from './pages/StaffPromoCodes';
import StaffCustomers from './pages/StaffCustomers';
import Search from './pages/Search';
import StaffStockLog from './pages/StaffStockLog';
import StaffMetrics from './pages/StaffMetrics';
import Services from './pages/Services';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-6 h-6 border-2 border-[#333] border-t-[#ff8c00] rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Staff" element={<Staff />} />
      <Route path="/StaffOrders" element={<StaffOrders />} />
      <Route path="/StaffProducts" element={<StaffProducts />} />
      <Route path="/StaffCategories" element={<StaffCategories />} />
      <Route path="/AdminAccounts" element={<AdminAccounts />} />
      <Route path="/StaffCustomRequests" element={<StaffCustomRequests />} />
      <Route path="/Checkout" element={<Checkout />} />
      <Route path="/StaffHero" element={<StaffHero />} />
      <Route path="/category/:slug" element={<Category />} />
      <Route path="/TrackOrder" element={<TrackOrder />} />
      <Route path="/FAQ" element={<FAQ />} />
      <Route path="/OrderConfirmed" element={<OrderConfirmed />} />
      <Route path="/MyOrders" element={<MyOrders />} />
      <Route path="/Custom" element={<Custom />} />
      <Route path="/Pay" element={<Pay />} />
      <Route path="/StaffPromoCodes" element={<StaffPromoCodes />} />
      <Route path="/StaffCustomers" element={<StaffCustomers />} />
      <Route path="/Search" element={<Search />} />
      <Route path="/StaffStockLog" element={<StaffStockLog />} />
      <Route path="/StaffMetrics" element={<StaffMetrics />} />
      <Route path="/Services" element={<Services />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;