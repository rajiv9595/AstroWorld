/**
 * ASTROWORLD — Phase 12 Independent Lunar Horizon Reference
 *
 * Independent reference model:
 * - Jean Meeus, Astronomical Algorithms, Chapter 47 (lunar position),
 *   reduced to the 13 largest longitude terms and 10 largest latitude terms.
 * - Chapter 40 topocentric parallax.
 * - Standard near-horizon refraction plus lunar upper-limb semidiameter.
 *
 * This reference is deliberately independent of Swiss Ephemeris and
 * Astronomy Engine. It is a model-level cross-check, not an observational
 * weather/horizon guarantee.
 *
 * Frozen event vectors were generated in a separate Python calculation path
 * from the same equations, then checked into this contract.
 */

import {
  astronomyEngineEphemerisProvider,
} from '../../shared/index.ts';
import {
  closeSwissEphemeris,
  createSwissEphemerisProvider,
} from '../src/services/ephemeris/swissEphemerisAdapter.ts';

type Event = 'RISE' | 'SET';

type Vector = {
  label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  event: Event;
  startUtc: string;
  expectedUtc: string;
  expectedLocalDate: string;
  expectedLocalTime: string;
};

const VECTORS: Vector[] = [
  {
    label: 'Anaparthy 2005 Moon rise',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    event: 'RISE',
    startUtc: '2005-08-16T18:30:00.000Z',
    expectedUtc: '2005-08-17T11:03:58.342Z',
    expectedLocalDate: '2005-08-17',
    expectedLocalTime: '16:33:58',
  },
  {
    label: 'Anaparthy 2005 Moon set',
    timezone: 'Asia/Kolkata',
    latitude: 16.93407,
    longitude: 81.95522,
    event: 'SET',
    startUtc: '2005-08-17T06:30:00.000Z',
    expectedUtc: '2005-08-17T22:22:27.653Z',
    expectedLocalDate: '2005-08-18',
    expectedLocalTime: '03:52:27',
  },
  {
    label: 'New Delhi 2024-03-10 Moon rise',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    event: 'RISE',
    startUtc: '2024-03-09T18:30:00.000Z',
    expectedUtc: '2024-03-10T01:07:30.921Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '06:37:30',
  },
  {
    label: 'New Delhi 2024-03-10 Moon set',
    timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.209,
    event: 'SET',
    startUtc: '2024-03-10T06:30:00.000Z',
    expectedUtc: '2024-03-10T13:01:44.417Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '18:31:44',
  },
  {
    label: 'New York 2024-03-10 DST-start Moon rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    event: 'RISE',
    startUtc: '2024-03-10T05:00:00.000Z',
    expectedUtc: '2024-03-10T11:34:11.993Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '07:34:11',
  },
  {
    label: 'New York 2024-03-10 DST-start Moon set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    event: 'SET',
    startUtc: '2024-03-10T16:00:00.000Z',
    expectedUtc: '2024-03-10T23:33:20.228Z',
    expectedLocalDate: '2024-03-10',
    expectedLocalTime: '19:33:20',
  },
  {
    label: 'New York 2024-11-03 DST-end Moon rise',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    event: 'RISE',
    startUtc: '2024-11-03T04:00:00.000Z',
    expectedUtc: '2024-11-03T13:45:51.531Z',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '08:45:51',
  },
  {
    label: 'New York 2024-11-03 DST-end Moon set',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
    event: 'SET',
    startUtc: '2024-11-03T17:00:00.000Z',
    expectedUtc: '2024-11-03T22:44:59.159Z',
    expectedLocalDate: '2024-11-03',
    expectedLocalTime: '17:44:59',
  },
  {
    label: 'Sydney 2024-12-21 Moon rise (next local day)',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    event: 'RISE',
    startUtc: '2024-12-20T13:00:00.000Z',
    expectedUtc: '2024-12-21T13:20:46.195Z',
    expectedLocalDate: '2024-12-22',
    expectedLocalTime: '00:20:46',
  },
  {
    label: 'Sydney 2024-12-21 Moon set (next local day)',
    timezone: 'Australia/Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    event: 'SET',
    startUtc: '2024-12-21T01:00:00.000Z',
    expectedUtc: '2024-12-22T01:06:42.894Z',
    expectedLocalDate: '2024-12-22',
    expectedLocalTime: '12:06:42',
  },
];

const MOON_LON: readonly [number, number, number, number, number, number][] = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
];

