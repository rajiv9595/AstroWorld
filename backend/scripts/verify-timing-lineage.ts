/**
 * ASTROWORLD — Timing Signal Lineage Contract
 *
 * Every timing signal must cite evidence that exists in the canonical evidence pool.
 * Exact timestamps must represent future event timestamps, not the query instant.
 */

import { TEST_BENCHMARK_PROFILE, computeCanonicalChart } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const evaluation = new Date('2026-10-05T00:00:00.000Z');
const chart = computeCanonicalChart(TEST_BENCHMARK_PROFILE, evaluation);

const evidenceIds = new Set(chart.evidencePool.map(e => e.evidenceId));

for (const signal of chart.timingSignals) {
  assert(
    signal.evidenceIds.every(id => evidenceIds.has(id)),
    `Timing signal ${signal.id} contains ungrounded evidence IDs`
  );

  if (signal.precision === 'EVENT_WINDOW') {
    assert(Boolean(signal.windowStartIso && signal.windowEndIso),
      `Event-window signal ${signal.id} missing boundaries`);
    assert(Date.parse(signal.windowStartIso!) <= Date.parse(signal.windowEndIso!),
      `Event-window signal ${signal.id} has reversed boundaries`);
  }

  if (signal.precision === 'EXACT') {
    assert(Boolean(signal.exactTimestampUtc),
      `Exact signal ${signal.id} missing exactTimestampUtc`);
  }
}

const ingress = chart.transits.solarIngress;
assert(Boolean(ingress), 'Solar ingress provenance is missing');
assert(Date.parse(ingress!.timestampUtc) > evaluation.getTime(),
  `Solar ingress must be after evaluation time: ${ingress!.timestampUtc}`);

console.log('✅ All timing signals have valid evidence lineage');
console.log('✅ Exact solar ingress is represented by a future event timestamp');
