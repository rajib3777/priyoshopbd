import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/api/client';

interface WishlistContextType {
  wishlistIds: Set<number>;
  toggle: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggle: () => {},
  isWishlisted: () => false,
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  // Load wishlist on mount (only if logged in)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    api.get('/wishlist/')
      .then(res => {
        const ids = (res.data.items || []).map((item: any) => item.product?.id || item.product_id).filter(Boolean);
        setWishlistIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback((productId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Redirect hint: not logged in
      alert('Please login to save favorites.');
      return;
    }

    setWishlistIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        // Optimistic remove
        next.delete(productId);
        api.delete(`/wishlist/${productId}/`).catch(() => {
          // Revert on error
          setWishlistIds(s => { const r = new Set(s); r.add(productId); return r; });
        });
      } else {
        // Optimistic add
        next.add(productId);
        api.post('/wishlist/', { product_id: productId }).catch(() => {
          // Revert on error
          setWishlistIds(s => { const r = new Set(s); r.delete(productId); return r; });
        });
      }
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId: number) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