const MOON_LAT: readonly [number, number, number, number, number][] = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
];

const DEG = Math.PI / 180;
const EARTH_RADIUS_KM = 6378.14;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;

function toDays(date: Date): number {
  return date.getTime() / DAY_MS - 0.5 + J1970 - J2000;
}

function deltaT(days: number): number {
  const year = 2000 + days / 365.2425;
  let t: number;
  if (year < 1920) {
    t = year - 1900;
    return -2.79 + t * (1.494119 + t * (-0.0598939 + t * (0.0061966 - t * 0.000197)));
  }
  if (year < 1941) {
    t = year - 1920;
    return 21.20 + t * (0.84493 + t * (-0.076100 + t * 0.0020936));
  }
  if (year < 1961) {
    t = year - 1950;
    return 29.07 + t * (0.407 + t * (-1 / 233 + t / 2547));
  }
  if (year < 1986) {
    t = year - 1975;
    return 45.45 + t * (1.067 + t * (-1 / 260 - t / 718));
  }
  if (year < 2005) {
    t = year - 2000;
    return 63.86 + t * (0.3345 + t * (-0.060374 + t * (0.0017275 + t * (0.000651814 + t * 0.00002373599))));
  }
  if (year < 2050) {
    t = year - 2000;
    return 62.92 + t * (0.32217 + t * 0.005589);
  }
  t = (year - 1820) / 100;
  return -20 + 32 * t * t - 0.5628 * (2150 - year);
}

function normalizeDegrees(value: number): number {
  const result = value % 360;
  return result < 0 ? result + 360 : result;
}

function moonCoordinates(dateUtc: Date): { ra: number; dec: number; distanceKm: number } {
  const d = toDays(dateUtc);
  const ttDays = d + deltaT(d) / 86400;
  const t = ttDays / 36525;

  const lp = 218.3164477 + t * (481267.88123421 + t * (-0.0015786 + t * (1 / 538841 - t / 65194000)));
  const D = 297.8501921 + t * (445267.1114034 + t * (-0.0018819 + t * (1 / 545868 - t / 113065000)));
  const M = 357.5291092 + t * (35999.0502909 + t * (-0.0001536 + t / 24490000));
  const Mp = 134.9633964 + t * (477198.8675055 + t * (0.0087414 + t * (1 / 69699 - t / 14712000)));
  const F = 93.2720950 + t * (483202.0175233 + t * (-0.0036539 + t * (-1 / 3526000 + t / 863310000)));

  const A1 = 119.75 + 131.849 * t;
  const A2 = 53.09 + 479264.290 * t;
  const A3 = 313.45 + 481266.484 * t;
  const E = 1 - t * (0.002516 + t * 0.0000074);

  const Dr = D * DEG;
  const Mr = M * DEG;
  const Mpr = Mp * DEG;
  const Fr = F * DEG;

  let sigmaL = 0;
  let sigmaR = 0;
  let sigmaB = 0;

  for (const [dMult, mMult, mpMult, fMult, coeffL, coeffR] of MOON_LON) {
    const arg = dMult * Dr + mMult * Mr + mpMult * Mpr + fMult * Fr;
    const factor = Math.abs(mMult) === 1 ? E : Math.abs(mMult) === 2 ? E * E : 1;
    sigmaL += coeffL * factor * Math.sin(arg);
    sigmaR += coeffR * factor * Math.cos(arg);
  }

  for (const [dMult, mMult, mpMult, fMult, coeffB] of MOON_LAT) {
    const arg = dMult * Dr + mMult * Mr + mpMult * Mpr + fMult * Fr;
    const factor = Math.abs(mMult) === 1 ? E : Math.abs(mMult) === 2 ? E * E : 1;
    sigmaB += coeffB * factor * Math.sin(arg);
  }

  sigmaL +=
    3958 * Math.sin(A1 * DEG) +
    1962 * Math.sin(lp * DEG - F * DEG) +
    318 * Math.sin(A2 * DEG);

  sigmaB +=
    -2235 * Math.sin(lp * DEG) +
    382 * Math.sin(A3 * DEG) +
    175 * Math.sin(A1 * DEG - F * DEG) +
    175 * Math.sin(A1 * DEG + F * DEG) +
    127 * Math.sin(lp * DEG - Mp * DEG) -
    115 * Math.sin(lp * DEG + Mp * DEG);

  const omega = (125.04452 - 1934.136261 * t) * DEG;
  const sunMean = (280.4665 + 36000.7698 * t) * DEG;
  const moonMean = (218.3165 + 481267.8813 * t) * DEG;
  const dpsi = (
    -17.20 * Math.sin(omega) -
    1.32 * Math.sin(2 * sunMean) -
    0.23 * Math.sin(2 * moonMean) +
    0.21 * Math.sin(2 * omega)
  ) / 3600;
  const deps = (
    9.20 * Math.cos(omega) +
    0.57 * Math.cos(2 * sunMean) +
    0.10 * Math.cos(2 * moonMean) -
    0.09 * Math.cos(2 * omega)
  ) / 3600;

  const eps0 = 23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504));
  const eps = (eps0 + deps) * DEG;

  const lon = (lp + sigmaL / 1e6 + dpsi) * DEG;
  const lat = (sigmaB / 1e6) * DEG;

  return {
    ra: Math.atan2(
      Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps),
      Math.cos(lon),
    ),
    dec: Math.asin(
      Math.sin(lat) * Math.cos(eps) +
      Math.cos(lat) * Math.sin(eps) * Math.sin(lon),
    ),
    distanceKm: 385000.56 + sigmaR / 1000,
  };
}

