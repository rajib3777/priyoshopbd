import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Product, ProductVariant } from '@/types';

interface ProductDetailPageProps {
  onAddToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onAddToCart }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLoading(true);
      api.get(`/products/${slug}/`)
        .then(res => {
          setProduct(res.data);
          setSelectedImage(res.data.primary_image || res.data.images?.[0]?.image || '');
          if (res.data.variants?.length > 0) setSelectedVariant(res.data.variants[0]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
      Loading product details...
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
      Product not found.
    </div>
  );

  const effectivePrice = selectedVariant ? selectedVariant.effective_price : product.effective_price;

  const handleBuyNow = () => {
    onAddToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 overflow-x-hidden">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">

        {/* ── Gallery ─────────────────────────── */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 overflow-hidden shadow-sm">
            {selectedImage
              ? <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
            }
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden shrink-0 transition ${selectedImage === img.image ? 'border-brand-600' : 'border-gray-200 dark:border-dark-700 opacity-60'}`}
                >
                  <img src={img.image} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info & Options ───────────────────── */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {product.brand_name || 'PriyoShop Genuine'}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1">SKU: {selectedVariant ? selectedVariant.sku : product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap items-baseline gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-dark-800/50 border border-gray-100 dark:border-dark-700">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">৳{effectivePrice}</span>
            {product.discount_price && (
              <span className="text-sm text-gray-400 line-through">৳{product.published_price}</span>
            )}
            {product.discount_percentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Variant:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${selectedVariant?.id === v.id ? 'border-brand-600 bg-brand-50 text-brand-600 font-bold dark:bg-dark-700' : 'border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-800 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center border border-gray-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-900 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onAddToCart(product, selectedVariant, quantity)}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="sm:w-32 py-3 rounded-xl bg-gray-900 hover:bg-black active:scale-95 text-white font-semibold text-sm transition text-center"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Policy Badges */}
          <div className="space-y-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Free Delivery in Dhaka on orders above ৳2000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-brand-600 shrink-0" />
              <span>7 Days Easy Return Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>100% Authentic Product with Brand Warranty</span>
            </div>
          </div>
        </div>

      </div>

      {/* Specs & Description */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 space-y-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Product Overview & Specifications</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {product.description || product.short_description}
        </p>
      </div>

      {/* Related Products Section */}
      {product.related_products && product.related_products.length > 0 && (
        <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                সম্পর্কিত পণ্যসমূহ (Related Products)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">You may also like these similar items</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {product.related_products.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onAddToCart={(p) => onAddToCart(p)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
