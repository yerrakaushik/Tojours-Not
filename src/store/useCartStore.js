import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cartItems: [],
  addToCart: (product, customization = {}) => set((state) => {
    const existingItem = state.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      return {
        cartItems: state.cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { cartItems: [...state.cartItems, { ...product, quantity: 1, customization }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== productId)
  })),
  clearCart: () => set({ cartItems: [] }),
  getTotalPrice: () => {
    // This is a getter-like function, but we can implement it as a derived state in the component
  }
}));
