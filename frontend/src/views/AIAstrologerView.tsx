/**
 * ASTROWORLD AI V2 — Production Chat Experience (Phase 7A)
 * Authoritative production consultation interface connecting to AI V2 canonical endpoints.
 * Features:
 * - Real Vedic astrology consultation experience (answer-first, grounded, respectful)
 * - Continuous multi-turn dialogue with dasha/transit context
 * - Side conversation thread management & search
 * - User-facing memory inspector & deletion controls ("What AstroWorld remembers")
 * - Natural memory commands support ("Remember that...", "Forget that")
 * - Controlled birth profile editor modal with strict validation
 * - Bounded retry UX with idempotency preservation (no duplicate turns)
 * - Zero technical leakage (no claim IDs, rule IDs, trace IDs, confidence scores)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Compass,
  Brain,
  Menu,
  RotateCcw,
  RefreshCw,
  Plus,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

import {
  aiApiClient,
  ClientConsultResponse,
  ClientApiError,
  UserMemoryItem,
  ConversationSummary,
} from '../services/aiV2ApiClient.ts';

import { BirthProfile, AIInterpretationContext } from '../engine/types.ts';
import { DEFAULT_BIRTH_PROFILE } from '../engine/canonicalChart.ts';

import { ChatMessage, ChatMessageItem } from '../components/chat/ChatMessageItem.tsx';
import { ChatComposer } from '../components/chat/ChatComposer.tsx';
import { ChatEmptyState } from '../components/chat/ChatEmptyState.tsx';
import { ChatSidebar } from '../components/chat/ChatSidebar.tsx';
import { MemoryModal } from '../components/chat/MemoryModal.tsx';
import { BirthProfileEditorModal } from '../components/chat/BirthProfileEditorModal.tsx';

interface AIAstrologerViewProps {
  context?: AIInterpretationContext;
}

export const AIAstrologerView: React.FC<AIAstrologerViewProps> = ({ context }) => {
  // 1. Birth Profile Context
  const [profile, setProfile] = useState<BirthProfile>(() => {
    return context?.birthProfile || DEFAULT_BIRTH_PROFILE;
  });

  useEffect(() => {
    if (context?.birthProfile) {
      setProfile(context.birthProfile);
    }
  }, [context?.birthProfile]);

  // 2. Active Session & Conversation State
  const [conversationId, setConversationId] = useState<string>(() => {
    const saved = localStorage.getItem('astroworld_active_conv_id');
    return saved || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`astroworld_messages_${conversationId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [composerText, setComposerText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetryingTurnId, setIsRetryingTurnId] = useState<string | null>(null);

  // 3. Memory Subsystem State
  const [memories, setMemories] = useState<UserMemoryItem[]>([]);
  const [memorySummary, setMemorySummary] = useState<string>('');
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 4. Abort Controller Ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist current conversation ID and turns to localStorage
  useEffect(() => {
    localStorage.setItem('astroworld_active_conv_id', conversationId);
  }, [conversationId]);

  useEffect(() => {
    try {
      localStorage.setItem(`astroworld_messages_${conversationId}`, JSON.stringify(messages));
    } catch {
      // Storage quota safety
    }
  }, [conversationId, messages]);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [conversationId, scrollToBottom]);

  // Refresh user conversations & memories on mount and after actions
  const refreshUserData = useCallback(async () => {
    try {
      const [mems, sum, convs] = await Promise.all([
        aiApiClient.listMemories().catch(() => []),
        aiApiClient.getMemorySummary().catch(() => ''),
        aiApiClient.listConversations().catch(() => []),
      ]);
      setMemories(mems);
      setMemorySummary(sum);
      setConversations(convs);
    } catch {
      // Graceful background sync
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Start a fresh new consultation
  const handleNewConversation = useCallback(() => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setConversationId(newId);
    setMessages([]);
    setComposerText('');
    setIsLoading(false);
  }, []);

  // Switch to an existing conversation
  const handleSelectConversation = useCallback((targetConvId: string) => {
    setConversationId(targetConvId);
    try {
      const saved = localStorage.getItem(`astroworld_messages_${targetConvId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, []);

  // Delete a conversation thread
  const handleDeleteConversation = useCallback(async (targetConvId: string) => {
    await aiApiClient.deleteConversation(targetConvId).catch(() => {});
    localStorage.removeItem(`astroworld_messages_${targetConvId}`);
    setConversations(prev => prev.filter(c => c.conversationId !== targetConvId));

    if (conversationId === targetConvId) {
      handleNewConversation();
    }
  }, [conversationId, handleNewConversation]);

  // Send a consultation inquiry
  const handleSendMessage = async (customText?: string, existingIdempotencyKey?: string) => {
    const textToSend = (customText ?? composerText).trim();
    if (!textToSend || isLoading) return;

    const userTurnId = `msg_user_${Date.now()}`;
    const assistantTurnId = `msg_asst_${Date.now()}`;
    const idempotencyKey = existingIdempotencyKey || `idem_${conversationId}_${Date.now()}`;

    // Add user turn to the stream if not retrying existing turn
    if (!existingIdempotencyKey) {
      const userMsg: ChatMessage = {
        id: userTurnId,
        role: 'user',
        text: textToSend,
        timestamp: new Date().toISOString(),
        idempotencyKey,
      };
      setMessages(prev => [...prev, userMsg]);
      setComposerText('');
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response: ClientConsultResponse = await aiApiClient.consult(
        {
          userMessage: textToSend,
          conversationId,
          birthProfile: profile,
          idempotencyKey,
          clientTurnId: assistantTurnId,
          executionMode: 'production',
          consultationContext: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        },
        abortControllerRef.current.signal
      );

      const assistantMsg: ChatMessage = {
        id: assistantTurnId,
        role: 'assistant',
        text: response.userResponse.text,
        timestamp: response.userResponse.timestamp || new Date().toISOString(),
        domain: response.conversationMetadata?.domain,
        topic: response.conversationMetadata?.topic,
        requiresClarification: response.conversationMetadata?.requiresClarification,
        idempotencyKey,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Refresh memory & thread summaries after successful turn
      refreshUserData();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted request cleanly
        return;
      }

      const clientErr = err as ClientApiError;
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: clientErr.userMessage || 'The consultation could not be completed. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
        errorCode: clientErr.errorCode,
        isRetryable: clientErr.isRetryable ?? true,
        idempotencyKey,
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsRetryingTurnId(null);
      abortControllerRef.current = null;
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Retry a failed turn reusing the exact idempotency key
  const handleRetryTurn = (failedMessage: ChatMessage) => {
    // Find the preceding user question
    const failedIndex = messages.findIndex(m => m.id === failedMessage.id);
    let questionToRetry = '';
    for (let i = failedIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        questionToRetry = messages[i].text;
        break;
      }
    }

    if (!questionToRetry) return;

    // Remove the error turn from the stream
    setMessages(prev => prev.filter(m => m.id !== failedMessage.id));
    setIsRetryingTurnId(failedMessage.id);

    // Resend with original idempotency key
    handleSendMessage(questionToRetry, failedMessage.idempotencyKey);
  };

  // Cancel long-running request
  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Delete individual memory item
  const handleDeleteMemory = async (memoryId: string) => {
    await aiApiClient.deleteMemory(memoryId);
    setMemories(prev => prev.filter(m => m.memoryId !== memoryId));
    refreshUserData();
  };

  // Clear all memories
  const handleClearAllMemories = async () => {
    await aiApiClient.clearAllMemories();
    setMemories([]);
    setMemorySummary('');
    refreshUserData();
  };

  // Keyboard shortcut: Ctrl+N / Cmd+N for new consultation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewConversation]);

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-[600px] bg-white text-slate-800 antialiased overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        memoryCount={memories.length}
        birthProfile={profile}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Consultation Panel */}
      <div className="flex-1 flex flex-col h-full bg-white min-w-0 overflow-hidden">
        {/* Panel Header */}
        <header className="px-4 sm:px-6 py-3 border-b border-slate-200/90 flex items-center justify-between bg-white/90 backdrop-blur-xs z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer"
              aria-label="Open consultations drawer"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-serif font-bold text-[#162058] truncate">
                  Astrological Consultation
                </h1>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                  {profile.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                Grounded in classical Jyotish, verified ephemeris, and dasha cycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Memory Quick Trigger */}
            <button
              type="button"
              onClick={() => setIsMemoryModalOpen(true)}
              title="View remembered context"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl text-xs font-medium text-amber-900 transition-colors cursor-pointer"
            >
              <Brain size={13} className="text-amber-700" />
              <span>{memories.length} facts</span>
            </button>

            {/* Birth Profile Trigger */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              title="Edit birth chart details"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <Compass size={13} className="text-[#162058]" />
              <span className="hidden md:inline">Birth Chart</span>
            </button>

            {/* New Consultation Button */}
            <button
              type="button"
              onClick={handleNewConversation}
              title="Start fresh consultation (Ctrl+N)"
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        {/* 3. Messages Stream & Conversation Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {messages.length === 0 ? (
            <ChatEmptyState
              birthProfile={profile}
              onSelectPrompt={p => handleSendMessage(p)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  onRetry={handleRetryTurn}
                  isRetrying={isRetryingTurnId === msg.id}
                />
              ))}

              {/* Consultation Preparing / Loading State */}
              {isLoading && (
                <div className="flex justify-start mb-6 animate-pulse">
                  <div className="max-w-2xl w-full flex gap-3 sm:gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles size={15} className="animate-spin" />
                    </div>
                    <div className="bg-[#FAF7F2] border border-amber-900/15 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-slate-700 text-xs sm:text-sm font-sans flex items-center gap-2.5">
                      <Loader2 size={15} className="animate-spin text-amber-700 shrink-0" />
                      <span>Synthesizing chart placements, dasha cycles, and planetary transits...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 4. Bottom Message Composer */}
        <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white/95 backdrop-blur-xs shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatComposer
              value={composerText}
              onChange={setComposerText}
              onSubmit={() => handleSendMessage()}
              onAbort={handleAbort}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* 5. Modals */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={memories}
        memorySummary={memorySummary}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
      />

      <BirthProfileEditorModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profile}
        onSave={updated => setProfile(updated)}
      />
    </div>
  );
};
