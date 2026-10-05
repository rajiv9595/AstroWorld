/**
 * ASTROWORLD — Sade Sati Boundary Contract
 *
 * Sade Sati is defined here strictly by Saturn's sign relative to natal Moon:
 * 12th = rising, 1st = peak, 2nd = setting. Exact longitude entry within a
 * sign does not alter the categorical phase.
 */

import { classifySadeSati } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cases = [
  { saturn: 11, moon: 0, active: true, phase: 'RISING' as const },
  { saturn: 0, moon: 0, active: true, phase: 'PEAK' as const },
  { saturn: 1, moon: 0, active: true, phase: 'SETTING' as const },
  { saturn: 2, moon: 0, active: false, phase: 'NONE' as const },
  { saturn: 5, moon: 8, active: true, phase: 'RISING' as const },
];

for (const c of cases) {
  const got = classifySadeSati(c.saturn, c.moon);
  assert(got.active === c.active && got.phase === c.phase,
    `Expected ${c.phase}/${c.active}, got ${got.phase}/${got.active}`);
}

console.log('✅ Sade Sati 12th/1st/2nd-from-Moon boundary contract passed');
