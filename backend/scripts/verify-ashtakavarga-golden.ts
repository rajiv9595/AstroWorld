/**
 * ASTROWORLD — Ashtakavarga Golden Vector Verification
 *
 * Independent reference reconstruction using the published classical BAV
 * contributor table. Fixed per-planet totals are 48/49/39/54/56/52/39
 * and the combined SAV total is 337.
 */

import { calculateAshtakavarga, TEST_BENCHMARK_PROFILE, calculatePlanetaryPositions, calculateLahiriAyanamsha, birthProfileToUtcDate } from '../../shared/index.ts';
import * as Astronomy from 'astronomy-engine';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const time = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(time);
const planets = calculatePlanetaryPositions(time, ayanamsha, 1);
const result = calculateAshtakavarga(planets, 1);

const expectedTotals: Record<string, number> = {
  Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39,
};

for (const [planet, expected] of Object.entries(expectedTotals)) {
  const row = result.bav[planet as keyof typeof result.bav];
  assert(row.reduce((a, b) => a + b, 0) === expected,
    `${planet} BAV total mismatch: expected ${expected}, got ${row.reduce((a, b) => a + b, 0)}`);
}

assert(result.sarvashtakavargaTotal === 337,
  `SAV total mismatch: expected 337, got ${result.sarvashtakavargaTotal}`);

const expectedSav = [26, 39, 26, 32, 23, 24, 30, 23, 24, 25, 36, 29];
assert(
  result.sav.every((v, i) => v === expectedSav[i]),
  `Canonical SAV mismatch: expected [${expectedSav.join(', ')}], got [${result.sav.join(', ')}]`,
);

assert(result.bav.Rahu.every(v => v === 0) && result.bav.Ketu.every(v => v === 0),
  'Rahu/Ketu must not participate in the classical 337-bindu system');

console.log('✅ BAV fixed totals: 48/49/39/54/56/52/39');
console.log('✅ Canonical benchmark SAV: [26,39,26,32,23,24,30,23,24,25,36,29]');
console.log('✅ Sarvashtakavarga total = 337');
console.log('✅ Rahu/Ketu excluded from classical BAV/SAV');
