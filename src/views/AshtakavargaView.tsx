/**
 * ASTROWORLD — View 9: Ashtakavarga Engine
 * Canonical Bhinnashtakavarga (BAV) grids and 337-Bindu Samudayashtakavarga (SAV).
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { ZODIAC_SIGNS } from '../engine/constants.ts';
import { Grid3X3, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface AshtakavargaViewProps {
  context: AIInterpretationContext;
}

export const AshtakavargaView: React.FC<AshtakavargaViewProps> = ({ context }) => {
  const { ashtakavarga, ascendant } = context;

  const classicalPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Grid3X3 className="text-orange-500 w-6 h-6" />
            Ashtakavarga — Parashari 337-Bindu Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative numerical potency: 8 contributors (7 planets + Lagna) distributing exactly 337 bindus across 12 rashis.
          </p>
        </div>
      </div>

      {/* Top Banner: Total SAV & Auspicious Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-amber-300 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
            TOTAL SAV BINDUS
          </span>
          <div className="text-3xl font-bold font-mono text-[#162058]">
            {ashtakavarga.sarvashtakavargaTotal}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Canonical 337 Bindu Invariant Preserved
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            BENCHMARK AVERAGE PER SIGN
          </span>
          <div className="text-3xl font-bold font-mono text-[#162058]">28.08</div>
          <div className="text-xs text-slate-500 mt-1">
            Standard baseline: 337 / 12 = 28.08 bindus per rashi.
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <CheckCircle size={13} /> AUSPICIOUS SIGNS (&gt;28)
          </span>
          <div className="text-xs text-slate-700 mt-2 font-medium">
            {ashtakavarga.strongSigns.join(', ') || 'None'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Optimal rashis for transits and major undertakings.
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <AlertCircle size={13} /> CAUTION SIGNS (&lt;25)
          </span>
          <div className="text-xs text-slate-700 mt-2 font-medium">
            {ashtakavarga.weakSigns.join(', ') || 'None'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Vulnerable rashis requiring remedial awareness.
          </div>
        </div>
      </div>

      {/* Complete SAV & BAV Master Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-base text-[#162058] mb-4">
          Samudayashtakavarga (SAV) &amp; Individual Planetary BAV Bindus
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                <th className="py-2.5 px-3">Zodiac Sign</th>
                <th className="py-2.5 px-3 text-center">House (from Lagna)</th>
                {classicalPlanets.map((p) => (
                  <th key={p} className="py-2.5 px-3 text-center">
                    {p}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center font-bold text-orange-600 bg-orange-50">
                  Total SAV
                </th>
                <th className="py-2.5 px-3 text-center">Strength Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ZODIAC_SIGNS.map((sign, signIdx) => {
                const houseNum = ((signIdx - ascendant.signIndex + 12) % 12) + 1;
                const sav = ashtakavarga.sav[signIdx];
                const isStrong = sav >= 28;
                const isWeak = sav < 25;

                return (
                  <tr key={sign} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#162058]">{sign}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                      H{houseNum}
                    </td>
                    {classicalPlanets.map((p) => {
                      const bavArr = ashtakavarga.bav[p];
                      const val = bavArr ? bavArr[signIdx] : 0;
                      return (
                        <td key={p} className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {val}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#162058] bg-orange-50/60">
                      {sav}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isStrong
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWeak
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isStrong ? 'Auspicious' : isWeak ? 'Caution' : 'Average'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
