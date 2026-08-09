import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Zap, Percent, Calendar } from 'lucide-react';
import api from '@/api/client';

const emptyPromo = {
  name: '', promo_type: 'flash_sale', discount_percentage: '10',
  start_date: '', end_date: '', is_active: true, description: '',
};

export const AdminPromotionPage: React.FC = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyPromo });
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPromos = () => {
    api.get('/promotions/admin/promotions/').then(r => setPromos(r.data.results || r.data)).catch(() => {});
  };

  useEffect(() => { fetchPromos(); }, []);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, discount_percentage: parseFloat(form.discount_percentage) };
      if (editing) {
        await api.patch(`/promotions/admin/promotions/${editing.id}/`, data);
        notify('✅ Promotion updated!');
      } else {
        await api.post('/promotions/admin/promotions/', data);
        notify('✅ Promotion created!');
      }
      setForm({ ...emptyPromo }); setEditing(null); setShowForm(false); fetchPromos();
    } catch (e: any) { notify('❌ Failed to save promotion'); }
  };

  const deletePromo = async (id: number) => {
    if (!confirm('Delete promotion?')) return;
    await api.delete(`/promotions/admin/promotions/${id}/`).then(() => { notify('✅ Deleted'); fetchPromos(); });
  };

  const toggleActive = (id: number, cur: boolean) => {
    api.patch(`/promotions/admin/promotions/${id}/`, { is_active: !cur }).then(fetchPromos);
  };

  const startEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, promo_type: p.promo_type,
      discount_percentage: String(p.discount_percentage || '0'),
      start_date: p.start_date?.slice(0, 16) || '',
      end_date: p.end_date?.slice(0, 16) || '',
      is_active: p.is_active, description: p.description || '',
    });
    setShowForm(true);
  };

  const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500";

  const promoTypeLabel: Record<string, string> = {
    flash_sale: 'Flash Sale', bundle: 'Bundle', seasonal: 'Seasonal', clearance: 'Clearance',
  };

  const now = new Date();
  const isLive = (p: any) => p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now;
  const isUpcoming = (p: any) => p.is_active && new Date(p.start_date) > now;

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Promotions & Flash Sales</h1>
          <p className="text-xs text-gray-500">Create flash sales, seasonal promotions, and bundle deals with date scheduling.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...emptyPromo }); }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition shadow-lg self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Promotion
        </button>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {showForm && (
        <form onSubmit={save} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-orange-200 dark:border-orange-900 space-y-4 shadow-md">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editing ? 'Edit Promotion' : 'New Promotion'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Promotion Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Eid Flash Sale 2026" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Promotion Type *</label>
              <select value={form.promo_type} onChange={e => setForm({ ...form, promo_type: e.target.value })} className={inputCls}>
                <option value="flash_sale">Flash Sale</option>
                <option value="bundle">Bundle Deal</option>
                <option value="seasonal">Seasonal</option>
                <option value="clearance">Clearance</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Discount % *</label>
              <input type="number" min="1" max="90" required value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: e.target.value })} className={inputCls} />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <input type="checkbox" id="promo_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-orange-600" />
              <label htmlFor="promo_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active</label>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Start Date & Time *</label>
              <input type="datetime-local" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">End Date & Time *</label>
              <input type="datetime-local" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional internal notes..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition">
              {editing ? '✓ Update Promotion' : '✓ Create Promotion'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.length === 0 ? (
          <div className="col-span-3 p-10 text-center rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
            <p className="text-gray-400 text-xs">No promotions yet. Create a flash sale!</p>
          </div>
        ) : promos.map(p => (
          <div key={p.id} className={`p-4 rounded-2xl bg-white dark:bg-dark-800 border shadow-sm space-y-3 ${isLive(p) ? 'border-orange-400 ring-1 ring-orange-300' : 'border-gray-100 dark:border-dark-700'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-[10px] text-gray-400">{promoTypeLabel[p.promo_type] || p.promo_type}</p>
              </div>
              {isLive(p) && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold animate-pulse">LIVE</span>}
              {isUpcoming(p) && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Upcoming</span>}
              {!p.is_active && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">Inactive</span>}
            </div>

            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-orange-500" />
              <span className="font-extrabold text-xl text-orange-600">{p.discount_percentage}% OFF</span>
            </div>

            <div className="text-[10px] text-gray-500 space-y-1">
              <p>📅 Start: {new Date(p.start_date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p>🔚 End: {new Date(p.end_date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => toggleActive(p.id, p.is_active)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${p.is_active ? 'bg-gray-100 dark:bg-dark-700 text-gray-600' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                {p.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg bg-brand-50 dark:bg-dark-700 text-brand-600 hover:bg-brand-100 transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deletePromo(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
