import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import usePageContext from '../hooks/usePageContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { role } = useAuth();
  const { t, language } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pageContext = usePageContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initialMsg = {
      farmer: t('chatbotWelcomeFarmer'),
      merchant: t('chatbotWelcomeMerchant'),
      customer: t('chatbotWelcomeCustomer')
    };
    
    setMessages([
      { role: 'assistant', content: initialMsg[role] || initialMsg.farmer }
    ]);
  }, [role, language, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(input, { ...pageContext, role, language });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.message || response.response || t('chatbotError') 
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('chatbotSystemError') 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    t('marketSummary'),
    t('priceTrends'),
    t('riskFactors'),
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  // Simple Markdown Parser Component
  const MessageContent = ({ content }) => {
    if (!content) return null;

    // Split by newlines to handle paragraphs
    const lines = content.split('\n');

    return (
      <div className="space-y-1">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-2" />; // Spacer for empty lines

          // Parse bold text (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          
          return (
            <p key={i} className="leading-relaxed">
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-glow-green hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group border border-white/20"
          >
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-0 right-0 w-full h-[100dvh] md:bottom-6 md:right-6 md:w-96 md:h-[600px] md:max-h-[80vh] glass-panel flex flex-col shadow-2xl z-50 md:rounded-2xl overflow-hidden border-t md:border border-primary/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="text-primary" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary font-display tracking-wide">AI ASSISTANT</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <p className="text-[10px] text-text-secondary font-mono uppercase">Online • {role.toUpperCase()}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-text-secondary hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20' 
                      : 'bg-white border border-gray-200 text-text-primary rounded-bl-none shadow-sm'
                  }`}> 
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="text-[10px] px-3 py-1.5 bg-white border border-gray-200 text-text-secondary hover:text-primary hover:border-primary/30 rounded-full transition-all font-mono uppercase tracking-wide shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white/90 backdrop-blur-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter command..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 font-mono"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                  className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
