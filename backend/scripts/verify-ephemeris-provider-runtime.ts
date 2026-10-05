/**
 * ASTROWORLD — Phase 5B Ephemeris Runtime Provider Contract
 *
 * Verifies:
 * - astronomy-engine is the safe default runtime provider.
 * - invalid provider names are rejected.
 * - Swiss provider selection is explicit but lazy (no native module load here).
 * - configured Astronomy Engine snapshots preserve the validated canonical
 *   natal facts and attach provider provenance.
 */

import {
  computeCanonicalChart,
  TEST_BENCHMARK_PROFILE,
} from '../../../shared/index.ts';
import {
  computeCanonicalChartWithConfiguredEphemeris,
  getConfiguredEphemerisProvider,
  getConfiguredEphemerisSource,
} from '../src/services/ephemeris/providerRuntime.ts';

async function main() {
  console.log('🧭 AstroWorld Phase 5B ephemeris runtime provider contract\n');

  const original = process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      passed++;
      console.log(`✅ ${name}: ${detail}`);
    } else {
      failed++;
      console.error(`❌ ${name}: ${detail}`);
    }
  }

  try {
    delete process.env.ASTROWORLD_EPHEMERIS_PROVIDER;

    assert(
      'Default provider selection',
      getConfiguredEphemerisSource() === 'astronomy-engine',
      'No env override resolves to astronomy-engine',
    );

    assert(
      'Explicit Astronomy Engine selection',
      getConfiguredEphemerisSource('astronomy-engine') === 'astronomy-engine',
      'Provider name accepted',
    );

    assert(
      'Swiss provider selection is explicit',
      getConfiguredEphemerisProvider.call(undefined).source === 'astronomy-engine',
      'Default provider object is browser-safe Astronomy Engine',
    );

    let rejected = false;
    try {
      getConfiguredEphemerisSource('not-a-provider');
    } catch {
      rejected = true;
    }
    assert(
      'Invalid provider rejected',
      rejected,
      'Unknown provider names fail closed',
    );

    process.env.ASTROWORLD_EPHEMERIS_PROVIDER = 'swiss-ephemeris';
    const swissProvider = getConfiguredEphemerisProvider();
    assert(
      'Swiss provider is opt-in',
      swissProvider.source === 'swiss-ephemeris',
      'Selection succeeds without loading the native module',
    );

    process.env.ASTROWORLD_EPHEMERIS_PROVIDER = 'astronomy-engine';
    const configuredChart = await computeCanonicalChartWithConfiguredEphemeris(
      TEST_BENCHMARK_PROFILE,
      new Date('2026-10-05T00:00:00.000Z'),
    );
    const legacyChart = computeCanonicalChart(
      TEST_BENCHMARK_PROFILE,
      new Date('2026-10-05T00:00:00.000Z'),
    );

    const configuredByName = new Map(
      configuredChart.planets.map((p) => [p.name, p.siderealLongitude]),
    );
    const legacyByName = new Map(
      legacyChart.planets.map((p) => [p.name, p.siderealLongitude]),
    );

    let maxLongitudeDelta = 0;
    for (const [name, configuredLongitude] of configuredByName) {
      const legacyLongitude = legacyByName.get(name);
      if (legacyLongitude === undefined) continue;
      maxLongitudeDelta = Math.max(
        maxLongitudeDelta,
        Math.abs(configuredLongitude - legacyLongitude),
      );
    }

    assert(
      'Canonical natal facts preserved',
      configuredChart.ascendant.siderealLongitude === legacyChart.ascendant.siderealLongitude &&
        maxLongitudeDelta === 0,
      `Ascendant and all 9 planet sidereal longitudes unchanged; max delta=${maxLongitudeDelta}°`,
    );

    assert(
      'Provider provenance attached',
      configuredChart.ephemeris?.source === 'astronomy-engine' &&
        configuredChart.evidencePool.some(
          (e) => e.evidenceId === 'EVID_EPHEMERIS_PROVIDER',
        ),
      'Canonical context and evidence pool record the selected source',
    );

    console.log(`\n==================================================`);
    console.log(`PHASE 5B EPHEMERIS RUNTIME: ${passed} PASSED | ${failed} FAILED`);
    console.log(`==================================================\n`);

    if (failed > 0) process.exit(1);
  } finally {
    if (original === undefined) delete process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
    else process.env.ASTROWORLD_EPHEMERIS_PROVIDER = original;
  }
}

main();
