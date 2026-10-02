/**
 * ASTROWORLD — View 10: Gochara (Transit) Engine
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { calculateTransits } from '../engine/transits.ts';
import { Orbit, Calendar, Clock, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface TransitsViewProps {
  context: AIInterpretationContext;
}

export const TransitsView: React.FC<TransitsViewProps> = ({ context }) => {
  const [transitDateStr, setTransitDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const activeTransits = calculateTransits(
    context.planets,
    context.ascendant.signIndex,
    context.ashtakavarga,
    new Date(transitDateStr)
  );

  const handleQuickPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setTransitDateStr(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Orbit className="text-orange-500 w-6 h-6" />
            Gochara — Planetary Transits &amp; Temporal Overlay
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Astronomical positions at transit moment evaluated relative to natal Lagna, natal Moon, and Parashari aspects.
          </p>
        </div>

        {/* Transit Date Controller */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleQuickPreset(0)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#162058] hover:bg-amber-100 border border-slate-200"
          >
            Today
          </button>
          <button
            onClick={() => handleQuickPreset(30)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#162058] hover:bg-amber-100 border border-slate-200"
          >
            +1 Month
          </button>
          <button
            onClick={() => handleQuickPreset(180)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#162058] hover:bg-amber-100 border border-slate-200"
          >
            +6 Months
          </button>
          <button
            onClick={() => handleQuickPreset(365)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF7F2] text-[#162058] hover:bg-amber-100 border border-slate-200"
          >
            +1 Year
          </button>
          <input
            type="date"
            value={transitDateStr}
            onChange={(e) => setTransitDateStr(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-[#162058] font-mono shadow-xs focus:border-orange-500"
          />
        </div>
      </div>

      {/* Sade Sati Tracker Banner */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {activeTransits.sadeSati.active ? (
              <AlertTriangle className="text-orange-600 w-5 h-5 flex-shrink-0" />
            ) : (
              <ShieldCheck className="text-emerald-600 w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#162058]">
                  Sade Sati Tracker (Saturn's 7.5-Year Lunar Transit)
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeTransits.sadeSati.active
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {activeTransits.sadeSati.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTransits.sadeSati.description}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 self-start sm:self-auto bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-slate-200">
            Evaluating Date: {transitDateStr}
          </div>
        </div>
      </div>

      {/* Gochara Placements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-serif font-bold text-base text-[#162058]">
            Gochara Planetary Placements &amp; Aspects onto Natal Chart
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                <th className="py-2.5 px-3">Planet</th>
                <th className="py-2.5 px-3">Transit Sign</th>
                <th className="py-2.5 px-3">Longitude</th>
                <th className="py-2.5 px-3 text-center">From Lagna</th>
                <th className="py-2.5 px-3 text-center">From Moon</th>
                <th className="py-2.5 px-3 text-center">SAV Bindus</th>
                <th className="py-2.5 px-3">Aspects on Natal Bodies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTransits.planets.map((t) => (
                <tr key={t.planet} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#162058]">{t.planet}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-800">{t.sign}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{t.formattedDegree}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-orange-600">
                    House {t.natalLagnaHouse}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    House {t.chandraLagnaHouse}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        t.ashtakavargaBindus >= 28
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t.ashtakavargaBindus} bindus
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="space-y-1">
                      {t.aspectsToNatal.map((asp, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-1 rounded bg-[#FAF7F2] border border-slate-200 text-slate-700 font-mono"
                        >
                          <strong className="text-orange-700">[{asp.type}]</strong> {asp.aspectDescription} on natal {asp.natalPlanet}
                        </div>
                      ))}
                      {t.aspectsToNatal.length === 0 && (
                        <span className="text-slate-400 italic">No exact major aspects</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
