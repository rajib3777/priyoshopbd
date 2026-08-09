import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, ChevronDown, Image as ImageIcon, Package } from 'lucide-react';
import api from '@/api/client';

/* ── Helpers ─────────────────────────────────── */
const emptyForm = {
  name: '', slug: '', sku: '', barcode: '',
  category: '', subcategory: '', brand: '',
  short_description: '', description: '', specifications: '',
  buying_price: '', admin_price: '', published_price: '', discount_price: '',
  minimum_selling_price: '',
  weight: '', length: '', width: '', height: '',
  status: 'active', is_active: true, is_featured: false, is_trending: false,
  is_bestseller: false, is_new_arrival: false, is_flash_sale: false,
  track_inventory: true, allow_backorder: false, low_stock_threshold: '5',
  video_url: '',
  seo_title: '', seo_description: '', seo_keywords: '',
};

const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500";
const labelCls = "text-[11px] font-semibold text-gray-600 dark:text-gray-300";

/* ── Product Form Modal ──────────────────────── */
const ProductFormModal: React.FC<{
  editing: any;
  categories: any[];
  subCategories: any[];
  brands: any[];
  dealCards: any[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ editing, categories, subCategories, brands, dealCards, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...emptyForm });
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [filteredSubs, setFilteredSubs] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedDealCards, setSelectedDealCards] = useState<number[]>([]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        slug: editing.slug || '',
        sku: editing.sku || '',
        barcode: editing.barcode || '',
        category: editing.category ? String(editing.category) : '',
        subcategory: editing.subcategory ? String(editing.subcategory) : '',
        brand: editing.brand ? String(editing.brand) : '',
        short_description: editing.short_description || '',
        description: editing.description || '',
        specifications: editing.specifications || '',
        buying_price: editing.buying_price || '',
        admin_price: editing.admin_price || '',
        published_price: editing.published_price || '',
        discount_price: editing.discount_price || '',
        minimum_selling_price: editing.minimum_selling_price || '',
        weight: editing.weight || '',
        length: editing.length || '',
        width: editing.width || '',
        height: editing.height || '',
        status: editing.status || 'active',
        is_active: editing.is_active ?? true,
        is_featured: editing.is_featured ?? false,
        is_trending: editing.is_trending ?? false,
        is_bestseller: editing.is_bestseller ?? false,
        is_new_arrival: editing.is_new_arrival ?? false,
        is_flash_sale: editing.is_flash_sale ?? false,
        track_inventory: editing.track_inventory ?? true,
        allow_backorder: editing.allow_backorder ?? false,
        low_stock_threshold: String(editing.low_stock_threshold || '5'),
        video_url: editing.video_url || '',
        seo_title: editing.seo_title || '',
        seo_description: editing.seo_description || '',
        seo_keywords: editing.seo_keywords || '',
      });
      if (editing.primary_image) setImagePreview(editing.primary_image);
      if (editing.deal_cards) setSelectedDealCards(editing.deal_cards.map((d: any) => typeof d === 'object' ? d.id : d));
    } else {
      setSelectedDealCards([]);
    }
  }, [editing]);

  useEffect(() => {
    setFilteredSubs(form.category ? subCategories.filter(s => String(s.category) === form.category) : []);
  }, [form.category, subCategories]);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const payload: any = {
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        buying_price: parseFloat(form.buying_price) || 0,
        admin_price: form.admin_price ? parseFloat(form.admin_price) : null,
        published_price: parseFloat(form.published_price) || 0,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        minimum_selling_price: form.minimum_selling_price ? parseFloat(form.minimum_selling_price) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        length: form.length ? parseFloat(form.length) : null,
        width: form.width ? parseFloat(form.width) : null,
        height: form.height ? parseFloat(form.height) : null,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        category: form.category || null,
        subcategory: form.subcategory || null,
        brand: form.brand || null,
      };

      let savedProduct: any;
      if (editing) {
        const res = await api.patch(`/products/admin/products/${editing.id}/`, payload);
        savedProduct = res.data;
      } else {
        const res = await api.post('/products/admin/products/', payload);
        savedProduct = res.data;
      }

      // Assign deal cards (ManyToMany) via separate PATCH
      if (savedProduct?.id) {
        await api.patch(`/products/admin/products/${savedProduct.id}/`, { deal_cards: selectedDealCards });
      }

      // Upload primary image if selected
      if (imageFile && savedProduct?.id) {
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('product', String(savedProduct.id));
        fd.append('is_primary', 'true');
        await api.post('/products/admin/product-images/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setMsg(editing ? '✅ Product updated!' : '✅ Product created!');
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } catch (e: any) {
      const errs = e.response?.data;
      const firstErr = errs ? Object.values(errs).flat().join(' · ') : 'Save failed';
      setMsg('❌ ' + firstErr);
    } finally { setSaving(false); }
  };

  const tabs = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'media', label: 'Media' },
    { key: 'seo', label: 'SEO' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6">
      <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-3xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-dark-700">
              <Package className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-[11px] text-gray-400">{editing ? `SKU: ${editing.sku}` : 'Fill in all required fields'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-100 dark:border-dark-700 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${activeTab === t.key ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={save}>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

            {/* ── BASIC INFO ── */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Product Name *</label>
                  <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Samsung Galaxy A55 128GB" className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>SKU *</label>
                    <input required value={form.sku} onChange={e => set('sku', e.target.value.toUpperCase())} placeholder="e.g. SAM-A55-128" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Barcode / GTIN</label>
                    <input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Optional" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }} className={inputCls}>
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Sub-Category</label>
                    <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className={inputCls} disabled={!form.category}>
                      <option value="">-- Select Sub-Category --</option>
                      {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Brand</label>
                    <select value={form.brand} onChange={e => set('brand', e.target.value)} className={inputCls}>
                      <option value="">-- No Brand --</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                      <option value="active">Active (Live on store)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="archived">Archived</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Short Description</label>
                  <textarea value={form.short_description} onChange={e => set('short_description', e.target.value)} rows={2} placeholder="1-2 line product summary shown in listings..." className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className={labelCls}>Full Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Detailed product description..." className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className={labelCls}>Specifications (JSON or plain text)</label>
                  <textarea value={form.specifications} onChange={e => set('specifications', e.target.value)} rows={3} placeholder='{"Processor":"Snapdragon 8 Gen 3","RAM":"8GB"}' className={inputCls + ' resize-none font-mono text-[10px]'} />
                </div>
                <div>
                  <label className={labelCls}>Slug (URL)</label>
                  <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated from name" className={inputCls} />
                </div>
                {/* Flags */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'is_active', label: 'Active' },
                    { key: 'is_featured', label: 'Featured' },
                    { key: 'is_trending', label: 'Trending' },
                    { key: 'is_bestseller', label: 'Bestseller' },
                    { key: 'is_new_arrival', label: 'New Arrival' },
                    { key: 'is_flash_sale', label: 'Flash Sale' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700">
                      <input type="checkbox" checked={(form as any)[f.key]} onChange={e => set(f.key, e.target.checked)} className="w-3.5 h-3.5 accent-brand-600" />
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{f.label}</span>
                    </label>
                  ))}
                </div>

                {/* Deals & Offers Tag */}
                {dealCards.length > 0 && (
                  <div>
                    <label className={labelCls}>Deals & Offers Tags</label>
                    <p className="text-[10px] text-gray-400 mb-2">এই product যে Deals Card-এ দেখাবে সেগুলো select করুন</p>
                    <div className="flex flex-wrap gap-2">
                      {dealCards.map((dc: any) => {
                        const checked = selectedDealCards.includes(dc.id);
                        return (
                          <label
                            key={dc.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer border transition ${
                              checked
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                : 'bg-gray-50 dark:bg-dark-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-700 hover:border-brand-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => {
                                setSelectedDealCards(prev =>
                                  prev.includes(dc.id) ? prev.filter(id => id !== dc.id) : [...prev, dc.id]
                                );
                              }}
                            />
                            {checked ? '✓ ' : ''}{dc.title}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PRICING ── */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                  ⚠️ Buying price is confidential — never shown to customers.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Buying / Cost Price (৳) *</label>
                    <input type="number" step="0.01" required value={form.buying_price} onChange={e => set('buying_price', e.target.value)} placeholder="0.00" className={inputCls} />
                    <p className="text-[10px] text-gray-400 mt-1">What you paid to procure this product</p>
                  </div>
                  <div>
                    <label className={labelCls}>Published / MRP Price (৳) *</label>
                    <input type="number" step="0.01" required value={form.published_price} onChange={e => set('published_price', e.target.value)} placeholder="0.00" className={inputCls} />
                    <p className="text-[10px] text-gray-400 mt-1">Original price shown with strikethrough</p>
                  </div>
                  <div>
                    <label className={labelCls}>Discount / Sale Price (৳)</label>
                    <input type="number" step="0.01" value={form.discount_price} onChange={e => set('discount_price', e.target.value)} placeholder="Leave blank for no discount" className={inputCls} />
                    <p className="text-[10px] text-gray-400 mt-1">Actual selling price after discount</p>
                  </div>
                  <div>
                    <label className={labelCls}>Admin Special Price (৳)</label>
                    <input type="number" step="0.01" value={form.admin_price} onChange={e => set('admin_price', e.target.value)} placeholder="Optional admin override" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Minimum Selling Price (৳)</label>
                    <input type="number" step="0.01" value={form.minimum_selling_price} onChange={e => set('minimum_selling_price', e.target.value)} placeholder="Price floor — no coupon below this" className={inputCls} />
                    <p className="text-[10px] text-gray-400 mt-1">System blocks coupons if price goes below this</p>
                  </div>
                </div>
                {/* Live margin calculator */}
                {form.buying_price && form.published_price && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Gross Margin', value: `৳${(parseFloat(form.discount_price || form.published_price) - parseFloat(form.buying_price)).toFixed(2)}` },
                      { label: 'Margin %', value: `${(((parseFloat(form.discount_price || form.published_price) - parseFloat(form.buying_price)) / parseFloat(form.discount_price || form.published_price)) * 100).toFixed(1)}%` },
                      { label: 'Selling Price', value: `৳${form.discount_price || form.published_price}` },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="text-[10px] text-emerald-600 font-semibold">{s.label}</p>
                        <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INVENTORY ── */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Low Stock Threshold</label>
                    <input type="number" value={form.low_stock_threshold} onChange={e => set('low_stock_threshold', e.target.value)} className={inputCls} />
                    <p className="text-[10px] text-gray-400 mt-1">Alert when stock falls below this</p>
                  </div>
                  <div>
                    <label className={labelCls}>Video URL</label>
                    <input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Weight (kg)</label>
                    <input type="number" step="0.001" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="0.500" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ key: 'length', label: 'Length (cm)' }, { key: 'width', label: 'Width (cm)' }, { key: 'height', label: 'Height (cm)' }].map(f => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      <input type="number" step="0.1" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} className={inputCls} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 flex-1">
                    <input type="checkbox" checked={form.track_inventory} onChange={e => set('track_inventory', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                    <div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Track Inventory</span>
                      <span className="text-[10px] text-gray-400">Show stock count and enforce limits</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 flex-1">
                    <input type="checkbox" checked={form.allow_backorder} onChange={e => set('allow_backorder', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                    <div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Allow Backorder</span>
                      <span className="text-[10px] text-gray-400">Let customers order when out of stock</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* ── MEDIA ── */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Primary Product Image</label>
                  <label className="mt-2 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-dark-600 cursor-pointer hover:border-brand-500 transition bg-gray-50 dark:bg-dark-900">
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-32 h-32 object-cover rounded-xl shadow" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                        <p className="text-xs text-gray-400 mt-2">Click to upload product image</p>
                        <p className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <span className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </span>
                  </label>
                  {editing && <p className="text-[10px] text-gray-400 mt-2">After saving you can add more images from the product detail view.</p>}
                </div>
              </div>
            )}

            {/* ── SEO ── */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>SEO Title</label>
                  <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Defaults to product name if blank" className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">{form.seo_title.length}/60 characters recommended</p>
                </div>
                <div>
                  <label className={labelCls}>SEO Meta Description</label>
                  <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={3} placeholder="Brief description for Google search results..." className={inputCls + ' resize-none'} />
                  <p className="text-[10px] text-gray-400 mt-1">{form.seo_description.length}/160 characters recommended</p>
                </div>
                <div>
                  <label className={labelCls}>SEO Keywords</label>
                  <input value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} placeholder="samsung galaxy, buy mobile, smartphones bangladesh" className={inputCls} />
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-dark-700 space-y-3">
            {msg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${msg.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {msg}
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-brand-600/30">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-dark-700 text-sm font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Product List Page ──────────────────── */
export const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [dealCards, setDealCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    const url = `/products/admin/products/${query ? `?search=${encodeURIComponent(query)}` : ''}`;
    api.get(url).then(res => { setProducts(res.data.results || res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get('/categories/').then(r => setCategories(r.data.results || r.data)),
      api.get('/categories/subcategories/').then(r => setSubCategories(r.data.results || r.data)),
      api.get('/brands/').then(r => setBrands(r.data.results || r.data)),
      api.get('/promotions/deal-cards/').then(r => setDealCards(r.data.results || r.data)),
    ]).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { const t = setTimeout(fetchProducts, 400); return () => clearTimeout(t); }, [query]);

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/admin/products/${id}/`);
      setMsg('✅ Product deleted');
      fetchProducts();
    } catch { setMsg('❌ Cannot delete — product has orders'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const toggleStatus = async (p: any) => {
    const newStatus = p.status === 'active' ? 'draft' : 'active';
    await api.patch(`/products/admin/products/${p.id}/`, { status: newStatus, is_active: newStatus === 'active' });
    fetchProducts();
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p: any) => { setEditing(p); setShowModal(true); };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {showModal && (
        <ProductFormModal
          editing={editing}
          categories={categories}
          subCategories={subCategories}
          brands={brands}
          dealCards={dealCards}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Product Catalog</h1>
          <p className="text-xs text-gray-500">Create, edit, manage pricing and inventory for all products.</p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search name or SKU..." value={query} onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-xs outline-none"
            />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 sm:p-4">Product</th>
                <th className="p-3 sm:p-4">SKU</th>
                <th className="p-3 sm:p-4">Cost</th>
                <th className="p-3 sm:p-4">Price</th>
                <th className="p-3 sm:p-4">Margin</th>
                <th className="p-3 sm:p-4">Stock</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>{[1,2,3,4,5,6,7,8].map(j => <td key={j} className="p-4"><div className="h-4 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-10 h-10 text-gray-300" />
                      <p className="text-gray-400 font-medium text-sm">{query ? 'No products found.' : 'No products yet.'}</p>
                      {!query && <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">+ Add Your First Product</button>}
                    </div>
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 group">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      {p.primary_image ? (
                        <img src={p.primary_image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 dark:border-dark-700 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.category_name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 font-mono text-gray-500 text-[11px]">{p.sku}</td>
                  <td className="p-3 sm:p-4 text-gray-500">৳{p.buying_price}</td>
                  <td className="p-3 sm:p-4 font-bold text-gray-900 dark:text-white">৳{p.effective_price ?? p.published_price}</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-600">{p.margin_percentage ?? '—'}%</td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${(p.available_stock ?? 0) > 5 ? 'bg-emerald-100 text-emerald-800' : (p.available_stock ?? 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                      {p.available_stock ?? 0} units
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <button onClick={() => toggleStatus(p)} className={`px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {p.status}
                    </button>
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-brand-50 dark:bg-dark-700 text-brand-600 hover:bg-brand-100 transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(p.id, p.name)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length > 0 && (
          <div className="p-3 border-t border-gray-100 dark:border-dark-700 text-[11px] text-gray-400 text-right">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
