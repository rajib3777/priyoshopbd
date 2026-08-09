import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, Shield, Phone, ChevronRight, Home, Grid } from 'lucide-react';
import api from '@/api/client';
import { Category } from '@/types';

interface HeaderProps {
  cartItemCount: number;
  openCart: () => void;
  user: any;
  settings?: {
    announcement_bar_text?: string;
    phone?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, openCart, user, settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data.results || res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        api.get(`/products/search-suggestions/?q=${encodeURIComponent(searchQuery)}`)
          .then(res => {
            setSuggestions(res.data);
            setShowSuggestions(true);
          });
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md border-b border-gray-100 dark:border-dark-800 transition-all">
      
      {/* Announcement & Top Hotline Bar */}
      <div className="bg-brand-950 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 flex items-center justify-between border-b border-brand-800/50 gap-2">
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className="bg-brand-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">Offer</span>
          <span className="truncate">{settings?.announcement_bar_text || 'Special Offer: Extra 2% Account Discount + Cash on Delivery across Bangladesh!'}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-bold">
          <a
            href={`tel:${(settings?.phone || '+8801581620802').replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full text-[11px] sm:text-xs transition shadow-md font-extrabold"
          >
            <Phone className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
            <span className="inline font-bold">Hotline:</span>
            <span className="text-white font-mono tracking-wider">{settings?.phone || '+8801581620802'}</span>
          </a>
          <Link to="/track" className="hover:text-brand-200 hidden md:inline text-[11px] font-normal">Track Order</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 dark:text-gray-200 md:hidden hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              P
            </div>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-gray-900 dark:text-white">
              Priyo<span className="text-brand-600">Shop</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="w-full bg-gray-100 dark:bg-dark-800 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition"
                />
                <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-12 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 py-2 z-50 overflow-hidden">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 text-sm transition"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                    <span className="text-brand-600 font-semibold shrink-0 ml-2">৳{item.published_price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${(settings?.phone || '+8801581620802').replace(/\s/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold hover:bg-emerald-100 transition shadow-sm shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{settings?.phone || '+8801581620802'}</span>
            </a>

            {user?.is_staff && (
              <Link to="/admin" className="flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition">
                <Shield className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Admin Panel</span><span className="sm:hidden">Admin</span>
              </Link>
            )}

            <Link to="/account" className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-600 transition">
              <Heart className="w-5 h-5" />
            </Link>

            <button onClick={openCart} className="p-2 text-gray-600 dark:text-gray-300 hover:text-brand-600 transition relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            <Link to={user ? "/account" : "/login"} className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 transition">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
                <UserIcon className="w-4 h-4" />
              </div>
              {user && <span className="text-xs font-medium hidden lg:inline">{user.first_name || 'Account'}</span>}
            </Link>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-dark-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden md:flex items-center gap-6 py-2 border-t border-gray-100 dark:border-dark-800 text-sm font-medium">
          <Link to="/shop" className="text-brand-600 font-semibold hover:underline">All Products</Link>
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="text-gray-600 dark:text-gray-300 hover:text-brand-600 transition">
              {cat.name}
            </Link>
          ))}
          <Link to="/track" className="ml-auto text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Order Tracking
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-800 bg-white dark:bg-dark-900 p-4 space-y-4 shadow-xl">
          <div className="space-y-2">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl font-bold text-sm text-brand-600 bg-brand-50 dark:bg-dark-800"
            >
              <Grid className="w-4 h-4" /> All Products Catalog
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800 rounded-xl"
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-dark-800 space-y-2 text-xs">
            <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 text-brand-600" /> Track Order Status
            </Link>
            {user?.is_staff && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-amber-600 font-bold">
                <Shield className="w-4 h-4" /> Open Custom Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
