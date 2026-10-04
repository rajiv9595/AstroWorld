/**
 * ASTROWORLD AI V2 — Birth Profile Editor Modal Component
 * Controlled form to update consultation birth data with strict validation bounds.
 */

import React, { useState, useEffect } from 'react';
import { Compass, X, Check, AlertCircle } from 'lucide-react';
import { BirthProfile } from '../../engine/types.ts';

interface BirthProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: BirthProfile;
  onSave: (updatedProfile: BirthProfile) => void;
}

export const BirthProfileEditorModal: React.FC<BirthProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [year, setYear] = useState(currentProfile.year);
  const [month, setMonth] = useState(currentProfile.month);
  const [day, setDay] = useState(currentProfile.day);
  const [hour, setHour] = useState(currentProfile.hour);
  const [minute, setMinute] = useState(currentProfile.minute);
  const [latitude, setLatitude] = useState(currentProfile.latitude);
  const [longitude, setLongitude] = useState(currentProfile.longitude);
  const [timezone, setTimezone] = useState(currentProfile.timezone || 'Asia/Kolkata');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentProfile.gender || 'male');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.name);
      setYear(currentProfile.year);
      setMonth(currentProfile.month);
      setDay(currentProfile.day);
      setHour(currentProfile.hour);
      setMinute(currentProfile.minute);
      setLatitude(currentProfile.latitude);
      setLongitude(currentProfile.longitude);
      setTimezone(currentProfile.timezone || 'Asia/Kolkata');
      setGender(currentProfile.gender || 'male');
      setErrorMessage(null);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching backend boundaries
    if (!name.trim()) {
      setErrorMessage('Please enter a name for the birth chart.');
      return;
    }

    if (year < 1900 || year > 2100) {
      setErrorMessage('Birth year must be between 1900 and 2100.');
      return;
    }

    if (month < 1 || month > 12) {
      setErrorMessage('Birth month must be between 1 and 12.');
      return;
    }

    if (day < 1 || day > 31) {
      setErrorMessage('Birth day must be between 1 and 31.');
      return;
    }

    if (hour < 0 || hour > 23) {
      setErrorMessage('Birth hour must be between 0 and 23.');
      return;
    }

    if (minute < 0 || minute > 59) {
      setErrorMessage('Birth minute must be between 0 and 59.');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setErrorMessage('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setErrorMessage('Longitude must be between -180 and 180 degrees.');
      return;
    }

    const updated: BirthProfile = {
      name: name.trim(),
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: 0,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: timezone.trim(),
      gender,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#162058] text-amber-300 flex items-center justify-center shadow-xs">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#162058]">
                Consultation Birth Profile
              </h3>
              <p className="text-xs text-slate-500">
                Authoritative birth details for planetary calculation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              <AlertCircle size={14} className="text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name / Subject
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
              required
            />
          </div>

          {/* Date of Birth Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Day</label>
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Month</label>
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
          </div>

          {/* Time of Birth Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hour (0-23)</label>
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minute (0-59)</label>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={e => setMinute(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude (°)</label>
              <input
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={e => setLatitude(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude (°)</label>
              <input
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={e => setLongitude(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
          </div>

          {/* Timezone & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IANA Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                placeholder="e.g. Asia/Kolkata"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#162058]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Not specified</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#162058] hover:bg-[#1f2c7a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Check size={14} />
              <span>Apply to Consultation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
