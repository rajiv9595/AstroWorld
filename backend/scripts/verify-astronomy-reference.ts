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
  profileName: string;
  ephemeris: string;
  siderealMode: string;
  ayanamshaDeg: number;
  positionsDeg: Record<string, number>;
  toleranceArcsec: number;
};

const REFERENCE: ReferenceVector = {
  profileName: 'Canonical Test Native — Anaparthy 2005-08-17 00:02 IST',
  ephemeris: 'Swiss Ephemeris 2.10.03',
  siderealMode: 'Lahiri / Chitrapaksha',
  ayanamshaDeg: 23.93565836563647,
  toleranceArcsec: 120,
  positionsDeg: {
    Ascendant: 39.95620244441955,
    Sun: 120.04284066208803,
    Moon: 257.8637656115666,
    Mars: 16.59405768925442,
    Mercury: 104.84054007297352,
    Jupiter: 171.84362377517232,
    Venus: 155.6427499901487,
    Saturn: 100.06349180994296,
    Rahu: 352.32741227614775,
    Ketu: 172.3274122761477,
  },
};

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
  console.log(`Reference: ${REFERENCE.ephemeris}, ${REFERENCE.siderealMode}`);
  console.log(`Profile: ${REFERENCE.profileName}`);

  const utcDate = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
  const astroTime = new Astronomy.AstroTime(utcDate);

  const ayanamsha = calculateLahiriAyanamsha(astroTime);
  assertClose('Lahiri ayanamsha', ayanamsha, REFERENCE.ayanamshaDeg, 2);

  const ascendant = calculateAscendant(
    astroTime,
    TEST_BENCHMARK_PROFILE.latitude,
    TEST_BENCHMARK_PROFILE.longitude,
    ayanamsha
  );

  assertClose(
    'Ascendant',
    ascendant.siderealLongitude,
    REFERENCE.positionsDeg.Ascendant,
    REFERENCE.toleranceArcsec
  );

  const planets = calculatePlanetaryPositions(
    astroTime,
    ayanamsha,
    ascendant.signIndex
  );

  for (const [name, expected] of Object.entries(REFERENCE.positionsDeg)) {
    if (name === 'Ascendant') continue;
    const planet = planets.find((p) => p.name === name);
    if (!planet) throw new Error(`Missing planet from canonical engine: ${name}`);
    assertClose(
      name,
      planet.siderealLongitude,
      expected,
      REFERENCE.toleranceArcsec
    );
  }

  console.log('\\n✅ Independent astronomical reference verification passed.');
  console.log('Note: this validates the current engine against a Swiss Ephemeris vector;');
  console.log('it does not prove every historical date or every boundary condition.');
}

main().catch((err) => {
  console.error('❌ Independent astronomical reference verification failed:', err);
  process.exit(1);
});
