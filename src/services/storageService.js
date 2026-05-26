import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadVoiceMessage(blob, sessionId) {
    try {
      const fileName = `voice_${sessionId}_${Date.now()}.webm`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading voice message:', err);
      return null;
    }
  }
};
