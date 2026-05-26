import React, { useState } from 'react';
import { Package, Search, Loader2, Sparkles, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import TrackingTimeline from '../components/orders/TrackingTimeline';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const history = await orderService.getOrderTracking(orderId);
      if (!history || history.length === 0) {
        throw new Error('Order ID not found. Please check and try again.');
      }
      setTrackingData(history);
    } catch (err) {
      setError(err.message || 'An error occurred while tracking your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="card-cute glass p-8 md:p-12 shadow-2xl border border-white">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 text-blossom-pink">
              <Package size={32} />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">Track Your Magic</h1>
            <p className="text-charcoal-berry/60 text-sm">Enter your order ID to see where your blossoms are!</p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-3 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm font-mono"
                placeholder="BC-123456"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-500 text-sm font-bold border border-red-100 mb-8 text-center">
              {error}
            </div>
          )}

          {trackingData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8 p-4 bg-white/50 rounded-2xl border border-pink-50">
                <div>
                  <p className="text-xs font-bold text-charcoal-berry/40 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-bold text-charcoal-berry font-mono">{orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-charcoal-berry/40 uppercase tracking-widest mb-1">Current Status</p>
                  <div className="flex items-center gap-2 justify-end">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="font-bold text-blossom-pink">{trackingData[trackingData.length - 1].status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/30 rounded-[2rem] p-8 border border-white shadow-inner">
                <TrackingTimeline history={trackingData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
