import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import api from '@/api/client';

const emptyBrand = { name: '', slug: '', description: '', website: '', is_active: true };

export const AdminBrandPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyBrand });
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBrands = () => {
    api.get('/brands/').then(r => setBrands(r.data.results || r.data)).catch(() => {});
  };

  useEffect(() => { fetchBrands(); }, []);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editing) {
        await api.patch(`/brands/${editing.id}/`, data);
        notify('✅ Brand updated!');
      } else {
        await api.post('/brands/', data);
        notify('✅ Brand created!');
      }
      setForm({ ...emptyBrand }); setEditing(null); setShowForm(false); fetchBrands();
    } catch (e: any) { notify('❌ ' + (e.response?.data?.name?.[0] || 'Failed to save brand')); }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Delete brand?')) return;
    await api.delete(`/brands/${id}/`).then(() => { notify('✅ Brand deleted'); fetchBrands(); }).catch(() => notify('❌ Cannot delete — has products'));
  };

  const startEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, description: b.description || '', website: b.website || '', is_active: b.is_active });
    setShowForm(true);
  };

  const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Brand Management</h1>
          <p className="text-xs text-gray-500">Manage product brands. Brands appear on product pages and filter.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...emptyBrand }); }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-600/30 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {showForm && (
        <form onSubmit={save} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-brand-200 dark:border-brand-900 space-y-4 shadow-md">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editing ? 'Edit Brand' : 'New Brand'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Brand Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Samsung" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Website URL</label>
              <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://samsung.com" className={inputCls} />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <input type="checkbox" id="brand_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
              <label htmlFor="brand_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active</label>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional brand description..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
              {editing ? '✓ Update Brand' : '✓ Create Brand'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(b => (
          <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm flex items-start justify-between gap-3 hover:border-brand-200 dark:hover:border-brand-800 transition">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-dark-700 flex items-center justify-center font-black text-brand-600 text-sm shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{b.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{b.slug}</p>
                </div>
              </div>
              {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 hover:underline mt-1 block truncate">{b.website}</a>}
              <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${b.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                {b.is_active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => startEdit(b)} className="p-1.5 rounded-lg bg-brand-50 dark:bg-dark-700 text-brand-600 hover:bg-brand-100 transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteBrand(b.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
