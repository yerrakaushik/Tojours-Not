import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Heart, Loader2 } from 'lucide-react';
import { supportService } from '../../services/supportService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { siteContentService } from '../../services/siteContentService';

const FloatingSupport = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enableSupport, setEnableSupport] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('support_session_id');
    if (!id) {
      id = `session_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('support_session_id', id);
    }
    return id;
  });
  
  const messagesEndRef = useRef(null);

  // Fetch support status and admin status dynamically
  useEffect(() => {
    async function checkSupportSettings() {
      try {
        const settings = await siteContentService.getAll();
        setEnableSupport(settings['system.enable_support'] !== 'false');
      } catch (err) {
        console.error('Error fetching support settings:', err);
      }
    }
    checkSupportSettings();
  }, []);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data: adminCheck, error: rpcError } = await supabase.rpc('is_admin');
        if (!rpcError) {
          setIsAdmin(adminCheck === true);
        } else {
          // Fallback query
          const { data: rows, error: fallbackError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .eq('role', 'admin')
            .limit(1);
          if (!fallbackError && rows && rows.length > 0) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    }
    checkAdminStatus();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const normalizedPath = location.pathname.toLowerCase().replace(/\/+/g, '/');

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const subscription = supportService.subscribeToMessages(sessionId, (newMessage) => {
        setMessages(prev => {
          // Prevent duplicates if the message was added by the sender
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const data = await supportService.getMessages(sessionId);
    setMessages(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      sessionId,
      content: message,
      userId: user?.id
    };

    setIsLoading(true);
    const sent = await supportService.sendMessage(userMessage);
    if (sent) {
      setMessage('');
      // Optimistic update if real-time takes a moment
      if (!messages.find(m => m.id === sent.id)) {
        setMessages(prev => [...prev, sent]);
      }
    }
    setIsLoading(false);
  };

  // Hide support widget completely on admin paths, auth page, if disabled, or for admin users
  if (
    normalizedPath.startsWith('/admin') ||
    normalizedPath.startsWith('/auth') ||
    isAdmin ||
    !enableSupport
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[500px]"
          >
            <div className="bg-blossom-pink p-6 text-white shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="font-playfair font-bold">Bloom Support</h3>
                  <p className="text-xs text-white/80">Online | We're here to help!</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-creamy-vanilla/30 overflow-y-auto min-h-[300px] flex flex-col gap-3">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-pink-50 max-w-[85%] self-start">
                <p className="text-sm text-charcoal-berry">Hi there! 🌸 How can we help you create something magical today?</p>
              </div>

              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-2xl shadow-sm border max-w-[85%] ${
                    msg.sender_type === 'user' 
                      ? 'bg-blossom-pink text-white rounded-br-none self-end border-pink-200' 
                      : 'bg-white text-charcoal-berry rounded-bl-none self-start border-pink-50'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-pink-50 flex gap-2 shrink-0">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-pink-50/50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blossom-pink transition-all"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-10 h-10 bg-blossom-pink text-white rounded-xl flex items-center justify-center hover:bg-pink-400 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blossom-pink text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
};

export default FloatingSupport;

