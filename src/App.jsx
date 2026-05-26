import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Auth from './pages/Auth';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Customizer from './pages/Customizer';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Addresses from './pages/Addresses';
import Payments from './pages/Payments';
import MyReviews from './pages/MyReviews';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomOptions from './pages/admin/AdminCustomOptions';
import AdminSettings from './pages/admin/AdminSettings';
import AdminContent from './pages/admin/AdminContent';
import AdminReviews from './pages/admin/AdminReviews';
import FloatingSupport from './components/common/FloatingSupport';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';

function LayoutWrapper() {
  const location = useLocation();
  // Normalize pathname to handle multiple slashes like //admin
  const normalizedPathname = location.pathname.replace(/\/+/g, '/');
  const isAdminPage = normalizedPathname.startsWith('/admin');
  const isAuthPage = normalizedPathname.startsWith('/auth');
  const hideLayout = isAdminPage || isAuthPage;

  return (
    <div className="min-h-screen bg-creamy-vanilla">
      {!hideLayout && <Navbar />}
      {!hideLayout && <FloatingSupport />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/customizer" element={<Customizer />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/payment" element={<Payments />} />
        <Route path="/my-reviews" element={<MyReviews />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="options" element={<AdminCustomOptions />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="content" element={<AdminContent />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-quicksand',
              style: {
                borderRadius: '1rem',
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <Router>
            <LayoutWrapper />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}


export default App;
