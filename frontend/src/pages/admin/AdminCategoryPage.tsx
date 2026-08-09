import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import api from '@/api/client';

const emptyCategory = { name: '', slug: '', description: '', is_active: true, sort_order: 0 };
const emptySubCategory = { name: '', slug: '', category: '', description: '', is_active: true };

export const AdminCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState({ ...emptyCategory });
  const [subForm, setSubForm] = useState({ ...emptySubCategory });
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/categories/'),
      api.get('/categories/subcategories/'),
    ]).then(([cats, subs]) => {
      setCategories(cats.data.results || cats.data);
      setSubCategories(subs.data.results || subs.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const [catImageFile, setCatImageFile] = useState<File | null>(null);

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', catForm.name);
      fd.append('slug', catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      fd.append('description', catForm.description || '');
      fd.append('sort_order', String(catForm.sort_order || 0));
      fd.append('is_active', String(catForm.is_active));
      if (catImageFile) {
        fd.append('image', catImageFile);
      }

      if (editingCat) {
        await api.patch(`/categories/${editingCat.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        notify('✅ Category updated!');
      } else {
        await api.post('/categories/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        notify('✅ Category created!');
      }
      setCatForm({ ...emptyCategory });
      setCatImageFile(null);
      setEditingCat(null);
      setShowCatForm(false);
      fetchAll();
    } catch (e: any) { notify('❌ ' + (e.response?.data?.name?.[0] || 'Failed to save category')); }
  };

  const saveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...subForm, slug: subForm.slug || subForm.name.toLowerCase().replace(/\s+/g, '-') };
      if (editingSub) {
        await api.patch(`/categories/subcategories/${editingSub.id}/`, data);
        notify('✅ Sub-category updated!');
      } else {
        await api.post('/categories/subcategories/', data);
        notify('✅ Sub-category created!');
      }
      setSubForm({ ...emptySubCategory }); setEditingSub(null); setShowSubForm(false); fetchAll();
    } catch (e: any) { notify('❌ ' + (e.response?.data?.name?.[0] || 'Failed to save sub-category')); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete category? All products in this category will be affected.')) return;
    await api.delete(`/categories/${id}/`).then(() => { notify('✅ Category deleted'); fetchAll(); }).catch(() => notify('❌ Cannot delete — has products'));
  };

  const deleteSubCategory = async (id: number) => {
    if (!confirm('Delete sub-category?')) return;
    await api.delete(`/categories/subcategories/${id}/`).then(() => { notify('✅ Sub-category deleted'); fetchAll(); }).catch(() => notify('❌ Failed'));
  };

  const startEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatImageFile(null);
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active, sort_order: cat.sort_order || 0 });
    setShowCatForm(true);
    setShowSubForm(false);
  };

  const startEditSub = (sub: any) => {
    setEditingSub(sub);
    setSubForm({ name: sub.name, slug: sub.slug, category: String(sub.category), description: sub.description || '', is_active: sub.is_active });
    setShowSubForm(true);
    setShowCatForm(false);
  };

  const inputCls = "w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Category Management</h1>
          <p className="text-xs text-gray-500">Create, edit, and organise product categories and sub-categories.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setShowCatForm(!showCatForm); setShowSubForm(false); setEditingCat(null); setCatForm({ ...emptyCategory }); setCatImageFile(null); }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-600/30">
            <Plus className="w-4 h-4" /> New Category
          </button>
          <button onClick={() => { setShowSubForm(!showSubForm); setShowCatForm(false); setEditingSub(null); setSubForm({ ...emptySubCategory }); }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-700 text-white text-xs font-bold hover:bg-gray-900 transition">
            <Plus className="w-4 h-4" /> New Sub-Category
          </button>
        </div>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Category Form */}
      {showCatForm && (
        <form onSubmit={saveCategory} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-brand-200 dark:border-brand-900 space-y-4 shadow-md">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editingCat ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Category Name *</label>
              <input required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Electronics" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Slug (URL)</label>
              <input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} placeholder="auto-generated" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Sort Order</label>
              <input type="number" value={catForm.sort_order} onChange={e => setCatForm({ ...catForm, sort_order: parseInt(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Category Picture (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setCatImageFile(e.target.files?.[0] || null)} className={inputCls} />
              {editingCat?.image && !catImageFile && (
                <div className="mt-1.5 flex items-center gap-2">
                  <img src={editingCat.image} alt="Current" className="w-8 h-8 object-cover rounded-md border" />
                  <span className="text-[10px] text-gray-500">Current Picture</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 sm:col-span-2">
              <input type="checkbox" id="cat_active" checked={catForm.is_active} onChange={e => setCatForm({ ...catForm, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
              <label htmlFor="cat_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active (visible on storefront)</label>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Description</label>
            <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} rows={2} placeholder="Optional..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition">
              {editingCat ? '✓ Update Category' : '✓ Create Category'}
            </button>
            <button type="button" onClick={() => { setShowCatForm(false); setEditingCat(null); setCatImageFile(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Sub-Category Form */}
      {showSubForm && (
        <form onSubmit={saveSubCategory} className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 space-y-4 shadow-md">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{editingSub ? 'Edit Sub-Category' : 'New Sub-Category'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Sub-Category Name *</label>
              <input required value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Smartphones" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Parent Category *</label>
              <select required value={subForm.category} onChange={e => setSubForm({ ...subForm, category: e.target.value })} className={inputCls}>
                <option value="">-- Select Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Slug</label>
              <input value={subForm.slug} onChange={e => setSubForm({ ...subForm, slug: e.target.value })} placeholder="auto-generated" className={inputCls} />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <input type="checkbox" id="sub_active" checked={subForm.is_active} onChange={e => setSubForm({ ...subForm, is_active: e.target.checked })} className="w-4 h-4 accent-brand-600" />
              <label htmlFor="sub_active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gray-700 text-white text-xs font-bold hover:bg-gray-900 transition">
              {editingSub ? '✓ Update Sub-Category' : '✓ Create Sub-Category'}
            </button>
            <button type="button" onClick={() => { setShowSubForm(false); setEditingSub(null); }} className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-700 font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-brand-600" /> Categories ({categories.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-left">Sort</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {categories.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                    <td className="p-3 font-bold text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="p-3 text-gray-400 font-mono text-[10px]">{cat.slug}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{cat.product_count ?? 0}</td>
                    <td className="p-3 text-gray-400">{cat.sort_order ?? 0}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => startEditCat(cat)} className="p-1.5 rounded-lg bg-brand-50 dark:bg-dark-700 text-brand-600 hover:bg-brand-100 transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {subCategories.filter(s => s.category === cat.id).map(sub => (
                    <tr key={`sub-${sub.id}`} className="bg-gray-50/30 dark:bg-dark-900/30 hover:bg-gray-100/50 dark:hover:bg-dark-800/50">
                      <td className="p-3 pl-8 text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-gray-400" /> {sub.name}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[10px]">{sub.slug}</td>
                      <td className="p-3 text-gray-400">{sub.product_count ?? 0}</td>
                      <td className="p-3 text-gray-400">—</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sub.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                          {sub.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => startEditSub(sub)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteSubCategory(sub.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
