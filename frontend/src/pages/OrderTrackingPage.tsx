import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import api from '@/api/client';
import { Order } from '@/types';

const STAGES = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber: string }>();
  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError('');

    api.get(`/orders/track/${num.trim()}/`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Order not found. Please verify order number.');
        setOrder(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (paramOrderNumber) {
      handleTrack(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  const currentStageIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Track Your Order</h1>
        <p className="text-xs text-gray-500">Enter your order number (e.g. PS-20260809-XXXXX) to view delivery status.</p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto flex gap-2">
        <input
          type="text"
          placeholder="Enter Order Number..."
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
        <button
          onClick={() => handleTrack(orderNumber)}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
        >
          Track
        </button>
      </div>

      {error && <div className="text-center text-xs text-red-500 font-medium">{error}</div>}

      {/* Timeline Status */}
      {order && (
        <div className="p-8 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-8">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-dark-700 pb-4 text-xs gap-2">
            <div>Order: <b className="text-brand-600 font-mono">{order.order_number}</b></div>
            <div>Status: <b className="uppercase text-gray-900 dark:text-white">{order.status}</b></div>
            <div>Date: <span className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span></div>
          </div>

          {/* Interactive Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 text-center">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-400'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-semibold ${isCurrent ? 'text-brand-600 dark:text-brand-400' : isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
