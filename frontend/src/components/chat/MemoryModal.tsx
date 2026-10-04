/**
 * ASTROWORLD AI V2 — Memory Manager Modal Component
 * User-facing memory inspection and controls ("What AstroWorld remembers"),
 * supporting per-memory deletion, clear-all, and natural language summary.
 */

import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { UserMemoryItem } from '../../services/aiV2ApiClient.ts';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: UserMemoryItem[];
  memorySummary: string;
  onDeleteMemory: (memoryId: string) => Promise<void>;
  onClearAllMemories: () => Promise<void>;
  isLoading?: boolean;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  memorySummary,
  onDeleteMemory,
  onClearAllMemories,
  isLoading = false,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDeleteMemory(id);
      setStatusNotice('Memory removed');
      setTimeout(() => setStatusNotice(null), 2500);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await onClearAllMemories();
      setIsConfirmingClear(false);
      setStatusNotice('All remembered facts cleared');
      setTimeout(() => setStatusNotice(null), 2500);
    } catch {
      // Handled
    }
  };

  const formatKeyName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#162058]">
                What AstroWorld Remembers
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Persistent astrological context and user preferences across sessions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 font-sans">
          {statusNotice && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          {/* Natural Language Memory Summary */}
          {memorySummary && (
            <div className="p-4 bg-[#FAF7F2] border border-amber-900/10 rounded-2xl space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Sparkles size={13} className="text-amber-700" />
                <span>Context Overview</span>
              </div>
              <p className="leading-relaxed font-serif text-slate-800 whitespace-pre-wrap">
                {memorySummary}
              </p>
            </div>
          )}

          {/* List of Explicit Remembered Items */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700">
              <span>Remembered Facts ({memories.length})</span>
              {memories.length > 0 && !isConfirmingClear && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer font-medium flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Clear All Confirmation Box */}
            {isConfirmingClear && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-red-800">
                  <AlertTriangle size={14} />
                  <span>Are you sure you want to clear all memories?</span>
                </div>
                <p className="text-[11px] text-red-700">
                  This will remove all stored goals, preferences, and consultation threads across sessions.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Yes, Clear Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Memory Items List */}
            {memories.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                No active memories stored yet. You can ask AstroWorld to remember specific career targets, questions, or preferences naturally during chat.
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map(mem => (
                  <div
                    key={mem.memoryId}
                    className="flex items-start justify-between p-3.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all shadow-2xs group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-[11px] font-medium text-slate-600 mb-0.5">
                        {formatKeyName(mem.key)}
                      </div>
                      <div className="text-xs sm:text-sm font-serif text-slate-900 leading-snug">
                        {mem.value}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">
                        Stored {new Date(mem.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(mem.memoryId)}
                      disabled={deletingId === mem.memoryId}
                      title="Forget this fact"
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Helpful Command Instructions */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Tip: You can instruct the astrologer in chat like <span className="font-semibold text-slate-800">"Remember that I am preparing for AI roles"</span> or <span className="font-semibold text-slate-800">"Forget that"</span> at any time.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#162058] hover:bg-[#1f2c7a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
