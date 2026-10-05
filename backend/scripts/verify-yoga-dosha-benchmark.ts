/**
 * ASTROWORLD — Yoga / Dosha Benchmark
 *
 * Canonical benchmark:
 * Taurus Lagna; Moon Sagittarius; Jupiter Virgo; Mars Aries; Venus Virgo;
 * Sun Leo; Mercury Cancer; Saturn Cancer; Rahu Pisces; Ketu Virgo.
 *
 * This is a structural formation benchmark. Effects remain qualified and
 * school-dependent where the literature is not unanimous.
 */

import { TEST_BENCHMARK_PROFILE, computeCanonicalChart } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const chart = computeCanonicalChart(TEST_BENCHMARK_PROFILE, new Date('2005-08-16T18:32:00.000Z'));

const yoga = (id: string) => chart.yogas.find(y => y.id === id);
const dosha = (id: string) => chart.doshas.find(d => d.id === id);

assert(yoga('gajakesari')?.present === true, 'Canonical Gajakesari must be structurally present: Jupiter is 10th from Moon');
assert(yoga('gajakesari')?.interpretationStatus === 'structural', 'Gajakesari must be marked structural');
assert(yoga('raja_yoga')?.present === true, 'Canonical Raja Yoga must be present via Saturn owning 9th and 10th');
assert(yoga('vimala_viparita')?.present === true, 'Canonical Vimala Viparita must be present: 12th lord Mars is in 12th');
assert(yoga('amala_yoga')?.present === true, 'Canonical Amala must be present from benefics in 10th from Moon');
assert(yoga('budhaditya')?.present === false, 'Canonical Budhaditya must be absent: Sun and Mercury are in different signs');
assert(dosha('kala_sarpa')?.schoolDependent === true, 'Kala Sarpa must remain school-dependent');

assert(dosha('kuja_dosha')?.present === true, 'Canonical Kuja Dosha is structurally present from Mars in 12th from Lagna');
assert(dosha('kuja_dosha')?.schoolDependent === true, 'Kuja Dosha must remain explicitly school-dependent');

console.log('✅ Canonical Gajakesari / Raja / Vimala / Amala benchmark passed');
console.log('✅ Canonical Budhaditya absence and school-dependent dosha metadata passed');
