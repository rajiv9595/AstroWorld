/**
 * ASTROWORLD — Phase 7 Independent Horizon Reference Contract
 *
 * This gate introduces a horizon reference that does not call Swiss Ephemeris
 * or Astronomy Engine. The reference implementation follows NOAA/GML's
 * published low-accuracy sunrise/sunset equations:
 *   - fractional-year equation of time;
 *   - solar declination;
 *   - 90.833° sunrise/sunset zenith;
 *   - UTC minute formula using east-positive longitude.
 *
 * This is a model-reference contract, not an observed-weather accuracy claim.
 * NOAA describes these equations as approximately one-minute accurate below
 * ±72° latitude, while atmospheric conditions can move observed times.
 *
 * Phase 5D remains the strict Swiss execution-path oracle (≤2s) and civil-day
 * regression owner. Phase 7 adds a genuinely separate solar model as an
 * additional cross-check; it does not loosen Phase 5D tolerances.
 */

import * as Astronomy from 'astronomy-engine';
import {
  astronomyEngineEphemerisProvider,
} from '../../shared/index.ts';
import {
  closeSwissEphemeris,
  createSwissEphemerisProvider,
} from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type Event = 'RISE' | 'SET';

type SolarReferenceCase = {
  label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  civilDate: string; // Gregorian local civil date whose sunrise/sunset is requested.
  event: Event;
  expectedLocalDate: string;
  expectedLocalTime: string; // Existing Swiss vector, rounded to seconds.
};

const CASES: SolarReferenceCase[] = [
  {
    label: 'Anaparthy 2005-08-17 Sun rise',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    civilDate: '2005-08-17',
    event: 'RISE',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '05:46:03',
  },
  {
    label: 'Anaparthy 2005-08-17 Sun set',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    civilDate: '2005-08-17',
    event: 'SET',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '18:26:12',
  },
  {
    label: 'New Delhi 2024-03-10 Sun rise',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    civilDate: '2024-03-10',
    event: 'RISE',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '06:36:19',
  },
  {
    label: 'New Delhi 2024-03-10 Sun set',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    civilDate: '2024-03-10',
    event: 'SET',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:26:46',
  },
  {
    label: 'New York 2024-03-10 DST-start Sun rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    civilDate: '2024-03-10',
    event: 'RISE',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '07:14:55',
  },
  {
    label: 'New York 2024-03-10 DST-start Sun set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    civilDate: '2024-03-10',
    event: 'SET',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:57:54',
  },
  {
    label: 'New York 2024-11-03 DST-end Sun rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    civilDate: '2024-11-03',
    event: 'RISE',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '06:29:22',
  },
  {
    label: 'New York 2024-11-03 DST-end Sun set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    civilDate: '2024-11-03',
    event: 'SET',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '16:49:16',
  },
  {
    label: 'Sydney 2024-12-21 DST Sun rise',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    civilDate: '2024-12-21',
    event: 'RISE',
    expectedLocalDate: '2024-12-21',
    expectedLocalTime: '05:40:52',
  },
  {
    label: 'Sydney 2024-12-21 DST Sun set',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    civilDate: '2024-12-21',
    event: 'SET',
    expectedLocalDate: '2024-12-21',
    expectedLocalTime: '20:05:37',
  },
];

const NOAA_MODEL_ENVELOPE_SECONDS = 180;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000) + 1;
}

function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

function radToDeg(value: number): number {
  return (value * 180) / Math.PI;
}

function normalizeCivilDate(input: string): { year: number; month: number; day: number } {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(input);
  if (!match) throw new Error('Invalid Gregorian civil date: ' + input);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error('Invalid Gregorian civil date: ' + input);
  }
  return { year, month, day };
}

function noaaSolarEventUtc(
  civilDate: string,
  latitude: number,
  longitude: number,
  event: Event,
): Date | null {
  const { year, month, day } = normalizeCivilDate(civilDate);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('NOAA reference requires finite latitude/longitude.');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('NOAA reference latitude/longitude out of bounds.');
  }

  const totalDays = isLeapYear(year) ? 366 : 365;
  // NOAA/GML fractional-year equation evaluated at local solar-noon phase.
  const gamma = (2 * Math.PI / totalDays) * (dayOfYear(year, month, day) - 1 + 0.5);

  const eqTimeMinutes =
    229.18 *
    (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    );

  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const zenithRad = degToRad(90.833);
  const latitudeRad = degToRad(latitude);

  const cosHourAngle =
    (
      Math.cos(zenithRad) -
      Math.sin(latitudeRad) * Math.sin(declination)
    ) /
    (
      Math.cos(latitudeRad) * Math.cos(declination)
    );

  if (cosHourAngle > 1 || cosHourAngle < -1) {
    return null;
  }

  const hourAngleDeg = radToDeg(Math.acos(cosHourAngle));
  const signedHourAngleDeg = event === 'RISE' ? hourAngleDeg : -hourAngleDeg;
  const utcMinutes =
    720 -
    4 * (longitude + signedHourAngleDeg) -
    eqTimeMinutes;

  const utcMidnight = Date.UTC(year, month - 1, day);
  return new Date(utcMidnight + utcMinutes * 60000);
}

