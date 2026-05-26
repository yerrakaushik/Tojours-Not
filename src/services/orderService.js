import { supabase } from '../lib/supabase';
import { couponService } from './couponService';

export const orderService = {
  async createOrder(orderData, items, couponCode = null) {
    let totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      try {
        const validation = await couponService.validateCoupon(couponCode, totalAmount);
        discountAmount = validation.discountAmount;
        couponId = validation.couponId;
      } catch (e) {
        throw e; // Re-throw coupon validation errors to be handled by UI
      }
    }

    const finalAmount = totalAmount - discountAmount;
    const orderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: orderId,
          user_id: orderData.userId,
          total_amount: totalAmount,
          coupon_id: couponId,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          status: orderData.status || 'Processing',
          customer_name: orderData.name,
          customer_email: orderData.email,
          shipping_address: {
            ...orderData.addressSnapshot,
            payment_method: orderData.paymentMethod || 'online',
            payment_status: orderData.paymentStatus || 'pending'
          },
          address: orderData.address,
          city: orderData.city,
          zip: orderData.zip
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Order Items
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      icon: item.icon,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Initialize status history
    await supabase.from('order_status_history').insert([
      {
        order_id: orderId,
        status: 'Processing',
        notes: 'Order has been placed successfully.',
      },
    ]);

    // Increment coupon usage if applied
    if (couponId) {
      await couponService.incrementCouponUsage(couponId);
    }

    return order;
  },

  async getUserOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOrderTracking(orderId) {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getAllOrdersAdmin() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDashboardStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('final_amount, status');

    if (error) throw error;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Processing').length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
    };
  },

  async getRevenueTrend() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('final_amount, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = new Array(7).fill(0);

    orders.forEach(o => {
      const day = new Date(o.created_at).getDay();
      trend[day] += (o.final_amount || 0);
    });

    return days.map((name, index) => ({
      name,
      total: trend[index],
    }));
  },

  async getOrderStatusDistribution() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status');

    if (error) throw error;

    const distribution = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const total = orders.length;
    return Object.entries(distribution).map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color: name === 'Completed' ? '#10b981' : name === 'Processing' ? '#f59e0b' : '#ef4444',
    }));
  },

  async updateOrderStatus(orderId, status, notes = '') {

    const { error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (orderError) throw orderError;

    const { error: historyError } = await supabase.from('order_status_history').insert([
      {
        order_id: orderId,
        status,
        notes,
      },
    ]);

    if (historyError) throw historyError;
  }
};
