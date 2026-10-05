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
console.log(`Profile basis: ${TEST_BENCHMARK_PROFILE.cityName}`);
console.log('✅ All 16 Shodashavarga golden-vector checks passed.');
