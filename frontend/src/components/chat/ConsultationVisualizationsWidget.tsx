/**
 * ASTROWORLD AI V3 — In-Chat Consultation Visualizations Widget
 * Renders interactive, high-aesthetic contextual micro-widgets directly within the chat stream:
 * - Dasha Journey Flow Timeline & Progress Bar
 * - Planetary Strength (Shadbala) Potency Meters
 * - Life Timing & Opportunity Probability Gauge
 * - Ashtakavarga Energy Distribution Badges
 */

import React from 'react';
import { Clock, Zap, TrendingUp, Compass, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { ConsultationVisualizations } from '../../services/aiV2ApiClient.ts';

interface ConsultationVisualizationsWidgetProps {
  visualizations?: ConsultationVisualizations;
}

export const ConsultationVisualizationsWidget: React.FC<ConsultationVisualizationsWidgetProps> = ({
  visualizations,
}) => {
  if (!visualizations) return null;

  const { dashaTimeline, planetaryStrengths, timingProbability, ashtakavargaSummary } = visualizations;
  const hasContent = Boolean(dashaTimeline || (planetaryStrengths && planetaryStrengths.length > 0) || timingProbability || (ashtakavargaSummary && ashtakavargaSummary.length > 0));

  if (!hasContent) return null;

  return (
    <div className="my-4 space-y-3 font-sans">
      {/* 1. Dasha Timeline Flow Bar */}
      {dashaTimeline && (
        <div className="bg-gradient-to-r from-amber-900/5 via-amber-800/10 to-amber-900/5 border border-amber-900/20 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
              <Clock size={13} className="text-amber-700" />
              <span>Active Planetary Period (Vimshottari Dasha)</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-full">
              {dashaTimeline.percentElapsed}% Elapsed
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 mb-2">
            <span className="text-sm sm:text-base font-extrabold text-amber-950">
              {dashaTimeline.mahadasha} Mahadasha
            </span>
            <span className="text-xs text-amber-700 font-medium">/</span>
            <span className="text-sm sm:text-base font-bold text-amber-900">
              {dashaTimeline.antardasha} Antardasha
            </span>
            {dashaTimeline.pratyantardasha && (
              <>
                <span className="text-xs text-amber-700 font-medium">/</span>
                <span className="text-xs font-semibold text-amber-800">
                  {dashaTimeline.pratyantardasha} Pratyantar
                </span>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-amber-950/10 rounded-full h-2.5 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-700 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(4, Math.min(100, dashaTimeline.percentElapsed))}%` }}
            />
          </div>

          {/* Timeline Details */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-1 pt-1">
            <span>
              Start: {new Date(dashaTimeline.startDateIso).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
            <span className="text-amber-900 font-medium">
              {dashaTimeline.remainingYears > 0 ? `${dashaTimeline.remainingYears} yrs remaining` : 'Transitioning'}
            </span>
            <span>
              End: {new Date(dashaTimeline.endDateIso).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {dashaTimeline.nextMilestone && (
            <div className="mt-2 pt-2 border-t border-amber-900/10 flex items-center gap-1 text-[11px] text-amber-900 font-medium">
              <ChevronRight size={12} className="text-amber-700 shrink-0" />
              <span>{dashaTimeline.nextMilestone}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Planetary Strength (Shadbala) Meters */}
      {planetaryStrengths && planetaryStrengths.length > 0 && (
        <div className="bg-white/80 border border-amber-900/15 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider mb-2.5">
            <Zap size={13} className="text-amber-700" />
            <span>Key Planetary Potency (Shadbala Virupas)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {planetaryStrengths.map((p, idx) => {
              const isStrong = p.isStrong;
              const barWidth = Math.min(100, Math.round((p.ratio / 1.5) * 100));
              return (
                <div
                  key={idx}
                  className="bg-amber-50/40 border border-amber-900/10 rounded-lg p-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-950">{p.planet}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isStrong
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.ratio}x
                    </span>
                  </div>

                  {/* Virupa Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden my-1.5">
                    <div
                      className={`h-full rounded-full ${
                        isStrong
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>{p.virupas} / {p.requiredVirupas} Virupas</span>
                    <span className="font-medium text-slate-700">{p.statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Strategic Timing Probability Gauge */}
      {timingProbability && (
        <div className="bg-gradient-to-br from-white via-amber-50/50 to-white border border-amber-900/20 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
              <TrendingUp size={13} className="text-amber-700" />
              <span>{timingProbability.windowLabel}</span>
            </div>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                timingProbability.status === 'highly_favorable'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : timingProbability.status === 'supportive'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              {timingProbability.scorePercent}% Alignment
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <span className="text-xs font-semibold text-slate-800">
              Active Window: <span className="text-amber-950 font-bold">{timingProbability.periodText}</span>
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
            {timingProbability.summary}
          </p>

          {timingProbability.keyDrivers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {timingProbability.keyDrivers.map((driver, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-100/70 border border-amber-300/60 text-amber-900 px-2 py-0.5 rounded-md"
                >
                  <CheckCircle2 size={10} className="text-amber-700" />
                  <span>{driver}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Ashtakavarga Energy Badges */}
      {ashtakavargaSummary && ashtakavargaSummary.length > 0 && (
        <div className="bg-white/70 border border-amber-900/15 rounded-xl p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
            <Award size={13} className="text-amber-700" />
            <span>Ashtakavarga House Energy (Bindus)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ashtakavargaSummary.map((h, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                  h.status === 'exceptional'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                    : h.status === 'strong'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>House {h.house}:</span>
                <span className="text-amber-950 font-extrabold">{h.bindus} Bindus</span>
                <span className="text-[10px] opacity-80 uppercase">({h.status})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
