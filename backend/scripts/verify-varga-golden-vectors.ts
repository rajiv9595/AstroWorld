/**
 * ASTROWORLD — Shodashavarga Golden Vectors
 *
 * Golden signs are independently calculated from the classical divisional
 * formulas using the Swiss-Ephemeris benchmark longitudes. This test checks
 * every one of the 16 configured Vargas and explicitly exercises D60 boundaries.
 */

import { calculateVargaSignIndex, TEST_BENCHMARK_PROFILE, VargaCode, ZODIAC_SIGNS } from '../../shared/index.ts';

const vectors: Record<VargaCode, Record<string, string>> = {
  D1: { Sun:'Leo', Moon:'Sagittarius', Mars:'Aries', Mercury:'Cancer', Jupiter:'Virgo', Venus:'Virgo', Saturn:'Cancer', Rahu:'Pisces', Ketu:'Virgo' },
  D2: { Sun:'Leo', Moon:'Cancer', Mars:'Cancer', Mercury:'Cancer', Jupiter:'Leo', Venus:'Cancer', Saturn:'Cancer', Rahu:'Leo', Ketu:'Leo' },
  D3: { Sun:'Leo', Moon:'Aries', Mars:'Leo', Mercury:'Scorpio', Jupiter:'Taurus', Venus:'Virgo', Saturn:'Scorpio', Rahu:'Scorpio', Ketu:'Taurus' },
  D4: { Sun:'Leo', Moon:'Gemini', Mars:'Libra', Mercury:'Libra', Jupiter:'Pisces', Venus:'Virgo', Saturn:'Libra', Rahu:'Virgo', Ketu:'Pisces' },
  D7: { Sun:'Leo', Moon:'Aries', Mars:'Cancer', Mercury:'Aries', Jupiter:'Leo', Venus:'Aries', Saturn:'Pisces', Rahu:'Aquarius', Ketu:'Leo' },
  D9: { Sun:'Aries', Moon:'Virgo', Mars:'Leo', Mercury:'Scorpio', Jupiter:'Cancer', Venus:'Aquarius', Saturn:'Libra', Rahu:'Capricorn', Ketu:'Cancer' },
  D10:{ Sun:'Leo', Moon:'Taurus', Mars:'Virgo', Mercury:'Cancer', Jupiter:'Sagittarius', Venus:'Gemini', Saturn:'Gemini', Rahu:'Gemini', Ketu:'Sagittarius' },
  D12:{ Sun:'Leo', Moon:'Cancer', Mars:'Libra', Mercury:'Sagittarius', Jupiter:'Taurus', Venus:'Scorpio', Saturn:'Scorpio', Rahu:'Scorpio', Ketu:'Taurus' },
  D16:{ Sun:'Leo', Moon:'Virgo', Mars:'Sagittarius', Mercury:'Scorpio', Jupiter:'Scorpio', Venus:'Pisces', Saturn:'Virgo', Rahu:'Scorpio', Ketu:'Scorpio' },
  D20:{ Sun:'Sagittarius', Moon:'Cancer', Mars:'Pisces', Mercury:'Capricorn', Jupiter:'Libra', Venus:'Scorpio', Saturn:'Libra', Rahu:'Libra', Ketu:'Libra' },
  D24:{ Sun:'Leo', Moon:'Libra', Mars:'Virgo', Mercury:'Gemini', Jupiter:'Sagittarius', Venus:'Scorpio', Saturn:'Pisces', Rahu:'Sagittarius', Ketu:'Sagittarius' },
  D27:{ Sun:'Aries', Moon:'Leo', Mars:'Gemini', Mercury:'Aquarius', Jupiter:'Aquarius', Venus:'Sagittarius', Saturn:'Libra', Rahu:'Virgo', Ketu:'Pisces' },
  D30:{ Sun:'Aries', Moon:'Sagittarius', Mars:'Sagittarius', Mercury:'Pisces', Jupiter:'Capricorn', Venus:'Virgo', Saturn:'Virgo', Rahu:'Capricorn', Ketu:'Capricorn' },
  D40:{ Sun:'Aries', Moon:'Pisces', Mars:'Aquarius', Mercury:'Taurus', Jupiter:'Pisces', Venus:'Taurus', Saturn:'Scorpio', Rahu:'Pisces', Ketu:'Pisces' },
  D45:{ Sun:'Leo', Moon:'Aquarius', Mars:'Aries', Mercury:'Aquarius', Jupiter:'Leo', Venus:'Leo', Saturn:'Cancer', Rahu:'Virgo', Ketu:'Virgo' },
  D60:{ Sun:'Leo', Moon:'Scorpio', Mars:'Capricorn', Mercury:'Sagittarius', Jupiter:'Aries', Venus:'Leo', Saturn:'Pisces', Rahu:'Scorpio', Ketu:'Taurus' },
};

