/**
 * ASTROWORLD — View 5: Vimshottari Dasha Engine & Timeline Explorer
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 * Includes visual Mahadasha, Antardasha, and Pratyantardasha progress bars.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Clock, ChevronRight, ChevronDown, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface DashaViewProps {
  context: AIInterpretationContext;
}

export const DashaView: React.FC<DashaViewProps> = ({ context }) => {
  const { dasha, birthProfile } = context;
  const [expandedMd, setExpandedMd] = useState<string>(dasha.currentHierarchy.mahadasha.lord);
  const [expandedAd, setExpandedAd] = useState<string | null>(
    `${dasha.currentHierarchy.mahadasha.lord}/${dasha.currentHierarchy.antardasha.subLord}`
  );

  const curHierarchy = dasha.currentHierarchy;

  // Real-time or evaluation timestamp
  const nowMs = Date.now();

  // 1. Mahadasha Progress
  const mdStartMs = new Date(curHierarchy.mahadasha.startDateIso).getTime();
  const mdEndMs = new Date(curHierarchy.mahadasha.endDateIso).getTime();
  const mdTotalMs = Math.max(1, mdEndMs - mdStartMs);
  const mdElapsedMs = Math.max(0, Math.min(mdTotalMs, nowMs - mdStartMs));
  const mdRemainingMs = Math.max(0, mdEndMs - nowMs);
  const mdProgressPercent = Math.min(100, Math.max(0, (mdElapsedMs / mdTotalMs) * 100));

  // 2. Antardasha Progress
  const adStartMs = new Date(curHierarchy.antardasha.startDateIso).getTime();
  const adEndMs = new Date(curHierarchy.antardasha.endDateIso).getTime();
  const adTotalMs = Math.max(1, adEndMs - adStartMs);
  const adElapsedMs = Math.max(0, Math.min(adTotalMs, nowMs - adStartMs));
  const adRemainingMs = Math.max(0, adEndMs - nowMs);
  const adProgressPercent = Math.min(100, Math.max(0, (adElapsedMs / adTotalMs) * 100));

  // 3. Pratyantardasha Progress
  const pdStartMs = new Date(curHierarchy.pratyantardasha.startDateIso).getTime();
  const pdEndMs = new Date(curHierarchy.pratyantardasha.endDateIso).getTime();
  const pdTotalMs = Math.max(1, pdEndMs - pdStartMs);
  const pdElapsedMs = Math.max(0, Math.min(pdTotalMs, nowMs - pdStartMs));
  const pdProgressPercent = Math.min(100, Math.max(0, (pdElapsedMs / pdTotalMs) * 100));

  // Format millisecond duration into "Xy Ym Zd"
  const formatTimeSpan = (ms: number): string => {
    if (ms <= 0) return '0d';
    const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365.25);
    const remDaysAfterYears = totalDays - Math.floor(years * 365.25);
    const months = Math.floor(remDaysAfterYears / 30.4375);
    const days = Math.floor(remDaysAfterYears - Math.floor(months * 30.4375));

    const parts: string[] = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    parts.push(`${days}d`);
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Clock className="text-orange-500 w-6 h-6" />
            Vimshottari Dasha — 120-Year Parashari Planetary Cycle
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Exact nakshatra-based birth balance and 3-tier hierarchical timeline (Mahadasha, Antardasha, Pratyantardasha).
          </p>
        </div>
      </div>

      {/* Top Banner: Natal Balance + Currently Active Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Natal Balance at Birth */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Natal Balance at Birth
            </div>
            <div className="text-xl font-bold font-serif text-[#162058]">
              {dasha.balanceAtBirth.rulingLord} Mahadasha
            </div>
            <div className="text-sm font-mono text-amber-700 font-bold mt-2 bg-amber-50 p-2 rounded-xl border border-amber-200 inline-block">
              {dasha.balanceAtBirth.balanceYears} Years ({dasha.balanceAtBirth.balanceMonths}m {dasha.balanceAtBirth.balanceDays}d)
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Remaining fraction of {context.planets.find((p) => p.name === 'Moon')?.nakshatra} nakshatra at birth timestamp.
          </p>
        </div>

        {/* Currently Active Hierarchy */}
        <div className="md:col-span-2 bg-white border border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Currently Active Period
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#FAF7F2] border border-amber-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Mahadasha</span>
                <span className="text-lg font-bold font-serif text-[#162058]">{curHierarchy.mahadasha.lord}</span>
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                  {curHierarchy.mahadasha.durationYears} Years
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-amber-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Antardasha</span>
                <span className="text-lg font-bold font-serif text-[#162058]">{curHierarchy.antardasha.subLord}</span>
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                  {curHierarchy.antardasha.startDateIso.slice(0, 10)} to {curHierarchy.antardasha.endDateIso.slice(0, 10)}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-amber-200 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Pratyantar</span>
                <span className="text-lg font-bold font-serif text-[#162058]">{curHierarchy.pratyantardasha.pratyantarLord}</span>
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                  {curHierarchy.pratyantardasha.startDateIso.slice(0, 10)} to {curHierarchy.pratyantardasha.endDateIso.slice(0, 10)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Active Window: <strong className="text-[#162058]">{curHierarchy.mahadasha.lord} / {curHierarchy.antardasha.subLord} / {curHierarchy.pratyantardasha.pratyantarLord}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar Section: Live Progression Through Current Mahadasha & Antardasha */}
      <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-orange-500 w-5 h-5" />
            <h3 className="font-serif font-bold text-[#162058] text-base">
              Current Dasha Progression Tracker (Birth-Anchored)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-slate-200">
            Birth: {birthProfile.day}/{birthProfile.month}/{birthProfile.year} • Evaluation: {new Date(nowMs).toLocaleDateString()}
          </div>
        </div>

        {/* 1. Mahadasha Progress Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-bold font-mono text-[10px]">
                MAHADASHA
              </span>
              <span className="font-bold text-[#162058] text-sm font-serif">
                {curHierarchy.mahadasha.lord} ({curHierarchy.mahadasha.durationYears} Years Total)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {mdProgressPercent.toFixed(1)}% Completed
              </span>
              <span className="text-slate-500">
                Elapsed: <strong className="text-slate-700">{formatTimeSpan(mdElapsedMs)}</strong>
              </span>
              <span className="text-slate-500">
                Remaining: <strong className="text-amber-700">{formatTimeSpan(mdRemainingMs)}</strong>
              </span>
            </div>
          </div>

          {/* Visual Progress Track */}
          <div className="relative w-full h-4 bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-sm transition-all duration-500 relative"
              style={{ width: `${mdProgressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full shadow" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Started: {new Date(curHierarchy.mahadasha.startDateIso).toLocaleDateString()}</span>
            <span>Ends: {new Date(curHierarchy.mahadasha.endDateIso).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 2. Antardasha Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-bold font-mono text-[10px]">
                ANTARDASHA
              </span>
              <span className="font-bold text-[#162058] text-sm font-serif">
                {curHierarchy.mahadasha.lord} / {curHierarchy.antardasha.subLord} ({curHierarchy.antardasha.durationYears.toFixed(2)} Years)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {adProgressPercent.toFixed(1)}% Completed
              </span>
              <span className="text-slate-500">
                Elapsed: <strong className="text-slate-700">{formatTimeSpan(adElapsedMs)}</strong>
              </span>
              <span className="text-slate-500">
                Remaining: <strong className="text-teal-700">{formatTimeSpan(adRemainingMs)}</strong>
              </span>
            </div>
          </div>

          {/* Visual Progress Track */}
          <div className="relative w-full h-3.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 shadow-sm transition-all duration-500 relative"
              style={{ width: `${adProgressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Started: {new Date(curHierarchy.antardasha.startDateIso).toLocaleDateString()}</span>
            <span>Ends: {new Date(curHierarchy.antardasha.endDateIso).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 3. Pratyantardasha Micro-Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 font-mono text-[9px] font-bold">
                PRATYANTAR
              </span>
              <span className="font-semibold text-slate-700">
                {curHierarchy.pratyantardasha.path}
              </span>
            </div>
            <div className="font-mono text-[10px] text-purple-700 font-bold">
              {pdProgressPercent.toFixed(1)}% (Active: {new Date(curHierarchy.pratyantardasha.startDateIso).toLocaleDateString()} to {new Date(curHierarchy.pratyantardasha.endDateIso).toLocaleDateString()})
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full border border-slate-200 overflow-hidden p-0.2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${pdProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Complete Vimshottari Tree Explorer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-[#162058] text-base mb-4 flex items-center gap-2">
          <span>Complete 9 Mahadasha Sequence (120-Year Timeline)</span>
        </h3>

        <div className="space-y-3">
          {dasha.mahadashas.map((mdItem) => {
            const md = mdItem.period;
            const isMdOpen = expandedMd === md.lord;
            const isMdActive = md.activeNow;

            return (
              <div
                key={md.lord}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isMdActive
                    ? 'border-orange-400 bg-orange-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Mahadasha Row Header */}
                <div
                  onClick={() => setExpandedMd(isMdOpen ? '' : md.lord)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-orange-500">
                      {isMdOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div>
                      <span className="font-bold text-sm text-[#162058] font-serif mr-2">
                        {md.lord} Mahadasha
                      </span>
                      {isMdActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
                          Active Now
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span>
                      {new Date(md.startDateIso).toLocaleDateString()} — {new Date(md.endDateIso).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">({md.durationYears} yrs)</span>
                  </div>
                </div>

                {/* Expanded Antardashas List */}
                {isMdOpen && (
                  <div className="p-3 pt-0 border-t border-slate-100 bg-[#FAF7F2] space-y-2 mt-1">
                    {mdItem.antardashas.map((adItem) => {
                      const ad = adItem.period;
                      const isAdOpen = expandedAd === ad.path;
                      const isAdActive = ad.activeNow;

                      return (
                        <div
                          key={ad.path}
                          className={`rounded-lg border text-xs ${
                            isAdActive
                              ? 'border-orange-400 bg-white shadow-xs'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div
                            onClick={() => setExpandedAd(isAdOpen ? null : ad.path)}
                            className="p-2.5 flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {isAdOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                              <span className="font-semibold text-[#162058]">
                                {ad.lord} / {ad.subLord}
                              </span>
                              {isAdActive && (
                                <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded border border-orange-200">
                                  Current AD
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-slate-500 text-[11px]">
                              {new Date(ad.startDateIso).toLocaleDateString()} — {new Date(ad.endDateIso).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Expanded Pratyantardashas */}
                          {isAdOpen && (
                            <div className="p-2 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-1 border-t border-slate-100">
                              {adItem.pratyantardashas.map((pd) => (
                                <div
                                  key={pd.path}
                                  className={`p-2 rounded border text-[11px] font-mono ${
                                    pd.activeNow
                                      ? 'border-orange-400 bg-orange-50 text-orange-900 font-bold'
                                      : 'border-slate-200 bg-[#FAF7F2] text-slate-600'
                                  }`}
                                >
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{pd.path}</span>
                                    {pd.activeNow && <CheckCircle2 size={12} className="text-emerald-600" />}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {new Date(pd.startDateIso).toLocaleDateString()} — {new Date(pd.endDateIso).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
