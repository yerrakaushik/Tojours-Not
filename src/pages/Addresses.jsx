import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Plus, Trash2, Edit2, Home as HomeIcon, Briefcase, Check, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function Addresses() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const [addrFormData, setAddrFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    type: 'Home',
  });

  const loadAddresses = async () => {
    try {
      const u = await authService.getCurrentUser();
      if (!u) {
        navigate('/auth');
        return;
      }

      const prof = await profileService.getProfile();
      setProfile(prof);

      const defaultAddr = prof && (prof.address_line1 || prof.pincode) ? {
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

      const stored = localStorage.getItem(`addresses_user_${u.id}`);
      let localAddresses = stored ? JSON.parse(stored) : [];

      let merged = [];
      if (defaultAddr) {
        merged.push(defaultAddr);
      }
      merged = [...merged, ...localAddresses];
      setAddresses(merged);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddrFormData(prev => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      setPincodeLoading(true);
      setPincodeSuccess(false);
      try {
        const res = await fetch(`https://api.zippopotam.us/in/${pin}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.places?.length > 0) {
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
        console.warn(err);
      }

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddrFormData(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Block || '',
            state: postOffice.State || ''
          }));
          setPincodeSuccess(true);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(addrFormData.pincode)) {
      toast.error('Please enter a valid 6-digit Pincode.');
      return;
    }
    if (!/^[0-9]{10}$/.test(addrFormData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    const u = await authService.getCurrentUser();
    if (!u) return;

    try {
      if (editingAddress) {
        if (editingAddress.id === 'profile-default') {
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
        } else {
          const stored = localStorage.getItem(`addresses_user_${u.id}`);
          let localAddresses = stored ? JSON.parse(stored) : [];
          localAddresses = localAddresses.map(a => a.id === editingAddress.id ? {
            ...a,
            ...addrFormData
          } : a);
          localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));
        }
        toast.success('Address updated successfully! 🌸');
      } else {
        const newAddr = {
          id: `local-${Date.now()}`,
          ...addrFormData,
          isDefault: false
        };
        const stored = localStorage.getItem(`addresses_user_${u.id}`);
        let localAddresses = stored ? JSON.parse(stored) : [];
        localAddresses.push(newAddr);
        localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));
        toast.success('New address added! 🌸');
      }

      setShowForm(false);
      setEditingAddress(null);
      loadAddresses();
    } catch (err) {
      console.error(err);
      toast.error('Error saving address.');
    }
  };

  const handleDelete = async (addrId) => {
    if (addrId === 'profile-default') {
      toast.error('Your default profile address cannot be deleted. Please edit it instead.');
      return;
    }

    const u = await authService.getCurrentUser();
    if (!u) return;

    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const stored = localStorage.getItem(`addresses_user_${u.id}`);
      let localAddresses = stored ? JSON.parse(stored) : [];
      localAddresses = localAddresses.filter(a => a.id !== addrId);
      localStorage.setItem(`addresses_user_${u.id}`, JSON.stringify(localAddresses));
      toast.success('Address deleted.');
      loadAddresses();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerEdit = (addr) => {
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
    setShowForm(true);
    setPincodeSuccess(true);
  };

  const triggerAddNew = () => {
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
    setShowForm(true);
    setPincodeSuccess(false);
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-charcoal-berry">My Addresses</h1>
            <p className="text-charcoal-berry/40 font-medium">Manage your delivery gardens</p>
          </div>
          {!showForm && (
            <button
              onClick={triggerAddNew}
              className="btn-cute py-4 px-6 flex items-center gap-2"
            >
              <Plus size={18} /> Add New Address
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSave} className="bg-white/80 border border-pink-100 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-2xl font-playfair font-bold text-charcoal-berry border-b border-dashed border-pink-100 pb-3 flex items-center gap-2">
              <MapPin size={20} className="text-blossom-pink" />
              {editingAddress ? 'Edit Address Details' : 'Add New Address'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="label-cute">Contact Name</label>
                <input required type="text" value={addrFormData.name} onChange={(e) => setAddrFormData({ ...addrFormData, name: e.target.value })} className="input-cute" placeholder="Full Name" />
              </div>

              <div className="space-y-1">
                <label className="label-cute">10-Digit Mobile Number</label>
                <input required type="tel" pattern="[0-9]{10}" value={addrFormData.phone} onChange={(e) => setAddrFormData({ ...addrFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-cute" placeholder="Mobile Number" />
              </div>

              <div className="space-y-1">
                <label className="label-cute">Pincode (6-Digits)</label>
                <div className="relative">
                  <input required type="text" pattern="[0-9]{6}" value={addrFormData.pincode} onChange={handlePincodeChange} className="input-cute pr-10 font-mono" placeholder="Pincode" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {pincodeLoading && <Loader2 size={16} className="animate-spin text-blossom-pink" />}
                    {pincodeSuccess && !pincodeLoading && <Check size={16} className="text-green-500" />}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="label-cute">Flat, House No., Building, Apartment</label>
                <input required type="text" value={addrFormData.addressLine1} onChange={(e) => setAddrFormData({ ...addrFormData, addressLine1: e.target.value })} className="input-cute" placeholder="Flat / House No. / Building" />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="label-cute">Area, Street, Sector, Landmark (Optional)</label>
                <input required type="text" value={addrFormData.addressLine2} onChange={(e) => setAddrFormData({ ...addrFormData, addressLine2: e.target.value })} className="input-cute" placeholder="Area, Colony, Landmark" />
              </div>

              <div className="space-y-1">
                <label className="label-cute">City / District</label>
                <input required type="text" value={addrFormData.city} onChange={(e) => setAddrFormData({ ...addrFormData, city: e.target.value })} className="input-cute" placeholder="City" />
              </div>

              <div className="space-y-1">
                <label className="label-cute">State</label>
                <input required type="text" value={addrFormData.state} onChange={(e) => setAddrFormData({ ...addrFormData, state: e.target.value })} className="input-cute" placeholder="State" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="label-cute">Address Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setAddrFormData({ ...addrFormData, type: 'Home' })}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                      addrFormData.type === 'Home' 
                        ? 'border-blossom-pink bg-pink-50/50 text-blossom-pink' 
                        : 'border-pink-50 bg-white text-gray-400'
                    }`}
                  >
                    <HomeIcon size={16} /> Home
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAddrFormData({ ...addrFormData, type: 'Work' })}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                      addrFormData.type === 'Work' 
                        ? 'border-purple-400 bg-purple-50/50 text-purple-600' 
                        : 'border-pink-50 bg-white text-gray-400'
                    }`}
                  >
                    <Briefcase size={16} /> Work
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-dashed border-pink-100">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingAddress(null); }}
                className="px-6 py-3 text-gray-400 font-bold hover:text-blossom-pink transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3.5 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Address
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.length > 0 ? addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-6 rounded-[2rem] border-2 border-pink-100 bg-white/70 backdrop-blur-sm relative flex flex-col justify-between hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      addr.type === 'Home' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {addr.type === 'Home' ? <HomeIcon size={10} /> : <Briefcase size={10} />}
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-charcoal-berry text-lg mb-2">{addr.name}</h3>
                  <p className="text-sm text-charcoal-berry/70 leading-relaxed mb-1">
                    {addr.addressLine1}
                  </p>
                  {addr.addressLine2 && (
                    <p className="text-sm text-charcoal-berry/70 leading-relaxed mb-1">
                      {addr.addressLine2}
                    </p>
                  )}
                  <p className="text-sm font-bold text-charcoal-berry/80 mb-4">
                    {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                  </p>
                  <p className="text-xs text-charcoal-berry/50 font-medium">
                    Phone: {addr.phone}
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-dashed border-pink-50">
                  <button
                    onClick={() => triggerEdit(addr)}
                    className="p-2.5 bg-pink-50 hover:bg-pink-100 rounded-xl text-blossom-pink transition-colors hover:scale-105"
                    title="Edit Address"
                  >
                    <Edit2 size={16} />
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-colors hover:scale-105"
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20 bg-white/30 rounded-[3rem] border border-dashed border-pink-200">
                <MapPin size={64} className="mx-auto text-pink-200 mb-6" />
                <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">No Saved Addresses</h3>
                <p className="text-gray-500 mb-8">Add a shipping address to begin sending magical floral packages!</p>
                <button onClick={triggerAddNew} className="btn-cute inline-flex items-center gap-2">
                  <Plus size={18} /> Add New Address
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
