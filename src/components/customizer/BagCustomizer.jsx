import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';

// ── Stock catalogue ───────────────────────────────────────────────────────────
const BAG_STYLES = [
  { id: 'tote',    name: 'Tote Bag',        emoji: '👜', basePrice: 499 },
  { id: 'sling',   name: 'Sling Bag',        emoji: '👝', basePrice: 549 },
  { id: 'clutch',  name: 'Clutch Bag',       emoji: '💼', basePrice: 399 },
  { id: 'backpack',name: 'Mini Backpack',     emoji: '🎒', basePrice: 649 },
];

const BAG_COLORS = [
  { id: 'blush',     name: 'Blush Pink',   hex: '#F4A7B9' },
  { id: 'ivory',     name: 'Ivory',        hex: '#FFFFF0' },
  { id: 'sage',      name: 'Sage Green',   hex: '#87A878' },
  { id: 'lavender',  name: 'Lavender',     hex: '#C9B1D9' },
  { id: 'caramel',   name: 'Caramel',      hex: '#C68642' },
  { id: 'slate',     name: 'Slate Blue',   hex: '#6E8EAD' },
];

const STRAP_TYPES = [
  { id: 'short',    name: 'Short Handle',   emoji: '🤏', addPrice: 0,  desc: 'Classic hand-carry' },
  { id: 'long',     name: 'Long Strap',     emoji: '📏', addPrice: 50, desc: 'Shoulder / crossbody' },
  { id: 'chain',    name: 'Chain Strap',    emoji: '⛓️', addPrice: 80, desc: 'Metallic & chic' },
  { id: 'ribbon',   name: 'Ribbon Handle',  emoji: '🎀', addPrice: 60, desc: 'Soft & feminine' },
];

const EMBELLISHMENTS = [
  { id: 'bow',      name: 'Satin Bow',       emoji: '🎀', addPrice: 40 },
  { id: 'flower',   name: 'Fabric Flower',   emoji: '🌸', addPrice: 50 },
  { id: 'pearl',    name: 'Pearl Trim',      emoji: '🫧', addPrice: 60 },
  { id: 'patch',    name: 'Embroidery Patch',emoji: '🪡', addPrice: 70 },
  { id: 'charm',    name: 'Gold Charm',      emoji: '✨', addPrice: 55 },
  { id: 'tassel',   name: 'Tassel',          emoji: '🪢', addPrice: 35 },
];

const MESSAGE_OPTIONS = [
  { id: 'none',   name: 'No Message',      addPrice: 0 },
  { id: 'love',   name: '"With Love"',     addPrice: 30 },
  { id: 'name',   name: 'Custom Name',     addPrice: 50 },
  { id: 'quote',  name: 'Short Quote',     addPrice: 60 },
];

const STEPS = [
  { num: 1, label: 'Style' },
  { num: 2, label: 'Color' },
  { num: 3, label: 'Strap' },
  { num: 4, label: 'Embellish' },
  { num: 5, label: 'Message' },
];

