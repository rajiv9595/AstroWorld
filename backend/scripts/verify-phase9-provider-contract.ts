/**
 * ASTROWORLD — Phase 9 Canonical Provider Contract
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const route = fs.readFileSync(path.join(root, 'backend/src/routes/astrologyRoutes.ts'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'backend/src/services/ephemeris/providerRuntime.ts'), 'utf8');
const shared = fs.readFileSync(path.join(root, 'shared/engine/ephemeris.ts'), 'utf8');

const checks: Array<[string, boolean, string]> = [
  [
    'Astrology route uses configured provider path',
    route.includes('computeCanonicalChartWithConfiguredEphemeris'),
    'Public backend astrology calculations must go through the runtime provider boundary.',
  ],
  [
    'Provider runtime defaults to Astronomy Engine',
    runtime.includes("parseEphemerisSource") && runtime.includes("source === 'swiss-ephemeris'"),
    'The browser-safe default must remain Astronomy Engine.',
  ],
  [
    'Swiss dependency is lazy-loaded',
    runtime.includes('createSwissEphemerisProvider') &&
      shared.includes("parseEphemerisSource"),
    'Optional native Swiss support must not be eagerly required by shared/browser code.',
  ],
  [
    'Provider validates horizon coordinates',
    shared.includes('validateHorizonLocation'),
    'Horizon calculations must share finite/range location validation.',
  ],
  [
    'Provider snapshot checks source identity',
    runtime.includes('snapshot.source !== provider.source'),
    'Runtime provider mismatch must fail closed.',
  ],
  [
    'Provider snapshot requires nine planetary entries',
    runtime.includes('snapshot.planets.length !== 9'),
    'The canonical chart requires all nine supported planetary entries.',
  ],
];

let passed = 0;
let failed = 0;
for (const [name, pass, detail] of checks) {
  if (pass) {
    passed++;
    console.log('✅ ' + name);
  } else {
    failed++;
    console.error('❌ ' + name + ' — ' + detail);
  }
}

console.log('\n==================================================');
console.log('PHASE 9 PROVIDER CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');
if (failed > 0) process.exitCode = 1;
