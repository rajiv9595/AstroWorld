/**
 * ASTROWORLD — View 2: Vargas (16 Shodashavarga Divisional Charts)
 * Complete independent identity, charts, placements, and BPHS devata names.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { ChartRenderer } from '../components/ChartRenderer.tsx';
import { VARGA_METADATA_LIST } from '../engine/vargas.ts';
import { AIInterpretationContext, PlanetName, VargaCode } from '../engine/types.ts';
import { Layers, Sparkles, BookOpen } from 'lucide-react';

interface VargasViewProps {
  context: AIInterpretationContext;
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  onSelectPlanet?: (planet: PlanetName) => void;
}

export const VargasView: React.FC<VargasViewProps> = ({
  context,
  chartStyle,
  onSelectPlanet,
}) => {
  const [selectedVarga, setSelectedVarga] = useState<VargaCode>('D9');
  const chart = context.vargas[selectedVarga];
  const meta = VARGA_METADATA_LIST.find((m) => m.code === selectedVarga)!;

  const getDignityBadge = (dignity: string) => {
    const map: Record<string, { bg: string; border: string }> = {
      EXALTED: { bg: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-300' },
      MOOLATRIKONA: { bg: 'bg-cyan-50 text-cyan-800', border: 'border-cyan-300' },
      OWN_SIGN: { bg: 'bg-blue-50 text-blue-800', border: 'border-blue-300' },
      FRIEND: { bg: 'bg-purple-50 text-purple-800', border: 'border-purple-300' },
      NEUTRAL: { bg: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
      ENEMY: { bg: 'bg-amber-50 text-amber-800', border: 'border-amber-300' },
      DEBILITATED: { bg: 'bg-red-50 text-red-800', border: 'border-red-300' },
    };
    const c = map[dignity] || map.NEUTRAL;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.bg} ${c.border}`}>
        {dignity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Varga Selector */}
      <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-orange-500 w-5 h-5" />
            <h2 className="text-xl font-bold font-serif text-[#162058]">
              Shodashavarga — Classical 16 Divisional Charts
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            Parashari standard division without mixing varga scopes.
          </div>
        </div>

        {/* 16 Varga Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {VARGA_METADATA_LIST.map((v) => {
            const isSelected = selectedVarga === v.code;
            return (
              <button
                key={v.code}
                onClick={() => setSelectedVarga(v.code as VargaCode)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center min-w-[70px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-105'
                    : 'bg-[#FAF7F2] text-slate-700 hover:bg-amber-100/60 border border-slate-200/80'
                }`}
              >
                <span className="font-bold text-sm">{v.code}</span>
                <span className="text-[10px] opacity-80 truncate max-w-[65px]">{v.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Selected Varga Chart + Placements Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Visualizer for Selected Varga */}
        <div className="lg:col-span-5 bg-white border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center">
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-orange-600 mr-2 font-mono">
                {chart.code}
              </span>
              <span className="font-serif font-bold text-base text-[#162058]">{chart.name}</span>
            </div>
            <span className="text-xs font-mono text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {chart.ascendantSign} Lagna
            </span>
          </div>

          <ChartRenderer
            ascendantSignIndex={chart.ascendantSignIndex}
            planets={chart.planets}
            chartTitle={`${chart.code} (${chart.name})`}
            style={chartStyle}
            onPlanetClick={onSelectPlanet}
          />

          <div className="w-full mt-4 p-3 bg-[#FAF7F2] rounded-xl border border-amber-200/70 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-[#162058] mb-1">
              <BookOpen size={14} className="text-orange-500" />
              <span>Classical Scope &amp; Purpose:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">{meta.purpose}</p>
          </div>
        </div>

        {/* Right: Placements & Dignity Table for this Varga */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#162058]">
                  {chart.code} Planetary Placements &amp; Independent Dignity
                </h3>
                <p className="text-[11px] text-slate-500">
                  Notice: Dignity is calculated independently for this divisional chart ({chart.code}).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                    <th className="py-2.5 px-3">Planet</th>
                    <th className="py-2.5 px-3">D1 Source Sign</th>
                    <th className="py-2.5 px-3 font-semibold text-amber-700">
                      {chart.code} Sign
                    </th>
                    <th className="py-2.5 px-3 text-center">House</th>
                    {selectedVarga === 'D60' && <th className="py-2.5 px-3">D60 Devata</th>}
                    <th className="py-2.5 px-3 text-center">{chart.code} Dignity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chart.planets.map((p) => {
                    const d1Planet = context.planets.find((pl) => pl.name === p.planet);
                    const devata = chart.specialAmshaNames?.[p.planet];
                    return (
                      <tr
                        key={p.planet}
                        onClick={() => onSelectPlanet?.(p.planet)}
                        className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-3 font-bold text-[#162058]">{p.planet}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">
                          {p.sourceSign || d1Planet?.sign}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#162058]">{p.vargaSign}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-amber-700">
                          H{p.houseNumber}
                        </td>
                        {selectedVarga === 'D60' && (
                          <td className="py-2 px-3 text-orange-600 font-serif font-medium">
                            {devata || '—'}
                          </td>
                        )}
                        <td className="py-2 px-3 text-center">{getDignityBadge(p.dignity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* D1 vs D9 Canonical Separation Highlight */}
          {selectedVarga === 'D9' && (
            <div className="mt-6 p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <Sparkles size={14} className="text-orange-500" />
                <span>D1 vs D9 Canonical Separation Highlight</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                In classical Vedic Jyotish, D1 represents the external seed and manifestation (Prarabdha Karma),
                whereas D9 Navamsha reveals internal soul potential, spiritual fortitude, and marital harmony (Sanchita Karma).
                For example, <strong>D1 Sun in Leo</strong> is in its <em>Moolatrikona</em> sign, while in <strong>D9 Sun in Aries</strong> it achieves full <em>Exaltation</em>. These are preserved as distinct, non-overlapping astronomical facts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
