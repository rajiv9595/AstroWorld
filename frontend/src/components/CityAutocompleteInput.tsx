/**
 * ASTROWORLD — City & Location Autocomplete Input
 * Instant 1-letter dropdown suggestions using Google Places API + high-speed local index.
 * Automatically resolves City Name, Exact Latitude (°N), Longitude (°E), and IANA Timezone.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Sparkles, Check } from 'lucide-react';
import { PlaceSuggestion, searchCities } from '../services/geoService.ts';

interface CityAutocompleteInputProps {
  value: string;
  onSelectPlace: (place: {
    cityName: string;
    latitude: string;
    longitude: string;
    timezone: string;
  }) => void;
  onRawChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const CityAutocompleteInput: React.FC<CityAutocompleteInputProps> = ({
  value,
  onSelectPlace,
  onRawChange,
  placeholder = 'e.g. Hyderabad, India',
  className = '',
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (text: string) => {
    setInputValue(text);
    if (onRawChange) onRawChange(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!text.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchCities(text);
        setSuggestions(results);
      } catch (err) {
        console.warn('Autocomplete search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 120);
  };

  const handleSelect = (place: PlaceSuggestion) => {
    setInputValue(place.description);
    setIsOpen(false);
    onSelectPlace({
      cityName: place.description,
      latitude: String(place.latitude.toFixed(4)),
      longitude: String(place.longitude.toFixed(4)),
      timezone: place.timezone || 'Asia/Kolkata',
    });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (inputValue.trim()) {
              handleChange(inputValue);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={
            className ||
            'w-full bg-[#FAF7F2] border border-slate-300 focus:border-orange-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-[#162058] font-medium placeholder-slate-400 focus:outline-none transition'
          }
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-orange-500" />
          ) : (
            <Search size={14} />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-orange-500" /> Google Places &amp; Geocoder
            </span>
            <span>Auto-coordinates</span>
          </div>

          {suggestions.length === 0 && !loading && (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching locations found. You can type coordinates manually below.
            </div>
          )}

          {suggestions.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/80 border-b border-slate-100 last:border-none flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <MapPin size={15} className="text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#162058] group-hover:text-orange-900 truncate">
                  {place.description}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>{place.latitude.toFixed(2)}°N, {place.longitude.toFixed(2)}°E</span>
                  <span>&bull;</span>
                  <span>{place.timezone}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
