/**
 * ASTROWORLD — Phase 15 Production Operational Closure TDD
 *
 * Release-safety contract:
 * - Live consultations must never invent an identity.
 * - Verified user ids must be preserved exactly after whitespace normalization.
 * - Anonymous compatibility is allowed only for non-live/mock execution.
 */

import { resolveConsultationUserId } from '../src/ai_v2/consultation/consultationOrchestrator.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertThrows(action: () => unknown, message: string): void {
  try {
    action();
  } catch {
    return;
  }
  throw new Error(message);
}

function main(): void {
  assertThrows(
    () => resolveConsultationUserId(undefined, true),
    'Live consultation must fail closed when userId is missing.',
  );

  assertThrows(
    () => resolveConsultationUserId('   ', true),
    'Live consultation must fail closed when userId is blank.',
  );

  assert(
    resolveConsultationUserId('  user_phase15  ', true) === 'user_phase15',
    'Live consultation must preserve the authenticated userId after trimming.',
  );

  assert(
    resolveConsultationUserId(undefined, false) === 'default_user',
    'Anonymous compatibility must remain restricted to non-live/mock execution.',
  );

  console.log('PHASE 15 PRODUCTION OPERATIONAL CLOSURE TDD: PASS');
}

try {
  main();
} catch (error) {
  console.error('PHASE 15 PRODUCTION OPERATIONAL CLOSURE TDD: FAIL');
  console.error(error);
  process.exitCode = 1;
}
