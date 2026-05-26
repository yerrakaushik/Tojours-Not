import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (!user) {
      toast.error('Sign in Required', {
        icon: '🔒',
        duration: 3000,
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
      return;
    }
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.customization) === JSON.stringify(product.customization)
      );
      if (existingItem) {
        toast.success(`Another ${product.name} added to bag!`, {
          icon: '✨',
        });
        return prev.map(item => 
          (item.id === product.id && JSON.stringify(item.customization) === JSON.stringify(product.customization))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`${product.name} added to bag!`, {
        icon: '🛍️',
      });
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
