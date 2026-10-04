/**
 * ASTROWORLD AI V2 — Chat Message Item Component
 * Renders user and astrological consultation messages with clean typography,
 * zero-pill metadata discipline, and copy/retry controls.
 */

import React, { useState } from 'react';
import { Copy, Check, RefreshCw, AlertCircle, Sparkles, User } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  domain?: string;
  topic?: string;
  requiresClarification?: boolean;
  isError?: boolean;
  errorCode?: string;
  isRetryable?: boolean;
  idempotencyKey?: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (message: ChatMessage) => void;
  isRetrying?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-2xl w-full flex gap-3 justify-end items-start">
          <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
            <div className="bg-[#162058] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {message.text}
              </p>
            </div>
            <span className="text-[11px] text-slate-600 mt-1 mr-1">
              {formattedTime}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-inner">
            <User size={15} />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-2xl w-full flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
            <AlertCircle size={16} />
          </div>
          <div className="flex-1 bg-red-50/90 border border-red-200 rounded-2xl rounded-tl-sm p-4 text-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-red-700">
              <span>Consultation Notice</span>
            </div>
            <p className="text-sm text-red-900 leading-relaxed mb-3">
              {message.text}
            </p>
            {message.isRetryable && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message)}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Retrying inquiry...' : 'Try again'}</span>
              </button>
            )}
            <div className="text-[11px] text-slate-600 mt-2">
              {formattedTime}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split text by double newlines into readable paragraphs
  const paragraphs = message.text.split(/\n\n+/).filter(p => p.trim().length > 0);

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-3xl w-full flex gap-3 sm:gap-4 items-start">
        {/* Astrologer Icon */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-center shrink-0 shadow-md">
          <Sparkles size={15} />
        </div>

        {/* Message Bubble Container */}
        <div className="flex-1 bg-[#FAF7F2] border border-amber-900/15 rounded-2xl rounded-tl-sm p-4 sm:p-6 shadow-sm">
          {/* Content Stream */}
          <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed font-serif">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>

          {/* Footer Metadata & Actions (Zero-Pill Discipline) */}
          <div className="mt-4 pt-3 border-t border-amber-900/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-sans">
            <div className="flex items-center gap-2">
              <span>{formattedTime}</span>
              {message.domain && message.domain !== 'general' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{message.domain}</span>
                </>
              )}
              {message.requiresClarification && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-800 font-medium">Clarification needed</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy consultation response"
                className="p-1.5 hover:bg-amber-900/10 text-slate-700 hover:text-slate-900 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-700" />
                    <span className="text-emerald-800 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
