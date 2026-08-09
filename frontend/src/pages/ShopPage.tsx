import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/types';

interface ShopPageProps {
  onAddToCart: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    api.get('/categories/').then(res => setCategories(res.data.results || res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    if (!params.has('sort')) params.set('sort', 'newest');
    api.get(`/products/?${params.toString()}`)
      .then(res => {
        setProducts(res.data.results || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* Top Header & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : searchParams.get('is_flash_sale') === 'true'
                ? '⚡ Flash Sale Special Products'
                : searchParams.get('is_new_arrival') === 'true'
                ? '✨ New Arrivals'
                : searchParams.get('is_featured') === 'true'
                ? '⭐ Featured Selections'
                : selectedCategory
                ? (categories.find(c => String(c.id) === String(selectedCategory) || c.slug === selectedCategory)?.name || 'Category Products')
                : 'All Products'}
            </h1>
            <p className="text-[11px] text-gray-500">{products.length} items found</p>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </label>
          <select
            value={sort}
            onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value })}
            className="w-full sm:w-auto bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Most Popular</option>
            <option value="bestselling">Best Selling</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-700">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Categories
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSearchParams({})}
                className={`w-full text-left py-2 px-3 rounded-xl transition ${!selectedCategory ? 'bg-brand-50 text-brand-600 font-bold dark:bg-dark-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: String(cat.id) })}
                  className={`w-full text-left py-2 px-3 rounded-xl transition flex items-center justify-between ${selectedCategory === String(cat.id) ? 'bg-brand-50 text-brand-600 font-bold dark:bg-dark-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-60">({cat.product_count || 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-80 max-w-full bg-white dark:bg-dark-900 h-full p-5 flex flex-col z-10 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-dark-800">
                <h3 className="font-bold text-base">Filter Categories</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 text-xs flex-1">
                <button
                  onClick={() => { setSearchParams({}); setMobileFilterOpen(false); }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition ${!selectedCategory ? 'bg-brand-600 text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSearchParams({ category: String(cat.id) }); setMobileFilterOpen(false); }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl transition flex items-center justify-between ${selectedCategory === String(cat.id) ? 'bg-brand-600 text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-80">({cat.product_count || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-60 rounded-2xl bg-gray-100 dark:bg-dark-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700">
              <p className="text-gray-500 text-xs sm:text-sm">No products found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
