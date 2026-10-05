/**
 * ASTROWORLD — Shadbala Contract Benchmark
 *
 * This verifies the benchmark chart against an independently reconstructed
 * component set using the audited classical formulas. The engine is explicitly
 * classified as classical_partial because full Kala/Cheshta/Bhava Bala require
 * additional birth-context terms beyond the current PlanetPosition contract.
 */

import * as Astronomy from 'astronomy-engine';
import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateStrengthFacts,
} from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const time = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(time);
const planets = calculatePlanetaryPositions(time, ayanamsha, 1);
const facts = calculateStrengthFacts(planets, 1, 2 / 60);

assert(facts.methodology?.shadbala === 'classical_partial',
  'Shadbala methodology must remain explicitly classical_partial');

const expected: Record<string, {
  sthana: number; dig: number; kala: number; chesta: number; naisargika: number; drik: number;
}> = {
  Sun: { sthana: 308.32, dig: 0, kala: 14.23, chesta: 30, naisargika: 60, drik: 0 },
  Moon: { sthana: 164.95, dig: 20, kala: 105.77, chesta: 30, naisargika: 51.43, drik: 0 },
  Mars: { sthana: 150.05, dig: 40, kala: 73.89, chesta: 30, naisargika: 17.14, drik: -15 },
  Mercury: { sthana: 148.70, dig: 40, kala: 105.77, chesta: 30, naisargika: 25.71, drik: -15 },
  Jupiter: { sthana: 158.14, dig: 20, kala: 46.11, chesta: 30, naisargika: 34.29, drik: -15 },
  Venus: { sthana: 157.12, dig: 50, kala: 46.11, chesta: 30, naisargika: 42.86, drik: -15 },
  Saturn: { sthana: 135.44, dig: 20, kala: 73.89, chesta: 30, naisargika: 8.57, drik: -15 },
};

for (const [name, e] of Object.entries(expected)) {
  const got = facts.shadbala.find(p => p.planet === name);
  assert(Boolean(got), `Missing Shadbala row for ${name}`);
  assert(Math.abs(got!.sthanaBala - e.sthana) < 0.01, `${name} Sthana mismatch: ${got!.sthanaBala}`);
  assert(Math.abs(got!.digBala - e.dig) < 0.01, `${name} Dig mismatch: ${got!.digBala}`);
  assert(Math.abs(got!.kalaBala - e.kala) < 0.01, `${name} Kala mismatch: ${got!.kalaBala}`);
  assert(Math.abs(got!.chestaBala - e.chesta) < 0.01, `${name} Cheshta mismatch: ${got!.chestaBala}`);
  assert(Math.abs(got!.naisargikaBala - e.naisargika) < 0.01, `${name} Naisargika mismatch: ${got!.naisargikaBala}`);
  assert(Math.abs(got!.drikBala - e.drik) < 0.01, `${name} Drik mismatch: ${got!.drikBala}`);
}

console.log('✅ Canonical Shadbala component benchmark passed');
console.log('✅ Shadbala remains explicitly classified as classical_partial');
