import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Pages
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import NotFound from './pages/common/NotFound';
import Unauthorized from './pages/common/Unauthorized';
import AboutUs from './pages/common/AboutUs';
import Terms from './pages/common/Terms';
import PrivacyPolicy from './pages/common/PrivacyPolicy';
import Profile from './pages/common/Profile';
import ChatPage from './pages/common/ChatPage'; // ✅ Add ChatPage

// Admin Pages
import UserList from './pages/admin/UserList';
import Reports from './pages/admin/Reports';
import ApproveSellers from './pages/admin/ApproveSellers';
import UserActions from './pages/admin/UserActions';
import AdminDashboard from './pages/admin/AdminDashboard';
import Trash from './pages/admin/Trash';

// Buyer Pages
import ProductsList from './pages/buyer/ProductsList';
import ProductDetails from './pages/buyer/ProductDetails';
import Cart from './pages/buyer/Cart';
import Downloads from './pages/buyer/Downloads';
import Orders from './pages/buyer/Orders';
import OrderDetails from './pages/buyer/OrderDetails';
import PaymentSuccess from './pages/buyer/PaymentSuccess';
import Wishlist from './pages/buyer/Wishlist';
import Report from './pages/buyer/Report';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import UploadProduct from './pages/seller/UploadProduct';
import ManageProducts from './pages/seller/ManageProducts';
import Coupons from './pages/seller/Coupons';
import SalesReport from './pages/seller/SalesReport';
import Payouts from './pages/seller/Payouts';
import SellerOrders from './pages/seller/Orders';
import SellerOrderDetails from './pages/seller/OrderDetails';
import UnderVerification from './pages/seller/UnderVerification';

// Protected Route Wrappers
const RequireRole = ({ children, role }) => {
  const { userRole } = useContext(AuthContext);

  if (!userRole) return <Navigate to="/login" />;
  if (userRole !== role) return <Unauthorized />;

  return children;
};

export default function App() {
  return (
    <>
      <Routes>
        {/* 🌐 Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* 🛡️ Admin Routes */}
        <Route element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/approve-sellers" element={<ApproveSellers />} />
          <Route path="/user-actions" element={<UserActions />} />
          <Route path="/trash" element={<Trash />} />
        </Route>

        {/* 🛒 Buyer Routes */}
        <Route element={<RequireRole role="buyer"><BuyerLayout /></RequireRole>}>
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/report" element={<Report />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
        </Route>

        {/* 🧾 Seller Routes */}
        <Route element={<RequireRole role="seller"><SellerLayout /></RequireRole>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadProduct />} />
          <Route path="/manage-products" element={<ManageProducts />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/seller-orders" element={<SellerOrders />} />
          <Route path="/seller-orders/:orderId" element={<SellerOrderDetails />} />
          <Route path="/sales-report" element={<SalesReport />} />
          <Route path="/payouts" element={<Payouts />} />
        </Route>
        
        <Route path="/under-verification" element={<UnderVerification />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
