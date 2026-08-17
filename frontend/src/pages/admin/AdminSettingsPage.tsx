import React, { useState, useEffect, useRef } from 'react';
import { Settings, Globe, Phone, Type, Save, Truck, Image, Layout, Palette, Plus, Edit2, Trash2, Scale, X, Check, ArrowUpDown } from 'lucide-react';
import api from '@/api/client';

interface AdminSettingsPageProps {
  onSettingsSaved?: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onSettingsSaved }) => {
  const [siteForm, setSiteForm] = useState<any>({
    site_name: 'PriyoShop', tagline: '', email: '', phone: '', address: '',
    currency_code: 'BDT', currency_symbol: '৳',
    facebook_url: '', instagram_url: '', whatsapp_number: '', youtube_url: '', twitter_url: '',
    maintenance_mode: false, cod_enabled: true,
    // Delivery & discount
    dhaka_delivery_charge: 60,
    outside_dhaka_delivery_charge: 120,
    free_delivery_threshold: 2000,
    account_discount_percentage: 2,
    account_discount_enabled: true,
    // Hero banner
    hero_badge_text: 'Next-Gen Shopping Experience',
    hero_title: 'Next-Gen Smartphones & Modern Lifestyle',
    hero_subtitle: 'Upgrade your lifestyle with authentic brand products, official warranty, extra 2% account discount & instant Cash on Delivery across Bangladesh.',
    hero_btn_text: 'Explore Shop',
    hero_btn_url: '/shop',
    announcement_bar_text: 'Special Eid Offer: Extra 2% Account Discount + Free Delivery in Dhaka!',
    // Footer
    footer_color: 'dark',
    footer_tagline: '',
  });

  const [seoForm, setSeoForm] = useState<any>({
    site_title: '', meta_description: '', meta_keywords: '', google_site_verification: '', canonical_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState('general');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const heroImgRef = useRef<HTMLInputElement>(null);

  // ─── Weight Delivery Tiers State ────────────────────────────────────────
  const [weightTiers, setWeightTiers] = useState<any[]>([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    min_weight_grams: '0',
    max_weight_grams: '',
    charge: '',
    is_active: true,
    sort_order: '0',
  });

  const fetchWeightTiers = async () => {
    setTiersLoading(true);
    try {
      const res = await api.get('/shipping/weight-tiers/');
      setWeightTiers(res.data?.results || res.data || []);
    } catch (e) {
      console.error('Failed to load weight tiers', e);
    } finally {
      setTiersLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightTiers();
  }, []);

  const openAddTier = () => {
    setEditingTier(null);
    setTierForm({
      name: '',
      min_weight_grams: '0',
      max_weight_grams: '',
      charge: '60',
      is_active: true,
      sort_order: String(weightTiers.length + 1),
    });
    setTierModalOpen(true);
  };

  const openEditTier = (t: any) => {
    setEditingTier(t);
    setTierForm({
      name: t.name || '',
      min_weight_grams: String(t.min_weight_grams || 0),
      max_weight_grams: t.max_weight_grams ? String(t.max_weight_grams) : '',
      charge: String(t.charge || 0),
      is_active: t.is_active ?? true,
      sort_order: String(t.sort_order || 0),
    });
    setTierModalOpen(true);
  };

  const saveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: tierForm.name.trim() || `${tierForm.min_weight_grams}g - ${tierForm.max_weight_grams || '∞'}g`,
        min_weight_grams: parseFloat(tierForm.min_weight_grams) || 0,
        max_weight_grams: tierForm.max_weight_grams ? parseFloat(tierForm.max_weight_grams) : null,
        charge: parseFloat(tierForm.charge) || 0,
        is_active: Boolean(tierForm.is_active),
        sort_order: parseInt(tierForm.sort_order) || 0,
      };

      if (editingTier) {
        await api.patch(`/shipping/weight-tiers/${editingTier.id}/`, payload);
        notify('Weight tier updated successfully!', 'success');
      } else {
        await api.post('/shipping/weight-tiers/', payload);
        notify('New weight tier added successfully!', 'success');
      }
      setTierModalOpen(false);
      fetchWeightTiers();
    } catch (e: any) {
      notify('Failed to save weight tier', 'error');
    }
  };

  const deleteTier = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this weight tier?')) return;
    try {
      await api.delete(`/shipping/weight-tiers/${id}/`);
      notify('Weight tier deleted', 'success');
      fetchWeightTiers();
    } catch (e) {
      notify('Failed to delete tier', 'error');
    }
  };

  useEffect(() => {
    api.get('/settings/public/')
      .then(r => {
        if (r.data.site) setSiteForm((prev: any) => ({ ...prev, ...r.data.site }));
        if (r.data.seo) setSeoForm((prev: any) => ({ ...prev, ...r.data.seo }));
        if (r.data.site?.hero_image) setHeroImagePreview(r.data.site.hero_image);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const notify = (m: string, type: 'success' | 'error' = 'success') => {
    setMsg(m); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const saveAll = async () => {
    setSaving(true); setMsg('');
    try {
      if (heroImageFile) {
        const fd = new FormData();
        Object.entries(siteForm).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v));
        });
        fd.append('hero_image', heroImageFile);
        await api.patch('/settings/admin/site/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.patch('/settings/admin/site/', siteForm);
      }
      await api.patch('/settings/admin/seo/', seoForm);
      notify('Settings saved successfully! Frontend updated.', 'success');
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      notify('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const setSite = (k: string, v: any) => setSiteForm((p: any) => ({ ...p, [k]: v }));
  const setSeo = (k: string, v: any) => setSeoForm((p: any) => ({ ...p, [k]: v }));

  const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-gray-200 transition";
  const labelCls = "text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide";

  const tabs = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'hero', label: 'Hero Banner', icon: Image },
    { key: 'footer', label: 'Footer & Theme', icon: Layout },
    { key: 'delivery', label: 'Delivery & Charges', icon: Truck },
    { key: 'contact', label: 'Contact & Social', icon: Phone },
    { key: 'seo', label: 'SEO Settings', icon: Type },
  ];

  const footerColorOptions = [
    { key: 'dark', label: 'Dark Charcoal (Default)', bg: 'bg-gray-950 text-white' },
    { key: 'navy', label: 'Deep Navy Blue', bg: 'bg-[#0a1628] text-white' },
    { key: 'green', label: 'Dark Emerald Green', bg: 'bg-[#0a1f0f] text-white' },
    { key: 'purple', label: 'Deep Midnight Purple', bg: 'bg-[#120a2e] text-white' },
    { key: 'slate', label: 'Slate Gray', bg: 'bg-slate-900 text-white' },
    { key: 'brand', label: 'Primary Brand Color', bg: 'bg-brand-950 text-white' },
  ];

  if (loading) return <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-6 w-full overflow-x-hidden max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Site Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure global store options, hero banner, footer theme & social links, delivery charges, and SEO.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold border ${msgType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'}`}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-dark-800 p-1 rounded-xl border border-gray-200 dark:border-dark-700 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${activeTab === t.key ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-5">

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Globe className="w-4 h-4 text-brand-600" /> General Store Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Store Name</label>
                <input value={siteForm.site_name || ''} onChange={e => setSite('site_name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input value={siteForm.tagline || ''} onChange={e => setSite('tagline', e.target.value)} placeholder="Best Online Shopping in Bangladesh" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency Code</label>
                <input value={siteForm.currency_code || 'BDT'} onChange={e => setSite('currency_code', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency Symbol</label>
                <input value={siteForm.currency_symbol || '৳'} onChange={e => setSite('currency_symbol', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Announcement Bar Text</label>
              <input value={siteForm.announcement_bar_text || ''} onChange={e => setSite('announcement_bar_text', e.target.value)} placeholder="Special offer announcement..." className={inputCls} />
            </div>
            <div className="space-y-3 pt-2">
              {[
                { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Lock site for visitors during updates', accent: 'accent-red-600' },
                { key: 'cod_enabled', label: 'Enable Cash on Delivery (COD)', desc: 'Allow customers to pay upon delivery', accent: 'accent-brand-600' },
                { key: 'account_discount_enabled', label: 'Enable Account Discount', desc: 'Give registered users an extra discount', accent: 'accent-brand-600' },
                { key: 'reviews_enabled', label: 'Enable Product Reviews', desc: 'Allow customers to submit reviews', accent: 'accent-brand-600' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700">
                  <input type="checkbox" checked={siteForm[item.key] ?? false} onChange={e => setSite(item.key, e.target.checked)} className={`w-4 h-4 ${item.accent}`} />
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">{item.label}</span>
                    <span className="text-[10px] text-gray-400">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        {/* HERO BANNER TAB */}
        {activeTab === 'hero' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Image className="w-4 h-4 text-brand-600" /> Hero Banner Settings</h3>
            <p className="text-xs text-gray-500">These settings control the main hero section on your homepage.</p>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Badge Text (small label above title)</label>
                <input value={siteForm.hero_badge_text || ''} onChange={e => setSite('hero_badge_text', e.target.value)} placeholder="Next-Gen Shopping Experience" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hero Title (main heading)</label>
                <input value={siteForm.hero_title || ''} onChange={e => setSite('hero_title', e.target.value)} placeholder="Next-Gen Smartphones & Modern Lifestyle" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hero Subtitle / Description</label>
                <textarea value={siteForm.hero_subtitle || ''} onChange={e => setSite('hero_subtitle', e.target.value)} rows={3} placeholder="Upgrade your lifestyle with authentic brand products..." className={inputCls + ' resize-none'} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Button Text</label>
                  <input value={siteForm.hero_btn_text || ''} onChange={e => setSite('hero_btn_text', e.target.value)} placeholder="Explore Shop" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Button URL</label>
                  <input value={siteForm.hero_btn_url || ''} onChange={e => setSite('hero_btn_url', e.target.value)} placeholder="/shop" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Hero Background Image</label>
                <div className="mt-1 space-y-2">
                  {(heroImagePreview || siteForm.hero_image) && (
                    <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700">
                      <img src={heroImagePreview || siteForm.hero_image} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    onClick={() => heroImgRef.current?.click()}
                    className="px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600 text-xs text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 transition w-full text-center"
                  >
                    Click to upload hero image (JPG, PNG, WebP)
                  </button>
                  <input
                    ref={heroImgRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setHeroImageFile(f);
                        setHeroImagePreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                  {heroImageFile && <p className="text-[10px] text-emerald-600">New image selected: {heroImageFile.name}</p>}
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="mt-4">
              <label className={labelCls + ' mb-2 block'}>Live Preview</label>
              <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-dark-900 to-gray-900 text-white rounded-2xl p-6 shadow-xl">
                {heroImagePreview && (
                  <img src={heroImagePreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                )}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] font-semibold mb-2">
                    {siteForm.hero_badge_text || 'Badge Text'}
                  </div>
                  <h2 className="text-lg font-extrabold mb-1">{siteForm.hero_title || 'Hero Title'}</h2>
                  <p className="text-gray-300 text-[11px] mb-3 leading-relaxed">{siteForm.hero_subtitle || 'Hero subtitle text here...'}</p>
                  <span className="px-4 py-2 rounded-full bg-brand-600 text-white font-bold text-xs">
                    {siteForm.hero_btn_text || 'Button Text'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FOOTER & THEME TAB */}
        {activeTab === 'footer' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Layout className="w-4 h-4 text-brand-600" /> Footer Appearance & Theme Color</h3>
            <p className="text-xs text-gray-500">Choose the footer color theme and customize the footer text.</p>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Select Footer Theme Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {footerColorOptions.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSite('footer_color', opt.key)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition ${opt.bg} ${siteForm.footer_color === opt.key ? 'ring-2 ring-brand-500 border-transparent shadow-lg scale-105' : 'border-gray-200 dark:border-dark-700 opacity-80 hover:opacity-100'}`}
                    >
                      <span className="text-[11px] font-bold block">{opt.label}</span>
                      {siteForm.footer_color === opt.key && (
                        <span className="text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full w-fit">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Footer Custom Description / Tagline</label>
                <textarea
                  value={siteForm.footer_tagline || ''}
                  onChange={e => setSite('footer_tagline', e.target.value)}
                  rows={3}
                  placeholder="Bangladesh's trusted enterprise e-commerce platform for genuine electronics..."
                  className={inputCls + ' resize-none'}
                />
                <p className="text-[10px] text-gray-400 mt-1">This text appears under the logo in the footer.</p>
              </div>
            </div>
          </>
        )}

        {/* DELIVERY & CHARGES TAB */}
        {activeTab === 'delivery' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Truck className="w-4 h-4 text-brand-600" /> Delivery Charges & Discounts</h3>
            <p className="text-xs text-gray-500">Set delivery charges and account discount percentages applied site-wide.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Dhaka Delivery Charge (BDT)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                  <input
                    type="number" min="0" step="1"
                    value={siteForm.dhaka_delivery_charge ?? 60}
                    onChange={e => setSite('dhaka_delivery_charge', parseFloat(e.target.value) || 0)}
                    className={inputCls + ' pl-7'}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Outside Dhaka Delivery Charge (BDT)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                  <input
                    type="number" min="0" step="1"
                    value={siteForm.outside_dhaka_delivery_charge ?? 120}
                    onChange={e => setSite('outside_dhaka_delivery_charge', parseFloat(e.target.value) || 0)}
                    className={inputCls + ' pl-7'}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Free Delivery Threshold (BDT)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                  <input
                    type="number" min="0" step="1"
                    value={siteForm.free_delivery_threshold ?? 2000}
                    onChange={e => setSite('free_delivery_threshold', parseFloat(e.target.value) || 0)}
                    className={inputCls + ' pl-7'}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Orders above this amount get free delivery in Dhaka</p>
              </div>
              <div>
                <label className={labelCls}>Account Discount Percentage (%)</label>
                <div className="relative mt-1">
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={siteForm.account_discount_percentage ?? 2}
                    onChange={e => setSite('account_discount_percentage', parseFloat(e.target.value) || 0)}
                    className={inputCls + ' pr-8'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Extra discount for logged-in account holders</p>
              </div>
            </div>

            {/* ── WEIGHT DELIVERY TIERS SECTION ── */}
            <div className="pt-6 border-t border-gray-100 dark:border-dark-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand-600" />
                    Weight-Based Dynamic Delivery Tiers
                  </h4>
                  <p className="text-xs text-gray-500">Charge delivery automatically based on total chargeable weight of products in cart.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddTier}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tier
                </button>
              </div>

              {/* Tiers Table */}
              <div className="rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden bg-white dark:bg-dark-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-dark-800 text-gray-500 font-semibold border-b border-gray-200 dark:border-dark-700">
                    <tr>
                      <th className="p-3">Tier Name</th>
                      <th className="p-3">Weight Range (g)</th>
                      <th className="p-3">Weight (kg)</th>
                      <th className="p-3">Delivery Fee</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                    {tiersLoading ? (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-400">Loading weight tiers...</td></tr>
                    ) : weightTiers.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-400">No weight tiers configured. Fallback rates will be used.</td></tr>
                    ) : (
                      weightTiers.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/60 dark:hover:bg-dark-800/60">
                          <td className="p-3 font-semibold text-gray-900 dark:text-white">{t.name}</td>
                          <td className="p-3 font-mono text-gray-600 dark:text-gray-300">
                            {Number(t.min_weight_grams).toLocaleString()}g – {t.max_weight_grams ? `${Number(t.max_weight_grams).toLocaleString()}g` : 'Unlimited'}
                          </td>
                          <td className="p-3 text-gray-500 font-mono">
                            {t.weight_range_display || `${(t.min_weight_grams / 1000).toFixed(2)} kg`}
                          </td>
                          <td className="p-3 font-bold text-brand-600">৳{t.charge}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                              {t.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditTier(t)}
                                className="p-1 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTier(t.id)}
                                className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CONTACT & SOCIAL TAB */}
        {activeTab === 'contact' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600" /> Contact & Social Media Information</h3>
            <p className="text-xs text-gray-500">Configure support phone, address, and social media URLs shown in the footer and site-wide.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Support Phone Number</label>
                <input value={siteForm.phone || ''} onChange={e => setSite('phone', e.target.value)} placeholder="01700000000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Support Email</label>
                <input type="email" value={siteForm.email || ''} onChange={e => setSite('email', e.target.value)} placeholder="support@priyoshop.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Facebook Page URL</label>
                <input value={siteForm.facebook_url || ''} onChange={e => setSite('facebook_url', e.target.value)} placeholder="https://facebook.com/priyoshop" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Instagram Profile URL</label>
                <input value={siteForm.instagram_url || ''} onChange={e => setSite('instagram_url', e.target.value)} placeholder="https://instagram.com/priyoshop" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp Business Number</label>
                <input value={siteForm.whatsapp_number || ''} onChange={e => setSite('whatsapp_number', e.target.value)} placeholder="+8801700000000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>YouTube Channel URL</label>
                <input value={siteForm.youtube_url || ''} onChange={e => setSite('youtube_url', e.target.value)} placeholder="https://youtube.com/priyoshop" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Twitter / X Profile URL</label>
                <input value={siteForm.twitter_url || ''} onChange={e => setSite('twitter_url', e.target.value)} placeholder="https://x.com/priyoshop" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Store Address</label>
              <textarea value={siteForm.address || ''} onChange={e => setSite('address', e.target.value)} rows={2} placeholder="Dhaka, Bangladesh" className={inputCls + ' resize-none'} />
            </div>
          </>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><Type className="w-4 h-4 text-brand-600" /> Search Engine Optimization</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Site Title</label>
                <input value={seoForm.site_title || ''} onChange={e => setSeo('site_title', e.target.value)} placeholder="PriyoShop — Best Online Shopping in Bangladesh" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea value={seoForm.meta_description || ''} onChange={e => setSeo('meta_description', e.target.value)} rows={3} placeholder="Shop authentic products..." className={inputCls + ' resize-none'} />
                <p className="text-[10px] text-gray-400 mt-1">{(seoForm.meta_description || '').length}/160 characters</p>
              </div>
              <div>
                <label className={labelCls}>Meta Keywords</label>
                <input value={seoForm.meta_keywords || ''} onChange={e => setSeo('meta_keywords', e.target.value)} placeholder="online shopping, bangladesh, priyoshop" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>OG Title (Social Share)</label>
                <input value={seoForm.og_title || ''} onChange={e => setSeo('og_title', e.target.value)} placeholder="PriyoShop — Authentic Products Online" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>OG Description (Social Share)</label>
                <textarea value={seoForm.og_description || ''} onChange={e => setSeo('og_description', e.target.value)} rows={2} placeholder="Discover authentic products at the best prices..." className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className={labelCls}>Google Site Verification Tag</label>
                <input value={seoForm.google_site_verification || ''} onChange={e => setSeo('google_site_verification', e.target.value)} placeholder="google-site-verification-code" className={inputCls} />
              </div>
            </div>
          </>
        )}

        <button onClick={saveAll} disabled={saving}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-brand-600/30">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* ── WEIGHT TIER MODAL ── */}
      {tierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-700 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-600" />
                {editingTier ? 'Edit Weight Tier' : 'Add Weight Tier'}
              </h3>
              <button
                type="button"
                onClick={() => setTierModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveTier} className="space-y-4">
              <div>
                <label className={labelCls}>Tier Name *</label>
                <input
                  type="text"
                  required
                  value={tierForm.name}
                  onChange={e => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g. 0 - 1 kg, 1 - 2 kg, 10kg+"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Min Weight (Grams) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tierForm.min_weight_grams}
                    onChange={e => setTierForm({ ...tierForm, min_weight_grams: e.target.value })}
                    placeholder="0"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    = {(parseFloat(tierForm.min_weight_grams || '0') / 1000).toFixed(2)} kg
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Max Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tierForm.max_weight_grams}
                    onChange={e => setTierForm({ ...tierForm, max_weight_grams: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {tierForm.max_weight_grams ? `= ${(parseFloat(tierForm.max_weight_grams) / 1000).toFixed(2)} kg` : 'Unlimited'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Delivery Fee (BDT ৳) *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={tierForm.charge}
                      onChange={e => setTierForm({ ...tierForm, charge: e.target.value })}
                      placeholder="60"
                      className={inputCls + ' pl-7'}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={tierForm.sort_order}
                    onChange={e => setTierForm({ ...tierForm, sort_order: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700">
                <input
                  type="checkbox"
                  checked={tierForm.is_active}
                  onChange={e => setTierForm({ ...tierForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-brand-600"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Tier</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTierModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-700 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition"
                >
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
