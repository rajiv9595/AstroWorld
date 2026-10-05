/**
 * ASTROWORLD — Phase 9 Canonical Engine Convergence Contract
 *
 * The frontend engine directory must remain compatibility-only. Calculation
 * truth belongs to @astroworld/shared so precision fixes cannot diverge between
 * the browser and AI/backend paths.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const engineDir = path.join(root, 'frontend', 'src', 'engine');

const expectedAdapters = [
  'astronomy.ts',
  'constants.ts',
  'dasha.ts',
  'dignity.ts',
  'jaimini.ts',
  'panchanga.ts',
  'predictions.ts',
  'provenance.ts',
  'shadbala.ts',
  'transits.ts',
  'types.ts',
  'vargas.ts',
  'yogas.ts',
  'ashtakavarga.ts',
];

let passed = 0;
let failed = 0;

for (const filename of expectedAdapters) {
  const filenamePath = path.join(engineDir, filename);
  const content = fs.readFileSync(filenamePath, 'utf8');

  if (content.includes("export * from '@astroworld/shared';")) {
    passed++;
    console.log('✅ Frontend engine adapter: ' + filename);
  } else {
    failed++;
    console.error('❌ Frontend engine diverged from shared canonical package: ' + filename);
  }
}

const canonicalPath = path.join(engineDir, 'canonicalChart.ts');
const canonical = fs.readFileSync(canonicalPath, 'utf8');
if (
  canonical.includes("export * from '@astroworld/shared';") &&
  canonical.includes('detectRegionalChartStyle')
) {
  passed++;
  console.log('✅ canonicalChart compatibility adapter preserves UI-only chart-style helper');
} else {
  failed++;
  console.error('❌ canonicalChart adapter is not correctly delegated to shared engine');
}

console.log('\\n==================================================');
console.log('PHASE 9 ENGINE CONVERGENCE CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');

if (failed > 0) process.exitCode = 1;
