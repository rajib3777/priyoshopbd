import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus, Search, RefreshCw } from 'lucide-react';
import api from '@/api/client';

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<any>(null);
  const [adjQty, setAdjQty] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [adjType, setAdjType] = useState<'add' | 'subtract' | 'set'>('add');
  const [msg, setMsg] = useState('');

  const fetchInventory = () => {
    setLoading(true);
    api.get(`/inventory/admin/inventory/${query ? `?search=${encodeURIComponent(query)}` : ''}`)
      .then(r => { setItems(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);
  useEffect(() => { const t = setTimeout(fetchInventory, 400); return () => clearTimeout(t); }, [query]);

  const handleAdjust = async () => {
    if (!adjQty || !adjustModal) return;
    try {
      await api.post(`/inventory/admin/inventory/${adjustModal.id}/adjust/`, {
        adjustment_type: adjType,
        quantity: parseInt(adjQty),
        notes: adjNote,
      });
      setMsg(`✅ Stock adjusted for ${adjustModal.product_name}`);
      setAdjustModal(null); setAdjQty(''); setAdjNote('');
      fetchInventory();
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'Adjustment failed'));
    }
  };

  const stockBadge = (qty: number, threshold: number) => {
    if (qty === 0) return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Out of Stock</span>;
    if (qty <= threshold) return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">Low Stock</span>;
    return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">In Stock</span>;
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-xs text-gray-500">Real-time stock tracking, low-stock alerts, and manual stock adjustments.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-xs outline-none"
            />
          </div>
          <button onClick={fetchInventory} className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Stock Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Adjust Stock</h3>
            <p className="text-xs text-gray-500 font-medium">{adjustModal.product_name}</p>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-xs">
              Current Stock: <b className="text-gray-900 dark:text-white">{adjustModal.quantity} units</b>
              {' '} · Reserved: <b>{adjustModal.reserved_quantity}</b>
              {' '} · Available: <b className="text-brand-600">{adjustModal.quantity - (adjustModal.reserved_quantity||0)}</b>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Adjustment Type</label>
                <select value={adjType} onChange={e => setAdjType(e.target.value as any)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none">
                  <option value="add">Add Stock (Restock)</option>
                  <option value="subtract">Remove Stock (Damage/Loss)</option>
                  <option value="set">Set Exact Stock</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quantity *</label>
                <input type="number" min="1" value={adjQty} onChange={e => setAdjQty(e.target.value)}
                  placeholder="Enter quantity..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Note / Reason</label>
                <input type="text" value={adjNote} onChange={e => setAdjNote(e.target.value)}
                  placeholder="e.g. Restock from supplier, damaged goods..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdjust}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
                Apply Adjustment
              </button>
              <button onClick={() => setAdjustModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold hover:bg-gray-200 transition">
                Cancel
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
                <th className="p-3 sm:p-4">Product</th>
                <th className="p-3 sm:p-4">SKU</th>
                <th className="p-3 sm:p-4">Total Stock</th>
                <th className="p-3 sm:p-4">Reserved</th>
                <th className="p-3 sm:p-4">Available</th>
                <th className="p-3 sm:p-4">Threshold</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>{[1,2,3,4,5,6,7,8].map(j => <td key={j} className="p-4"><div className="h-4 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No inventory records found.</td></tr>
              ) : items.map((item) => {
                const available = item.quantity - (item.reserved_quantity || 0);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/50 dark:hover:bg-dark-700/50 ${item.quantity <= item.low_stock_threshold ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''}`}>
                    <td className="p-3 sm:p-4 font-semibold text-gray-900 dark:text-white max-w-[180px]">
                      <span className="line-clamp-2">{item.product_name}</span>
                    </td>
                    <td className="p-3 sm:p-4 font-mono text-gray-500 text-[11px]">{item.sku}</td>
                    <td className="p-3 sm:p-4 font-bold text-gray-900 dark:text-white">{item.quantity}</td>
                    <td className="p-3 sm:p-4 text-amber-600 font-medium">{item.reserved_quantity || 0}</td>
                    <td className="p-3 sm:p-4 font-bold text-emerald-600">{available}</td>
                    <td className="p-3 sm:p-4 text-gray-400">{item.low_stock_threshold}</td>
                    <td className="p-3 sm:p-4">{stockBadge(item.quantity, item.low_stock_threshold)}</td>
                    <td className="p-3 sm:p-4 text-right">
                      <button onClick={() => setAdjustModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-bold hover:bg-brand-100 dark:bg-dark-700 dark:text-brand-400 transition">
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
