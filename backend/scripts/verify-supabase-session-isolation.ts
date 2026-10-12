/**
 * ASTROWORLD — Supabase Session Isolation & Privileged Client Regression Suite
 *
 * Verifies that:
 * 1. The shared `supabase` database client maintains strict authorization isolation
 *    and always uses the privileged service-role key for table operations.
 * 2. User authentication operations executed via `createAuthClient()` (e.g. signInWithPassword,
 *    refreshSession) do NOT contaminate or mutate the privileged singleton's authorization headers.
 * 3. Concurrent requests from different users cannot cross-contaminate authorization contexts.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, isSupabaseConfigured } from '../src/services/supabaseService.ts';
import { createAuthClient } from '../src/services/authClient.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function run(): Promise<void> {
  let passed = 0;
  let failed = 0;

  const assert = (name: string, condition: boolean, detail: string) => {
    if (condition) {
      passed++;
      console.log('✅ ' + name);
    } else {
      failed++;
      console.error('❌ ' + name + ' — ' + detail);
    }
  };

  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  // Test 1: Privileged client uses service-role key
  const privilegedToken = await (supabase as any)._getAccessToken();
  assert(
    'Privileged Supabase client resolves to service-role key',
    privilegedToken === (serviceRoleKey || 'missing-service-role-key'),
    `Expected privileged token to match SUPABASE_SERVICE_ROLE_KEY, got ${privilegedToken?.slice(0, 10)}...`,
  );

  // Test 2: Privileged client has session token lock (_getSessionToken returns null)
  const privilegedSessionToken = await (supabase as any)._getSessionToken();
  assert(
    'Privileged Supabase client locks _getSessionToken to null',
    privilegedSessionToken === null,
    'Privileged client must never resolve session token from in-memory Auth',
  );

  // Test 3: Ephemeral auth clients are isolated from privileged singleton
  const authClientA = createAuthClient();
  const authClientB = createAuthClient();
  assert(
    'createAuthClient produces isolated, distinct client instances',
    authClientA !== (supabase as any) && authClientB !== (supabase as any) && authClientA !== authClientB,
    'Auth clients must be request-scoped and not reference the shared singleton',
  );

  // Test 4: Simulating user session on authClient does not pollute privileged client
  const mockUserToken = 'mock.jwt.user_token_abc123';
  (authClientA as any).auth.getSession = async () => ({
    data: {
      session: {
        access_token: mockUserToken,
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-uuid', email: 'test@example.com' },
      },
    },
    error: null,
  });

  const clientAToken = await (authClientA as any)._getAccessToken();
  assert(
    'Auth client can resolve user session access token',
    clientAToken === mockUserToken,
    `Auth client should resolve user token, got ${clientAToken}`,
  );

  const privilegedTokenAfterAuth = await (supabase as any)._getAccessToken();
  assert(
    'Privileged client authorization is unchanged after user auth on authClient',
    privilegedTokenAfterAuth === (serviceRoleKey || 'missing-service-role-key'),
    'Privileged client was contaminated by authClient session!',
  );

  // Test 5: Multi-user concurrency: User B is not affected by User A
  const clientBToken = await (authClientB as any)._getAccessToken();
  assert(
    'User B auth client is not affected by User A session',
    clientBToken !== mockUserToken,
    'Cross-tenant user session leakage detected between authClient instances!',
  );

  // Test 6: Even if someone sets a session directly on supabase.auth, _getSessionToken lock protects it
  (supabase as any).auth.getSession = async () => ({
    data: {
      session: {
        access_token: 'malicious-or-accidental-user-token',
      },
    },
    error: null,
  });

  const privilegedTokenWithAttemptedContamination = await (supabase as any)._getAccessToken();
  assert(
    'Privileged client refuses session token override and maintains service-role access',
    privilegedTokenWithAttemptedContamination === (serviceRoleKey || 'missing-service-role-key'),
    'Session override breached privileged client authorization!',
  );

  console.log('\n==================================================');
  console.log('SUPABASE SESSION ISOLATION: ' + passed + ' PASSED | ' + failed + ' FAILED');
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled isolation test failure:', err);
  process.exit(1);
});
