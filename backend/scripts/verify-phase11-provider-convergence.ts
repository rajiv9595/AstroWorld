/**
 * ASTROWORLD — Phase 11 Provider Convergence TDD
 *
 * RED contract: every AI V2 deterministic tool must execute through the
 * configured ephemeris provider, and evidence provenance must identify the same
 * provider selected by runtime configuration.
 */

import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';
import { TEST_BENCHMARK_PROFILE } from '../../shared/index.ts';
import { computeCanonicalChartWithConfiguredEphemeris as computeConfiguredChart } from '../src/services/ephemeris/providerRuntime.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const original = process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
  try {
    process.env.ASTROWORLD_EPHEMERIS_PROVIDER = 'swiss-ephemeris';

    const expectedChart = await computeConfiguredChart(
      TEST_BENCHMARK_PROFILE,
      new Date('2026-10-05T00:00:00.000Z'),
    );

    const toolCases = [
      ['get_birth_chart', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_all_divisional_charts', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_divisional_chart', { birthProfile: TEST_BENCHMARK_PROFILE, vargaCode: 'D9' }],
      ['get_current_dasha', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_dasha_at', { birthProfile: TEST_BENCHMARK_PROFILE, targetDateIso: '2028-01-01T00:00:00.000Z' }],
      ['get_transits', { birthProfile: TEST_BENCHMARK_PROFILE, targetDateIso: '2026-10-05T00:00:00.000Z' }],
      ['get_active_yogas', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_planetary_strength', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_ashtakavarga', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_jaimini_details', { birthProfile: TEST_BENCHMARK_PROFILE }],
      ['get_panchanga', { birthProfile: TEST_BENCHMARK_PROFILE }],
    ] as const;

    for (const [toolName, args] of toolCases) {
      const result = await AstrologyToolRegistry.executeTool(toolName, args);
      assert(result.success === true, toolName + ' succeeds through configured provider.');
      assert(
        result.provenance?.sourceEngine?.includes('ephemeris:swiss-ephemeris'),
        toolName + ' provenance identifies the configured Swiss provider.',
      );
    }

    const birthChart = await AstrologyToolRegistry.executeTool(
      'get_birth_chart',
      { birthProfile: TEST_BENCHMARK_PROFILE },
    );
    const moon = birthChart.data?.planets?.find((p: any) => p.name === 'Moon');
    const expectedMoon = expectedChart.planets.find((p: any) => p.name === 'Moon');

    assert(Boolean(moon && expectedMoon), 'Provider-aware AI chart and canonical Swiss chart both contain Moon.');
    assert(
      Math.abs(Number(moon?.siderealLongitude) - Number(expectedMoon?.siderealLongitude)) < 1e-12,
      'AI Moon longitude exactly matches the configured Swiss canonical chart.',
    );

    console.log('PHASE 11 PROVIDER CONVERGENCE TDD: PASS');
  } finally {
    if (original === undefined) delete process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
    else process.env.ASTROWORLD_EPHEMERIS_PROVIDER = original;
  }
}

main().catch((error) => {
  console.error('PHASE 11 PROVIDER CONVERGENCE TDD: FAIL');
  console.error(error);
  process.exitCode = 1;
});
