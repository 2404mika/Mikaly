import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { StaffAuthProvider } from './context/StaffAuthContext';
import { CartProvider } from './context/CartContext';
import { TableCartProvider } from './context/TableCartContext';
import TopNavBar from './components/layout/TopNavBar';
import BottomNavBar from './components/layout/BottomNavBar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import TableMenu from './pages/TableMenu';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import Reservations from './pages/Reservations';
import Kitchen from './pages/Kitchen';
import Delivery from './pages/Delivery';
import Cashier from './pages/Cashier';
import About from './pages/About';
import StaffLogin from './pages/StaffLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminGuard from './pages/admin/AdminGuard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminMeals from './pages/admin/AdminMeals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTables from './pages/admin/AdminTables';
import AdminOrders from './pages/admin/AdminOrders';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  return <div key={pathname} className="flex-1 animate-[fadeIn_0.3s_ease_both]">{children}</div>;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* QR Code Menu */}
            <Route path="/table-menu" element={<TableCartProvider><TableMenu /></TableCartProvider>} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />

            {/* Staff Login */}
            <Route path="/staff-login" element={<StaffAuthProvider><StaffLogin /></StaffAuthProvider>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminAuthProvider><AdminGuard><AdminLayout /></AdminGuard></AdminAuthProvider>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="meals" element={<AdminMeals />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Staff pages without nav header */}
            <Route path="/kitchen" element={<StaffAuthProvider><Kitchen /></StaffAuthProvider>} />
            <Route path="/delivery" element={<StaffAuthProvider><Delivery /></StaffAuthProvider>} />
            <Route path="/cashier" element={<StaffAuthProvider><Cashier /></StaffAuthProvider>} />

            {/* Public pages */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col bg-background text-on-background pb-24 md:pb-0">
                <TopNavBar />
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<><Home /><Footer /></>} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-tracking/:id" element={<OrderTracking />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/reservations" element={<><Reservations /><Footer /></>} />
                    <Route path="/about" element={<><About /><Footer /></>} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </PageTransition>
                <BottomNavBar />
              </div>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
