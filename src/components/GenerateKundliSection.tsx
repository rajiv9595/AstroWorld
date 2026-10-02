/**
 * ASTROWORLD — Generate Your Kundli Section
 * Clean cream background with two-column split card and birth form.
 * Enforces login gate before granting access to generated Kundli.
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { BirthProfile } from '../engine/types.ts';
import { GOLDEN_BENCHMARK_PROFILE } from '../engine/canonicalChart.ts';

interface GenerateKundliSectionProps {
  currentProfile: BirthProfile;
  isLoggedIn: boolean;
  onGenerate: (profile: BirthProfile) => void;
  onRequireAuth: (pendingProfile: BirthProfile) => void;
}

export const GenerateKundliSection: React.FC<GenerateKundliSectionProps> = ({
  currentProfile,
  isLoggedIn,
  onGenerate,
  onRequireAuth,
}) => {
  const [formData, setFormData] = useState<BirthProfile>({ ...currentProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onRequireAuth(formData);
    } else {
      onGenerate(formData);
    }
  };

  const handleSelectPreset = (preset: BirthProfile) => {
    setFormData({ ...preset });
    if (!isLoggedIn) {
      onRequireAuth(preset);
    } else {
      onGenerate(preset);
    }
  };

  return (
    <section id="kundli-generator" className="py-20 px-6 sm:px-12 bg-[#FBF9F5] border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto">
        {/* Section Header with Orange Underline */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#162058] mb-3">
            Generate Your Kundli
          </h2>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Fill in your birth details to receive a comprehensive analysis of your life path, career, marriage, and health.
          </p>
        </div>

        {/* Form Container Split */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Cosmic Blue Brand Card with Ganesha Artwork */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#162058] via-[#1a286b] to-[#141b41] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-lg shadow-black/40 flex-shrink-0">
                  <img
                    src="/ganesha_circle.png"
                    alt="Lord Ganesha"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Vedic Birth Chart</h3>
                  <p className="text-xs text-amber-300 font-medium">BPHS Canonical Calculation</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Precision sidereal ephemeris utilizing IAU standard Lahiri ayanamsha, whole sign house systems, and complete 16 Shodashavarga divisions.
              </p>

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Historical &amp; Anchor Presets:
                </span>
                <div className="space-y-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(GOLDEN_BENCHMARK_PROFILE)}
                    className="w-full text-left p-2.5 rounded-xl border border-amber-400/40 bg-white/10 hover:bg-white/15 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-amber-200">Golden Anchor (17/08/2005)</div>
                      <div className="text-[10px] text-slate-300 font-mono">00:02 IST • Anaparthy, India</div>
                    </div>
                    <Sparkles size={14} className="text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectPreset({
                        name: 'Swami Vivekananda',
                        year: 1863,
                        month: 1,
                        day: 12,
                        hour: 6,
                        minute: 33,
                        second: 0,
                        latitude: 22.5726,
                        longitude: 88.3639,
                        timezone: 'Asia/Kolkata',
                        cityName: 'Kolkata, India',
                      })
                    }
                    className="w-full text-left p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">Swami Vivekananda</div>
                      <div className="text-[10px] text-slate-400 font-mono">12 Jan 1863 • Kolkata, India</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Ayanamsha: Lahiri</span>
              <span>Account Protected</span>
            </div>
          </div>

          {/* Right Column: Clean White Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
            <h3 className="font-serif font-bold text-xl text-[#162058] mb-6">
              Enter Birth Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#162058] font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={13} className="text-orange-500" /> Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                    required
                  />
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    placeholder="Year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2000 })}
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={13} className="text-orange-500" /> Time of Birth (24-Hour Format)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH"
                      value={formData.hour}
                      onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5 text-center">Hour</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={formData.minute}
                      onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5 text-center">Minute</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="SS"
                      value={formData.second ?? 0}
                      onChange={(e) => setFormData({ ...formData, second: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5 text-center">Second</span>
                  </div>
                </div>
              </div>

              {/* Place / Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin size={13} className="text-orange-500" /> City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.cityName || ''}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                    placeholder="e.g. Anaparthy, India"
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Timezone (IANA)
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="Asia/Kolkata"
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono text-xs focus:border-orange-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#162058] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FBF9F5] border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-[#162058] font-mono"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
                >
                  <span>GENERATE KUNDLI</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
