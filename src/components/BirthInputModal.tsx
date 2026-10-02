/**
 * ASTROWORLD — Birth Profile Input Modal & Presets
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, X, RotateCcw, Sparkles } from 'lucide-react';
import { BirthProfile } from '../engine/types.ts';
import { GOLDEN_BENCHMARK_PROFILE } from '../engine/canonicalChart.ts';

interface BirthInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: BirthProfile;
  onSave: (profile: BirthProfile) => void;
}

const PRESETS: { name: string; profile: BirthProfile; description: string }[] = [
  {
    name: 'Canonical Golden Anchor (17/08/2005)',
    profile: GOLDEN_BENCHMARK_PROFILE,
    description: '17 Aug 2005 00:02 IST, Anaparthy AP India (Validated Golden Anchor Chart).',
  },
  {
    name: 'Swami Vivekananda',
    profile: {
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
      cityName: 'Kolkata, West Bengal, India',
    },
    description: 'Sagittarius Lagna with exalted Sun and spiritual Raja Yogas.',
  },
  {
    name: 'Albert Einstein',
    profile: {
      name: 'Albert Einstein',
      year: 1879,
      month: 3,
      day: 14,
      hour: 11,
      minute: 30,
      second: 0,
      latitude: 48.4011,
      longitude: 9.9876,
      timezone: 'Europe/Berlin',
      cityName: 'Ulm, Germany',
    },
    description: 'Gemini Lagna with Neechabhanga Mercury & exalted Venus in 10th.',
  },
];

export const BirthInputModal: React.FC<BirthInputModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}) => {
  const [formData, setFormData] = useState<BirthProfile>({ ...currentProfile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleSelectPreset = (preset: BirthProfile) => {
    setFormData({ ...preset });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-amber-300 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold font-serif text-[#162058]">Birth Chart Profile</h2>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Historical &amp; Benchmark Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(p.profile)}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  formData.year === p.profile.year && formData.day === p.profile.day
                    ? 'border-orange-500 bg-orange-50 text-orange-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-[#FAF7F2] hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-[#162058]">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Profile Name / Native Subject
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1 font-semibold">
                <Calendar size={13} className="text-orange-500" /> Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Year</label>
              <input
                type="number"
                min="1800"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2000 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1 font-semibold">
                <Clock size={13} className="text-orange-500" /> Hour (24h)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Minute</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.minute}
                onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Second</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.second ?? 0}
                onChange={(e) => setFormData({ ...formData, second: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1 font-semibold">
                <MapPin size={13} className="text-orange-500" /> City / Location
              </label>
              <input
                type="text"
                value={formData.cityName || ''}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                placeholder="City Name"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:border-orange-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Timezone (IANA)</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="Asia/Kolkata"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono text-xs focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Latitude (°N)</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Longitude (°E)</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFormData(GOLDEN_BENCHMARK_PROFILE)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Compute &amp; Update Kundli
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
