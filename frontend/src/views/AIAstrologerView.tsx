/**
 * ASTROWORLD — View 13: Master Grounded AI Astrologer (Acharya Vidyadhar)
 * Complete Parashari & Jaimini Vedic Astrology Intelligence.
 * Authentic consultation experience with deep chart grounding, audio recitation,
 * thematic deep dives, dynamic follow-up suggestions, and dossier export.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  Compass,
  Moon,
  Sun,
  Shield,
  Heart,
  Briefcase,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
  Bookmark,
  Share2,
  RotateCcw,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { AIInterpretationContext } from '../engine/types.ts';
import {
  requestConsultation,
  sendAstrologerMessage,
  requestAstrologerAudio,
  fetchUserConsultationHistory,
  SavedConsultationItem,
} from '../services/aiAstrologerService.ts';

interface AIAstrologerViewProps {
  context: AIInterpretationContext;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

interface ConsultationTheme {
  id: string;
  title: string;
  sanskrit: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge: string;
  description: string;
  sampleQuery: string;
  color: string;
}

const CONSULTATION_THEMES: ConsultationTheme[] = [
  {
    id: 'COMPREHENSIVE',
    title: 'Complete Life & Soul Blueprint',
    sanskrit: 'Sampoorna Jeevan Darshan',
    icon: Compass,
    badge: 'CORE LIFE READING',
    description: 'Soul purpose, primary Raja/Dhana yogas, Lagna strength, and overarching life trajectory.',
    sampleQuery: 'Provide an in-depth canonical life synthesis with classical grounding, soul destiny, and timing windows.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'CAREER',
    title: 'Career, Wealth & Business Timing',
    sanskrit: 'Karma, Artha & Dashamsha',
    icon: Briefcase,
    badge: 'ARTHA & SUCCESS',
    description: '10th house, D10 Dashamsha, Dhana Yogas, business vs job, and upcoming promotion windows.',
    sampleQuery: 'What is my career destiny, optimal professional industries, wealth potential, and dasha promotion timing?',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'RELATIONSHIPS',
    title: 'Love, Marriage & Spouse Characteristics',
    sanskrit: 'Vivaha, Sambandha & D9',
    icon: Heart,
    badge: 'KAMA & HARMONY',
    description: '7th house lord, D9 Navamsha, spouse qualities, marriage timing window, and Manglik assessment.',
    sampleQuery: 'Analyze my marriage potential, spouse characteristics, timing of union, and relationship harmony based on D1 and D9.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'HEALTH',
    title: 'Health, Vitality & Ayurvedic Balance',
    sanskrit: 'Arogya & Dosha Tattva',
    icon: Shield,
    badge: 'AYURVEDA & VITALITY',
    description: '6th/8th house indicators, Moon & Sun vigor, constitutional balance (Vata/Pitta/Kapha), and vitality.',
    sampleQuery: 'Evaluate my constitutional health tendencies, vitality markers, sensitive areas, and Ayurvedic lifestyle balance.',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'REMEDIES',
    title: 'Dosha Nivaran & Sacred Vedic Upayas',
    sanskrit: 'Shanti, Mantras & Ratna',
    icon: Layers,
    badge: 'CLASSICAL REMEDIES',
    description: 'Manglik, Kaal Sarp, Sade Sati mitigation with exact Mantras, Gemstones, Rudraksha, and Dana.',
    sampleQuery: 'What are the most effective classical Vedic remedies, mantras, gemstones, and charities for my specific chart?',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'SPIRITUALITY',
    title: 'Spiritual Awakening & Ishta Devata',
    sanskrit: 'Moksha, Dharma & Atmakaraka',
    icon: Moon,
    badge: 'MOKSHA & DHARMA',
    description: '9th & 12th houses, Atmakaraka soul mission, Karakamsa Navamsha deity, and spiritual evolution.',
    sampleQuery: 'What is my soul purpose, Ishta Devata, and spiritual initiation path according to Jaimini and Parashari principles?',
    color: 'from-purple-600 to-violet-700',
  },
  {
    id: 'TRANSITS',
    title: '2026 Transit Forecast & Sade Sati',
    sanskrit: 'Varsha Gochara Phala',
    icon: Sun,
    badge: 'ANNUAL TIMING',
    description: 'Real-time Saturn, Jupiter, and Rahu/Ketu transits intersecting with your active Vimshottari Dasha.',
    sampleQuery: 'How do the 2026 Gochara transits of Saturn, Jupiter, and Rahu/Ketu affect my natal planets and current dasha?',
    color: 'from-amber-600 to-yellow-600',
  },
];

export const AIAstrologerView: React.FC<AIAstrologerViewProps> = ({ context }) => {
  const [activeMode, setActiveMode] = useState<'consultation' | 'chat' | 'history'>('consultation');
  const [selectedTheme, setSelectedTheme] = useState<ConsultationTheme>(CONSULTATION_THEMES[0]);
  const [customInquiry, setCustomInquiry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisText, setSynthesisText] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Audio Recitation State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Consultation History State
  const [pastConsultations, setPastConsultations] = useState<SavedConsultationItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Extract quick chart summary facts for the HUD
  const { ascendant, planets, dasha, jaimini, transits, yogas, birthProfile } = context;
  const currentHierarchy = dasha?.currentHierarchy;
  const moonPlanet = planets?.find((p) => p.name === 'Moon');
  const activeYogasCount = yogas?.filter((y) => y.present).length || 0;
  const isSadeSatiActive = transits?.sadeSati?.active || false;

  // Auto-scroll chat on message change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Load past consultations when entering history tab
  useEffect(() => {
    if (activeMode === 'history') {
      const uId = localStorage.getItem('astroworld_user_id') || 'guest';
      setLoadingHistory(true);
      fetchUserConsultationHistory(uId)
        .then((items) => setPastConsultations(items))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeMode]);

  // Handle Generating Full Consultation
  const handleGenerateConsultation = async (theme: ConsultationTheme = selectedTheme, overrideQuery?: string) => {
    setIsGenerating(true);
    setSynthesisText(null);
    stopAudio();

    try {
      const uId = localStorage.getItem('astroworld_user_id') || undefined;
      const queryToSend = overrideQuery || customInquiry || theme.sampleQuery;
      const response = await requestConsultation(context, theme.id, queryToSend, uId);

      if (response.synthesis) {
        setSynthesisText(response.synthesis);
        if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
          setSuggestedQuestions(response.suggestedQuestions);
        }
      }
    } catch (err: any) {
      console.error('Consultation failed:', err);
      setSynthesisText(
        `### 🙏 Astrological Consultation Notice\nApologies, the consultation request could not be finalized. Please ensure connectivity or try again shortly.\n*Classical Grounding*: Your ${ascendant?.sign} Lagna and ${moonPlanet?.sign || 'Moon'} Janma Rashi remain active under ${currentHierarchy?.mahadasha?.lord || 'Jupiter'} Mahadasha.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Sending a Message in Interactive Chat
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isChatLoading) return;

    const userText = textToSend.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await sendAstrologerMessage(context, userText, historyPayload);

      if (response.reply) {
        const modelMsg: ChatMessage = {
          id: `msg_${Date.now()}_m`,
          role: 'model',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: response.suggestedQuestions || [],
        };
        setChatMessages((prev) => [...prev, modelMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        text: 'Namaste 🙏. I encountered a brief cosmic interruption. Please re-ask your query and I shall consult your chart directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Audio Playback / TTS
  const handleToggleAudio = async (textToSpeak: string) => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    setAudioLoading(true);
    try {
      // First attempt Gemini 3.8 Flash Lite TTS via backend
      const res = await requestAstrologerAudio(textToSpeak, 'Fenrir');
      if (res.audioBase64) {
        const audioUrl = `data:${res.mimeType || 'audio/wav'};base64,${res.audioBase64}`;
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackWebSpeech(textToSpeak);
        await audio.play();
        setIsPlayingAudio(true);
        setAudioLoading(false);
        return;
      }
    } catch {
      // Graceful fallback to browser speech synthesis
      fallbackWebSpeech(textToSpeak);
    } finally {
      setAudioLoading(false);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`>]/g, '').slice(0, 500);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.92;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Copy to Clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Switch to Chat with Pre-filled Question
  const handleAskInChat = (questionText: string) => {
    setActiveMode('chat');
    handleSendMessage(questionText);
  };

  return (
    <div className="space-y-6">
      {/* 1. Grand Vedic Astrologer Sanctum Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#121B38] via-[#1E2958] to-[#121B38] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        {/* Subtle Sacred Mandala Background */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 font-serif tracking-wider">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                CANONICAL JYOTISH DARBAR
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                <CheckCircle2 size={11} /> BPHS &amp; Jaimini Grounded
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-tight">
              Acharya Vidyadhar
            </h1>
            <p className="text-sm text-slate-300 font-serif italic">
              Venerable Vedic Astrologer • Senior Authority in Parashari Hora &amp; Jaimini Sutras
            </p>
            <p className="text-xs text-slate-300/90 leading-relaxed pt-1">
              Welcome, <strong className="text-amber-300 font-serif">{birthProfile?.name}</strong>. Here you receive sacred, individualized astrological counsel grounded in verified astronomical ephemeris, 16 Shodashavarga divisions, Vimshottari Dasha windows, and authentic Vedic Upayas.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveMode('consultation');
                stopAudio();
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                activeMode === 'consultation'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold ring-2 ring-amber-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              <Compass size={14} />
              <span>Theme Consultations</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('chat');
                stopAudio();
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                activeMode === 'chat'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold ring-2 ring-amber-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
              }`}
            >
              <MessageSquare size={14} />
              <span>Live Dialogue (Ask Q&amp;A)</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('history');
                stopAudio();
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeMode === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold ring-2 ring-amber-400/50'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
              }`}
            >
              <Bookmark size={13} />
              <span>Saved Consultations</span>
            </button>
          </div>
        </div>

        {/* Real-Time Astrological HUD Strips */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Lagna (Ascendant)</span>
            <span className="font-bold text-white font-serif">{ascendant?.sign}</span>
            <span className="text-[10px] text-slate-400 block font-mono">{ascendant?.formattedDegree}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Janma Rashi (Moon)</span>
            <span className="font-bold text-white font-serif">{moonPlanet?.sign || 'Moon'}</span>
            <span className="text-[10px] text-slate-400 block font-mono">{moonPlanet?.nakshatra} P{moonPlanet?.pada}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Active Dasha</span>
            <span className="font-bold text-amber-200">
              {currentHierarchy?.mahadasha?.lord} - {currentHierarchy?.antardasha?.subLord}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              till {currentHierarchy?.antardasha?.endDateIso?.slice(0, 10)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Atmakaraka (Soul)</span>
            <span className="font-bold text-white font-serif">{jaimini?.atmakaraka || 'Jupiter'}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Nav: {jaimini?.karakamsaNavamshaSign}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Active Yogas</span>
            <span className="font-bold text-emerald-300">{activeYogasCount} Verified Yogas</span>
            <span className="text-[10px] text-slate-400 block">Brihat Parashara</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-amber-300/80 font-serif uppercase tracking-wider block">Sade Sati</span>
            <span className={`font-bold ${isSadeSatiActive ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSadeSatiActive ? transits?.sadeSati?.phase || 'Active' : 'Not Active'}
            </span>
            <span className="text-[10px] text-slate-400 block">Saturn Gochara</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: THEMED DEEP CONSULTATIONS */}
      {/* ========================================================================= */}
      {activeMode === 'consultation' && (
        <div className="space-y-6">
          {/* Theme Selection Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#162058] flex items-center gap-2">
                  <Compass className="text-orange-500 w-5 h-5" />
                  Select Consultation Domain
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a specialized consultation track or type your exact query below for Acharya Vidyadhar.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto font-medium">
                {CONSULTATION_THEMES.length} Classical Tracks Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {CONSULTATION_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setCustomInquiry('');
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 shadow-md ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-[#FAF7F2] hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${theme.color} shadow-xs`}
                        >
                          <IconComponent size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-orange-600 transition-colors">
                          {theme.badge}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xs text-[#162058] group-hover:text-orange-600 transition-colors leading-snug">
                        {theme.title}
                      </h3>
                      <div className="text-[10px] text-amber-700/80 font-serif italic mb-1.5">
                        {theme.sanskrit}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-orange-600">
                      <span>{isSelected ? '✓ Selected Track' : 'Select Track'}</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Question Input for the Selected Theme */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customInquiry}
                  onChange={(e) => setCustomInquiry(e.target.value)}
                  placeholder={`Custom question for ${selectedTheme.title} (optional)...`}
                  className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#162058] placeholder:text-slate-400 focus:outline-none transition-all"
                />
              </div>

              <button
                onClick={() => handleGenerateConsultation(selectedTheme)}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
                <span>{isGenerating ? 'Consulting Acharya...' : `Generate ${selectedTheme.title}`}</span>
              </button>
            </div>
          </div>

          {/* Loading Animation Card */}
          {isGenerating && (
            <div className="bg-white border border-amber-300 rounded-3xl p-10 shadow-md text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg animate-spin">
                <Compass size={28} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#162058]">
                Acharya Vidyadhar is examining your Janma Kundli...
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                Harmonizing your {ascendant?.sign} Lagna, {moonPlanet?.sign} Janma Rashi, active {currentHierarchy?.mahadasha?.lord} Mahadasha, D9 Navamsha dignity, and {activeYogasCount} classical yogas...
              </p>
            </div>
          )}

          {/* Rendered Comprehensive Astrological Consultation Reading */}
          {synthesisText && !isGenerating && (
            <div className="bg-[#FAF7F2] border-2 border-amber-300/90 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 relative print:bg-white print:border-none print:p-0">
              {/* Top Reading Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4 no-print">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#162058]">
                      Vedic Consultation: {selectedTheme.title}
                    </h3>
                    <span className="text-[11px] text-amber-800 font-serif italic">
                      Acharya Vidyadhar • Grounded Brihat Parashara Hora Shastra
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Listen to Astrologer Audio Button */}
                  <button
                    onClick={() => handleToggleAudio(synthesisText)}
                    disabled={audioLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isPlayingAudio
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white hover:bg-orange-50 border border-slate-300 text-slate-700 hover:text-orange-600'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} className="text-orange-500" />}
                    <span>{isPlayingAudio ? 'Stop Audio' : audioLoading ? 'Generating Voice...' : 'Listen (Voice)'}</span>
                  </button>

                  {/* Copy Consultation Button */}
                  <button
                    onClick={() => handleCopyText(synthesisText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-orange-50 border border-slate-300 text-slate-700 hover:text-orange-600 transition-all cursor-pointer shadow-xs"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  {/* Print / Save PDF Dossier */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-orange-50 border border-slate-300 text-slate-700 hover:text-orange-600 transition-all cursor-pointer shadow-xs"
                  >
                    <Printer size={14} />
                    <span>Print Dossier</span>
                  </button>
                </div>
              </div>

              {/* Consultation Reading Body */}
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-xs sm:text-sm whitespace-pre-wrap space-y-4">
                {synthesisText}
              </div>

              {/* Dynamic Suggested Follow-Up Prompts */}
              {suggestedQuestions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-amber-200/80 no-print">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle size={15} className="text-orange-500" />
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#162058]">
                      Recommended Follow-Up Inquiries with Acharya Vidyadhar:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskInChat(q)}
                        className="text-left p-3 rounded-xl bg-white hover:bg-orange-50 border border-amber-200 text-xs font-medium text-slate-700 hover:text-orange-900 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                      >
                        <span className="line-clamp-2">{q}</span>
                        <span className="text-orange-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          Ask →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE LIVE JYOTISH DIALOGUE (CHAT) */}
      {/* ========================================================================= */}
      {activeMode === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[700px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#162058]">
                  Personal Consultation with Acharya Vidyadhar
                </h3>
                <span className="text-xs text-slate-500">
                  Ask any specific questions regarding career, marriage, dasha windows, or remedies.
                </span>
              </div>
            </div>

            <button
              onClick={() => setChatMessages([])}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 shadow-xs">
                  <Compass size={32} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#162058]">
                    Welcome, {birthProfile?.name}. What brings you to the Astrologer today?
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Acharya Vidyadhar is consulting your <strong>{ascendant?.sign} Lagna</strong>, active <strong>{currentHierarchy?.mahadasha?.lord} Mahadasha</strong>, and <strong>D9 Navamsha</strong>. Select a sample question or type your own below:
                  </p>
                </div>

                {/* Quick starter question chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full pt-2">
                  {[
                    `When will my career see major advancement under ${currentHierarchy?.mahadasha?.lord} Mahadasha?`,
                    `What does my 7th house and D9 Navamsha reveal about my spouse?`,
                    `Which Vedic gemstone and mantra are most auspicious for my Lagna Lord?`,
                    `Am I under Sade Sati or Manglik dosha, and what are the remedies?`,
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(preset)}
                      className="text-left p-3 rounded-2xl bg-[#FAF7F2] hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs text-slate-700 hover:text-orange-950 transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="line-clamp-2">{preset}</span>
                      <span className="text-[10px] text-orange-600 font-bold block mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ask Acharya →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-none'
                      : 'bg-[#FAF7F2] border border-amber-200/90 text-slate-800 rounded-tl-none font-normal whitespace-pre-wrap'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#162058]">
                        <Compass size={13} className="text-orange-500" />
                        <span>Acharya Vidyadhar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAudio(msg.text)}
                          className="text-slate-400 hover:text-orange-600 transition p-1"
                          title="Listen to response"
                        >
                          <Volume2 size={13} />
                        </button>
                        <button
                          onClick={() => handleCopyText(msg.text)}
                          className="text-slate-400 hover:text-orange-600 transition p-1"
                          title="Copy response"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.text}

                  {/* Model Suggested Follow-ups */}
                  {msg.role === 'model' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                        Recommended Next Questions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((sq, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sq)}
                            className="text-left text-[11px] bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-900 px-2.5 py-1 rounded-xl transition cursor-pointer"
                          >
                            + {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-mono px-2">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-4 bg-[#FAF7F2] border border-amber-200 rounded-3xl rounded-tl-none text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
                  <Sparkles size={16} className="text-orange-500 animate-spin" />
                  <span>Acharya Vidyadhar is reflecting upon your planetary transits &amp; houses...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(chatInput);
            }}
            className="pt-4 border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about career, marriage timing, dasha results, remedies..."
              disabled={isChatLoading}
              className="flex-1 bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#162058] placeholder:text-slate-400 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center gap-1.5 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Ask</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: PAST CONSULTATIONS VAULT */}
      {/* ========================================================================= */}
      {activeMode === 'history' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-serif font-bold text-base text-[#162058] flex items-center gap-2">
              <Bookmark className="text-orange-500 w-5 h-5" />
              Your Saved Astrological Consultations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisit previous readings and guidance provided by Acharya Vidyadhar.
            </p>
          </div>

          {loadingHistory && (
            <div className="py-12 text-center text-xs text-slate-400">
              <Sparkles size={24} className="mx-auto text-orange-400 animate-spin mb-2" />
              Loading your previous consultations...
            </div>
          )}

          {!loadingHistory && pastConsultations.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Compass size={36} className="mx-auto text-slate-300" />
              <p className="font-serif font-bold text-sm text-[#162058]">No saved consultations yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate your first themed consultation above to preserve your readings in your personal Jyotish dossier.
              </p>
              <button
                onClick={() => setActiveMode('consultation')}
                className="mt-3 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Generate Reading Now →
              </button>
            </div>
          )}

          {!loadingHistory && pastConsultations.length > 0 && (
            <div className="space-y-4">
              {pastConsultations.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF7F2] border border-amber-200/80 rounded-2xl p-5 space-y-3 hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase font-serif">
                      {item.domain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#162058]">
                    {item.query}
                  </h4>

                  <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {item.synthesis}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSynthesisText(item.synthesis);
                        setActiveMode('consultation');
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer"
                    >
                      Open Full Reading →
                    </button>
                    <button
                      onClick={() => handleCopyText(item.synthesis)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
