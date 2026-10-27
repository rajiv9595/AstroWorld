import { computeCanonicalChart, TEST_BENCHMARK_PROFILE } from '../../shared/index.ts';

const chart = computeCanonicalChart(TEST_BENCHMARK_PROFILE);
console.log('--- CANONICAL OUTPUT ---');
console.log('Ascendant sidereal:', chart.ascendant.siderealLongitude.toFixed(9), chart.ascendant.formattedDegree);
console.log('Ascendant tropical:', chart.ascendant.tropicalLongitude.toFixed(9));
console.log('Ayanamsha:', chart.panchanga.ayanamsa.valueDegrees.toFixed(9));
for (const p of chart.planets) {
  console.log(p.name.padEnd(8), p.siderealLongitude.toFixed(9), p.sign.padEnd(12), p.formattedDegree);
}
console.log('Moon nakshatra:', chart.moon.nakshatra, 'pada:', chart.moon.pada);
console.log('Venus balanceYears:', chart.dasha.balanceAtBirth.balanceYears);
console.log('MD start:', chart.dasha.mahadashas[0].period.startDateIso);
console.log('MD end:', chart.dasha.mahadashas[0].period.endDateIso);
