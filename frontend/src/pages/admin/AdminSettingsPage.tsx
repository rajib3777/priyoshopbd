import React, { useState, useEffect, useRef } from 'react';
import { Settings, Globe, Phone, Type, Save, Truck, Image, Layout, Palette } from 'lucide-react';
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

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30">
              <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 mb-3">Current Delivery Summary</h4>
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Dhaka delivery charge:</span>
                  <span className="font-bold">৳{siteForm.dhaka_delivery_charge ?? 60}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outside Dhaka delivery:</span>
                  <span className="font-bold">৳{siteForm.outside_dhaka_delivery_charge ?? 120}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free delivery above:</span>
                  <span className="font-bold text-emerald-600">৳{siteForm.free_delivery_threshold ?? 2000}</span>
                </div>
                <div className="flex justify-between border-t border-brand-200 dark:border-brand-900/30 pt-2 mt-2">
                  <span>Account holder discount:</span>
                  <span className="font-bold text-brand-600">{siteForm.account_discount_percentage ?? 2}%</span>
                </div>
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
    </div>
  );
};
