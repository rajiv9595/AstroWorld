/**
 * ASTROWORLD — View 1: Overview & D1 Birth Chart
 * Clean ivory, white, and royal navy aesthetic matching AstroWorld design.
 */

import React from 'react';
import { ChartRenderer } from '../components/ChartRenderer.tsx';
import { AIInterpretationContext, PlanetName } from '../engine/types.ts';
import { SANSKRIT_PLANET_NAMES, SANSKRIT_SIGNS } from '../engine/constants.ts';
import { Compass, Info, Award, Zap, ShieldAlert, Sparkles, Moon, Sun } from 'lucide-react';

interface OverviewViewProps {
  context: AIInterpretationContext;
  chartStyle: 'NORTH_INDIAN' | 'SOUTH_INDIAN';
  onSelectPlanet?: (planet: PlanetName) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  context,
  chartStyle,
  onSelectPlanet,
}) => {
  const { ascendant, planets, houses, dasha, panchanga, birthProfile } = context;

  const getDignityBadge = (dignity: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      EXALTED: { bg: 'bg-emerald-50 text-emerald-800', text: '', border: 'border-emerald-300' },
      MOOLATRIKONA: { bg: 'bg-cyan-50 text-cyan-800', text: '', border: 'border-cyan-300' },
      OWN_SIGN: { bg: 'bg-blue-50 text-blue-800', text: '', border: 'border-blue-300' },
      FRIEND: { bg: 'bg-purple-50 text-purple-800', text: '', border: 'border-purple-300' },
      NEUTRAL: { bg: 'bg-slate-100 text-slate-700', text: '', border: 'border-slate-200' },
      ENEMY: { bg: 'bg-amber-50 text-amber-800', text: '', border: 'border-amber-300' },
      DEBILITATED: { bg: 'bg-red-50 text-red-800', text: '', border: 'border-red-300' },
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Compass className="text-orange-500 w-6 h-6" />
            Vedic Birth Chart (D1 Rashi Kundli)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Canonical planetary longitudes, whole sign Bhavas, and nakshatra pada placements.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          {birthProfile.name} • {birthProfile.day}/{birthProfile.month}/{birthProfile.year} {birthProfile.hour}:{String(birthProfile.minute).padStart(2, '0')}
        </div>
      </div>

      {/* Top Banner: Ascendant & Core Anchor Facts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Lagna Card */}
        <div className="bg-white border border-amber-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">
            <Compass size={14} /> LAGNA / ASCENDANT (D1)
          </div>
          <div className="text-2xl font-bold font-serif text-[#162058]">{ascendant.sign}</div>
          <div className="text-xs text-slate-500 mt-0.5">{SANSKRIT_SIGNS[ascendant.sign]}</div>
          <div className="text-xs font-mono text-amber-700 mt-3 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
            {ascendant.formattedDegree} • {ascendant.nakshatra} (Pada {ascendant.pada})
          </div>
        </div>

        {/* Moon Sign */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Moon size={14} className="text-indigo-600" /> JANMA RASHI (MOON)
          </div>
          {(() => {
            const moon = planets.find((p) => p.name === 'Moon')!;
            return (
              <>
                <div className="text-2xl font-bold font-serif text-[#162058]">{moon.sign}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {moon.formattedDegree} • {moon.nakshatra} (Pada {moon.pada})
                </div>
              </>
            );
          })()}
          <div className="text-xs text-indigo-700 mt-3 font-semibold bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
            Tithi: {panchanga.tithi.name.split(' ')[0]} ({panchanga.tithi.paksha})
          </div>
        </div>

        {/* Sun Sign */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Sun size={14} className="text-amber-500" /> SURYA RASHI (SUN)
          </div>
          {(() => {
            const sun = planets.find((p) => p.name === 'Sun')!;
            return (
              <>
                <div className="text-2xl font-bold font-serif text-[#162058] flex items-center justify-between">
                  <span>{sun.sign}</span>
                  {getDignityBadge(sun.dignity)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {sun.formattedDegree} • {sun.nakshatra} (Pada {sun.pada})
                </div>
              </>
            );
          })()}
          <div className="text-xs text-amber-700 mt-3 font-semibold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
            Lahiri Ayanamsha: {panchanga.ayanamsa.formatted}
          </div>
        </div>

        {/* Active Dasha */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} className="text-orange-500" /> ACTIVE VIMSHOTTARI
          </div>
          <div className="text-xl font-bold font-serif text-[#162058]">
            {dasha.currentHierarchy.mahadasha.lord} / {dasha.currentHierarchy.antardasha.subLord}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Pratyantar: <strong className="text-orange-600">{dasha.currentHierarchy.pratyantardasha.pratyantarLord}</strong>
          </div>
          <div className="text-[11px] text-emerald-700 mt-3 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
            Window ends: {new Date(dasha.currentHierarchy.antardasha.endDateIso).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Grid: Chart SVG + Planetary Positions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart Visualizer */}
        <div className="lg:col-span-5 bg-white border border-amber-200/70 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="text-sm font-bold font-serif text-[#162058]">
              {chartStyle === 'NORTH_INDIAN' ? 'North Indian Diamond' : 'South Indian Grid'}
            </div>
            <span className="text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
              Whole Sign System
            </span>
          </div>

          <ChartRenderer
            ascendantSignIndex={ascendant.signIndex}
            planets={planets}
            style={chartStyle}
            onPlanetClick={onSelectPlanet}
          />

          <div className="w-full mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Click any planet glyph for full dossier</span>
            <span className="font-mono text-amber-700 font-bold">Lagna: {ascendant.sign}</span>
          </div>
        </div>

        {/* Right: Full 9 Planetary Positions Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-base text-[#162058]">
                Graha Sphutas (Exact Planetary Coordinates)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                IAU Standard Lahiri
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                    <th className="py-2.5 px-3">Graha</th>
                    <th className="py-2.5 px-3">Sign</th>
                    <th className="py-2.5 px-3">Degree</th>
                    <th className="py-2.5 px-3">Nakshatra</th>
                    <th className="py-2.5 px-3 text-center">House</th>
                    <th className="py-2.5 px-3 text-center">Dignity</th>
                    <th className="py-2.5 px-3 text-center">Motion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {planets.map((p) => {
                    const isCombust = p.combust;
                    const isRetro = p.retrograde;

                    return (
                      <tr
                        key={p.name}
                        onClick={() => onSelectPlanet?.(p.name)}
                        className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-3 font-semibold text-[#162058] flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({SANSKRIT_PLANET_NAMES[p.name]})
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-700">{p.sign}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p.formattedDegree}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {p.nakshatra} <span className="text-[10px] text-slate-400 font-mono">P{p.pada}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-amber-700">H{p.houseNumber}</td>
                        <td className="py-2 px-3 text-center">{getDignityBadge(p.dignity)}</td>
                        <td className="py-2 px-3 text-center font-mono text-[11px]">
                          {isRetro && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                              ® Retro
                            </span>
                          )}
                          {isCombust && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-300">
                              Combust
                            </span>
                          )}
                          {!isRetro && !isCombust && <span className="text-slate-400">Direct</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 12 Bhavas (Houses) Cards Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-lg text-[#162058] mb-4 flex items-center gap-2">
          <span>12 Bhavas (Whole Sign Houses &amp; Significations)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {houses.map((h) => {
            const hPlanets = planets.filter((p) => p.houseNumber === h.houseNumber);

            return (
              <div
                key={h.houseNumber}
                className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2] hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#162058] mb-1">
                  <span>House {h.houseNumber}</span>
                  <span className="text-amber-700 font-mono text-[11px]">{h.sign}</span>
                </div>
                <div className="text-[11px] text-slate-500 mb-2 font-medium">
                  Lord: <strong className="text-slate-700">{h.lord}</strong>
                </div>

                <div className="text-[11px] text-slate-600 line-clamp-2 mb-2 italic">
                  {h.significance}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1">
                  {hPlanets.length > 0 ? (
                    hPlanets.map((p) => (
                      <span
                        key={p.name}
                        onClick={() => onSelectPlanet?.(p.name)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-orange-600 border border-orange-200 cursor-pointer shadow-xs hover:bg-orange-50"
                      >
                        {p.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No resident planets</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
