/**
 * ASTROWORLD — Complete Professional PDF & Report Document Renderer
 * Generates a royal, editorial, book-grade, print-ready Vedic Astrological Life Dossier.
 * 
 * Strict Page-by-Page Typography:
 * - 12 Dedicated Self-Contained Pages with exact A4 (210mm x 297mm) containment.
 * - Classical Vedic Editorial Palette: Deep Charcoal (#0F172A), Saffron/Gold (#B45309, #D97706), Royal Indigo, Cream (#FAF8F5).
 * - High-resolution Vector SVG charts (North Indian Diamond & South Indian Square).
 * - Zero Web UI pollution: completely isolated from website headers, footers, buttons, and navigation.
 */

import React from 'react';
import {
  ReportDocument,
  ReportProfile,
  ChartStylePreference,
} from './reportTypes.ts';
import { VectorChartPdf } from './VectorChartPdf.tsx';
import {
  Sparkles,
  Compass,
  Star,
  Shield,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Heart,
  Briefcase,
  Coins,
  Award,
  Sun,
  Moon,
} from 'lucide-react';

interface ReportDocumentRendererProps {
  document: ReportDocument;
  profile: ReportProfile;
  chartStyle: ChartStylePreference;
}

export const ReportDocumentRenderer: React.FC<ReportDocumentRendererProps> = ({
  document: doc,
  profile,
  chartStyle,
}) => {
  const {
    cover,
    toc,
    birthDetails,
    panchanga,
    identity,
    charts,
    planetaryPositions,
    nakshatraAnalysis,
    houses,
    strengths,
    yogas,
    lifeAreas,
    dashaHierarchy,
    transits,
    ashtakavarga,
    remedies,
    summary,
    technicalAppendix,
  } = doc;

  const d1Chart = charts.find((c) => c.chartCode === 'D1') || charts[0];
  const d9Chart = charts.find((c) => c.chartCode === 'D9');

  return (
    <div className="astroworld-report-root bg-stone-100 py-4 sm:py-8 print:bg-white print:p-0">
      {/* Embedded Print & Typography Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .astroworld-report-root {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1e293b;
          -webkit-font-smoothing: antialiased;
        }

        .report-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        .report-cinzel {
          font-family: 'Cinzel', Georgia, serif;
        }

        .report-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Strict A4 Page Dimensions (210mm x 297mm) */
        .report-page {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          min-height: 297mm;
          padding: 16mm 16mm 14mm 16mm;
          margin: 0 auto 28px auto;
          background: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          position: relative;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          page-break-after: always;
          break-after: page;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .report-page-cover {
          background: radial-gradient(circle at 50% 25%, #FAF6EE 0%, #F5EFEB 100%);
          border: 1px solid #E6DAC8;
        }

        .page-content-flow {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow: hidden;
        }

        /* Running Header & Footer */
        .running-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 6px;
          margin-bottom: 14px;
          font-size: 7.5pt;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748B;
          font-family: 'Cinzel', serif;
          font-weight: 600;
        }

        .running-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #E2E8F0;
          padding-top: 8px;
          margin-top: 12px;
          font-size: 7.5pt;
          color: #64748B;
          font-family: 'Inter', sans-serif;
        }

        /* Section Headings */
        .section-badge {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 7pt;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #B45309;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18pt;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.15;
          margin-bottom: 2px;
        }

        .section-subtitle {
          font-size: 8pt;
          color: #64748B;
          margin-bottom: 12px;
        }

        /* Classical Tables */
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }

        .report-table th {
          background-color: #F8F6F0;
          color: #0F172A;
          font-family: 'Cinzel', serif;
          font-size: 7pt;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 6px 8px;
          border-bottom: 1.5px solid #CBD5E1;
          text-align: left;
        }

        .report-table td {
          padding: 5px 8px;
          border-bottom: 1px solid #F1F5F9;
          color: #334155;
        }

        .report-table tr:nth-child(even) td {
          background-color: #FAFAF8;
        }

        /* Evidence Cards */
        .evidence-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 1.5px 6px;
          background: #FEF3C7;
          border: 0.5px solid #FDE68A;
          border-radius: 4px;
          font-size: 6.5pt;
          font-weight: 600;
          color: #92400E;
          font-family: 'JetBrains Mono', monospace;
        }

        .card-box {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 9px 11px;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }

        /* Print Settings */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .astroworld-report-root {
            background: #ffffff !important;
            padding: 0 !important;
          }

          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            min-height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            padding: 15mm 15mm 13mm 15mm !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* PAGE 1: COVER PAGE                                                       */}
      {/* ========================================================================= */}
      <div className="report-page report-page-cover">
        <div className="h-full flex flex-col justify-between py-6 border-4 border-double border-[#C2A378] p-8 rounded-sm">
          {/* Top Emblem & Brand */}
          <div className="text-center pt-2">
            <div className="w-20 h-20 mx-auto mb-2 rounded-full border-2 border-[#B45309] p-1 bg-[#FFFBEB] shadow-md overflow-hidden flex items-center justify-center">
              <img
                src="/ganesha_circle.png"
                alt="Lord Vinayaka"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="report-cinzel text-[7.5pt] tracking-[0.25em] text-[#B45309] font-bold mb-1">
              ॥ श्री गणेशाय नमः ॥
            </div>
            <div className="report-cinzel tracking-[0.3em] text-[#0F172A] font-extrabold text-2xl">
              ASTROWORLD
            </div>
            <div className="report-cinzel text-[8.5pt] tracking-[0.25em] text-[#B45309] font-bold mt-0.5">
              VEDIC WISDOM &amp; CANONICAL HOROSCOPE DOSSIER
            </div>
            <div className="w-24 h-[1.5px] bg-[#C2A378] mx-auto mt-2.5 mb-1" />
          </div>

          {/* Main Title Block */}
          <div className="text-center my-auto py-4">
            <div className="report-cinzel text-[9.5pt] uppercase tracking-[0.2em] text-[#78716C] mb-2">
              Classical Vedic Astrological Life Synthesis
            </div>
            <h1 className="report-serif text-4xl sm:text-5xl font-bold text-[#0F172A] leading-tight mb-3">
              Comprehensive Life Horizon
            </h1>
            <p className="report-serif italic text-base sm:text-lg text-[#64748B] max-w-md mx-auto">
              "{cover.subtitle}"
            </p>

            {/* Native Name Plaque — Luxury Parchment with Gold Filigree */}
            <div className="mt-7 inline-block relative px-10 py-5 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFEB] rounded-sm border-2 border-[#C2A378] shadow-sm max-w-md w-full">
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1.5 text-[8pt] text-[#C2A378] font-serif select-none">✦</div>
              <div className="absolute top-1 right-1.5 text-[8pt] text-[#C2A378] font-serif select-none">✦</div>
              <div className="absolute bottom-1 left-1.5 text-[8pt] text-[#C2A378] font-serif select-none">✦</div>
              <div className="absolute bottom-1 right-1.5 text-[8pt] text-[#C2A378] font-serif select-none">✦</div>

              <div className="text-[7.5pt] report-cinzel uppercase tracking-[0.3em] text-[#B45309] font-bold mb-1">
                PREPARED EXCLUSIVELY FOR
              </div>
              <div className="report-serif text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-wide capitalize">
                {cover.nativeName}
              </div>
              <div className="w-16 h-[1.5px] bg-[#C2A378] mx-auto mt-2" />
            </div>
          </div>

          {/* Bottom Particulars & Credentials */}
          <div className="text-center border-t border-[#E6DAC8] pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-lg mx-auto text-[8pt] mb-4">
              <div>
                <span className="text-[#78716C] block uppercase text-[6.5pt] font-semibold">Date of Birth</span>
                <span className="font-semibold text-[#0F172A]">{cover.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-[#78716C] block uppercase text-[6.5pt] font-semibold">Time of Birth</span>
                <span className="font-semibold text-[#0F172A]">{cover.timeOfBirth}</span>
              </div>
              <div>
                <span className="text-[#78716C] block uppercase text-[6.5pt] font-semibold">Place</span>
                <span className="font-semibold text-[#0F172A] truncate block">{cover.placeOfBirth}</span>
              </div>
              <div>
                <span className="text-[#78716C] block uppercase text-[6.5pt] font-semibold">Edition</span>
                <span className="font-semibold text-[#B45309]">{profile.toUpperCase()} DOSSIER</span>
              </div>
            </div>

            <div className="text-[7pt] text-[#78716C] report-mono">
              Deterministic Computations • Brihat Parashara Hora Shastra Standards • AstroWorld Engine {cover.engineVersion}
            </div>
            <div className="text-[6.5pt] text-[#A8A29E] mt-0.5">
              Generated on {cover.generatedDate} • Confidential Astrological Document
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: TABLE OF CONTENTS & CORE IDENTITY                                 */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Table of Contents &amp; Core Identity</span>
          </div>

          {/* Section: Table of Contents */}
          <div className="mb-6">
            <div className="section-badge">Structure</div>
            <h2 className="section-title">Table of Contents</h2>
            <div className="section-subtitle">
              Comprehensive index of verified astrological findings and canonical sections.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[8pt]">
              {toc.items.map((item) => (
                <div key={item.number} className="flex items-center justify-between border-b border-stone-100 py-1">
                  <div className="flex items-center gap-2">
                    <span className="report-mono font-bold text-[#B45309] text-[7.5pt]">{item.number}</span>
                    <span className="font-medium text-[#1E293B]">{item.title}</span>
                  </div>
                  <span className="text-stone-400 font-mono text-[7.5pt]">{item.pageNumber}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-stone-200 my-3" />

          {/* Section: 1. Birth Particulars & Astronomical Coordinates */}
          <div className="mb-5">
            <div className="section-badge">Section 01</div>
            <h3 className="section-title">{birthDetails.title}</h3>
            <div className="section-subtitle">{birthDetails.subtitle}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {birthDetails.fields.map((f, i) => (
                <div key={i} className="p-2 rounded bg-stone-50 border border-stone-200 text-[7.5pt]">
                  <span className="text-stone-400 uppercase text-[6pt] font-semibold block">{f.label}</span>
                  <span className="font-bold text-[#0F172A] mt-0.5 block">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 2. Core Identity (Lagna & Moon Pillars) */}
          <div>
            <div className="section-badge">Section 02</div>
            <h3 className="section-title">{identity.title}</h3>
            <div className="section-subtitle">{identity.subtitle}</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              <div className="p-2.5 rounded-md bg-[#FFFBEB] border border-[#FDE68A]">
                <span className="text-[6.5pt] report-cinzel uppercase font-bold text-[#92400E] block">Ascendant (Lagna)</span>
                <div className="report-serif text-lg font-bold text-[#0F172A] mt-0.5">{identity.lagna.sign}</div>
                <div className="report-mono text-[7pt] text-[#78350F] mt-0.5">
                  {identity.lagna.formattedDegree} • {identity.lagna.nakshatra} (Pada {identity.lagna.pada})
                </div>
                <div className="text-[7pt] text-stone-600 mt-1">
                  Lord: <strong>{identity.lagna.lord}</strong> in House {identity.lagna.lordPlacementHouse}
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#EEF2FF] border border-[#C7D2FE]">
                <span className="text-[6.5pt] report-cinzel uppercase font-bold text-[#3730A3] block">Janma Rashi (Moon)</span>
                <div className="report-serif text-lg font-bold text-[#0F172A] mt-0.5">{identity.moon.sign}</div>
                <div className="report-mono text-[7pt] text-[#312E81] mt-0.5">
                  {identity.moon.formattedDegree} • {identity.moon.nakshatra} (Pada {identity.moon.pada})
                </div>
                <div className="text-[7pt] text-stone-600 mt-1">
                  Lord: <strong>{identity.moon.lord}</strong> in House {identity.moon.lordPlacementHouse}
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#FAF5FF] border border-[#E9D5FF]">
                <span className="text-[6.5pt] report-cinzel uppercase font-bold text-[#6B21A8] block">Jaimini Soul Karaka</span>
                <div className="report-serif text-lg font-bold text-[#0F172A] mt-0.5">{identity.atmakaraka.planet} (AK)</div>
                <div className="report-mono text-[7pt] text-[#581C87] mt-0.5">
                  Karakamsa: {identity.atmakaraka.karakamsaSign}
                </div>
                <div className="text-[7pt] text-stone-600 mt-1">
                  Amatyakaraka: <strong>{identity.amatyakaraka.planet}</strong>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50 border border-stone-200 text-[7.5pt] text-stone-700 leading-relaxed report-serif text-sm">
              {identity.lagnaSignificance}
            </div>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 02</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: PANCHANGA & GRAHA SPHUTAS                                         */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Panchanga &amp; Graha Sphutas</span>
          </div>

          {/* Panchanga Table */}
          <div className="mb-5">
            <div className="section-badge">Section 03</div>
            <h3 className="section-title">{panchanga.title}</h3>
            <div className="section-subtitle">{panchanga.subtitle}</div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2.5">
              {panchanga.elements.map((elem, i) => (
                <div key={i} className="p-2 rounded bg-stone-50 border border-stone-200 text-[7pt]">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 font-semibold uppercase text-[6pt]">{elem.name.split(' ')[0]}</span>
                    <span className="text-[6pt] text-amber-700 font-serif italic">{elem.sanskritName}</span>
                  </div>
                  <div className="font-bold text-[#0F172A] mt-0.5 truncate">{elem.value}</div>
                  <div className="text-[6pt] text-stone-500 mt-0.5 truncate">{elem.lord}</div>
                </div>
              ))}
            </div>

            <div className="text-[7pt] text-stone-600 italic bg-amber-50/60 p-2 rounded border border-amber-200/60">
              {panchanga.interpretation}
            </div>
          </div>

          <div className="w-full h-[1px] bg-stone-200 my-3" />

          {/* Planetary Coordinates & Dignities */}
          <div>
            <div className="section-badge">Section 04</div>
            <h3 className="section-title">{planetaryPositions.title}</h3>
            <div className="section-subtitle">{planetaryPositions.subtitle}</div>

            <div className="overflow-x-auto">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Graha</th>
                    <th>Rashi</th>
                    <th>Longitude</th>
                    <th>Nakshatra</th>
                    <th>Pada</th>
                    <th>House</th>
                    <th>Dignity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planetaryPositions.planets.map((p) => (
                    <tr key={p.name}>
                      <td className="font-bold text-[#0F172A]">
                        <span>{p.name}</span>
                        <span className="text-[6pt] font-serif text-stone-400 ml-1">({p.sanskritName.split(' ')[0]})</span>
                      </td>
                      <td>{p.sign}</td>
                      <td className="report-mono font-medium text-[7pt] text-slate-700">{p.formattedDegree}</td>
                      <td>{p.nakshatra}</td>
                      <td className="report-mono text-center font-bold text-amber-800">{p.pada}</td>
                      <td className="font-bold text-[#0F172A]">H{p.houseNumber}</td>
                      <td>
                        <span className={`px-1 py-0.5 rounded text-[6.5pt] font-semibold ${
                          p.dignity === 'EXALTED' || p.dignity === 'MOOLATRIKONA' || p.dignity === 'OWN_SIGN'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : p.dignity === 'DEBILITATED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-stone-50 text-stone-700'
                        }`}>
                          {p.dignity}
                        </span>
                      </td>
                      <td className="text-[6.5pt]">
                        <div className="flex gap-1 flex-wrap">
                          {p.isRetrograde && <span className="text-amber-700 font-bold">[R]</span>}
                          {p.isCombust && <span className="text-rose-600 font-bold">[C]</span>}
                          {!p.isRetrograde && !p.isCombust && <span className="text-stone-400">Direct</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2.5 text-[6.5pt] text-stone-500 flex gap-4">
              <span><strong>[R]</strong> Retrograde Motion (Vakri)</span>
              <span><strong>[C]</strong> Combust by Sun (Asta)</span>
              <span><strong>Dignity</strong> Classical Parashari Stithi</span>
            </div>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 03</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: VECTOR CHARTS — D1 RASHI & D9 NAVAMSHA                           */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Vedic Chart Geometry (D1 &amp; D9)</span>
          </div>

          <div className="section-badge">Section 05</div>
          <h3 className="section-title">Canonical Chart Representations</h3>
          <div className="section-subtitle">
            High-precision vector representations of the D1 Janma Kundali and D9 Navamsha Chart.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-2">
            {/* D1 Chart */}
            <div className="border border-stone-200 rounded-lg p-2.5 bg-stone-50/50 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-1.5 px-1">
                <span className="font-serif font-bold text-[#0F172A] text-xs">{d1Chart.title}</span>
                <span className="text-[6.5pt] report-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {d1Chart.chartCode}
                </span>
              </div>

              <div className="w-[230px] h-[230px]">
                <VectorChartPdf
                  title={d1Chart.title}
                  ascendantSign={d1Chart.ascendantSign}
                  houses={d1Chart.houses}
                  style={chartStyle}
                  size={230}
                />
              </div>

              <div className="text-[7pt] text-stone-600 mt-1.5 text-center italic">
                {d1Chart.purpose}
              </div>
            </div>

            {/* D9 Chart */}
            {d9Chart && (
              <div className="border border-stone-200 rounded-lg p-2.5 bg-stone-50/50 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-1.5 px-1">
                  <span className="font-serif font-bold text-[#0F172A] text-xs">{d9Chart.title}</span>
                  <span className="text-[6.5pt] report-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    {d9Chart.chartCode}
                  </span>
                </div>

                <div className="w-[230px] h-[230px]">
                  <VectorChartPdf
                    title={d9Chart.title}
                    ascendantSign={d9Chart.ascendantSign}
                    houses={d9Chart.houses}
                    style={chartStyle}
                    size={230}
                  />
                </div>

                <div className="text-[7pt] text-stone-600 mt-1.5 text-center italic">
                  {d9Chart.purpose}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-[7.5pt] text-stone-700 mt-2 leading-relaxed report-serif text-sm">
            <strong>Classical Note:</strong> The Rashi Chart (D1) indicates the physical manifestation and worldly environment of the native, while the Navamsha Chart (D9) reveals the internal fortitude, spiritual destiny, and marital harmony. Placements that receive dignity in both D1 and D9 acquire <em>Vargottama</em> potency.
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 04</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: 12 BHAVA ANALYSIS (HOUSES 1 TO 6)                                */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Bhava Sphutas &amp; Synthesis (Houses 1–6)</span>
          </div>

          <div className="section-badge">Section 06 (Part I)</div>
          <h3 className="section-title">Bhava Horizon: Houses 1 through 6</h3>
          <div className="section-subtitle">
            Systematic Parashari house dissection: lords, occupants, aspects, and grounded life indications.
          </div>

          <div className="space-y-2">
            {houses.slice(0, 6).map((h) => (
              <div key={h.houseNumber} className="card-box p-2.5 border-l-4 border-l-[#B45309]">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="report-mono font-bold text-[7.5pt] text-[#B45309]">HOUSE {h.houseNumber}</span>
                    <span className="font-serif font-bold text-[#0F172A] text-xs">{h.sign} ({h.title.split(' ')[0]})</span>
                  </div>
                  <span className="text-[7pt] text-stone-500">
                    Lord: <strong>{h.lord}</strong> (in H{h.lordPlacementHouse})
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap text-[6.5pt] mb-1">
                  {h.occupants.length > 0 ? (
                    <span className="evidence-pill">
                      Occupants: {h.occupants.join(', ')}
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[6.5pt]">No direct occupants</span>
                  )}
                  {h.aspectsReceived.length > 0 && (
                    <span className="text-stone-500 text-[6.5pt]">
                      Aspects: {h.aspectsReceived.join(', ')}
                    </span>
                  )}
                </div>

                <p className="text-[7.5pt] text-stone-700 report-serif text-sm leading-snug">
                  {h.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 05</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 6: 12 BHAVA ANALYSIS (HOUSES 7 TO 12)                               */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Bhava Sphutas &amp; Synthesis (Houses 7–12)</span>
          </div>

          <div className="section-badge">Section 06 (Part II)</div>
          <h3 className="section-title">Bhava Horizon: Houses 7 through 12</h3>
          <div className="section-subtitle">
            Continuation of house analysis covering partnerships, longevity, dharma, karma, gains, and liberation.
          </div>

          <div className="space-y-2">
            {houses.slice(6, 12).map((h) => (
              <div key={h.houseNumber} className="card-box p-2.5 border-l-4 border-l-[#1E293B]">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="report-mono font-bold text-[7.5pt] text-[#1E293B]">HOUSE {h.houseNumber}</span>
                    <span className="font-serif font-bold text-[#0F172A] text-xs">{h.sign} ({h.title.split(' ')[0]})</span>
                  </div>
                  <span className="text-[7pt] text-stone-500">
                    Lord: <strong>{h.lord}</strong> (in H{h.lordPlacementHouse})
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap text-[6.5pt] mb-1">
                  {h.occupants.length > 0 ? (
                    <span className="evidence-pill">
                      Occupants: {h.occupants.join(', ')}
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[6.5pt]">No direct occupants</span>
                  )}
                  {h.aspectsReceived.length > 0 && (
                    <span className="text-stone-500 text-[6.5pt]">
                      Aspects: {h.aspectsReceived.join(', ')}
                    </span>
                  )}
                </div>

                <p className="text-[7.5pt] text-stone-700 report-serif text-sm leading-snug">
                  {h.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 06</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 7: CANONICAL YOGAS & SHADBALA                                       */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Canonical Yogas &amp; Shadbala Potency</span>
          </div>

          {/* Section: Confirmed Yogas */}
          <div className="mb-5">
            <div className="section-badge">Section 07</div>
            <h3 className="section-title">{yogas.title}</h3>
            <div className="section-subtitle">{yogas.subtitle}</div>

            {yogas.yogas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {yogas.yogas.slice(0, 4).map((y) => (
                  <div key={y.id} className="p-2.5 rounded-md bg-[#FAF9F5] border border-stone-200">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-serif font-bold text-[#0F172A] text-xs">{y.name}</span>
                      <span className="report-mono text-[6.5pt] text-[#B45309] font-semibold">{y.classicalSource}</span>
                    </div>
                    <div className="text-[6.5pt] text-stone-500 font-mono mb-1">
                      Planets: {y.planetsInvolved.join(', ')}
                    </div>
                    <p className="text-[7pt] text-stone-700 report-serif text-sm leading-snug">
                      {y.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded bg-stone-50 border border-stone-200 text-[7.5pt] text-stone-500 italic">
                {yogas.summaryNote}
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-stone-200 my-3" />

          {/* Section: Shadbala Strengths */}
          <div>
            <div className="section-badge">Section 08</div>
            <h3 className="section-title">{strengths.title}</h3>
            <div className="section-subtitle">{strengths.subtitle}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {strengths.strengths.map((s) => (
                <div key={s.planet} className="p-2 rounded bg-stone-50 border border-stone-200 text-[7pt]">
                  <div className="flex justify-between font-bold text-[#0F172A]">
                    <span>{s.planet}</span>
                    <span className="report-mono text-amber-800">{s.totalRupas} R</span>
                  </div>
                  <div className="flex justify-between text-[6pt] text-stone-500 mt-0.5">
                    <span>Req: {s.requiredRupas} R</span>
                    <span className={`font-bold ${s.ratio >= 1.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {s.strengthStatus}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-stone-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${s.ratio >= 1.0 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, s.ratio * 80)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[7pt] text-stone-600 report-serif text-sm leading-relaxed bg-amber-50/40 p-2 rounded border border-amber-200/50">
              {strengths.interpretation}
            </p>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 07</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 8: MAJOR LIFE AREAS                                                 */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Life Domain Syntheses</span>
          </div>

          <div className="section-badge">Section 09</div>
          <h3 className="section-title">Comprehensive Life Area Syntheses</h3>
          <div className="section-subtitle">
            Multi-dimensional convergence of 1st, 2nd, 7th, 9th, 10th, and 11th bhavas with planetary karakas.
          </div>

          <div className="space-y-2.5">
            {lifeAreas.map((area) => (
              <div key={area.id} className="card-box p-2.5 border-l-4 border-l-[#D97706]">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-serif font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                    {area.id === 'career' && <Briefcase size={12} className="text-amber-600" />}
                    {area.id === 'wealth' && <Coins size={12} className="text-emerald-600" />}
                    {area.id === 'marriage' && <Heart size={12} className="text-rose-600" />}
                    {area.id === 'health' && <Activity size={12} className="text-blue-600" />}
                    {area.id === 'spirituality' && <Sparkles size={12} className="text-purple-600" />}
                    <span>{area.title}</span>
                  </span>
                  <span className="text-[6.5pt] report-mono font-semibold text-stone-500">
                    Houses: {area.primaryHouses.join(', ')}
                  </span>
                </div>

                <div className="flex gap-1.5 flex-wrap text-[6.5pt] mb-1">
                  <span className="evidence-pill">Karakas: {area.karakaPlanets.join(', ')}</span>
                  {area.chartEvidence.map((ev, i) => (
                    <span key={i} className="text-stone-500 text-[6pt] bg-stone-100 px-1.5 py-0.5 rounded">
                      {ev}
                    </span>
                  ))}
                </div>

                <p className="text-[7.5pt] text-stone-700 report-serif text-sm leading-snug">
                  {area.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 08</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 9: VIMSHOTTARI DASHA TIMELINE                                       */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Vimshottari Dasha &amp; Temporal Windows</span>
          </div>

          <div className="section-badge">Section 10</div>
          <h3 className="section-title">{dashaHierarchy.title}</h3>
          <div className="section-subtitle">{dashaHierarchy.subtitle}</div>

          {/* Active Phase Card */}
          <div className="p-3.5 rounded-md bg-[#0F172A] text-white mb-3.5 border-l-4 border-l-[#D97706] shadow-sm">
            <div className="report-cinzel text-[7pt] uppercase tracking-wider text-[#FDE68A] mb-0.5">
              Currently Operative Dasha Hierarchy
            </div>
            <div className="report-serif text-xl font-bold">
              {dashaHierarchy.currentActivePhase.mahadasha} Mahadasha
            </div>
            <div className="text-[7.5pt] text-stone-300 font-mono mt-0.5">
              Antardasha: <strong>{dashaHierarchy.currentActivePhase.antardasha}</strong> • Pratyantardasha: <strong>{dashaHierarchy.currentActivePhase.pratyantardasha}</strong>
            </div>
            <div className="text-[7pt] text-amber-200 mt-1">
              Phase Window: {dashaHierarchy.currentActivePhase.startDate} to {dashaHierarchy.currentActivePhase.endDate}
            </div>
          </div>

          {/* Active Period Grounded Interpretation */}
          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-[7.5pt] text-stone-700 mb-3 report-serif text-sm leading-relaxed">
            <strong>Parashari Synthesis of Active Period:</strong> The current temporal vibration is governed by the {dashaHierarchy.currentActivePhase.mahadasha} Mahadasha ruler and {dashaHierarchy.currentActivePhase.antardasha} Antardasha sub-ruler. Events related to their house lordships and natural significations are in a state of heightened catalyst.
          </div>

          {/* Upcoming Dasha Windows */}
          <h4 className="font-serif font-bold text-[#0F172A] text-xs mb-1.5">Upcoming Major Mahadasha Cycles</h4>
          <div className="overflow-x-auto">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mahadasha</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Span</th>
                  <th>Key Life Focus</th>
                </tr>
              </thead>
              <tbody>
                {dashaHierarchy.upcomingMahadashas.map((m) => (
                  <tr key={m.lord}>
                    <td className="font-bold text-[#0F172A]">{m.lord}</td>
                    <td className="report-mono text-[7pt]">{m.startDate}</td>
                    <td className="report-mono text-[7pt]">{m.endDate}</td>
                    <td className="font-semibold text-amber-800">{m.years} Years</td>
                    <td className="text-[7pt] text-stone-600">{m.keyThemes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 09</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 10: GOCHARA (TRANSITS) & ASHTAKAVARGA MATRIX                         */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Gochara Transits &amp; Ashtakavarga Matrix</span>
          </div>

          {/* Transits Section */}
          <div className="mb-5">
            <div className="section-badge">Section 11</div>
            <h3 className="section-title">{transits.title}</h3>
            <div className="section-subtitle">{transits.subtitle}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {transits.transits.map((t) => (
                <div key={t.planet} className="p-2.5 rounded bg-stone-50 border border-stone-200 text-[7.5pt]">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-[#0F172A]">{t.planet} in {t.currentSign}</span>
                    <span className="report-mono text-[6.5pt] text-amber-800 font-semibold">
                      H{t.houseFromLagna} Lagna / H{t.houseFromMoon} Moon
                    </span>
                  </div>
                  <p className="text-[7pt] text-stone-600 report-serif text-sm leading-snug">
                    {t.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-stone-200 my-3" />

          {/* Ashtakavarga Matrix */}
          <div>
            <div className="section-badge">Section 12</div>
            <h3 className="section-title">{ashtakavarga.title}</h3>
            <div className="section-subtitle">{ashtakavarga.subtitle}</div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-2.5">
              {ashtakavarga.houseScores.map((h) => (
                <div
                  key={h.houseNumber}
                  className={`p-1 rounded text-center border ${
                    h.savPoints >= 30
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : h.savPoints < 25
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  <span className="text-[5.5pt] uppercase font-bold block text-stone-400">H{h.houseNumber}</span>
                  <span className="text-[11px] font-bold font-mono block">{h.savPoints}</span>
                  <span className="text-[5pt] truncate block text-stone-500">{h.sign.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            <p className="text-[7pt] text-stone-600 report-serif text-sm leading-relaxed bg-amber-50/40 p-2 rounded border border-amber-200/50">
              {ashtakavarga.interpretation}
            </p>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 10</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 11: TRADITIONAL REMEDIES & DISCLAIMERS                              */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Vedic Remedial Measures &amp; Karma Alignment</span>
          </div>

          <div className="section-badge">Section 13</div>
          <h3 className="section-title">{remedies.title}</h3>
          <div className="section-subtitle">{remedies.subtitle}</div>

          <div className="space-y-2.5 mb-5">
            {remedies.remedies.map((rem, i) => (
              <div key={i} className="card-box p-2.5 border-l-4 border-l-[#92400E]">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-serif font-bold text-[#0F172A] text-xs">
                    {rem.type.toUpperCase()}: {rem.targetPlanet} Alignment
                  </span>
                  <span className="text-[6.5pt] report-mono font-semibold text-stone-500">{rem.suitableTiming}</span>
                </div>
                <div className="font-mono text-[7pt] text-amber-900 font-bold mb-0.5">
                  {rem.description}
                </div>
                <p className="text-[7pt] text-stone-600 report-serif text-sm leading-snug">
                  {rem.rationale}
                </p>
              </div>
            ))}
          </div>

          {/* Ethical Disclaimer */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[7pt] text-amber-900 leading-relaxed">
            <strong>Traditional &amp; Ethical Disclaimer:</strong> {remedies.disclaimer}
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 11</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 12: EXECUTIVE SUMMARY & TECHNICAL APPENDIX                           */}
      {/* ========================================================================= */}
      <div className="report-page">
        <div className="page-content-flow">
          <div className="running-header">
            <span>AstroWorld • Vedic Astrological Life Report</span>
            <span>Synthesis Summary &amp; Technical Appendix</span>
          </div>

          {/* Executive Summary */}
          <div className="mb-5">
            <div className="section-badge">Section 14</div>
            <h3 className="section-title">{summary.title}</h3>
            <div className="section-subtitle">{summary.subtitle}</div>

            <div className="p-2.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-md mb-3 text-[7.5pt] report-serif text-sm leading-relaxed text-[#1C1917]">
              {summary.closingAffirmation}
            </div>

            <div className="space-y-1">
              {summary.coreThemes.map((theme, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[7.5pt] text-stone-700">
                  <CheckCircle2 size={11} className="text-[#B45309] shrink-0 mt-0.5" />
                  <span>{theme}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-stone-200 my-3" />

          {/* Technical Appendix */}
          <div>
            <div className="section-badge">Section 15</div>
            <h3 className="section-title">{technicalAppendix.title}</h3>
            <div className="section-subtitle">{technicalAppendix.subtitle}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[6.5pt] report-mono">
              <div className="p-1.5 bg-stone-50 border border-stone-200 rounded">
                <span className="text-stone-400 block text-[5.5pt]">AYANAMSA</span>
                <span className="font-bold text-[#0F172A] truncate block">{technicalAppendix.ayanamsa}</span>
              </div>
              <div className="p-1.5 bg-stone-50 border border-stone-200 rounded">
                <span className="text-stone-400 block text-[5.5pt]">EPHEMERIS ENGINE</span>
                <span className="font-bold text-[#0F172A] truncate block">{technicalAppendix.ephemerisSource}</span>
              </div>
              <div className="p-1.5 bg-stone-50 border border-stone-200 rounded">
                <span className="text-stone-400 block text-[5.5pt]">COORDINATES</span>
                <span className="font-bold text-[#0F172A] truncate block">{technicalAppendix.geographicalCoordinates}</span>
              </div>
              <div className="p-1.5 bg-stone-50 border border-stone-200 rounded">
                <span className="text-stone-400 block text-[5.5pt]">STANDARDS</span>
                <span className="font-bold text-[#0F172A] truncate block">{technicalAppendix.calculationEngine}</span>
              </div>
            </div>

            <div className="mt-3 text-[6pt] text-stone-400 text-center">
              End of Canonical Astrological Dossier • AstroWorld Platform • All Rights Reserved.
            </div>
          </div>
        </div>

        <div className="running-footer">
          <span>AstroWorld Engine • Brihat Parashara Hora Shastra</span>
          <span>Confidential • Prepared for {cover.nativeName}</span>
          <span>Page 12 (Final)</span>
        </div>
      </div>
    </div>
  );
};
