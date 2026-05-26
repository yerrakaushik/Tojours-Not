import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, from = 'Toujours Knot <onboarding@resend.dev>' } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (to, subject, html)' 
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service configuration error' 
      });
    }

    const resend = new Resend(apiKey);

    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ success: false, error });
    }

    console.log('Email sent successfully:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Internal Email Error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send email: ' + err.message 
    });
  }
}