function siderealTime(dateUtc: Date, longitudeDeg: number): number {
  return (
    280.46061837 +
    360.98564736629 * toDays(dateUtc) +
    longitudeDeg
  ) * DEG;
}

function apparentRefractionDegrees(apparentAltitudeDeg: number): number {
  const h = Math.max(0, apparentAltitudeDeg);
  const denominator = h + 5.10;
  if (denominator <= 0) return 0;
  return 1.02 / (Math.tan((h + 10.26 / denominator) * DEG) * 60);
}

function moonUpperLimbAltitudeDegrees(
  dateUtc: Date,
  latitudeDeg: number,
  longitudeDeg: number,
): number {
  const { ra, dec, distanceKm } = moonCoordinates(dateUtc);
  const phi = latitudeDeg * DEG;
  const hourAngle = siderealTime(dateUtc, longitudeDeg) - ra;

  const geoAltitude = Math.asin(
    Math.sin(phi) * Math.sin(dec) +
    Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle),
  );

  const parallax = Math.asin(
    EARTH_RADIUS_KM / distanceKm * Math.cos(geoAltitude),
  );
  const topocentricAltitude = geoAltitude - parallax;

  const topocentricDeg = topocentricAltitude / DEG;
  const refraction = apparentRefractionDegrees(topocentricDeg);
  const semidiameter = 0.2725 * Math.asin(EARTH_RADIUS_KM / distanceKm) / DEG;

  return topocentricDeg + refraction + semidiameter;
}

function refineCrossing(
  a: Date,
  b: Date,
  latitudeDeg: number,
  longitudeDeg: number,
): Date {
  let lo = a.getTime();
  let hi = b.getTime();
  let flo = moonUpperLimbAltitudeDegrees(a, latitudeDeg, longitudeDeg);

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const fm = moonUpperLimbAltitudeDegrees(new Date(mid), latitudeDeg, longitudeDeg);
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }

  return new Date((lo + hi) / 2);
}

