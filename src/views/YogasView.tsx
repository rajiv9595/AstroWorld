/**
 * ASTROWORLD — View 7: Yogas & Doshas Engine
 * Provenance-grounded classical combinations with BPHS chapter & verse citations.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Zap, ShieldAlert, Award, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

interface YogasViewProps {
  context: AIInterpretationContext;
}

export const YogasView: React.FC<YogasViewProps> = ({ context }) => {
  const { yogas, doshas } = context;
  const [filter, setFilter] = useState<'ALL' | 'MAHAPURUSHA' | 'RAJA' | 'DHANA'>('ALL');

  const presentYogas = yogas.filter((y) => y.present);
  const filteredYogas = presentYogas.filter((y) => {
    if (filter === 'ALL') return true;
    return y.category === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Zap className="text-orange-500 w-6 h-6" />
            Yogas &amp; Doshas — Classical Planetary Combinations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic evaluation of Pancha Mahapurusha, Raja, Dhana, and Kuja Dosha with classical Sanskrit citations.
          </p>
        </div>

        {/* Filter */}
        <div className="flex bg-[#FAF7F2] border border-slate-200 rounded-xl p-1 text-xs">
          {(['ALL', 'MAHAPURUSHA', 'RAJA', 'DHANA'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#162058]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Yogas Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
          <Award size={15} /> Canonical Yogas Present in Chart ({presentYogas.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredYogas.map((y) => (
            <div
              key={y.id}
              className="bg-white border border-amber-200/80 hover:border-orange-400 hover:shadow-md rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#162058]">{y.name}</h4>
                    <span className="text-[10px] font-mono text-orange-700 font-semibold uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block mt-0.5">
                      {y.category}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {y.bphsReference}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {y.effects}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>Participating: <strong className="text-slate-700">{y.formingPlanets.join(', ')}</strong></span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Present
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doshas Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
          <ShieldAlert size={15} /> Classical Dosha Diagnoses &amp; Mitigation Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doshas.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#162058]">{d.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Severity: {d.severity}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    d.present
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {d.present ? 'Present' : 'Not Present'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>

              {d.mitigatingFactors.length > 0 && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">
                    Mitigating Classical Factors:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {d.mitigatingFactors.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
