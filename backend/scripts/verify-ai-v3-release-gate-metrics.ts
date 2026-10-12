import { evaluateLiveSlo, percentileNearestRank, LiveSloSample } from '../src/ai_v2/production/releaseGateMetrics.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sample(overrides: Partial<LiveSloSample> = {}): LiveSloSample {
  return {
    sampleId: 'sample-1',
    scenario: 'career_compound',
    totalLatencyMs: 1200,
    providerLatencyMs: 600,
    executionMode: 'live_gemini',
    liveModelSucceeded: true,
    fallbackTriggered: false,
    responseValid: true,
    validatorStatus: 'approved',
    referencedEvidenceCount: 3,
    ...overrides,
  };
}

function main(): void {
  assert(
    percentileNearestRank([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0.95) === 19,
    'Nearest-rank p95 for 20 samples must select the 19th ordered value.',
  );

  const passingSamples = [
    sample({ sampleId: '1', totalLatencyMs: 1000, providerLatencyMs: 400 }),
    sample({ sampleId: '2', totalLatencyMs: 1200, providerLatencyMs: 500 }),
    sample({ sampleId: '3', totalLatencyMs: 1400, providerLatencyMs: 700, fallbackTriggered: true, validatorStatus: 'repaired' }),
    sample({ sampleId: '4', totalLatencyMs: 1600, providerLatencyMs: 800 }),
  ];
  const passed = evaluateLiveSlo(passingSamples, {
    minSamples: 4,
    minLiveSuccessRate: 1,
    maxFallbackRate: 0.25,
    maxP95TotalLatencyMs: 1600,
    maxP95ProviderLatencyMs: 800,
  });
  assert(passed.passed, `Within-threshold live metrics must pass: ${passed.failures.join('; ')}`);
  assert(passed.metrics.p95TotalLatencyMs === 1600, 'Total latency p95 must be computed using nearest-rank percentile.');
  assert(passed.metrics.p95ProviderLatencyMs === 800, 'Provider latency p95 must exclude samples without successful provider latency.');
  assert(passed.metrics.fallbackRate === 0.25, 'Fallback rate must represent samples where fallback was triggered.');

  const failedLatency = evaluateLiveSlo(passingSamples, {
    minSamples: 4,
    minLiveSuccessRate: 1,
    maxFallbackRate: 0.25,
    maxP95TotalLatencyMs: 1500,
    maxP95ProviderLatencyMs: 800,
  });
  assert(!failedLatency.passed && failedLatency.failures.some(item => item.includes('total latency p95')),
    'Latency above the configured threshold must fail the release gate.');

  const failedLivePath = evaluateLiveSlo([
    sample({ sampleId: 'fallback-only', executionMode: 'deterministic_ci', liveModelSucceeded: false, providerLatencyMs: 0 }),
    ...passingSamples.slice(1),
  ], {
    minSamples: 4,
    minLiveSuccessRate: 1,
    maxFallbackRate: 0.25,
    maxP95TotalLatencyMs: 2000,
    maxP95ProviderLatencyMs: 1000,
  });
  assert(!failedLivePath.passed && failedLivePath.failures.some(item => item.includes('live-model success rate')),
    'A deterministic fallback cannot be misreported as a live-model success.');

  const failedQuality = evaluateLiveSlo([
    sample({ validatorStatus: 'fallback_safe', responseValid: true }),
    ...passingSamples.slice(1),
  ], {
    minSamples: 4,
    minLiveSuccessRate: 1,
    maxFallbackRate: 0.25,
    maxP95TotalLatencyMs: 2000,
    maxP95ProviderLatencyMs: 1000,
  });
  assert(!failedQuality.passed && failedQuality.sampleFailures.some(item => item.includes('fallback_safe')),
    'A fallback-safe answer must not be counted as a release-quality live response.');

  console.log('AI V3 RELEASE-GATE METRICS: PASS (5 contracts)');
}

try {
  main();
} catch (error) {
  console.error('AI V3 RELEASE-GATE METRICS: FAIL');
  console.error(error);
  process.exitCode = 1;
}
