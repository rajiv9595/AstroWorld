/**
 * ASTROWORLD — View 4: Comprehensive Panchanga & Daily Muhurat Engine
 * Clean, standard, and unbiased modern aesthetic with rich astronomical calculations,
 * Solar/Lunar ephemeris, Auspicious/Inauspicious Muhurats, and Day/Night Choghadiyas.
 */

import React, { useState, useMemo } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import {
  calculateComprehensiveDailyPanchanga,
  ComprehensiveDailyPanchanga,
} from '../engine/panchanga.ts';
import {
  Calendar,
  Sun,
  Moon,
  Sparkles,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Flame,
  ArrowRight,
  RefreshCw,
  Sunrise,
  Sunset,
  Layers,
  Award,
} from 'lucide-react';

interface PanchangaViewProps {
  context: AIInterpretationContext;
}

const COMMON_CITIES = [
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 'Asia/Singapore' },
];

export const PanchangaView: React.FC<PanchangaViewProps> = ({ context }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'birth'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState(COMMON_CITIES[0]);
  const [choghadiyaTab, setChoghadiyaTab] = useState<'day' | 'night'>('day');

  // Compute live comprehensive daily panchang for selected date & city
  const dailyData: ComprehensiveDailyPanchanga = useMemo(() => {
    return calculateComprehensiveDailyPanchanga(
      selectedDate,
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.tz,
      selectedCity.name
    );
  }, [selectedDate, selectedCity]);

  // Birth chart panchanga facts
  const { panchanga: birthPanchanga, planets, birthProfile } = context;
  const sun = planets.find((p) => p.name === 'Sun') || planets[0];
  const moon = planets.find((p) => p.name === 'Moon') || planets[1];

  // Helper for quick date jumps
  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  const handleSetYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(yesterday);
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-orange-500 w-6 h-6" />
            <h2 className="text-2xl font-serif font-bold text-[#162058]">
              Panchanga &amp; Muhurat Portal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Astronomical 5 limbs of Vedic time, auspicious/inauspicious Muhurats, and complete Choghadiya cycles.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} className={viewMode === 'daily' ? 'text-orange-500' : 'text-slate-400'} />
            <span>Daily Live Panchanga &amp; Muhurat</span>
          </button>
          <button
            onClick={() => setViewMode('birth')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'birth'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} className={viewMode === 'birth' ? 'text-orange-500' : 'text-slate-400'} />
            <span>Janma Kundli (Birth) Panchanga</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAILY LIVE PANCHANGA MODE */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-6">
          {/* Controls Bar: Quick Date Toggles, Custom Date Picker, City Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Quick Date Toggles */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleSetYesterday}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#FAF7F2] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Yesterday
              </button>
              <button
                onClick={handleSetToday}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isToday
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'border-slate-200 bg-[#FAF7F2] text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Today</span>
              </button>
              <button
                onClick={handleSetTomorrow}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#FAF7F2] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Tomorrow
              </button>

              {/* Custom Date Picker */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar size={13} className="text-slate-400" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setSelectedDate(new Date(y, m - 1, d, 12, 0, 0));
                    }
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Location / City Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-1.5">
                <MapPin size={13} className="text-orange-500" />
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const found = COMMON_CITIES.find((c) => c.name === e.target.value);
                    if (found) setSelectedCity(found);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {COMMON_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:block text-[11px] font-mono text-slate-400">
                {selectedCity.tz}
              </div>
            </div>
          </div>

          {/* Active Date Banner */}
          <div className="bg-linear-to-r from-[#162058] to-[#243380] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
                Calculated Ephemeris for
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                {dailyData.formattedDate}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Location: {dailyData.cityName} &bull; Coordinates: {dailyData.latitude.toFixed(2)}°N, {dailyData.longitude.toFixed(2)}°E &bull; Ayanamsha: {dailyData.solarLunar.ayanamsa} (IAU Lahiri)
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs self-start sm:self-auto">
              <Sparkles size={14} className="text-amber-300" />
              <span className="font-semibold text-amber-100">Live Precision</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: THE FIVE CANONICAL LIMBS CARDS */}
          {/* ========================================================================= */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers size={13} className="text-orange-500" />
              The Five Canonical Limbs of Vedic Time (Panchanga)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Tithi */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>1. TITHI (LUNAR DAY)</span>
                    <Moon size={12} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-serif text-[#162058]">
                    {dailyData.tithiDetail.name}
                  </div>
                  <div className="text-xs font-semibold text-amber-700 mt-1">
                    {dailyData.tithiDetail.paksha} Paksha (Tithi #{dailyData.tithiDetail.number})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div>Deity: <strong className="text-slate-700">{dailyData.tithiDetail.deity}</strong></div>
                    <div>Nature: <strong className="text-slate-700">{dailyData.tithiDetail.nature}</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Elongation Passed</span>
                    <span className="font-mono font-bold text-slate-700">
                      {dailyData.tithiDetail.completedPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${dailyData.tithiDetail.completedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Vara */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>2. VARA (SOLAR DAY)</span>
                    <Sun size={12} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-serif text-[#162058]">
                    {dailyData.varaDetail.english}
                  </div>
                  <div className="text-xs font-semibold text-indigo-700 mt-1">
                    {dailyData.varaDetail.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div>Ruler: <strong className="text-amber-800">{dailyData.varaDetail.lord}</strong></div>
                    <div>Presiding Deity: <strong className="text-slate-700">{dailyData.varaDetail.deity}</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Governs physical vitality, life force, and planetary hour rulers (Horas).
                </div>
              </div>

              {/* 3. Nakshatra */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>3. NAKSHATRA (LUNAR MANSION)</span>
                    <Sparkles size={12} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-serif text-[#162058]">
                    {dailyData.nakshatraDetail.name}
                  </div>
                  <div className="text-xs font-semibold text-indigo-700 mt-1">
                    Pada {dailyData.nakshatraDetail.pada} &bull; Lord: {dailyData.nakshatraDetail.lord}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div>Deity: <strong className="text-slate-700">{dailyData.nakshatraDetail.deity}</strong></div>
                    <div>Symbol: <strong className="text-slate-700">{dailyData.nakshatraDetail.symbol}</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Moon Span Passed</span>
                    <span className="font-mono font-bold text-slate-700">
                      {dailyData.nakshatraDetail.completedPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${dailyData.nakshatraDetail.completedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Yoga */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>4. YOGA (SOLAR-LUNAR ANGLE)</span>
                    <Compass size={12} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-serif text-[#162058]">
                    {dailyData.yogaDetail.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dailyData.yogaDetail.quality === 'Auspicious'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dailyData.yogaDetail.quality === 'Inauspicious'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {dailyData.yogaDetail.quality}
                    </span>
                    <span className="text-xs text-slate-500">#{dailyData.yogaDetail.number} of 27</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {dailyData.yogaDetail.meaning}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Combined solar-lunar longitude governing health and relationship harmony.
                </div>
              </div>

              {/* 5. Karana */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition">
                <div>
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>5. KARANA (HALF-TITHI)</span>
                    <Flame size={12} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-serif text-[#162058]">
                    {dailyData.karanaDetail.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    {dailyData.karanaDetail.type === 'Sthira' ? 'Fixed Karana' : 'Movable (Chara) Karana'} &bull; #{dailyData.karanaDetail.number} of 60
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div>Deity: <strong className="text-slate-700">{dailyData.karanaDetail.deity}</strong></div>
                    <div className="line-clamp-2">{dailyData.karanaDetail.nature}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Governs execution rhythm, business actions, and worldly successes.
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: SOLAR & LUNAR EPHEMERIS */}
          {/* ========================================================================= */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Sun size={13} className="text-orange-500" />
              Solar &amp; Lunar Ephemeris Timings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sunrise & Sunset */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Sunrise size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Sunrise &amp; Sunset</div>
                    <div className="text-sm font-bold text-[#162058]">Surya Udaya &bull; Astha</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sunrise:</span>
                    <span className="font-bold text-slate-800">{dailyData.solarLunar.sunrise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sunset:</span>
                    <span className="font-bold text-slate-800">{dailyData.solarLunar.sunset}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-700 font-sans font-semibold pt-1">
                    <span>Day Length:</span>
                    <span>{dailyData.solarLunar.dayDuration}</span>
                  </div>
                </div>
              </div>

              {/* Moonrise & Moonset */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Sunset size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Moonrise &amp; Moonset</div>
                    <div className="text-sm font-bold text-[#162058]">Chandra Udaya &bull; Astha</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Moonrise:</span>
                    <span className="font-bold text-slate-800">{dailyData.solarLunar.moonrise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Moonset:</span>
                    <span className="font-bold text-slate-800">{dailyData.solarLunar.moonset}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-indigo-700 font-sans font-semibold pt-1">
                    <span>Night Length:</span>
                    <span>{dailyData.solarLunar.nightDuration}</span>
                  </div>
                </div>
              </div>

              {/* Sun Sign (Surya Rashi) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                    <Sun size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Sun Sign</div>
                    <div className="text-sm font-bold text-[#162058]">Surya Rashi</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                  <div className="font-bold text-orange-950 font-serif text-sm">
                    {dailyData.solarLunar.sunSign}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Sidereal: {dailyData.solarLunar.sunDegree}
                  </div>
                </div>
              </div>

              {/* Moon Sign (Chandra Rashi) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Moon size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Moon Sign</div>
                    <div className="text-sm font-bold text-[#162058]">Chandra Rashi</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                  <div className="font-bold text-indigo-950 font-serif text-sm">
                    {dailyData.solarLunar.moonSign}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Sidereal: {dailyData.solarLunar.moonDegree}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3 & 4: AUSPICIOUS & INAUSPICIOUS MUHURATS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auspicious Timings (Shubha Muhurat) */}
            <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-bold text-emerald-950">
                      Auspicious Timings (Shubh Muhurat)
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Favorable planetary windows for launching vital projects, investments, and ceremonies.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Favorable
                </span>
              </div>

              <div className="space-y-3">
                {/* Abhijit Muhurat */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Abhijit Muhurat</span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {dailyData.muhurats.abhijit.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.abhijit.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.abhijit.start} – {dailyData.muhurats.abhijit.end}
                  </div>
                </div>

                {/* Brahma Muhurat */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Brahma Muhurat</span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {dailyData.muhurats.brahma.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.brahma.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.brahma.start} – {dailyData.muhurats.brahma.end}
                  </div>
                </div>

                {/* Amrit Kaal */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Amrit Kaal</span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {dailyData.muhurats.amritKaal.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.amritKaal.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.amritKaal.start} – {dailyData.muhurats.amritKaal.end}
                  </div>
                </div>

                {/* Vijaya Muhurat */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Vijaya Muhurat</span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {dailyData.muhurats.vijaya.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.vijaya.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.vijaya.start} – {dailyData.muhurats.vijaya.end}
                  </div>
                </div>
              </div>
            </div>

            {/* Inauspicious Timings (Ashubha Muhurat / Rahu Kaal) */}
            <div className="bg-white border border-rose-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-serif font-bold text-rose-950">
                      Inauspicious Timings (Ashubh Kaal)
                    </h4>
                    <p className="text-[11px] text-rose-700">
                      Periods with malefic influences. Highly advised to avoid initiating new ventures.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
                  Caution
                </span>
              </div>

              <div className="space-y-3">
                {/* Rahu Kaalam */}
                <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Rahu Kaalam</span>
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                        Avoid Starting Tasks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.rahuKaal.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.rahuKaal.start} – {dailyData.muhurats.rahuKaal.end}
                  </div>
                </div>

                {/* Yamaganda */}
                <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Yamaganda Kaal</span>
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                        Inauspicious
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.yamaganda.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.yamaganda.start} – {dailyData.muhurats.yamaganda.end}
                  </div>
                </div>

                {/* Gulika Kaal */}
                <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Gulika Kaalam</span>
                      <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                        Neutral / Obstacle
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.gulika.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.gulika.start} – {dailyData.muhurats.gulika.end}
                  </div>
                </div>

                {/* Dur Muhurat */}
                <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#162058]">Dur Muhurat</span>
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                        Inauspicious
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {dailyData.muhurats.durMuhurat.description}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto shrink-0">
                    {dailyData.muhurats.durMuhurat.start} – {dailyData.muhurats.durMuhurat.end}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: DAY & NIGHT CHOGHADIYA TIMINGS TABLE */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#162058] flex items-center gap-2">
                  <Clock className="text-orange-500 w-5 h-5" />
                  Day &amp; Night Choghadiya Timings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  16 planetary intervals (8 Day + 8 Night) classifying opportune and unfavorable windows for worldly endeavors.
                </p>
              </div>

              {/* Day / Night Sub-tabs */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setChoghadiyaTab('day')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    choghadiyaTab === 'day'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sun size={13} />
                  <span>Day Choghadiya (Sunrise - Sunset)</span>
                </button>
                <button
                  onClick={() => setChoghadiyaTab('night')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    choghadiyaTab === 'night'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Moon size={13} />
                  <span>Night Choghadiya (Sunset - Sunrise)</span>
                </button>
              </div>
            </div>

            {/* Choghadiya Table Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Choghadiya</th>
                    <th className="py-3 px-3">Type &amp; Status</th>
                    <th className="py-3 px-3">Time Interval</th>
                    <th className="py-3 px-3">Ruling Planet</th>
                    <th className="py-3 px-3">Recommended Actions &amp; Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(choghadiyaTab === 'day' ? dailyData.choghadiyaDay : dailyData.choghadiyaNight).map(
                    (c) => (
                      <tr
                        key={c.period}
                        className={`transition-colors ${
                          c.isActive
                            ? 'bg-amber-50/80 font-semibold'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {c.period}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#162058]">
                              {c.name}
                            </span>
                            {c.isActive && (
                              <span className="bg-orange-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm animate-pulse">
                                Active Now
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              c.name === 'Amrit'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.name === 'Shubh'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.name === 'Labh'
                                ? 'bg-blue-100 text-blue-800'
                                : c.name === 'Char'
                                ? 'bg-amber-100 text-amber-800'
                                : c.name === 'Rog'
                                ? 'bg-rose-100 text-rose-800'
                                : c.name === 'Kaal'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {c.name === 'Amrit'
                              ? 'Supreme (Nectar)'
                              : c.name === 'Shubh'
                              ? 'Good (Auspicious)'
                              : c.name === 'Labh'
                              ? 'Gain (Profit)'
                              : c.name === 'Char'
                              ? 'Neutral (Movement)'
                              : c.name === 'Rog'
                              ? 'Evil (Disease)'
                              : c.name === 'Kaal'
                              ? 'Loss (Harm)'
                              : 'Anxiety (Obstacles)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800 font-bold whitespace-nowrap">
                          {c.start} – {c.end}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">
                          {c.ruler}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs">
                          {c.meaning}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JANMA KUNDLI (BIRTH) PANCHANGA MODE */}
      {/* ========================================================================= */}
      {viewMode === 'birth' && (
        <div className="space-y-6">
          {/* Birth Info Banner */}
          <div className="bg-[#FAF7F2] border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block mb-0.5">
                Native Natal Configuration
              </span>
              <h3 className="text-lg font-serif font-bold text-[#162058]">
                {birthProfile.name} &bull; Janma Panchanga
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Birth Date: {birthProfile.day}/{birthProfile.month}/{birthProfile.year} &bull; Time: {String(birthProfile.hour).padStart(2, '0')}:{String(birthProfile.minute).padStart(2, '0')} &bull; Location: {birthProfile.cityName || 'India'}
              </p>
            </div>

            <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
              Ayanamsha: {birthPanchanga.ayanamsa.formatted}
            </div>
          </div>

          {/* 5 Primary Limbs Cards for Birth Profile */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* 1. Tithi */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  1. TITHI (LUNAR DAY)
                </div>
                <div className="text-base font-bold font-serif text-[#162058]">
                  {birthPanchanga.tithi.name}
                </div>
                <div className="text-xs font-semibold text-amber-700 mt-1">
                  {birthPanchanga.tithi.paksha} Paksha (Tithi #{birthPanchanga.tithi.number})
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Elongation Passed</span>
                  <span className="font-mono font-bold text-slate-700">
                    {birthPanchanga.tithi.completedPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${birthPanchanga.tithi.completedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Vara */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  2. VARA (SOLAR DAY)
                </div>
                <div className="text-base font-bold font-serif text-[#162058]">
                  {birthPanchanga.vara.name}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
                  Governing Planet: <strong className="text-amber-700">{birthPanchanga.vara.rulingPlanet}</strong>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Weekday order of planetary hours (Horas) at the moment of birth.
              </div>
            </div>

            {/* 3. Nakshatra */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  3. NAKSHATRA (LUNAR MANSION)
                </div>
                <div className="text-base font-bold font-serif text-[#162058]">
                  {birthPanchanga.nakshatra.name}
                </div>
                <div className="text-xs font-semibold text-indigo-700 mt-1">
                  Lord: {birthPanchanga.nakshatra.lord} &bull; Pada {birthPanchanga.nakshatra.pada}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Moon's natal mansion governing basic emotional nature and dasha initiation.
              </div>
            </div>

            {/* 4. Yoga */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  4. YOGA (SOLAR-LUNAR ANGLE)
                </div>
                <div className="text-base font-bold font-serif text-[#162058]">
                  {birthPanchanga.yoga.name}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
                  Nithya Yoga #{birthPanchanga.yoga.number} of 27
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Combined solar-lunar longitude governing native's character and fortune.
              </div>
            </div>

            {/* 5. Karana */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  5. KARANA (HALF-TITHI)
                </div>
                <div className="text-base font-bold font-serif text-[#162058]">
                  {birthPanchanga.karana.name}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
                  Half-Tithi #{birthPanchanga.karana.number} of 60 ({birthPanchanga.karana.type})
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Action, enterprise, and career execution rhythm.
              </div>
            </div>
          </div>

          {/* Ephemeris & Geocentric Standards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#162058] mb-3">
              Astronomical Standards &amp; Geocentric Coordinates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ayanamsha Model</span>
                <span className="font-bold text-[#162058] text-sm">Chitra Paksha (IAU Lahiri)</span>
                <span className="text-orange-600 block mt-1">{birthPanchanga.ayanamsa.formatted}</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sun Tropical vs Sidereal</span>
                <span className="text-slate-700 block">Trop: {sun.tropicalLongitude.toFixed(4)}°</span>
                <span className="text-[#162058] font-bold block mt-1">Sidereal: {sun.siderealLongitude.toFixed(4)}°</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Moon Tropical vs Sidereal</span>
                <span className="text-slate-700 block">Trop: {moon.tropicalLongitude.toFixed(4)}°</span>
                <span className="text-[#162058] font-bold block mt-1">Sidereal: {moon.siderealLongitude.toFixed(4)}°</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
