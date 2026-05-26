import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, Loader2, Flower2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpType, setOtpType] = useState('email'); // 'email' or 'phone'
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [phone, setPhone] = useState('');
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      if (otpType === 'email') {
        await authService.signInWithOtp(formData.email);
      } else {
        await authService.signInWithPhone(phone);
      }
      setOtpSent(true);
      setTimer(60); // 60 seconds countdown
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await authService.signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        navigate('/profile');
      } else if (isOtpMode) {
        if (!otpSent) {
          await handleSendOtp();
        } else {
          if (otpType === 'email') {
            await authService.verifyOtp(formData.email, otpToken);
          } else {
            await authService.verifyPhoneOtp(phone, otpToken);
          }
          navigate('/profile');
        }
      } else {
        await authService.signIn(formData.email, formData.password);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="card-cute glass p-8 md:p-12 shadow-2xl border border-white relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] text-blossom-pink/10 rotate-12">
            <Sparkles size={120} />
          </div>

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 text-blossom-pink">
              <Flower2 size={32} />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">
              {isSignUp ? 'Join the Magic' : 'Welcome Back'}
            </h1>
            <p className="text-charcoal-berry/60 text-sm">
              {isSignUp
                ? 'Create an account to start your floral journey'
                : 'Sign in to continue shopping for beauty'}
            </p>
          </div>

          {!isSignUp && (
            <div className="flex flex-col gap-3 mb-8 relative z-10">
              <div className="flex bg-pink-50/50 p-1 rounded-2xl border border-pink-100/50">
                <button
                  onClick={() => { setIsOtpMode(false); setOtpSent(false); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!isOtpMode ? 'bg-white text-blossom-pink shadow-sm' : 'text-charcoal-berry/40 hover:text-charcoal-berry/60'}`}
                >
                  Password
                </button>
                <button
                  onClick={() => setIsOtpMode(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isOtpMode ? 'bg-white text-blossom-pink shadow-sm' : 'text-charcoal-berry/40 hover:text-charcoal-berry/60'}`}
                >
                  OTP Login
                </button>
              </div>
              
              {isOtpMode && (
                <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-charcoal-berry/40">
                  <button 
                    type="button"
                    onClick={() => { setOtpType('email'); setOtpSent(false); }}
                    className={`pb-1 border-b-2 transition-all ${otpType === 'email' ? 'border-blossom-pink text-blossom-pink' : 'border-transparent'}`}
                  >
                    Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setOtpType('phone'); setOtpSent(false); }}
                    className={`pb-1 border-b-2 transition-all ${otpType === 'phone' ? 'border-blossom-pink text-blossom-pink' : 'border-transparent'}`}
                  >
                    Phone
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            {(!isOtpMode || otpType === 'email' || isSignUp) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={otpSent}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm disabled:opacity-50"
                    placeholder="hello@magic.com"
                  />
                </div>
              </div>
            )}

            {(isOtpMode && otpType === 'phone' && !isSignUp) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">+</div>
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm disabled:opacity-50"
                    placeholder="919876543210"
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Include country code without + (e.g., 91 for India)</p>
              </div>
            )}

            {!isOtpMode || isSignUp ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            ) : otpSent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-berry/60 uppercase tracking-wider ml-1">Enter OTP</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-blossom-pink" size={18} />
                    <input
                      type="text"
                      required
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-blossom-pink focus:border-transparent transition-all outline-none text-sm tracking-[0.5em] text-center font-bold"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] text-gray-400 text-center">
                    We've sent a magic code to your {otpType}.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {timer > 0 ? (
                      <span className="text-[10px] font-bold text-blossom-pink bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                        Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[10px] font-bold text-blossom-pink hover:text-pink-600 underline underline-offset-4"
                      >
                        Resend Magic Code
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpToken(''); }}
                      className="text-[10px] font-bold text-charcoal-berry/40 hover:text-charcoal-berry/60 underline underline-offset-4"
                    >
                      Change {otpType === 'email' ? 'Email' : 'Number'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}


            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blossom-pink to-pink-400 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isOtpMode && !isSignUp ? (
                otpSent ? 'Verify & Sign In' : 'Send Magic OTP'
              ) : (
                isSignUp ? 'Create Magic Account' : 'Sign In to Shop'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsOtpMode(false);
                setOtpSent(false);
              }}
              className="text-sm font-bold text-charcoal-berry/60 hover:text-blossom-pink transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'New to the magic? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

