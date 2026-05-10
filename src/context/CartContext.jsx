import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.customization) === JSON.stringify(product.customization)
      );
      if (existingItem) {
        return prev.map(item => 
          (item.id === product.id && JSON.stringify(item.customization) === JSON.stringify(product.customization))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id, customization) => {
    setCart(prev => prev.filter(item => 
      !(item.id === id && JSON.stringify(item.customization) === JSON.stringify(customization))
    ));
  };

  const updateQuantity = (id, customization, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, customization);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.id === id && JSON.stringify(item.customization) === JSON.stringify(customization))
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalPrice,
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};
