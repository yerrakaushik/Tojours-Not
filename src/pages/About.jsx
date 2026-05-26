import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Flower2 } from 'lucide-react';
import { siteContentService } from '../services/siteContentService';

export default function About() {
  const [c, setC] = useState({});

  useEffect(() => {
    siteContentService.getAll().then(setC);
  }, []);

  const g = (key) => c[key] ?? '';

  return (
    <div className="min-h-screen bg-creamy-vanilla font-quicksand overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={g('about.hero.image') || '/images/hero.png'}
            className="w-full h-full object-cover opacity-30 scale-110"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-creamy-vanilla/20 via-creamy-vanilla/60 to-creamy-vanilla" />
        </div>

        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blossom-pink/20 text-charcoal-berry text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-blossom-pink/30">
            <Sparkles size={14} className="text-blossom-pink" /> Our Story
          </div>
          <h1 className="text-6xl md:text-8xl font-playfair font-bold text-charcoal-berry mb-6 tracking-tight">
            Bloom &amp; Charm
          </h1>
          <p className="text-xl md:text-2xl text-charcoal-berry/60 max-w-2xl mx-auto font-medium">
            Where every petal tells a story and every knot binds a memory.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-bottom-8">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal-berry leading-tight">
              Crafting Emotions <br />
              <span className="text-blossom-pink">Into Tangible Magic</span>
            </h2>
            <p className="text-lg text-charcoal-berry/70 leading-relaxed">
              Bloom &amp; Charm was born from a simple observation: the most profound feelings often live in the smallest gestures.
              We didn't just want to sell flowers or accessories; we wanted to create symbols of connection.
            </p>
            <div className="flex gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-4xl font-playfair font-bold text-sage-mist">{g('about.stat1.value') || '100%'}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/40">{g('about.stat1.label') || 'Handmade'}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-4xl font-playfair font-bold text-blossom-pink">{g('about.stat2.value') || '5k+'}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal-berry/40">{g('about.stat2.label') || 'Stories Told'}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blossom-pink rounded-[3rem] rotate-3 group-hover:rotate-0 transition-transform duration-700" />
            <img
              src={g('about.philosophy.image') || '/images/cat-bouquets.png'}
              className="relative rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:-translate-x-4 group-hover:-translate-y-4"
              alt="Artisanal bouquet"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white/50 py-24 border-y border-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Flower2, title: 'Artisanal Soul',  desc: 'Every bouquet is hand-assembled by our floral artists, ensuring no two are ever identical.',                   color: 'text-pink-400' },
              { icon: Heart,   title: 'Memory Centric',  desc: 'We design for the moment. Our charms are built to last as long as the memories they represent.',            color: 'text-red-400' },
              { icon: Sparkles,title: 'Pure Magic',      desc: 'From scent to texture, we focus on the sensory magic that makes a gift unforgettable.',                     color: 'text-yellow-500' },
            ].map((value, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white border border-pink-50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="p-4 rounded-2xl bg-gray-50 mb-6">
                  <value.icon size={32} className={value.color} />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-charcoal-berry mb-4">{value.title}</h3>
                <p className="text-charcoal-berry/60 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Quote */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <div className="relative inline-block mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-6">
            <img src={g('about.founder.photo') || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'} alt="Founder" className="w-full h-full object-cover" />
          </div>
          <Sparkles className="absolute -top-4 -right-4 text-blossom-pink animate-pulse" />
        </div>
        <blockquote className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-berry italic leading-snug mb-10">
          {g('about.founder.quote') || '"Beauty isn\'t a luxury; it\'s a necessity for the soul."'}
        </blockquote>
        <p className="font-bold text-blossom-pink uppercase tracking-widest">— {g('about.founder.name') || 'Maya Bloom, Founder'}</p>
      </section>
    </div>
  );
}
