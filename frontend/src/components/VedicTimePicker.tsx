/**
 * ASTROWORLD — Luxury Unified Vedic Time Picker
 * Clean single-row container with intuitive Hour, Minute, and AM/PM controls.
 */

import React, { useEffect, useState } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';

interface VedicTimePickerProps {
  hour: string; // 24-hour format string (0-23)
  minute: string; // (0-59)
  second?: string; // (0-59)
  onTimeChange: (hour: string, minute: string, second: string) => void;
  label?: string;
  required?: boolean;
}

export const VedicTimePicker: React.FC<VedicTimePickerProps> = ({
  hour,
  minute,
  second = '0',
  onTimeChange,
  label = 'Time of Birth',
  required = true,
}) => {
  // Convert 24-hour format to 12-hour + AM/PM
  const h24Num = parseInt(hour, 10);
  const mNum = parseInt(minute, 10);

  const initialMeridiem: 'AM' | 'PM' = !isNaN(h24Num) && h24Num >= 12 ? 'PM' : 'AM';
  const initialH12: number = !isNaN(h24Num) ? h24Num % 12 || 12 : 6;
  const initialM: number = !isNaN(mNum) ? mNum : 0;

  const [selectedH12, setSelectedH12] = useState<number>(initialH12);
  const [selectedM, setSelectedM] = useState<number>(initialM);
  const [selectedMeridiem, setSelectedMeridiem] = useState<'AM' | 'PM'>(initialMeridiem);

  // Sync with incoming props
  useEffect(() => {
    if (hour !== '') {
      const h = parseInt(hour, 10);
      if (!isNaN(h)) {
        setSelectedMeridiem(h >= 12 ? 'PM' : 'AM');
        setSelectedH12(h % 12 || 12);
      }
    }
    if (minute !== '') {
      const m = parseInt(minute, 10);
      if (!isNaN(m)) {
        setSelectedM(m);
      }
    }
  }, [hour, minute]);

  const emit24Hour = (h12: number, min: number, meridiem: 'AM' | 'PM') => {
    let h24 = h12;
    if (meridiem === 'PM') {
      h24 = h12 === 12 ? 12 : h12 + 12;
    } else {
      h24 = h12 === 12 ? 0 : h12;
    }
    onTimeChange(String(h24), String(min).padStart(2, '0'), second || '0');
  };

  const handleHourChange = (newH12: number) => {
    setSelectedH12(newH12);
    emit24Hour(newH12, selectedM, selectedMeridiem);
  };

  const handleMinuteChange = (newM: number) => {
    setSelectedM(newM);
    emit24Hour(selectedH12, newM, selectedMeridiem);
  };

  const handleToggleMeridiem = (newMeridiem: 'AM' | 'PM') => {
    setSelectedMeridiem(newMeridiem);
    emit24Hour(selectedH12, selectedM, newMeridiem);
  };

  // Hours list (1 to 12)
  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);

  // Minutes list (00 to 59)
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div>
      {/* Label */}
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Clock size={14} className="text-orange-500" /> {label}
      </label>

      {/* Unified Single Time Box */}
      <div className="w-full bg-[#FAF7F2] border border-slate-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all">
        {/* Left: Clock Icon Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#162058] to-[#1a286b] text-white flex items-center justify-center shadow-md shadow-indigo-950/20 shrink-0">
            <Clock size={20} />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-[#162058]">Birth Time</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {String(hour || '06').padStart(2, '0')}:{String(minute || '00').padStart(2, '0')} (24h)
            </div>
          </div>
        </div>

        {/* Right: Interactive Selectors (Hour : Minute + AM/PM) */}
        <div className="flex items-center gap-2">
          {/* Hour Dropdown */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2 py-1.5 shadow-2xs">
            <select
              value={selectedH12}
              onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
              className="text-sm font-bold text-[#162058] focus:outline-none cursor-pointer bg-transparent"
              aria-label="Hour"
            >
              {hoursList.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <span className="text-base font-bold text-[#162058] font-mono">:</span>

          {/* Minute Dropdown */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2 py-1.5 shadow-2xs">
            <select
              value={selectedM}
              onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10))}
              className="text-sm font-bold text-[#162058] focus:outline-none cursor-pointer bg-transparent"
              aria-label="Minute"
            >
              {minutesList.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* AM / PM Segmented Toggle */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleToggleMeridiem('AM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedMeridiem === 'AM'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun size={12} />
              <span>AM</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMeridiem('PM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedMeridiem === 'PM'
                  ? 'bg-gradient-to-r from-[#162058] to-[#1a286b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon size={12} />
              <span>PM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
