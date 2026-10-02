/**
 * ASTROWORLD — View 14: Developer, Research & Golden Verification Hub
 * Real-time golden regression test runner, raw JSON data inspector, and provenance audit.
 * Clean, standard, and professional light aesthetic matching AstroWorld theme.
 */

import React, { useState } from 'react';
import { AIInterpretationContext } from '../engine/types.ts';
import { computeCanonicalChart, GOLDEN_BENCHMARK_PROFILE } from '../engine/canonicalChart.ts';
import { Terminal, CheckCircle2, XCircle, Code, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface ResearchViewProps {
  context: AIInterpretationContext;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ context }) => {
  const [selectedJsonTab, setSelectedJsonTab] = useState<'FULL' | 'PLANETS' | 'VARGAS' | 'DASHA' | 'EVIDENCE'>('FULL');
  const [testResults, setTestResults] = useState<{
    testedAt: string;
    passed: boolean;
    assertions: { title: string; expected: string; actual: string; passed: boolean }[];
  } | null>(null);

  const runGoldenRegressionTests = () => {
    const goldenChart = computeCanonicalChart(GOLDEN_BENCHMARK_PROFILE);

    const expectedD1: Record<string, string> = {
      Sun: 'Leo',
      Moon: 'Sagittarius',
      Mars: 'Aries',
      Mercury: 'Cancer',
      Jupiter: 'Virgo',
      Venus: 'Virgo',
      Saturn: 'Cancer',
      Rahu: 'Pisces',
      Ketu: 'Virgo',
    };

    const expectedD9: Record<string, string> = {
      Sun: 'Aries',
      Moon: 'Virgo',
      Mars: 'Leo',
      Mercury: 'Scorpio',
      Jupiter: 'Cancer',
      Venus: 'Aquarius',
      Saturn: 'Libra',
      Rahu: 'Capricorn',
      Ketu: 'Cancer',
    };

    const assertions: { title: string; expected: string; actual: string; passed: boolean }[] = [];

    // Test D1 Placements
    for (const [planet, expSign] of Object.entries(expectedD1)) {
      const actual = goldenChart.planets.find((p) => p.name === planet)?.sign || '';
      assertions.push({
        title: `D1 ${planet} Sign Concordance`,
        expected: expSign,
        actual,
        passed: actual === expSign,
      });
    }

    // Test D9 Placements
    for (const [planet, expSign] of Object.entries(expectedD9)) {
      const actual = goldenChart.vargas.D9.planets.find((p) => p.planet === planet)?.vargaSign || '';
      assertions.push({
        title: `D9 ${planet} Sign Concordance`,
        expected: expSign,
        actual,
        passed: actual === expSign,
      });
    }

    // Test Dignity Separation
    const d1SunDig = goldenChart.planets.find((p) => p.name === 'Sun')?.dignity;
    const d9SunDig = goldenChart.vargas.D9.planets.find((p) => p.planet === 'Sun')?.dignity;
    assertions.push({
      title: 'D1 Sun Moolatrikona Dignity',
      expected: 'MOOLATRIKONA',
      actual: d1SunDig || '',
      passed: d1SunDig === 'MOOLATRIKONA',
    });
    assertions.push({
      title: 'D9 Sun Exalted Dignity (Independent Scope)',
      expected: 'EXALTED',
      actual: d9SunDig || '',
      passed: d9SunDig === 'EXALTED',
    });

    // Test Ashtakavarga Invariant
    const totalSav = goldenChart.ashtakavarga.sarvashtakavargaTotal;
    assertions.push({
      title: 'Ashtakavarga 337 Bindu Total Invariant',
      expected: '337',
      actual: totalSav.toString(),
      passed: totalSav === 337,
    });

    // Test Ascendant
    assertions.push({
      title: 'Ascendant (Lagna) Taurus Sign Concordance',
      expected: 'Taurus',
      actual: goldenChart.ascendant.sign,
      passed: goldenChart.ascendant.sign === 'Taurus',
    });

    const allPassed = assertions.every((a) => a.passed);
    setTestResults({
      testedAt: new Date().toLocaleTimeString(),
      passed: allPassed,
      assertions,
    });
  };

  const getFilteredJson = () => {
    switch (selectedJsonTab) {
      case 'PLANETS':
        return context.planets;
      case 'VARGAS':
        return context.vargas;
      case 'DASHA':
        return context.dasha;
      case 'EVIDENCE':
        return context.evidencePool;
      default:
        return context;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#162058] flex items-center gap-2">
            <Terminal className="text-orange-500 w-6 h-6" />
            Developer, Research &amp; Golden Verification Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated regression runner, mathematical invariant auditor, and canonical JSON inspector.
          </p>
        </div>

        <button
          onClick={runGoldenRegressionTests}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-md transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Run Golden Benchmark Tests
        </button>
      </div>

      {/* Regression Results Card */}
      {testResults && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {testResults.passed ? (
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              ) : (
                <XCircle className="text-red-600 w-5 h-5" />
              )}
              <h3 className="font-serif font-bold text-base text-[#162058]">
                Automated Test Suite Status:{' '}
                <span className={testResults.passed ? 'text-emerald-700' : 'text-red-700'}>
                  {testResults.passed ? 'ALL ASSERTIONS PASSED (100%)' : 'ASSERTIONS FAILED'}
                </span>
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Executed at {testResults.testedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {testResults.assertions.map((a, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  a.passed
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                <span>{a.title}</span>
                <span className="font-bold">
                  {a.passed ? 'MATCH' : `EXP: ${a.expected} | GOT: ${a.actual}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Canonical Fact JSON Explorer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-orange-500" />
            <h3 className="font-serif font-bold text-base text-[#162058]">
              Raw Canonical Facts Graph (Immutable Evidence Pool)
            </h3>
          </div>

          <div className="flex bg-[#FAF7F2] border border-slate-200 rounded-xl p-1 text-xs">
            {(['FULL', 'PLANETS', 'VARGAS', 'DASHA', 'EVIDENCE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedJsonTab(tab)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                  selectedJsonTab === tab
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#162058]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <pre className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono text-slate-800 max-h-[500px] scrollbar-thin">
          {JSON.stringify(getFilteredJson(), null, 2)}
        </pre>
      </div>
    </div>
  );
};
