import React, { useState, useEffect } from 'react';
import { Plus, Tag, Send, Trash2, ToggleLeft, ToggleRight, Edit3 } from 'lucide-react';
import api from '@/api/client';

const defaultForm = {
  code: '', name: '', coupon_type: 'percentage', discount_value: '10',
  min_order_amount: '0', max_discount_amount: '', usage_limit: '',
  expiry_date: '', is_active: true, description: '',
};

export const AdminCouponPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  // Targeted assign state
  const [targetSegment, setTargetSegment] = useState('most_valuable');
  const [targetCode, setTargetCode] = useState('VIP15');
  const [targetDiscount, setTargetDiscount] = useState('15');
  const [targetMsg, setTargetMsg] = useState('');

  const fetchCoupons = () => {
    api.get('/coupons/admin/coupons/').then(r => setCoupons(r.data.results || r.data)).catch(() => {});
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormMsg('');
    try {
      await api.post('/coupons/admin/coupons/', {
        ...form,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount || '0'),
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expiry_date: form.expiry_date || null,
      });
      setFormMsg('✅ Coupon created successfully!');
      setForm({ ...defaultForm }); setShowForm(false); fetchCoupons();
    } catch (err: any) {
      setFormMsg('❌ ' + (err.response?.data?.error?.message || 'Failed to create coupon'));
    } finally { setSaving(false); }
  };

  const toggleActive = (id: number, current: boolean) => {
    api.patch(`/coupons/admin/coupons/${id}/`, { is_active: !current }).then(fetchCoupons);
  };

  const deleteCoupon = (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    api.delete(`/coupons/admin/coupons/${id}/`).then(fetchCoupons);
  };

  const handleTargetAssign = async (e: React.FormEvent) => {
    e.preventDefault(); setTargetMsg('');
    try {
      const res = await api.post('/coupons/admin/target-assign/', {
        code: targetCode.trim().toUpperCase(),
        name: `Targeted: ${targetSegment}`,
        discount_value: targetDiscount,
        coupon_type: 'percentage',
        target_segment: targetSegment,
      });
      if (res.data.success) { setTargetMsg('✅ ' + res.data.message); fetchCoupons(); }
    } catch { setTargetMsg('❌ Failed to assign targeted coupon.'); }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Coupon & Marketing Engine</h1>
          <p className="text-xs text-gray-500">Create coupons, set rules, and auto-assign targeted discounts to customer segments.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormMsg(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create New Coupon
        </button>
      </div>

      {formMsg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{formMsg}</div>}

      {/* Create Coupon Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-brand-200 dark:border-brand-900 shadow-md space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">New Coupon Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Coupon Code *', key: 'code', type: 'text', placeholder: 'e.g. SAVE20' },
              { label: 'Display Name *', key: 'name', type: 'text', placeholder: 'e.g. Summer Sale 20%' },
              { label: 'Discount Value *', key: 'discount_value', type: 'number', placeholder: '10' },
              { label: 'Min Order Amount (৳)', key: 'min_order_amount', type: 'number', placeholder: '0' },
              { label: 'Max Discount (৳)', key: 'max_discount_amount', type: 'number', placeholder: 'Unlimited' },
              { label: 'Usage Limit', key: 'usage_limit', type: 'number', placeholder: 'Unlimited' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: f.key === 'code' ? e.target.value.toUpperCase() : e.target.value })}
                  required={f.label.includes('*')}
                  className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}

            <div>
              <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Discount Type *</label>
              <select value={form.coupon_type} onChange={e => setForm({ ...form, coupon_type: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none">
                <option value="percentage">Percentage (% OFF)</option>
                <option value="fixed">Fixed Amount (৳ OFF)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Description (Internal Note)</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Optional internal note..."
              className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 disabled:opacity-60 transition">
              {saving ? 'Creating...' : '✓ Create Coupon'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 1-Click Targeted Assignment */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-dark-800 to-gray-900 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-brand-300">
          <h3 className="font-bold text-sm text-white">1-Click Targeted Coupon Assignment</h3>
        </div>
        <p className="text-xs text-gray-300">Auto-create & assign coupons to specific customer segments instantly.</p>
        <form onSubmit={handleTargetAssign} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-semibold text-gray-300">Coupon Code</label>
            <input value={targetCode} onChange={e => setTargetCode(e.target.value.toUpperCase())}
              className="w-full mt-1 p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-300">Discount %</label>
            <input type="number" value={targetDiscount} onChange={e => setTargetDiscount(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-300">Target Segment</label>
            <select value={targetSegment} onChange={e => setTargetSegment(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold outline-none">
              <option value="most_valuable" className="text-gray-900">Most Valuable (Top LTV)</option>
              <option value="high_spenders" className="text-gray-900">High Spenders ৳5000+</option>
              <option value="new" className="text-gray-900">New Customers (0 orders)</option>
              <option value="inactive" className="text-gray-900">Inactive Customers</option>
              <option value="high_cancellation" className="text-gray-900">High Cancellation</option>
            </select>
          </div>
          <button type="submit"
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition">
            <Send className="w-4 h-4" /> Assign
          </button>
        </form>
        {targetMsg && <div className="p-3 rounded-xl bg-white/10 text-emerald-300 text-xs font-bold">{targetMsg}</div>}
      </div>

      {/* Coupon List */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
          <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-600" /> All Coupons ({coupons.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 sm:p-4">Code</th>
                <th className="p-3 sm:p-4">Name</th>
                <th className="p-3 sm:p-4">Type</th>
                <th className="p-3 sm:p-4">Discount</th>
                <th className="p-3 sm:p-4">Min Order</th>
                <th className="p-3 sm:p-4">Uses / Limit</th>
                <th className="p-3 sm:p-4">Expiry</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {coupons.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No coupons yet. Create your first coupon!</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                  <td className="p-3 sm:p-4 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="p-3 sm:p-4 font-medium text-gray-900 dark:text-white max-w-[140px] truncate">{c.name}</td>
                  <td className="p-3 sm:p-4 uppercase text-[10px] font-bold text-gray-400">{c.coupon_type}</td>
                  <td className="p-3 sm:p-4 font-bold text-gray-900 dark:text-white">
                    {c.coupon_type === 'percentage' ? `${c.discount_value}%` : c.coupon_type === 'fixed' ? `৳${c.discount_value}` : 'Free Ship'}
                  </td>
                  <td className="p-3 sm:p-4 text-gray-500">৳{c.min_order_amount || 0}</td>
                  <td className="p-3 sm:p-4 text-gray-500">{c.usage_count} / {c.usage_limit || '∞'}</td>
                  <td className="p-3 sm:p-4 text-gray-400">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-GB') : '—'}</td>
                  <td className="p-3 sm:p-4">
                    <button onClick={() => toggleActive(c.id, c.is_active)} className="flex items-center gap-1">
                      {c.is_active
                        ? <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                        : <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">Inactive</span>
                      }
                    </button>
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <button onClick={() => deleteCoupon(c.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
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
