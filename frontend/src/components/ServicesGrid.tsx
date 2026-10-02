/**
 * ASTROWORLD — Our Services Grid
 * Clean white cards with gold/amber rounded circular icons, directly linking to each backend engine.
 * Gated by authentication.
 */

import React from 'react';
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
} from 'lucide-react';
import { ProductTab } from './AstroWorldHeader.tsx';

interface ServicesGridProps {
  onSelectService: (tab: ProductTab) => void;
  isLoggedIn: boolean;
  onRequireAuth: (tab: ProductTab) => void;
}

interface ServiceItem {
  tab: ProductTab;
  title: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  tag?: string;
}

const SERVICES: ServiceItem[] = [
  {
    tab: 'overview',
    title: 'Charts',
    description: 'View your detailed birth charts (D1 Rashi, D9 Navamsha, D10 Dashamsha).',
    icon: Compass,
  },
  {
    tab: 'planets',
    title: 'Planets',
    description: 'Detailed planetary positions, speeds, combustion, and degrees.',
    icon: Orbit,
  },
  {
    tab: 'dasha',
    title: 'Dasha Timeline',
    description: 'Track your current and future life periods with the visual progress bar.',
    icon: Clock,
  },
  {
    tab: 'yogas',
    title: 'Yogas & Doshas',
    description: 'Discover special planetary combinations, Mahapurusha, and Kuja Dosha.',
    icon: Star,
  },
  {
    tab: 'overview',
    title: 'Your Info',
    description: 'Your personal birth details, whole sign house structure, and settings.',
    icon: User,
  },
  {
    tab: 'ashtakavarga',
    title: 'Ashtakavarga',
    description: 'Parashari 337-bindu matrix, strong vs caution houses, and BAV.',
    icon: Grid3X3,
  },
  {
    tab: 'ai',
    title: 'AI Astrologer',
    description: 'Chat with our grounded AI astrologer for instant classical insights.',
    icon: Bot,
    tag: 'POPULAR',
  },
  {
    tab: 'research',
    title: 'AI Guru & Tests',
    description: 'Ephemeris inspector, automated golden test suite, and raw facts API.',
    icon: BookOpen,
  },
  {
    tab: 'strength',
    title: 'Shadbala & Strengths',
    description: 'Six-fold planetary potency, Bhava Bala rankings, and Avasthas.',
    icon: Shield,
  },
  {
    tab: 'jaimini',
    title: 'Jaimini Karakas',
    description: '7 Chara Karakas (AK to DK), Karakamsa, and Arudha Lagna.',
    icon: Heart,
  },
  {
    tab: 'transits',
    title: 'Gochara Transits',
    description: 'Real-time planetary transits, Sade Sati tracker, and Parashari aspects.',
    icon: Orbit,
  },
  {
    tab: 'predictions',
    title: 'Timing Windows',
    description: 'Evidence-based bounded event windows without date fabrication.',
    icon: TrendingUp,
  },
];

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onSelectService,
  isLoggedIn,
  onRequireAuth,
}) => {
  const handleClick = (tab: ProductTab) => {
    if (!isLoggedIn) {
      onRequireAuth(tab);
    } else {
      onSelectService(tab);
    }
  };

  return (
    <section id="services-section" className="py-24 px-6 sm:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#162058] mb-3">
            Our Services
          </h2>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Explore our comprehensive suite of Vedic astrology tools designed to guide you through life's journey.
          </p>
        </div>

        {/* 4-Column Grid of Neat White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                onClick={() => handleClick(s.tab)}
                className="group p-8 rounded-2xl bg-[#FDFCFB] border border-amber-200/60 hover:border-orange-400/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center cursor-pointer relative"
              >
                {/* Gold Top Accent Line */}
                <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>

                {s.tag && (
                  <span className="absolute top-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                    {s.tag}
                  </span>
                )}

                {/* Circular Golden-Amber Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-[#FAF3E8] text-orange-500 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Icon size={26} />
                </div>

                <h3 className="text-lg font-serif font-bold text-[#162058] mb-2 group-hover:text-orange-600 transition-colors">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                  {s.description}
                </p>

                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-14 text-center">
          <button
            onClick={() => handleClick('overview')}
            className="px-10 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            VIEW ALL SERVICES &amp; FULL KUNDLI
          </button>
        </div>
      </div>
    </section>
  );
};
