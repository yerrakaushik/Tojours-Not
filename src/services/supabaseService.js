import { supabase } from '../lib/supabase';

// Mock data as fallback
const MOCK_PRODUCTS = [
  { id: 1, name: 'Pastel Pink Rose', category: 'Bouquets', price: 24, cod: false, icon: '🌹', image: '/images/rose.png' },
  { id: 2, name: 'Golden Sunflower', category: 'Bouquets', price: 30, cod: false, icon: '🌻', image: '/images/sunflower.png' },
  { id: 3, name: 'Cute Cat Charm', category: 'Key chains', price: 12, cod: true, icon: '🐱', image: '/images/cat-charm.png' },
  { id: 4, name: 'Heart Lock Key', category: 'Key chains', price: 15, cod: true, icon: '🔐', image: '/images/heart-lock.png' },
  { id: 5, name: 'Satin Ribbon Bag', category: 'Bags', price: 45, cod: false, icon: '👜', image: '/images/cat-bouquets.png' },
  { id: 6, name: 'Velvet Mini Bag', category: 'Bags', price: 38, cod: false, icon: '👛', image: '/images/cat-keychains.png' },
  { id: 7, name: 'Moonlight Lily', category: 'Bouquets', price: 28, cod: false, icon: '⚜️', image: '/images/hero.png' },
  { id: 8, name: 'Starry Keychain', category: 'Key chains', price: 10, cod: true, icon: '⭐', image: '/images/cat-keychains.png' },
];

const MOCK_PROFILE = {
  name: 'Lily Bloom',
  email: 'lily@magicflowers.com',
  points: 1250,
  joinDate: 'Jan 2024',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
};

const MOCK_ORDERS = [
  { id: 'ORD-5432', date: 'Oct 24, 2024', status: 'Delivered', total: 45, icon: '💐' },
  { id: 'ORD-5431', date: 'Sep 12, 2024', status: 'Delivered', total: 12, icon: '🔑' },
];

const MOCK_CUSTOM_OPTIONS = [
  { id: 'f1', type: 'flower', name: 'Pink Rose', price: 5, icon: '🌹', color: '#FFB7C5', image: '/images/opt-rose.png' },
  { id: 'f2', type: 'flower', name: 'White Lily', price: 7, icon: '⚜️', color: '#FFFFFF', image: '/images/opt-lily.png' },
  { id: 'f3', type: 'flower', name: 'Blue Hydrangea', price: 10, icon: '🫐', color: '#A2CFFE', image: '/images/opt-hydrangea.png' },
  { id: 'f4', type: 'flower', name: 'Yellow Tulip', price: 6, icon: '🌷', color: '#FFF44F', image: '/images/opt-tulip.png' },
  { id: 'f5', type: 'flower', name: 'Purple Lavender', price: 4, icon: '🌿', color: '#E6E6FA', image: '/images/opt-lavender.png' },
  { id: 'l1', type: 'filler', name: 'Eucalyptus', price: 3, icon: '🍃', image: '/images/opt-eucalyptus.png' },
  { id: 'l2', type: 'filler', name: 'Baby Breath', price: 4, icon: '☁️', image: '/images/opt-babybreath.png' },
  { id: 'l3', type: 'filler', name: 'Fern Leaves', price: 2, icon: '🌿', image: '/images/opt-fern.png' },
  { id: 'l4', type: 'filler', name: 'Caspia', price: 5, icon: '🌾', image: '/images/opt-caspia.png' },
  { id: 'w1', type: 'paper', name: 'Kraft Paper', price: 0, color: '#D2B48C' },
  { id: 'w2', type: 'paper', name: 'Pink Silk', price: 3, color: '#FFD1DC' },
  { id: 'w3', type: 'paper', name: 'Clear Celophane', price: 1, color: 'rgba(255,255,255,0.3)' },
  { id: 'w4', type: 'paper', name: 'Deep Velvet', price: 5, color: '#4A0E0E' },
];

export const productsService = {
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data && data.length > 0 ? data : MOCK_PRODUCTS;
    } catch (err) {
      console.warn('Supabase fetch failed, using mock data:', err.message);
      return MOCK_PRODUCTS;
    }
  },

  async getCustomOptions() {
    try {
      const { data, error } = await supabase
        .from('custom_options')
        .select('*');
      
      if (error) throw error;
      return data && data.length > 0 ? data : MOCK_CUSTOM_OPTIONS;
    } catch (err) {
      console.warn('Supabase fetch failed, using mock data:', err.message);
      return MOCK_CUSTOM_OPTIONS;
    }
  },

  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return MOCK_PROFILE;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data || MOCK_PROFILE;
    } catch (err) {
      return MOCK_PROFILE;
    }
  },

  async getOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return MOCK_ORDERS;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data && data.length > 0 ? data : MOCK_ORDERS;
    } catch (err) {
      return MOCK_ORDERS;
    }
  },

  async createOrder(orderData, items) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const orderId = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { data, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user?.id || null,
          total_amount: orderData.total_amount,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          address: orderData.address,
          city: orderData.city,
          zip: orderData.zip,
          status: 'Processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        icon: item.icon || '🌸'
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { success: true, orderId };
    } catch (err) {
      console.error('Failed to create order:', err);
      // Fallback for demo if tables don't exist
      return { success: true, orderId: `BC-${Math.floor(1000 + Math.random() * 9000)}` };
    }
  }
};
