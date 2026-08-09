import React, { useState, useEffect } from 'react';
import { ShieldAlert, Ban, PhoneOff, MapPin, User, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import api from '@/api/client';

export const AdminFraudPage: React.FC = () => {
  const [flaggedOrders, setFlaggedOrders] = useState<any[]>([]);
  const [blockedPhones, setBlockedPhones] = useState<any[]>([]);
  const [blockedAddresses, setBlockedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Block form state
  const [blockPhone, setBlockPhone] = useState('');
  const [blockAddress, setBlockAddress] = useState('');
  const [blockNote, setBlockNote] = useState('');
  const [msg, setMsg] = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/orders/admin/orders/?is_flagged=true'),
      api.get('/orders/admin/blocked-phones/'),
      api.get('/orders/admin/blocked-addresses/'),
    ]).then(([fo, bp, ba]) => {
      setFlaggedOrders(fo.data.results || fo.data);
      setBlockedPhones(bp.data.results || bp.data);
      setBlockedAddresses(ba.data.results || ba.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const blockPhoneNum = async () => {
    if (!blockPhone.trim()) return;
    try {
      await api.post('/orders/admin/blocked-phones/', { phone: blockPhone.trim(), reason: blockNote });
      setMsg(`✅ Phone ${blockPhone} blocked.`); setBlockPhone(''); setBlockNote(''); fetchAll();
    } catch { setMsg('❌ Failed to block phone.'); }
  };

  const blockAddressStr = async () => {
    if (!blockAddress.trim()) return;
    try {
      await api.post('/orders/admin/blocked-addresses/', { address_fragment: blockAddress.trim(), reason: blockNote });
      setMsg(`✅ Address blocked.`); setBlockAddress(''); setBlockNote(''); fetchAll();
    } catch { setMsg('❌ Failed to block address.'); }
  };

  const unblockPhone = (id: number) => {
    api.delete(`/orders/admin/blocked-phones/${id}/`).then(() => { setMsg('✅ Phone unblocked.'); fetchAll(); });
  };

  const unblockAddress = (id: number) => {
    api.delete(`/orders/admin/blocked-addresses/${id}/`).then(() => { setMsg('✅ Address unblocked.'); fetchAll(); });
  };

  const resolveFlag = (orderId: number) => {
    api.patch(`/orders/admin/orders/${orderId}/`, { is_flagged: false }).then(fetchAll);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Fraud & Risk Management</h1>
        <p className="text-xs text-gray-500">COD fraud control — block phones, addresses, review flagged orders and risk scores.</p>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Block Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Block Phone */}
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 space-y-3">
          <h3 className="font-bold text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
            <PhoneOff className="w-4 h-4" /> Block Phone Number
          </h3>
          <input value={blockPhone} onChange={e => setBlockPhone(e.target.value)}
            placeholder="e.g. 01712345678"
            className="w-full p-2.5 rounded-xl border border-red-200 bg-white dark:bg-dark-900 text-xs outline-none"
          />
          <input value={blockNote} onChange={e => setBlockNote(e.target.value)}
            placeholder="Reason (e.g. repeat COD canceller)"
            className="w-full p-2.5 rounded-xl border border-red-200 bg-white dark:bg-dark-900 text-xs outline-none"
          />
          <button onClick={blockPhoneNum} className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition">
            Block This Phone
          </button>
        </div>

        {/* Block Address */}
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 space-y-3">
          <h3 className="font-bold text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Block Address Fragment
          </h3>
          <input value={blockAddress} onChange={e => setBlockAddress(e.target.value)}
            placeholder="e.g. 'Fake Road No 5' or 'Test Area'"
            className="w-full p-2.5 rounded-xl border border-orange-200 bg-white dark:bg-dark-900 text-xs outline-none"
          />
          <input value={blockNote} onChange={e => setBlockNote(e.target.value)}
            placeholder="Reason (e.g. invalid delivery zone)"
            className="w-full p-2.5 rounded-xl border border-orange-200 bg-white dark:bg-dark-900 text-xs outline-none"
          />
          <button onClick={blockAddressStr} className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition">
            Block This Address
          </button>
        </div>
      </div>

      {/* Flagged Orders */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" /> Flagged High-Risk Orders ({flaggedOrders.length})
        </h3>
        {flaggedOrders.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 text-xs font-semibold border border-emerald-200">
            ✅ No flagged orders at this time.
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
                  <tr>
                    <th className="p-3 sm:p-4">Order #</th>
                    <th className="p-3 sm:p-4">Customer</th>
                    <th className="p-3 sm:p-4">Phone</th>
                    <th className="p-3 sm:p-4">Total</th>
                    <th className="p-3 sm:p-4">Risk Reason</th>
                    <th className="p-3 sm:p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                  {flaggedOrders.map(o => (
                    <tr key={o.id} className="bg-red-50/30 hover:bg-red-50 dark:bg-red-950/10">
                      <td className="p-3 sm:p-4 font-mono font-bold text-red-600">{o.order_number}</td>
                      <td className="p-3 sm:p-4 font-medium">{o.customer_name}</td>
                      <td className="p-3 sm:p-4 text-gray-500">{o.customer_phone}</td>
                      <td className="p-3 sm:p-4 font-bold">৳{o.grand_total}</td>
                      <td className="p-3 sm:p-4 text-red-600 font-semibold text-[10px]">{o.flag_reason || 'High cancellation rate'}</td>
                      <td className="p-3 sm:p-4 text-right">
                        <button onClick={() => resolveFlag(o.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold hover:bg-emerald-200 transition">
                          ✓ Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Blocked Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocked Phones */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <PhoneOff className="w-4 h-4 text-red-500" /> Blocked Phones ({blockedPhones.length})
          </h3>
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 divide-y divide-gray-100 dark:divide-dark-700 overflow-hidden">
            {blockedPhones.length === 0 ? (
              <p className="p-4 text-xs text-gray-400 text-center">No blocked phones.</p>
            ) : blockedPhones.map((b: any) => (
              <div key={b.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-bold text-xs text-gray-900 dark:text-white">{b.phone}</p>
                  <p className="text-[10px] text-gray-400">{b.reason || 'No reason provided'}</p>
                </div>
                <button onClick={() => unblockPhone(b.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Addresses */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" /> Blocked Addresses ({blockedAddresses.length})
          </h3>
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 divide-y divide-gray-100 dark:divide-dark-700 overflow-hidden">
            {blockedAddresses.length === 0 ? (
              <p className="p-4 text-xs text-gray-400 text-center">No blocked addresses.</p>
            ) : blockedAddresses.map((b: any) => (
              <div key={b.id} className="p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1">{b.address_fragment}</p>
                  <p className="text-[10px] text-gray-400">{b.reason || 'No reason provided'}</p>
                </div>
                <button onClick={() => unblockAddress(b.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
