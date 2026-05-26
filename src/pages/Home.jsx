import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShoppingBag, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productsService } from '../services/supabaseService';
import { siteContentService } from '../services/siteContentService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const TrustItem = ({ emoji, text }) => (
  <div className="group flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all duration-500 hover:bg-pink-50/50 cursor-default">
    <div className="relative w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md">
      {emoji}
    </div>
    <span className="font-bold text-sm text-charcoal-berry/80 group-hover:text-blossom-pink transition-colors text-center">{text}</span>
  </div>
);

const FeaturedCard = ({ product, onBuyNow }) => {

  return (
    <div className="group relative bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-pink-100 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block aspect-[4/5] rounded-[2rem] overflow-hidden bg-pink-50 mb-6 relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
          <button
            onClick={(e) => { e.preventDefault(); onBuyNow(product); }}
            className="bg-white text-charcoal-berry py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-blossom-pink hover:text-white"
          >
            <Zap size={18} fill="currentColor" /> Buy Now
          </button>
        </div>
      </Link>
      <div className="px-2 pb-2 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-bold text-charcoal-berry mb-1 group-hover:text-blossom-pink transition-colors">{product.name}</h3>
        </Link>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-blossom-pink">{formatCurrency(product.price)}</span>
          <div className="w-10 h-10 rounded-full bg-charcoal-berry text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <ShoppingBag size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [c, setC] = useState({});
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
      async function load() {
        const [products, content] = await Promise.all([
          productsService.getProducts(),
          siteContentService.getAll(),
        ]);
        setFeatured(products.slice(0, 4));
        setC(content);
      }
      load();
    }, []);

    const handleBuyNow = (product) => {
      if (!user) {
        navigate('/auth');
        return;
      }
      addToCart(product);
      navigate('/checkout');
    };

    const g = (key) => c[key] ?? '';

    return (
      <div className="min-h-screen bg-creamy-vanilla selection:bg-blossom-pink/30">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blossom-pink/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-sage-mist/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-pink-200/20 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold text-blossom-pink border border-pink-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles size={16} className="animate-spin-slow" />
                <span>{g('hero.badge')}</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-playfair font-black text-charcoal-berry leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {g('hero.headline1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blossom-pink to-pink-400 italic">{g('hero.headline2')}</span>
              </h1>

              <p className="text-xl md:text-2xl text-charcoal-berry/70 font-quicksand mb-12 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                {g('hero.subtext')}
              </p>

              <div className="flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                <Link to="/shop" className="group btn-cute text-xl px-12 py-5 flex items-center gap-3">
                  Shop Collection
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link to="/customizer" className="px-12 py-5 rounded-[2rem] font-bold text-charcoal-berry hover:bg-white transition-all border-2 border-pink-100 hover:border-blossom-pink bg-transparent text-xl shadow-sm hover:shadow-md">
                  Custom Design
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block animate-in zoom-in fade-in duration-1500 delay-500">
              <div className="relative z-10 rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <img src={g('hero.image') || '/images/hero.png'} alt="Premium Floral Arrangement" className="w-full h-auto object-cover aspect-[4/5] scale-105 hover:scale-100 transition-transform duration-700" />
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/40 backdrop-blur-xl rounded-[3rem] p-6 shadow-xl -rotate-12 animate-float">
                <img src={g('hero.float_image1') || '/images/rose.png'} className="w-full h-full object-cover rounded-2xl" alt="" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-xl rotate-12 animate-float-delayed">
                <img src={g('hero.float_image2') || '/images/cat-charm.png'} className="w-full h-full object-cover rounded-2xl" alt="" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-playfair font-black text-charcoal-berry mb-4">Our Curated Magic</h2>
              <div className="w-32 h-2 bg-gradient-to-r from-blossom-pink to-transparent rounded-full" />
            </div>
            <p className="text-charcoal-berry/60 max-w-md text-lg font-medium">
              Handcrafted treasures designed to spark joy and preserve your most precious moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Link to="/shop" className="group relative cursor-pointer overflow-hidden rounded-[3rem] border-8 border-white shadow-xl transition-all hover:shadow-2xl">
              <div className="aspect-[16/9] bg-pink-50 relative overflow-hidden">
                <img src={g('category.bouquets.image') || '/images/cat-bouquets.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-berry/80 via-charcoal-berry/20 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                <span className="text-blossom-pink font-black tracking-widest uppercase text-sm mb-2">Collection</span>
                <h3 className="text-4xl font-playfair font-bold mb-4">{g('category.bouquets.title')}</h3>
                <p className="font-quicksand text-lg mb-6 opacity-90 max-w-sm">{g('category.bouquets.desc')}</p>
                <div className="w-fit bg-white text-charcoal-berry px-8 py-3 rounded-full font-bold transition-all group-hover:bg-blossom-pink group-hover:text-white flex items-center gap-2">
                  Explore Now <ArrowRight size={18} />
                </div>
              </div>
            </Link>

            <Link to="/shop" className="group relative cursor-pointer overflow-hidden rounded-[3rem] border-8 border-white shadow-xl transition-all hover:shadow-2xl">
              <div className="aspect-[16/9] bg-sage-mist/30 relative overflow-hidden">
                <img src={g('category.keychains.image') || '/images/cat-keychains.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-berry/80 via-charcoal-berry/20 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                <span className="text-sage-300 font-black tracking-widest uppercase text-sm mb-2">Accessories</span>
                <h3 className="text-4xl font-playfair font-bold mb-4">{g('category.keychains.title')}</h3>
                <p className="font-quicksand text-lg mb-6 opacity-90 max-w-sm">{g('category.keychains.desc')}</p>
                <div className="w-fit bg-white text-charcoal-berry px-8 py-3 rounded-full font-bold transition-all group-hover:bg-blossom-pink group-hover:text-white flex items-center gap-2">
                  Browse Collection <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-creamy-vanilla py-32 border-t border-pink-100/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-blossom-pink font-black tracking-[0.2em] uppercase text-xs mb-4 block">Handpicked for you</span>
              <h2 className="text-5xl font-playfair font-black text-charcoal-berry">Trending Treasures</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map(product => (
                <FeaturedCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
            <div className="mt-20 text-center">
              <Link to="/shop" className="inline-flex items-center gap-3 text-charcoal-berry font-bold text-xl hover:text-blossom-pink transition-colors group">
                View All Products
                <div className="w-12 h-12 rounded-full border-2 border-charcoal-berry/10 flex items-center justify-center group-hover:border-blossom-pink group-hover:bg-blossom-pink group-hover:text-white transition-all">
                  <ArrowRight size={20} />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="card-cute glass relative overflow-hidden p-12 md:p-20 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blossom-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage-mist/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="text-blossom-pink font-black tracking-[0.3em] uppercase text-xs mb-4 block">Exclusive Access</span>
                <h2 className="text-5xl font-playfair font-black text-charcoal-berry mb-6">{g('newsletter.headline')}</h2>
                <p className="text-charcoal-berry/60 text-lg mb-10 leading-relaxed font-quicksand">{g('newsletter.subtext')}</p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Enter your email" className="input-cute flex-1" />
                  <button className="btn-cute whitespace-nowrap">Subscribe ✨</button>
                </form>
                <p className="text-xs text-gray-400 mt-6 font-medium">No spam, only magic. You can unsubscribe at any time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map(i => (
              <TrustItem key={i} emoji={g(`trust.${i}.emoji`)} text={g(`trust.${i}.text`)} />
            ))}
          </div>
        </section>
      </div>
    );
  }
