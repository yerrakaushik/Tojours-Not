import React from 'react';
import { ShoppingBag, Heart, User, Menu, X, Truck, Package, ShieldCheck, Flower2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  return (
    <nav className="sticky top-0 z-50 bg-creamy-vanilla/90 backdrop-blur-md border-b border-pink-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-2xl group-hover:rotate-12 transition-transform">🌸</div>
          <span className="font-playfair text-2xl font-bold text-charcoal-berry tracking-tight group-hover:text-blossom-pink transition-colors">
            Toujours Knot
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-quicksand font-semibold text-charcoal-berry">
          <Link to="/" className="hover:text-blossom-pink transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-blossom-pink hover:after:w-full after:transition-all">Home</Link>
          <Link to="/shop" className="hover:text-blossom-pink transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-blossom-pink hover:after:w-full after:transition-all">Shop All</Link>
          <Link to="/customizer" className="hover:text-blossom-pink transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-blossom-pink hover:after:w-full after:transition-all">Custom</Link>
          <Link to="/about" className="hover:text-blossom-pink transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-0.5 after:bg-blossom-pink hover:after:w-full after:transition-all">Our Story</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/wishlist" className="p-2 hover:bg-pink-50 rounded-full transition-all hover:scale-110 text-charcoal-berry relative">
            <Heart size={22} className={wishlist.length > 0 ? 'fill-blossom-pink text-blossom-pink' : ''} />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-sage-mist text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-in zoom-in duration-300">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="p-2 hover:bg-pink-50 rounded-full transition-all hover:scale-110 text-charcoal-berry relative">
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-blossom-pink text-charcoal-berry text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/profile" className="hidden md:block p-2 hover:bg-pink-50 rounded-full transition-all hover:scale-110 text-charcoal-berry">
            <User size={22} />
          </Link>
          <button
            className="md:hidden p-2 text-charcoal-berry"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-pink-100 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-semibold p-2 hover:bg-pink-50 rounded-xl">Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="text-lg font-semibold p-2 hover:bg-pink-50 rounded-xl">Shop All</Link>
          <Link to="/customizer" onClick={() => setIsOpen(false)} className="text-lg font-semibold p-2 hover:bg-pink-50 rounded-xl">Custom</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-semibold p-2 hover:bg-pink-50 rounded-xl">Our Story</Link>
          <Link to="/profile" onClick={() => setIsOpen(false)} className="text-lg font-semibold p-2 hover:bg-pink-50 rounded-xl">My Profile</Link>
        </div>
      )}
    </nav>
  );
}
