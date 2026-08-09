import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { Cart } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQty: (itemId: number, qty: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQty }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const discount = subtotal * 0.02;
  const afterDiscount = subtotal - discount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel — full width on mobile, max-md on desktop */}
      <div className="fixed inset-y-0 right-0 flex w-full sm:max-w-md">
        <div className="relative w-full bg-white dark:bg-dark-900 shadow-2xl flex flex-col">

          {/* ── Header ─────────────────────────────── */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Your Cart ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Items List ──────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-gray-500">
                    Looks like you haven't added anything yet.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-800/50"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-200 dark:bg-dark-700 overflow-hidden shrink-0">
                    {item.product.primary_image ? (
                      <img
                        src={item.product.primary_image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="min-w-0">
                      <h5 className="font-medium text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {item.product.name}
                      </h5>
                      {item.variant && (
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.variant.name}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        ৳{Number(item.unit_price).toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900">
                          <button
                            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 transition rounded-l-lg"
                          >
                            <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 transition rounded-r-lg"
                          >
                            <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => onUpdateQty(item.id, 0)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Footer Summary & Checkout ──────────── */}
          {items.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-dark-800 bg-white dark:bg-dark-900 space-y-3 shrink-0">
              {/* Price breakdown */}
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Account Discount (2%)
                  </span>
                  <span>−৳{discount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-dark-800">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    Est. Total
                  </span>
                  <span className="font-extrabold text-brand-600 text-base">
                    ৳{afterDiscount.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                🚚 Free delivery in Dhaka · COD available · Coupon applied at checkout
              </p>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
