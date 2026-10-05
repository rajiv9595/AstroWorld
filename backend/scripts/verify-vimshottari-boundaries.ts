/**
 * ASTROWORLD — Vimshottari Boundary/Continuity Verification
 *
 * Validates exact nakshatra/pada edges and MD/AD/PD partition continuity.
 */

import { getNakshatraAndPada, calculateVimshottariDasha } from '../../shared/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const span = 360 / 27;
const eps = 1e-9;

// Exact nakshatra starts must belong to the new nakshatra.
for (let i = 0; i < 27; i++) {
  const start = i * span;
  const before = getNakshatraAndPada((start - eps + 360) % 360);
  const exact = getNakshatraAndPada(start);
  assert(exact.nakshatraNumber === i + 1, `Nakshatra ${i + 1}: exact start assigned incorrectly`);
  assert(before.nakshatraNumber === (i === 0 ? 27 : i), `Nakshatra ${i + 1}: previous interval assigned incorrectly`);
}

// Each nakshatra must contain four padas with exact 3°20' boundaries.
const padaSpan = span / 4;
for (let i = 0; i < 27; i++) {
  const nakStart = i * span;
  for (let p = 0; p < 4; p++) {
    const exact = getNakshatraAndPada(nakStart + p * padaSpan);
    assert(exact.pada === p + 1, `Nakshatra ${i + 1} pada boundary ${p + 1} failed`);
  }
}

// Dasha hierarchy must partition each parent without gaps/overlaps.
const moon = 257.8637656115666;
const birth = new Date('2005-08-17T00:02:00+05:30');
const evaluation = new Date('2005-08-17T00:02:00+05:30');
const dasha = calculateVimshottariDasha(moon, birth, evaluation);

for (const md of dasha.mahadashas) {
  const ads = md.antardashas;
  assert(ads.length === 9, `MD ${md.period.path}: expected 9 ADs`);
  assert(Math.abs(Date.parse(ads[0].period.startDateIso) - Date.parse(md.period.startDateIso)) <= 1, `MD ${md.period.path}: AD start mismatch`);
  for (let i = 1; i < ads.length; i++) {
    const prev = ads[i - 1].period;
    const cur = ads[i].period;
    assert(Date.parse(prev.endDateIso) === Date.parse(cur.startDateIso), `MD ${md.period.path}: AD gap/overlap at ${cur.path}`);
  }
  assert(Math.abs(Date.parse(ads[ads.length - 1].period.endDateIso) - Date.parse(md.period.endDateIso)) <= 1, `MD ${md.period.path}: AD end mismatch`);

  for (const ad of ads) {
    const pds = ad.pratyantardashas;
    assert(pds.length === 9, `AD ${ad.period.path}: expected 9 PDs`);
    assert(Date.parse(pds[0].startDateIso) === Date.parse(ad.period.startDateIso), `AD ${ad.period.path}: PD start mismatch`);
    for (let i = 1; i < pds.length; i++) {
      assert(Date.parse(pds[i - 1].endDateIso) === Date.parse(pds[i].startDateIso), `AD ${ad.period.path}: PD gap/overlap`);
    }
    assert(Math.abs(Date.parse(pds[pds.length - 1].endDateIso) - Date.parse(ad.period.endDateIso)) <= 1, `AD ${ad.period.path}: PD end mismatch`);
  }
}

console.log('✅ All 27 nakshatra and 108 pada boundary checks passed');

const farFuture = new Date('2126-08-17T00:02:00+05:30');
const farFutureDasha = calculateVimshottariDasha(moon, birth, farFuture);
assert(
  farFutureDasha.mahadashas.length >= 18 &&
    farFutureDasha.mahadashas.some(p => p.period.activeNow),
  'Vimshottari 120-year cycle continuation failed',
);

console.log('✅ Vimshottari MD/AD/PD continuity checks passed');
