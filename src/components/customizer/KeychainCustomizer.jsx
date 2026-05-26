import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, ShoppingBag, Sparkles, Check, Key } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

// ── Stock catalogue ───────────────────────────────────────────────────────────
const BASE_CHARMS = [
  { id: 'star',    name: 'Star Charm',    emoji: '⭐', basePrice: 149 },
  { id: 'heart',   name: 'Heart Charm',   emoji: '❤️',  basePrice: 149 },
  { id: 'flower',  name: 'Flower Charm',  emoji: '🌸', basePrice: 169 },
  { id: 'moon',    name: 'Moon Charm',    emoji: '🌙', basePrice: 169 },
  { id: 'cloud',   name: 'Cloud Charm',   emoji: '☁️',  basePrice: 159 },
  { id: 'butterfly',name: 'Butterfly',    emoji: '🦋', basePrice: 179 },
];

const BEAD_COLORS = [
  { id: 'pink',    name: 'Pink',    hex: '#FF69B4' },
  { id: 'blue',    name: 'Blue',    hex: '#87CEEB' },
  { id: 'lavender',name: 'Lavender',hex: '#967BB6' },
  { id: 'white',   name: 'White',   hex: '#F5F5F5' },
  { id: 'yellow',  name: 'Yellow',  hex: '#FFD700' },
  { id: 'peach',   name: 'Peach',   hex: '#FFCBA4' },
];

const TASSELS = [
  { id: 'none',      name: 'No Tassel',   emoji: '—',  addPrice: 0 },
  { id: 'silk',      name: 'Silk Tassel', emoji: '🎀', addPrice: 30 },
  { id: 'pom',       name: 'Pom-Pom',     emoji: '🎉', addPrice: 25 },
  { id: 'metallic',  name: 'Metallic',    emoji: '✨', addPrice: 40 },
];

const INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({
  id: l.toLowerCase(),
  name: l,
  addPrice: 20,
}));

const STEPS = [
  { num: 1, label: 'Base Charm' },
  { num: 2, label: 'Beads' },
  { num: 3, label: 'Tassel' },
  { num: 4, label: 'Initial' },
];

