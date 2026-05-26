import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Sparkles, Package, Truck, Heart, Flower2 } from 'lucide-react';

const Petal = ({ delay, left, size, rotation }) => (
  <div 
    className="absolute pointer-events-none animate-petal-fall"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      opacity: 0.6
    }}
  >
    <Flower2 
      size={size} 
      className="text-blossom-pink/40 fill-blossom-pink/10" 
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  </div>
);

export default function DeliveryAnimation({ onComplete }) {
  const [status, setStatus] = useState('Carefully arranging your blooms...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 0.6; // Even smoother crawl
      });
    }, 50);

    const timer1 = setTimeout(() => setStatus('Polishing the charms...'), 2000);
    const timer2 = setTimeout(() => setStatus('Enchanting your package...'), 4000);
    const timer3 = setTimeout(() => setStatus('Dispatched via magic transit!'), 5500);
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 7500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFFDF5]/90 backdrop-blur-2xl animate-in fade-in duration-1000 overflow-hidden">
      {/* Background Magic: Petal Fall */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <Petal 
            key={i} 
            delay={i * 0.8} 
            left={Math.random() * 100} 
            size={12 + Math.random() * 20}
            rotation={Math.random() * 360}
          />
        ))}
      </div>

      <div className="max-w-xl w-full px-8 text-center relative">
        
        {/* Premium Stage Container */}
        <div className="relative mb-12 bg-white/60 rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(255,182,193,0.25)] border border-white/80 backdrop-blur-md relative overflow-hidden group animate-stage-in">
          {/* Ambient glow effects */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-100/30 rounded-full blur-[60px] animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sage-mist/20 rounded-full blur-[60px] animate-pulse delay-700" />
          
          <div className="relative z-10">
            <DotLottieReact
              src="https://assets-v2.lottiefiles.com/a/d729754a-1175-11ee-8763-5b04b28fa351/27p4fjJ9Ft.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '340px' }}
            />
          </div>

          {/* Whimsical Floating Decor */}
          <div className="absolute top-10 right-12 animate-float">
            <Sparkles className="text-blossom-pink/60" size={32} />
          </div>
          <div className="absolute bottom-16 left-12 animate-float delay-1000">
            <Heart className="text-pink-300 fill-pink-50/50" size={24} />
          </div>
        </div>

        {/* Messaging Area */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/80 border border-pink-100 rounded-full text-blossom-pink text-sm font-bold uppercase tracking-[0.2em] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blossom-pink animate-ping" />
            Artisan Hand-Off
          </div>
          
          <div className="h-20 flex items-center justify-center">
            <h3 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry leading-tight">
              {status}
            </h3>
          </div>
          
          {/* Premium Progress Bar */}
          <div className="relative w-full max-w-md mx-auto pt-4">
            <div className="h-2.5 w-full bg-gray-100/80 rounded-full overflow-hidden p-[2px] border border-gray-50">
              <div 
                className="h-full bg-gradient-to-r from-blossom-pink via-pink-400 to-[#D4A373] rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-white/20 animate-shimmer-fast" />
              </div>
            </div>
            
            {/* Minimalist Truck Marker */}
            <div 
              className="absolute top-2 transition-all duration-500 ease-out"
              style={{ left: `calc(${progress}% - 14px)` }}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-pink-50 ring-4 ring-pink-50/30">
                <Truck size={14} className="text-blossom-pink" />
              </div>
            </div>
          </div>

          <p className="text-charcoal-berry/40 text-base font-quicksand font-medium italic">
            "Every petal finds its path..."
          </p>
        </div>
      </div>

      {/* Custom Styles for magical effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes petal-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes stage-in {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-petal-fall {
          animation: petal-fall 10s linear infinite;
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 2s linear infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-stage-in {
          animation: stage-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

    </div>
  );
}

