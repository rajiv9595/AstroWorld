/**
 * ASTROWORLD — Phase 6 Temporal/Event Precision Contract
 *
 * Contract layers:
 * 1. Frozen event vectors generated independently with Python pyswisseph /
 *    Swiss Ephemeris 2.10.03.
 * 2. Swiss Node provider must reproduce those vectors within 2 seconds.
 * 3. Astronomy Engine provider must remain within 60 seconds of the same
 *    controlled event reference.
 * 4. Solar ingress and Moon Nakshatra searches must return correctly ordered
 *    events, including 0-degree wrap-around cases.
 *
 * The frozen oracle uses the same Swiss Ephemeris computational core as the
 * Swiss Node adapter, so this is an independent execution path, not an
 * independent ephemeris-model claim.
 */

import {
  astronomyEngineEphemerisProvider,
  findNextSiderealSolarIngress,
  findSiderealMoonNakshatraTransition,
} from '../../shared/index.ts';
import { createSwissEphemerisProvider, closeSwissEphemeris } from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type EventVector = {
  label: string;
  startUtc: string;
  expectedUtc: string;
  expectedBoundaryDeg: number;
};

const SOLAR_VECTORS: EventVector[] = [
  {
    label: 'Sun sidereal ingress to 0° Aries wrap',
    startUtc: '2024-04-13T00:00:00.000Z',
    expectedUtc: '2024-04-13T15:34:23.324Z',
    expectedBoundaryDeg: 0,
  },
  {
    label: 'Sun sidereal ingress after 0° Aries',
    startUtc: '2024-04-14T00:00:00.000Z',
    expectedUtc: '2024-05-14T12:23:42.279Z',
    expectedBoundaryDeg: 30,
  },
  {
    label: 'Sun sidereal ingress 2026',
    startUtc: '2026-10-05T00:00:00.000Z',
    expectedUtc: '2026-10-17T14:21:42.180Z',
    expectedBoundaryDeg: 180,
  },
];

const MOON_NEXT_VECTORS: EventVector[] = [
  {
    label: 'Moon next Nakshatra at 0° wrap',
    startUtc: '2024-09-19T12:00:00.000Z',
    expectedUtc: '2024-09-19T23:45:08.973Z',
    expectedBoundaryDeg: 0,
  },
  {
    label: 'Moon next Nakshatra 2005',
    startUtc: '2005-08-17T06:00:00.000Z',
    expectedUtc: '2005-08-17T08:41:52.481Z',
    expectedBoundaryDeg: 266.666666667,
  },
  {
    label: 'Moon next Nakshatra 2026',
    startUtc: '2026-10-05T06:00:00.000Z',
    expectedUtc: '2026-10-05T17:39:28.784Z',
    expectedBoundaryDeg: 106.666666667,
  },
];

const MOON_PREVIOUS_VECTORS: EventVector[] = [
  {
    label: 'Moon previous Nakshatra across 0° wrap',
    startUtc: '2024-09-19T12:00:00.000Z',
    expectedUtc: '2024-09-19T02:34:13.238Z',
    expectedBoundaryDeg: 346.666666667,
  },
  {
    label: 'Moon previous Nakshatra 2024',
    startUtc: '2024-03-10T06:00:00.000Z',
    expectedUtc: '2024-03-09T23:26:10.561Z',
    expectedBoundaryDeg: 320,
  },
  {
    label: 'Moon previous Nakshatra 2026',
    startUtc: '2026-10-05T06:00:00.000Z',
    expectedUtc: '2026-10-04T18:44:03.385Z',
    expectedBoundaryDeg: 93.333333333,
  },
];

function absSeconds(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 1000;
}

function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function circularDistanceDegrees(a: number, b: number): number {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}

