/**
 * ASTROWORLD — View 13: Grounded AI Astrologer
 * Strict classical reasoning hierarchy grounded in deterministic precalculated facts.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Bot, Send, Sparkles, Shield, AlertTriangle, BookOpen, Clock, CheckCircle } from 'lucide-react';

interface AIAstrologerViewProps {
  context: AIInterpretationContext;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const PRESET_QUERIES = [
  {
    title: 'Career & Professional Execution',
    query: 'What is my career destiny, authority potential, and executive timing based on D1, D10 Dashamsha, and active Dasha?',
    domain: 'CAREER',
  },
  {
    title: 'Dharma, Relationships & Navamsha',
    query: 'Analyze my relationship potential, spouse characteristics, and inner dharma according to D1 7th house and D9 Navamsha.',
    domain: 'RELATIONSHIPS',
  },
  {
    title: 'Current Dasha & Transit Synthesis',
    query: 'How does my active Vimshottari Dasha window intersect with current Saturn and Jupiter transits?',
    domain: 'DASHA_TRANSIT',
  },
  {
    title: 'Spiritual Mission & Atmakaraka',
    query: 'What is my soul purpose and spiritual evolution according to Jaimini Atmakaraka, Karakamsa, and Moksha houses?',
    domain: 'SPIRITUALITY',
  },
];

export const AIAstrologerView: React.FC<AIAstrologerViewProps> = ({ context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialSynthesis, setInitialSynthesis] = useState<string | null>(null);

  const handleGenerateSynthesis = async (queryText?: string, domain?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          domain: domain || 'COMPREHENSIVE',
          query: queryText || '',
        }),
      });
      const data = await res.json();
      if (data.interpretation) {
        setInitialSynthesis(data.interpretation);
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context,
          history: newMessages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Apologies, I encountered a communication error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Canonical Grounding Promise */}
      <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="text-orange-500 w-6 h-6" />
            <h2 className="text-xl font-bold font-serif text-[#162058]">
              AstroWorld Grounded AI Astrologer
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 font-mono">
              PROVENANCE GROUNDED
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          The AI Astrologer is strictly an <strong>interpretation layer</strong>, never an astronomical calculator. It receives pre-calculated canonical facts from IAU ephemeris and BPHS rules. Every assertion cites verified Evidence IDs, preserves contradictions as unresolved tensions, and marks timing windows without date fabrication.
        </p>

        {/* 4 Preset Query Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {PRESET_QUERIES.map((q) => (
            <button
              key={q.title}
              onClick={() => handleGenerateSynthesis(q.query, q.domain)}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-[#FAF7F2] hover:bg-white hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="text-xs font-serif font-bold text-[#162058] group-hover:text-orange-600 mb-1">
                {q.title}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {q.query}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Grounded Synthesis (if available) */}
      {initialSynthesis && (
        <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              <h3 className="font-serif font-bold text-base text-[#162058]">
                Classical Jyotish Synthesis &amp; Provenance
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-[#FAF7F2] px-2 py-0.5 rounded border border-slate-200">
              Low Temperature Grounded
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
            {initialSynthesis}
          </div>
        </div>
      )}

      {/* Direct Interactive Chat Consultation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[550px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-orange-500" />
            <h3 className="font-serif font-bold text-base text-[#162058]">
              Direct Astrological Consultation
            </h3>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Grounded &amp; Ready
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {messages.length === 0 && !initialSynthesis && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bot size={36} className="text-orange-300 mb-3" />
              <p className="font-serif font-bold text-sm text-[#162058]">
                Ask any question regarding your birth chart
              </p>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                E.g., "What does my Jupiter in 5th house mean for education?", "How is my Saturn transit affecting my Moon?", or click a preset card above.
              </p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-none'
                    : 'bg-[#FAF7F2] border border-amber-200/80 text-slate-800 rounded-tl-none font-normal whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 bg-[#FAF7F2] border border-slate-200 rounded-xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <Sparkles size={14} className="text-orange-500 animate-spin" />
                <span>Evaluating classical rules and synthesizing chart evidence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your D1, D9, dasha timing, career, relationships..."
            disabled={isLoading}
            className="flex-1 bg-[#FAF7F2] border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#162058] placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>Ask</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
