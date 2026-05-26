import React, { useState } from 'react';
import { Ticket, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { couponService } from '../../services/couponService';

export default function CouponInput({ orderValue, onApply }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code) return;

    setLoading(true);
    setStatus('loading');
    setError('');

    try {
      const result = await couponService.validateCoupon(code, orderValue);
      setStatus('success');
      onApply({ ...result, code });
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 rounded-3xl bg-white/50 border border-pink-100 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-pink-50 rounded-xl text-blossom-pink">
          <Ticket size={20} />
        </div>
        <h3 className="font-bold text-charcoal-berry">Apply Coupon</h3>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm font-mono"
            placeholder="ENTER CODE"
            disabled={status === 'success'}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || status === 'success'}
          className="px-6 py-3 bg-blossom-pink text-white rounded-2xl font-bold text-sm shadow-md hover:bg-pink-400 transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Apply'}
        </button>
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-xs font-bold p-2 rounded-lg bg-green-50 border border-green-100">
          <CheckCircle2 size={14} /> Coupon applied successfully!
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-bold p-2 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
