import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, MessageSquare, Plus, CheckCircle2, Clock, Loader2, Sparkles, User, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { orderService } from '../services/orderService';
import { productsService } from '../services/supabaseService';
import { reviewsService } from '../services/siteContentService';
import toast from 'react-hot-toast';

export default function MyReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [unreviewedProducts, setUnreviewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const u = await authService.getCurrentUser();
      if (!u) {
        navigate('/auth');
        return;
      }

      // 1. Fetch user's written reviews
      const { data: userReviews, error: reviewsErr } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (reviewsErr) throw reviewsErr;

      // 2. Fetch user's orders and items
      const orders = await orderService.getUserOrders();
      const allProducts = await productsService.getProducts();

      // Find unique items ordered
      const purchasedNames = [];
      orders.forEach(o => {
        (o.order_items || []).forEach(item => {
          if (!purchasedNames.includes(item.product_name)) {
            purchasedNames.push(item.product_name);
          }
        });
      });

      // Match ordered item names to active products
      const purchasedProducts = purchasedNames.map(name => {
        return allProducts.find(p => p.name === name);
      }).filter(Boolean);

      // Determine which products have NOT been reviewed yet
      const reviewedProductIds = userReviews.map(r => r.product_id?.toString());
      const pendingReviews = purchasedProducts.filter(p => !reviewedProductIds.includes(p.id.toString()));

      setReviews(userReviews);
      setUnreviewedProducts(pendingReviews);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load reviews data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReviewModal = (product) => {
    setSelectedProduct(product);
    setFormRating(5);
    setFormContent('');
    setShowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const profile = await profileService.getProfile();
      const authorName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email.split('@')[0]
        : 'Kaushik';

      await reviewsService.submit({
        product_id: selectedProduct.id,
        author_name: authorName,
        rating: formRating,
        body: formContent
      });

      toast.success('Your floral whisper has been submitted! It will appear once approved by admin. ✨');
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </button>

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-charcoal-berry">My Floral Whispers</h1>
            <p className="text-charcoal-berry/40 font-medium">Manage and write your handcrafted item reviews</p>
          </div>
          <div className="flex items-center gap-2 text-blossom-pink font-bold text-sm bg-white px-4 py-2 rounded-2xl shadow-sm border border-pink-50">
            <MessageSquare size={16} /> Community Feedback
          </div>
        </div>

        {/* Section 1: Products Awaiting Review */}
        {unreviewedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-lg font-black uppercase tracking-widest text-charcoal-berry/40 mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-400" /> Awaiting Your Whispers ({unreviewedProducts.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unreviewedProducts.map((p) => (
                <div key={p.id} className="bg-white/70 border border-pink-100 rounded-[2rem] p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-creamy-vanilla border border-pink-50 flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal-berry text-sm line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-berry/30">{p.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenReviewModal(p)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Write Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Already Written Reviews */}
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest text-charcoal-berry/40 mb-6 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" /> My Written Reviews ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.length > 0 ? reviews.map((r) => (
              <div key={r.id} className="bg-white/70 border border-pink-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-blossom-pink">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-charcoal-berry text-sm">{r.author_name}</h4>
                        <p className="text-[10px] text-charcoal-berry/40 font-medium">
                          {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      r.approved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                    }`}>
                      {r.approved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} fill={i <= r.rating ? 'currentColor' : 'none'} className={i > r.rating ? 'text-gray-200' : ''} />
                    ))}
                  </div>

                  <p className="text-charcoal-berry/75 text-sm leading-relaxed italic mb-4">
                    "{r.body}"
                  </p>
                </div>

                <div className="text-[10px] text-charcoal-berry/40 font-medium pt-3 border-t border-dashed border-pink-50 flex justify-between items-center">
                  <span>Product Code: {r.product_id}</span>
                  {r.approved && (
                    <span className="text-green-600 font-bold flex items-center gap-0.5">
                      <Eye size={10} /> Visible on product page
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20 bg-white/30 rounded-[3rem] border border-dashed border-pink-200">
                <MessageSquare size={64} className="mx-auto text-pink-200 mb-6" />
                <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">No Written Whispers</h3>
                <p className="text-gray-500 mb-8">You haven't authored any product reviews yet. Share your craft love!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Review Modal Form */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-berry/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full border border-pink-50 shadow-2xl relative animate-in zoom-in duration-300">
            <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Review {selectedProduct.name}</h3>
            <p className="text-xs text-charcoal-berry/40 font-medium mb-6">How did this handcrafted design make you feel?</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              {/* Rating stars */}
              <div>
                <label className="block text-xs font-bold text-charcoal-berry/60 uppercase tracking-widest mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className={`transition-all duration-300 ${formRating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                    >
                      <Star size={28} fill={formRating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-charcoal-berry/60 uppercase tracking-widest mb-3">Review Whispers</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  required
                  placeholder="Share your thoughts with our craft community..."
                  className="w-full px-5 py-3 rounded-2xl bg-creamy-vanilla/50 border-2 border-transparent focus:border-blossom-pink outline-none transition-all h-32 resize-none text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-pink-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-400 font-bold hover:text-blossom-pink transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-charcoal-berry hover:bg-blossom-pink text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
