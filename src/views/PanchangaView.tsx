/**
 * ASTROWORLD — View 4: Panchanga (The Five Limbs of Vedic Time)
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { Calendar, Sun, Moon, Sparkles, Clock, Globe } from 'lucide-react';

interface PanchangaViewProps {
  context: AIInterpretationContext;
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ context }) => {
  const { panchanga, planets, birthProfile } = context;
  const sun = planets.find((p) => p.name === 'Sun')!;
  const moon = planets.find((p) => p.name === 'Moon')!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Calendar className="text-orange-500 w-6 h-6" />
            Panchanga — The Five Limbs of Vedic Time
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Astronomical time markers governing vital life energy, physical constitution, and auspicious rhythm.
          </p>
        </div>
      </div>

      {/* The 5 Primary Limbs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* 1. Tithi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
              1. TITHI (तिथी)
            </div>
            <div className="text-base font-bold font-serif text-[#162058]">{panchanga.tithi.name}</div>
            <div className="text-xs font-semibold text-amber-700 mt-1">
              {panchanga.tithi.paksha} Paksha (Tithi {panchanga.tithi.number})
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Elongation Passed</span>
              <span className="font-mono font-bold text-slate-700">{panchanga.tithi.completedPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${panchanga.tithi.completedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Vara */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
              2. VARA (वार)
            </div>
            <div className="text-base font-bold font-serif text-[#162058]">{panchanga.vara.name}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Governing Planet: <strong className="text-amber-700">{panchanga.vara.rulingPlanet}</strong>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Weekday order of planetary hours (Horas).
          </div>
        </div>

        {/* 3. Nakshatra */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
              3. NAKSHATRA (नक्षत्र)
            </div>
            <div className="text-base font-bold font-serif text-[#162058]">{panchanga.nakshatra.name}</div>
            <div className="text-xs font-semibold text-indigo-700 mt-1">
              Lord: {panchanga.nakshatra.lord} • Pada {panchanga.nakshatra.pada}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Moon's lunar mansion.
          </div>
        </div>

        {/* 4. Yoga */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
              4. YOGA (योग)
            </div>
            <div className="text-base font-bold font-serif text-[#162058]">{panchanga.yoga.name}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Nithya Yoga #{panchanga.yoga.number} of 27
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Combined solar-lunar longitude.
          </div>
        </div>

        {/* 5. Karana */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
              5. KARANA (करण)
            </div>
            <div className="text-base font-bold font-serif text-[#162058]">{panchanga.karana.name}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Half-Tithi #{panchanga.karana.number} of 60
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Action and event execution rhythm.
          </div>
        </div>
      </div>

      {/* Ephemeris & Ayanamsha Details */}
      <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-base text-[#162058] mb-3">
          Astronomical Standards &amp; Geocentric Coordinates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ayanamsha Model</span>
            <span className="font-bold text-[#162058] text-sm">Chitra Paksha (IAU Lahiri)</span>
            <span className="text-orange-600 block mt-1">{panchanga.ayanamsa.formatted}</span>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sun Tropical vs Sidereal</span>
            <span className="text-slate-700 block">Trop: {sun.tropicalLongitude.toFixed(4)}°</span>
            <span className="text-[#162058] font-bold block mt-1">Sidereal: {sun.siderealLongitude.toFixed(4)}°</span>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Moon Tropical vs Sidereal</span>
            <span className="text-slate-700 block">Trop: {moon.tropicalLongitude.toFixed(4)}°</span>
            <span className="text-[#162058] font-bold block mt-1">Sidereal: {moon.siderealLongitude.toFixed(4)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
