import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
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
    setWishlist(prev => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        toast.success(`Removed from wishlist`, {
          icon: '💔',
        });
        return prev.filter(item => item.id !== product.id);
      }
      toast.success(`${product.name} added to wishlist!`, {
        icon: '💖',
      });
      return [...prev, product];
    });
  };


  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      toggleWishlist, 
      isInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
