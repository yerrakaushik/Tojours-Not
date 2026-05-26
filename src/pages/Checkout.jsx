import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Truck, 
  Gift,
  Lock,
  Wallet,
  HandCoins,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Home as HomeIcon,
  Briefcase,
  Check,
  Globe
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../services/orderService';
import { notificationService } from '../services/notificationService';
import DeliveryAnimation from '../components/checkout/DeliveryAnimation';
import CouponInput from '../components/checkout/CouponInput';
import { formatCurrency } from '../utils/currency';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [coupon, setCoupon] = useState(null); // { couponId, discountAmount }
  const completedCartRef = useRef([]); // snapshot cart before clearing
  const completedPriceRef = useRef(0);
  const completedPaymentRef = useRef('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  
  // Basic shipping form data used for final checkout order service
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });

  // Premium Saved Address states
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // address object if editing, null if adding
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Address form states
  const [addrFormData, setAddrFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine1: '', // Flat, House No, etc
    addressLine2: '', // Area, Street, etc
    city: '',
    state: '',
    type: 'Home', // Home, Work, Other
  });

  // Load User Profile and Saved Addresses on mount
  useEffect(() => {
    async function loadProfileAndAddresses() {
      try {
        const u = await authService.getCurrentUser();
        if (!u) return;

        const prof = await profileService.getProfile();
        setProfile(prof);

        // Standard Default Address from Supabase profile details
        const defaultAddr = prof ? {
          id: 'profile-default',
          name: `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || u.email.split('@')[0],
          phone: prof.phone || '',
          addressLine1: prof.address_line1 || '',
          addressLine2: prof.address_line2 || '',
          city: prof.city || '',
          state: prof.state || '',
          pincode: prof.pincode || '',
          type: 'Home',
          isDefault: true
        } : null;

        // Custom saved addresses from localStorage (scoped by user UUID)
        const stored = localStorage.getItem(`addresses_user_${u.id}`);
        let localAddresses = stored ? JSON.parse(stored) : [];

        let merged = [];
        if (defaultAddr && (defaultAddr.addressLine1 || defaultAddr.pincode)) {
          merged.push(defaultAddr);
        }
        merged = [...merged, ...localAddresses];
        setAddresses(merged);

        // Pre-select first address if any exist
        if (merged.length > 0) {
          const selected = merged.find(a => a.isDefault) || merged[0];
          setSelectedAddressId(selected.id);
          setFormData({
            name: selected.name,
            email: u.email,
            phone: selected.phone,
            address: `${selected.addressLine1}${selected.addressLine2 ? ', ' + selected.addressLine2 : ''}`,
            city: selected.city,
            zip: selected.pincode
          });
        } else {
          // Pre-populate empty form using profile credentials
          setFormData(prev => ({
            ...prev,
            email: u.email,
            name: `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim() || prev.name,
            phone: prof?.phone || prev.phone
          }));
        }
      } catch (e) {
        console.error('Failed to load profile details:', e);
      }
    }
    loadProfileAndAddresses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Change currently selected shipping address
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData({
      name: addr.name,
      email: profile?.email || formData.email,
      phone: addr.phone,
      address: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
      city: addr.city,
      zip: addr.pincode
    });
  };

  // Handle live pin code lookup helper (with secure global API fallback)
  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddrFormData(prev => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      setPincodeLoading(true);
      setPincodeSuccess(false);
      try {
        // Try Zippopotam API first (trusted global secure SSL)
        const res = await fetch(`https://api.zippopotam.us/in/${pin}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.places && data.places.length > 0) {
            const place = data.places[0];
            setAddrFormData(prev => ({
              ...prev,
              city: place['place name'] || '',
              state: place['state'] || ''
            }));
            setPincodeSuccess(true);
            setPincodeLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Primary pincode API failed, trying fallback...', err);
      }

      // Fallback API if primary is down
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0]?.Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddrFormData(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Block || '',
            state: postOffice.State || ''
          }));
          setPincodeSuccess(true);
        }
      } catch (err) {
        console.warn('Fallback pincode API failed:', err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // Save new or edited address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(addrFormData.pincode)) {
      alert('Please enter a valid 6-digit Pincode.');
      return;
    }
    if (!/^[0-9]{10}$/.test(addrFormData.phone)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const u = await authService.getCurrentUser();
    if (!u) return;

    let updatedAddresses = [...addresses];

    if (editingAddress) {
      if (editingAddress.id === 'profile-default') {
        // Sync update directly to Supabase profile
        try {
          await profileService.updateProfile({
            first_name: addrFormData.name.split(' ')[0] || '',
            last_name: addrFormData.name.split(' ').slice(1).join(' ') || '',
            phone: addrFormData.phone,
            address_line1: addrFormData.addressLine1,
            address_line2: addrFormData.addressLine2,
            city: addrFormData.city,
            state: addrFormData.state,
            pincode: addrFormData.pincode
          });
        } catch (err) {
          console.error('Failed to sync profile update:', err);
        }

        updatedAddresses = updatedAddresses.map(a => a.id === 'profile-default' ? {
          ...a,
          name: addrFormData.name,
          phone: addrFormData.phone,
          addressLine1: addrFormData.addressLine1,
          addressLine2: addrFormData.addressLine2,
          city: addrFormData.city,
          state: addrFormData.state,
          pincode: addrFormData.pincode,
          type: addrFormData.type
        } : a);
      } else {
        // Update in custom localStorage addresses
        const stored = localStorage.getItem(`addresses_user_${u.id}`);
        let localAddresses = stored ? JSON.parse(stored) : [];
        localAddresses = localAddresses.map(a => a.id === editingAddress.id ? {
          ...a,
          name: addrFormData.name,
          phone: addrFormData.phone,
          addressLine1: addrFormData.addressLine1,
          addressLine2: addrFormData.addressLine2,
          city: addrFormData.city,
          state: addrFormData.state,
          pincode: addrFormData.pincode,
          type: addrFormData.type
        } : a);
        localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));

        updatedAddresses = updatedAddresses.map(a => a.id === editingAddress.id ? {
          ...a,
          name: addrFormData.name,
          phone: addrFormData.phone,
          addressLine1: addrFormData.addressLine1,
          addressLine2: addrFormData.addressLine2,
          city: addrFormData.city,
          state: addrFormData.state,
          pincode: addrFormData.pincode,
          type: addrFormData.type
        } : a);
      }
    } else {
      // Add custom new address in localStorage
      const newAddr = {
        id: `local-${Date.now()}`,
        name: addrFormData.name,
        phone: addrFormData.phone,
        addressLine1: addrFormData.addressLine1,
        addressLine2: addrFormData.addressLine2,
        city: addrFormData.city,
        state: addrFormData.state,
        pincode: addrFormData.pincode,
        type: addrFormData.type,
        isDefault: false
      };

      const stored = localStorage.getItem(`addresses_user_${u.id}`);
      let localAddresses = stored ? JSON.parse(stored) : [];
      localAddresses.push(newAddr);
      localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));

      updatedAddresses.push(newAddr);
    }

    setAddresses(updatedAddresses);

    // Select the saved address
    const targetId = editingAddress ? editingAddress.id : updatedAddresses[updatedAddresses.length - 1].id;
    const targetAddr = updatedAddresses.find(a => a.id === targetId);
    if (targetAddr) {
      handleSelectAddress(targetAddr);
    }

    setShowAddressForm(false);
    setEditingAddress(null);
    setPincodeSuccess(false);
  };

  // Delete saved custom address
  const handleDeleteAddress = async (addrId, e) => {
    e.stopPropagation();
    if (addrId === 'profile-default') {
      alert('Default profile address cannot be deleted. Please edit it instead.');
      return;
    }

    const u = await authService.getCurrentUser();
    if (!u) return;

    if (!confirm('Are you sure you want to delete this address?')) return;

    const stored = localStorage.getItem(`addresses_user_${u.id}`);
    let localAddresses = stored ? JSON.parse(stored) : [];
    localAddresses = localAddresses.filter(a => a.id !== addrId);
    localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));

    const updated = addresses.filter(a => a.id !== addrId);
    setAddresses(updated);

    if (selectedAddressId === addrId) {
      if (updated.length > 0) {
        handleSelectAddress(updated[0]);
      } else {
        setSelectedAddressId(null);
        setFormData(prev => ({
          ...prev,
          name: '',
          phone: '',
          address: '',
          city: '',
          zip: ''
        }));
      }
    }
  };

  // Triggers the edit address drawer/view
  const triggerEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setAddrFormData({
      name: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      type: addr.type
    });
    setShowAddressForm(true);
    setPincodeSuccess(true);
  };

  // Triggers the add new address drawer/view
  const triggerAddNewAddress = () => {
    setEditingAddress(null);
    setAddrFormData({
      name: '',
      phone: '',
      pincode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      type: 'Home'
    });
    setShowAddressForm(true);
    setPincodeSuccess(false);
  };

  const finalPrice = totalPrice - (coupon?.discountAmount || 0);

  // Check if COD is allowed (No Bouquets, Bags or Customized items)
  const isCODAllowed = !cart.some(item => 
    item.category === 'Bouquets' || 
    item.category === 'Bags' ||
    item.category === 'Customized'
  );

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const initRazorpay = async () => {
    setLoading(true);
    try {
      // 1. Create order in 'pending' state
      const orderData = {
        userId: (await authService.getCurrentUser())?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        status: 'Processing',
        paymentMethod: 'Razorpay',
        paymentStatus: 'pending',
        addressSnapshot: {
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          phone: formData.phone
        }
      };

      const order = await orderService.createOrder(orderData, cart, coupon?.code);
      setOrderId(order.id);

      // 1.5. Call API to create Razorpay Order on the server (with safe client-side fallback)
      let rzpOrder = null;
      try {
        const rzpResponse = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: finalPrice,
            currency: 'INR',
            receipt: order.id
          })
        });

        if (rzpResponse.ok) {
          const contentType = rzpResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            rzpOrder = await rzpResponse.json();
          } else {
            console.warn('Razorpay API response was not JSON, falling back to client-side checkout');
          }
        } else {
          console.warn(`Razorpay API returned status ${rzpResponse.status}, falling back to client-side checkout`);
        }
      } catch (apiErr) {
        console.warn('Razorpay server-side order creation failed, falling back to client-side checkout:', apiErr);
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(finalPrice * 100), // Amount in paise
        currency: "INR", // Or INR depending on your setup
        name: "Toujours Knot",
        description: `Order #${order.id}`,
        image: "/logo.png",
        ...(rzpOrder && { order_id: rzpOrder.id }),
        handler: async function (response) {
          // Update order with payment details via shipping_address JSONB
          const { data: currentOrder } = await supabase
            .from('orders')
            .select('shipping_address')
            .eq('id', order.id)
            .single();

          await supabase
            .from('orders')
            .update({ 
              shipping_address: {
                ...(currentOrder?.shipping_address || {}),
                payment_status: 'succeeded',
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            })
            .eq('id', order.id);

          handlePaymentSuccess(order.id);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#FFB6C1"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay init error:', error);
      alert(error.message || 'Could not initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCODPayment = async () => {
    setLoading(true);
    try {
      const orderData = {
        userId: (await authService.getCurrentUser())?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        status: 'Processing',
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        addressSnapshot: {
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          phone: formData.phone
        }
      };

      const order = await orderService.createOrder(orderData, cart, coupon?.code);
      setOrderId(order.id);
      handlePaymentSuccess(order.id);
    } catch (error) {
      console.error('COD order error:', error);
      alert('Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (id) => {
    // Snapshot cart + price before clearing
    completedCartRef.current = [...cart];
    completedPriceRef.current = finalPrice;
    completedPaymentRef.current = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (Prepaid)';
    try {
      await notificationService.sendOrderConfirmationEmail(formData.email, id, { total: finalPrice, cart });
      setIsAnimating(true);
      clearCart();
    } catch (error) {
      console.error('Finalization error:', error);
      setIsAnimating(true);
      clearCart();
    }
  };

  // ── Build WhatsApp order message ──────────────────────────────────────────
  const buildWhatsAppMessage = () => {
    const items = completedCartRef.current;
    const total = completedPriceRef.current;
    const payment = completedPaymentRef.current;

    let msg = `🛍️ *New Order — TojOur's Not*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *Order ID:* ${orderId}\n`;
    msg += `💳 *Payment:* ${payment}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `👤 *Customer Details*\n`;
    msg += `Name: ${formData.name}\n`;
    msg += `Phone: ${formData.phone}\n`;
    msg += `Email: ${formData.email}\n`;
    msg += `Address: ${formData.address}, ${formData.city} — ${formData.zip}\n\n`;

    msg += `📦 *Items Ordered*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}* — ₹${item.price}\n`;
      if (item.isCustom && item.customization) {
        const c = item.customization;
        Object.entries(c).forEach(([key, val]) => {
          if (val && key !== 'type') {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, s => s.toUpperCase());
            msg += `   • ${label}: ${val}\n`;
          }
        });
      }
      if (item.quantity && item.quantity > 1) {
        msg += `   Qty: ${item.quantity}\n`;
      }
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Total: ₹${total}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `🌸 Thank you for choosing TojOur's Not!`;

    return msg;
  };

  const whatsappLink = () => {
    const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
    return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  };

  if (cart.length === 0 && step < 3 && !isAnimating && !orderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-32 h-32 bg-pink-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
          <ShoppingBag size={64} className="text-pink-200" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-pink-50">
            <Sparkles size={16} className="text-pink-300" />
          </div>
        </div>
        <h2 className="text-4xl font-playfair font-bold mb-4 text-charcoal-berry">Your Bag is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-xs">It seems you haven't picked any blossoms yet. Let's find something magical!</p>
        <Link to="/shop" className="btn-cute flex items-center gap-2 group">
          Explore Shop <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-creamy-vanilla animate-in fade-in duration-1000">
        <div className="card-cute glass max-w-2xl w-full text-center p-12 relative overflow-hidden shadow-[0_20px_50px_rgba(255,182,193,0.2)]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blossom-pink via-pink-400 to-purple-400 animate-gradient-x" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl" />
          
          <div className="mb-10 relative inline-block">
            <div className="w-28 h-28 bg-green-50 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-xl shadow-green-100/50 border-4 border-white">
              <CheckCircle2 size={56} className="text-green-500" />
            </div>
            <div className="absolute -top-6 -right-6 animate-spin-slow">
              <Sparkles className="text-yellow-400" size={40} />
            </div>
            <div className="absolute -bottom-2 -left-8 animate-pulse">
              <Sparkles className="text-pink-300" size={24} />
            </div>
          </div>

          <h2 className="text-5xl font-playfair font-bold text-charcoal-berry mb-6 tracking-tight">Magic is on the Way!</h2>
          
          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-md mx-auto">
            Your artisan selection has been confirmed. We're carefully preparing your order with love and a touch of magic.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-pink-100/50 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="block text-xs font-bold text-pink-300 uppercase tracking-[0.2em] mb-2">Order Number</span>
              <span className="text-xl font-bold text-charcoal-berry font-mono">{orderId}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-pink-100/50 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="block text-xs font-bold text-pink-300 uppercase tracking-[0.2em] mb-2">Est. Delivery</span>
              <span className="text-xl font-bold text-charcoal-berry">3-5 Business Days</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* ── WhatsApp CTA ── */}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
            >
              <MessageCircle size={24} className="fill-white" />
              Send Order to WhatsApp
            </a>
            <p className="text-xs text-charcoal-berry/40 -mt-1">
              Tap above to share your complete order details with us on WhatsApp for confirmation.
            </p>

            <Link to="/profile" className="btn-cute w-full py-5 text-lg shadow-lg shadow-pink-100 group">
              <span className="flex items-center justify-center gap-2">
                Track My Magic <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/" className="block py-2 text-gray-400 font-bold hover:text-blossom-pink transition-all hover:tracking-widest duration-300 uppercase text-xs tracking-[0.3em]">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla p-4 md:p-8 lg:p-12">
      {isAnimating && (
        <DeliveryAnimation onComplete={() => {
          setIsAnimating(false);
          setStep(3);
        }} />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => step === 1 ? navigate('/cart') : setStep(1)} className="p-3 bg-white rounded-2xl border border-pink-50 text-charcoal-berry hover:text-blossom-pink transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-playfair font-bold">Secure Checkout</h1>
        </div>

        <div className="flex items-center gap-4 mb-12 max-w-md">
          <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-blossom-pink' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blossom-pink' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-blossom-pink' : 'bg-gray-200'}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="card-cute glass p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bg-blossom-pink h-full" />
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8 animate-in fade-in-50 duration-500"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-blossom-pink">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-playfair font-bold">Select Delivery Address</h2>
                        <p className="text-sm text-gray-500">Pick a saved address or add a new one for your magical package</p>
                      </div>
                    </div>

                    {showAddressForm ? (
                      // ─── ADD/EDIT ADDRESS FORM ───
                      <motion.form 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleSaveAddress}
                        className="bg-white/60 backdrop-blur-md border border-pink-100 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-lg shadow-pink-50/20"
                      >
                        <h3 className="text-xl font-bold font-playfair text-charcoal-berry border-b border-dashed border-pink-100 pb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-blossom-pink animate-pulse" />
                          {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1 md:col-span-2">
                            <label className="label-cute">Contact Name</label>
                            <input required type="text" value={addrFormData.name} onChange={(e) => setAddrFormData({ ...addrFormData, name: e.target.value })} className="input-cute" placeholder="Full Name (e.g. Lily Bloom)" />
                          </div>

                          <div className="space-y-1">
                            <label className="label-cute">10-Digit Mobile Number</label>
                            <input required type="tel" pattern="[0-9]{10}" value={addrFormData.phone} onChange={(e) => setAddrFormData({ ...addrFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-cute" placeholder="Mobile Number (e.g. 9988776655)" />
                          </div>

                          <div className="space-y-1">
                            <label className="label-cute">Pincode (6-Digits)</label>
                            <div className="relative">
                              <input required type="text" pattern="[0-9]{6}" value={addrFormData.pincode} onChange={handlePincodeChange} className="input-cute pr-10 font-mono" placeholder="Pincode (e.g. 560001)" />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                {pincodeLoading && <Loader2 size={16} className="animate-spin text-blossom-pink" />}
                                {pincodeSuccess && !pincodeLoading && <CheckCircle2 size={16} className="text-green-500" />}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="label-cute">Flat, House No., Building, Apartment</label>
                            <input required type="text" value={addrFormData.addressLine1} onChange={(e) => setAddrFormData({ ...addrFormData, addressLine1: e.target.value })} className="input-cute" placeholder="Flat / House No. / Building" />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="label-cute">Area, Street, Sector, Landmark (Optional)</label>
                            <input required type="text" value={addrFormData.addressLine2} onChange={(e) => setAddrFormData({ ...addrFormData, addressLine2: e.target.value })} className="input-cute" placeholder="Area, Colony, Landmark" />
                          </div>

                          <div className="space-y-1">
                            <label className="label-cute">City / District</label>
                            <input required type="text" value={addrFormData.city} onChange={(e) => setAddrFormData({ ...addrFormData, city: e.target.value })} className="input-cute bg-white/20" placeholder="City" />
                          </div>

                          <div className="space-y-1">
                            <label className="label-cute">State</label>
                            <input required type="text" value={addrFormData.state} onChange={(e) => setAddrFormData({ ...addrFormData, state: e.target.value })} className="input-cute bg-white/20" placeholder="State" />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="label-cute">Address Type</label>
                            <div className="flex gap-4">
                              <button 
                                type="button" 
                                onClick={() => setAddrFormData({ ...addrFormData, type: 'Home' })}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                                  addrFormData.type === 'Home' 
                                    ? 'border-blossom-pink bg-pink-50/50 text-blossom-pink shadow-sm shadow-pink-100' 
                                    : 'border-pink-50 hover:border-pink-100 bg-white text-gray-400'
                                }`}
                              >
                                <HomeIcon size={16} /> Home (All day delivery)
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setAddrFormData({ ...addrFormData, type: 'Work' })}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                                  addrFormData.type === 'Work' 
                                    ? 'border-purple-400 bg-purple-50/50 text-purple-600 shadow-sm shadow-purple-100' 
                                    : 'border-pink-50 hover:border-pink-100 bg-white text-gray-400'
                                }`}
                              >
                                <Briefcase size={16} /> Work (10 AM - 5 PM)
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-dashed border-pink-100">
                          <button 
                            type="button" 
                            onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                            className="px-6 py-3 text-gray-400 font-bold hover:text-blossom-pink transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-8 py-3.5 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Save & Deliver to Address
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      // ─── SAVED ADDRESSES SELECTOR ───
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectAddress(addr)}
                                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative flex flex-col justify-between group overflow-hidden ${
                                  isSelected 
                                    ? 'border-blossom-pink bg-pink-50/30 shadow-lg shadow-pink-50/5' 
                                    : 'border-pink-100 hover:border-pink-200 bg-white hover:shadow-md'
                                }`}
                              >
                                {/* Selection Indicator */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isSelected 
                                      ? 'bg-blossom-pink border-blossom-pink text-white scale-110 shadow-md shadow-pink-100' 
                                      : 'border-pink-100 bg-white group-hover:border-pink-300'
                                  }`}>
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                </div>

                                <div className="space-y-3 pr-8">
                                  {/* Badges */}
                                  <div className="flex gap-2 items-center flex-wrap">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                      addr.type === 'Work' 
                                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                                        : 'bg-pink-50 text-blossom-pink border border-pink-100'
                                    }`}>
                                      {addr.type === 'Work' ? <Briefcase size={10} /> : <HomeIcon size={10} />}
                                      {addr.type}
                                    </span>
                                    {addr.id === 'profile-default' && (
                                      <span className="inline-flex text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-sage-mist/10 text-sage-mist border border-sage-mist/20 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  {/* Customer Info */}
                                  <div>
                                    <h4 className="font-bold text-charcoal-berry text-base">{addr.name}</h4>
                                    <p className="text-xs text-gray-400 font-bold tracking-wider font-mono">{addr.phone}</p>
                                  </div>

                                  {/* Address Lines */}
                                  <p className="text-xs text-gray-500 leading-relaxed font-quicksand font-medium">
                                    {addr.addressLine1}
                                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''} <br />
                                    {addr.city}, {addr.state} — <strong className="font-mono">{addr.pincode}</strong>
                                  </p>
                                </div>

                                {/* Address Action Buttons */}
                                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dashed border-pink-100/50">
                                  <button
                                    onClick={(e) => triggerEditAddress(addr, e)}
                                    className="p-2 text-gray-400 hover:text-blossom-pink transition-colors"
                                    title="Edit Address"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  {addr.id !== 'profile-default' && (
                                    <button
                                      onClick={(e) => handleDeleteAddress(addr.id, e)}
                                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                      title="Delete Address"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* + Add New Address Dotted Card */}
                          <div 
                            onClick={triggerAddNewAddress}
                            className="border-2 border-dashed border-pink-200/60 hover:border-blossom-pink rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[180px] bg-pink-50/5 hover:bg-pink-50/10 group hover:scale-[1.02] shadow-sm hover:shadow-md"
                          >
                            <div className="w-12 h-12 rounded-full border border-dashed border-pink-300 bg-white flex items-center justify-center text-blossom-pink group-hover:scale-110 group-hover:bg-blossom-pink group-hover:text-white transition-all mb-4">
                              <Plus size={20} />
                            </div>
                            <span className="font-bold text-sm text-charcoal-berry group-hover:text-blossom-pink transition-colors">Add New Address</span>
                            <span className="text-[10px] text-gray-400 mt-1 max-w-[150px]">Choose alternative home/work delivery routes</span>
                          </div>
                        </div>

                        {/* Deliver Selected Address Button */}
                        {selectedAddressId ? (
                          <div className="pt-6 border-t border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                <CheckCircle2 size={20} />
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Destination</span>
                                <span className="text-sm font-bold text-charcoal-berry max-w-[280px] sm:max-w-[400px] block truncate">
                                  {formData.name} • {formData.address}, {formData.city} — {formData.zip}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setStep(2)} 
                              className="btn-cute flex items-center justify-center gap-2 py-4 px-8 text-sm group shadow-lg shadow-pink-100"
                            >
                              Deliver to this Address <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-6 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-3 text-orange-700 text-sm">
                            <AlertCircle size={20} />
                            <span>Please add or select a shipping destination to proceed with checkout.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-playfair font-bold">Payment Selection</h2>
                        <p className="text-sm text-gray-500">Choose your preferred way to pay</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Online Payment Option */}
                      <button 
                        onClick={() => setPaymentMethod('online')}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${
                          paymentMethod === 'online' ? 'border-blossom-pink bg-pink-50/30' : 'border-pink-100 hover:border-pink-200 bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          paymentMethod === 'online' ? 'bg-blossom-pink text-white' : 'bg-pink-50 text-blossom-pink'
                        }`}>
                          <Wallet size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-charcoal-berry">Secure Online Payment</h4>
                          <p className="text-xs text-gray-400 mt-1">Cards, UPI, Netbanking via Razorpay</p>
                        </div>
                        {paymentMethod === 'online' && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle2 size={24} className="text-blossom-pink" />
                          </div>
                        )}
                      </button>

                      {/* COD Option */}
                      <button 
                        disabled={!isCODAllowed}
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group ${
                          !isCODAllowed ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-100' :
                          paymentMethod === 'cod' ? 'border-sage-mist bg-green-50/30' : 'border-pink-100 hover:border-pink-200 bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          !isCODAllowed ? 'bg-gray-200 text-gray-400' :
                          paymentMethod === 'cod' ? 'bg-sage-mist text-white' : 'bg-green-50 text-sage-mist'
                        }`}>
                          <HandCoins size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-charcoal-berry">Cash on Delivery</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {isCODAllowed ? 'Pay when you receive your magic' : 'Prepaid only for special items'}
                          </p>
                        </div>
                        {paymentMethod === 'cod' && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle2 size={24} className="text-sage-mist" />
                          </div>
                        )}
                        {!isCODAllowed && (
                          <div className="absolute top-4 right-4 text-orange-400">
                            <AlertCircle size={20} />
                          </div>
                        )}
                      </button>
                    </div>

                    {!isCODAllowed && paymentMethod === 'cod' && (
                      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 text-orange-700 text-sm">
                        <AlertCircle className="flex-shrink-0" size={20} />
                        <p>One or more items in your selection (<strong>Bouquets</strong>, <strong>Bags</strong>, or <strong>Customized</strong>) require advance payment to bloom. Please choose Online Payment.</p>
                      </div>
                    )}

                    <div className="bg-creamy-vanilla/50 rounded-3xl p-6 border border-pink-100/50 space-y-3">
                      <div className="flex justify-between items-center text-xl font-bold pt-2">
                        <span className="text-charcoal-berry">Final Amount:</span>
                        <span className="text-blossom-pink">{formatCurrency(finalPrice, { decimals: 2 })}</span>
                      </div>
                    </div>

                    <button 
                      onClick={paymentMethod === 'online' ? initRazorpay : handleCODPayment}
                      disabled={loading || (!isCODAllowed && paymentMethod === 'cod')}
                      className="btn-cute w-full py-5 text-lg shadow-xl shadow-pink-100 flex items-center justify-center gap-3 group"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                          <Lock size={20} />
                          {paymentMethod === 'online' ? 'Pay Securely Now' : 'Confirm Order (COD)'}
                        </>
                      )}
                    </button>

                    <button type="button" onClick={() => setStep(1)} className="w-full text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-blossom-pink transition-colors text-center">
                      Back to Shipping
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="card-cute glass p-6 border-2 border-pink-50">
              <h3 className="text-xl font-playfair font-bold mb-6">Your Selection</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-white rounded-xl flex-shrink-0 border border-pink-50 flex items-center justify-center text-2xl overflow-hidden relative">
                      {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        item.icon || '🌸'
                      )}
                      {(item.category === 'Bouquets' || item.category === 'Bags' || item.category === 'Customized') && (
                        <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center">
                          <AlertCircle size={16} className="text-orange-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm text-blossom-pink">{formatCurrency(item.price * item.quantity, { decimals: 2 })}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-pink-100 mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="font-bold">{formatCurrency(totalPrice, { decimals: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                    <Truck size={14} className="text-sage-mist" /> Shipping
                  </span>
                  <span className="text-green-500 font-bold">FREE</span>
                </div>
                {coupon && (
                   <div className="flex justify-between text-sm">
                    <span className="text-pink-400 font-bold uppercase tracking-wider">Discount</span>
                    <span className="font-bold text-pink-400">-{formatCurrency(coupon.discountAmount, { decimals: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-charcoal-berry pt-2">
                  <span>Total</span>
                  <span className="text-blossom-pink">{formatCurrency(finalPrice, { decimals: 2 })}</span>
                </div>
                <div className="mt-6">
                  <CouponInput
                    orderValue={totalPrice}
                    onApply={(res) => setCoupon(res)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-sage-mist/5 border border-sage-mist/20">
              <div className="flex items-center gap-3 mb-2">
                <Gift size={20} className="text-sage-mist" />
                <h4 className="font-bold text-sage-mist">Gift Ready!</h4>
              </div>
              <p className="text-xs text-sage-mist/80 leading-relaxed">
                All orders include our signature premium gift wrapping and a personalized magic card at no extra cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
