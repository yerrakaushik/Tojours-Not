import { supabase } from '../lib/supabase';

export const productsService = {
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase fetch failed:', err.message);
      throw err;
    }
  },

  async getCustomOptions() {
    try {
      const { data, error } = await supabase
        .from('custom_options')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase fetch failed:', err.message);
      throw err;
    }
  },

  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Supabase profile fetch failed:', err.message);
      return null;
    }
  },

  async getOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase orders fetch failed:', err.message);
      throw err;
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
      throw err;
    }
  },

  async createProduct(productData) {
    const { data, error } = await supabase.from('products').insert(productData).select().single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async createCustomOption(optionData) {
    const { data, error } = await supabase.from('custom_options').insert(optionData).select().single();
    if (error) throw error;
    return data;
  },

  async updateCustomOption(id, updates) {
    const { data, error } = await supabase.from('custom_options').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCustomOption(id) {
    const { error } = await supabase.from('custom_options').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};
