import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, ShoppingBag, Sparkles, Check, Flower2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

// ── Stock catalogue (only what's available) ──────────────────────────────────
const FLOWER_TYPES = [
  { id: 'rose',    name: 'Rose',    emoji: '🌹', basePrice: 299 },
  { id: 'tulip',   name: 'Tulip',   emoji: '🌷', basePrice: 249 },
  { id: 'lily',    name: 'Lily',    emoji: '💐', basePrice: 279 },
  { id: 'gerbera', name: 'Gerbera', emoji: '🌸', basePrice: 229 },
];

const FLOWER_COLORS = {
  rose:    [
    { id: 'red',      name: 'Red',      hex: '#E63946' },
    { id: 'pink',     name: 'Pink',     hex: '#FF69B4' },
    { id: 'white',    name: 'White',    hex: '#EFEFEF' },
    { id: 'yellow',   name: 'Yellow',   hex: '#FFD700' },
    { id: 'peach',    name: 'Peach',    hex: '#FFCBA4' },
  ],
  tulip:   [
    { id: 'lavender', name: 'Lavender', hex: '#967BB6' },
    { id: 'pink',     name: 'Pink',     hex: '#FF69B4' },
    { id: 'yellow',   name: 'Yellow',   hex: '#FFD700' },
    { id: 'white',    name: 'White',    hex: '#EFEFEF' },
    { id: 'red',      name: 'Red',      hex: '#E63946' },
  ],
  lily:    [
    { id: 'white',    name: 'White',    hex: '#EFEFEF' },
    { id: 'pink',     name: 'Pink',     hex: '#FF69B4' },
    { id: 'orange',   name: 'Orange',   hex: '#FF8C00' },
  ],
  gerbera: [
    { id: 'pink',     name: 'Pink',     hex: '#FF69B4' },
    { id: 'orange',   name: 'Orange',   hex: '#FF8C00' },
    { id: 'yellow',   name: 'Yellow',   hex: '#FFD700' },
    { id: 'red',      name: 'Red',      hex: '#E63946' },
  ],
};

const LEAF_COLORS = [
  { id: 'dark-green',  name: 'Dark Green',  hex: '#1B4332', emoji: '🌿' },
  { id: 'light-green', name: 'Light Green', hex: '#74C69D', emoji: '🍃' },
];

const BACKING_TYPES = [
  { id: 'tissue', name: 'Tissue Wrap',        emoji: '🎀', desc: 'Soft & elegant' },
  { id: 'nylon',  name: 'Nylon Wrap',          emoji: '✨', desc: 'Shiny & modern' },
  { id: 'gift',   name: 'Gift Wrapping Paper', emoji: '🎁', desc: 'Classic & festive' },
];

const BACKING_COLORS = {
  tissue: [
    { id: 'lavender', name: 'Lavender', hex: '#B39DDB' },
    { id: 'pink',     name: 'Pink',     hex: '#F48FB1' },
    { id: 'yellow',   name: 'Yellow',   hex: '#FFF176' },
    { id: 'blue',     name: 'Blue',     hex: '#90CAF9' },
  ],
  nylon: [
    { id: 'lavender', name: 'Lavender', hex: '#B39DDB' },
    { id: 'pink',     name: 'Pink',     hex: '#F48FB1' },
    { id: 'yellow',   name: 'Yellow',   hex: '#FFF176' },
  ],
  gift: [
    { id: 'pink',   name: 'Pink',   hex: '#F48FB1' },
    { id: 'blue',   name: 'Blue',   hex: '#90CAF9' },
    { id: 'yellow', name: 'Yellow', hex: '#FFF176' },
  ],
};

const STEPS = [
  { num: 1, label: 'Flower' },
  { num: 2, label: 'Color' },
  { num: 3, label: 'Leaves' },
  { num: 4, label: 'Wrap' },
  { num: 5, label: 'Finish' },
];

// ── Color Swatch Button ───────────────────────────────────────────────────────
const ColorSwatch = ({ item, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 p-3 rounded-[1.5rem] border-2 transition-all duration-300 ${
      selected ? 'border-charcoal-berry scale-105 shadow-lg' : 'border-pink-100 hover:border-blossom-pink hover:scale-105'
    }`}
  >
    <div
      className="w-12 h-12 rounded-full shadow-inner border border-black/10 transition-transform group-hover:scale-110"
      style={{ backgroundColor: item.hex }}
    />
    <span className="text-xs font-bold text-charcoal-berry">{item.name}</span>
    {selected && <Check size={12} className="text-charcoal-berry" />}
  </button>
);

// ── Option Card Button ────────────────────────────────────────────────────────
const OptionCard = ({ item, selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative p-5 rounded-[2rem] border-2 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
      selected
        ? 'border-blossom-pink bg-pink-50/60 shadow-md scale-[1.02]'
        : 'border-pink-100 bg-white hover:border-blossom-pink/50'
    }`}
  >
    {selected && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-blossom-pink rounded-full flex items-center justify-center">
        <Check size={12} className="text-white" />
      </div>
    )}
    {children}
  </button>
);

