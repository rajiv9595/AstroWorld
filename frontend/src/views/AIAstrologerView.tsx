/**
 * ASTROWORLD — AIAstrologerView (Phase 1 Placeholder)
 * Clean isolated boundary placeholder for AstroWorld AI V2.
 */

import React from 'react';
import { Sparkles, Cpu, Clock } from 'lucide-react';
import { AIInterpretationContext } from '../engine/types.ts';

interface AIAstrologerViewProps {
  context?: AIInterpretationContext;
}

export const AIAstrologerView: React.FC<AIAstrologerViewProps> = () => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-xl w-full text-center bg-white border border-amber-200/80 rounded-3xl p-8 sm:p-12 shadow-lg space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/25">
          <Sparkles size={32} className="animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-500/20 font-mono">
          <Cpu size={13} /> Clean Foundation
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#162058] tracking-tight">
          AstroWorld AI V2
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          The next-generation Vedic Astrologer AI is being rebuilt on a verified deterministic architecture.
        </p>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-center justify-center gap-2 font-medium">
          <Clock size={15} className="text-orange-500 shrink-0" />
          <span>Coming online in Phase 2</span>
        </div>
      </div>
    </div>
  );
};
