import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isCartOpen: false,
  isWishlistOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleWishlist: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setWishlistOpen: (isOpen) => set({ isWishlistOpen: isOpen }),
}));
