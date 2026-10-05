/**
 * ASTROWORLD — Sidereal Solar Ingress Contract
 *
 * Independent Swiss-Ephemeris benchmark:
 * 2026-10-05 00:00 UTC -> Sun in sidereal Virgo;
 * next Libra ingress ≈ 2026-10-17 14:21:43 UTC.
 */

import { findNextSiderealSolarIngress } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const start = new Date('2026-10-05T00:00:00.000Z');
const result = findNextSiderealSolarIngress(start);

assert(result.targetSignIndex === 6, `Expected Libra target index 6, got ${result.targetSignIndex}`);

const expectedMs = Date.parse('2026-10-17T14:21:43.000Z');
const deltaMs = Math.abs(result.timestampUtc.getTime() - expectedMs);
assert(deltaMs <= 120_000,
  `Solar ingress differs from Swiss benchmark by more than 120s: ${result.timestampUtc.toISOString()} (Δ ${deltaMs / 1000}s)`);

assert(result.timestampUtc.getTime() > start.getTime(),
  'Solar ingress must be strictly after the evaluated instant');

console.log('✅ Sidereal solar ingress target/sign and timestamp contract passed');
