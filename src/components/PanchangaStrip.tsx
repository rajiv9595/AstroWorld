/**
 * ASTROWORLD / LIFEPATH — Floating Panchanga Strip
 * Live real-time daily astronomical limbs directly overlapping the hero section.
 */

import React from 'react';
import { PanchangaFacts } from '../engine/types.ts';
import { Calendar, Sun, Moon, Compass, Sparkles } from 'lucide-react';

interface PanchangaStripProps {
  panchanga: PanchangaFacts;
  onExplorePanchanga: () => void;
}

export const PanchangaStrip: React.FC<PanchangaStripProps> = ({
  panchanga,
  onExplorePanchanga,
}) => {
  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-8 sm:-mt-10">
      <div
        onClick={onExplorePanchanga}
        className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 p-5 sm:p-6 cursor-pointer hover:border-amber-400/80 transition-all hover:shadow-2xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Tithi */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              TITHI
            </span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#162058]">
              {panchanga.tithi.name.split(' ')[0]}
            </span>
            <span className="text-xs text-orange-600 font-semibold mt-0.5">
              {panchanga.tithi.paksha} Paksha ({panchanga.tithi.completedPercent}% passed)
            </span>
          </div>

          {/* Nakshatra */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              NAKSHATRA
            </span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#162058]">
              {panchanga.nakshatra.name}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Lord: <strong className="text-slate-700">{panchanga.nakshatra.lord}</strong> • Pada {panchanga.nakshatra.pada}
            </span>
          </div>

          {/* Yoga */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              YOGA
            </span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#162058]">
              {panchanga.yoga.name.split(' ')[0]}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Nithya Yoga #{panchanga.yoga.number} of 27
            </span>
          </div>

          {/* Vara / Ayanamsha */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              VARA &amp; AYANAMSHA
            </span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#162058]">
              {panchanga.vara.name.split(' ')[0]}
            </span>
            <span className="text-xs text-amber-600 font-mono font-semibold mt-0.5">
              Lahiri: {panchanga.ayanamsa.formatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