// ── Color Swatch ──────────────────────────────────────────────────────────────
const ColorSwatch = ({ item, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 p-3 rounded-[1.5rem] border-2 transition-all duration-300 ${
      selected ? 'border-charcoal-berry scale-105 shadow-lg' : 'border-sage-mist/30 hover:border-sage-mist hover:scale-105'
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
        ? 'border-sage-mist bg-sage-mist/10 shadow-md scale-[1.02]'
        : 'border-sage-mist/20 bg-white hover:border-sage-mist/50'
    }`}
  >
    {selected && (
      <div className="absolute top-3 right-3 w-5 h-5 bg-sage-mist rounded-full flex items-center justify-center">
        <Check size={12} className="text-white" />
      </div>
    )}
    {children}
  </button>
);

// ── Embellishment Multi-Select ────────────────────────────────────────────────
const EmbellishmentCard = ({ item, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`relative p-4 rounded-[1.5rem] border-2 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
      selected
        ? 'border-sage-mist bg-sage-mist/10 shadow-md'
        : 'border-sage-mist/20 bg-white hover:border-sage-mist/40'
    }`}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-4 h-4 bg-sage-mist rounded-full flex items-center justify-center">
        <Check size={10} className="text-white" />
      </div>
    )}
    <div className="text-3xl mb-2">{item.emoji}</div>
    <p className="font-bold text-charcoal-berry text-xs">{item.name}</p>
    <p className="text-xs text-sage-mist mt-0.5">+₹{item.addPrice}</p>
  </button>
);

// ── Order Summary Sidebar ─────────────────────────────────────────────────────
const OrderSummary = ({ sel, totalPrice }) => {
  const embellishNames = sel.embellishments.map(e => e.name).join(', ') || null;
  const rows = [
    { label: 'Bag Style',      value: sel.bagStyle  ? `${sel.bagStyle.emoji} ${sel.bagStyle.name}` : null },
    { label: 'Color',          value: sel.bagColor  ? sel.bagColor.name : null, color: sel.bagColor?.hex },
    { label: 'Strap',          value: sel.strap     ? sel.strap.name : null },
    { label: 'Embellishments', value: embellishNames },
    { label: 'Message',        value: sel.message   ? sel.message.name : null },
  ];

  const filledCount = rows.filter(r => r.value).length;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-sage-mist/20 sticky top-24">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-sage-mist" />
        <span className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/50">Your Order</span>
      </div>
      <h3 className="text-xl font-playfair font-bold text-charcoal-berry mb-6">
        {sel.bagStyle ? `Custom ${sel.bagStyle.name}` : 'Custom Bag'}
      </h3>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-charcoal-berry/40 mb-1">
          <span>Progress</span>
          <span>{filledCount}/5 steps</span>
        </div>
        <div className="w-full h-2 bg-sage-mist/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-mist to-green-400 rounded-full transition-all duration-700"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-3">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-sage-mist/10 last:border-0">
            <span className="text-sm text-charcoal-berry/50 font-medium">{label}</span>
            {value ? (
              <div className="flex items-center gap-2">
                {color && (
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-sm font-bold text-charcoal-berry text-right max-w-[140px] truncate">{value}</span>
              </div>
            ) : (
              <span className="text-sm text-charcoal-berry/20 italic">Not selected</span>
            )}
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="mt-6 pt-6 border-t border-sage-mist/20">
        <div className="flex justify-between items-center">
          <span className="text-charcoal-berry/60 text-sm">Estimated Total</span>
          <span className="text-2xl font-bold text-sage-mist font-playfair">
            {sel.bagStyle ? formatCurrency(totalPrice) : '—'}
          </span>
        </div>
        {sel.bagStyle && (
          <p className="text-xs text-charcoal-berry/40 mt-1 text-right">
            Base ₹{sel.bagStyle.basePrice}
            {sel.strap?.addPrice > 0 ? ` + Strap ₹${sel.strap.addPrice}` : ''}
            {sel.embellishments.length > 0 ? ` + Embellishments` : ''}
          </p>
        )}
      </div>

      {/* Note */}
      <div className="mt-4 p-3 rounded-2xl bg-sage-mist/10 border border-sage-mist/20">
        <p className="text-xs text-charcoal-berry/50 text-center leading-relaxed">
          👜 Bags are <strong>prepaid only</strong>.<br />Order confirmed via WhatsApp.
        </p>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function BagCustomizer() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [sel, setSel] = useState({
    bagStyle:       null,
    bagColor:       null,
    strap:          null,
    embellishments: [],
    message:        null,
  });

  const set = (key, val) => setSel(prev => ({ ...prev, [key]: val }));

  const toggleEmbellishment = item => {
    setSel(prev => {
      const exists = prev.embellishments.find(e => e.id === item.id);
      return {
        ...prev,
        embellishments: exists
          ? prev.embellishments.filter(e => e.id !== item.id)
          : [...prev.embellishments, item],
      };
    });
  };

  const embellishPrice = sel.embellishments.reduce((sum, e) => sum + e.addPrice, 0);
  const totalPrice = sel.bagStyle
    ? sel.bagStyle.basePrice + (sel.strap?.addPrice || 0) + embellishPrice + (sel.message?.addPrice || 0)
    : 0;

  const canNext = () => {
    if (step === 1) return !!sel.bagStyle;
    if (step === 2) return !!sel.bagColor;
    if (step === 3) return !!sel.strap;
    if (step === 4) return true; // embellishments optional
    if (step === 5) return !!sel.message;
    return false;
  };

  const handleAddToCart = () => {
    const item = {
      id: `custom-bag-${Date.now()}`,
      name: `Custom ${sel.bagStyle?.name}`,
      price: totalPrice,
      image: '/images/cat-bouquets.png',
      isCustom: true,
      category: 'Bags',
      customization: {
        bagStyle:       sel.bagStyle?.name,
        bagColor:       sel.bagColor?.name,
        strap:          sel.strap?.name,
        embellishments: sel.embellishments.map(e => e.name).join(', ') || 'None',
        message:        sel.message?.name,
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
          <h2 className="text-3xl font-playfair font-bold text-charcoal-berry mb-2">Added to Bag! 👜</h2>
          <p className="text-charcoal-berry/60 mb-6">Your custom bag is ready for checkout.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => { setDone(false); setStep(1); setSel({ bagStyle: null, bagColor: null, strap: null, embellishments: [], message: null }); }}
              className="px-6 py-3 rounded-2xl border-2 border-sage-mist text-sage-mist font-bold hover:bg-sage-mist/10 transition-all"
            >
              Create Another
            </button>
            <a
              href="/cart"
              className="px-6 py-3 rounded-2xl bg-charcoal-berry text-white font-bold hover:bg-sage-mist transition-all flex items-center gap-2"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-mist/20 text-sage-mist text-xs font-bold uppercase tracking-widest mb-4">
            <ShoppingBag size={12} /> Bag Workshop
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry">Design Your Bag</h1>
          <p className="text-charcoal-berry/50 mt-2">Every stitch, every detail — handcrafted for you.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  step > s.num  ? 'bg-sage-mist text-white' :
                  step === s.num ? 'bg-sage-mist text-white scale-110 shadow-lg shadow-green-200' :
                  'bg-white text-charcoal-berry/30 border-2 border-sage-mist/20'
                }`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block ${step === s.num ? 'text-sage-mist' : 'text-charcoal-berry/40'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 max-w-12 transition-all duration-500 ${step > s.num ? 'bg-sage-mist' : 'bg-sage-mist/20'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Controls Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-sage-mist/10 min-h-[420px] flex flex-col">
              <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-400" key={step}>

                {/* STEP 1: Bag Style */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Bag Style</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Pick the bag type you'd like to customise.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {BAG_STYLES.map(b => (
                        <OptionCard key={b.id} selected={sel.bagStyle?.id === b.id} onClick={() => set('bagStyle', b)}>
                          <div className="text-5xl mb-3">{b.emoji}</div>
                          <p className="font-bold text-charcoal-berry">{b.name}</p>
                          <p className="text-xs text-sage-mist mt-1">from {formatCurrency(b.basePrice)}</p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Bag Color */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Bag Color</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Select the base color for your {sel.bagStyle?.name}.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {BAG_COLORS.map(c => (
                        <ColorSwatch key={c.id} item={c} selected={sel.bagColor?.id === c.id} onClick={() => set('bagColor', c)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Strap */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Choose Strap Style</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">How would you like to carry it?</p>
                    <div className="grid grid-cols-1 gap-4">
                      {STRAP_TYPES.map(s => (
                        <OptionCard key={s.id} selected={sel.strap?.id === s.id} onClick={() => set('strap', s)}>
                          <div className="flex items-center gap-5 text-left">
                            <span className="text-3xl">{s.emoji}</span>
                            <div>
                              <p className="font-bold text-charcoal-berry text-base">{s.name}</p>
                              <p className="text-xs text-charcoal-berry/50">{s.desc}</p>
                              <p className="text-xs text-sage-mist font-bold mt-0.5">
                                {s.addPrice === 0 ? 'Included' : `+₹${s.addPrice}`}
                              </p>
                            </div>
                          </div>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Embellishments */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Add Embellishments</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">
                      Select any extras to add (optional — pick multiple).
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {EMBELLISHMENTS.map(e => (
                        <EmbellishmentCard
                          key={e.id}
                          item={e}
                          selected={sel.embellishments.some(x => x.id === e.id)}
                          onClick={() => toggleEmbellishment(e)}
                        />
                      ))}
                    </div>
                    {sel.embellishments.length === 0 && (
                      <p className="text-center text-xs text-charcoal-berry/30 mt-4 italic">None selected — or skip to keep it simple.</p>
                    )}
                  </div>
                )}

                {/* STEP 5: Message */}
                {step === 5 && (
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-charcoal-berry mb-2">Add a Message</h2>
                    <p className="text-charcoal-berry/50 text-sm mb-6">Would you like text embroidered or printed on the bag?</p>
                    <div className="grid grid-cols-1 gap-3">
                      {MESSAGE_OPTIONS.map(m => (
                        <OptionCard key={m.id} selected={sel.message?.id === m.id} onClick={() => set('message', m)}>
                          <div className="flex items-center justify-between px-2">
                            <p className="font-bold text-charcoal-berry">{m.name}</p>
                            <p className="text-sm text-sage-mist font-bold">
                              {m.addPrice === 0 ? 'Free' : `+₹${m.addPrice}`}
                            </p>
                          </div>
                        </OptionCard>
                      ))}
                    </div>

                    {/* Final confirmation box */}
                    {sel.message && (
                      <div className="mt-8 p-5 rounded-[1.5rem] bg-sage-mist/10 border border-sage-mist/20 animate-in fade-in duration-300">
                        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/40 mb-3">✅ Your bag is ready:</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ['Style',          sel.bagStyle?.name],
                            ['Color',          sel.bagColor?.name],
                            ['Strap',          sel.strap?.name],
                            ['Embellishments', sel.embellishments.map(e => e.name).join(', ') || 'None'],
                            ['Message',        sel.message?.name],
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
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-charcoal-berry bg-sage-mist/10 hover:bg-sage-mist/20 transition-all"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button
                    disabled={!canNext()}
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-sage-mist text-white hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    disabled={!canNext()}
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-charcoal-berry text-white hover:bg-sage-mist transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
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
