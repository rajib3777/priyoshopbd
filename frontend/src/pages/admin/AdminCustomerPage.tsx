import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldBan, Eye, TrendingUp, ShoppingBag, Phone, Mail } from 'lucide-react';
import api from '@/api/client';

export const AdminCustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const fetchCustomers = () => {
    setLoading(true);
    api.get(`/customers/admin/customers/${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      .then(r => { setCustomers(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { const t = setTimeout(fetchCustomers, 400); return () => clearTimeout(t); }, [query]);

  const handleBlock = (id: number, block: boolean) => {
    api.patch(`/customers/admin/customers/${id}/`, { is_blocked: block })
      .then(() => { setMsg(`Customer ${block ? 'blocked' : 'unblocked'} successfully.`); fetchCustomers(); setSelected(null); })
      .catch(() => setMsg('Failed to update.'));
  };

  const clvColor = (v: number) => v > 10000 ? 'text-emerald-600' : v > 3000 ? 'text-brand-600' : 'text-gray-500';

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Customer Management & CLV</h1>
          <p className="text-xs text-gray-500">Track lifetime value, order count, loyalty tier, and block/unblock customers.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-xs outline-none"
          />
        </div>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Customer Detail</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Name', selected.user?.full_name || selected.user?.first_name || '—'],
                  ['Email', selected.user?.email],
                  ['Phone', selected.user?.phone || '—'],
                  ['Joined', new Date(selected.created_at || Date.now()).toLocaleDateString('bn-BD')],
                  ['Total Orders', selected.total_orders ?? '0'],
                  ['Lifetime Value', `৳${selected.lifetime_value ?? '0'}`],
                  ['Loyalty Tier', selected.loyalty_tier || 'Bronze'],
                  ['Cancelled Orders', selected.cancelled_orders ?? '0'],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900">
                    <p className="text-[10px] text-gray-400 mb-0.5">{k}</p>
                    <p className="font-bold text-gray-900 dark:text-white truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              {selected.is_blocked ? (
                <button onClick={() => handleBlock(selected.id, false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                  Unblock Customer
                </button>
              ) : (
                <button onClick={() => handleBlock(selected.id, true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition">
                  Block Customer
                </button>
              )}
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 sm:p-4">Customer</th>
                <th className="p-3 sm:p-4">Phone</th>
                <th className="p-3 sm:p-4">Orders</th>
                <th className="p-3 sm:p-4">Lifetime Value</th>
                <th className="p-3 sm:p-4">Loyalty Tier</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => <td key={j} className="p-4"><div className="h-4 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No customers found.</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                  <td className="p-3 sm:p-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{c.user?.full_name || c.user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-gray-400">{c.user?.email}</p>
                  </td>
                  <td className="p-3 sm:p-4 text-gray-500">{c.user?.phone || '—'}</td>
                  <td className="p-3 sm:p-4 font-bold">{c.total_orders ?? 0}</td>
                  <td className={`p-3 sm:p-4 font-extrabold ${clvColor(Number(c.lifetime_value ?? 0))}`}>
                    ৳{c.lifetime_value ?? '0'}
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.loyalty_tier === 'Gold' ? 'bg-amber-100 text-amber-800' : c.loyalty_tier === 'Silver' ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                      {c.loyalty_tier || 'Bronze'}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.is_blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <button onClick={() => setSelected(c)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-brand-50 text-gray-600 dark:text-gray-300 hover:text-brand-600 transition inline-flex items-center gap-1 text-[10px] font-semibold">
                      <Eye className="w-3.5 h-3.5" /> View
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
