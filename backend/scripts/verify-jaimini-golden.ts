/**
 * ASTROWORLD — Jaimini Golden Vector Verification
 *
 * Seven-karaka convention: Sun through Saturn; Rahu/Ketu excluded.
 * Ranking is by degree within sign, descending, with deterministic tie order.
 */

import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateAscendant,
  calculateJaiminiFacts,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  generateVargaChart,
} from '../../shared/index.ts';
import * as Astronomy from 'astronomy-engine';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const time = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(time);
const asc = calculateAscendant(time, TEST_BENCHMARK_PROFILE.latitude, TEST_BENCHMARK_PROFILE.longitude, ayanamsha);
const planets = calculatePlanetaryPositions(time, ayanamsha, asc.signIndex);
const d9 = generateVargaChart('D9', asc.siderealLongitude, planets);
const facts = calculateJaiminiFacts(planets, asc.signIndex, d9);

const expectedRoles = [
  ['AK', 'Jupiter'],
  ['AmK', 'Moon'],
  ['BK', 'Mars'],
  ['MK', 'Mercury'],
  ['PK', 'Saturn'],
  ['GK', 'Venus'],
  ['DK', 'Sun'],
] as const;

assert(facts.karakaScheme === 'seven_karaka', `Expected seven-karaka scheme, got ${facts.karakaScheme}`);
for (const [role, planet] of expectedRoles) {
  const actual = facts.charaKarakas.find(k => k.role === role)?.planet;
  assert(actual === planet, `${role}: expected ${planet}, got ${actual}`);
}

assert(facts.atmakaraka === 'Jupiter', `Expected Jupiter AK, got ${facts.atmakaraka}`);
assert(facts.karakamsaSign === 'Virgo', `Expected AK D1 sign Virgo, got ${facts.karakamsaSign}`);
assert(facts.karakamsaNavamshaSign === 'Cancer', `Expected AK D9/Karakamsa Cancer, got ${facts.karakamsaNavamshaSign}`);
assert(facts.arudhaLagna.sign === 'Capricorn' && facts.arudhaLagna.houseNumber === 9,
  `Expected AL Capricorn/9, got ${facts.arudhaLagna.sign}/${facts.arudhaLagna.houseNumber}`);
assert(facts.upapadaLagna.sign === 'Capricorn' && facts.upapadaLagna.houseNumber === 9,
  `Expected UL Capricorn/9, got ${facts.upapadaLagna.sign}/${facts.upapadaLagna.houseNumber}`);

console.log('✅ Seven-karaka benchmark roles match');
console.log('✅ AK Jupiter; Karakamsa Cancer');
console.log('✅ AL Capricorn (9th); UL Capricorn (9th)');
console.log('✅ Jaimini golden benchmark passed.');
