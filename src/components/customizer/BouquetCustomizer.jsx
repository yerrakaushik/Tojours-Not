import React, { useState } from 'react';
import { Heart, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CUSTOM_OPTIONS = {
  flowers: [
    { id: 'rose', name: 'Romantic Rose', color: '#FFB7C5', icon: '🌹', price: 5 },
    { id: 'lily', name: 'Pure Lily', color: '#FFFFFF', icon: '⚜️', price: 6 },
    { id: 'tulip', name: 'Cheerful Tulip', color: '#FF69B4', icon: '🌷', price: 4 },
    { id: 'sunflower', name: 'Sunny Sunflower', color: '#FFD700', icon: '🌻', price: 5 },
  ],
  leaves: [
    { id: 'eucalyptus', name: 'Silver Eucalyptus', color: '#B2C2A2', icon: '🌿', price: 2 },
    { id: 'fern', name: 'Forest Fern', color: '#4A6741', icon: '🌱', price: 2 },
    { id: 'baby-breath', name: 'Baby Breath', color: '#FDFDFD', icon: '☁️', price: 3 },
  ],
  papers: [
    { id: 'kraft', name: 'Rustic Kraft', color: '#D2B48C', icon: '📦', price: 1 },
    { id: 'pink-silk', name: 'Blush Silk', color: '#FFD1DC', icon: '🎀', price: 2 },
    { id: 'white-minimal', name: 'Pure White', color: '#FFFFFF', icon: '⬜', price: 1 },
  ]
};

export default function BouquetCustomizer() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selection, setSelection] = useState({
    flower: null,
    leaf: null,
    paper: null
  });

  const updateSelection = (key, value) => {
    setSelection(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!selection.flower || !selection.paper) {
      alert("Please select at least a flower and a wrapping paper! ✨");
      return;
    }

    const customBouquet = {
      id: `custom-bouquet-${Date.now()}`,
      name: `Custom Bouquet (${selection.flower.name})`,
      price: (selection.flower?.price || 0) + (selection.leaf?.price || 0) + (selection.paper?.price || 0),
      image: selection.flower.icon, // Using icon as placeholder for image
      customization: selection,
      category: 'Custom'
    };

    addToCart(customBouquet);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-[calc(100-80px)] bg-creamy-vanilla p-4 md:p-8 font-quicksand">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Visual Preview Area */}
        <div className="card-cute sticky top-24 flex flex-col items-center justify-center min-h-[500px] bg-white overflow-hidden relative border-2 border-pink-50">
          {showSuccess && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={48} />
                <h4 className="text-xl font-bold">Added to Bag!</h4>
                <p className="text-sm text-gray-500">Your magic creation is safe.</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 text-pink-300 font-playfair italic text-xl">Your Masterpiece</div>

          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Layer 1: Wrapping Paper */}
            {selection.paper && (
              <div
                className="absolute w-56 h-72 rounded-b-full transition-all duration-700 shadow-xl"
                style={{ backgroundColor: selection.paper.color, transform: 'rotate(-2deg)' }}
              />
            )}

            {/* Layer 2: Leaves/Fillers */}
            {selection.leaf && (
              <div className="absolute text-7xl transition-all duration-700 animate-pulse z-10 -translate-y-4 translate-x-4 opacity-80">
                {selection.leaf.icon}
              </div>
            )}

            {/* Layer 3: Main Flower */}
            {selection.flower ? (
              <div className="relative text-9xl transition-all duration-500 hover:scale-110 cursor-pointer z-10">
                {selection.flower.icon}
              </div>
            ) : (
              <div className="text-gray-300 text-2xl italic font-playfair">Pick a flower to start...</div>
            )}
          </div>

          <div className="mt-12 text-center z-10">
            <div className="text-3xl font-bold text-charcoal-berry">
              ${ (selection.flower?.price || 0) + (selection.leaf?.price || 0) + (selection.paper?.price || 0) }.00
            </div>
            <button 
              onClick={handleAddToCart}
              className="btn-cute mt-6 flex items-center gap-2 group"
            >
              Add to Bag <Heart size={18} className="group-hover:fill-current transition-colors" />
            </button>
          </div>
        </div>

        {/* Right: Selection Controls */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-playfair font-bold">Customise Your Bouquet</h2>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${step === i ? 'bg-blossom-pink' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-[2rem] border border-pink-50 backdrop-blur-sm min-h-[400px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="text-golden-honey" size={20} /> Step 1: Choose Your Bloom
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {CUSTOM_OPTIONS.flowers.map(f => (
                    <div
                      key={f.id}
                      onClick={() => updateSelection('flower', f)}
                      className={`card-cute cursor-pointer text-center transition-all duration-300 ${selection.flower?.id === f.id ? 'ring-4 ring-blossom-pink bg-pink-50 border-transparent scale-105' : 'hover:bg-pink-50/30'}`}
                    >
                      <div className="text-5xl mb-3 drop-shadow-md">{f.icon}</div>
                      <div className="font-bold text-charcoal-berry">{f.name}</div>
                      <div className="text-sm font-semibold text-blossom-pink mt-1">${f.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="text-golden-honey" size={20} /> Step 2: Add Greenery
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {CUSTOM_OPTIONS.leaves.map(l => (
                    <div
                      key={l.id}
                      onClick={() => updateSelection('leaf', l)}
                      className={`card-cute cursor-pointer text-center transition-all duration-300 ${selection.leaf?.id === l.id ? 'ring-4 ring-sage-mist bg-sage-mist/10 border-transparent scale-105' : 'hover:bg-sage-mist/5'}`}
                    >
                      <div className="text-5xl mb-3 drop-shadow-md">{l.icon}</div>
                      <div className="font-bold text-charcoal-berry">{l.name}</div>
                      <div className="text-sm font-semibold text-sage-mist mt-1">${l.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="text-golden-honey" size={20} /> Step 3: Final Wrap
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {CUSTOM_OPTIONS.papers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => updateSelection('paper', p)}
                      className={`card-cute cursor-pointer text-center transition-all duration-300 ${selection.paper?.id === p.id ? 'ring-4 ring-charcoal-berry/20 bg-gray-50 border-transparent scale-105' : 'hover:bg-gray-50'}`}
                    >
                      <div className="text-5xl mb-3 drop-shadow-md">{p.icon}</div>
                      <div className="font-bold text-charcoal-berry">{p.name}</div>
                      <div className="text-sm font-semibold text-gray-500 mt-1">${p.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              className={`px-8 py-3 rounded-full font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-charcoal-berry hover:bg-pink-100 hover:scale-105'}`}
            >
              <ChevronLeft className="inline mr-2" size={20} /> Previous
            </button>
            <button
              disabled={step === 3}
              onClick={() => setStep(s => s + 1)}
              className={`px-8 py-3 rounded-full font-bold bg-charcoal-berry text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 shadow-lg shadow-charcoal-berry/20`}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