function findIndependentMoonEvent(
  startUtc: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  event: Event,
): Date | null {
  const stepMs = 5 * 60 * 1000;
  let previous = startUtc;
  let previousAltitude = moonUpperLimbAltitudeDegrees(previous, latitudeDeg, longitudeDeg);

  const horizonMs = 30 * 60 * 60 * 1000;
  const endMs = startUtc.getTime() + horizonMs;

  for (let t = startUtc.getTime() + stepMs; t <= endMs; t += stepMs) {
    const current = new Date(t);
    const currentAltitude = moonUpperLimbAltitudeDegrees(current, latitudeDeg, longitudeDeg);

    const crossesRise = previousAltitude <= 0 && currentAltitude > 0;
    const crossesSet = previousAltitude >= 0 && currentAltitude < 0;

    if ((event === 'RISE' && crossesRise) || (event === 'SET' && crossesSet)) {
      return refineCrossing(previous, current, latitudeDeg, longitudeDeg);
    }

    previous = current;
    previousAltitude = currentAltitude;
  }

  return null;
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

function absSeconds(actual: Date, expected: string): number {
  return Math.abs(actual.getTime() - new Date(expected).getTime()) / 1000;
}

function assertClose(label: string, actual: Date, expected: string, toleranceSeconds: number): number {
  const delta = absSeconds(actual, expected);
  if (delta > toleranceSeconds) {
    throw new Error(label + ': delta ' + delta.toFixed(3) + 's exceeds ' + toleranceSeconds + 's.');
  }
  return delta;
}

async function main(): Promise<void> {
  console.log('🌙 AstroWorld Phase 12 independent lunar horizon reference contract');
  console.log('Reference: Meeus Ch.47 reduced lunar series + Ch.40 topocentric parallax.');
  console.log('Independent model tolerance: 120 seconds.\n');

  const swiss = await createSwissEphemerisProvider();
  let passed = 0;
  let failed = 0;
  let maxSwissDelta = 0;
  let maxAstronomyDelta = 0;

  try {
    for (const vector of VECTORS) {
      try {
        const start = new Date(vector.startUtc);
        const expected = new Date(vector.expectedUtc);

        const independent = findIndependentMoonEvent(
          start,
          vector.latitude,
          vector.longitude,
          vector.event,
        );
        if (!independent) throw new Error('Independent lunar model found no event.');
        const frozenDelta = assertClose(vector.label + ' independent frozen vector', independent, vector.expectedUtc, 2);
        if (frozenDelta > 0.01) {
          throw new Error(vector.label + ': frozen reference drifted by ' + frozenDelta.toFixed(3) + 's from its checked-in vector.');
        }

        const frozenLocal = localParts(independent, vector.timezone);
        if (frozenLocal.date !== vector.expectedLocalDate || frozenLocal.time !== vector.expectedLocalTime) {
          throw new Error(
            vector.label + ': expected local ' + vector.expectedLocalDate + ' ' + vector.expectedLocalTime +
            ', got ' + frozenLocal.date + ' ' + frozenLocal.time,
          );
        }

        const swissActual = swiss.getHorizonEvent(
          start,
          'Moon',
          vector.event,
          { latitude: vector.latitude, longitude: vector.longitude },
        );
        if (!swissActual) throw new Error('Swiss provider returned null.');
        const swissDelta = assertClose(vector.label + ' Swiss vs independent', swissActual, vector.expectedUtc, 120);
        maxSwissDelta = Math.max(maxSwissDelta, swissDelta);

        const astronomyActual = astronomyEngineEphemerisProvider.getHorizonEvent(
          start,
          'Moon',
          vector.event,
          { latitude: vector.latitude, longitude: vector.longitude },
        );
        if (!astronomyActual) throw new Error('Astronomy Engine provider returned null.');

        if (vector.label.startsWith('Sydney')) {
          const hours = (astronomyActual.getTime() - start.getTime()) / 3600000;
          if (hours < 24) {
            throw new Error(
              vector.label + ': Sydney next-event regression expected >24h after the UTC anchor; got ' +
              hours.toFixed(3) + 'h',
            );
          }
        }
        const astronomyDelta = assertClose(vector.label + ' Astronomy vs independent', astronomyActual, vector.expectedUtc, 120);
        maxAstronomyDelta = Math.max(maxAstronomyDelta, astronomyDelta);

        passAndLog(vector, swissDelta, astronomyDelta);
      } catch (error) {
        failed++;
        console.error('❌ ' + vector.label + ': ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    console.log('\n==================================================');
    console.log('PHASE 12 INDEPENDENT LUNAR REFERENCE: ' + passed + ' PASSED | ' + failed + ' FAILED');
    console.log('Max Swiss vs independent delta: ' + maxSwissDelta.toFixed(3) + 's');
    console.log('Max Astronomy Engine vs independent delta: ' + maxAstronomyDelta.toFixed(3) + 's');
    console.log('Contracts: frozen independent model ≤ 2s self-reproduction; providers ≤ 120s to independent model; local civil-day mapping exact.');
    console.log('==================================================\n');

    if (failed > 0) process.exitCode = 1;
  } finally {
    await closeSwissEphemeris();
  }
}

function passAndLog(vector: Vector, swissDelta: number, astronomyDelta: number): void {
  console.log(
    '✅ ' + vector.label +
    ': Swiss Δ ' + swissDelta.toFixed(3) +
    's; AE Δ ' + astronomyDelta.toFixed(3) + 's; local ' +
    vector.expectedLocalDate + ' ' + vector.expectedLocalTime,
  );
}

main().catch((error) => {
  console.error('❌ Phase 12 independent lunar-reference contract failed:', error);
  process.exitCode = 1;
});
