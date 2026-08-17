import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Banknote, ArrowRight, CheckCircle, Tag, Scale, Sparkles } from 'lucide-react';
import api from '@/api/client';
import { Cart } from '@/types';

interface CheckoutPageProps {
  cart: Cart | null;
  user: any;
  clearCart: () => void;
  settings?: any;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, user, clearCart, settings }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'Dhaka',
    area: '',
    postal_code: '',
    shipping_note: '',
    payment_method: 'cod',
    coupon_code: '',
  });

  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Dynamic Delivery Preview State from Backend ──
  const [deliveryInfo, setDeliveryInfo] = useState<{
    delivery_charge: number;
    delivery_charge_reason: string;
    is_single_product_free_delivery: boolean;
    total_physical_weight_grams: number;
    chargeable_weight_grams: number;
    chargeable_weight_kg: number;
    tier_name?: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!cart || cart.items.length === 0) return;
    setPreviewLoading(true);
    api.post('/checkout/delivery-preview/', { city: formData.city })
      .then(res => {
        setDeliveryInfo({
          delivery_charge: parseFloat(res.data.delivery_charge) || 0,
          delivery_charge_reason: res.data.delivery_charge_reason || '',
          is_single_product_free_delivery: Boolean(res.data.is_single_product_free_delivery),
          total_physical_weight_grams: parseFloat(res.data.total_physical_weight_grams) || 0,
          chargeable_weight_grams: parseFloat(res.data.chargeable_weight_grams) || 0,
          chargeable_weight_kg: parseFloat(res.data.chargeable_weight_kg) || 0,
          tier_name: res.data.tier_name,
        });
      })
      .catch(() => {})
      .finally(() => setPreviewLoading(false));
  }, [cart, formData.city]);

  const dhakaCharge = Number(settings?.dhaka_delivery_charge ?? 60);
  const outsideCharge = Number(settings?.outside_dhaka_delivery_charge ?? 120);
  const accountDiscPct = Number(settings?.account_discount_percentage ?? 2);

  const subtotal = Number(cart?.subtotal || 0);
  const accountDiscount = (user && settings?.account_discount_enabled !== false) ? subtotal * (accountDiscPct / 100) : 0;
  const couponDiscount = couponApplied ? couponApplied.discount : 0;
  
  // Delivery Charge from verified backend calculation engine
  const shippingCharge = deliveryInfo ? deliveryInfo.delivery_charge : (formData.city.toLowerCase() === 'dhaka' ? dhakaCharge : outsideCharge);
  const grandTotal = Math.max(0, subtotal - accountDiscount - couponDiscount + shippingCharge);

  const handleApplyCoupon = async () => {
    if (!formData.coupon_code.trim()) return;
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate/', {
        code: formData.coupon_code.trim(),
        order_amount: subtotal - accountDiscount
      });
      if (res.data.valid) {
        setCouponApplied({ code: res.data.code, discount: Number(res.data.discount_amount) });
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.error?.message || 'Invalid or expired coupon code');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/checkout/place-order/', {
        ...formData,
        coupon_code: couponApplied?.code || formData.coupon_code,
      });
      if (res.data.success) {
        clearCart();
        navigate(`/order-confirmation/${res.data.order.order_number}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.error?.message || 'Failed to place order. Check stock or details.');
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-2.5 rounded-full bg-brand-600 text-white text-sm font-bold">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
      
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Secure Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">Complete delivery info and confirm your Cash on Delivery order.</p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── LEFT: Form Steps ──────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Step 1: Customer Info */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center shrink-0">1</span>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name *</label>
                <input type="text" required value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Rahim Uddin"
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number *</label>
                <input type="tel" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01700000000"
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Address */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center shrink-0">2</span>
              Shipping Address
            </h3>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Street Address *</label>
              <textarea required rows={2} value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House #, Road #, Area details..."
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">City / District *</label>
                <select value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Dhaka">Dhaka (৳60 Delivery)</option>
                  <option value="Chittagong">Chittagong (৳120)</option>
                  <option value="Sylhet">Sylhet (৳120)</option>
                  <option value="Rajshahi">Rajshahi (৳120)</option>
                  <option value="Khulna">Khulna (৳120)</option>
                  <option value="Outside Dhaka">Other District (৳120)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Area / Thana</label>
                <input type="text" value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Banani, Gulshan"
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center shrink-0">3</span>
              Payment Method
            </h3>
            <div className="p-3.5 rounded-xl border-2 border-brand-600 bg-brand-50/50 dark:bg-dark-700/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-gray-500 leading-snug">Pay cash upon product inspection at your doorstep.</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-brand-600 fill-brand-600 shrink-0" />
            </div>
          </div>

        </div>

        {/* ── RIGHT: Order Summary ───────────────────── */}
        <div className="space-y-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-5 lg:sticky lg:top-24">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Order Summary</h3>

            {/* Cart Items */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{item.product.name}</span>
                    <span className="text-gray-400 font-bold ml-1">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0">৳{item.line_total}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="pt-3 border-t border-gray-100 dark:border-dark-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-600" /> Promo Code
              </label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  placeholder="WELCOME10, EID2026..."
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="flex-1 min-w-0 p-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs font-semibold uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
              {couponApplied && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Coupon "{couponApplied.code}" applied: −৳{couponApplied.discount}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-gray-100 dark:border-dark-700 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              {user && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Account 2% Discount</span>
                  <span>−৳{accountDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>−৳{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Total Physical Weight Information */}
              {deliveryInfo && deliveryInfo.total_physical_weight_grams > 0 && (
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-[11px] py-1 px-2 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Scale className="w-3.5 h-3.5 text-brand-600" /> Total Parcel Weight:
                  </span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {deliveryInfo.total_physical_weight_grams >= 1000
                      ? `${(deliveryInfo.total_physical_weight_grams / 1000).toFixed(2)} kg`
                      : `${Math.round(deliveryInfo.total_physical_weight_grams)} g`}
                  </span>
                </div>
              )}

              {/* Delivery Charge Line */}
              <div className="flex justify-between items-start text-gray-600 dark:text-gray-400">
                <div>
                  <span className="block">Delivery Fee ({formData.city})</span>
                  {deliveryInfo?.is_single_product_free_delivery ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" /> Single Product Free Delivery
                    </span>
                  ) : deliveryInfo?.tier_name ? (
                    <span className="text-[10px] text-gray-400 block">Tier: {deliveryInfo.tier_name}</span>
                  ) : null}
                </div>
                <div>
                  {shippingCharge === 0 ? (
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-xs">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white">৳{shippingCharge.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-dark-700">
                <span>Total</span>
                <span className="text-brand-600">৳{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 active:scale-95 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Processing...' : 'Confirm COD Order'} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-600" /> Secure</span>
              <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-brand-600" /> Fast Delivery</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
