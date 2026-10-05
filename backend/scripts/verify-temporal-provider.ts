/**
 * ASTROWORLD — Phase 5C Temporal Ephemeris Provider Contract
 *
 * Covers:
 * - default Astronomy Engine temporal behavior is unchanged;
 * - transit and solar-ingress searches can consume an explicit provider;
 * - Comprehensive Panchanga can consume an explicit provider;
 * - Swiss provider executes the same temporal surface after initialization;
 * - canonical chart + transit/Panchanga calculations can run with Swiss.
 */

import {
  astronomyEngineEphemerisProvider,
  calculateComprehensiveDailyPanchanga,
  calculateTransits,
  computeCanonicalChart,
  findNextSiderealSolarIngress,
  TEST_BENCHMARK_PROFILE,
} from '../../shared/index.ts';
import {
  createSwissEphemerisProvider,
  createSwissEphemerisSnapshot,
  closeSwissEphemeris,
} from '../src/services/ephemeris/swissEphemerisAdapter.ts';

const EVAL_DATE = new Date('2026-10-05T00:00:00.000Z');

async function main() {
  console.log('⏱️ AstroWorld Phase 5C temporal ephemeris provider contract\n');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      passed++;
      console.log('✅ ' + name + ': ' + detail);
    } else {
      failed++;
      console.error('❌ ' + name + ': ' + detail);
    }
  }

  try {
    const legacyChart = computeCanonicalChart(TEST_BENCHMARK_PROFILE, EVAL_DATE);

    const defaultTransit = calculateTransits(
      legacyChart.planets,
      legacyChart.ascendant.signIndex,
      legacyChart.ashtakavarga,
      EVAL_DATE,
    );
    const explicitTransit = calculateTransits(
      legacyChart.planets,
      legacyChart.ascendant.signIndex,
      legacyChart.ashtakavarga,
      EVAL_DATE,
      astronomyEngineEphemerisProvider,
    );
    assert(
      'Default transit path preserved',
      JSON.stringify(defaultTransit) === JSON.stringify(explicitTransit),
      'Implicit and explicit Astronomy Engine transit paths are identical',
    );

    const defaultIngress = findNextSiderealSolarIngress(EVAL_DATE);
    const explicitIngress = findNextSiderealSolarIngress(EVAL_DATE, astronomyEngineEphemerisProvider);
    assert(
      'Default solar-ingress path preserved',
      defaultIngress.timestampUtc.getTime() === explicitIngress.timestampUtc.getTime() &&
        defaultIngress.targetSignIndex === explicitIngress.targetSignIndex,
      'Implicit and explicit Astronomy Engine ingress paths are identical',
    );

    const dailyDate = new Date('2005-08-17T06:00:00.000Z');
    const defaultDaily = calculateComprehensiveDailyPanchanga(
      dailyDate,
      TEST_BENCHMARK_PROFILE.latitude,
      TEST_BENCHMARK_PROFILE.longitude,
      TEST_BENCHMARK_PROFILE.timezone,
      TEST_BENCHMARK_PROFILE.cityName,
    );
    const explicitDaily = calculateComprehensiveDailyPanchanga(
      dailyDate,
      TEST_BENCHMARK_PROFILE.latitude,
      TEST_BENCHMARK_PROFILE.longitude,
      TEST_BENCHMARK_PROFILE.timezone,
      TEST_BENCHMARK_PROFILE.cityName,
      astronomyEngineEphemerisProvider,
    );
    assert(
      'Default Panchanga temporal path preserved',
      JSON.stringify(defaultDaily) === JSON.stringify(explicitDaily),
      'Implicit and explicit Astronomy Engine Panchanga paths are identical',
    );

    const swissProvider = await createSwissEphemerisProvider();
    const swissPositions = swissProvider.getPlanetaryPositions(EVAL_DATE);
    const swissSnapshot = await createSwissEphemerisSnapshot(
      new Date('2005-08-16T18:32:00.000Z'),
      { latitude: TEST_BENCHMARK_PROFILE.latitude, longitude: TEST_BENCHMARK_PROFILE.longitude },
    );
    assert(
      'Swiss temporal planet positions',
      swissPositions.length === 9 && swissPositions.every((p) => Number.isFinite(p.siderealLongitude)),
      'Swiss provider returned all 9 sidereal planet/node positions',
    );

    const swissDaily = calculateComprehensiveDailyPanchanga(
      dailyDate,
      TEST_BENCHMARK_PROFILE.latitude,
      TEST_BENCHMARK_PROFILE.longitude,
      TEST_BENCHMARK_PROFILE.timezone,
      TEST_BENCHMARK_PROFILE.cityName,
      swissProvider,
    );
    assert(
      'Swiss Panchanga temporal surface',
      Boolean(swissDaily.panchanga.tithi.name) &&
        Boolean(swissDaily.panchanga.nakshatra.name) &&
        Boolean(swissDaily.panchanga.sunriseUtc) &&
        Boolean(swissDaily.panchanga.sunsetUtc) &&
        Boolean(swissDaily.solarLunar.moonrise) &&
        Boolean(swissDaily.solarLunar.moonset),
      'Swiss provider supplied Sun/Moon positions and horizon events',
    );

    const swissChart = computeCanonicalChart(
      TEST_BENCHMARK_PROFILE,
      EVAL_DATE,
      swissSnapshot,
      swissProvider,
    );
    assert(
      'Swiss canonical temporal integration',
      swissChart.ephemeris?.source === 'swiss-ephemeris' &&
        swissChart.transits.planets.length === 9 &&
        Boolean(swissChart.transits.solarIngress?.timestampUtc) &&
        Boolean(swissChart.panchanga.tithi.name) &&
        Boolean(swissChart.panchanga.nakshatra.name),
      'Canonical D1 + Panchanga limb values + Transit calculations consume the Swiss provider',
    );

    const swissIngress = findNextSiderealSolarIngress(EVAL_DATE, swissProvider);
    assert(
      'Swiss solar-ingress search',
      swissIngress.timestampUtc.getTime() > EVAL_DATE.getTime() &&
        swissIngress.targetSignIndex >= 0 &&
        swissIngress.targetSignIndex < 12,
      'Swiss ingress search returned a valid future event',
    );

    console.log('\n==================================================');
    console.log('PHASE 5C TEMPORAL PROVIDER: ' + passed + ' PASSED | ' + failed + ' FAILED');
    console.log('==================================================\n');
    if (failed > 0) process.exit(1);
  } finally {
    await closeSwissEphemeris();
  }
}

main();
