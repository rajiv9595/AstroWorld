/**
 * ASTROWORLD — Phase 15 Production Operational Closure TDD
 *
 * Security/release contract:
 * - A live consultation must never invent an identity.
 * - A mock/test consultation may retain the legacy anonymous context for isolated
 *   deterministic tests that do not touch production identity boundaries.
 * - The production release artifacts must clearly remain blocked when the
 *   authoritative historical latency SLO is breached.
 */

import fs from 'node:fs';
import path from 'node:path';
import { resolveConsultationUserId } from '../src/ai_v2/consultation/consultationOrchestrator.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(new URL('.', import.meta.url).pathname, '../..');
  const orchestratorSourcePath = path.resolve(
    repoRoot,
    'src/ai_v2/consultation/consultationOrchestrator.ts',
  );
  const runbookPath = path.resolve(repoRoot, '../../production_runbook.md');
  const manifestPath = path.resolve(repoRoot, '../../release_manifest.md');

  // Live identity boundary.
  assert(
    (() => {
      try {
        resolveConsultationUserId(undefined, true);
        return false;
      } catch (error: any) {
        return String(error?.message || error).includes('authenticated userId');
      }
    })(),
    'Live consultation identity resolution must fail closed when userId is missing.',
  );
  assert(
    (() => {
      try {
        resolveConsultationUserId('   ', true);
        return false;
      } catch {
        return true;
      }
    })(),
    'Live consultation identity resolution must fail closed when userId is blank.',
  );
  assert(
    resolveConsultationUserId('user_phase15', true) === 'user_phase15',
    'Live consultation must preserve the verified authenticated userId.',
  );
  assert(
    resolveConsultationUserId(undefined, false) === 'default_user',
    'Anonymous compatibility remains restricted to non-live/mock execution.',
  );

  const orchestratorSource = fs.readFileSync(orchestratorSourcePath, 'utf8');
  assert(
    !orchestratorSource.includes("options?.userId || 'default_user'"),
    'ConsultationOrchestrator must not contain the production default_user identity fallback.',
  );

  const runbook = fs.readFileSync(runbookPath, 'utf8');
  assert(
    runbook.includes('NEEDS_OPERATIONAL_REVIEW') &&
      runbook.includes('CLOSED / 0%') &&
      runbook.includes('Stage 1') &&
      runbook.includes('BLOCKED'),
    'Production runbook must preserve the explicit closed/blocked operational gate while historical SLO evidence is breached.',
  );

  const manifest = fs.readFileSync(manifestPath, 'utf8');
  assert(
    manifest.includes('NEEDS_OPERATIONAL_REVIEW') &&
      manifest.includes('DISABLED') &&
      manifest.includes('Stage 1 Rollout Eligibility'),
    'Release manifest must preserve the explicit operational-review status and disabled public access state.',
  );

  console.log('PHASE 15 PRODUCTION OPERATIONAL CLOSURE TDD: PASS');
}

main().catch((error) => {
  console.error('PHASE 15 PRODUCTION OPERATIONAL CLOSURE TDD: FAIL');
  console.error(error);
  process.exitCode = 1;
});
