/**
 * ASTROWORLD AI V2 — Chat Composer Component
 * Multiline responsive query composer with keyboard submission, character limits,
 * and abort controls.
 */

import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles } from 'lucide-react';

interface ChatComposerProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onAbort?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChange,
  onSubmit,
  onAbort,
  isLoading,
  disabled = false,
  placeholder = 'Ask a question about your birth chart, career, marriage, dasha, or transits...',
  maxLength = 2000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as content expands
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim().length > 0 && !disabled) {
        onSubmit();
      }
    }
  };

  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.85;

  return (
    <div className="relative bg-white border border-slate-300 focus-within:border-[#162058] focus-within:ring-2 focus-within:ring-[#162058]/15 rounded-2xl shadow-sm transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || (isLoading && !onAbort)}
        maxLength={maxLength}
        rows={1}
        className="w-full resize-none px-4 pt-3.5 pb-10 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-h-[52px] max-h-[180px] font-sans"
        aria-label="Astrological inquiry"
      />

      <div className="absolute bottom-2.5 left-4 right-3 flex items-center justify-between pointer-events-none">
        {/* Character Count Notice */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-sans">
          {isNearLimit && (
            <span className="text-amber-600 font-medium">
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {isLoading && onAbort ? (
            <button
              type="button"
              onClick={onAbort}
              title="Stop consultation response"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Square size={12} className="fill-slate-700" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || isLoading || value.trim().length === 0}
              title="Send inquiry (Enter)"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#162058] hover:bg-[#1f2c7a] disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
              aria-label="Send message"
            >
              <Send size={14} className="translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
