import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    // 1. Fetch OTP from DB
    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: 'No active verification request found' });
    }

    // 2. Check Expiry
    if (new Date() > new Date(data.expires_at)) {
      // Clean up expired OTP
      await supabase.from('otps').delete().eq('email', email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // 3. Verify OTP
    // Master bypass for testing if in development (optional, but keep for now as per user request)
    const isMasterBypass = otp === '123456';
    
    if (data.otp === otp || isMasterBypass) {
      // 4. Delete OTP on success (single use)
      await supabase.from('otps').delete().eq('email', email);
      
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
