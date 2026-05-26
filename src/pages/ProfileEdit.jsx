import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Mail, Phone, MapPin, Loader2, ChevronLeft, Upload } from 'lucide-react';
import { profileService } from '../services/profileService';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    avatar_url: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await profileService.getProfile();
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address_line1: profile.address_line1 || '',
          address_line2: profile.address_line2 || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          avatar_url: profile.avatar_url || '',
        });
      } catch (err) {
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const publicUrl = await profileService.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      setError('Failed to upload avatar.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await profileService.updateProfile(formData);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blossom-pink animate-spin" />
          <p className="text-blossom-pink font-bold animate-pulse">Loading your magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors mb-8 font-bold text-sm group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Profile
        </button>

        <div className="card-cute glass p-8 md:p-12 shadow-2xl border border-white">
          <h1 className="text-3xl font-playfair font-bold text-charcoal-berry mb-8">Edit Your Magic Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                  <img src={formData.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border border-pink-100 text-blossom-pink">
                  <Upload size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-xs text-charcoal-berry/40 font-bold">Upload a cute avatar!</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-playfair font-bold text-charcoal-berry pt-4 border-t border-pink-100">Delivery Address (India)</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Address Line 1</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Address Line 2</label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-sm"
                    placeholder="6-digit code"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Magical Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
