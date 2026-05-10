import { create } from 'zustand';

export const useWishlistStore = create((set) => ({
  wishlistItems: [],
  toggleWishlist: (product) => set((state) => {
    const isAdded = state.wishlistItems.some(item => item.id === product.id);
    if (isAdded) {
      return { wishlistItems: state.wishlistItems.filter(item => item.id !== product.id) };
    }
    return { wishlistItems: [...state.wishlistItems, product] };
  }),
}));
