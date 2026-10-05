/**
 * ASTROWORLD — Vimshottari Reference Verification
 *
 * Uses the independently validated Swiss-Ephemeris Moon longitude for the
 * canonical benchmark and checks the engine's nakshatra/balance math.
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
const EXPECTED_MD_START = '1998-10-30T15:52:45.504Z';
const EXPECTED_VENUS_END = '2018-10-30T15:52:45.504Z';

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

assertNear('Moon sidereal longitude', moon!.siderealLongitude, EXPECTED_MOON, 0.0001);
assert(moon!.nakshatra === 'Purva Ashadha', `Expected Purva Ashadha, got ${moon!.nakshatra}`);
assert(moon!.pada === 2, `Expected Purva Ashadha Pada 2, got ${moon!.pada}`);
console.log('✅ Moon nakshatra/pada reference check passed');

const dasha = calculateVimshottariDasha(moon!.siderealLongitude, birthUtc, new Date('2005-08-17T00:00:00.000Z'));
assert(dasha.balanceAtBirth.rulingLord === 'Venus', `Expected Venus balance, got ${dasha.balanceAtBirth.rulingLord}`);
assertNear('Venus balance years', dasha.balanceAtBirth.balanceYears, EXPECTED_BALANCE_YEARS, 0.01);

const firstMd = dasha.mahadashas[0].period;
assert(firstMd.lord === 'Venus', `Expected first Mahadasha Venus, got ${firstMd.lord}`);
assert(firstMd.startDateIso === EXPECTED_MD_START, `Expected Venus MD start ${EXPECTED_MD_START}, got ${firstMd.startDateIso}`);
assert(firstMd.endDateIso === EXPECTED_VENUS_END, `Expected Venus MD end ${EXPECTED_VENUS_END}, got ${firstMd.endDateIso}`);

console.log('✅ Venus Mahadasha boundary reference checks passed');
console.log('✅ Vimshottari reference verification passed.');
