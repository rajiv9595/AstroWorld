/**
 * ASTROWORLD — AstroBot Support Chatbox Component
 * A creative, impressive, and cute cosmic robot assistant chatbox for customer support & guidance.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Minus,
  Send,
  Sparkles,
  Bot,
  HelpCircle,
  PhoneCall,
  Calendar,
  Compass,
  Smile,
  Paperclip,
  Mic,
  Maximize2,
} from 'lucide-react';

interface AstroBotChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestions?: string[];
}

const QUICK_SUGGESTIONS = [
  '🔮 How do I generate my Kundli?',
  '📅 What is today\'s Rahu Kaal?',
  '🌟 Explore Premium Services',
  '📞 Talk to a Human Astrologer',
];

export const AstroBotChatModal: React.FC<AstroBotChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Namaste! 🙏 I am AstroBot, your 24/7 Cosmic Support Companion. How can I help you today?',
      time: 'Just now',
      suggestions: QUICK_SUGGESTIONS,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate cute intelligent bot typing & reply
    setIsTyping(true);
    setTimeout(() => {
      let replyText = "Thank you for reaching out! Our team is integrating full live AI and astrologer support here. For now, you can explore Kundli charts, Daily Panchanga, and all 14 Vedic services directly from the dashboard!";

      const lower = text.toLowerCase();
      if (lower.includes('kundli') || lower.includes('generate')) {
        replyText = "To generate your Kundli, simply fill in your birth date, exact time, and birth city in the 'Get Free Kundli' section on our Home or Dashboard page!";
      } else if (lower.includes('panchang') || lower.includes('rahu') || lower.includes('muhurat')) {
        replyText = "You can view today's accurate live Panchanga, Rahu Kaalam, and Day/Night Choghadiya by clicking 'Explore Full Panchanga' on the homepage!";
      } else if (lower.includes('astrologer') || lower.includes('talk') || lower.includes('human')) {
        replyText = "You can connect with our verified senior astrologers directly at +91 9614346666 or email info@astroworld.com!";
      } else if (lower.includes('services') || lower.includes('premium')) {
        replyText = "We offer 14 canonical Vedic engines: Divisional Vargas (D1-D60), Shadbala Strength, Vimshottari Dasha, Jaimini, Ashtakavarga, and AI Interpretation!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* Minimized Pill */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-linear-to-r from-[#162058] to-[#243380] text-white p-3.5 rounded-full shadow-2xl border-2 border-orange-400 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="relative">
            <Bot size={22} className="text-orange-400 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold font-serif pr-2">AstroBot Support</span>
          <Maximize2 size={14} className="text-slate-300 group-hover:text-white" />
        </button>
      ) : (
        /* Main Chat Window */
        <div className="w-[92vw] sm:w-[390px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header Bar */}
          <div className="bg-linear-to-r from-[#162058] via-[#1d2a6d] to-[#243380] text-white p-4 flex items-center justify-between shadow-md relative overflow-hidden">
            {/* Background Cosmic Glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3 relative z-10">
              {/* Animated Robot Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/30 ring-2 ring-white/30">
                  <Bot size={22} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-[#162058]"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm tracking-wide text-white">
                    AstroBot
                  </h3>
                  <span className="bg-orange-500/30 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-md border border-amber-400/30">
                    SUPPORT
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Online &bull; Ready to help
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                title="Minimize"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-[#FAF7F2] to-white">
            {/* Standing Robot Welcome Showcase Banner */}
            <div className="bg-white border border-amber-200/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-3.5">
              {/* Cute Standing Robot Vector Artwork */}
              <div className="w-16 h-20 shrink-0 relative flex items-center justify-center">
                <svg
                  viewBox="0 0 100 120"
                  className="w-full h-full drop-shadow-md animate-pulse"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Antenna */}
                  <line x1="50" y1="12" x2="50" y2="2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="2" r="4" fill="#EF4444" className="animate-ping" />
                  <circle cx="50" cy="2" r="3" fill="#F59E0B" />

                  {/* Robot Head */}
                  <rect x="25" y="12" width="50" height="36" rx="14" fill="#162058" stroke="#F59E0B" strokeWidth="2.5" />
                  {/* Visor */}
                  <rect x="32" y="20" width="36" height="18" rx="8" fill="#0F172A" />
                  {/* Cute LED Eyes */}
                  <circle cx="42" cy="29" r="3.5" fill="#38BDF8" className="animate-pulse" />
                  <circle cx="58" cy="29" r="3.5" fill="#38BDF8" className="animate-pulse" />
                  {/* Cheeks */}
                  <circle cx="37" cy="33" r="1.5" fill="#F472B6" />
                  <circle cx="63" cy="33" r="1.5" fill="#F472B6" />

                  {/* Ears / Headbolts */}
                  <rect x="20" y="24" width="5" height="10" rx="2" fill="#F59E0B" />
                  <rect x="75" y="24" width="5" height="10" rx="2" fill="#F59E0B" />

                  {/* Body */}
                  <rect x="28" y="52" width="44" height="40" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                  {/* Solar Core Chakra */}
                  <circle cx="50" cy="70" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                  <polygon points="50,64 54,74 44,67 56,67 46,74" fill="#F97316" />

                  {/* Arms */}
                  <rect x="16" y="56" width="9" height="24" rx="4.5" fill="#162058" transform="rotate(8 16 56)" />
                  <rect x="75" y="56" width="9" height="24" rx="4.5" fill="#162058" transform="rotate(-8 75 56)" />

                  {/* Legs */}
                  <rect x="36" y="94" width="10" height="18" rx="5" fill="#CBD5E1" />
                  <rect x="54" y="94" width="10" height="18" rx="5" fill="#CBD5E1" />
                  <ellipse cx="41" cy="112" rx="7" ry="3.5" fill="#162058" />
                  <ellipse cx="59" cy="112" rx="7" ry="3.5" fill="#162058" />
                </svg>
              </div>

              <div>
                <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} />
                  Cosmic Vedic Assistant
                </div>
                <h4 className="text-xs font-serif font-bold text-[#162058] mt-0.5">
                  Standing by to guide your journey
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Ask about Kundli calculations, daily Panchanga, Muhurats, or customer support.
                </p>
              </div>
            </div>

            {/* Messages Thread */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none leading-relaxed'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>

                {/* Quick Action Suggestion Chips */}
                {msg.suggestions && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-[11px] font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 shadow-2xs transition-all text-left flex items-center gap-1 cursor-pointer"
                      >
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bot size={13} />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce"></span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Help Row */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <PhoneCall size={11} className="text-amber-600" />
              Direct Helpline: <strong className="text-slate-700">+91 9614346666</strong>
            </span>
            <span className="text-[10px] text-slate-400">Avg. response &lt; 1m</span>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#FAF7F2] border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask AstroBot anything..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white p-2 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
