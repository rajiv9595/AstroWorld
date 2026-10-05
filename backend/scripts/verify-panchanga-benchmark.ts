/**
 * ASTROWORLD — Canonical Panchanga Benchmark
 *
 * Independent benchmark basis:
 * 17 Aug 2005, 00:02 IST, Anaparthy, Andhra Pradesh.
 * Swiss Ephemeris Lahiri planetary longitudes feed the deterministic
 * Panchanga rules; public Panchangams are used as external cross-checks.
 */

import * as Astronomy from 'astronomy-engine';
import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculatePanchanga,
} from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const time = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(time);
const planets = calculatePlanetaryPositions(time, ayanamsha, 1);
const panchanga = calculatePanchanga(
  planets,
  birthUtc,
  ayanamsha,
  {
    latitude: TEST_BENCHMARK_PROFILE.latitude,
    longitude: TEST_BENCHMARK_PROFILE.longitude,
    timezone: TEST_BENCHMARK_PROFILE.timezone,
  },
);

assert(panchanga.tithi.number === 12 && panchanga.tithi.paksha === 'Shukla' && panchanga.tithi.name === 'Dwadashi',
  `Expected Shukla Dwadashi, got ${panchanga.tithi.name} / ${panchanga.tithi.paksha}`);
assert(panchanga.vara.number === 3 && panchanga.vara.name === 'Budhavara', `Expected Wednesday/Budhavara, got ${panchanga.vara.name}`);
assert(panchanga.nakshatra.number === 20 && panchanga.nakshatra.name === 'Purva Ashadha' && panchanga.nakshatra.pada === 2,
  `Expected Purva Ashadha Pada 2, got ${panchanga.nakshatra.name} Pada ${panchanga.nakshatra.pada}`);
assert(panchanga.nakshatra.lord === 'Venus', `Expected Venus nakshatra lord, got ${panchanga.nakshatra.lord}`);
assert(panchanga.yoga.number === 2 && panchanga.yoga.name === 'Priti',
  `Expected Priti Yoga, got ${panchanga.yoga.name}`);
assert(panchanga.karana.number === 23 && panchanga.karana.name === 'Bava',
  `Expected Bava at exact birth instant, got ${panchanga.karana.name} (#${panchanga.karana.number})`);
assert(panchanga.ayanamsa.type === 'lahiri' && Math.abs(panchanga.ayanamsa.valueDegrees - 23.93565836563647) < 0.0001,
  `Lahiri ayanamsha mismatch: ${panchanga.ayanamsa.valueDegrees}`);

console.log('✅ Canonical Panchanga: Shukla Dwadashi / Wednesday / Purva Ashadha Pada 2 / Priti / Bava');
console.log(`✅ Sunrise UTC: ${panchanga.sunriseUtc}`);
console.log(`✅ Sunset UTC: ${panchanga.sunsetUtc}`);
console.log('✅ Canonical Panchanga benchmark passed.');
