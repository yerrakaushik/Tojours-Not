import { formatCurrency } from '../utils/currency';

export const notificationService = {
  sendOTP: async (contactMethod, type = 'email') => {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactMethod })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      return { success: true, message: `OTP sent to ${contactMethod}` };
    } catch (e) {
      console.error('Failed to send OTP:', e);
      return { success: false, error: e.message || 'Failed to send verification code' };
    }
  },

  verifyOTP: async (contactMethod, otp) => {
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contactMethod, otp })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired code');
      }
      
      return { success: true, message: "OTP verified successfully." };
    } catch (e) {
      console.error('Verify OTP Error:', e);
      throw e; // Re-throw to be handled by the UI
    }
  },

  sendOrderConfirmationEmail: async (email, orderId, orderDetails) => {
    const { total, cart = [] } = orderDetails;
    const itemsHtml = cart.map(item => `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
        <div style="width: 50px; height: 50px; background: #fff5f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid #ffe4e6;">
          ${item.icon || '🌸'}
        </div>
        <div style="flex: 1;">
          <p style="margin: 0; font-weight: bold; color: #2d3436;">${item.name || item.product_name}</p>
          <p style="margin: 0; font-size: 12px; color: #b2bec3;">Qty: ${item.quantity} &times; ${formatCurrency(item.price)}</p>
        </div>
        <div style="font-weight: bold; color: #ff69b4;">${formatCurrency(item.price * item.quantity)}</div>
      </div>
    `).join('');

    const html = `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: auto; border: 1px solid #ffe4e6; padding: 0; border-radius: 32px; background: #fffbff; overflow: hidden;">
        <div style="background: #ffb6c1; padding: 40px 20px; text-align: center; color: white;">
          <span style="font-size: 50px;">💐</span>
          <h1 style="margin-top: 20px; font-family: 'Playfair Display', serif; font-size: 32px; color: white;">Order Confirmed!</h1>
          <p style="opacity: 0.9; font-size: 16px;">Order ID: #${orderId}</p>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #4a4a4a; font-family: 'Playfair Display', serif; margin-bottom: 20px;">Your Selection</h2>
          <div style="background: white; padding: 25px; border-radius: 24px; border: 1px solid #ffe4e6; margin-bottom: 30px;">
            ${itemsHtml}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #ffe4e6;">
              <span style="font-weight: bold; color: #4a4a4a; font-size: 18px;">Total</span>
              <span style="font-size: 24px; font-weight: bold; color: #ff69b4;">${formatCurrency(total)}</span>
            </div>
          </div>

          <div style="background: #fff5f7; padding: 25px; border-radius: 24px; text-align: center; border: 1px solid #ffb6c1;">
            <p style="margin: 0; font-size: 14px; color: #ff69b4; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Estimated Delivery</p>
            <p style="margin: 10px 0 0; font-size: 20px; color: #4a4a4a; font-weight: bold;">3-5 Business Days</p>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <a href="${window.location.origin}/profile" style="background: #ff69b4; color: white; padding: 18px 35px; border-radius: 16px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 10px 20px rgba(255, 105, 180, 0.2);">Track Your Magic</a>
          </div>
        </div>

        <div style="background: #fdf2f4; padding: 30px; text-align: center; border-top: 1px solid #ffe4e6;">
          <p style="color: #b2bec3; font-size: 12px; line-height: 1.6;">
            Thank you for choosing Bloom & Charm. Each order is prepared with artisan care and a touch of magic. 🌸
          </p>
          <p style="font-size: 11px; color: #ccc; margin-top: 20px;">&copy; 2024 Bloom & Charm | Artisan Flowers & Treasures</p>
        </div>
      </div>
    `;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Order Confirmed! #${orderId}`,
          html
        })
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to send email:', e);
      return { success: false, error: e.message };
    }
  },

  sendTrackingUpdateEmail: async (email, orderId, trackingStatus, notes) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Tracking Update: Order ${orderId} is ${trackingStatus}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fce7f3; border-radius: 20px;">
              <h1 style="color: #4A4A4A; font-family: serif;">Tracking Update</h1>
              <p>Hi there,</p>
              <p>Your order <strong>${orderId}</strong> status has been updated to: <span style="color: #FFB6C1; font-weight: bold; text-transform: uppercase;">${trackingStatus}</span></p>
              ${notes ? `<div style="background: #FFFDF5; padding: 15px; border-radius: 15px; border-left: 4px solid #FFD1DC; margin: 20px 0;"><strong>Note from our team:</strong><br/>${notes}</div>` : ''}
              <p>You can track your order anytime by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/track/${orderId}" 
                   style="background: #FFD1DC; color: #4A4A4A; padding: 15px 30px; text-decoration: none; border-radius: 15px; font-weight: bold; display: inline-block;">
                  Track My Order
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; text-align: center;">
                If you have any questions, feel free to reply to this email.<br/>
                &copy; 2026 Toujours Knot. All rights reserved.
              </p>
            </div>
          `
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to send tracking email');
      }
      return result;
    } catch (error) {
      console.error('Notification Service Error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generic method to send a custom email
   * @param {Object} options { to, subject, html, from }
   */
  sendCustomEmail: async ({ to, subject, html, from }) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, from })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send email');
      return { success: true, data };
    } catch (e) {
      console.error('Email Service Error:', e);
      return { success: false, error: e.message };
    }
  }
};

