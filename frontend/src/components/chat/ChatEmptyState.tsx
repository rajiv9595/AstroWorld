/**
 * ASTROWORLD AI V2 — Chat Empty State Component
 * Categorized astrological query suggestions, contextual birth details banner,
 * and conversational starting points.
 */

import React from 'react';
import {
  Briefcase,
  Heart,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  Compass,
  Edit2,
} from 'lucide-react';
import { BirthProfile } from '../../engine/types.ts';

interface ChatEmptyStateProps {
  birthProfile: BirthProfile;
  onSelectPrompt: (promptText: string) => void;
  onOpenProfileModal?: () => void;
}

interface PromptCategory {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    title: 'Career & Professional Path',
    icon: Briefcase,
    prompts: [
      'How does Jupiter affect my career?',
      'When is my strongest career period?',
      'What does my D10 say about my professional path?',
      'How does the upcoming transit of Jupiter support my promotion timing?',
    ],
  },
  {
    title: 'Marriage & Relationships',
    icon: Heart,
    prompts: [
      'When is marriage timing stronger according to my dasha?',
      'Analyze marriage using D1, D9 and dasha cycles.',
      'What does Venus in my chart indicate about relational harmony?',
    ],
  },
  {
    title: 'Timing, Transits & Dasha',
    icon: Calendar,
    prompts: [
      'How does my current dasha affect career momentum?',
      'What does 2027 look like for my career trajectory?',
      'What mindset is most helpful during Saturn Sade Sati?',
    ],
  },
  {
    title: 'Chart Foundations & Yogas',
    icon: Layers,
    prompts: [
      "What is my Moon sign and Lagna?",
      'What is my D10 Lagna and 10th house placement?',
      'What are the primary active yogas in my chart?',
      'I have Gajakesari Yoga, right?',
    ],
  },
];

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  birthProfile,
  onSelectPrompt,
  onOpenProfileModal,
}) => {
  const formattedDob = `${birthProfile.day} ${new Date(birthProfile.year, birthProfile.month - 1).toLocaleString('default', { month: 'short' })} ${birthProfile.year}`;
  const formattedTime = `${String(birthProfile.hour).padStart(2, '0')}:${String(birthProfile.minute).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Astrologer Welcome Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#162058] to-[#2a3c9e] text-amber-300 shadow-md mb-3.5">
          <Sparkles size={26} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#162058] tracking-tight mb-2">
          AstroWorld Vedic Consultation
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Ask questions grounded in classical Jyotish, verified planetary ephemeris calculations, and active dasha cycles.
        </p>

        {/* Birth Profile Context Strip */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF7F2] border border-amber-900/15 rounded-xl text-xs text-slate-700 shadow-sm">
          <Compass size={13} className="text-amber-800 shrink-0" />
          <span className="font-medium text-slate-900">{birthProfile.name}</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span>{formattedDob} at {formattedTime}</span>
          {birthProfile.timezone && (
            <>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-600">{birthProfile.timezone}</span>
            </>
          )}
          {onOpenProfileModal && (
            <button
              type="button"
              onClick={onOpenProfileModal}
              title="Edit birth chart details"
              className="ml-1 p-1 hover:bg-amber-900/10 text-amber-800 hover:text-amber-950 rounded transition-colors cursor-pointer"
            >
              <Edit2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMPT_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.title}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm font-sans">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Icon size={14} />
                </div>
                <span>{cat.title}</span>
              </div>

              <div className="space-y-1.5">
                {cat.prompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onSelectPrompt(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200/60 text-xs sm:text-sm text-slate-700 hover:text-[#162058] transition-all cursor-pointer leading-snug group flex items-start justify-between gap-2"
                  >
                    <span>{prompt}</span>
                    <span className="text-slate-300 group-hover:text-amber-700 font-serif shrink-0">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
