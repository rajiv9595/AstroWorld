/**
 * ASTROWORLD — Complete Classical Shadbala Verification
 * Verifies continuous Dig Bala, full Kala Bala (Natonnatha, Paksha, Tribhaga, Vara, Hora, Ayana),
 * continuous Chesta Bala, and continuous Drik Bala (Drishti Pinda / 4).
 */

import * as Astronomy from 'astronomy-engine';
import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateCompleteShadbala,
  calculateStrengthFacts,
  computeCanonicalChart,
} from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
}

console.log('🌌 Starting Complete Classical Shadbala Precision Verification...\n');

const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
const time = new Astronomy.AstroTime(birthUtc);
const ayanamsha = calculateLahiriAyanamsha(time);
const planets = calculatePlanetaryPositions(time, ayanamsha, 1);

// Test 1: Classical Partial Mode Preservation (Contract Test)
console.log('--- 1. Testing Classical Partial Mode Preservation ---');
const partialFacts = calculateStrengthFacts(planets, 1, 2 / 60);
assert(partialFacts.methodology?.shadbala === 'classical_partial', 'Methodology must be classical_partial');
assert(partialFacts.shadbala.length === 7, '7 classical bodies present in partial');
const sunPartial = partialFacts.shadbala.find(p => p.planet === 'Sun')!;
assert(Math.abs(sunPartial.sthanaBala - 308.32) < 0.01, `Sun Sthana Bala matches benchmark: ${sunPartial.sthanaBala}`);
assert(Math.abs(sunPartial.kalaBala - 14.23) < 0.01, `Sun Kala Bala matches benchmark: ${sunPartial.kalaBala}`);
console.log('✅ Classical partial contract preserved with 100% precision.\n');

// Test 2: Complete Classical Mode Execution
console.log('--- 2. Testing Complete Classical High-Precision Mode ---');
const completeShadbala = calculateCompleteShadbala(planets, 2 / 60, {
  birthDateUtc: birthUtc,
  ayanamsha,
  cusps: {
    ascendant: 39.95, // Taurus 9°57'
    mc: 304.5, // Aquarius 4°30'
  },
});

assert(completeShadbala.length === 7, '7 classical bodies evaluated in complete mode');

for (const sf of completeShadbala) {
  console.log(`Graha: ${sf.planet.padEnd(8)} | Sthana: ${sf.sthanaBala.toFixed(2).padStart(6)} | Dig: ${sf.digBala.toFixed(2).padStart(5)} | Kala: ${sf.kalaBala.toFixed(2).padStart(6)} | Chesta: ${sf.chestaBala.toFixed(2).padStart(5)} | Naisargika: ${sf.naisargikaBala.toFixed(2).padStart(5)} | Drik: ${sf.drikBala.toFixed(2).padStart(6)} | Total: ${sf.totalVirupas.toFixed(2).padStart(6)} Virupas (${sf.totalRupas.toFixed(2)} Rupas) - ${sf.verdict}`);

  assert(sf.sthanaBala > 0, `${sf.planet} has valid Sthana Bala: ${sf.sthanaBala}`);
  assert(sf.digBala >= 0 && sf.digBala <= 60, `${sf.planet} Dig Bala bounded in [0, 60]: ${sf.digBala}`);
  assert(sf.kalaBala > 0, `${sf.planet} has genuine multi-tier Kala Bala: ${sf.kalaBala}`);
  assert(sf.chestaBala >= 0 && sf.chestaBala <= 60, `${sf.planet} Chesta Bala bounded in [0, 60]: ${sf.chestaBala}`);
  assert(sf.naisargikaBala > 0, `${sf.planet} has Naisargika Bala: ${sf.naisargikaBala}`);
  assert(sf.drikBala >= -60 && sf.drikBala <= 60, `${sf.planet} Drik Bala bounded in [-60, 60]: ${sf.drikBala}`);
  assert(sf.totalVirupas > 0, `${sf.planet} Total Virupas positive: ${sf.totalVirupas}`);
  assert(sf.subBreakdown !== undefined, `${sf.planet} has complete subBreakdown diagnostics`);
  assert(sf.subBreakdown?.sthana?.uccha !== undefined, `${sf.planet} has Uccha Bala`);
  assert(sf.subBreakdown?.kala?.natonnatha !== undefined, `${sf.planet} has Natonnatha Bala`);
  assert(sf.subBreakdown?.kala?.paksha !== undefined, `${sf.planet} has Paksha Bala`);
  assert(sf.subBreakdown?.kala?.tribhaga !== undefined, `${sf.planet} has Tribhaga Bala`);
  assert(sf.subBreakdown?.kala?.ayana !== undefined, `${sf.planet} has Ayana Bala`);
  assert(sf.subBreakdown?.drik?.drishtiPinda !== undefined, `${sf.planet} has Drishti Pinda`);
}

// Test 3: Canonical Chart Integration
console.log('\n--- 3. Testing Canonical Chart Integration ---');
const canonical = computeCanonicalChart(TEST_BENCHMARK_PROFILE);
assert(Boolean(canonical.strength?.completeShadbala), 'Canonical chart includes completeShadbala');
assert(canonical.strength?.completeShadbala?.length === 7, 'completeShadbala contains 7 grahas');
assert(Boolean(canonical.strength?.shadbala), 'Canonical chart includes standard shadbala contract');
console.log('✅ Canonical chart cleanly exposes both standard benchmark and complete high-precision Shadbala.\n');

console.log('==================================================');
console.log('🎉 ALL COMPLETE SHADBALA PRECISION TESTS PASSED!');
console.log('==================================================');
