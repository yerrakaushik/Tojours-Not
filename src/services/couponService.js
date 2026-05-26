import { formatCurrency } from '../utils/currency';
import { supabase } from '../lib/supabase';

export const couponService = {
  async validateCoupon(code, orderValue) {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !coupons) {
      throw new Error('Invalid or inactive coupon code.');
    }

    const now = new Date();
    if (now < new Date(coupons.start_date) || now > new Date(coupons.end_date)) {
      throw new Error('This coupon has expired or is not yet active.');
    }

    if (coupons.usage_limit && coupons.used_count >= coupons.usage_limit) {
      throw new Error('This coupon has reached its usage limit.');
    }

    if (orderValue < coupons.min_order_value) {
      throw new Error(`Minimum order value for this coupon is ${formatCurrency(coupons.min_order_value)}.`);
    }

    let discountAmount = 0;
    if (coupons.discount_type === 'percentage') {
      discountAmount = (orderValue * (coupons.discount_value / 100));
      if (coupons.max_discount) {
        discountAmount = Math.min(discountAmount, coupons.max_discount);
      }
    } else {
      discountAmount = coupons.discount_value;
    }

    return {
      discountAmount,
      couponId: coupons.id,
    };
  },

  async incrementCouponUsage(couponId) {
    const { error } = await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
    if (error) console.error('Error incrementing coupon usage:', error);
  },

  async getAllCoupons() {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCoupon(couponData) {
    const { data, error } = await supabase.from('coupons').insert(couponData).select().single();
    if (error) throw error;
    return data;
  },

  async updateCoupon(id, updates) {
    const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCoupon(id) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
};
