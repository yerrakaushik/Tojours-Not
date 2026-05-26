import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Loader2, Sparkles, ArrowLeft, ShoppingBag, Star, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productsService } from '../services/supabaseService';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const toggleOrderExpand = (orderId, e) => {
    e.stopPropagation();
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleBuyItAgain = async (item, e) => {
    e.stopPropagation();
    try {
      const products = await productsService.getProducts();
      const matched = products.find(p => p.name === item.product_name);
      if (matched) {
        addToCart(matched);
        toast.success(`Added ${item.product_name} back to your bag! 🛍️`);
        navigate('/cart');
      } else {
        toast.error(`Product "${item.product_name}" is currently out of stock.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to re-add item.');
    }
  };

  const handleWriteReview = async (item, e) => {
    e.stopPropagation();
    try {
      const products = await productsService.getProducts();
      const matched = products.find(p => p.name === item.product_name);
      if (matched) {
        navigate(`/product/${matched.id}`);
      } else {
        toast.error('Product details are not available.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
          <p className="text-blossom-pink font-bold animate-pulse">Fetching your magic orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </button>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-playfair font-bold text-charcoal-berry">My Magic Orders</h1>
          <div className="flex items-center gap-2 text-blossom-pink font-bold text-sm">
            <Sparkles size={16} /> Your Floral History
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-500 text-sm font-bold border border-red-100 mb-8 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {orders.length > 0 ? orders.map((order, i) => {
            const isExpanded = expandedOrders[order.id];
            return (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm border border-pink-100 rounded-[2.5rem] p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 relative"
              >
                {/* Order Top Panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dashed border-pink-100 pb-5 mb-5">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-pink-50">
                      {order.icon || '🌸'}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-berry text-lg tracking-tight">{order.id}</p>
                      <p className="text-xs text-charcoal-berry/40 flex items-center gap-1 font-medium">
                        <Package size={10} /> Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto gap-2">
                    <p className="font-bold text-charcoal-berry text-xl">{formatCurrency(order.final_amount)}</p>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700 animate-pulse'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Items Panel */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-charcoal-berry/40">Items Ordered ({order.order_items?.length || 0})</h3>
                    <button 
                      onClick={(e) => toggleOrderExpand(order.id, e)}
                      className="flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      {isExpanded ? (
                        <>Hide Items <ChevronUp size={14} /></>
                      ) : (
                        <>Show Items <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>

                  {(!isExpanded && order.order_items?.length > 0) && (
                    <div className="text-sm font-bold text-charcoal-berry/60 italic pl-2">
                      {order.order_items.map(item => `${item.product_name} (x${item.quantity})`).join(', ')}
                    </div>
                  )}

                  {(isExpanded && order.order_items?.length > 0) && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {order.order_items.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/60 rounded-2xl border border-pink-50 gap-4">
                          <div className="flex gap-3 items-center">
                            <span className="text-2xl">{item.icon || '🌸'}</span>
                            <div>
                              <p className="font-bold text-charcoal-berry text-sm">{item.product_name}</p>
                              <p className="text-xs text-charcoal-berry/40 font-medium">Qty: {item.quantity} • Price: {formatCurrency(item.price)}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={(e) => handleBuyItAgain(item, e)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                            >
                              <RefreshCw size={12} /> Buy Again
                            </button>
                            <button
                              onClick={(e) => handleWriteReview(item, e)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-charcoal-berry hover:bg-blossom-pink text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                            >
                              <Star size={12} /> Add Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-5 border-t border-dashed border-pink-100 justify-end">
                  <Link
                    to={`/track?id=${order.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-charcoal-berry text-charcoal-berry hover:bg-charcoal-berry hover:text-white rounded-2xl text-xs font-bold transition-all text-center"
                  >
                    Track Package
                  </Link>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-20 bg-white/30 rounded-[3rem] border border-dashed border-pink-200">
              <Package size={64} className="mx-auto text-pink-200 mb-6" />
              <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-8">Your magic journey starts with your first blossom.</p>
              <Link to="/shop" className="btn-cute inline-flex items-center gap-2">
                Start Shopping <Sparkles size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
