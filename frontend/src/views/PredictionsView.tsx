/**
 * ASTROWORLD — View 11: Predictions & Timing Windows
 * Strict semantic taxonomy: EXACT vs EVENT_WINDOW vs UNKNOWN.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { TrendingUp, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PredictionsViewProps {
  context: AIInterpretationContext;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ context }) => {
  const { timingSignals } = context;

  const getPrecisionBadge = (prec: string) => {
    switch (prec) {
      case 'EXACT':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            EXACT TIMESTAMP
          </span>
        );
      case 'EVENT_WINDOW':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
            BOUNDED EVENT WINDOW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            UNKNOWN / INSUFFICIENT EVIDENCE
          </span>
        );
    }
  };

  const getConfluenceBadge = (basis: string) => {
    switch (basis) {
      case 'CONVERGENT':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
            CONVERGENT (Multi-System)
          </span>
        );
      case 'DIRECT':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
            DIRECT RULE
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
            SUPPORTED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {basis}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <TrendingUp className="text-orange-500 w-6 h-6" />
            Predictive Timing Windows &amp; Confluence Signals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Parashari timing taxonomy: Every prediction is bounded by active Vimshottari windows and Gochara transit ingress.
          </p>
        </div>
      </div>

      {/* Epistemological Rule Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed">
        <strong>Vedic Jyotish Epistemic Boundary:</strong> The engine never fabricates arbitrary future dates or promises exact day predictions unless determined by astronomical transit conjunctions or solar ingress. Generalized life themes are strictly classified as <em>BOUNDED EVENT WINDOWS</em> with explicit confidence percentages.
      </div>

      {/* Signals Grid */}
      <div className="space-y-4">
        {timingSignals.map((signal) => (
          <div
            key={signal.id}
            className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-6 shadow-sm space-y-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {signal.domain}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#162058]">{signal.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {signal.summary}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {getPrecisionBadge(signal.precision)}
                {getConfluenceBadge(signal.confluenceBasis)}
              </div>
            </div>

            {/* Timing Window & Metrics */}
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Window Span</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {signal.windowStartIso?.slice(0, 10) || 'N/A'} to {signal.windowEndIso?.slice(0, 10) || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Confluence Basis</span>
                <span className="font-mono font-bold text-orange-600 block mt-0.5">
                  {signal.confluenceBasis}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Contributing Grahas</span>
                <span className="text-[#162058] font-bold">
                  {signal.activeFactors.join(', ')}
                </span>
              </div>
            </div>

            {/* Evidence Provenance Citations */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>Verified Evidence Citations:</span>
              <div className="flex flex-wrap gap-1">
                {signal.evidenceIds.map((eid) => (
                  <span key={eid} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    [{eid}]
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
