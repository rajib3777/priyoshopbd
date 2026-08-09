import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import api from '@/api/client';
import { Order } from '@/types';

export const AdminOrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/admin/orders/')
      .then(res => {
        setOrders(res.data.results || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    api.patch(`/orders/admin/orders/${orderId}/`, { status: newStatus })
      .then(() => fetchOrders());
  };

  const downloadExcel = () => {
    window.open('/api/v1/admin/reports/excel/orders/', '_blank');
  };

  const downloadPdf = (id: number) => {
    window.open(`/api/v1/admin/reports/pdf/invoice/${id}/`, '_blank');
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-xs text-gray-500">Manage orders, status updates, PDF invoices, and Excel exports.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 sm:p-4">Order #</th>
                <th className="p-3 sm:p-4">Customer</th>
                <th className="p-3 sm:p-4">Phone</th>
                <th className="p-3 sm:p-4">Total Amount</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4">Risk Flag</th>
                <th className="p-3 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                  <td className="p-3 sm:p-4 font-mono font-bold text-brand-600">{o.order_number}</td>
                  <td className="p-3 sm:p-4 font-medium text-gray-900 dark:text-white">{o.customer_name}</td>
                  <td className="p-3 sm:p-4 text-gray-500">{o.customer_phone}</td>
                  <td className="p-3 sm:p-4 font-bold text-gray-900 dark:text-white">৳{o.grand_total}</td>
                  <td className="p-3 sm:p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1 font-bold text-[10px] uppercase outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </td>
                  <td className="p-3 sm:p-4">
                    {o.is_flagged ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Flagged Risk
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">Normal</span>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <button
                      onClick={() => downloadPdf(o.id)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-200 font-semibold text-[10px] inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
