import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderData, items, couponCode } = req.body;

  if (!orderData || !items || !items.length) {
    return res.status(400).json({ error: 'Order data and items are required' });
  }

  try {
    let totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      // 1. Fetch coupon details
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();

      if (couponError || !coupon) {
        return res.status(400).json({ error: 'Invalid or inactive coupon code.' });
      }

      // 2. Validate expiration date
      const now = new Date();
      if (now < new Date(coupon.start_date) || now > new Date(coupon.end_date)) {
        return res.status(400).json({ error: 'This coupon has expired or is not yet active.' });
      }

      // 3. Validate usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ error: 'This coupon has reached its usage limit.' });
      }

      // 4. Validate minimum order value
      if (totalAmount < coupon.min_order_value) {
        return res.status(400).json({ error: `Minimum order value for this coupon is ₹${coupon.min_order_value}.` });
      }

      // 5. Calculate discount amount
      if (coupon.discount_type === 'percentage') {
        discountAmount = (totalAmount * (coupon.discount_value / 100));
        if (coupon.max_discount) {
          discountAmount = Math.min(discountAmount, coupon.max_discount);
        }
      } else {
        discountAmount = coupon.discount_value;
      }
      couponId = coupon.id;
    }

    const finalAmount = totalAmount - discountAmount;
    const orderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order in orders table (bypassing RLS with admin client)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          id: orderId,
          user_id: orderData.userId || null,
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

    if (orderError) {
      console.error('Database Error creating order:', orderError);
      return res.status(500).json({ error: 'Failed to create order in database', details: orderError.message });
    }

    // Create Order Items (bypassing RLS with admin client)
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      icon: item.icon || '🌸',
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('Database Error creating order items:', itemsError);
      // Clean up orphaned order
      await supabase.from('orders').delete().eq('id', orderId);
      return res.status(500).json({ error: 'Failed to create order items in database', details: itemsError.message });
    }

    // Initialize status history (bypassing RLS with admin client)
    const { error: historyError } = await supabase.from('order_status_history').insert([
      {
        order_id: orderId,
        status: 'Processing',
        notes: 'Order has been placed successfully.',
      },
    ]);

    if (historyError) {
      console.error('Database Error creating status history:', historyError);
      // Do not fail the whole transaction for status history log, but log it
    }

    // Increment coupon usage if applied successfully
    if (couponId) {
      await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error('Unexpected error in order creation handler:', err);
    return res.status(500).json({ error: 'An unexpected error occurred', details: err.message });
  }
}
