import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShoppingBag size={48} className="text-blossom-pink" />
        </div>
        <h2 className="text-3xl font-playfair font-bold mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any magic to your bag yet. Let's find something beautiful!</p>
        <Link to="/shop" className="btn-cute">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla p-4 md:p-8 font-quicksand">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-playfair font-bold mb-8">Shopping Bag ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="card-cute flex flex-col md:flex-row gap-6 items-center group/item transition-all duration-500 animate-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="w-32 h-40 bg-pink-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-white shadow-sm">
                  {item.image && item.image.startsWith('http') || item.image.startsWith('/') ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-pink-50 to-white">
                      {item.image || '🎁'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-charcoal-berry group-hover/item:text-blossom-pink transition-colors">
                      {item.name}
                    </h3>
                    {item.isCustom && (
                      <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Custom Order
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{item.category || 'Artisan Selection'}</p>
                  
                  {item.customization && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                      {item.customization.flowers?.map((f, i) => (
                        <span key={i} className="text-[10px] bg-pink-100/50 px-3 py-1 rounded-full text-pink-600 font-bold border border-pink-100">
                          🌸 {f.name}
                        </span>
                      ))}
                      {item.customization.fillers?.map((f, i) => (
                        <span key={i} className="text-[10px] bg-sage-mist/10 px-3 py-1 rounded-full text-sage-mist font-bold border border-sage-mist/20">
                          🌿 {f.name}
                        </span>
                      ))}
                      {item.customization.wrapping && (
                        <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-bold border border-gray-200">
                          📜 {item.customization.wrapping}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center border border-pink-100 rounded-full bg-white px-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.customization, item.quantity - 1)}
                        className="p-1 hover:text-blossom-pink transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.customization, item.quantity + 1)}
                        className="p-1 hover:text-blossom-pink transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.customization)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-xl font-bold text-charcoal-berry">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card-cute sticky top-28 bg-white border-2 border-pink-50">
              <h2 className="text-2xl font-playfair font-bold mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500 font-semibold">Free</span>
                </div>
                <div className="border-t border-pink-50 pt-4 flex justify-between text-xl font-bold text-charcoal-berry">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-cute w-full flex items-center justify-center gap-2 text-lg py-4">
                Checkout Now <ArrowRight size={20} />
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                <span className="flex items-center gap-1">✨ Secure</span>
                <span className="flex items-center gap-1">🌸 Gift Wrapped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
