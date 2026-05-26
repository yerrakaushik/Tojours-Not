import { supabase } from '../lib/supabase';

// ─── Defaults (used if DB is empty / not yet seeded) ───────────────────────
export const CONTENT_DEFAULTS = {
  // Hero
  'hero.badge':          'New Collection: Spring Whispers ✨',
  'hero.headline1':      'Timeless Charms,',
  'hero.headline2':      'Eternal Blooms.',
  'hero.subtext':        'Experience the art of customized gifting. From artisanal bouquets to whimsical keychains, we knot your emotions into a beautiful memory.',
  'hero.image':          '/images/hero.png',
  'hero.float_image1':   '/images/rose.png',
  'hero.float_image2':   '/images/cat-charm.png',

  // Category cards
  'category.bouquets.image':   '/images/cat-bouquets.png',
  'category.bouquets.title':   'Custom Bouquets',
  'category.bouquets.desc':    'Personalize every petal and leaf to tell your unique story.',
  'category.keychains.image':  '/images/cat-keychains.png',
  'category.keychains.title':  'Whimsical Charms',
  'category.keychains.desc':   'Little tokens of affection that travel with you everywhere.',

  // Newsletter
  'newsletter.headline':  'Join the Bloom Circle',
  'newsletter.subtext':   'Be the first to hear about new limited-edition drops, artisan workshops, and receive a 15% discount on your first magical order.',

  // Trust bar
  'trust.1.emoji': '🚚',
  'trust.1.text':  'Express Magic Delivery',
  'trust.2.emoji': '💝',
  'trust.2.text':  'Artisan Handcrafted',
  'trust.3.emoji': '🌸',
  'trust.3.text':  'Fresh Garden Source',
  'trust.4.emoji': '🛡️',
  'trust.4.text':  'Enchanted Security',

  // About page
  'about.hero.image':       '/images/hero.png',
  'about.philosophy.image': '/images/cat-bouquets.png',
  'about.founder.photo':    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  'about.founder.name':     'Maya Bloom, Founder',
  'about.founder.quote':    '"Beauty isn\'t a luxury; it\'s a necessity for the soul. At Bloom & Charm, we just help you find the knots that tie it all together."',
  'about.stat1.value':      '100%',
  'about.stat1.label':      'Handmade',
  'about.stat2.value':      '5k+',
  'about.stat2.label':      'Stories Told',
};

// ─── Cache to avoid repeated network calls ────────────────────────────────
let _contentCache = null;

function parseFlatKey(flatKey) {
  const firstDot = flatKey.indexOf('.');
  if (firstDot === -1) {
    return { sectionKey: flatKey, subKey: '' };
  }
  return {
    sectionKey: flatKey.slice(0, firstDot),
    subKey: flatKey.slice(firstDot + 1)
  };
}

export const siteContentService = {
  /** Fetch all content keys. Returns merged defaults + DB values. */
  async getAll() {
    if (_contentCache) return _contentCache;
    try {
      const { data, error } = await supabase.from('site_content').select('section_key, content_data');
      if (error) throw error;
      
      const fromDB = {};
      if (data) {
        for (const row of data) {
          const sec = row.section_key;
          const content = row.content_data || {};
          for (const [subKey, val] of Object.entries(content)) {
            fromDB[`${sec}.${subKey}`] = val;
          }
        }
      }
      _contentCache = { ...CONTENT_DEFAULTS, ...fromDB };
      return _contentCache;
    } catch (err) {
      console.error('Error fetching site content:', err);
      return { ...CONTENT_DEFAULTS };
    }
  },

  /** Upsert a single key. */
  async set(key, value) {
    _contentCache = null; // bust cache
    const { sectionKey, subKey } = parseFlatKey(key);
    
    // Fetch existing row to merge JSON contents
    const { data: existing, error: fetchErr } = await supabase
      .from('site_content')
      .select('*')
      .eq('section_key', sectionKey)
      .maybeSingle();
      
    if (fetchErr) throw fetchErr;

    if (existing) {
      const updatedContent = {
        ...(existing.content_data || {}),
        [subKey]: value
      };
      const { error: updateErr } = await supabase
        .from('site_content')
        .update({ content_data: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
        
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from('site_content')
        .insert({
          section_key: sectionKey,
          content_data: { [subKey]: value }
        });
        
      if (insertErr) throw insertErr;
    }
  },

  /** Upsert many keys at once: { key: value, ... } */
  async setMany(updates) {
    _contentCache = null;
    
    // Group updates by sectionKey
    const grouped = {};
    for (const [key, value] of Object.entries(updates)) {
      const { sectionKey, subKey } = parseFlatKey(key);
      if (!grouped[sectionKey]) {
        grouped[sectionKey] = [];
      }
      grouped[sectionKey].push({ subKey, value });
    }

    // Update each group
    for (const [sectionKey, fieldUpdates] of Object.entries(grouped)) {
      // Fetch existing row
      const { data: existing, error: fetchErr } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', sectionKey)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const updatesForSection = {};
      fieldUpdates.forEach(({ subKey, value }) => {
        updatesForSection[subKey] = value;
      });

      if (existing) {
        const updatedContent = {
          ...(existing.content_data || {}),
          ...updatesForSection
        };
        const { error: updateErr } = await supabase
          .from('site_content')
          .update({ content_data: updatedContent, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('site_content')
          .insert({
            section_key: sectionKey,
            content_data: updatesForSection
          });

        if (insertErr) throw insertErr;
      }
    }
  },
};


// ─── Reviews ──────────────────────────────────────────────────────────────
export const reviewsService = {
  /** Public: approved reviews only */
  async getApproved() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /** Admin: all reviews */
  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async approve(id) {
    const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
    if (error) throw error;
  },

  async reject(id) {
    const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id);
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  },

  /** Customer submitting a review */
  async submit({ product_id, author_name, rating, body }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('reviews').insert({
      product_id,
      user_id: user?.id || null,
      author_name,
      rating,
      body,
      approved: false, // admin must approve
    });
    if (error) throw error;
  },
};
