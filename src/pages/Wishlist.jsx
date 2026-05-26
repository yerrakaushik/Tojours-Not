import React from 'react';
import { Heart, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen font-quicksand">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-blossom-pink text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
          <Sparkles size={12} /> Your Treasures
        </div>
        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry mb-4">
          My Wishlist
        </h1>
        <p className="text-charcoal-berry/60 max-w-lg">
          A collection of things that caught your eye. Ready to make them yours?
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-16 text-center border-2 border-dashed border-pink-100 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block mb-8">
            <Heart size={80} className="text-pink-100 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={32} className="text-blossom-pink/40" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-charcoal-berry mb-2">No favorites yet</h3>
          <p className="text-charcoal-berry/50 mb-8 max-w-xs mx-auto">Save the items you love while browsing our magic collection.</p>
          <Link to="/shop" className="btn-cute px-10">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map(item => (
            <div key={item.id} className="group bg-white rounded-[2rem] p-4 flex gap-6 border border-pink-50 hover:shadow-xl transition-all duration-500">
              <div className="w-32 h-40 rounded-2xl overflow-hidden bg-pink-50 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-between flex-1 py-2">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-charcoal-berry">{item.name}</h3>
                    <button 
                      onClick={() => toggleWishlist(item)}
                      className="text-pink-200 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-blossom-pink font-bold mt-1">{formatCurrency(item.price)}</p>
                </div>
                
                <button 
                  onClick={() => addToCart(item)}
                  className="flex items-center justify-center gap-2 bg-charcoal-berry text-white py-3 rounded-xl font-bold text-sm hover:bg-blossom-pink transition-all active:scale-95 shadow-lg shadow-charcoal-berry/10"
                >
                  <ShoppingBag size={16} /> Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
