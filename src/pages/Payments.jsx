import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Plus, Loader2, Sparkles, Receipt, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

export default function Payments() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
      </div>
    );
  }

  // Filter only online payment orders or standard transactions
  const transactions = orders.map(o => ({
    id: o.id,
    date: new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    amount: o.final_amount,
    method: o.shipping_address?.payment_method || 'Online Payment',
    status: o.shipping_address?.payment_status || 'succeeded',
    paymentId: o.shipping_address?.payment_id || null
  }));

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-charcoal-berry">My Payments</h1>
            <p className="text-charcoal-berry/40 font-medium">Manage your transaction methods and history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Showcase */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-charcoal-berry/40 mb-2">Saved Payment Methods</h2>
            
            {/* Visual Credit Card */}
            <div className="relative aspect-[1.58/1] w-full rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl group transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-berry to-slate-800" />
              <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 C 40 0 60 50 100 0 Z" fill="white" />
                </svg>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-widest uppercase">Toujours Card</span>
                  <div className="w-12 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold italic">
                    Visa
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Card Number</p>
                  <p className="text-xl font-bold tracking-[0.2em] font-mono">••••  ••••  ••••  4829</p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[8px] text-white/50 uppercase tracking-widest">Card Holder</p>
                    <p className="text-xs font-bold font-mono">Kaushik Yerra</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-white/50 uppercase tracking-widest">Expires</p>
                    <p className="text-xs font-bold font-mono">08/30</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
              <div className="text-xs text-charcoal-berry/60 leading-relaxed font-medium">
                Payments are securely processed via 256-bit SSL encrypted channels utilizing **Razorpay** tokenized technology. Card numbers are never stored on our database.
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-charcoal-berry/40 mb-2">Magic Purchase History</h2>
            
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.map((t, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-sm border border-pink-100 rounded-[2rem] p-6 flex justify-between items-center gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-blossom-pink shadow-sm">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal-berry text-sm">{t.id}</h4>
                      <p className="text-xs text-charcoal-berry/40 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {t.date} • {t.method}
                      </p>
                      {t.paymentId && (
                        <p className="text-[10px] text-charcoal-berry/30 font-mono mt-1">TXID: {t.paymentId}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-charcoal-berry text-base mb-1">{formatCurrency(t.amount)}</p>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      t.status === 'succeeded' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {t.status === 'succeeded' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {t.status === 'succeeded' ? 'Success' : 'Pending'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-white/30 rounded-[3rem] border border-dashed border-pink-200">
                  <Receipt size={48} className="mx-auto text-pink-200 mb-4" />
                  <p className="text-gray-500 font-bold">No transactions found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
