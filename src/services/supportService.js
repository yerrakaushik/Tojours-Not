import { supabase } from '../lib/supabase';

export const supportService = {
  async getMessages(sessionId) {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching support messages:', err);
      return [];
    }
  },

  async sendMessage(messageData) {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          session_id: messageData.sessionId,
          sender_type: 'user',
          content: messageData.content,
          user_id: messageData.userId || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sending support message:', err);
      return null;
    }
  },

  subscribeToMessages(sessionId, callback) {
    return supabase
      .channel(`support_messages:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
};
