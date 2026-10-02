/**
 * ASTROWORLD — View 12: Comprehensive Canonical Life Dossier & Professional PDF Portal
 * Fully redesigned professional report generator with dynamic page assembly,
 * multiple report profiles (Compact, Standard, Detailed, Professional),
 * North/South vector charts, and print-ready editorial typography.
 */

import React, { useState, useMemo } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { ReportProfile, ChartStylePreference } from '../report/reportTypes.ts';
import { buildAstroWorldReportDocument } from '../report/reportEngine.ts';
import { ReportDocumentRenderer } from '../report/ReportDocumentRenderer.tsx';
import {
  FileText,
  Printer,
  Download,
  SlidersHorizontal,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';

import { detectRegionalChartStyle } from '../engine/canonicalChart.ts';

interface ReportViewProps {
  context: AIInterpretationContext;
}

export const ReportView: React.FC<ReportViewProps> = ({ context }) => {
  const [profile, setProfile] = useState<ReportProfile>('standard');
  const [chartStyle, setChartStyle] = useState<ChartStylePreference>(() => {
    return detectRegionalChartStyle(context.birthProfile) === 'SOUTH_INDIAN'
      ? 'south-square'
      : 'north-diamond';
  });

  // Deterministically compile report document from canonical context
  const reportDoc = useMemo(() => {
    return buildAstroWorldReportDocument(context, profile);
  }, [context, profile]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(reportDoc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ASTROWORLD_${context.birthProfile.name.replace(/\s+/g, '_')}_${profile.toUpperCase()}_REPORT.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Report Control Bar (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
            <Sparkles size={14} /> Professional Print &amp; PDF Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#162058] mt-0.5">
            Canonical Astrological Life Dossier
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Publishing-grade, dynamic multi-page book generated from Brihat Parashara Hora Shastra deterministic calculations.
          </p>
        </div>

        {/* Profile & Chart Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Profile Switcher */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 text-xs">
            {(['compact', 'standard', 'detailed', 'professional'] as ReportProfile[]).map((p) => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                className={`px-2.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  profile === p
                    ? 'bg-[#162058] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setChartStyle('north-diamond')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartStyle === 'north-diamond'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              North Diamond
            </button>
            <button
              onClick={() => setChartStyle('south-square')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartStyle === 'south-square'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              South Square
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-500 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              title="Export structured report JSON"
            >
              <Download size={14} /> Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
            >
              <Printer size={14} /> Generate &amp; Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* Render the full dynamic book */}
      <ReportDocumentRenderer
        document={reportDoc}
        profile={profile}
        chartStyle={chartStyle}
      />
    </div>
  );
};
