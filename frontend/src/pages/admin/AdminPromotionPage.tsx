import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Percent, Layers, Image as ImageIcon, Sparkles, ExternalLink, ArrowRight, Eye } from 'lucide-react';
import api from '@/api/client';

const emptyPromo = {
  name: '', promo_type: 'flash_sale', discount_percentage: '10',
  start_date: '', end_date: '', is_active: true, description: '',
};

const emptyDealCard = {
  title: '', subtitle: '', badge_text: '', image_url: '', target_url: '/shop?is_flash_sale=true', sort_order: 0, is_active: true
};

const emptyHeroSlide = {
  title: 'Next-Gen Smartphones & Modern Lifestyle',
  subtitle: 'Upgrade your lifestyle with authentic brand products, official warranty & instant Cash on Delivery across Bangladesh.',
  badge_text: 'Special Eid Offer', btn_text: 'Explore Shop', btn_url: '/shop', image_url: '', sort_order: 0, is_active: true
};

export const AdminPromotionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'promos' | 'deals' | 'hero'>('deals');
  const [msg, setMsg] = useState('');

  // 1. Promotions State
  const [promos, setPromos] = useState<any[]>([]);
  const [promoForm, setPromoForm] = useState({ ...emptyPromo });
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);

  // 2. Deals & Offers Cards State
  const [deals, setDeals] = useState<any[]>([]);
  const [dealForm, setDealForm] = useState({ ...emptyDealCard });
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [showDealForm, setShowDealForm] = useState(false);

  // 3. Hero Slides State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [heroForm, setHeroForm] = useState({ ...emptyHeroSlide });
  const [editingHero, setEditingHero] = useState<any>(null);
  const [showHeroForm, setShowHeroForm] = useState(false);

  useEffect(() => {
    fetchPromos();
    fetchDeals();
    fetchHeroSlides();
  }, []);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // Fetch API Calls
  const fetchPromos = () => {
    api.get('/promotions/').then(r => setPromos(r.data.results || r.data)).catch(() => {});
  };

  const fetchDeals = () => {
    api.get('/promotions/deal-cards/').then(r => setDeals(r.data.results || r.data)).catch(() => {});
  };

  const fetchHeroSlides = () => {
    api.get('/promotions/hero-slides/').then(r => setHeroSlides(r.data.results || r.data)).catch(() => {});
  };

  // ── 1. Promotion Handlers ──────────────────────────────────────────────────
  const savePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...promoForm, discount_percentage: parseFloat(promoForm.discount_percentage) };
      if (editingPromo) {
        await api.patch(`/promotions/${editingPromo.id}/`, data);
        notify('✅ Promotion updated!');
      } else {
        await api.post('/promotions/', data);
        notify('✅ Promotion created!');
      }
      setPromoForm({ ...emptyPromo }); setEditingPromo(null); setShowPromoForm(false); fetchPromos();
    } catch (e: any) { notify('❌ Failed to save promotion'); }
  };

  const deletePromo = async (id: number) => {
    if (!confirm('Delete promotion?')) return;
    await api.delete(`/promotions/${id}/`).then(() => { notify('✅ Deleted'); fetchPromos(); });
  };

  // ── 2. Deal Cards Handlers ─────────────────────────────────────────────────
  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await api.patch(`/promotions/deal-cards/${editingDeal.id}/`, dealForm);
        notify('✅ Deal Card updated!');
      } else {
        await api.post('/promotions/deal-cards/', dealForm);
        notify('✅ Deal Card created!');
      }
      setDealForm({ ...emptyDealCard }); setEditingDeal(null); setShowDealForm(false); fetchDeals();
    } catch (e: any) { notify('❌ Failed to save Deal Card'); }
  };

  const deleteDeal = async (id: number) => {
    if (!confirm('Delete this Deal Card?')) return;
    await api.delete(`/promotions/deal-cards/${id}/`).then(() => { notify('✅ Deleted'); fetchDeals(); });
  };

  const toggleDealActive = (id: number, cur: boolean) => {
    api.patch(`/promotions/deal-cards/${id}/`, { is_active: !cur }).then(fetchDeals);
  };

  // ── 3. Hero Slides Handlers ────────────────────────────────────────────────
  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHero) {
        await api.patch(`/promotions/hero-slides/${editingHero.id}/`, heroForm);
        notify('✅ Hero Slide updated!');
      } else {
        await api.post('/promotions/hero-slides/', heroForm);
        notify('✅ Hero Slide created!');
      }
      setHeroForm({ ...emptyHeroSlide }); setEditingHero(null); setShowHeroForm(false); fetchHeroSlides();
    } catch (e: any) { notify('❌ Failed to save Hero Slide'); }
  };

  const deleteHero = async (id: number) => {
    if (!confirm('Delete this Hero Slide?')) return;
    await api.delete(`/promotions/hero-slides/${id}/`).then(() => { notify('✅ Deleted'); fetchHeroSlides(); });
  };

  const toggleHeroActive = (id: number, cur: boolean) => {
    api.patch(`/promotions/hero-slides/${id}/`, { is_active: !cur }).then(fetchHeroSlides);
  };

  const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-gray-200";

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Promotions, Banners & Deals</h1>
          <p className="text-xs text-gray-500">Manage Hero Banners Carousel, Deals & Offers Cards (with picture upload), and Flash Sales.</p>
        </div>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 dark:border-dark-700 text-xs sm:text-sm font-bold gap-4 sm:gap-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'deals' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <Sparkles className="w-4 h-4" /> Deals & Offers Cards ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'hero' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <ImageIcon className="w-4 h-4" /> Hero Carousel Slides ({heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`pb-3 transition flex items-center gap-2 shrink-0 ${activeTab === 'promos' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
        >
          <Percent className="w-4 h-4" /> Flash Sales ({promos.length})
        </button>
      </div>

      {/* ── TAB 1: DEALS & OFFERS CARDS MANAGEMENT ────────────────────────────── */}
      {activeTab === 'deals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">হোমপেজে <b>"Deals & Offers"</b> সেকশনের কার্ডসমূহ। কার্ডের ছবি ও লিংক যুক্ত করলে গ্রাহক ক্লিক করে সরাসরি নির্দিষ্ট প্রোডাক্টে চলে যাবে।</p>
            <button
              onClick={() => { setShowDealForm(!showDealForm); setEditingDeal(null); setDealForm({ ...emptyDealCard }); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Deal Card
            </button>
          </div>

          {showDealForm && (
            <form onSubmit={saveDeal} className="p-5 rounded-2xl bg-white dark:bg-dark-800 border border-brand-200 dark:border-brand-900 space-y-4 shadow-md">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editingDeal ? 'Edit Deal Card' : 'New Deal & Offer Card'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Card Title *</label>
                  <input required value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })} placeholder="e.g. ⚡ Mega Flash Sale 50% Off" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Badge Text</label>
                  <input value={dealForm.badge_text} onChange={e => setDealForm({ ...dealForm, badge_text: e.target.value })} placeholder="e.g. HOT OFFER / BUY 1 GET 1" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Card Subtitle / Description</label>
                  <input value={dealForm.subtitle} onChange={e => setDealForm({ ...dealForm, subtitle: e.target.value })} placeholder="e.g. Special discounts on top mobile accessories & gadgets" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Card Picture Image URL *</label>
                  <input required value={dealForm.image_url} onChange={e => setDealForm({ ...dealForm, image_url: e.target.value })} placeholder="https://images.unsplash.com/... or media path" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Target Redirect Link URL *</label>
                  <input required value={dealForm.target_url} onChange={e => setDealForm({ ...dealForm, target_url: e.target.value })} placeholder="e.g. /shop?is_flash_sale=true or /shop?category=7" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Sort Order</label>
                  <input type="number" value={dealForm.sort_order} onChange={e => setDealForm({ ...dealForm, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input type="checkbox" id="deal_active" checked={dealForm.is_active} onChange={e => setDealForm({ ...dealForm, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
                  <label htmlFor="deal_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Card</label>
                </div>
              </div>

              {/* Preview image */}
              {dealForm.image_url && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 flex items-center gap-3">
                  <img src={dealForm.image_url} alt="Preview" className="w-16 h-12 object-cover rounded-lg" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Image Preview</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{dealForm.title || 'Untitled Card'}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
                  {editingDeal ? '✓ Update Deal Card' : '✓ Create Deal Card'}
                </button>
                <button type="button" onClick={() => { setShowDealForm(false); setEditingDeal(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.length === 0 ? (
              <div className="col-span-4 p-8 text-center rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
                <p className="text-gray-400 text-xs">No Deal Cards added yet. Click "Add Deal Card" to create one.</p>
              </div>
            ) : deals.map(d => (
              <div key={d.id} className="rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
                <div className="relative h-36 bg-gray-100 dark:bg-dark-900 overflow-hidden">
                  <img src={d.image_url || d.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80'} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  {d.badge_text && (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] uppercase shadow-md">
                      {d.badge_text}
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${d.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-800/80 text-gray-300'}`}>
                    {d.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{d.title}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{d.subtitle || 'Click to explore products in this deal.'}</p>
                  <p className="text-[10px] text-brand-600 dark:text-brand-400 font-mono truncate">Target: {d.target_url}</p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between gap-2">
                  <button onClick={() => toggleDealActive(d.id, d.is_active)} className="text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600">
                    {d.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingDeal(d); setDealForm({ ...d }); setShowDealForm(true); }} className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteDeal(d.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: HERO CAROUSEL SLIDES MANAGEMENT ───────────────────────────── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">হোমপেজের শীর্ষে **Hero Section Banner Carousel**। একাধিক স্লাইড যোগ করলে ব্যানারটি স্লাইডার আকারে একটির পর একটি সুন্দরভাবে প্রদর্শন করবে।</p>
            <button
              onClick={() => { setShowHeroForm(!showHeroForm); setEditingHero(null); setHeroForm({ ...emptyHeroSlide }); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Hero Carousel Slide
            </button>
          </div>

          {showHeroForm && (
            <form onSubmit={saveHero} className="p-5 rounded-2xl bg-white dark:bg-dark-800 border border-brand-200 dark:border-brand-900 space-y-4 shadow-md">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editingHero ? 'Edit Hero Slide' : 'New Hero Carousel Slide'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Slide Heading Title *</label>
                  <input required value={heroForm.title} onChange={e => setHeroForm({ ...heroForm, title: e.target.value })} placeholder="e.g. Next-Gen Smartphones & Modern Lifestyle" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Badge Text</label>
                  <input value={heroForm.badge_text} onChange={e => setHeroForm({ ...heroForm, badge_text: e.target.value })} placeholder="e.g. Special Eid Offer" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Button CTA Text</label>
                  <input value={heroForm.btn_text} onChange={e => setHeroForm({ ...heroForm, btn_text: e.target.value })} placeholder="e.g. Explore Shop" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Subtitle Description</label>
                  <textarea value={heroForm.subtitle} onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })} rows={2} placeholder="Description text shown under heading..." className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Background Picture Image URL *</label>
                  <input required value={heroForm.image_url} onChange={e => setHeroForm({ ...heroForm, image_url: e.target.value })} placeholder="https://images.unsplash.com/... or media image" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Button Redirect URL</label>
                  <input value={heroForm.btn_url} onChange={e => setHeroForm({ ...heroForm, btn_url: e.target.value })} placeholder="e.g. /shop or /shop?category=7" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Sort Order</label>
                  <input type="number" value={heroForm.sort_order} onChange={e => setHeroForm({ ...heroForm, sort_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input type="checkbox" id="hero_active" checked={heroForm.is_active} onChange={e => setHeroForm({ ...heroForm, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
                  <label htmlFor="hero_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Slide</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
                  {editingHero ? '✓ Update Hero Slide' : '✓ Create Hero Slide'}
                </button>
                <button type="button" onClick={() => { setShowHeroForm(false); setEditingHero(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          {/* Hero Slides List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {heroSlides.length === 0 ? (
              <div className="col-span-2 p-8 text-center rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
                <p className="text-gray-400 text-xs">No extra Hero Slides added yet. Using default homepage hero banner.</p>
              </div>
            ) : heroSlides.map(s => (
              <div key={s.id} className="rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="relative h-40 bg-gray-900 overflow-hidden">
                  <img src={s.image_url || s.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'} alt={s.title} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white space-y-1">
                    {s.badge_text && <span className="self-start px-2 py-0.5 rounded-full bg-brand-600 text-white font-extrabold text-[9px] uppercase">{s.badge_text}</span>}
                    <h4 className="font-extrabold text-sm line-clamp-1">{s.title}</h4>
                    <p className="text-[10px] text-gray-300 line-clamp-1">{s.subtitle}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between gap-2">
                  <button onClick={() => toggleHeroActive(s.id, s.is_active)} className="text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600">
                    {s.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingHero(s); setHeroForm({ ...s }); setShowHeroForm(true); }} className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteHero(s.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: PROMOTIONS & FLASH SALES ───────────────────────────────────── */}
      {activeTab === 'promos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">তারিখ নির্দিষ্ট করে ফ্ল্যাশ সেল ও ডিসকাউন্ট ক্যাম্পেইন চালু করার ম্যানেজমেন্ট।</p>
            <button onClick={() => { setShowPromoForm(!showPromoForm); setEditingPromo(null); setPromoForm({ ...emptyPromo }); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition shadow-md shrink-0">
              <Plus className="w-4 h-4" /> New Promotion
            </button>
          </div>

          {showPromoForm && (
            <form onSubmit={savePromo} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-orange-200 dark:border-orange-900 space-y-4 shadow-md">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editingPromo ? 'Edit Promotion' : 'New Promotion'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Promotion Name *</label>
                  <input required value={promoForm.name} onChange={e => setPromoForm({ ...promoForm, name: e.target.value })} placeholder="e.g. Eid Flash Sale 2026" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Promotion Type *</label>
                  <select value={promoForm.promo_type} onChange={e => setPromoForm({ ...promoForm, promo_type: e.target.value })} className={inputCls}>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="bundle">Bundle Deal</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="clearance">Clearance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Discount % *</label>
                  <input type="number" min="1" max="90" required value={promoForm.discount_percentage} onChange={e => setPromoForm({ ...promoForm, discount_percentage: e.target.value })} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <input type="checkbox" id="promo_active" checked={promoForm.is_active} onChange={e => setPromoForm({ ...promoForm, is_active: e.target.checked })} className="w-4 h-4 accent-orange-600" />
                  <label htmlFor="promo_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active</label>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Start Date & Time *</label>
                  <input type="datetime-local" required value={promoForm.start_date} onChange={e => setPromoForm({ ...promoForm, start_date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">End Date & Time *</label>
                  <input type="datetime-local" required value={promoForm.end_date} onChange={e => setPromoForm({ ...promoForm, end_date: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition">
                  {editingPromo ? '✓ Update Promotion' : '✓ Create Promotion'}
                </button>
                <button type="button" onClick={() => { setShowPromoForm(false); setEditingPromo(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.length === 0 ? (
              <div className="col-span-3 p-10 text-center rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
                <p className="text-gray-400 text-xs">No promotions yet. Create a flash sale!</p>
              </div>
            ) : promos.map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.promo_type}</p>
                  </div>
                  {p.is_active && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Active</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-orange-500" />
                  <span className="font-extrabold text-xl text-orange-600">{p.discount_percentage || p.discount_value}% OFF</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => deletePromo(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
