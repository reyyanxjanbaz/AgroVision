import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import usePageContext from '../hooks/usePageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'System initialized. I am your AgroVision AI assistant. How can I assist with your market analysis today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pageContext = usePageContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      const response = await sendChatMessage(input, pageContext);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.message || response.response || 'I apologize, but I couldn\'t process that request.' 
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'System error. Connection interrupted. Please retry.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'Market Summary',
    'Price Trends',
    'Risk Factors',
  ];

  const handleQuickAction = (action) => {
    setInput(action);
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
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary/90 backdrop-blur-md text-white rounded-full shadow-glow-blue hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group border border-white/20"
          >
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-background animate-pulse"></span>
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
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] glass-panel flex flex-col shadow-2xl z-50 rounded-2xl overflow-hidden border border-primary/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles className="text-primary" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary font-display tracking-wide">AI ASSISTANT</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <p className="text-[10px] text-text-secondary font-mono uppercase">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20' 
                      : 'bg-surface border border-white/10 text-text-primary rounded-bl-none'
                  }`}> 
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-white/10 p-3 rounded-2xl rounded-bl-none">
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
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-background/50">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="text-[10px] px-3 py-1.5 bg-surface border border-white/10 text-text-secondary hover:text-primary hover:border-primary/30 rounded-full transition-all font-mono uppercase tracking-wide"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-surface/90 backdrop-blur-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter command..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-background/50 border border-white/10 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 font-mono"
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
