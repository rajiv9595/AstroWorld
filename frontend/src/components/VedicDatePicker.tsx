/**
 * ASTROWORLD — Luxury Unified Vedic Date Picker
 * Single cohesive interactive card with instant Popover Calendar
 * covering Years (1900–2050), Months (Jan–Dec), and Days.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface VedicDatePickerProps {
  day: string;
  month: string;
  year: string;
  onDateChange: (day: string, month: string, year: string) => void;
  label?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const VedicDatePicker: React.FC<VedicDatePickerProps> = ({
  day,
  month,
  year,
  onDateChange,
  label = 'Date of Birth',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const parsedYear = parseInt(year, 10) || 2000;
  const parsedMonth = parseInt(month, 10) || 1;
  const parsedDay = parseInt(day, 10) || 1;

  const [viewYear, setViewYear] = useState<number>(parsedYear);
  const [viewMonth, setViewMonth] = useState<number>(parsedMonth - 1); // 0-11

  // Sync internal calendar view when incoming props change
  useEffect(() => {
    if (year && !isNaN(parseInt(year, 10))) {
      setViewYear(parseInt(year, 10));
    }
    if (month && !isNaN(parseInt(month, 10))) {
      setViewMonth(Math.max(0, Math.min(11, parseInt(month, 10) - 1)));
    }
  }, [year, month]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (selectedDay: number) => {
    onDateChange(
      String(selectedDay).padStart(2, '0'),
      String(viewMonth + 1).padStart(2, '0'),
      String(viewYear)
    );
    setIsOpen(false);
  };

  const handleQuickToday = () => {
    const today = new Date();
    onDateChange(
      String(today.getDate()).padStart(2, '0'),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getFullYear())
    );
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const prevDecade = () => setViewYear((y) => y - 10);
  const nextDecade = () => setViewYear((y) => y + 10);

  const hasValidDate =
    day &&
    month &&
    year &&
    !isNaN(parsedDay) &&
    !isNaN(parsedMonth) &&
    !isNaN(parsedYear) &&
    parsedDay >= 1 &&
    parsedDay <= 31 &&
    parsedMonth >= 1 &&
    parsedMonth <= 12 &&
    parsedYear >= 1800;

  const formattedDateStr = hasValidDate
    ? `${parsedDay} ${MONTH_NAMES[parsedMonth - 1]} ${parsedYear}`
    : null;

  // Generate Year range (1900 to 2030)
  const yearOptions: number[] = [];
  for (let y = 2030; y >= 1900; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Label */}
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <CalendarIcon size={14} className="text-orange-500" /> {label}
      </label>

      {/* Unified Single Calendar Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#FAF7F2] hover:bg-amber-50/70 border rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer text-left shadow-xs ${
          isOpen
            ? 'border-orange-500 bg-white ring-2 ring-orange-500/20'
            : 'border-slate-300 hover:border-amber-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div>
            <div className="text-sm font-bold font-serif text-[#162058]">
              {formattedDateStr ? (
                formattedDateStr
              ) : (
                <span className="text-slate-400 font-normal">Select Date of Birth</span>
              )}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              {formattedDateStr ? 'Click to change date, month, or year' : 'Day / Month / Year'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-300/80">
          <span>{isOpen ? 'Close' : 'Choose Date'}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Hidden inputs to satisfy native required form validation */}
      {required && (
        <>
          <input type="hidden" value={day} required={required} />
          <input type="hidden" value={month} required={required} />
          <input type="hidden" value={year} required={required} />
        </>
      )}

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-88 bg-white rounded-3xl shadow-2xl border-2 border-amber-300/90 p-5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls: Month & Year Dropdowns + Navigation */}
          <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevDecade}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-orange-600 transition cursor-pointer"
                title="Previous 10 Years"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-orange-600 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Select Month and Year Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs font-bold text-[#162058] bg-[#FAF7F2] border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs font-mono font-bold text-[#162058] bg-[#FAF7F2] border border-amber-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-orange-600 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={nextDecade}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-orange-600 transition cursor-pointer"
                title="Next 10 Years"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-amber-900/70 pt-3 pb-1 uppercase tracking-wider">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const currentDay = i + 1;
              const isSelected =
                parsedDay === currentDay &&
                parsedMonth === viewMonth + 1 &&
                parsedYear === viewYear;

              return (
                <button
                  key={currentDay}
                  type="button"
                  onClick={() => handleSelectDay(currentDay)}
                  className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105 font-bold'
                      : 'text-slate-700 hover:bg-amber-100/70 hover:text-orange-900'
                  }`}
                >
                  {currentDay}
                </button>
              );
            })}
          </div>

          {/* Footer with Today & Done */}
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickToday}
              className="text-orange-600 font-bold hover:text-orange-700 text-xs cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={13} />
              <span>Select Today</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-gradient-to-r from-[#162058] to-[#1a286b] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
