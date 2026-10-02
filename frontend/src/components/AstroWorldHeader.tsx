/**
 * ASTROWORLD — Unified Header & Navigation Bar
 * Clean, production consumer interface with zero developer/database telemetry.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  MessageCircle,
  Phone,
  Mail,
  User,
  LogOut,
  ChevronDown,
  Bookmark,
  Sparkles,
} from 'lucide-react';

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
  currentUser: { name: string; email: string; id?: string } | null;
  onLogout: () => void;
  onOpenChat: () => void;
  savedChartsCount?: number;
}

export const AstroWorldHeader: React.FC<AstroWorldHeaderProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenChat,
  savedChartsCount = 0,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 shadow-xs bg-white">
      {/* Top Navy Contact Bar */}
      <div className="bg-[#141b41] text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-amber-400" />
            <span>Talk to Astrologer: </span>
            <a href="tel:+919614346666" className="text-white font-medium hover:text-amber-300 transition">
              +91 9614346666
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-amber-400" />
              <a href="mailto:info@astroworld.com" className="hover:text-slate-200 transition">
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

      {/* Main Navigation Bar */}
      <div className="py-3.5 px-4 sm:px-8 border-b border-slate-200/80">
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

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-7">
            <nav className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm uppercase font-bold tracking-wider text-[#162058]">
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

              <button
                onClick={() => onSelectTab('overview')}
                className={`hover:text-orange-500 transition-colors ${
                  [
                    'overview',
                    'vargas',
                    'planets',
                    'panchanga',
                    'dasha',
                    'strength',
                    'yogas',
                    'jaimini',
                    'ashtakavarga',
                    'transits',
                    'predictions',
                    'report',
                    'research',
                  ].includes(activeTab)
                    ? 'text-orange-500 font-extrabold border-b-2 border-orange-500 pb-0.5'
                    : ''
                }`}
              >
                DASHBOARD
              </button>

              <button
                onClick={() => onSelectTab('ai')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md ring-2 ring-orange-300'
                    : 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                <Sparkles size={13} className={activeTab === 'ai' ? 'animate-spin' : 'text-amber-500'} />
                <span>AI ASTROLOGER</span>
                <span className="hidden lg:inline bg-amber-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  Vedic
                </span>
              </button>

              {/* User Dropdown or Login Button */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 hover:border-orange-300 text-[#162058] px-3 py-1.5 rounded-full text-xs font-semibold normal-case transition shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[110px] truncate">{currentUser.name}</span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                      {/* User Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="font-bold text-sm text-[#162058]">{currentUser.name}</div>
                        <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      </div>

                      {/* Saved Kundlis */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSelectTab('overview');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition"
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Bookmark size={14} className="text-amber-500" />
                            My Saved Kundlis
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {savedChartsCount}
                          </span>
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
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
