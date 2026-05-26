import { supabase } from '../lib/supabase';

export const paymentService = {
  async getPaymentMethods() {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async togglePaymentMethod(id, isActive) {
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createPaymentMethod(name, config = {}) {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ name, config })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePaymentMethod(id) {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};
