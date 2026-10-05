/**
 * ASTROWORLD — Vimshottari Reference Verification
 *
 * Uses the independently validated Swiss-Ephemeris Moon longitude as the
 * independent Vimshottari oracle while allowing the production astronomy
 * substrate its documented positional tolerance.
 */

import * as Astronomy from 'astronomy-engine';
import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateVimshottariDasha,
} from '../../shared/index.ts';

const EXPECTED_MOON = 257.8637656115666;
const EXPECTED_BALANCE_YEARS = 13.204351582650148;
const EXPECTED_MD_START_MS = Date.parse('1998-10-30T15:52:45.504Z');
const EXPECTED_VENUS_END_MS = Date.parse('2018-10-30T15:52:45.504Z');

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertNear(name: string, actual: number, expected: number, tolerance: number) {
  const delta = Math.abs(actual - expected);
  assert(delta <= tolerance, `${name}: expected ${expected}, got ${actual}, delta=${delta}`);
  console.log(`✅ ${name}: ${actual} (Δ ${delta})`);
}

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const astroTime = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(astroTime);
const asc = 1; // benchmark Taurus Lagna; only the sign index is needed for the engine call
const planets = calculatePlanetaryPositions(astroTime, ayanamsha, asc);
const moon = planets.find(p => p.name === 'Moon');
assert(Boolean(moon), 'Moon missing from canonical planetary positions');

// Astronomy Engine is the production ephemeris substrate. Its documented
// accuracy target is approximately +/- 1 arcminute, so this check intentionally
// validates the independent Swiss benchmark without demanding sub-arcsecond
// agreement from the production model.
assertNear('Moon sidereal longitude', moon!.siderealLongitude, EXPECTED_MOON, 0.0015);
assert(moon!.nakshatra === 'Purva Ashadha', `Expected Purva Ashadha, got ${moon!.nakshatra}`);
assert(moon!.pada === 2, `Expected Purva Ashadha Pada 2, got ${moon!.pada}`);
console.log('✅ Moon nakshatra/pada reference check passed');

// Feed the independently validated Swiss longitude into the dasha engine so
// this test isolates Vimshottari math from the production ephemeris model.
const dasha = calculateVimshottariDasha(EXPECTED_MOON, birthUtc, new Date('2005-08-17T00:00:00.000Z'));
assert(dasha.balanceAtBirth.rulingLord === 'Venus', `Expected Venus balance, got ${dasha.balanceAtBirth.rulingLord}`);
assertNear('Venus balance years', dasha.balanceAtBirth.balanceYears, EXPECTED_BALANCE_YEARS, 0.01);

const firstMd = dasha.mahadashas[0].period;
assert(firstMd.lord === 'Venus', `Expected first Mahadasha Venus, got ${firstMd.lord}`);
assert(Math.abs(Date.parse(firstMd.startDateIso) - EXPECTED_MD_START_MS) <= 1000, `Venus MD start differs by more than 1s: ${firstMd.startDateIso}`);
assert(Math.abs(Date.parse(firstMd.endDateIso) - EXPECTED_VENUS_END_MS) <= 1000, `Venus MD end differs by more than 1s: ${firstMd.endDateIso}`);

console.log('✅ Venus Mahadasha boundary reference checks passed');
console.log('✅ Vimshottari reference verification passed.');
