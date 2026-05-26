import React, { useState, useEffect } from 'react';
import { Flower2, Paintbrush2, ShoppingBag, Sparkles, ChevronRight, ChevronLeft, Check, Loader2, Key } from 'lucide-react';
import BouquetCustomizer from '../components/customizer/BouquetCustomizer';
import KeychainCustomizer from '../components/customizer/KeychainCustomizer';
import BagCustomizer from '../components/customizer/BagCustomizer';
import { useCart } from '../context/CartContext';
import { productsService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';


export default function Customizer() {
  const [customType, setCustomType] = useState(null); // 'bouquet', 'hamper', 'gift'
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState({ 
    flowers: [], fillers: [], wrappings: [],
    charms: [], beads: [], initials: [], tassels: [],
    bag_colors: [], straps: [], bag_decors: []
  });
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({
    // Bouquet
    flowers: [],
    fillers: [],
    wrapping: null,
    // Keychain
    baseCharm: null,
    addons: [],
    initial: null,
    // Bag
    bagBase: null,
    strap: null,
    decorations: []
  });
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const data = await productsService.getCustomOptions();
      setOptions({ 
        flowers: data.filter(o => o.type === 'flower'),
        fillers: data.filter(o => o.type === 'filler'),
        wrappings: data.filter(o => o.type === 'paper'),
        charms: data.filter(o => o.type === 'charm'),
        beads: data.filter(o => o.type === 'bead'),
        initials: data.filter(o => o.type === 'initial'),
        tassels: data.filter(o => o.type === 'tassel'),
        bag_colors: data.filter(o => o.type === 'bag_color'),
        straps: data.filter(o => o.type === 'strap'),
        bag_decors: data.filter(o => o.type === 'bag_decor')
      });
      
      const defaultWrappings = data.filter(o => o.type === 'paper');
      const defaultCharms = data.filter(o => o.type === 'charm');
      const defaultBags = data.filter(o => o.type === 'bag_color');

      // Try to load saved draft
      const savedDraft = localStorage.getItem(`${customType}-draft`);
      if (savedDraft) {
        setSelection(JSON.parse(savedDraft));
      } else {
        setSelection(prev => ({ 
          ...prev, 
          wrapping: defaultWrappings[0],
          baseCharm: defaultCharms[0],
          bagBase: defaultBags[0]
        }));
      }
      setLoading(false);
    }
    loadOptions();
  }, [customType]);

  // Save draft on every selection change
  useEffect(() => {
    if (!loading && customType) {
      localStorage.setItem(`${customType}-draft`, JSON.stringify(selection));
    }
  }, [selection, loading, customType]);

  const calculateTotal = () => {
    if (customType === 'bouquet') {
      const flowersTotal = selection.flowers.reduce((sum, f) => sum + f.price, 0);
      const fillersTotal = selection.fillers.reduce((sum, f) => sum + f.price, 0);
      return flowersTotal + fillersTotal + (selection.wrapping?.price || 0) + 15;
    } else if (customType === 'keychain') {
      const addonsTotal = selection.addons.reduce((sum, a) => sum + a.price, 0);
      return (selection.baseCharm?.price || 0) + addonsTotal + (selection.initial?.price || 0) + 5;
    } else if (customType === 'bag') {
      const decorTotal = selection.decorations.reduce((sum, d) => sum + d.price, 0);
      return (selection.bagBase?.price || 0) + (selection.strap?.price || 0) + decorTotal + 10;
    }
    return 0;
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

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToBag = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const customItem = {
      id: `custom-${customType}-${Date.now()}`,
      name: `Custom ${customType.charAt(0).toUpperCase() + customType.slice(1)}`,
      price: calculateTotal(),
      image: customType === 'bouquet' ? '/images/hero.png' : customType === 'keychain' ? '/images/cat-keychains.png' : '/images/cat-bouquets.png',
      customization: {
        type: customType,
        details: customType === 'bouquet' ? {
          flowers: selection.flowers.map(f => f.name),
          fillers: selection.fillers.map(f => f.name),
          wrapping: selection.wrapping?.name
        } : customType === 'keychain' ? {
          base: selection.baseCharm?.name,
          addons: selection.addons.map(a => a.name),
          initial: selection.initial?.name
        } : {
          base: selection.bagBase?.name,
          strap: selection.strap?.name,
          decorations: selection.decorations.map(d => d.name)
        }
      },
      isCustom: true
    };
    addToCart(customItem);
    setIsAdded(true);
    localStorage.removeItem(`${customType}-draft`);
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

  // Redirect to dedicated customizers
  if (customType === 'bouquet' || customType === 'keychain' || customType === 'bag') {
    const BackBtn = () => (
      <div className="pt-4 px-4">
        <button
          onClick={() => setCustomType(null)}
          className="mb-4 flex items-center gap-2 text-charcoal-berry/60 hover:text-blossom-pink transition-colors font-bold text-sm"
        >
          <ChevronLeft size={16} /> Back to Selection
        </button>
      </div>
    );
    if (customType === 'bouquet') return (<div><BackBtn /><BouquetCustomizer /></div>);
    if (customType === 'keychain') return (<div><BackBtn /><KeychainCustomizer /></div>);
    if (customType === 'bag') return (<div><BackBtn /><BagCustomizer /></div>);
  }

  if (!customType) {
    return (
      <div className="min-h-screen bg-creamy-vanilla font-quicksand flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-charcoal-berry mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">What are we creating today?</h1>
          <p className="text-charcoal-berry/60 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">Select a category to start your custom journey</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'keychain', name: 'Key chains', icon: <Key className="w-12 h-12 text-blue-500" />, desc: 'Personalized Charms', color: 'bg-blue-50' },
              { id: 'bouquet', name: 'Bouquets', icon: <Flower2 className="w-12 h-12 text-pink-500" />, desc: 'Floral Masterpieces', color: 'bg-pink-50' },
              { id: 'bag', name: 'Bags', icon: <ShoppingBag className="w-12 h-12 text-sage-mist" />, desc: 'Artisan Carriers', color: 'bg-sage-50' }
            ].map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                    setCustomType(item.id);
                    setStep(1);
                }}
                className="group relative flex flex-col items-center p-8 rounded-[3rem] bg-white border-2 border-transparent hover:border-blossom-pink shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in zoom-in duration-700"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className={`w-24 h-24 ${item.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
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
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-mist/10 text-sage-mist text-xs font-bold uppercase tracking-widest mb-4">
            <Paintbrush2 size={12} /> Design Your Dream
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry mb-2">
            {customType === 'bouquet' ? 'Bouquet Builder' : customType === 'keychain' ? 'Keychain Studio' : 'Artisan Bag Workshop'}
          </h1>
          <p className="text-charcoal-berry/60">
            {customType === 'bouquet' ? 'Craft a unique floral story, petal by petal.' : 
             customType === 'keychain' ? 'Design a miniature masterpiece to carry with you.' : 
             'Create a carrier that reflects your personal style.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preview Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Sparkles className="text-blossom-pink animate-pulse" />
              </div>
              
              <div className="aspect-square bg-pink-50/50 rounded-[2.5rem] mb-8 flex items-center justify-center relative overflow-hidden group">
                {customType === 'bouquet' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-1000 animate-pulse" style={{ backgroundColor: selection.wrapping?.color || '#FFD1DC' }} />
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      {selection.fillers.map((f, i) => (
                        <img key={i} src={f.image} className="absolute w-32 h-32 object-contain" style={{ transform: `rotate(${i * (360 / Math.max(1, selection.fillers.length)) + 20}deg) translateY(-30px)`, zIndex: 1 }} />
                      ))}
                      {selection.flowers.map((f, i) => (
                        <img key={i} src={f.image} className="absolute w-40 h-40 object-contain" style={{ transform: `rotate(${i * (360 / Math.max(1, selection.flowers.length))}deg) translateY(-20px)`, zIndex: 10 + i }} />
                      ))}
                    </div>
                  </div>
                )}

                {customType === 'keychain' && (
                  <div className="relative flex flex-col items-center">
                    <div className="text-8xl mb-4 animate-bounce">{selection.baseCharm?.icon || '🔑'}</div>
                    <div className="flex gap-2">
                      {selection.addons.map((a, i) => (
                        <span key={i} className="text-3xl animate-in slide-in-from-top" style={{ animationDelay: `${i * 100}ms` }}>{a.icon}</span>
                      ))}
                      {selection.initial && <span className="text-4xl font-playfair font-bold text-blossom-pink">{selection.initial.name.split(' ')[1] || 'A'}</span>}
                    </div>
                  </div>
                )}

                {customType === 'bag' && (
                  <div className="relative flex flex-col items-center">
                    <div 
                      className="w-48 h-48 rounded-[2rem] shadow-2xl relative"
                      style={{ backgroundColor: selection.bagBase?.color || '#fff' }}
                    >
                      {selection.strap && (
                        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-4xl">{selection.strap.icon}</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center flex-wrap p-4 gap-2">
                        {selection.decorations.map((d, i) => (
                          <span key={i} className="text-2xl animate-in zoom-in">{d.icon}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-playfair font-bold text-charcoal-berry">Your Creation</h3>
                    <p className="text-sm text-charcoal-berry/40">Hand-assembled with care</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-blossom-pink">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-pink-50 min-h-[600px] flex flex-col">
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
                {/* Bouquet Steps */}
                {customType === 'bouquet' && (
                  <>
                    {step === 1 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">1. Select Your Flowers</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {options.flowers.map(o => (
                            <button key={o.id} onClick={() => toggleItem(o, 'flowers')} className={`p-6 rounded-[2rem] border-2 transition-all ${selection.flowers.find(f => f.id === o.id) ? 'border-blossom-pink bg-pink-50/30' : 'border-pink-50 bg-white'}`}>
                              <img src={o.image} className="w-20 h-20 mx-auto mb-2" />
                              <p className="font-bold text-sm">{o.name}</p>
                              <p className="text-xs text-blossom-pink">+{formatCurrency(o.price)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">2. Add Fillers</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {options.fillers.map(o => (
                            <button key={o.id} onClick={() => toggleItem(o, 'fillers')} className={`p-6 rounded-[2rem] border-2 transition-all ${selection.fillers.find(f => f.id === o.id) ? 'border-sage-mist bg-sage-mist/5' : 'border-pink-50 bg-white'}`}>
                              <img src={o.image} className="w-20 h-20 mx-auto mb-2" />
                              <p className="font-bold text-sm">{o.name}</p>
                              <p className="text-xs text-sage-mist">+{formatCurrency(o.price)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">3. Choose Wrapping</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {options.wrappings.map(o => (
                            <button key={o.id} onClick={() => setSelection({...selection, wrapping: o})} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selection.wrapping?.id === o.id ? 'border-charcoal-berry bg-charcoal-berry/5' : 'border-pink-50 bg-white'}`}>
                              <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: o.color }} />
                              <div className="text-left">
                                <p className="font-bold text-sm">{o.name}</p>
                                <p className="text-xs text-charcoal-berry/40">+{formatCurrency(o.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Keychain Steps */}
                {customType === 'keychain' && (
                  <>
                    {step === 1 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">1. Pick Base Charm</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {options.charms.map(o => (
                            <button key={o.id} onClick={() => setSelection({...selection, baseCharm: o})} className={`p-8 rounded-[2rem] border-2 transition-all ${selection.baseCharm?.id === o.id ? 'border-blue-400 bg-blue-50' : 'border-pink-50 bg-white'}`}>
                              <span className="text-5xl block mb-2">{o.icon}</span>
                              <p className="font-bold text-sm">{o.name}</p>
                              <p className="text-xs text-blue-500">+{formatCurrency(o.price)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">2. Add Extra Charms & Beads</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[...options.beads, ...options.tassels].map(o => (
                            <button key={o.id} onClick={() => toggleItem(o, 'addons')} className={`p-6 rounded-[2rem] border-2 transition-all ${selection.addons.find(a => a.id === o.id) ? 'border-blue-400 bg-blue-50' : 'border-pink-50 bg-white'}`}>
                              <span className="text-4xl block mb-2">{o.icon}</span>
                              <p className="font-bold text-sm">{o.name}</p>
                              <p className="text-xs text-blue-500">+{formatCurrency(o.price)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">3. Add Your Initial</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {options.initials.map(o => (
                            <button key={o.id} onClick={() => setSelection({...selection, initial: o})} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selection.initial?.id === o.id ? 'border-charcoal-berry bg-charcoal-berry/5' : 'border-pink-50 bg-white'}`}>
                              <span className="text-4xl">{o.icon}</span>
                              <div className="text-left">
                                <p className="font-bold text-sm">{o.name}</p>
                                <p className="text-xs text-charcoal-berry/40">+{formatCurrency(o.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Bag Steps */}
                {customType === 'bag' && (
                  <>
                    {step === 1 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">1. Bag Color</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {options.bag_colors.map(o => (
                            <button key={o.id} onClick={() => setSelection({...selection, bagBase: o})} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selection.bagBase?.id === o.id ? 'border-sage-mist bg-sage-mist/5' : 'border-pink-50 bg-white'}`}>
                              <div className="w-16 h-16 rounded-2xl shadow-lg" style={{ backgroundColor: o.color }} />
                              <div className="text-left">
                                <p className="font-bold text-sm">{o.name}</p>
                                <p className="text-xs text-sage-mist">+{formatCurrency(o.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">2. Choose Strap Style</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {options.straps.map(o => (
                            <button key={o.id} onClick={() => setSelection({...selection, strap: o})} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selection.strap?.id === o.id ? 'border-sage-mist bg-sage-mist/5' : 'border-pink-50 bg-white'}`}>
                              <span className="text-4xl">{o.icon}</span>
                              <div className="text-left">
                                <p className="font-bold text-sm">{o.name}</p>
                                <p className="text-xs text-sage-mist">+{formatCurrency(o.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-playfair font-bold mb-6">3. Final Decorations</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {options.bag_decors.map(o => (
                            <button key={o.id} onClick={() => toggleItem(o, 'decorations')} className={`p-6 rounded-[2rem] border-2 transition-all ${selection.decorations.find(d => d.id === o.id) ? 'border-blossom-pink bg-pink-50/30' : 'border-pink-50 bg-white'}`}>
                              <span className="text-4xl block mb-2">{o.icon}</span>
                              <p className="font-bold text-sm">{o.name}</p>
                              <p className="text-xs text-blossom-pink">+{formatCurrency(o.price)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-12 flex justify-between gap-4">
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-charcoal-berry bg-pink-50 hover:bg-pink-100 transition-all">
                    <ChevronLeft size={20} /> Back
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-blossom-pink text-white hover:shadow-lg transition-all">
                    Next Step <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleAddToBag}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${isAdded ? 'bg-green-500 text-white' : 'bg-charcoal-berry text-white hover:bg-blossom-pink'}`}
                  >
                    {isAdded ? 'Magically Added!' : <><ShoppingBag size={20} /> Add to Bag</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
