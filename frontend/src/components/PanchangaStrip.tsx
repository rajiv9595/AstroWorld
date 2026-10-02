/**
 * ASTROWORLD — Floating Daily Live Panchanga Strip
 * 100% accurate live astronomical calculation computed for today (or selected date)
 * covering all 5 canonical limbs of Vedic time: Tithi, Nakshatra, Yoga, Karana, and Vara.
 */

import React from 'react';
import { PanchangaFacts } from '../engine/types.ts';
import { Sparkles, Compass, Moon, Sun, ArrowRight, Activity } from 'lucide-react';

interface PanchangaStripProps {
  panchanga: PanchangaFacts;
  onExplorePanchanga: () => void;
  date?: Date;
}

export const PanchangaStrip: React.FC<PanchangaStripProps> = ({
  panchanga,
  onExplorePanchanga,
  date = new Date(),
}) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-8 sm:-mt-10">
      <div
        onClick={onExplorePanchanga}
        className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-5 sm:p-7 cursor-pointer hover:border-orange-400 transition-all hover:shadow-2xl group"
      >
        {/* Top Live Badge Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[#162058] tracking-wider uppercase text-[11px]">
              Daily Live Panchanga &bull; {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 group-hover:text-orange-500 transition-colors">
            <span>Explore Full Panchanga</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 5 Canonical Panchanga Limbs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* 1. Tithi */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Moon size={11} className="text-amber-500" /> TITHI
            </span>
            <span className="text-base font-bold font-serif text-[#162058]">
              {panchanga.tithi.name.split(' (')[0]}
            </span>
            <span className="text-xs text-orange-600 font-semibold mt-0.5">
              {panchanga.tithi.paksha} ({panchanga.tithi.completedPercent}% passed)
            </span>
          </div>

          {/* 2. Nakshatra */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" /> NAKSHATRA
            </span>
            <span className="text-base font-bold font-serif text-[#162058]">
              {panchanga.nakshatra.name}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Lord: <strong className="text-slate-700">{panchanga.nakshatra.lord}</strong> &bull; Pada {panchanga.nakshatra.pada}
            </span>
          </div>

          {/* 3. Yoga */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Sun size={11} className="text-amber-500" /> YOGA
            </span>
            <span className="text-base font-bold font-serif text-[#162058]">
              {panchanga.yoga.name}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              Nithya Yoga #{panchanga.yoga.number} of 27
            </span>
          </div>

          {/* 4. Karana */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Activity size={11} className="text-amber-500" /> KARANA
            </span>
            <span className="text-base font-bold font-serif text-[#162058]">
              {panchanga.karana.name}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              {panchanga.karana.type === 'Sthira' ? 'Fixed Karana' : 'Movable Karana'}
            </span>
          </div>

          {/* 5. Vara & Ayanamsha */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1">
              <Compass size={11} className="text-amber-500" /> VARA &amp; LAHIRI
            </span>
            <span className="text-base font-bold font-serif text-[#162058]">
              {panchanga.vara.name}
            </span>
            <span className="text-xs text-amber-700 font-mono font-semibold mt-0.5">
              {panchanga.ayanamsa.formatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
