import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Bot, User, Loader2, Sparkles, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CharisAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Charis, your billing expert. How can I help you with your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);
  const { isAuthenticated, subscription } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        question: input,
        history: messages.slice(-6)
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.details || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const planName = subscription?.plan?.plan_name || subscription?.Plan?.plan_name || 'Free Account';
  if (!isAuthenticated || planName !== 'Enterprise') return null;

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={panelRef}
          className="mb-4 w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] max-h-[calc(100vh-12rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Charis</h3>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Billing Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm",
                  msg.role === 'user' ? "bg-indigo-600" : "bg-white border border-slate-100"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className={cn(
                  "p-3.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-100" 
                    : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Charis anything..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Ball Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent click outside from firing immediately
          setIsOpen(!isOpen);
        }}
        className={cn(
          "group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 pointer-events-auto shadow-2xl",
          isOpen ? "scale-90" : "scale-100"
        )}
      >
        {/* The 3D Sphere */}
        <div className={cn(
          "absolute inset-0 rounded-full shadow-2xl transition-all duration-500",
          isOpen 
            ? "bg-slate-800" 
            : isLoading 
              ? "animate-pulse bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-800" 
              : "bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 animate-breathing"
        )}>
          {/* Sphere Highlights (only when closed) */}
          {!isOpen && <div className="absolute top-2 left-3 w-6 h-4 bg-white/30 rounded-full blur-[2px] -rotate-12"></div>}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20"></div>
        </div>

        {/* Outer Glow (only when closed) */}
        {!isOpen && (
          <div className={cn(
            "absolute -inset-2 rounded-full blur-xl opacity-40 transition-colors duration-500",
            isLoading ? "bg-purple-500" : "bg-cyan-500 animate-pulse"
          )}></div>
        )}

        {/* Icon */}
        <div className="relative z-10 text-white">
          {isOpen ? (
            <X className="w-7 h-7 transition-all" />
          ) : (
            <Sparkles className={cn("w-7 h-7 transition-all", isLoading ? "animate-spin" : "group-hover:scale-110")} />
          )}
        </div>
      </button>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-breathing {
          animation: breathing 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CharisAssistant;
