import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import api from '@/api/client';
import { WishlistProvider } from '@/context/WishlistContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AccountPage } from '@/pages/AccountPage';
import { CMSPage } from '@/pages/CMSPage';

// Admin Imports
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductListPage } from '@/pages/admin/AdminProductListPage';
import { AdminOrderListPage } from '@/pages/admin/AdminOrderListPage';
import { AdminReturnListPage } from '@/pages/admin/AdminReturnListPage';
import { AdminCouponPage } from '@/pages/admin/AdminCouponPage';
import { AdminSystemHealthPage } from '@/pages/admin/AdminSystemHealthPage';
import { AdminCustomerPage } from '@/pages/admin/AdminCustomerPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminFraudPage } from '@/pages/admin/AdminFraudPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminCategoryPage } from '@/pages/admin/AdminCategoryPage';
import { AdminBrandPage } from '@/pages/admin/AdminBrandPage';
import { AdminReviewPage } from '@/pages/admin/AdminReviewPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminPromotionPage } from '@/pages/admin/AdminPromotionPage';

import { Product, ProductVariant, Cart } from '@/types';

// ─── Floating Call Button ────────────────────────────────────────────────────
const FloatingCallButton: React.FC<{ phone?: string }> = ({ phone }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!phone) return null;
  const cleanPhone = phone.replace(/\s/g, '');
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Phone className="w-3.5 h-3.5 text-green-400" />
          {phone}
        </div>
      )}
      <a
        href={`tel:${cleanPhone}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        aria-label="Call customer support"
        className="group w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-2xl shadow-green-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-green-500/40 animate-ping" />
        <Phone className="w-6 h-6 text-white relative z-10" />
      </a>
    </div>
  );
};

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const fetchSiteSettings = () => {
    api.get('/settings/public/')
      .then(res => {
        if (res.data?.site) setSiteSettings(res.data.site);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/profile/')
        .then(res => setUser(res.data))
        .catch(() => handleLogout());
    }
    fetchCart();
    fetchSiteSettings();
  }, []);

  const fetchCart = () => {
    api.get('/cart/').then(res => setCart(res.data)).catch(() => {});
  };

  const handleLoginSuccess = (access: string, refresh: string, userData: any) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setUser(userData);
    fetchCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    fetchCart();
  };

  const handleAddToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    api.post('/cart/items/', { product_id: product.id, variant_id: variant?.id, quantity })
      .then(res => { setCart(res.data); setIsCartOpen(true); })
      .catch(err => alert(err.response?.data?.error || 'Could not add to cart'));
  };

  const handleUpdateCartQty = (itemId: number, qty: number) => {
    api.patch(`/cart/items/${itemId}/`, { quantity: qty }).then(res => setCart(res.data));
  };

  const clearCart = () => { fetchCart(); };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>

        {/* ── Storefront ─────────────────────────── */}
        <Route path="/*" element={
          <WishlistProvider>
            <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
            <Header
              cartItemCount={cart?.item_count || 0}
              openCart={() => setIsCartOpen(true)}
              user={user}
              settings={siteSettings}
            />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
                <Route path="/shop" element={<ShopPage onAddToCart={handleAddToCart} />} />
                <Route path="/product/:slug" element={<ProductDetailPage onAddToCart={handleAddToCart} />} />
                <Route path="/checkout" element={<CheckoutPage cart={cart} user={user} clearCart={clearCart} settings={siteSettings} />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/account" element={<AccountPage user={user} onLogout={handleLogout} />} />
                <Route path="/page/:slug" element={<CMSPage />} />
              </Routes>
            </main>
            <Footer settings={siteSettings} />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onUpdateQty={handleUpdateCartQty} />
            {/* Floating Call Button — shown only on storefront, not admin */}
            <FloatingCallButton phone={siteSettings?.phone} />
          </div>
          </WishlistProvider>
        } />

        {/* ── Custom Admin Panel ─────────────────── */}
        <Route path="/admin" element={
          user?.is_staff ? <AdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }>
          {/* Overview */}
          <Route index element={<AdminDashboardPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          {/* Catalog */}
          <Route path="products" element={<AdminProductListPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="brands" element={<AdminBrandPage />} />
          {/* Commerce */}
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="returns" element={<AdminReturnListPage />} />
          <Route path="promotions" element={<AdminPromotionPage />} />
          {/* Marketing */}
          <Route path="coupons" element={<AdminCouponPage />} />
          {/* Customers */}
          <Route path="customers" element={<AdminCustomerPage />} />
          <Route path="reviews" element={<AdminReviewPage />} />
          <Route path="fraud" element={<AdminFraudPage />} />
          {/* System */}
          <Route path="health" element={<AdminSystemHealthPage />} />
          <Route path="settings" element={<AdminSettingsPage onSettingsSaved={fetchSiteSettings} />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
