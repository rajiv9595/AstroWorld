/**
 * ASTROWORLD — About Page
 * Clean, elegant presentation of ancient Vedic astrology principles and team.
 */

import React from 'react';
import { Sun, Sparkles, BookOpen, ShieldCheck, Compass, Award, Phone, Mail, MapPin } from 'lucide-react';

interface AboutViewProps {
  onGetKundliClick: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onGetKundliClick }) => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#162058] via-[#1a286b] to-[#121a48] text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-lg">
        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={13} className="text-amber-400" />
            VEDIC WISDOM &amp; ASTRONOMICAL PRECISION
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            Bridging Ancient Wisdom <br />
            <span className="text-orange-400">with Modern Technology</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Our mission is to decode the cosmic language of the stars and translate it into clear, actionable guidance for your life's journey.
          </p>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="w-16 h-1 bg-orange-500 rounded-full mb-4"></div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#162058] mb-4">
            Our Philosophy
          </h2>
          <div className="space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
            <p>
              Vedic Astrology, or <em>Jyotish Shastra</em>, is literally the "Science of Light." For millennia, it has served as a guiding lamp for humanity, helping seekers understand their karma, life purpose, and planetary timing.
            </p>
            <p>
              In the modern age, profound astrological calculations are often obscured by black-box algorithms or sensationalist predictions. <strong>AstroWorld</strong> was created to restore absolute canonical integrity.
            </p>
            <p>
              We implement the mathematical principles of the <em>Brihat Parashara Hora Shastra (BPHS)</em> using high-precision sidereal ephemerides (Chitra Paksha Lahiri Ayanamsha), ensuring your charts and predictions remain true to classical standards.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-full p-2 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-xl overflow-hidden">
            <img
              src="/ganesha_circle.png"
              alt="Lord Ganesha Vedic Art"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
            <Compass size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-2">Canonical Accuracy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every planetary coordinate, Shodashavarga amsha, and Vimshottari period is calculated using authentic BPHS rules without modern adulteration.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-2">Grounded Reasoning</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our AI consultation strictly references verifiable astrological evidence IDs, maintaining clear epistemic boundaries and rejecting date fabrication.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-2">Educational Depth</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            From 16 divisional charts to Ashtakavarga matrices, AstroWorld empowers users to learn real Vedic astrology through transparent data.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-300 text-center space-y-4">
        <h3 className="text-2xl font-serif font-bold text-[#162058]">
          Ready to discover your astrological destiny?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Generate your complete Vedic horoscope in seconds with our high-precision astronomical engine.
        </p>
        <button
          onClick={onGetKundliClick}
          className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105"
        >
          GENERATE FREE KUNDLI
        </button>
      </div>
    </div>
  );
};
