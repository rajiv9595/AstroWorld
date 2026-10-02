/**
 * ASTROWORLD — Minimal Unified Header & Navigation Bar
 * Exactly mirrors user reference image 2:
 * [HOME]  [ABOUT]  [SERVICES]  [BLOG]  [LOGIN]  [CHAT NOW]
 */

import React from 'react';
import { Sun, MessageCircle, Phone, Mail, User, LogOut } from 'lucide-react';
import { BirthProfile } from '../engine/types.ts';

export type ProductTab =
  | 'home'
  | 'about'
  | 'services'
  | 'blog'
  | 'auth'
  | 'overview'
  | 'vargas'
  | 'planets'
  | 'panchanga'
  | 'dasha'
  | 'strength'
  | 'yogas'
  | 'jaimini'
  | 'ashtakavarga'
  | 'transits'
  | 'predictions'
  | 'report'
  | 'ai'
  | 'research';

interface AstroWorldHeaderProps {
  activeTab: ProductTab;
  onSelectTab: (tab: ProductTab) => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
  onOpenChat: () => void;
}

export const AstroWorldHeader: React.FC<AstroWorldHeaderProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenChat,
}) => {
  return (
    <header className="w-full sticky top-0 z-50 shadow-xs bg-white">
      {/* Top Navy Contact Bar */}
      <div className="bg-[#141b41] text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-amber-400" />
            <span>Talk to Developer: </span>
            <a href="tel:+919614346666" className="text-white font-medium hover:text-amber-300">
              +91 9614346666
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-amber-400" />
              <a href="mailto:info@astroworld.com" className="hover:text-slate-200">
                info@astroworld.com
              </a>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span>Follow us on</span>
              <span className="hover:text-amber-400 cursor-pointer font-bold">FB</span>
              <span className="hover:text-amber-400 cursor-pointer font-bold">In</span>
              <span className="hover:text-amber-400 cursor-pointer font-bold">Tw</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Clean White Navigation Bar — Exactly Matching User's Image 2 */}
      <div className="py-4 px-4 sm:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Sun size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="font-serif font-black text-xl tracking-tight text-[#162058] group-hover:text-orange-500 transition-colors">
                AstroWorld
              </div>
              <div className="text-[9px] tracking-widest uppercase font-bold text-amber-600">
                VEDIC WISDOM
              </div>
            </div>
          </div>

          {/* Simple, Neat Nav Links: HOME, ABOUT, SERVICES, BLOG, LOGIN, CHAT NOW */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm uppercase font-bold tracking-wider text-[#162058]">
              <button
                onClick={() => onSelectTab('home')}
                className={`hover:text-orange-500 transition-colors ${
                  activeTab === 'home' ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5' : ''
                }`}
              >
                HOME
              </button>

              <button
                onClick={() => onSelectTab('about')}
                className={`hover:text-orange-500 transition-colors ${
                  activeTab === 'about' ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5' : ''
                }`}
              >
                ABOUT
              </button>

              <button
                onClick={() => onSelectTab('services')}
                className={`hover:text-orange-500 transition-colors ${
                  activeTab === 'services' ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5' : ''
                }`}
              >
                SERVICES
              </button>

              <button
                onClick={() => onSelectTab('blog')}
                className={`hover:text-orange-500 transition-colors ${
                  activeTab === 'blog' ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5' : ''
                }`}
              >
                BLOG
              </button>

              {/* Login or User Profile / Logout */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 normal-case font-semibold text-xs flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                    <User size={12} /> {currentUser.name}
                  </span>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-red-500 text-xs transition-colors flex items-center gap-0.5"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectTab('auth')}
                  className={`hover:text-orange-500 transition-colors font-bold ${
                    activeTab === 'auth' ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5' : 'text-[#162058]'
                  }`}
                >
                  LOGIN
                </button>
              )}
            </nav>

            {/* Vibrant Orange Pill Button: CHAT NOW */}
            <button
              onClick={onOpenChat}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <MessageCircle size={14} />
              <span>CHAT NOW</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
