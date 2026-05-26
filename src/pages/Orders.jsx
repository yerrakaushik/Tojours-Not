import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/currency';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          {orders.length > 0 ? orders.map((order, i) => (
            <Link
              key={i}
              to={`/track?id=${order.id}`}
              className="flex items-center justify-between p-6 rounded-[2rem] bg-white/50 border border-white hover:shadow-xl transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-pink-50 group-hover:rotate-6 transition-transform">
                  🌸
                </div>
                <div>
                  <p className="font-bold text-charcoal-berry text-lg">{order.id}</p>
                  <p className="text-xs text-charcoal-berry/40 flex items-center gap-1">
                    <Package size={12} /> {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="font-bold text-charcoal-berry mb-1">{formatCurrency(order.final_amount)}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blossom-pink transition-all" />
              </div>
            </Link>
          )) : (
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
