/**
 * ASTROWORLD — View 12: Comprehensive Canonical Life Dossier & Report
 * Printable and exportable complete astrological analysis with structured provenance.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { FileText, Printer, Download, Sparkles, Compass, Shield, Zap } from 'lucide-react';

interface ReportViewProps {
  context: AIInterpretationContext;
}

export const ReportView: React.FC<ReportViewProps> = ({ context }) => {
  const { birthProfile, ascendant, planets, vargas, dasha, strength, yogas, doshas, jaimini, ashtakavarga, timingSignals } = context;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(context, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ASTROWORLD_${birthProfile.name.replace(/\s+/g, '_')}_CANONICAL.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <FileText className="text-orange-500 w-6 h-6" />
            Canonical Astrological Dossier &amp; Executive Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete life synthesis compiled deterministically from Brihat Parashara Hora Shastra standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-slate-300 hover:border-orange-500 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-md transition-all"
          >
            <Printer size={14} /> Print Dossier
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none">
        {/* Document Header */}
        <div className="border-b-2 border-[#162058] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-orange-600 uppercase tracking-widest mb-1">
              CANONICAL BPHS HOROSCOPE DOSSIER
            </div>
            <h1 className="text-3xl font-serif font-black text-[#162058] tracking-tight">
              AstroWorld Vedic Astrological Life Report
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Native Subject: <strong className="text-slate-800 text-sm">{birthProfile.name}</strong>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-600">
            <div>DOB: {birthProfile.day}/{birthProfile.month}/{birthProfile.year} {birthProfile.hour}:{String(birthProfile.minute).padStart(2, '0')}</div>
            <div>Place: {birthProfile.cityName || 'Anaparthy, India'}</div>
            <div>Coords: {birthProfile.latitude.toFixed(4)}°N, {birthProfile.longitude.toFixed(4)}°E</div>
          </div>
        </div>

        {/* Section 1: Core Astrological Identity */}
        <div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-3 flex items-center gap-2">
            <Compass size={18} className="text-orange-500" />
            <span>1. Core Astrological Identity &amp; Lagna Architecture</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ascendant (Lagna)</span>
              <div className="text-xl font-bold font-serif text-[#162058]">{ascendant.sign}</div>
              <div className="text-xs font-mono text-amber-800 font-semibold mt-1">
                {ascendant.formattedDegree} • {ascendant.nakshatra} (Pada {ascendant.pada})
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Janma Rashi (Moon)</span>
              {(() => {
                const moon = planets.find((p) => p.name === 'Moon')!;
                return (
                  <>
                    <div className="text-xl font-bold font-serif text-[#162058]">{moon.sign}</div>
                    <div className="text-xs font-mono text-indigo-700 font-semibold mt-1">
                      {moon.formattedDegree} • {moon.nakshatra} (Pada {moon.pada})
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF7F2]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Jaimini Atmakaraka (AK)</span>
              <div className="text-xl font-bold font-serif text-[#162058]">{jaimini.atmakaraka}</div>
              <div className="text-xs font-semibold text-amber-700 mt-1">
                Karakamsa: {jaimini.karakamsaNavamshaSign}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Planetary Coordinates & Dignities */}
        <div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-3">
            2. Graha Sphutas &amp; Classical Dignities
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#FAF7F2] text-[#162058] font-bold">
                  <th className="py-2 px-3">Graha</th>
                  <th className="py-2 px-3">Sign</th>
                  <th className="py-2 px-3">Degree</th>
                  <th className="py-2 px-3">Nakshatra</th>
                  <th className="py-2 px-3">House</th>
                  <th className="py-2 px-3">Dignity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planets.map((p) => (
                  <tr key={p.name} className="hover:bg-amber-50/50">
                    <td className="py-2 px-3 font-bold text-[#162058]">{p.name}</td>
                    <td className="py-2 px-3">{p.sign}</td>
                    <td className="py-2 px-3 font-mono">{p.formattedDegree}</td>
                    <td className="py-2 px-3">{p.nakshatra} (Pada {p.pada})</td>
                    <td className="py-2 px-3 font-bold text-amber-800">House {p.houseNumber}</td>
                    <td className="py-2 px-3 font-semibold text-orange-600">{p.dignity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Active Vimshottari Dasha Window */}
        <div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-3">
            3. Current Vimshottari Dasha Temporal Phase
          </h3>

          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 text-xs">
            <div className="font-bold text-sm text-[#162058] mb-1">
              Active Hierarchy: {dasha.currentHierarchy.mahadasha.lord} Mahadasha / {dasha.currentHierarchy.antardasha.subLord} Antardasha / {dasha.currentHierarchy.pratyantardasha.pratyantarLord} Pratyantardasha
            </div>
            <div className="text-slate-600">
              Antardasha Duration: {dasha.currentHierarchy.antardasha.startDateIso.slice(0, 10)} to {dasha.currentHierarchy.antardasha.endDateIso.slice(0, 10)}
            </div>
          </div>
        </div>

        {/* Section 4: Yogas Present */}
        <div>
          <h3 className="font-serif font-bold text-lg text-[#162058] mb-3 flex items-center gap-2">
            <Zap size={18} className="text-orange-500" />
            <span>4. Canonical Yogas Confirmed Present</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {yogas.filter((y) => y.present).map((y) => (
              <div key={y.id} className="p-3 rounded-xl border border-slate-200 bg-[#FAF7F2]">
                <div className="font-bold text-[#162058] flex justify-between">
                  <span>{y.name}</span>
                  <span className="font-mono text-[10px] text-amber-800">{y.bphsReference}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{y.effects}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-between text-[11px] text-slate-400 font-mono">
          <span>Engine: AstroWorld v1.0.0</span>
          <span>Standards: Brihat Parashara Hora Shastra (BPHS)</span>
        </div>
      </div>
    </div>
  );
};