// ── Color Swatch ──────────────────────────────────────────────────────────────
const ColorSwatch = ({ item, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 p-3 rounded-[1.5rem] border-2 transition-all duration-300 ${
      selected ? 'border-charcoal-berry scale-105 shadow-lg' : 'border-blue-100 hover:border-blue-400 hover:scale-105'
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

// ── Option Card ───────────────────────────────────────────────────────────────
const OptionCard = ({ item, selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative p-5 rounded-[2rem] border-2 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
      selected
        ? 'border-blue-400 bg-blue-50/60 shadow-md scale-[1.02]'
        : 'border-blue-100 bg-white hover:border-blue-300'
    }`}
  >
    {selected && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
        <Check size={12} className="text-white" />
      </div>
    )}
    {children}
  </button>
);

// ── Order Summary Sidebar ─────────────────────────────────────────────────────
const OrderSummary = ({ sel, totalPrice }) => {
  const rows = [
    { label: 'Base Charm', value: sel.baseCharm ? `${sel.baseCharm.emoji} ${sel.baseCharm.name}` : null, color: null },
    { label: 'Bead Color', value: sel.beadColor ? sel.beadColor.name : null, color: sel.beadColor?.hex },
    { label: 'Tassel',     value: sel.tassel ? sel.tassel.name : null, color: null },
    { label: 'Initial',    value: sel.initial ? sel.initial.name : null, color: null },
  ];

  const filledCount = rows.filter(r => r.value && r.value !== '—').length;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-100 sticky top-24">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-blue-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/50">Your Order</span>
      </div>
      <h3 className="text-xl font-playfair font-bold text-charcoal-berry mb-6">
        {sel.baseCharm ? `Custom ${sel.baseCharm.name} Keychain` : 'Custom Keychain'}
      </h3>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-charcoal-berry/40 mb-1">
          <span>Progress</span>
          <span>{filledCount}/4 steps</span>
        </div>
        <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-3">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-blue-50 last:border-0">
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
      <div className="mt-6 pt-6 border-t border-blue-100">
        <div className="flex justify-between items-center">
          <span className="text-charcoal-berry/60 text-sm">Estimated Total</span>
          <span className="text-2xl font-bold text-blue-500 font-playfair">
            {sel.baseCharm ? formatCurrency(totalPrice) : '—'}
          </span>
        </div>
        {sel.baseCharm && (
          <p className="text-xs text-charcoal-berry/40 mt-1 text-right">
            Base ₹{sel.baseCharm.basePrice}
            {sel.tassel?.addPrice > 0 ? ` + Tassel ₹${sel.tassel.addPrice}` : ''}
            {sel.initial?.addPrice ? ` + Initial ₹${sel.initial.addPrice}` : ''}
          </p>
        )}
      </div>

      {/* Note */}
      <div className="mt-4 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
        <p className="text-xs text-charcoal-berry/50 text-center leading-relaxed">
          🔑 COD available for Keychains.<br />Order confirmed via WhatsApp.
        </p>
      </div>
    </div>
  );
};

// ── Initial Picker ────────────────────────────────────────────────────────────
const InitialPicker = ({ selected, onSelect }) => {
  const [search, setSearch] = useState('');
  const filtered = INITIALS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Add Your Initial</h2>
      <p className="text-charcoal-berry/50 text-sm mb-4">Pick a letter to personalise your keychain (+₹20).</p>
      <input
        type="text"
        maxLength={1}
        placeholder="Type a letter..."
        value={search}
        onChange={e => setSearch(e.target.value.toUpperCase())}
        className="w-full mb-4 px-4 py-3 rounded-2xl border-2 border-blue-100 focus:border-blue-400 outline-none text-charcoal-berry font-bold text-center text-xl transition-all"
      />
      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-48 overflow-y-auto pr-1">
        {filtered.map(i => (
          <button
            key={i.id}
            onClick={() => onSelect(selected?.id === i.id ? null : i)}
            className={`p-3 rounded-xl border-2 font-bold text-lg transition-all duration-200 ${
              selected?.id === i.id
                ? 'border-blue-400 bg-blue-400 text-white scale-110'
                : 'border-blue-100 hover:border-blue-300 text-charcoal-berry'
            }`}
          >
            {i.name}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center animate-in fade-in duration-300">
          <span className="text-4xl font-playfair font-bold text-blue-500">{selected.name}</span>
          <p className="text-xs text-charcoal-berry/50 mt-1">Selected initial +₹20</p>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function KeychainCustomizer() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [sel, setSel] = useState({
    baseCharm: null,
    beadColor: null,
    tassel:    null,
    initial:   null,
  });

  const set = (key, val) => setSel(prev => ({ ...prev, [key]: val }));

  const totalPrice = sel.baseCharm
    ? sel.baseCharm.basePrice + (sel.tassel?.addPrice || 0) + (sel.initial?.addPrice || 0)
    : 0;

  const canNext = () => {
    if (step === 1) return !!sel.baseCharm;
    if (step === 2) return !!sel.beadColor;
    if (step === 3) return !!sel.tassel;
    if (step === 4) return true; // initial is optional
    return false;
  };

  const handleAddToCart = () => {
    const item = {
      id: `custom-keychain-${Date.now()}`,
      name: `Custom ${sel.baseCharm?.name} Keychain`,
      price: totalPrice,
      image: '/images/cat-keychains.png',
      isCustom: true,
      category: 'Keychains',
      customization: {
        baseCharm:  sel.baseCharm?.name,
        beadColor:  sel.beadColor?.name,
        tassel:     sel.tassel?.name,
        initial:    sel.initial?.name || 'None',
      },
    };
    addToCart(item);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-in zoom-in duration-500">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">Added to Bag! 🔑</h2>
          <p className="text-charcoal-berry/60 mb-6">Your custom keychain is ready for checkout.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => { setDone(false); setStep(1); setSel({ baseCharm: null, beadColor: null, tassel: null, initial: null }); }}
              className="px-6 py-3 rounded-2xl border-2 border-blue-400 text-blue-500 font-bold hover:bg-blue-50 transition-all"
            >
              Create Another
            </button>
            <a
              href="/cart"
              className="px-6 py-3 rounded-2xl bg-charcoal-berry text-white font-bold hover:bg-blue-500 transition-all flex items-center gap-2"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Key size={12} /> Keychain Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry">Design Your Keychain</h1>
          <p className="text-charcoal-berry/50 mt-2">A miniature masterpiece, every detail yours.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  step > s.num  ? 'bg-blue-400 text-white' :
                  step === s.num ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-200' :
                  'bg-white text-charcoal-berry/30 border-2 border-blue-100'
                }`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${step === s.num ? 'text-blue-500' : 'text-charcoal-berry/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 max-w-12 transition-all duration-500 ${step > s.num ? 'bg-blue-400' : 'bg-blue-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Controls Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-blue-50 min-h-[420px] flex flex-col">
              <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-400" key={step}>

                {/* STEP 1: Base Charm */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Base Charm</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">This is the centrepiece of your keychain.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {BASE_CHARMS.map(c => (
                        <OptionCard key={c.id} selected={sel.baseCharm?.id === c.id} onClick={() => set('baseCharm', c)}>
                          <div className="text-5xl mb-3">{c.emoji}</div>
                          <p className="font-bold text-charcoal-berry text-sm">{c.name}</p>
                          <p className="text-xs text-blue-400 mt-1">from {formatCurrency(c.basePrice)}</p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Bead Color */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Bead Color</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Pick the bead color to string along your charm.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {BEAD_COLORS.map(c => (
                        <ColorSwatch key={c.id} item={c} selected={sel.beadColor?.id === c.id} onClick={() => set('beadColor', c)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Tassel */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Add a Tassel</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Give it that extra flair — or keep it minimal.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {TASSELS.map(t => (
                        <OptionCard key={t.id} selected={sel.tassel?.id === t.id} onClick={() => set('tassel', t)}>
                          <div className="text-4xl mb-3">{t.emoji}</div>
                          <p className="font-bold text-charcoal-berry text-sm">{t.name}</p>
                          <p className="text-xs text-blue-400 mt-1">
                            {t.addPrice === 0 ? 'Free' : `+₹${t.addPrice}`}
                          </p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Initial */}
                {step === 4 && (
                  <>
                    <InitialPicker selected={sel.initial} onSelect={v => set('initial', v)} />

                    {/* Final confirmation box */}
                    {sel.baseCharm && (
                      <div className="mt-8 p-5 rounded-[1.5rem] bg-blue-50/50 border border-blue-100 animate-in fade-in duration-300">
                        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/40 mb-3">✅ Your keychain is ready:</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ['Charm',  sel.baseCharm?.name],
                            ['Beads',  sel.beadColor?.name],
                            ['Tassel', sel.tassel?.name],
                            ['Initial', sel.initial?.name || 'None'],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <span className="text-charcoal-berry/40 block text-xs">{k}</span>
                              <span className="font-bold text-charcoal-berry">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-charcoal-berry bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    disabled={!canNext()}
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-charcoal-berry text-white hover:bg-blue-500 transition-all shadow-lg"
                  >
                    <ShoppingBag size={18} /> Add to Bag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <OrderSummary sel={sel} totalPrice={totalPrice} />
          </div>

        </div>
      </div>
    </div>
  );
}
