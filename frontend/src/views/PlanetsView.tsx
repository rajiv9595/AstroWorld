/**
 * ASTROWORLD — View 3: Planets Deep Dive
 * Comprehensive planetary dossiers with exact coordinates, dignities, avasthas, and relationships.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext, PlanetName } from '../engine/types.ts';
import { SANSKRIT_PLANET_NAMES, SANSKRIT_SIGNS } from '../engine/constants.ts';
import { Orbit, Compass, Activity, Shield, Award } from 'lucide-react';

interface PlanetsViewProps {
  context: AIInterpretationContext;
  onSelectPlanet?: (planet: PlanetName) => void;
}

export const PlanetsView: React.FC<PlanetsViewProps> = ({ context }) => {
  const { planets, strength, ascendant } = context;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Orbit className="text-orange-500 w-6 h-6" />
            Navagraha — The 9 Cosmic Archetypes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Exact astronomical coordinates, nakshatra subdivisions, combustion thresholds, and Parashari dignities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {planets.map((p) => {
          const avastha = strength.avasthas.find((a) => a.planet === p.name);
          const shadbala = strength.shadbala.find((s) => s.planet === p.name);

          return (
            <div
              key={p.name}
              className="bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-serif text-[#162058]">{p.name}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({SANSKRIT_PLANET_NAMES[p.name].split(' ')[0]})
                      </span>
                    </div>
                    <div className="text-xs text-orange-600 font-serif font-semibold mt-0.5">
                      {p.sign} ({SANSKRIT_SIGNS[p.sign].split(' ')[0]}) • House {p.houseNumber}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold border ${
                      p.dignity === 'EXALTED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : p.dignity === 'MOOLATRIKONA'
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : p.dignity === 'OWN_SIGN'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : p.dignity === 'DEBILITATED'
                        ? 'bg-red-50 text-red-800 border-red-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {p.dignity}
                  </span>
                </div>

                {/* Coordinate & Nakshatra Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Degree:</span>
                    <span className="font-mono font-bold text-[#162058]">{p.formattedDegree}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nakshatra:</span>
                    <span className="font-semibold text-slate-700">
                      {p.nakshatra} (Pada {p.pada})
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nakshatra Lord:</span>
                    <span className="font-medium text-amber-700">{p.nakshatraLord}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Motion:</span>
                    <span className="font-mono">
                      {p.retrograde ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Retrograde (Vakra)
                        </span>
                      ) : (
                        <span className="text-slate-600">Direct ({p.speed.toFixed(3)}°/day)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Combustion:</span>
                    <span>
                      {p.combust ? (
                        <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Combust
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Safe</span>
                      )}
                    </span>
                  </div>

                  {avastha && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Baladi Avastha:</span>
                      <span className="font-serif font-bold text-indigo-700">
                        {avastha.baladi} ({avastha.functionalNature})
                      </span>
                    </div>
                  )}

                  {shadbala && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Shadbala Score:</span>
                      <span className="font-mono font-bold text-[#162058]">
                        {shadbala.totalVirupas.toFixed(1)} Virupas ({shadbala.strengthRatio.toFixed(2)}x req)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Sign Lord: <strong>{p.signLord}</strong></span>
                <span className="font-mono text-amber-700 font-semibold">House #{p.houseNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
