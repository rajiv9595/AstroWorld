/**
 * ASTROWORLD — Phase 9 Startup/Lifecycle Contract
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const backend = fs.readFileSync(path.join(root, 'backend/src/server.ts'), 'utf8');
const rootServer = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

const checks: Array<[string, boolean]> = [
  ['Backend has a direct-entry startup guard', backend.includes('if (invokedScript === __filename)')],
  ['Backend has exactly one guarded start call', (backend.match(/startBackendServer\(PORT\)/g) || []).length === 2],
  ['Backend does not retain unconditional auto-start', !backend.includes('// Auto-start server')],
  ['Root bridge remains the explicit application entrypoint', rootServer.includes('startBackendServer')],
  ['Root bridge imports the backend starter instead of duplicate logic', rootServer.includes("from './backend/src/server.ts'")],
];

let passed = 0;
let failed = 0;
for (const [name, pass] of checks) {
  if (pass) {
    passed++;
    console.log('✅ ' + name);
  } else {
    failed++;
    console.error('❌ ' + name);
  }
}

console.log('\n==================================================');
console.log('PHASE 9 STARTUP CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');
if (failed > 0) process.exitCode = 1;
