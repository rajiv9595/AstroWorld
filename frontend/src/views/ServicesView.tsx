/**
 * ASTROWORLD — Dedicated Services View Page
 * Comprehensive catalog of all Vedic astrology calculation engines, divisional charts,
 * predictive systems, and AI astrologer modules.
 */

import React, { useState } from 'react';
import {
  Compass,
  Orbit,
  Clock,
  Star,
  User,
  Heart,
  Bot,
  BookOpen,
  Shield,
  Grid3X3,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import { ProductTab } from '../components/AstroWorldHeader.tsx';

interface ServicesViewProps {
  onSelectService: (tab: ProductTab) => void;
  isLoggedIn: boolean;
  onRequireAuth: (tab: ProductTab) => void;
}

interface ServiceCard {
  tab: ProductTab;
  title: string;
  category: 'charts' | 'timing' | 'strength' | 'ai';
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  tag?: string;
  details: string[];
}

const ALL_SERVICES: ServiceCard[] = [
  {
    tab: 'overview',
    title: 'Kundli Birth Chart (D1)',
    category: 'charts',
    description: 'Complete high-precision sidereal birth chart utilizing IAU Lahiri ayanamsha with whole sign houses.',
    icon: Compass,
    tag: 'CORE',
    details: ['North & South Diamond Styles', 'Ascendant (Lagna) Degrees', 'House Occupants & Planetary Aspects'],
  },
  {
    tab: 'vargas',
    title: '16 Shodashavarga Divisional Charts',
    category: 'charts',
    description: 'Detailed D1 to D60 harmonic divisions including Navamsha (D9) and Dashamsha (D10).',
    icon: Layers,
    tag: 'ADVANCED',
    details: ['D9 Navamsha Marriage & Dharma', 'D10 Dashamsha Career Potency', 'D7 Saptamsha Progeny & Lineage'],
  },
  {
    tab: 'planets',
    title: 'Navagraha Planetary Archetypes',
    category: 'charts',
    description: 'Exact astronomical coordinates, nakshatra subdivisions, combustion thresholds, and Parashari dignities.',
    icon: Orbit,
    details: ['Exalted, Debilitated & Moolatrikona Status', 'Speed, Retrogression & Combustion', 'Pada & Nakshatra Lords'],
  },
  {
    tab: 'dasha',
    title: 'Vimshottari Dasha Timeline',
    category: 'timing',
    description: '120-year chronological cosmic lifecycle mapped into Mahadashas, Antardashas, and Pratyantardashas.',
    icon: Clock,
    tag: 'POPULAR',
    details: ['Live Current Period Progress Bar', 'Sub-period Micro Timeline', 'Planetary Maturity Indicators'],
  },
  {
    tab: 'transits',
    title: 'Gochara Planetary Transits',
    category: 'timing',
    description: 'Real-time ephemeris transits projected over natal houses with Sade Sati analysis.',
    icon: Calendar,
    details: ['Live Ephemeris Calculations', 'Saturn Sade Sati Phases & Dates', 'Guru & Rahu Transit Effects'],
  },
  {
    tab: 'predictions',
    title: 'Evidence-Based Predictive Windows',
    category: 'timing',
    description: 'Multi-system convergence timing for career shifts, wealth accumulation, relationship harmony, and health.',
    icon: TrendingUp,
    details: ['Dasha + Gochara Convergence', 'Ranked Favorable Windows', '100% Classical Grounding'],
  },
  {
    tab: 'yogas',
    title: 'Classical Yogas & Doshas',
    category: 'strength',
    description: 'Automated verification of hundreds of classical combinations directly from Brihat Parashara Hora Shastra.',
    icon: Star,
    tag: 'BPHS',
    details: ['Pancha Mahapurusha Yogas', 'Raja & Dhana Yoga Formations', 'Kuja Dosha & Manglik Assessment'],
  },
  {
    tab: 'strength',
    title: 'Shadbala Six-Fold Planetary Potency',
    category: 'strength',
    description: 'Mathematical quantification of planetary strength across Sthana, Dig, Kala, Chesta, Naisargika, and Drik Bala.',
    icon: Shield,
    details: ['Virupas Potency Benchmarking', 'Bhava Bala House Strength Scores', 'Ishta vs Kashta Phala Balance'],
  },
  {
    tab: 'ashtakavarga',
    title: 'Ashtakavarga Matrix',
    category: 'strength',
    description: 'Parashari 337-bindu aggregate calculation system identifying power houses and transit activation points.',
    icon: Grid3X3,
    details: ['Sarvashtakavarga (SAV) Totals', 'Bhinnashtakavarga (BAV) Grids', 'House Strength Distribution'],
  },
  {
    tab: 'jaimini',
    title: 'Jaimini Chara Karakas',
    category: 'strength',
    description: 'Jaimini Sutras planetary rank ordering from Atmakaraka (Soul signifier) to Darakaraka (Spouse).',
    icon: Heart,
    details: ['7 Chara Karaka Designations', 'Karakamsa Navamsha Alignment', 'Arudha Lagna (AL) Manifestation'],
  },
  {
    tab: 'report',
    title: 'Executive Astrological Dossier',
    category: 'ai',
    description: 'Full comprehensive printable life dossier consolidating all charts, dignities, dashas, and yogas.',
    icon: FileText,
    details: ['Printable PDF & Hardcopy Layout', 'Structured Provenance Traceability', 'Full JSON Chart Export'],
  },
  {
    tab: 'ai',
    title: 'AI Astrologer (Grounded Vedic Intelligence)',
    category: 'ai',
    description: 'Interactive consultation powered by Gemini grounded in your exact computed canonical facts.',
    icon: Bot,
    tag: 'AI POWERED',
    details: ['Zero Hallucinations Guarantee', 'Fact -> Classical Rule -> Timing Sequence', 'Domain-specific consultations'],
  },
];

export const ServicesView: React.FC<ServicesViewProps> = ({
  onSelectService,
  isLoggedIn,
  onRequireAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleClick = (tab: ProductTab) => {
    if (!isLoggedIn) {
      onRequireAuth(tab);
    } else {
      onSelectService(tab);
    }
  };

  const filteredServices =
    selectedCategory === 'all'
      ? ALL_SERVICES
      : ALL_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <div className="py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
      {/* Page Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-orange-500" />
          <span>Vedic Astrological Computing Suite</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#162058] tracking-tight">
          Comprehensive Astrological Services
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Explore our complete suite of classical Vedic astrology calculation engines, harmonic divisional charts, planetary potency diagnostics, and grounded AI consultations.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'charts', label: 'Charts & Vargas' },
          { id: 'timing', label: 'Dasha & Transits' },
          { id: 'strength', label: 'Shadbala & Yogas' },
          { id: 'ai', label: 'Reports & AI Astrologer' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-600 hover:bg-[#FAF7F2] border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, idx) => {
          const Icon = service.icon;
          return (
            <div
              key={idx}
              onClick={() => handleClick(service.tab)}
              className="group p-7 rounded-3xl bg-white border border-slate-200 hover:border-orange-400 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Top Gold Accent */}
              <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF3E8] text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Icon size={24} />
                  </div>
                  {service.tag && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 border border-orange-200">
                      {service.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-[#162058] mb-2 group-hover:text-orange-600 transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Bullet Highlights */}
                <div className="space-y-1.5 mb-6 text-slate-600 text-xs">
                  {service.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-500">
                <span>Access Module</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
