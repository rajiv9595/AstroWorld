/**
 * ASTROWORLD — View 6: Planetary & Bhava Strength (Shadbala, Bhava Bala, Avasthas)
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Shield, BarChart3, Activity, Award, CheckCircle } from 'lucide-react';

interface StrengthViewProps {
  context: AIInterpretationContext;
}

export const StrengthView: React.FC<StrengthViewProps> = ({ context }) => {
  const { strength, planets, ascendant } = context;
  const [activeTab, setActiveTab] = useState<'SHADBALA' | 'BHAVA_BALA' | 'AVASTHAS'>('SHADBALA');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Shield className="text-orange-500 w-6 h-6" />
            Bala — Planetary &amp; House Potency Systems
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Classical Parashari six-fold Shadbala (Virupas &amp; Rupas), Bhava Bala, and Avastha classifications.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex bg-[#FAF7F2] border border-slate-200 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('SHADBALA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'SHADBALA'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-[#162058]'
            }`}
          >
            Shadbala (6-Fold)
          </button>
          <button
            onClick={() => setActiveTab('BHAVA_BALA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'BHAVA_BALA'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-[#162058]'
            }`}
          >
            Bhava Bala (12 Houses)
          </button>
          <button
            onClick={() => setActiveTab('AVASTHAS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'AVASTHAS'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-[#162058]'
            }`}
          >
            Avasthas &amp; Nature
          </button>
        </div>
      </div>

      {activeTab === 'SHADBALA' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#162058]">
                Shadbala Breakdown (6 Virupa Sources)
              </h3>
              <p className="text-xs text-slate-500">
                Sthana (Positional), Dig (Directional), Kala (Temporal), Chesta (Motional), Naisargika (Natural), Drik (Aspectual).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                  <th className="py-2.5 px-3">Planet</th>
                  <th className="py-2.5 px-3 text-right">Sthana</th>
                  <th className="py-2.5 px-3 text-right">Dig</th>
                  <th className="py-2.5 px-3 text-right">Kala</th>
                  <th className="py-2.5 px-3 text-right">Chesta</th>
                  <th className="py-2.5 px-3 text-right">Naisargika</th>
                  <th className="py-2.5 px-3 text-right">Drik</th>
                  <th className="py-2.5 px-3 text-right">Total Virupas</th>
                  <th className="py-2.5 px-3 text-right">Rupas</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {strength.shadbala.map((s) => (
                  <tr key={s.planet} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#162058]">{s.planet}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.sthanaBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.digBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.kalaBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.chestaBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.naisargikaBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.drikBala.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                      {s.totalVirupas.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#162058]">
                      {s.totalRupas.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.verdict === 'STRONG'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {s.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BHAVA_BALA' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-base text-[#162058] mb-4">
            Bhava Bala — 12 House Potency Rankings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {strength.bhavaBala.map((b) => (
              <div
                key={b.houseNumber}
                className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2] hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#162058] mb-1">
                  <span>House {b.houseNumber} ({b.sign})</span>
                  <span className="text-amber-800 font-mono text-sm">Rank #{b.rank}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  Lord: <strong className="text-slate-700">{b.lord}</strong>
                </div>
                <div className="text-lg font-bold font-mono text-[#162058]">
                  {b.totalVirupas.toFixed(1)} Virupas
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ({b.totalRupas.toFixed(2)} Rupas)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'AVASTHAS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#162058] mb-3">
              Baladi &amp; Deeptadi Avasthas (State of Consciousness &amp; Dignity)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strength.avasthas.map((a) => (
                <div
                  key={a.planet}
                  className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-[#162058]">{a.planet}</span>
                    <span className="text-xs font-serif font-bold text-orange-600">
                      {a.baladi} ({a.deeptadi})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Functional Nature: <strong className="text-[#162058]">{a.functionalNature}</strong> • Jagradadi: {a.jagradadi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-serif font-bold text-base text-[#162058] mb-3">
              Functional Benefic vs Malefic Status for {ascendant.sign} Lagna
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <span className="font-bold text-emerald-900 block mb-2 uppercase tracking-wide">
                  Functional Benefics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {strength.avasthas
                    .filter((f) => f.functionalNature === 'Benefic')
                    .map((f) => (
                      <span
                        key={f.planet}
                        className="px-2 py-1 rounded bg-white text-emerald-800 font-bold border border-emerald-200 shadow-xs"
                      >
                        {f.planet}
                      </span>
                    ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/60">
                <span className="font-bold text-red-900 block mb-2 uppercase tracking-wide">
                  Functional Malefics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {strength.avasthas
                    .filter((f) => f.functionalNature === 'Malefic')
                    .map((f) => (
                      <span
                        key={f.planet}
                        className="px-2 py-1 rounded bg-white text-red-800 font-bold border border-red-200 shadow-xs"
                      >
                        {f.planet}
                      </span>
                    ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-300 bg-slate-100/60">
                <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wide">
                  Neutral / Yogakaraka
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {strength.avasthas
                    .filter((f) => f.functionalNature === 'Neutral' || f.functionalNature === 'Yogakaraka')
                    .map((f) => (
                      <span
                        key={f.planet}
                        className="px-2 py-1 rounded bg-white text-slate-800 font-bold border border-slate-300 shadow-xs"
                      >
                        {f.planet} ({f.functionalNature})
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
