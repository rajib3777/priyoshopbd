import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, ShieldAlert } from 'lucide-react';
import api from '@/api/client';
import { ReturnRequest } from '@/types';

export const AdminReturnListPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = () => {
    setLoading(true);
    api.get('/returns/admin/returns/')
      .then(res => {
        setReturns(res.data.results || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = (id: number, status: string) => {
    api.patch(`/returns/admin/returns/${id}/`, { status })
      .then(() => fetchReturns());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Return & Refund Management</h1>
        <p className="text-xs text-gray-500">Review return requests, quality check items, approve refunds, and auto-restock inventory.</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-4">Return ID</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Type</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status Workflow</th>
                <th className="p-4 text-right">Approve Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                  <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">#{r.id}</td>
                  <td className="p-4 font-mono text-brand-600 font-semibold">{r.order_number}</td>
                  <td className="p-4 uppercase font-bold text-[10px] text-gray-500">{r.return_type}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{r.reason_name || 'Item Issue'}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">৳{r.total_return_amount}</td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                      className="bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1 font-bold text-[10px] uppercase outline-none"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="pickup_scheduled">Pickup Scheduled</option>
                      <option value="received">Item Received</option>
                      <option value="quality_passed">Quality Passed</option>
                      <option value="refund_completed">Refund Completed</option>
                      <option value="completed">Completed & Restocked</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'completed')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                    >
                      Approve & Restock
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
