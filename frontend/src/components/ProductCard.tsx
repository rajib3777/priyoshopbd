import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const hasDiscount = product.discount_percentage > 0;
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-dark-700 overflow-hidden hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200">

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50 dark:bg-dark-900">
        {product.primary_image
          ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
        }

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_trending && (
            <span className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              Hot
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              New
            </span>
          )}
        </div>

        {/* Wishlist / Favourite Heart Button */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
          className={`absolute top-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200
            ${wishlisted
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 dark:bg-dark-700/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
            }`}
        >
          <Heart
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150"
            fill={wishlisted ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Quick add overlay — visible on hover on desktop */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden sm:block">
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
            className="w-full py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3 h-3" /> Add to Cart
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug hover:text-brand-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.brand_name && (
          <span className="text-[10px] text-gray-400">{product.brand_name}</span>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap mt-auto pt-1">
          <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
            ৳{product.effective_price}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through">৳{product.published_price}</span>
          )}
        </div>

        {/* Mobile: Add to Cart + Wishlist row */}
        <div className="sm:hidden mt-1 flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
          >
            <ShoppingBag className="w-3 h-3" /> Add to Cart
          </button>
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 border
              ${wishlisted
                ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-dark-900 dark:border-dark-700'
              }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </div>

    </div>
  );
};