function localParts(date: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }

  return {
    date: values.year + '-' + values.month + '-' + values.day,
    time: values.hour + ':' + values.minute + ':' + values.second,
  };
}

function absSeconds(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 1000;
}

function assertModelEnvelope(label: string, providerActual: Date, noaaActual: Date): number {
  const delta = absSeconds(providerActual, noaaActual);
  if (delta > NOAA_MODEL_ENVELOPE_SECONDS) {
    throw new Error(
      label +
      ': provider/NOAA delta ' +
      delta.toFixed(3) +
      's exceeds ' +
      NOAA_MODEL_ENVELOPE_SECONDS +
      's model envelope',
    );
  }
  return delta;
}

async function main(): Promise<void> {
  console.log('🌞 AstroWorld Phase 7 independent horizon-reference contract\\n');
  console.log('Reference model: NOAA/GML published sunrise/sunset equations.');
  console.log('Convention: 90.833° zenith (solar disk + nominal refraction), sea-level, flat horizon.');
  console.log('This gate is an independent solar model cross-check, not an observed-weather accuracy claim.');
  console.log('NOAA model envelope: provider/NOAA ≤ ' + NOAA_MODEL_ENVELOPE_SECONDS + 's.\\n');

  let passed = 0;
  let failed = 0;
  let maxSwissDelta = 0;
  let maxAstronomyDelta = 0;

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
    for (const testCase of CASES) {
      try {
        const noaaActual = noaaSolarEventUtc(
          testCase.civilDate,
          testCase.latitude,
          testCase.longitude,
          testCase.event,
        );
        if (!noaaActual) {
          throw new Error('NOAA reference reports no solar event.');
        }

        const expectedStartUtc = new Date(
          testCase.event === 'RISE'
            ? testCase.civilDate + 'T00:00:00.000Z'
            : testCase.civilDate + 'T06:00:00.000Z',
        );

        const swissActual = swiss.getHorizonEvent(
          expectedStartUtc,
          'Sun',
          testCase.event,
          { latitude: testCase.latitude, longitude: testCase.longitude },
        );
        if (!swissActual) {
          throw new Error('Swiss provider returned null.');
        }

        const astronomyDirection = testCase.event === 'RISE' ? 1 : -1;
        const astronomyActual = Astronomy.SearchRiseSet(
          Astronomy.Body.Sun,
          new Astronomy.Observer(testCase.latitude, testCase.longitude, 0),
          astronomyDirection,
          expectedStartUtc,
          2,
        )?.date;

        if (!astronomyActual) {
          throw new Error('Astronomy Engine returned null.');
        }

        const swissLocal = localParts(swissActual, testCase.timezone);
        if (
          swissLocal.date !== testCase.expectedLocalDate ||
          swissLocal.time !== testCase.expectedLocalTime
        ) {
          throw new Error(
            'Swiss civil-day/time mapping mismatch: expected ' +
            testCase.expectedLocalDate + ' ' + testCase.expectedLocalTime +
            ', got ' + swissLocal.date + ' ' + swissLocal.time,
          );
        }

        const astronomyLocal = localParts(astronomyActual, testCase.timezone);
        if (astronomyLocal.date !== testCase.expectedLocalDate) {
          throw new Error(
            'Astronomy Engine civil-day mapping mismatch: expected ' +
            testCase.expectedLocalDate +
            ', got ' + astronomyLocal.date,
          );
        }

        const swissDelta = assertModelEnvelope(
          testCase.label + ' Swiss',
          swissActual,
          noaaActual,
        );
        const astronomyDelta = assertModelEnvelope(
          testCase.label + ' Astronomy Engine',
          astronomyActual,
          noaaActual,
        );

        maxSwissDelta = Math.max(maxSwissDelta, swissDelta);
        maxAstronomyDelta = Math.max(maxAstronomyDelta, astronomyDelta);

        pass(
          testCase.label + ' NOAA cross-check',
          'Swiss Δ ' + swissDelta.toFixed(3) +
          's; AE Δ ' + astronomyDelta.toFixed(3) + 's',
        );
      } catch (error) {
        fail(testCase.label, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('\\n==================================================');
    console.log(
      'PHASE 7 INDEPENDENT HORIZON REFERENCE: ' +
      passed + ' PASSED | ' + failed + ' FAILED',
    );
    console.log('Max Swiss/NOAA delta: ' + maxSwissDelta.toFixed(3) + 's');
    console.log('Max Astronomy Engine/NOAA delta: ' + maxAstronomyDelta.toFixed(3) + 's');
    console.log(
      'Contracts: civil-day mapping exact; Swiss/NOAA ≤ ' +
      NOAA_MODEL_ENVELOPE_SECONDS +
      's; AE/NOAA ≤ ' +
      NOAA_MODEL_ENVELOPE_SECONDS +
      's.',
    );
    console.log('==================================================\\n');

    if (failed > 0) process.exitCode = 1;
  } finally {
    await closeSwissEphemeris();
  }
}

main().catch((error) => {
  console.error('❌ Phase 7 independent horizon-reference contract failed:', error);
  process.exitCode = 1;
});
