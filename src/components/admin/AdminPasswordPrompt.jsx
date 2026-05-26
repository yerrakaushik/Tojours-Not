import React, { useState } from 'react';
import { Lock, Sparkles, Flower2 } from 'lucide-react';

export default function AdminPasswordPrompt({ onVerify }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Master password verification
    if (password === 'TojoursNot2026') {
      onVerify(true);
      localStorage.setItem('admin_verified', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-berry flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] text-blossom-pink/10 rotate-12">
            <Sparkles size={120} />
          </div>

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 text-blossom-pink">
              <Flower2 size={32} />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-white mb-2">
              Administrative Access
            </h1>
            <p className="text-white/60 text-sm">
              Please enter the master password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border ${error ? 'border-red-400' : 'border-white/10'} bg-white/5 focus:ring-2 focus:ring-blossom-pink transition-all outline-none text-white`}
                placeholder="Master Password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold text-center animate-shake">
                Invalid Administrative Password
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blossom-pink text-white rounded-2xl font-bold shadow-lg hover:bg-pink-400 transition-all active:scale-95"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
