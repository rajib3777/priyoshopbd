import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Package, RotateCcw, LogOut, Ticket, Copy, Check,
  Truck, ChevronRight, ShieldCheck, ShoppingBag, ArrowRight
} from 'lucide-react';
import api from '@/api/client';
import { Order, ReturnRequest } from '@/types';

interface AccountPageProps {
  user: any;
  onLogout: () => void;
}

interface CouponItem {
  id: number;
  code: string;
  name: string;
  description: string;
  coupon_type: 'percentage' | 'fixed';
  discount_value: string;
  minimum_order_value: string;
  is_active: boolean;
  end_date?: string;
}

export const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons' | 'returns'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.get('/orders/history/').then(res => setOrders(res.data.results || res.data)).catch(() => {});
      api.get('/returns/my-returns/').then(res => setReturns(res.data.results || res.data)).catch(() => {});
      api.get('/coupons/active/').then(res => setCoupons(res.data.results || res.data)).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Account Required</h2>
        <p className="text-xs text-gray-500">Please log in to view your profile, active orders, and exclusive discount coupons.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition">
          Login / Register →
        </Link>
      </div>
    );
  }

  // Active / Current Orders (not delivered/cancelled/returned)
  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(o.status));
  const currentOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  // Stats calculation
  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(String(o.grand_total)) || 0), 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
      case 'shipped':
      case 'out_for_delivery':
      case 'processing':
      case 'packed':
      case 'confirmed':
        return 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/50';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ── 1. Clean Customer Profile Card ────────────────────────────────── */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-extrabold text-xl sm:text-2xl flex items-center justify-center shrink-0 border border-brand-200/60 dark:border-brand-900">
              {user.first_name?.charAt(0) || user.full_name?.charAt(0) || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.full_name || user.first_name || 'Customer'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Member
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{user.email} • {user.phone}</p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200/80 dark:border-brand-900 text-xs font-semibold">
                  ✨ 2% Instant Account Cash Discount Active on all orders
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition flex items-center gap-2 shrink-0 self-start md:self-center border border-gray-200 dark:border-dark-700"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Quick Profile Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-dark-800">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Orders</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{orders.length}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Orders</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{activeOrders.length}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Spent</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">৳{totalSpent.toFixed(0)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Available Coupons</span>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{coupons.length}</p>
          </div>
        </div>
      </div>

      {/* ── 2. Active Order Tracker (Clean Card) ──────────────────────────── */}
      {currentOrder && (
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-brand-200 dark:border-brand-900/60 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-dark-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 shrink-0 border border-brand-200/50">
                <Truck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Current Active Order</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white font-bold text-[10px] uppercase">
                    In Progress
                  </span>
                </div>
                <p className="text-xs text-gray-500">Order #: <span className="font-mono font-bold text-gray-900 dark:text-white">{currentOrder.order_number}</span></p>
              </div>
            </div>
            <Link
              to={`/track/${currentOrder.order_number}`}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              Track Live Location <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
              <span className="block text-gray-500 text-[11px] font-medium">Order Date</span>
              <span className="font-semibold text-gray-900 dark:text-white">{new Date(currentOrder.created_at).toLocaleDateString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
              <span className="block text-gray-500 text-[11px] font-medium">Order Status</span>
              <span className="font-bold uppercase text-brand-600 dark:text-brand-400">{currentOrder.status}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
              <span className="block text-gray-500 text-[11px] font-medium">Total Amount</span>
              <span className="font-extrabold text-gray-900 dark:text-white">৳{currentOrder.grand_total}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Clean Minimal Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-dark-800 text-sm font-semibold gap-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'orders' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'coupons' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <Ticket className="w-4 h-4" /> Available Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'returns' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <RotateCcw className="w-4 h-4" /> Return Requests ({returns.length})
        </button>
      </div>

      {/* ── 4. Tab 1: Orders History ──────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800 space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Explore our catalog and place your first order to get 2% instant discount.</p>
              <Link to="/shop" className="inline-block px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm hover:bg-brand-700 transition">
                Start Shopping →
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-5 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 space-y-4 shadow-sm hover:border-gray-300 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-dark-800">
                  <div>
                    <span className="text-[11px] text-gray-500 font-medium block">Order Number</span>
                    <b className="text-sm text-gray-900 dark:text-white font-mono">{o.order_number}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                {o.items && o.items.length > 0 && (
                  <div className="space-y-2 text-xs">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{item.product_name} x {item.quantity}</span>
                        <span className="font-mono font-semibold">৳{item.line_total}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-dark-800">
                  <div>
                    <span className="text-[11px] text-gray-500 font-medium block">Total Payable</span>
                    <span className="font-bold text-base text-gray-900 dark:text-white">৳{o.grand_total}</span>
                  </div>
                  <div>
                    <Link
                      to={`/track/${o.order_number}`}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition flex items-center gap-1 border border-gray-200 dark:border-dark-700"
                    >
                      Track Delivery <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 5. Tab 2: Available Coupons ───────────────────────────────────── */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-800 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
            <Ticket className="w-4 h-4 text-brand-600 shrink-0" />
            <span>চেকআউটে ডিসকাউন্ট পেতে যেকোনো কুপন কোডের পাশে "Copy Code" বাটন এ ক্লিক করে ব্যবহার করুন।</span>
          </div>

          {coupons.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800">
              No active promo coupons available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-200/50">
                        {c.coupon_type === 'percentage' ? `${c.discount_value}% OFF` : `৳${c.discount_value} OFF`}
                      </span>
                      <span className="text-[11px] text-gray-400">Min Order: ৳{c.minimum_order_value}</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{c.description || 'Special promo code for PriyoShop customers.'}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-dark-800 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-dark-700">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        copiedCode === c.code
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-600 text-white hover:bg-brand-700'
                      }`}
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 6. Tab 3: Return Requests ─────────────────────────────────────── */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-dark-900 rounded-2xl border border-gray-200 dark:border-dark-800">
              No return requests submitted yet.
            </div>
          ) : (
            returns.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between items-center">
                  <div>Return for Order: <b className="text-gray-900 dark:text-white font-mono">{r.order_number}</b></div>
                  <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-0.5 rounded-full uppercase text-[10px] border border-gray-200">{r.status}</span>
                </div>
                <p className="text-gray-500">Reason: {r.reason_name || 'Defective'}</p>
                <div className="font-semibold text-gray-900 dark:text-white">Amount: ৳{r.total_return_amount}</div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