// ── Order Summary Sidebar ─────────────────────────────────────────────────────
const OrderSummary = ({ sel, totalPrice }) => {
  const rows = [
    {
      label: 'Flower',
      value: sel.flowerType ? `${sel.flowerType.emoji} ${sel.flowerType.name}` : null,
      color: null,
    },
    {
      label: 'Color',
      value: sel.flowerColor ? sel.flowerColor.name : null,
      color: sel.flowerColor?.hex,
    },
    {
      label: 'Leaves',
      value: sel.leafColor ? sel.leafColor.name : null,
      color: sel.leafColor?.hex,
    },
    {
      label: 'Wrap',
      value: sel.backingType ? sel.backingType.name : null,
      color: null,
    },
    {
      label: 'Wrap Color',
      value: sel.backingColor ? sel.backingColor.name : null,
      color: sel.backingColor?.hex,
    },
  ];

  const filledCount = rows.filter(r => r.value).length;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-pink-100 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-blossom-pink" />
        <span className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/50">Your Order</span>
      </div>
      <h3 className="text-xl font-playfair font-bold text-charcoal-berry mb-6">
        {sel.flowerType ? `Custom ${sel.flowerType.name} Bouquet` : 'Custom Bouquet'}
      </h3>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-charcoal-berry/40 mb-1">
          <span>Progress</span>
          <span>{filledCount}/5 steps</span>
        </div>
        <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blossom-pink to-pink-400 rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-3">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0">
            <span className="text-sm text-charcoal-berry/50 font-medium">{label}</span>
            {value ? (
              <div className="flex items-center gap-2">
                {color && (
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-sm font-bold text-charcoal-berry">{value}</span>
              </div>
            ) : (
              <span className="text-sm text-charcoal-berry/20 italic">Not selected</span>
            )}
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="mt-6 pt-6 border-t border-pink-100">
        <div className="flex justify-between items-center">
          <span className="text-charcoal-berry/60 text-sm">Estimated Total</span>
          <span className="text-2xl font-bold text-blossom-pink font-playfair">
            {sel.flowerType ? formatCurrency(totalPrice) : '—'}
          </span>
        </div>
        {sel.flowerType && (
          <p className="text-xs text-charcoal-berry/40 mt-1 text-right">
            Base ₹{sel.flowerType.basePrice} + Wrapping ₹50
          </p>
        )}
      </div>

      {/* Note */}
      <div className="mt-4 p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
        <p className="text-xs text-charcoal-berry/50 text-center leading-relaxed">
          🌸 Bouquets are <strong>prepaid only</strong>.<br />Order confirmed via WhatsApp.
        </p>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function BouquetCustomizer() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [sel, setSel] = useState({
    flowerType:   null,
    flowerColor:  null,
    leafColor:    null,
    backingType:  null,
    backingColor: null,
  });

  const set = (key, val) => setSel(prev => ({ ...prev, [key]: val }));

  const canNext = () => {
    if (step === 1) return !!sel.flowerType;
    if (step === 2) return !!sel.flowerColor;
    if (step === 3) return !!sel.leafColor;
    if (step === 4) return !!sel.backingType;
    if (step === 5) return !!sel.backingColor;
    return false;
  };

  const totalPrice = sel.flowerType ? sel.flowerType.basePrice + 50 : 0;

  const handleAddToCart = () => {
    const item = {
      id: `custom-bouquet-${Date.now()}`,
      name: `Custom ${sel.flowerType?.name} Bouquet`,
      price: totalPrice,
      image: '/images/hero.png',
      isCustom: true,
      category: 'Bouquets',
      customization: {
        flowerType:   sel.flowerType?.name,
        flowerColor:  sel.flowerColor?.name,
        leafColor:    sel.leafColor?.name,
        backingType:  sel.backingType?.name,
        backingColor: sel.backingColor?.name,
      },
    };
    addToCart(item);
    setDone(true);
  };

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-in zoom-in duration-500">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">Added to Bag! 🌸</h2>
          <p className="text-charcoal-berry/60 mb-6">Your custom bouquet is ready for checkout.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => { setDone(false); setStep(1); setSel({ flowerType: null, flowerColor: null, leafColor: null, backingType: null, backingColor: null }); }}
              className="px-6 py-3 rounded-2xl border-2 border-blossom-pink text-blossom-pink font-bold hover:bg-pink-50 transition-all"
            >
              Create Another
            </button>
            <a
              href="/cart"
              className="px-6 py-3 rounded-2xl bg-charcoal-berry text-white font-bold hover:bg-blossom-pink transition-all flex items-center gap-2"
            >
              <ShoppingBag size={18} /> View Cart
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creamy-vanilla p-4 md:p-8 font-quicksand">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blossom-pink/20 text-blossom-pink text-xs font-bold uppercase tracking-widest mb-4">
            <Flower2 size={12} /> Bouquet Builder
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry">Design Your Bouquet</h1>
          <p className="text-charcoal-berry/50 mt-2">Choose every detail — exactly the way you want it.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  step > s.num  ? 'bg-sage-mist text-white' :
                  step === s.num ? 'bg-blossom-pink text-white scale-110 shadow-lg shadow-pink-200' :
                  'bg-white text-charcoal-berry/30 border-2 border-pink-100'
                }`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${step === s.num ? 'text-blossom-pink' : 'text-charcoal-berry/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 max-w-12 transition-all duration-500 ${step > s.num ? 'bg-sage-mist' : 'bg-pink-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Controls panel ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-50 min-h-[420px] flex flex-col">
              <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-400" key={step}>

                {/* STEP 1: Flower Type */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Flower Type</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Select the main flower for your bouquet.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {FLOWER_TYPES.map(f => (
                        <OptionCard key={f.id} selected={sel.flowerType?.id === f.id} onClick={() => { set('flowerType', f); set('flowerColor', null); }}>
                          <div className="text-5xl mb-3">{f.emoji}</div>
                          <p className="font-bold text-charcoal-berry">{f.name}</p>
                          <p className="text-xs text-blossom-pink mt-1">from {formatCurrency(f.basePrice)}</p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Flower Color */}
                {step === 2 && sel.flowerType && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Flower Color</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">
                      Available colors for <strong>{sel.flowerType.name}</strong>:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {(FLOWER_COLORS[sel.flowerType.id] || []).map(c => (
                        <ColorSwatch key={c.id} item={c} selected={sel.flowerColor?.id === c.id} onClick={() => set('flowerColor', c)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Leaf Color */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Leaf Color</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Pick the greenery shade for your bouquet.</p>
                    <div className="grid grid-cols-2 gap-6">
                      {LEAF_COLORS.map(l => (
                        <OptionCard key={l.id} selected={sel.leafColor?.id === l.id} onClick={() => set('leafColor', l)}>
                          <div className="text-5xl mb-3">{l.emoji}</div>
                          <div className="w-8 h-8 rounded-full mx-auto mb-3 border border-black/10" style={{ backgroundColor: l.hex }} />
                          <p className="font-bold text-charcoal-berry">{l.name}</p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Backing Type */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Wrapping Style</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Select the wrapping material for your bouquet.</p>
                    <div className="grid grid-cols-1 gap-4">
                      {BACKING_TYPES.map(b => (
                        <OptionCard key={b.id} selected={sel.backingType?.id === b.id} onClick={() => { set('backingType', b); set('backingColor', null); }}>
                          <div className="flex items-center gap-5 text-left">
                            <span className="text-4xl">{b.emoji}</span>
                            <div>
                              <p className="font-bold text-charcoal-berry text-base">{b.name}</p>
                              <p className="text-xs text-charcoal-berry/50">{b.desc}</p>
                            </div>
                          </div>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: Backing Color */}
                {step === 5 && sel.backingType && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Wrapping Color</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">
                      Available colors for <strong>{sel.backingType.name}</strong>:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(BACKING_COLORS[sel.backingType.id] || []).map(c => (
                        <ColorSwatch key={c.id} item={c} selected={sel.backingColor?.id === c.id} onClick={() => set('backingColor', c)} />
                      ))}
                    </div>

                    {/* Final confirmation box */}
                    {sel.backingColor && (
                      <div className="mt-8 p-5 rounded-[1.5rem] bg-pink-50/50 border border-pink-100 animate-in fade-in duration-300">
                        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/40 mb-3">✅ All set! Here's your bouquet:</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ['Flower',      `${sel.flowerType?.name} (${sel.flowerColor?.name})`],
                            ['Leaves',      sel.leafColor?.name],
                            ['Wrapping',    sel.backingType?.name],
                            ['Wrap Color',  sel.backingColor?.name],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <span className="text-charcoal-berry/40 block text-xs">{k}</span>
                              <span className="font-bold text-charcoal-berry">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-charcoal-berry bg-pink-50 hover:bg-pink-100 transition-all"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    disabled={!canNext()}
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-blossom-pink text-white hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    disabled={!canNext()}
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-charcoal-berry text-white hover:bg-blossom-pink transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    <ShoppingBag size={18} /> Add to Bag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-5">
            <OrderSummary sel={sel} totalPrice={totalPrice} />
          </div>

        </div>
      </div>
    </div>
  );
}