function getMoonLongitudeAt(
  date: Date,
  provider: typeof astronomyEngineEphemerisProvider,
): number {
  const moon = provider.getPlanetaryPositions(date).find((p) => p.name === 'Moon');
  if (!moon || !Number.isFinite(moon.siderealLongitude)) {
    throw new Error('Provider returned no finite Moon longitude.');
  }
  return normalizeDegrees(moon.siderealLongitude);
}

function assertFutureOrPrevious(
  actual: Date,
  start: Date,
  direction: -1 | 1,
  label: string,
): void {
  const valid = direction > 0 ? actual.getTime() > start.getTime() : actual.getTime() < start.getTime();
  if (!valid) {
    throw new Error(
      label + ': expected ' + (direction > 0 ? 'future' : 'previous') + ' event; got ' + actual.toISOString(),
    );
  }
}

async function main(): Promise<void> {
  console.log('⏳ AstroWorld Phase 6 temporal/event precision contract\\n');

  let passed = 0;
  let failed = 0;
  let maxSwissDelta = 0;
  let maxAstronomyBoundaryError = 0;

  function pass(name: string, detail: string): void {
    passed++;
    console.log('✅ ' + name + ': ' + detail);
  }

  function fail(name: string, detail: string): void {
    failed++;
    console.error('❌ ' + name + ': ' + detail);
  }

  const swiss = await createSwissEphemerisProvider();

  try {
    for (const vector of SOLAR_VECTORS) {
      const start = new Date(vector.startUtc);
      const expected = new Date(vector.expectedUtc);

      try {
        const swissActual = findNextSiderealSolarIngress(start, swiss);
        assertFutureOrPrevious(swissActual.timestampUtc, start, 1, vector.label + ' Swiss');

        const swissDelta = absSeconds(swissActual.timestampUtc, expected);
        if (swissDelta > 2) throw new Error('Swiss delta ' + swissDelta.toFixed(3) + 's exceeds 2s');
        maxSwissDelta = Math.max(maxSwissDelta, swissDelta);
        pass(vector.label + ' Swiss oracle', 'Δ ' + swissDelta.toFixed(3) + 's; target sign index ' + swissActual.targetSignIndex);

        const astronomyActual = findNextSiderealSolarIngress(start, astronomyEngineEphemerisProvider);
        assertFutureOrPrevious(astronomyActual.timestampUtc, start, 1, vector.label + ' Astronomy Engine');

        const boundaryLon = astronomyEngineEphemerisProvider.getPlanetaryPositions(astronomyActual.timestampUtc)
          .find((p) => p.name === 'Sun')?.siderealLongitude;
        if (boundaryLon === undefined) {
          throw new Error('Astronomy Engine returned no Sun longitude at the ingress event.');
        }
        const boundaryError = circularDistanceDegrees(boundaryLon, vector.expectedBoundaryDeg);
        if (boundaryError > 0.00001) {
          throw new Error(
            'Astronomy Engine Sun longitude boundary residual ' +
            boundaryError.toFixed(9) + '° exceeds 0.00001°.',
          );
        }
        maxAstronomyBoundaryError = Math.max(maxAstronomyBoundaryError, boundaryError);

        pass(
          vector.label + ' Astronomy Engine',
          'strict future event; boundary ' + boundaryLon.toFixed(9) +
          '°; residual ' + boundaryError.toFixed(9) + '°',
        );
      } catch (error) {
        fail(vector.label, error instanceof Error ? error.message : String(error));
      }
    }

    for (const vector of MOON_NEXT_VECTORS) {
      const start = new Date(vector.startUtc);
      const expected = new Date(vector.expectedUtc);

      try {
        const swissActual = findSiderealMoonNakshatraTransition(start, 1, swiss);
        assertFutureOrPrevious(swissActual, start, 1, vector.label + ' Swiss');

        const swissDelta = absSeconds(swissActual, expected);
        if (swissDelta > 2) throw new Error('Swiss delta ' + swissDelta.toFixed(3) + 's exceeds 2s');
        maxSwissDelta = Math.max(maxSwissDelta, swissDelta);
        pass(vector.label + ' Swiss oracle', 'Δ ' + swissDelta.toFixed(3) + 's');

        const astronomyActual = findSiderealMoonNakshatraTransition(
          start,
          1,
          astronomyEngineEphemerisProvider,
        );
        assertFutureOrPrevious(astronomyActual, start, 1, vector.label + ' Astronomy Engine');

        const boundaryLon = getMoonLongitudeAt(astronomyActual, astronomyEngineEphemerisProvider);
        const boundaryError = circularDistanceDegrees(boundaryLon, vector.expectedBoundaryDeg);
        if (boundaryError > 0.00001) {
          throw new Error(
            'Astronomy Engine Moon longitude boundary residual ' +
            boundaryError.toFixed(9) + '° exceeds 0.00001°.',
          );
        }
        maxAstronomyBoundaryError = Math.max(maxAstronomyBoundaryError, boundaryError);

        pass(
          vector.label + ' Astronomy Engine',
          'strict future event; boundary ' + boundaryLon.toFixed(9) +
          '°; residual ' + boundaryError.toFixed(9) + '°',
        );
      } catch (error) {
        fail(vector.label, error instanceof Error ? error.message : String(error));
      }
    }

    for (const vector of MOON_PREVIOUS_VECTORS) {
      const start = new Date(vector.startUtc);
      const expected = new Date(vector.expectedUtc);

      try {
        const swissActual = findSiderealMoonNakshatraTransition(start, -1, swiss);
        assertFutureOrPrevious(swissActual, start, -1, vector.label + ' Swiss');

        const swissDelta = absSeconds(swissActual, expected);
        if (swissDelta > 2) throw new Error('Swiss delta ' + swissDelta.toFixed(3) + 's exceeds 2s');
        maxSwissDelta = Math.max(maxSwissDelta, swissDelta);
        pass(vector.label + ' Swiss oracle', 'Δ ' + swissDelta.toFixed(3) + 's');

        const astronomyActual = findSiderealMoonNakshatraTransition(
          start,
          -1,
          astronomyEngineEphemerisProvider,
        );
        assertFutureOrPrevious(astronomyActual, start, -1, vector.label + ' Astronomy Engine');

        const astronomyDelta = absSeconds(astronomyActual, expected);
        if (astronomyDelta > 60) throw new Error('Astronomy Engine delta ' + astronomyDelta.toFixed(3) + 's exceeds 60s');
        maxAstronomyDelta = Math.max(maxAstronomyDelta, astronomyDelta);

        const boundaryLon = getMoonLongitudeAt(astronomyActual, astronomyEngineEphemerisProvider);
        if (circularDistanceDegrees(boundaryLon, vector.expectedBoundaryDeg) > 0.02) {
          throw new Error('Astronomy Engine Moon longitude is not on the expected Nakshatra boundary.');
        }

        pass(vector.label + ' Astronomy Engine', 'Δ ' + astronomyDelta.toFixed(3) + 's; boundary ' + boundaryLon.toFixed(9) + '°');
      } catch (error) {
        fail(vector.label, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('\\n==================================================');
    console.log('PHASE 6 TEMPORAL/EVENT PRECISION: ' + passed + ' PASSED | ' + failed + ' FAILED');
    console.log('Max Swiss oracle delta: ' + maxSwissDelta.toFixed(3) + 's');
    console.log('Max Astronomy Engine delta: ' + maxAstronomyDelta.toFixed(3) + 's');
    console.log('Contracts: Swiss ≤ 2s to frozen vectors; Astronomy Engine ≤ 60s; strict event ordering.');
    console.log('==================================================\\n');

    if (failed > 0) process.exitCode = 1;
  } finally {
    await closeSwissEphemeris();
  }
}

main().catch((error) => {
  console.error('❌ Phase 6 temporal/event precision contract failed:', error);
  process.exitCode = 1;
});
