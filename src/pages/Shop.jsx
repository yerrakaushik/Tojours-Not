import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productsService } from '../services/supabaseService';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addingId, setAddingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    { id: 'ALL', name: 'All', icon: '✨' },
    { id: 'Bouquets', name: 'Bouquets', icon: '💐' },
    { id: 'Key chains', name: 'Key chains', icon: '🔑' },
    { id: 'Bags', name: 'Bags', icon: '👜' },
  ];

  useEffect(() => {
    async function loadProducts() {
      const data = await productsService.getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const handleAddToCart = (product) => {
    setAddingId(product.id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 2000);
  };

  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
          <p className="text-charcoal-berry font-medium animate-pulse">Unfolding the garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen font-quicksand">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-blossom-pink text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
          <span className="animate-pulse">✨</span> The Magic Collection
        </div>
        <h1 className="text-4xl md:text-6xl font-playfair font-bold text-charcoal-berry mb-4 tracking-tight">
          Curated Charms
        </h1>
        <p className="text-charcoal-berry/60 max-w-lg text-lg">
          Discover our handpicked selection of whimsical gifts, from floral whispers to tiny treasures.
        </p>
      </div>

      <div className="flex justify-center mb-16">
        <div className="flex flex-wrap justify-center gap-3 p-2 bg-white/50 backdrop-blur-sm rounded-full border border-pink-100 shadow-sm">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-500 ${
                activeCategory === cat.id
                  ? 'bg-blossom-pink text-white shadow-lg scale-105 ring-4 ring-pink-100'
                  : 'bg-white text-charcoal-berry hover:bg-pink-50 border border-transparent hover:border-pink-200'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
        {filteredProducts.map(product => (
          <div key={product.id} className="group relative flex flex-col bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-pink-100 shadow-sm">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-pink-50 mb-6">
              <Link to={`/product/${product.id}`} className="block h-full w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </Link>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 z-10">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90 ${
                    isInWishlist(product.id)
                      ? 'bg-blossom-pink text-white'
                      : 'bg-white text-charcoal-berry hover:text-blossom-pink'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 z-10">
                <span className={`text-[10px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider backdrop-blur-md ${
                  product.cod
                  ? 'bg-green-500/80 text-white'
                  : 'bg-charcoal-berry/60 text-white'
                }`}>
                  {product.cod ? 'COD Available' : 'Prepaid Only'}
                </span>
              </div>

              {addingId === product.id && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300 z-20">
                  <div className="bg-white p-4 rounded-full shadow-xl scale-110 animate-in zoom-in">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-2 pb-2 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="text-xl font-bold text-charcoal-berry group-hover:text-blossom-pink transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-charcoal-berry">${product.price}</span>
                <span className="text-sm text-charcoal-berry/30 line-through tracking-tighter decoration-blossom-pink/40">${(product.price * 1.2).toFixed(0)}</span>
              </div>
              <button 
                onClick={() => handleAddToCart(product)}
                disabled={addingId === product.id}
                className={`w-full group/btn flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-500 overflow-hidden relative shadow-lg ${
                  addingId === product.id
                    ? 'bg-green-500 text-white shadow-green-100'
                    : 'bg-charcoal-berry text-white hover:bg-blossom-pink shadow-charcoal-berry/10 hover:shadow-blossom-pink/30 active:scale-95'
                }`}
              >
                {addingId === product.id ? 'Magically Added!' : (
                  <>
                    <ShoppingBag size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                    Add to Bag
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 animate-in fade-in zoom-in duration-700">
          <div className="text-8xl mb-8 animate-bounce">🌸</div>
          <h3 className="text-4xl font-playfair font-bold text-charcoal-berry mb-4">No items found in this magic corner</h3>
          <p className="text-charcoal-berry/60 text-lg">Try exploring other categories!</p>
          <button 
            onClick={() => setActiveCategory('ALL')}
            className="btn-cute mt-10 px-10"
          >
            Show All Items
          </button>
        </div>
      )}
    </div>
  );
}
