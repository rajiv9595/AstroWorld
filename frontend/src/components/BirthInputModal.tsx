/**
 * ASTROWORLD — Birth Profile Input & Onboarding Modal
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 * Features:
 * - Direct personal birth details entry (no celebrity/personality presets here)
 * - Free text/backspace support for numeric fields without stuck digits
 * - Saves directly to Supabase and computes canonical Vedic chart
 */

import React, { useState, useEffect } from 'react';
import { MapPin, X, Sparkles, ShieldCheck } from 'lucide-react';
import { BirthProfile, birthProfileToUtcDate } from '../engine/types.ts';
import { CityAutocompleteInput } from './CityAutocompleteInput.tsx';
import { VedicDatePicker } from './VedicDatePicker.tsx';
import { VedicTimePicker } from './VedicTimePicker.tsx';

interface BirthInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: BirthProfile;
  onSave: (profile: BirthProfile) => void;
  isOnboarding?: boolean;
}

export const BirthInputModal: React.FC<BirthInputModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  isOnboarding = false,
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

  useEffect(() => {
    if (isOpen) {
      if (currentProfile && !isOnboarding) {
        setName(currentProfile.name || '');
        setDay(currentProfile.day ? String(currentProfile.day) : '');
        setMonth(currentProfile.month ? String(currentProfile.month) : '');
        setYear(currentProfile.year ? String(currentProfile.year) : '');
        setHour(currentProfile.hour !== undefined ? String(currentProfile.hour) : '');
        setMinute(currentProfile.minute !== undefined ? String(currentProfile.minute) : '');
        setSecond(currentProfile.second !== undefined ? String(currentProfile.second) : '0');
        setCityName(currentProfile.cityName || '');
        setLatitude(currentProfile.latitude !== undefined ? String(currentProfile.latitude) : '28.6139');
        setLongitude(currentProfile.longitude !== undefined ? String(currentProfile.longitude) : '77.2090');
        setTimezone(currentProfile.timezone || 'Asia/Kolkata');
        setGender(currentProfile.gender || 'male');
      } else if (isOnboarding && currentProfile?.name) {
        setName(currentProfile.name);
        setDay('');
        setMonth('');
        setYear('');
        setHour('');
        setMinute('');
        setSecond('0');
        setCityName('');
        setLatitude('28.6139');
        setLongitude('77.2090');
        setTimezone('Asia/Kolkata');
      }
      setValidationError(null);
    }
  }, [isOpen, currentProfile, isOnboarding]);

  if (!isOpen) return null;

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
      setValidationError('Please enter a valid 4-digit birth year (1800-2100).');
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

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      setValidationError('Please enter a valid latitude between -90 and 90.');
      return;
    }
    if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
      setValidationError('Please enter a valid longitude between -180 and 180.');
      return;
    }
    if (!timezone.trim()) {
      setValidationError('Please confirm a valid IANA timezone for the birthplace (for example, Asia/Kolkata).');
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
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      timezone: timezone.trim(),
      cityName: cityName.trim() || 'India',
      gender,
    };

    try {
      birthProfileToUtcDate(payload);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Please verify the birth date, time, and timezone.');
      return;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-amber-300 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800">
        {!isOnboarding && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="text-xl font-bold font-serif text-[#162058]">
              {isOnboarding ? 'Welcome! Enter Your Birth Details' : 'Edit Birth Details'}
            </h2>
            <p className="text-xs text-slate-500">
              {isOnboarding
                ? 'Please provide your exact birth information to compute and save your Kundli.'
                : 'Update native subject parameters for recalculating Vedic charts.'}
            </p>
          </div>
        </div>

        {validationError && (
          <div className="p-3 my-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Name / Native Subject
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-medium focus:outline-none focus:border-orange-500 focus:bg-white"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer capitalize ${
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

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1 font-semibold">
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
                placeholder="e.g. Hyderabad, India"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Timezone (IANA)</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono text-xs focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Latitude (°N)</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="28.6139"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Longitude (°E)</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="77.2090"
                className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm text-[#162058] font-mono focus:border-orange-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Your birth data is securely encrypted and stored privately in Supabase.</span>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isOnboarding ? 'Save Details & Generate Kundli' : 'Compute & Update Kundli'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
