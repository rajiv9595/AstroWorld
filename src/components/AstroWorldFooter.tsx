/**
 * ASTROWORLD — Unified Footer Component
 * Clean, standard, and professional footer matching the user reference design.
 */

import React, { useState } from 'react';
import { Sun, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { ProductTab } from './AstroWorldHeader.tsx';

interface AstroWorldFooterProps {
  onSelectTab: (tab: ProductTab | 'home') => void;
}

export const AstroWorldFooter: React.FC<AstroWorldFooterProps> = ({ onSelectTab }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 text-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand & Mission */}
        <div>
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 mb-5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Sun size={18} />
            </div>
            <span className="text-2xl font-serif font-bold text-[#162058] group-hover:text-orange-500 transition-colors">
              AstroWorld
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your trusted guide for Vedic Astrology services. Contact us for in-depth analysis, precise Kundli generation, and canonical Parashari remedies.
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-sm font-bold font-serif text-[#162058] mb-4 uppercase tracking-wider">
            Useful Links
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>
              <button
                onClick={() => onSelectTab('home')}
                className="hover:text-orange-500 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('overview')}
                className="hover:text-orange-500 transition-colors"
              >
                Birth Chart (D1)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('vargas')}
                className="hover:text-orange-500 transition-colors"
              >
                Shodashavargas (D1-D60)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('dasha')}
                className="hover:text-orange-500 transition-colors"
              >
                Vimshottari Dasha
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('ai')}
                className="hover:text-orange-500 transition-colors"
              >
                AI Astrologer
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('research')}
                className="hover:text-orange-500 transition-colors"
              >
                Developer API &amp; Tests
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-bold font-serif text-[#162058] mb-4 uppercase tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-orange-500" />
              <span>+91 9614346666</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="text-orange-500" />
              <span>info@astroworld.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={13} className="text-orange-500" />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>

        {/* Newsletter / Subscribe */}
        <div>
          <h4 className="text-sm font-bold font-serif text-[#162058] mb-4 uppercase tracking-wider">
            Subscribe
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Receive monthly cosmic insights and auspicious transit notifications.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle size={15} /> Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-4 py-2 text-xs text-[#162058] focus:outline-none focus:border-orange-500"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        © 2026 AstroWorld Vedic Astrology. All Rights Reserved. Built with canonical Brihat Parashara Hora Shastra standards.
      </div>
    </footer>
  );
};
