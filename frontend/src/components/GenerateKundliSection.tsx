/**
 * ASTROWORLD — Generate Your Kundli Section
 * Clean cream background with two-column split card and birth form.
 * Features:
 * - Clean empty inputs on load (no private data pre-filled)
 * - Free text/backspace support for numeric fields without stuck digits
 * - Vedic computational pillars and high-precision canonical calculation
 */

import React, { useState } from 'react';
import { MapPin, Sparkles, ArrowRight, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BirthProfile } from '../engine/types.ts';
import { CityAutocompleteInput } from './CityAutocompleteInput.tsx';
import { VedicDatePicker } from './VedicDatePicker.tsx';
import { VedicTimePicker } from './VedicTimePicker.tsx';

interface GenerateKundliSectionProps {
  currentProfile?: BirthProfile;
  isLoggedIn: boolean;
  onGenerate: (profile: BirthProfile) => void;
  onRequireAuth: (pendingProfile: BirthProfile) => void;
}

export const GenerateKundliSection: React.FC<GenerateKundliSectionProps> = ({
  isLoggedIn,
  onGenerate,
  onRequireAuth,
}) => {
  // String state for unconstrained typing & backspacing
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [second, setSecond] = useState('0');
  const [cityName, setCityName] = useState('');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedDay = parseInt(day, 10);
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedHour = parseInt(hour, 10);
    const parsedMinute = parseInt(minute, 10);
    const parsedSecond = parseInt(second, 10) || 0;

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      setValidationError('Please enter a valid birth day (1-31).');
      return;
    }
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setValidationError('Please enter a valid birth month (1-12).');
      return;
    }
    if (isNaN(parsedYear) || parsedYear < 1800 || parsedYear > 2100) {
      setValidationError('Please enter a valid 4-digit birth year (e.g. 1995).');
      return;
    }
    if (isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
      setValidationError('Please enter birth hour (0-23 in 24-hour format).');
      return;
    }
    if (isNaN(parsedMinute) || parsedMinute < 0 || parsedMinute > 59) {
      setValidationError('Please enter birth minute (0-59).');
      return;
    }

    const payload: BirthProfile = {
      name: name.trim(),
      day: parsedDay,
      month: parsedMonth,
      year: parsedYear,
      hour: parsedHour,
      minute: parsedMinute,
      second: parsedSecond,
      latitude: parseFloat(latitude) || 28.6139,
      longitude: parseFloat(longitude) || 77.2090,
      timezone: timezone || 'Asia/Kolkata',
      cityName: cityName.trim() || 'India',
      gender,
    };

    if (!isLoggedIn) {
      onRequireAuth(payload);
    } else {
      onGenerate(payload);
    }
  };

  return (
    <section id="kundli-generator" className="py-20 px-6 sm:px-12 bg-[#FBF9F5] border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#162058] mb-3">
            Generate Your Kundli
          </h2>
          <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Fill in your birth details below to receive a comprehensive astrological analysis of your life path, career, marriage, and planetary strengths.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Vedic Knowledge & Classical Standards */}
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

              {/* Vedic Computational Highlights — Zero Scroll */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>16 Divisional Charts (D1–D60):</strong> Complete Shodashavarga (D9 Navamsha, D10 Dashamsha, D60) harmonic breakdowns.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Vimshottari Dasha Engine:</strong> Multi-tiered Mahadasha, Antardasha, and Pratyantardasha timeline mapping.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Shadbala &amp; Ashtakavarga:</strong> 6-fold planetary strength verification and 337 Sarvashtakavarga bindu distribution.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Classical Yoga Verification:</strong> Raja, Dhana, Neechabhanga, and Viparita Yogas verified from BPHS.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>AI AstroBot &amp; Luxury PDF:</strong> Real-time Shastra guidance and 12-page publishing-grade horoscope book.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-amber-400" /> Private &amp; Secure</span>
              <span>Ayanamsha: Lahiri (Chitra Paksha)</span>
            </div>
          </div>

          {/* Right Column: Clean White Form with Free Backspacing */}
          <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
            <h3 className="font-serif font-bold text-xl text-[#162058] mb-6">
              Enter Birth Details
            </h3>

            {validationError && (
              <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-sm text-[#162058] font-medium placeholder-slate-400 focus:outline-none focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer capitalize ${
                        gender === g
                          ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                          : 'border-slate-200 bg-[#FAF7F2] text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of Birth: Vedic Interactive Calendar & Direct Typing */}
              <VedicDatePicker
                day={day}
                month={month}
                year={year}
                onDateChange={(newDay, newMonth, newYear) => {
                  setDay(newDay);
                  setMonth(newMonth);
                  setYear(newYear);
                }}
              />

              {/* Time of Birth: 12h/24h AM/PM with Vedic Solar Presets */}
              <VedicTimePicker
                hour={hour}
                minute={minute}
                second={second}
                onTimeChange={(newHour, newMinute, newSecond) => {
                  setHour(newHour);
                  setMinute(newMinute);
                  setSecond(newSecond);
                }}
              />

              {/* City / Location & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin size={13} className="text-orange-500" /> City / Location
                  </label>
                  <CityAutocompleteInput
                    value={cityName}
                    onSelectPlace={(place) => {
                      setCityName(place.cityName);
                      setLatitude(place.latitude);
                      setLongitude(place.longitude);
                      setTimezone(place.timezone);
                    }}
                    onRawChange={(text) => setCityName(text)}
                    placeholder="e.g. Hyderabad, New Delhi, London"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Timezone (IANA)
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Kolkata"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 rounded-xl py-2.5 px-3 text-xs text-[#162058] font-mono focus:outline-none focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Latitude and Longitude Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="28.6139"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 rounded-xl py-2 px-3 text-xs text-[#162058] font-mono focus:outline-none focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="77.2090"
                    className="w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 rounded-xl py-2 px-3 text-xs text-[#162058] font-mono focus:outline-none focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Generate Kundli</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
