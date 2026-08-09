import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Package, Phone, FileText } from 'lucide-react';
import api from '@/api/client';
import { Order } from '@/types';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/orders/track/${orderNumber}/`)
        .then(res => setOrder(res.data))
        .catch(() => {});
    }
  }, [orderNumber]);

  if (!order) {
    return <div className="max-w-xl mx-auto py-16 text-center text-gray-500">Loading order receipt...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      {/* Confirmation Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order Confirmed!</h1>
        <p className="text-xs text-gray-500">
          Thank you for shopping with PriyoShop. Your order number is <b className="text-brand-600">{order.order_number}</b>.
        </p>
      </div>

      {/* Order Details Receipt */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-700 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Payment Method:</span> <b className="uppercase text-gray-900 dark:text-white">{order.payment_method}</b>
          </div>
          <div>
            <span className="text-gray-400">Status:</span> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase">{order.status}</span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Shipping Information</h4>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{order.shipping_name}</p>
          <p className="text-gray-500">{order.shipping_address}, {order.shipping_city}</p>
          <p className="text-gray-500">Phone: {order.customer_phone}</p>
        </div>

        {/* Itemized List */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-dark-700">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Items Ordered</h4>
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-800 dark:text-gray-200">{item.product_name} x{item.quantity}</span>
              <span className="font-bold text-gray-900 dark:text-white">৳{item.line_total}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-gray-100 dark:border-dark-700 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold"><span>Discounts</span><span>-৳{order.discount_amount}</span></div>
          )}
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>৳{order.shipping_charge}</span></div>
          <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-dark-700">
            <span>Total Payable (COD)</span>
            <span className="text-brand-600">৳{order.grand_total}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link to={`/track/${order.order_number}`} className="px-6 py-3 rounded-full bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition">
          Track Delivery Timeline
        </Link>
        <Link to="/shop" className="px-6 py-3 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-200 transition">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};
