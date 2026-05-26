import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck, Sparkles, Plus, Minus, CheckCircle2, Loader2, Share2, Info, Camera, Video, X, User, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { productsService } from '../services/supabaseService';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const products = await productsService.getProducts();
        const found = products.find(p => p.id.toString() === id);
        setProduct(found);

        if (found) {
          // Get similar products from the same category
          const similar = products
            .filter(p => p.category === found.category && p.id.toString() !== id)
            .slice(0, 4);
          setSimilarProducts(similar);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    setAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setTimeout(() => setAdding(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toggleWishlist(product);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this magical ${product.name} at Bloom & Charm!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Magical link copied to clipboard! ✨');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
          <p className="text-charcoal-berry font-bold animate-pulse">Summoning product magic...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-creamy-vanilla p-8 text-center">
        <div className="text-8xl mb-8">🥀</div>
        <h1 className="text-4xl font-playfair font-bold text-charcoal-berry mb-4">Product Not Found</h1>
        <p className="text-charcoal-berry/60 mb-8">It seems this magical item has vanished from our garden.</p>
        <Link to="/shop" className="btn-cute px-10">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink font-bold mb-8 transition-colors group">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </div>
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="relative group aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-pink-50">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button
                  onClick={handleToggleWishlist}
                  className={`p-4 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90 ${isInWishlist(product.id)
                      ? 'bg-blossom-pink text-white shadow-pink-200'
                      : 'bg-white text-charcoal-berry hover:text-blossom-pink'
                    }`}
                >
                  <Heart size={24} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 rounded-2xl shadow-xl bg-white text-charcoal-berry hover:text-blossom-pink transition-all hover:scale-110 active:scale-90"
                >
                  <Share2 size={24} />
                </button>
              </div>


            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-4">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:border-blossom-pink transition-all cursor-pointer bg-white">
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col h-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-blossom-pink text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} /> Artisan Pick
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-charcoal-berry mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <span className="text-sm font-bold text-charcoal-berry/40">48 Verified Reviews</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-charcoal-berry">{formatCurrency(product.price)}</span>
                <span className="text-xl text-charcoal-berry/30 line-through">{formatCurrency((product.price * 1.2).toFixed(0))}</span>
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-sm font-bold">20% OFF</span>
              </div>
            </div>

            <div className="space-y-8 mb-10">
              <div>
                <h3 className="text-sm font-bold text-charcoal-berry/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={14} /> Description
                </h3>
                <p className="text-lg text-charcoal-berry/70 leading-relaxed max-w-xl">
                  {product.description || `Add a touch of whimsical charm to your life with our handcrafted ${product.name.toLowerCase()}. Each piece is carefully assembled using premium materials to ensure it brings joy for years to come. Perfect for gifting or treating yourself to something special.`}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-6">
                <h3 className="text-sm font-bold text-charcoal-berry/60 uppercase tracking-widest">Quantity</h3>
                <div className="flex items-center gap-4 bg-white rounded-2xl p-2 shadow-sm border border-pink-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-pink-50 rounded-xl transition-colors text-charcoal-berry"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-8 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-pink-50 rounded-xl transition-colors text-charcoal-berry"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-3xl font-bold text-lg shadow-2xl transition-all active:scale-95 ${adding
                      ? 'bg-green-500 text-white'
                      : 'bg-charcoal-berry text-white hover:bg-blossom-pink hover:shadow-pink-200'
                    }`}
                >
                  {adding ? (
                    <>
                      <CheckCircle2 size={24} className="animate-bounce" /> Magically Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={24} /> Add to Bag
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-5 rounded-3xl font-bold text-lg border-2 border-charcoal-berry text-charcoal-berry hover:bg-charcoal-berry hover:text-white transition-all active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              {/* Payment Info Badge */}
              <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                ['Bouquets', 'Bags', 'Customized'].includes(product.category)
                  ? 'bg-orange-50 border-orange-100 text-orange-700' 
                  : 'bg-green-50 border-green-100 text-green-700'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ['Bouquets', 'Bags', 'Customized'].includes(product.category)
                    ? 'bg-orange-100' 
                    : 'bg-green-100'
                }`}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider">
                    {['Bouquets', 'Bags', 'Customized'].includes(product.category) ? 'Prepaid Only' : 'COD Available'}
                  </h4>
                  <p className="text-[10px] opacity-80 font-medium">
                    {['Bouquets', 'Bags', 'Customized'].includes(product.category)
                      ? 'Special items require advance payment to begin creation.' 
                      : 'You can pay on delivery or choose secure online payment.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-pink-50">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white">
                <div className="p-3 bg-pink-50 rounded-xl text-blossom-pink">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal-berry">Free Shipping</h4>
                  <p className="text-xs text-charcoal-berry/40">On all orders above {formatCurrency(500)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-white">
                <div className="p-3 bg-sage-mist/10 rounded-xl text-sage-mist">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal-berry">Artisan Quality</h4>
                  <p className="text-xs text-charcoal-berry/40">100% Handcrafted items</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-12 flex items-center gap-4">
              You Might Also Adore <Sparkles className="text-blossom-pink" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-pink-50 flex flex-col"
                >
                  <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 relative bg-creamy-vanilla">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-blossom-pink shadow-sm">
                        <ShoppingBag size={18} />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-charcoal-berry group-hover:text-blossom-pink transition-colors mb-1">{p.name}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-charcoal-berry/40 font-bold uppercase tracking-wider">{p.category}</span>
                    <span className="font-bold text-charcoal-berry">{formatCurrency(p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <ReviewSection productId={id} />
      </div>
    </div>
  );
}

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Sarah M.",
      rating: 5,
      date: "2 days ago",
      content: "Absolutely stunning! The quality of the handmade flowers exceeded my expectations. It was the perfect birthday gift.",
      verified: true,
      media: ["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300&q=80"]
    },
    {
      id: 2,
      user: "James R.",
      rating: 4,
      date: "1 week ago",
      content: "Very beautiful item. Shipping took a bit longer than expected but the artisan quality made up for it.",
      verified: true,
      media: []
    }
  ]);

  const [newReview, setNewReview] = useState({ rating: 5, content: '', media: [] });
  const [showForm, setShowForm] = useState(false);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setNewReview(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
  };

  const removeMedia = (index) => {
    setNewReview(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewToAdd = {
      id: Date.now(),
      user: "Guest Gardener",
      rating: newReview.rating,
      date: "Just now",
      content: newReview.content,
      verified: false,
      media: newReview.media.map(m => m.url)
    };
    setReviews([reviewToAdd, ...reviews]);
    setNewReview({ rating: 5, content: '', media: [] });
    setShowForm(false);
  };

  return (
    <section className="mt-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">Customer Whispers</h2>
          <p className="text-charcoal-berry/40 font-medium">What our garden community is saying</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-cute px-8 py-4 flex items-center gap-2"
        >
          {showForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-16 shadow-xl border border-pink-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-8">Share your experience</h3>

          <div className="space-y-8">
            {/* Rating */}
            <div>
              <label className="block text-sm font-bold text-charcoal-berry/60 uppercase tracking-widest mb-4">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`transition-all duration-300 ${newReview.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                  >
                    <Star size={32} fill={newReview.rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-bold text-charcoal-berry/60 uppercase tracking-widest mb-4">Review Content</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                required
                placeholder="How did this item make you feel?"
                className="w-full px-6 py-4 rounded-2xl bg-creamy-vanilla/50 border-2 border-transparent focus:border-blossom-pink outline-none transition-all h-32 resize-none font-medium"
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-bold text-charcoal-berry/60 uppercase tracking-widest mb-4">Photos & Videos</label>
              <div className="flex flex-wrap gap-4">
                <label className="cursor-pointer group">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center gap-2 text-pink-300 group-hover:border-blossom-pink group-hover:text-blossom-pink transition-all">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Add Media</span>
                  </div>
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                </label>

                {newReview.media.map((item, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md group">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    {item.type === 'video' && <Video size={16} className="absolute bottom-2 left-2 text-white shadow-sm" />}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-charcoal-berry text-white rounded-2xl font-bold text-lg hover:bg-blossom-pink transition-all shadow-lg">
              Post My Review
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-pink-50 hover:shadow-xl transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-blossom-pink">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-berry">{review.user}</h4>
                  <p className="text-xs text-charcoal-berry/40 font-medium">{review.date}</p>
                </div>
              </div>
              {review.verified && (
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                  Verified
                </div>
              )}
            </div>

            <div className="flex text-yellow-400 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} fill={i <= review.rating ? 'currentColor' : 'none'} className={i > review.rating ? 'text-gray-200' : ''} />
              ))}
            </div>

            <p className="text-charcoal-berry/70 leading-relaxed mb-6 font-medium">
              {review.content}
            </p>

            {review.media && review.media.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {review.media.map((url, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:scale-105 transition-transform bg-creamy-vanilla">
                    <img src={url} alt="Review media" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
