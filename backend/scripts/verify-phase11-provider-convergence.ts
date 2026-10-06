/**
 * ASTROWORLD — Phase 11 Provider Convergence TDD
 *
 * RED contract: every AI V2 deterministic tool must execute through the
 * configured ephemeris provider, and evidence provenance must identify the same
 * provider selected by runtime configuration.
 */

import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';
import { TEST_BENCHMARK_PROFILE } from '../../../shared/index.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const original = process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
  try {
    process.env.ASTROWORLD_EPHEMERIS_PROVIDER = 'swiss-ephemeris';

    const result = await (AstrologyToolRegistry as any).executeToolAsync(
      'get_birth_chart',
      { birthProfile: TEST_BENCHMARK_PROFILE },
    );

    assert(result.success === true, 'Configured Swiss provider must execute get_birth_chart successfully.');
    assert(
      result.provenance?.sourceEngine?.toLowerCase().includes('swiss ephemeris'),
      'AI tool provenance must identify Swiss Ephemeris when Swiss is configured.',
    );

    const planet = result.data?.planets?.find((p: any) => p.name === 'Moon');
    assert(Boolean(planet), 'Provider-aware AI chart must contain Moon.');
    assert(
      Number.isFinite(planet?.siderealLongitude),
      'Provider-aware AI chart must return a finite Moon sidereal longitude.',
    );

    console.log('PHASE 11 PROVIDER CONVERGENCE TDD: PASS');
  } finally {
    if (original === undefined) delete process.env.ASTROWORLD_EPHEMERIS_PROVIDER;
    else process.env.ASTROWORLD_EPHEMERIS_PROVIDER = original;
  }
}

main().catch((error) => {
  console.error('PHASE 11 PROVIDER CONVERGENCE TDD: FAIL');
  console.error(error);
  process.exitCode = 1;
});
