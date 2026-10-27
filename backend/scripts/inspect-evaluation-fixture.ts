import { computeCanonicalChartWithConfiguredEphemeris } from '../src/services/ephemeris/providerRuntime.ts';

async function main() {
  const profile = {
    name: 'Evaluation Native',
    year: 2005,
    month: 8,
    day: 17,
    hour: 0,
    minute: 2,
    second: 0,
    latitude: 16.9324,
    longitude: 81.9567,
    timezone: 'Asia/Kolkata',
  };

  console.log('Computing canonical chart for:', profile);
  const chart = await computeCanonicalChartWithConfiguredEphemeris(profile);

  console.log('\n--- D1 RASHI CHART ---');
  console.log(`Lagna: ${chart.ascendant.sign} (${chart.ascendant.formattedDegree}, Nakshatra: ${chart.ascendant.nakshatra})`);
  for (const p of chart.planets) {
    console.log(`- ${p.name}: ${p.sign} in House ${p.houseNumber} (${p.formattedDegree}, ${p.nakshatra}, Dignity: ${p.dignity}, Retrograde: ${p.retrograde})`);
  }

  console.log('\n--- SRIPATHI BHAVA CHALIT CHART ---');
  console.log('Bhava Madhyas & Sandhis:');
  for (const b of chart.chalit.bhavas) {
    console.log(`  House ${b.houseNumber}: Madhya=${b.bhavaMadhya.toFixed(2)}° (${b.bhavaMadhyaSign} ${b.bhavaMadhyaFormatted}), Aarambh=${b.aarambhSandhi.toFixed(2)}°, Viram=${b.viramSandhi.toFixed(2)}°`);
  }
  console.log('Planetary Chalit positions & shifts:');
  for (const p of chart.chalit.planets) {
    console.log(`  - ${p.planet}: Rashi House ${p.rashiHouse} (${p.rashiSign}) -> Chalit House ${p.chalitHouse} (Shifted: ${p.shifted})`);
  }

  console.log('\n--- D9 NAVAMSHA CHART ---');
  const d9 = chart.vargas['D9'];
  console.log(`D9 Lagna: ${d9.ascendantSign} (House 1)`);
  for (const p of d9.planets) {
    console.log(`  - ${p.planet}: ${p.sign} in House ${p.houseNumber} (Dignity: ${p.dignity})`);
  }

  console.log('\n--- D24 CHATURVIMSHAMSHA (SIDDHAMSHA / HIGHER EDUCATION) CHART ---');
  const d24 = chart.vargas['D24'];
  console.log(`D24 Lagna: ${d24.ascendantSign} (House 1)`);
  for (const p of d24.planets) {
    console.log(`  - ${p.planet}: ${p.sign} in House ${p.houseNumber} (Dignity: ${p.dignity})`);
  }

  console.log('\n--- JAIMINI KARAKAMSA & 5TH FROM KARAKAMSA ---');
  console.log(`Atmakaraka (AK): ${chart.jaimini.atmakaraka}`);
  console.log(`Karakamsa Sign (AK in D9): ${chart.jaimini.karakamsaSign}`);
}

main().catch(console.error);
