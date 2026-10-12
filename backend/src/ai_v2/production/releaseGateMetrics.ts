/**
 * Pure metric aggregation and release-gate evaluation for the opt-in AI V3 live SLO audit.
 * Keeps the latency/fallback policy deterministic and unit-testable without API calls.
 */

export interface LiveSloSample {
  sampleId: string;
  scenario: string;
  totalLatencyMs: number;
  /** Duration of the successful provider call. Zero means no live provider response. */
  providerLatencyMs: number;
  executionMode: string;
  liveModelSucceeded: boolean;
  fallbackTriggered: boolean;
  responseValid: boolean;
  validatorStatus: string;
  referencedEvidenceCount: number;
}

export interface LiveSloThresholds {
  minSamples: number;
  minLiveSuccessRate: number;
  maxFallbackRate: number;
  maxP95TotalLatencyMs: number;
  maxP95ProviderLatencyMs: number;
}

export interface LiveSloMetrics {
  sampleCount: number;
  liveModelSuccessCount: number;
  liveModelSuccessRate: number;
  fallbackCount: number;
  fallbackRate: number;
  p50TotalLatencyMs: number;
  p95TotalLatencyMs: number;
  maxTotalLatencyMs: number;
  providerLatencySampleCount: number;
  p50ProviderLatencyMs: number;
  p95ProviderLatencyMs: number;
  maxProviderLatencyMs: number;
}

export interface LiveSloEvaluation {
  passed: boolean;
  metrics: LiveSloMetrics;
  failures: string[];
  sampleFailures: string[];
  thresholds: LiveSloThresholds;
}

export function percentileNearestRank(values: number[], percentile: number): number {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Percentile calculation requires at least one sample.');
  }
  if (!Number.isFinite(percentile) || percentile <= 0 || percentile > 1) {
    throw new Error('Percentile must be within (0, 1].');
  }
  for (const value of values) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Percentile samples must be finite, non-negative numbers.');
    }
  }
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.ceil(percentile * ordered.length) - 1];
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function evaluateLiveSlo(
  samples: LiveSloSample[],
  thresholds: LiveSloThresholds,
): LiveSloEvaluation {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error('Live SLO evaluation requires at least one sample.');
  }

  if (!Number.isInteger(thresholds.minSamples) || thresholds.minSamples < 1) {
    throw new Error('minSamples must be a positive integer.');
  }
  if (
    !Number.isFinite(thresholds.minLiveSuccessRate) ||
    thresholds.minLiveSuccessRate < 0 ||
    thresholds.minLiveSuccessRate > 1
  ) {
    throw new Error('minLiveSuccessRate must be within [0, 1].');
  }
  if (!Number.isFinite(thresholds.maxFallbackRate) || thresholds.maxFallbackRate < 0 || thresholds.maxFallbackRate > 1) {
    throw new Error('maxFallbackRate must be within [0, 1].');
  }
  if (
    !Number.isFinite(thresholds.maxP95TotalLatencyMs) ||
    thresholds.maxP95TotalLatencyMs <= 0 ||
    !Number.isFinite(thresholds.maxP95ProviderLatencyMs) ||
    thresholds.maxP95ProviderLatencyMs <= 0
  ) {
    throw new Error('p95 latency thresholds must be positive finite numbers.');
  }

  const totalLatencies = samples.map(sample => sample.totalLatencyMs);
  const successfulProviderLatencies = samples
    .filter(sample => sample.liveModelSucceeded && sample.providerLatencyMs > 0)
    .map(sample => sample.providerLatencyMs);
  const liveModelSuccessCount = samples.filter(
    sample => sample.executionMode === 'live_gemini' && sample.liveModelSucceeded,
  ).length;
  const fallbackCount = samples.filter(sample => sample.fallbackTriggered).length;

  const metrics: LiveSloMetrics = {
    sampleCount: samples.length,
    liveModelSuccessCount,
    liveModelSuccessRate: ratio(liveModelSuccessCount, samples.length),
    fallbackCount,
    fallbackRate: ratio(fallbackCount, samples.length),
    p50TotalLatencyMs: percentileNearestRank(totalLatencies, 0.5),
    p95TotalLatencyMs: percentileNearestRank(totalLatencies, 0.95),
    maxTotalLatencyMs: Math.max(...totalLatencies),
    providerLatencySampleCount: successfulProviderLatencies.length,
    p50ProviderLatencyMs: successfulProviderLatencies.length
      ? percentileNearestRank(successfulProviderLatencies, 0.5)
      : 0,
    p95ProviderLatencyMs: successfulProviderLatencies.length
      ? percentileNearestRank(successfulProviderLatencies, 0.95)
      : 0,
    maxProviderLatencyMs: successfulProviderLatencies.length
      ? Math.max(...successfulProviderLatencies)
      : 0,
  };

  const failures: string[] = [];
  const sampleFailures: string[] = [];

  if (samples.length < thresholds.minSamples) {
    failures.push(`sample count ${samples.length} is below minimum ${thresholds.minSamples}`);
  }
  if (metrics.liveModelSuccessRate < thresholds.minLiveSuccessRate) {
    failures.push(
      `live-model success rate ${(metrics.liveModelSuccessRate * 100).toFixed(1)}% is below minimum ${(thresholds.minLiveSuccessRate * 100).toFixed(1)}%`,
    );
  }
  if (metrics.fallbackRate > thresholds.maxFallbackRate) {
    failures.push(
      `fallback rate ${(metrics.fallbackRate * 100).toFixed(1)}% exceeds maximum ${(thresholds.maxFallbackRate * 100).toFixed(1)}%`,
    );
  }
  if (metrics.p95TotalLatencyMs > thresholds.maxP95TotalLatencyMs) {
    failures.push(
      `total latency p95 ${metrics.p95TotalLatencyMs}ms exceeds maximum ${thresholds.maxP95TotalLatencyMs}ms`,
    );
  }
  if (successfulProviderLatencies.length === 0 || metrics.p95ProviderLatencyMs > thresholds.maxP95ProviderLatencyMs) {
    failures.push(
      successfulProviderLatencies.length === 0
        ? 'no successful live-provider latency samples were recorded'
        : `provider latency p95 ${metrics.p95ProviderLatencyMs}ms exceeds maximum ${thresholds.maxP95ProviderLatencyMs}ms`,
    );
  }

  for (const sample of samples) {
    const prefix = `sample ${sample.sampleId} (${sample.scenario})`;
    if (sample.executionMode !== 'live_gemini' || !sample.liveModelSucceeded) {
      sampleFailures.push(`${prefix}: no successful live-model response; executionMode=${sample.executionMode}`);
    }
    if (!sample.responseValid) {
      sampleFailures.push(`${prefix}: consultation result or final response failed validation`);
    }
    if (sample.validatorStatus !== 'approved' && sample.validatorStatus !== 'repaired') {
      sampleFailures.push(`${prefix}: final validator status is ${sample.validatorStatus}`);
    }
    if (sample.referencedEvidenceCount < 1) {
      sampleFailures.push(`${prefix}: no referenced verified evidence in final response`);
    }
  }

  return {
    passed: failures.length === 0 && sampleFailures.length === 0,
    metrics,
    failures,
    sampleFailures,
    thresholds: { ...thresholds },
  };
}