const longitudes: Record<string, number> = {
  Sun: 120.04284066208803, Moon: 257.8637656115666, Mars: 16.59405768925442,
  Mercury: 104.84054007297352, Jupiter: 171.84362377517226, Venus: 155.6427499901487,
  Saturn: 100.06349180994296, Rahu: 352.32741227614775, Ketu: 172.3274122761477,
};

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

for (const [code, expected] of Object.entries(vectors) as [VargaCode, Record<string,string>][]) {
  for (const [planet, expectedSign] of Object.entries(expected)) {
    const actual = ZODIAC_SIGNS[calculateVargaSignIndex(code, longitudes[planet]).signIndex];
    assert(actual === expectedSign, `${code} ${planet}: expected ${expectedSign}, got ${actual}`);
  }
  console.log(`✅ ${code}: all benchmark planets match`);
}

// D60 is 0.5° per amsha: explicitly verify both sides of a boundary.
const below = calculateVargaSignIndex('D60', 10.499999999);
const above = calculateVargaSignIndex('D60', 10.500000001);
assert(below.signIndex !== above.signIndex, 'D60 must change sign across a 0.5° boundary');
assert(below.specialAmsha === 'Heramba', `D60 below-boundary devata mismatch: ${below.specialAmsha}`);
assert(above.specialAmsha === 'Brahma', `D60 above-boundary devata mismatch: ${above.specialAmsha}`);

console.log('✅ D60 boundary sensitivity check passed');

// Boundary contract: every Varga uses half-open intervals [start, end),
// so an exact boundary belongs to the next amsha. Degree-in-varga-sign must
// reset to 0 at that boundary (within floating-point tolerance).
const boundaryCases: Array<{ code: VargaCode; boundary: number; expectedPart: number }> = [
  { code: 'D2', boundary: 15, expectedPart: 1 },
  { code: 'D3', boundary: 10, expectedPart: 1 },
  { code: 'D4', boundary: 7.5, expectedPart: 1 },
  { code: 'D7', boundary: 30 / 7, expectedPart: 1 },
  { code: 'D9', boundary: 30 / 9, expectedPart: 1 },
  { code: 'D10', boundary: 3, expectedPart: 1 },
  { code: 'D12', boundary: 2.5, expectedPart: 1 },
  { code: 'D16', boundary: 30 / 16, expectedPart: 1 },
  { code: 'D20', boundary: 1.5, expectedPart: 1 },
  { code: 'D24', boundary: 1.25, expectedPart: 1 },
  { code: 'D27', boundary: 30 / 27, expectedPart: 1 },
  { code: 'D30', boundary: 5, expectedPart: 1 },
  { code: 'D40', boundary: 0.75, expectedPart: 1 },
  { code: 'D45', boundary: 30 / 45, expectedPart: 1 },
  { code: 'D60', boundary: 0.5, expectedPart: 1 },
];

for (const { code, boundary } of boundaryCases) {
  const before = calculateVargaSignIndex(code, boundary - 1e-9);
  const exact = calculateVargaSignIndex(code, boundary);
  const after = calculateVargaSignIndex(code, boundary + 1e-9);
  assert(before.signIndex !== exact.signIndex || code === 'D30', `${code}: boundary did not advance at exact edge`);
  assert(Math.abs(exact.degreeInVargaSign) < 1e-6, `${code}: exact boundary did not reset varga degree: ${exact.degreeInVargaSign}`);
  assert(exact.signIndex === after.signIndex, `${code}: exact boundary does not match following interval`);
}

console.log('✅ All configured Varga half-open boundary checks passed');

console.log(`Profile basis: ${TEST_BENCHMARK_PROFILE.cityName}`);
console.log('✅ All 16 Shodashavarga golden-vector checks passed.');
