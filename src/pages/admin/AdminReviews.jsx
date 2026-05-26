import React, { useState, useEffect } from 'react';
import { reviewsService } from '../../services/siteContentService';
import { Star, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved'

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await reviewsService.getAll();
      setReviews(data);
    } catch (err) {
      toast.error('Error loading reviews: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try { 
      await reviewsService.approve(id); 
      await load(); 
      toast.success('Review approved!');
    } catch (err) { 
      toast.error('Error: ' + err.message); 
    }
  };

  const handleReject = async (id) => {
    try { 
      await reviewsService.reject(id); 
      await load(); 
      toast.success('Review hidden.');
    } catch (err) { 
      toast.error('Error: ' + err.message); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try { 
      await reviewsService.delete(id); 
      await load(); 
      toast.success('Review deleted.');
    } catch (err) { 
      toast.error('Error: ' + err.message); 
    }
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  const pendingCount = reviews.filter(r => !r.approved).length;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-green"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-800">Customer Reviews</h1>
          {pendingCount > 0 ? (
            <p className="text-amber-600 font-medium mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {pendingCount} review{pendingCount > 1 ? 's' : ''} awaiting approval
            </p>
          ) : (
            <p className="text-gray-500 mt-1">Manage customer feedback across all products.</p>
          )}
        </div>
        
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          {['all', 'pending', 'approved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-sage-green text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="capitalize">{f}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No reviews found matching your filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-gray-800 text-lg">{r.author_name}</span>
                  
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    r.approved 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {r.approved ? 'Approved' : 'Pending'}
                  </span>
                  
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                
                {r.product_id && (
                  <p className="text-xs font-mono text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                    Product: {r.product_id}
                  </p>
                )}
                
                <p className="text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4 py-1">
                  "{r.body}"
                </p>
              </div>
              
              <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                {!r.approved ? (
                  <button 
                    onClick={() => handleApprove(r.id)} 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleReject(r.id)} 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Hide</span>
                  </button>
                )}
                
                <button 
                  onClick={() => handleDelete(r.id)} 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
