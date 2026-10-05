/**
 * ASTROWORLD — Phase 9 Configuration Contract
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const supabase = fs.readFileSync(path.join(root, 'backend/src/services/supabaseService.ts'), 'utf8');
const health = fs.readFileSync(path.join(root, 'backend/src/ai_v2/production/healthCheck.ts'), 'utf8');
const env = fs.readFileSync(path.join(root, 'backend/src/ai_v2/production/environmentConfig.ts'), 'utf8');
const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');

const checks: Array<[string, boolean, string]> = [
  [
    'Backend uses server-only Supabase service key',
    supabase.includes('SUPABASE_SERVICE_ROLE_KEY') &&
      !supabase.includes('VITE_SUPABASE_ANON_KEY'),
    'Privileged backend operations must never downgrade to browser anonymous credentials.',
  ],
  [
    'Readiness exposes database configuration',
    health.includes('isSupabaseConfigured') && health.includes('databaseConfigured') && health.includes('corsConfigured'),
    'Database configuration must affect readiness.',
  ],
  [
    'Production environment contains no embedded database password',
    !env.includes('prod_secure_pass') && !env.includes('staging_secret'),
    'Database connection strings must be supplied by environment configuration.',
  ],
  [
    'Production CORS is externally configurable',
    example.includes('CORS_ORIGINS') && example.includes('PUBLIC_WEB_ORIGIN'),
    'Production deployments need explicit browser origin configuration.',
  ],
  [
    'Production cookie policy supports split deployment',
    env.includes("cookieSameSite: 'none'"),
    'The environment model must agree with the secure cross-origin browser session.',
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
console.log('PHASE 9 CONFIG CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');
if (failed > 0) process.exitCode = 1;
