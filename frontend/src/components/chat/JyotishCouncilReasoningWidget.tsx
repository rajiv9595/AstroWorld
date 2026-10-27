/**
 * ASTROWORLD AI — Jyotish Council Reasoning Widget
 * Renders the 360° Multi-Perspective Agentic Reasoning Council breakdown.
 * Displays all 7 classical dimensions evaluated before answering:
 * 1. Parashari Shastra Council
 * 2. Jaimini Sutras Council
 * 3. Shodashavarga Harmonic Council (D9, D10, D24, D60)
 * 4. Vimshottari Progression & Planetary Maturity
 * 5. Gochara & Double Transit Confluence
 * 6. Empirical Case Studies & Shastric Precedents
 * 7. KP Cuspal Sub-Lord Decision & Remedial Upayas
 */

import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  Zap,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { AgentCouncilSynthesis, AgentCouncilDimension } from '../../services/aiV2ApiClient.ts';

interface JyotishCouncilReasoningWidgetProps {
  council: AgentCouncilSynthesis;
}

type CouncilDimensionKey =
  | 'parashari'
  | 'jaimini'
  | 'shodashavarga'
  | 'vimshottari'
  | 'gochara'
  | 'caseStudies'
  | 'prashnaRemedial';

const DIMENSION_TABS: Array<{
  key: CouncilDimensionKey;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  shortBadge: string;
}> = [
  { key: 'parashari', label: 'Parashari', icon: Layers, shortBadge: 'Bhavas & Yogas' },
  { key: 'jaimini', label: 'Jaimini', icon: Compass, shortBadge: 'Karakas' },
  { key: 'shodashavarga', label: 'Vargas', icon: Award, shortBadge: 'D9/D10/D24/D60' },
  { key: 'vimshottari', label: 'Vimshottari', icon: Clock, shortBadge: 'Dasha & Maturity' },
  { key: 'gochara', label: 'Gochara', icon: Zap, shortBadge: 'Double Transit' },
  { key: 'caseStudies', label: 'Case Studies', icon: BookOpen, shortBadge: 'Empirical RAG' },
  { key: 'prashnaRemedial', label: 'KP & Upayas', icon: ShieldCheck, shortBadge: 'Verdict & Remedies' },
];

export const JyotishCouncilReasoningWidget: React.FC<JyotishCouncilReasoningWidgetProps> = ({ council }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<CouncilDimensionKey>('parashari');

  if (!council || !council.dimensions) {
    return null;
  }

  const currentDimension: AgentCouncilDimension | undefined = council.dimensions[activeTab];

  return (
    <div className="mt-4 mb-2 rounded-xl border border-amber-900/20 bg-gradient-to-b from-[#FDFBF7] to-[#FAF6EE] shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Banner — Click to toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 hover:bg-amber-100/40 transition-colors cursor-pointer text-left select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#162058] text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
            <Compass size={14} className="animate-spin-slow" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-serif font-bold text-[#162058] tracking-tight">
              Jyotish 360° Reasoning Council
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/90 text-amber-900 border border-amber-300/60 shadow-2xs">
              <Sparkles size={10} className="text-amber-700" />
              <span>{council.dimensionsEvaluated || 7} Perspectives Synthesized</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900 shrink-0 ml-2">
          <span className="hidden sm:inline text-[11px] text-slate-700">
            {isExpanded ? 'Collapse analysis' : 'View council breakdown'}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Council Content */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 border-t border-amber-900/10">
          {/* Executive Sub-summary */}
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/50 text-[11px] sm:text-xs text-slate-800 leading-relaxed font-sans">
            <span className="font-semibold text-[#162058]">Autonomous Multi-Angle Synthesis: </span>
            {council.executiveSummary}
          </div>

          {/* Interactive Tab Navigation */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-200/80">
            {DIMENSION_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#162058] text-white shadow-sm ring-1 ring-[#162058]'
                      : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-900/10'
                  }`}
                >
                  <TabIcon size={13} className={isActive ? 'text-amber-300' : 'text-slate-600'} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.shortBadge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Dimension Details */}
          {currentDimension && (
            <div className="mt-3 rounded-lg border border-amber-900/15 bg-white p-3 sm:p-4 shadow-2xs">
              {/* Dimension Title & Shastric Tradition Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#162058] font-serif">
                    {currentDimension.name}
                  </h4>
                  <p className="text-[10px] text-amber-800 font-medium">
                    Authority: {currentDimension.tradition}
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200/60">
                  {currentDimension.badge}
                </span>
              </div>

              {/* Key Finding Banner */}
              <div className="mb-3 px-3 py-2 rounded-md bg-[#162058]/5 border-l-3 border-[#162058] text-xs text-[#162058] font-medium leading-relaxed">
                {currentDimension.keyFinding}
              </div>

              {/* Verified Evidence Bullet Points */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                  Calculated Astrological Evidence & Proofs:
                </span>
                {currentDimension.evidenceItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed font-sans">
                    <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Footer Note */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600 pt-2 border-t border-amber-900/10">
            <span>Deterministic Astronomy Engine Grounded</span>
            <span className="font-serif italic text-amber-900">Astrological Truth • Zero Hallucination</span>
          </div>
        </div>
      )}
    </div>
  );
};
