import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import usePageContext from '../hooks/usePageContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-primary text-white rounded-full shadow-glow-green flex items-center justify-center z-50 group border border-white/20 backdrop-blur-sm hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-0 right-0 w-full h-[100dvh] md:bottom-8 md:right-8 md:w-[400px] md:h-[650px] md:max-h-[85vh] glass-panel flex flex-col shadow-2xl z-50 md:rounded-3xl overflow-hidden border border-white/40 dark:border-gray-700/50 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary dark:text-white font-display tracking-wide">Agro AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <p className="text-[10px] text-text-secondary dark:text-gray-400 font-mono uppercase tracking-wider">Online • {role}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none shadow-primary/20' 
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-text-primary dark:text-gray-200 rounded-bl-none'
                  }`}> 
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-5 py-3 flex flex-wrap gap-2 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100/50 dark:border-gray-700/50">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="text-[10px] px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 hover:text-primary hover:border-primary/30 rounded-full transition-all font-mono uppercase tracking-wide shadow-sm hover:shadow-md"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about crops, prices..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-text-primary dark:text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 font-medium"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                  className="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

export default Chatbot;
