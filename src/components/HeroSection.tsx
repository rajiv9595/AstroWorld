/**
 * ASTROWORLD / LIFEPATH — Hero Section
 * Exactly mirrors the user's reference image with Lord Ganesha in the glowing circular zodiac wheel.
 */

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetKundliClick: () => void;
  onExploreServicesClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetKundliClick,
  onExploreServicesClick,
}) => {
  return (
    <section className="bg-gradient-to-br from-[#162058] via-[#1a286b] to-[#121a48] relative overflow-hidden text-white pt-14 pb-20 px-6 sm:px-12 border-b border-amber-500/20">
      {/* Background Celestial Ambience & Orange Blur Glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500 blur-[140px] opacity-25 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600 blur-[140px] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column: Headline, Copy, Action */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={12} className="text-amber-400" />
            WELCOME TO ASTROWORLD
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
            Discover Your Cosmic <br className="hidden sm:inline" />
            <span className="text-orange-400 font-extrabold relative inline-block">
              Destiny Today
              {/* Orange decorative underline bar matching screenshot */}
              <span className="block h-1.5 w-28 bg-orange-500 rounded-full mt-2 mx-auto lg:mx-0"></span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Expert Vedic Astrology consultation and precise Kundli generation using ancient wisdom and modern technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onGetKundliClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>GET FREE KUNDLI</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExploreServicesClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              Explore All 14 Engines
            </button>
          </div>
        </div>

        {/* Right Column: Exact Circular Lord Ganesha Zodiac Art */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center">
            {/* Outer subtle glow rings */}
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-pulse"></div>
            <div className="absolute -inset-3 rounded-full border-2 border-orange-500/30 blur-sm"></div>
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-orange-500/10 via-amber-400/15 to-transparent blur-xl"></div>

            {/* Exact Lord Ganesha Circular Image from Reference */}
            <div className="relative w-full h-full rounded-full p-2.5 bg-gradient-to-tr from-amber-500/40 via-yellow-400/50 to-orange-500/40 shadow-2xl shadow-black/60 overflow-hidden group">
              <img
                src="/ganesha_circle.png"
                alt="Lord Ganesha seated in meditation within the cosmic 12-sign zodiac wheel"
                className="w-full h-full object-cover rounded-full shadow-inner transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
