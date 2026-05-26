import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Heart, CreditCard, LogOut, Sparkles, ChevronRight, Settings, Star, Loader2, Gift, ShieldCheck, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileData, ordersData] = await Promise.all([
          profileService.getProfile(),
          orderService.getUserOrders()
        ]);
        setUser(profileData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load profile:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleShareReferral = async () => {
    if (!user) return;
    const referralLink = `${window.location.origin}/auth?ref=${user.id}`;
    const shareData = {
      title: "Toujours Knot Referral",
      text: `🌸 Join Toujours Knot and get 500 Magic Points! ✨`,
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success('Your magical referral link has been copied to your clipboard! 🌸');
      }
    } catch (err) {
      console.warn('Share failed:', err);
      try {
        await navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard! 🌸');
      } catch (clipErr) {
        toast.error('Could not copy link.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
          <p className="text-blossom-pink font-bold animate-pulse">Gathering your magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar / User Info */}
          <div className="w-full md:w-80 space-y-6">
            <div className="card-cute glass p-8 text-center relative">
              <div className="absolute top-4 right-4 text-blossom-pink/20">
                <Sparkles size={40} />
              </div>

              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={user?.avatar_url || 'https://via.placeholder.com/150'} alt={user?.first_name || 'User'} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blossom-pink to-pink-400 text-white p-2.5 rounded-xl border-4 border-white shadow-lg shadow-pink-200">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>

              <h1 className="text-2xl font-playfair font-bold text-charcoal-berry mb-1">{user?.first_name || 'Guest'} {user?.last_name || ''}</h1>
              <p className="text-sm text-charcoal-berry/60 mb-6">{user?.email || 'No email'}</p>

              <div className="flex flex-col gap-3">
                <div className="bg-white/50 border border-pink-50 p-3 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-blossom-pink mb-1">Magic Points</span>
                  <span className="text-xl font-bold text-charcoal-berry">{(user?.points || 0).toLocaleString()}</span>
                </div>

                <button onClick={handleEditProfile} className="btn-cute w-full text-sm py-3 flex items-center justify-center gap-2">
                  <Settings size={16} /> Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3">
              {[
                { label: 'My Orders', icon: Package, link: '/orders', color: 'text-sage-mist' },
                { label: 'Wishlist', icon: Heart, link: '/wishlist', color: 'text-blossom-pink' },
                { label: 'Addresses', icon: MapPin, link: '/addresses', color: 'text-blue-400' },
                { label: 'Payments', icon: CreditCard, link: '/payment', color: 'text-purple-400' },
                { label: 'My Reviews', icon: MessageSquare, link: '/my-reviews', color: 'text-amber-500' },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 rounded-2xl border border-white shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <span className="font-bold text-charcoal-berry text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blossom-pink group-hover:translate-x-1 transition-all" />
                </Link>
              ))}

              <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 bg-red-50/30 hover:bg-red-50/50 rounded-2xl border border-red-100 text-red-500 font-bold text-sm transition-all mt-4 group">
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-cute glass p-6 border-l-4 border-l-blossom-pink">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-50 rounded-2xl text-blossom-pink">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-berry/60 uppercase tracking-wider">Rewards Tier</h3>
                    <p className="text-xl font-bold text-charcoal-berry">Petal Platinum</p>
                  </div>
                </div>
              </div>
              <div className="card-cute glass p-6 border-l-4 border-l-sage-mist">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-mist/10 rounded-2xl text-sage-mist">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-berry/60 uppercase tracking-wider">Security</h3>
                    <p className="text-xl font-bold text-charcoal-berry">2FA Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card-cute glass p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-playfair font-bold text-charcoal-berry">Recent Magic</h2>
                <Link to="/orders" className="text-sm font-bold text-blossom-pink hover:bg-pink-50 px-4 py-2 rounded-xl transition-colors">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {orders.length > 0 ? orders.map((order, i) => (
                  <div key={i} onClick={() => navigate(`/track?id=${order.id}`)} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/50 border border-white hover:shadow-lg transition-all hover:scale-[1.01] group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-pink-50 group-hover:rotate-6 transition-transform">
                        {order.icon || '🌸'}
                      </div>
                      <div>
                        <p className="font-bold text-charcoal-berry text-lg">{order.id}</p>
                        <p className="text-xs text-charcoal-berry/40 flex items-center gap-1">
                          <Package size={10} /> {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-charcoal-berry mb-1">{formatCurrency(order.final_amount)}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white/30 rounded-3xl border border-dashed border-pink-200">
                    <Package size={48} className="mx-auto text-pink-200 mb-4" />
                    <p className="text-gray-500 font-bold">No orders yet. Let's make some magic!</p>
                    <Link to="/shop" className="text-blossom-pink font-bold hover:underline mt-2 inline-block">Start Shopping</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty Card / Promo */}
            <div className="relative rounded-[3rem] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blossom-pink via-pink-400 to-purple-400 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                </svg>
              </div>

              <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-playfair font-bold mb-3">Bloom Together</h3>
                  <p className="text-white/80 max-w-sm mb-6 leading-relaxed">
                    Refer your flower-loving friends and earn <span className="font-bold text-white">500 Magic Points</span> each once they make their first artisan purchase.
                  </p>
                  <button 
                    onClick={handleShareReferral}
                    className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-pink-900/20 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Share the Love
                  </button>
                </div>
                <div className="relative">
                  <div className="w-40 h-40 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center animate-pulse">
                    <Gift size={80} className="text-white drop-shadow-lg" />
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-spin-slow" size={32} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

