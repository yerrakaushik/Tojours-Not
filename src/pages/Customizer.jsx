import React, { useState, useEffect } from 'react';
import { Flower2, Scissors, Paintbrush2, ShoppingBag, Sparkles, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productsService } from '../services/supabaseService';

export default function Customizer() {
  const [customType, setCustomType] = useState(null); // 'bouquet', 'hamper', 'gift'
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState({ flowers: [], fillers: [], wrappings: [] });
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({
    flowers: [],
    fillers: [],
    wrapping: null,
  });
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const data = await productsService.getCustomOptions();
      const flowers = data.filter(o => o.type === 'flower');
      const fillers = data.filter(o => o.type === 'filler');
      const wrappings = data.filter(o => o.type === 'paper');
      
      setOptions({ flowers, fillers, wrappings });
      
      // Try to load saved draft
      const savedDraft = localStorage.getItem('bouquet-draft');
      if (savedDraft) {
        setSelection(JSON.parse(savedDraft));
      } else {
        setSelection(prev => ({ ...prev, wrapping: wrappings[0] }));
      }
      setLoading(false);
    }
    loadOptions();
  }, []);

  // Save draft on every selection change
  useEffect(() => {
    if (!loading && customType === 'bouquet') {
      localStorage.setItem('bouquet-draft', JSON.stringify(selection));
    }
  }, [selection, loading, customType]);

  const calculateTotal = () => {
    const flowersTotal = selection.flowers.reduce((sum, f) => sum + f.price, 0);
    const fillersTotal = selection.fillers.reduce((sum, f) => sum + f.price, 0);
    return flowersTotal + fillersTotal + (selection.wrapping?.price || 0) + 15; // $15 base for labor/box
  };

  const toggleItem = (item, type) => {
    setSelection(prev => {
      const current = prev[type];
      const isExist = current.find(i => i.id === item.id);
      if (isExist) {
        return { ...prev, [type]: current.filter(i => i.id !== item.id) };
      }
      return { ...prev, [type]: [...current, item] };
    });
  };

  const handleAddToBag = () => {
    const customItem = {
      id: `custom-${customType}-${Date.now()}`,
      name: `Custom ${customType.charAt(0).toUpperCase() + customType.slice(1)}`,
      price: calculateTotal(),
      image: customType === 'bouquet' ? '/images/hero.png' : '/images/cat-bouquets.png',
      customization: customType === 'bouquet' ? {
        flowers: selection.flowers.map(f => ({ name: f.name, id: f.id })),
        fillers: selection.fillers.map(f => ({ name: f.name, id: f.id })),
        wrapping: selection.wrapping?.name
      } : { type: customType },
      isCustom: true
    };
    addToCart(customItem);
    setIsAdded(true);
    if (customType === 'bouquet') localStorage.removeItem('bouquet-draft');
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creamy-vanilla">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-sage-mist animate-spin" />
          <p className="text-charcoal-berry font-medium animate-pulse">Preparing the studio...</p>
        </div>
      </div>
    );
  }

  if (!customType) {
    return (
      <div className="min-h-screen bg-creamy-vanilla font-quicksand flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-charcoal-berry mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">What are we creating today?</h1>
          <p className="text-charcoal-berry/60 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">Select a category to start your custom journey</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'keychain', name: 'Key chains', icon: '🔑', desc: 'Personalized Charms', color: 'bg-blue-100' },
              { id: 'bouquet', name: 'Bouquets', icon: '🌸', desc: 'Floral Masterpieces', color: 'bg-pink-100' },
              { id: 'bag', name: 'Bags', icon: '👜', desc: 'Artisan Carriers', color: 'bg-sage-mist/20' }
            ].map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCustomType(item.id)}
                className="group relative flex flex-col items-center p-8 rounded-[3rem] bg-white border-2 border-transparent hover:border-blossom-pink shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in zoom-in duration-700"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className={`w-32 h-32 ${item.color} rounded-full flex items-center justify-center text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">{item.name}</h3>
                <p className="text-sm text-charcoal-berry/40">{item.desc}</p>
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blossom-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand p-4 md:p-8">
      <button 
        onClick={() => setCustomType(null)}
        className="mb-8 flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors font-bold"
      >
        <ChevronLeft size={20} /> Back to Selection
      </button>

      <div className="max-w-6xl mx-auto">
        {customType === 'bouquet' ? (
          <>
            <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-mist/10 text-sage-mist text-xs font-bold uppercase tracking-widest mb-4">
                <Paintbrush2 size={12} /> Design Your Dream
              </div>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry mb-2">Bouquet Builder</h1>
              <p className="text-charcoal-berry/60">Craft a unique floral story, petal by petal.</p>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preview Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Sparkles className="text-blossom-pink animate-pulse" />
              </div>
              
              <div className="aspect-square bg-pink-50/50 rounded-[2.5rem] mb-8 flex items-center justify-center relative overflow-hidden group">
                {/* Visual Representation (Bouquet Cluster) */}
                <div className="relative w-full h-full flex items-center justify-center">
                   {/* Wrapping Paper Base */}
                   <div 
                     className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-1000 animate-pulse"
                     style={{ backgroundColor: selection.wrapping?.color || '#FFD1DC' }}
                   />
                   
                   <div className="relative w-64 h-64 flex items-center justify-center">
                     {/* Fillers (Bottom Layer) */}
                     {selection.fillers.map((f, i) => (
                       <img 
                         key={`filler-${f.id}-${i}`}
                         src={f.image}
                         alt={f.name}
                         className="absolute w-32 h-32 object-contain transition-all duration-700 animate-in fade-in zoom-in"
                         style={{ 
                           transform: `rotate(${i * (360 / Math.max(1, selection.fillers.length)) + 20}deg) translateY(-30px) rotate(-20deg)`,
                           zIndex: 1,
                           opacity: 0.9,
                           mixBlendMode: 'multiply'
                         }}
                       />
                     ))}

                     {/* Flowers (Top Layer) */}
                     {selection.flowers.map((f, i) => (
                       <img 
                         key={`flower-${f.id}-${i}`}
                         src={f.image}
                         alt={f.name}
                         className="absolute w-40 h-40 object-contain transition-all duration-500 animate-in zoom-in slide-in-from-bottom-8"
                         style={{ 
                           transform: `rotate(${i * (360 / Math.max(1, selection.flowers.length))}deg) translateY(-20px) rotate(${-i * (360 / Math.max(1, selection.flowers.length))}deg) scale(${1 + (i % 3) * 0.1})`,
                           zIndex: 10 + i,
                           mixBlendMode: 'multiply'
                         }}
                       />
                     ))}

                     {/* Center Piece if empty */}
                     {selection.flowers.length === 0 && selection.fillers.length === 0 && (
                       <div className="flex flex-col items-center gap-4 text-charcoal-berry/20">
                         <Flower2 size={64} strokeWidth={1} className="animate-bounce" />
                         <p className="text-sm font-medium">Start picking your blooms</p>
                       </div>
                     )}
                   </div>

                   {/* Wrapping Ribbon/Cone Effect */}
                   <div 
                     className="absolute bottom-[-10%] w-64 h-64 transition-all duration-1000 rotate-45"
                     style={{ 
                        backgroundColor: selection.wrapping?.color || '#FFD1DC',
                        opacity: 0.8,
                        borderRadius: '0 50% 100% 50%',
                        zIndex: 5,
                        boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.1)'
                     }}
                   />
                 </div>
              </div>


              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-playfair font-bold text-charcoal-berry">Your Creation</h3>
                    <p className="text-sm text-charcoal-berry/40">Hand-assembled with care</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-blossom-pink">${calculateTotal()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-50">
                  <div className="flex flex-wrap gap-2">
                    {selection.flowers.length > 0 ? selection.flowers.map(f => (
                      <span key={f.id} className="px-3 py-1 bg-pink-50 text-blossom-pink rounded-full text-xs font-bold">{f.name}</span>
                    )) : <span className="text-xs text-charcoal-berry/30 italic">No flowers selected yet...</span>}
                    {selection.fillers.map(f => (
                      <span key={f.id} className="px-3 py-1 bg-sage-mist/10 text-sage-mist rounded-full text-xs font-bold">{f.name}</span>
                    ))}
                    <span className="px-3 py-1 bg-charcoal-berry/5 text-charcoal-berry/60 rounded-full text-xs font-bold">{selection.wrapping?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-pink-50 min-h-[600px] flex flex-col">
              {/* Stepper */}
              <div className="flex justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-pink-50 -translate-y-1/2 z-0" />
                {[1, 2, 3].map(s => (
                  <button 
                    key={s}
                    onClick={() => setStep(s)}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                      step >= s ? 'bg-blossom-pink text-white scale-110 shadow-lg' : 'bg-white text-charcoal-berry/30 border-2 border-pink-50'
                    }`}
                  >
                    {step > s ? <Check size={20} /> : s}
                  </button>
                ))}
              </div>

              <div className="flex-1">
                {step === 1 && (
                  <div className="animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-2xl font-playfair font-bold mb-6 flex items-center gap-3">
                      <Flower2 className="text-blossom-pink" /> 1. Select Your Flowers
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {options.flowers.map(flower => (
                        <button
                          key={flower.id}
                          onClick={() => toggleItem(flower, 'flowers')}
                          className={`group p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                            selection.flowers.find(f => f.id === flower.id)
                            ? 'border-blossom-pink bg-pink-50/30'
                            : 'border-pink-50 hover:border-pink-200 bg-white'
                          }`}
                        >
                          {flower.image ? (
                            <img src={flower.image} alt={flower.name} className="w-20 h-20 object-cover rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <span className="text-4xl group-hover:scale-125 transition-transform mb-2">{flower.icon}</span>
                          )}
                          <span className="font-bold text-sm">{flower.name}</span>
                          <span className="text-xs text-blossom-pink font-bold">+${flower.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-2xl font-playfair font-bold mb-6 flex items-center gap-3">
                      <Scissors className="text-sage-mist" /> 2. Add Fillers & Greenery
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {options.fillers.map(filler => (
                        <button
                          key={filler.id}
                          onClick={() => toggleItem(filler, 'fillers')}
                          className={`group p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                            selection.fillers.find(f => f.id === filler.id)
                            ? 'border-sage-mist bg-sage-mist/5'
                            : 'border-pink-50 hover:border-sage-mist/30 bg-white'
                          }`}
                        >
                          {filler.image ? (
                            <img src={filler.image} alt={filler.name} className="w-20 h-20 object-cover rounded-2xl mb-2 group-hover:rotate-6 transition-transform duration-500" />
                          ) : (
                            <span className="text-4xl group-hover:rotate-12 transition-transform mb-2">{filler.icon}</span>
                          )}
                          <span className="font-bold text-sm">{filler.name}</span>
                          <span className="text-xs text-sage-mist font-bold">+${filler.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-2xl font-playfair font-bold mb-6 flex items-center gap-3">
                      <Paintbrush2 className="text-charcoal-berry/40" /> 3. Choose Wrapping Paper
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {options.wrappings.map(wrap => (
                        <button
                          key={wrap.id}
                          onClick={() => setSelection({...selection, wrapping: wrap})}
                          className={`group p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center gap-6 ${
                            selection.wrapping?.id === wrap.id
                            ? 'border-charcoal-berry bg-charcoal-berry/5'
                            : 'border-pink-50 hover:border-pink-200 bg-white'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full shadow-inner border-2 border-white" style={{ backgroundColor: wrap.color || '#ccc' }} />
                          <div className="text-left">
                            <p className="font-bold text-sm">{wrap.name}</p>
                            <p className="text-xs text-charcoal-berry/40">{wrap.price === 0 ? 'Free' : `+$${wrap.price}`}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-between gap-4">
                {step > 1 ? (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-charcoal-berry bg-pink-50 hover:bg-pink-100 transition-all"
                  >
                    <ChevronLeft size={20} /> Back
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-blossom-pink text-white hover:shadow-lg transition-all"
                  >
                    Next Step <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleAddToBag}
                    disabled={selection.flowers.length === 0}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                      selection.flowers.length === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isAdded 
                        ? 'bg-green-500 text-white' 
                        : 'bg-charcoal-berry text-white hover:bg-blossom-pink'
                    }`}
                  >
                    {isAdded ? 'Magically Added!' : (
                      <>
                        <ShoppingBag size={20} /> Add to Bag
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center shadow-xl border border-pink-50 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
              {customType === 'keychain' ? '🔑' : customType === 'bag' ? '👜' : '✨'}
            </div>
            <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-4">
              Custom {customType.charAt(0).toUpperCase() + customType.slice(1)} Studio
            </h2>
            <p className="text-charcoal-berry/60 mb-8 max-w-md mx-auto">
              Our artisan workshop is currently being prepared for custom {customType}s. 
              Soon you'll be able to curate every detail of your {customType} with the same magic as our bouquets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCustomType(null)}
                className="px-8 py-4 bg-pink-50 text-charcoal-berry rounded-2xl font-bold hover:bg-pink-100 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={() => setCustomType('bouquet')}
                className="px-8 py-4 bg-blossom-pink text-white rounded-2xl font-bold hover:shadow-lg transition-all"
              >
                Build a Bouquet Instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
