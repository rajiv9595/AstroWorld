/**
 * ASTROWORLD — Independent Astronomical Reference Verification
 *
 * Reference vectors were generated independently with Swiss Ephemeris 2.10.03,
 * Lahiri sidereal mode, mean lunar node, and whole-sign ascendant.
 *
 * This script is intentionally an oracle test, not a production dependency.
 * It verifies the existing Astronomy Engine + analytical Lahiri implementation
 * against an independently implemented ephemeris.
 */

import * as Astronomy from 'astronomy-engine';
import {
  birthProfileToUtcDate,
  calculateAscendant,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  TEST_BENCHMARK_PROFILE,
} from '../../shared/index.ts';

type ReferenceVector = {
  label: string;
  utcDate: string;
  latitude: number;
  longitude: number;
  ayanamshaDeg: number;
  ascendantDeg: number;
  positionsDeg: Record<string, number>;
};

const REFERENCE: ReferenceVector[] = [
  {
    label: 'Anaparthy — 1900-02-28 18:30 UTC',
    utcDate: '1900-02-28T18:30:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamshaDeg: 22.46277727837305,
    ascendantDeg: 220.52170588251926,
    positionsDeg: {
      Sun: 317.2754094214595, Moon: 307.1603230214832, Mars: 307.4088322112195,
      Mercury: 332.647599557872, Jupiter: 227.27610565027965, Venus: 355.7531823713323,
      Saturn: 250.98677727502135, Rahu: 233.5815434612041, Ketu: 53.58154346120409,
    },
  },
  {
    label: 'Anaparthy — 2000-01-01 00:00 UTC',
    utcDate: '2000-01-01T00:00:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamshaDeg: 23.857073231355002,
    ascendantDeg: 240.97993501026534,
    positionsDeg: {
      Sun: 256.0060121369246, Moon: 193.44016305684002, Mars: 303.7222767659089,
      Mercury: 247.25860135926806, Jupiter: 1.37986875141131, Venus: 217.10821741787453,
      Saturn: 16.552636092487752, Rahu: 101.21391957635842, Ketu: 281.2139195763584,
    },
  },
  {
    label: 'Anaparthy — 2024-02-29 00:00 UTC (leap day)',
    utcDate: '2024-02-29T00:00:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamshaDeg: 24.194600702481353,
    ascendantDeg: 299.5154141442983,
    positionsDeg: {
      Sun: 315.6922904539581, Moon: 184.23275098950916, Mars: 287.9495844981665,
      Mercury: 316.2460069721165, Jupiter: 16.951180472099413, Venus: 291.0618677721009,
      Saturn: 315.5977076400617, Rahu: 353.5595218635826, Ketu: 173.55952186358263,
    },
  },
  {
    label: 'Anaparthy — 2030-07-01 12:00 UTC',
    utcDate: '2030-07-01T12:00:00.000Z',
    latitude: 16.93407,
    longitude: 81.95522,
    ayanamshaDeg: 24.28312871434332,
    ascendantDeg: 240.20772072234294,
    positionsDeg: {
      Sun: 75.43011121160335, Moon: 82.14200260283613, Mars: 65.6181615921832,
      Mercury: 83.98909338207324, Jupiter: 203.75230971273257, Venus: 46.44232830134532,
      Saturn: 39.41900537771398, Rahu: 230.90957323623547, Ketu: 50.909573236235474,
    },
  },
];

function circularDifferenceDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

function assertClose(
  name: string,
  actual: number,
  expected: number,
  toleranceArcsec: number
): void {
  const diffArcsec = circularDifferenceDeg(actual, expected) * 3600;
  if (diffArcsec > toleranceArcsec) {
    throw new Error(
      `${name}: difference ${diffArcsec.toFixed(3)} arcsec exceeds ${toleranceArcsec} arcsec tolerance (actual=${actual}, expected=${expected})`
    );
  }
  console.log(
    `✅ ${name}: ${actual.toFixed(9)}° vs ${expected.toFixed(9)}° — Δ ${diffArcsec.toFixed(3)} arcsec`
  );
}

async function main() {
  console.log('🌌 AstroWorld independent astronomical reference verification');
  console.log('Reference: Swiss Ephemeris 2.10.03, Lahiri / Chitrapaksha, mean lunar node');

  for (const ref of REFERENCE) {
    const astroTime = new Astronomy.AstroTime(new Date(ref.utcDate));
    const ayanamsha = calculateLahiriAyanamsha(astroTime);
    assertClose(`${ref.label} — Lahiri ayanamsha`, ayanamsha, ref.ayanamshaDeg, 2);

    const ascendant = calculateAscendant(
      astroTime,
      ref.latitude,
      ref.longitude,
      ayanamsha
    );
    assertClose(`${ref.label} — Ascendant`, ascendant.siderealLongitude, ref.ascendantDeg, 120);

    const planets = calculatePlanetaryPositions(
      astroTime,
      ayanamsha,
      ascendant.signIndex
    );

    for (const [name, expected] of Object.entries(ref.positionsDeg)) {
      const planet = planets.find((p) => p.name === name);
      if (!planet) throw new Error(`Missing planet: ${name}`);
      assertClose(`${ref.label} — ${name}`, planet.siderealLongitude, expected, 120);
    }

    console.log(`✅ ${ref.label}: complete vector passed`);
  }

  console.log('\n✅ Multi-date independent astronomical reference verification passed.');
  console.log('Coverage: 1900, J2000, leap-day 2024, and 2030; planetary longitudes + Ascendant.');
}

main().catch((err) => {
  console.error('❌ Independent astronomical reference verification failed:', err);
  process.exit(1);
});
