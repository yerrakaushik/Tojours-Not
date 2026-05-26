import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // 2. Store OTP in Supabase (overwrite if exists for same email)
    const { error: dbError } = await supabase
      .from('otps')
      .upsert(
        { email, otp, expires_at: expiresAt },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('DB Error:', dbError);
      return res.status(500).json({ error: 'Failed to store verification code' });
    }

    // 3. Send Email
    const { error: emailError } = await resend.emails.send({
      from: 'Toujours Knot <auth@bloomandcharm.shop>',
      to: email,
      subject: 'Your Bloom & Charm Access Code',
      html: `
        <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: auto; border: 1px solid #ffe4e6; padding: 40px; border-radius: 24px; background: #fffbff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 40px;">🌸</span>
            <h1 style="color: #4a4a4a; margin-top: 10px;">Bloom & Charm</h1>
          </div>
          <h2 style="color: #ff69b4; text-align: center;">Verification Code</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
            To keep your blossoms secure, please use the following code to complete your sign-in:
          </p>
          <div style="background: #fff5f7; padding: 20px; border-radius: 16px; margin: 30px 0; text-align: center; border: 2px dashed #ffb6c1;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #ff69b4;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ffe4e6; margin: 30px 0;" />
          <p style="font-size: 11px; color: #ccc; text-align: center;">&copy; 2024 Bloom & Charm Artisan Flowers</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Email Error:', emailError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Unexpected Error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
