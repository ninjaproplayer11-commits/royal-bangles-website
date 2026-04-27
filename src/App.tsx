import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Policy from './pages/Policy';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';

import LuxuryNavbar from './components/LuxuryNavbar';
import CursorGlow from './components/CursorGlow';
import WhatsAppButton from './components/WhatsAppButton';
import FlashSaleBanner from './components/FlashSaleBanner';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, adminUser } = useShop();
  const isAdminLoggedIn = localStorage.getItem('royal_bangles_admin_auth') === 'true';
  return (currentUser || adminUser || isAdminLoggedIn) ? <>{children}</> : <Navigate to="/auth" />;
};

const DevelopmentBanner = () => (
  <div className="bg-black/90 backdrop-blur-xl border-b border-gold/10 py-3 text-center z-[2000] relative">
    <p className="text-gold/90 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 px-6">
      <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_#d4af37]" />
      Website Under Development • Online Ordering is Coming Soon • Made by Adarsh
      <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_#d4af37]" />
    </p>
  </div>
);

const AppInner: React.FC = () => {
  const { flashSale, storeSettings } = useShop();
  
  useEffect(() => {
    if (storeSettings?.storeName) {
      document.title = `${storeSettings.storeName} - Elegant Jewelry`;
    }
  }, [storeSettings?.storeName]);

  const whatsappNumber = storeSettings?.whatsapp || '919999999999';
  const showSale = flashSale?.active && flashSale?.endTime && new Date(flashSale.endTime) > new Date();
  return (
    <div className="min-h-screen bg-luxury-black">
      <DevelopmentBanner />
      {showSale && <FlashSaleBanner discount={flashSale.discount} label={flashSale.label} endTime={new Date(flashSale.endTime)} />}
      <CursorGlow />
      <LuxuryNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/policy/:type" element={<Policy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
      <WhatsAppButton phone={whatsappNumber} />
    </div>
  );
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <AppInner />
      </Router>
    </ShopProvider>
  );
}

export default App;