/**
 * ASTROWORLD — Master Research Corpus 401–900 & Engine Verification Suite
 * 
 * Verifies Batch 4 datasets (6.md, 7.md, 8.md, 9.md, 10.md):
 * 1. 500 Master Rules Parsing Integrity across 20 distinct parts (Parts 12 to 31).
 * 2. Deterministic Astrological Engine Calculators:
 *    - Kota Chakra 28-Nakshatra Fortress (Stambha, Madhya, Prakara, Bahya Entry/Exit, Siege Diagnostics - Rules 626–627)
 *    - Lajjitadi Avasthas (Lajjita, Garvita, Kshudhita, Trushita, Mudita, Kshobhita - Rule 404)
 *    - Lal Kitab Special Tevas (Andha, Adh-Andha, Nabalig, 9 Ancestral Debts - Rules 830–833)
 *    - Classical Nabhasa Yogas (Rajju, Musala, Nala, Mala, Sarpa, Akriti Yogas - Rules 501–505)
 * 3. Core Canonical Chart Pipeline Integration (chart.specialPoints)
 * 4. AI Consult Agent Integration (Dynamic RAG & Multi-Provider Cascade)
 */

import {
  globalMasterRules401to900Index,
} from '../src/ai/research/index.ts';
import {
  calculateKotaChakraFacts,
  calculateLajjitadiFacts,
  calculateLalKitabTevasFacts,
  calculateNabhasaYogasFacts,
  get28NakshatraFromLongitude,
} from '../../shared/engine/specialPoints.ts';
import { computeCanonicalChart } from '../../shared/engine/canonicalChart.ts';
import { createConsultAgent } from '../src/ai/agent/consultAgent.ts';
import { BirthProfileInput } from '../src/ai/schemas/birthProfile.ts';
import { PlanetPosition } from '../../shared/engine/types.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🌌 ASTROWORLD MASTER RESEARCH CORPUS 401–900 VERIFICATION');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: 500 Master Rules Parser & Multi-Index (6.md to 10.md)
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: 500 Master Rules Corpus Loader (6.md to 10.md) ---');
  const stats = globalMasterRules401to900Index.getStats();
  console.log(`  Total Rules Loaded: ${stats.totalRules}`);
  assert(stats.totalRules === 800, `Expected exactly 800 rules, got ${stats.totalRules}`);

  const expectedFiles = ['6.md', '7.md', '8.md', '9.md', '10.md', '11.md', '12.md', '13.md'];
  for (const f of expectedFiles) {
    const expected = (f === '11.md') ? 105 : (f === '12.md') ? 95 : 100;
    assert(stats.fileCounts[f] === expected, `Expected ${expected} rules in ${f}, got ${stats.fileCounts[f]}`);
  }

  // Spot-check key rules across parts
  const r401 = globalMasterRules401to900Index.getRuleByNumber(401);
  assert(Boolean(r401 && r401.title.includes('Baladi Avasthas')), 'Rule 401 (Baladi Avasthas) loaded correctly');

  const r404 = globalMasterRules401to900Index.getRuleByNumber(404);
  assert(Boolean(r404 && r404.title.includes('Lajjitadi Avasthas')), 'Rule 404 (Lajjitadi Avasthas) loaded correctly');

  const r501 = globalMasterRules401to900Index.getRuleByNumber(501);
  assert(Boolean(r501 && r501.title.includes('Ashraya Yogas')), 'Rule 501 (Ashraya Yogas) loaded correctly');

  const r626 = globalMasterRules401to900Index.getRuleByNumber(626);
  assert(Boolean(r626 && r626.title.includes('Kota Chakra')), 'Rule 626 (Kota Chakra) loaded correctly');

  const r728 = globalMasterRules401to900Index.getRuleByNumber(728);
  assert(Boolean(r728 && r728.title.includes('Bindu Sums')), 'Rule 728 (BAV Bindus) loaded correctly');

  const r830 = globalMasterRules401to900Index.getRuleByNumber(830);
  assert(Boolean(r830 && r830.title.includes('Andha Teva')), 'Rule 830 (Andha Teva) loaded correctly');

  const r900 = globalMasterRules401to900Index.getRuleByNumber(900);
  assert(Boolean(r900), 'Rule 900 loaded correctly');

  const r901 = globalMasterRules401to900Index.getRuleByNumber(901);
  assert(Boolean(r901 && r901.title.includes('Ikkabala Yoga')), 'Rule 901 (Ikkabala Yoga) loaded correctly');

  const r916 = globalMasterRules401to900Index.getRuleByNumber(916);
  assert(Boolean(r916 && r916.title.includes('Punya Saham')), 'Rule 916 (Punya Saham) loaded correctly');

  const r917 = globalMasterRules401to900Index.getRuleByNumber(917);
  assert(Boolean(r917 && r917.title.includes('Yashas')), 'Rule 917 (Yashas Saham) loaded correctly');

  const r1006 = globalMasterRules401to900Index.getRuleByNumber(1006);
  assert(Boolean(r1006 && r1006.title.includes('Dasha Override Trick')), 'Rule 1006 (Dasha Override Trick) loaded correctly');

  const r1010 = globalMasterRules401to900Index.getRuleByNumber(1010);
  assert(Boolean(r1010 && r1010.title.includes('Computer Science')), 'Rule 1010 (CS & AI Stream) loaded correctly');

  const r1100 = globalMasterRules401to900Index.getRuleByNumber(1100);
  assert(Boolean(r1100), 'Rule 1100 (Final Master Rule of Batch 5) loaded correctly');

  const r1101 = globalMasterRules401to900Index.getRuleByNumber(1101);
  assert(Boolean(r1101 && r1101.title.includes('Temporal Dasha Lookback')), 'Rule 1101 (Temporal Dasha Lookback) loaded correctly');

  const r1128 = globalMasterRules401to900Index.getRuleByNumber(1128);
  assert(Boolean(r1128 && r1128.title.includes('Electronics & Communication')), 'Rule 1128 (ECE Hardware + Signal Bridge) loaded correctly');

  const r1193 = globalMasterRules401to900Index.getRuleByNumber(1193);
  assert(Boolean(r1193 && r1193.title.includes('ECE-CSE')), 'Rule 1193 (ECE vs CSE Discriminator) loaded correctly');

  const r1200 = globalMasterRules401to900Index.getRuleByNumber(1200);
  assert(Boolean(r1200 && r1200.title.includes('Unified Academic')), 'Rule 1200 (Unified Academic & Career Tensor) loaded correctly');

  // Search performance
  const tStart = Date.now();
  const searchResults = globalMasterRules401to900Index.search('kota chakra fortress siege');
  const dur = Date.now() - tStart;
  assert(searchResults.length > 0, `Search found ${searchResults.length} results`);
  assert(dur < 50, `Search execution under 50ms (actual: ${dur}ms)`);
  assert(searchResults.some((r) => r.ruleNumber === 626 || r.ruleNumber === 627), 'Kota Chakra rules retrieved');

  // -------------------------------------------------------------------------
  // TEST 2: Kota Chakra 28-Nakshatra Fortress Math (Rules 626–627)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: Kota Chakra 28-Nakshatra Fortress Engine (Rules 626–627) ---');
  // Abhijit longitude test (278° should resolve to Abhijit at index 21)
  const abhijitStar = get28NakshatraFromLongitude(278.0);
  assert(abhijitStar.index === 21 && abhijitStar.name === 'Abhijit', 'Abhijit mapped accurately at 278°');

  const ashwiniStar = get28NakshatraFromLongitude(5.0);
  assert(ashwiniStar.index === 0 && ashwiniStar.name === 'Ashwini', 'Ashwini mapped accurately at 5°');

  // Create mock planetary positions
  // Janma Star = Ashwini (index 0). Moon at 5° (Ashwini), Sun at 40° (Rohini)
  const mockPlanets: PlanetPosition[] = [
    { name: 'Moon', sign: 'Aries', signIndex: 0, degreeInSign: 5, siderealLongitude: 5, nakshatra: 'Ashwini', pada: 1, nakshatraLord: 'Ketu', isRetrograde: false, house: 1 },
    { name: 'Sun', sign: 'Taurus', signIndex: 1, degreeInSign: 10, siderealLongitude: 40, nakshatra: 'Rohini', pada: 1, nakshatraLord: 'Moon', isRetrograde: false, house: 2 },
    // Put Mars in Rohini (4th star from Ashwini in 28-star: Ashwini=1, Bharani=2, Krittika=3, Rohini=4 -> STAMBHA!)
    { name: 'Mars', sign: 'Taurus', signIndex: 1, degreeInSign: 15, siderealLongitude: 45, nakshatra: 'Rohini', pada: 2, nakshatraLord: 'Moon', isRetrograde: false, house: 2 },
    { name: 'Jupiter', sign: 'Cancer', signIndex: 3, degreeInSign: 5, siderealLongitude: 95, nakshatra: 'Pushya', pada: 1, nakshatraLord: 'Saturn', isRetrograde: false, house: 4 },
    { name: 'Saturn', sign: 'Aquarius', signIndex: 10, degreeInSign: 15, siderealLongitude: 315, nakshatra: 'Shatabhisha', pada: 3, nakshatraLord: 'Rahu', isRetrograde: false, house: 11 },
    { name: 'Venus', sign: 'Pisces', signIndex: 11, degreeInSign: 27, siderealLongitude: 357, nakshatra: 'Revati', pada: 4, nakshatraLord: 'Mercury', isRetrograde: false, house: 12 },
    { name: 'Mercury', sign: 'Taurus', signIndex: 1, degreeInSign: 2, siderealLongitude: 32, nakshatra: 'Krittika', pada: 2, nakshatraLord: 'Sun', isRetrograde: false, house: 2 },
    { name: 'Rahu', sign: 'Gemini', signIndex: 2, degreeInSign: 10, siderealLongitude: 70, nakshatra: 'Ardra', pada: 2, nakshatraLord: 'Rahu', isRetrograde: true, house: 3 },
    { name: 'Ketu', sign: 'Sagittarius', signIndex: 8, degreeInSign: 10, siderealLongitude: 250, nakshatra: 'Moola', pada: 2, nakshatraLord: 'Ketu', isRetrograde: true, house: 9 },
  ];

  const kc = calculateKotaChakraFacts(5, 'Aries', 40, mockPlanets);
  assert(kc.janmaNakshatraName === 'Ashwini', 'Kota Janma Nakshatra is Ashwini');
  assert(kc.kotaSwami === 'Mars', 'Kota Swami is Mars (Aries Lord)');
  assert(kc.stambhaStars.length === 4, 'Stambha contains exactly 4 stars');
  assert(kc.madhyaStars.length === 8, 'Madhya contains exactly 8 stars');
  assert(kc.prakaraStars.length === 8, 'Prakara contains exactly 8 stars');
  assert(kc.bahyaEntryStars.length === 4, 'Bahya Entry contains exactly 4 stars');
  assert(kc.bahyaExitStars.length === 4, 'Bahya Exit contains exactly 4 stars');

  // Verify Mars in Stambha
  assert(kc.stambhaOccupants.includes('Mars'), 'Mars detected in Stambha (Central Pillar)');
  console.log(`  ✓ Kota Chakra Siege State: ${kc.siegeState}`);

  // -------------------------------------------------------------------------
  // TEST 3: Lajjitadi Avasthas 6 Psychological States (Rule 404)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: Lajjitadi Avasthas Diagnostics (Rule 404) ---');
  // In mockPlanets:
  // - Venus is in Pisces at 27° (Exalted) -> must trigger Garvita!
  // - Sun is in Taurus (Enemy sign of Sun) -> must trigger Kshudhita!
  const mockHouses: any = [
    { houseNumber: 1, sign: 'Aries' },
    { houseNumber: 2, sign: 'Taurus' },
    { houseNumber: 3, sign: 'Gemini' },
    { houseNumber: 4, sign: 'Cancer' },
    { houseNumber: 5, sign: 'Leo' },
    { houseNumber: 6, sign: 'Virgo' },
    { houseNumber: 7, sign: 'Libra' },
    { houseNumber: 8, sign: 'Scorpio' },
    { houseNumber: 9, sign: 'Sagittarius' },
    { houseNumber: 10, sign: 'Capricorn' },
    { houseNumber: 11, sign: 'Aquarius' },
    { houseNumber: 12, sign: 'Pisces' },
  ];

  const lajjitadi = calculateLajjitadiFacts(mockPlanets, mockHouses, 0); // Lagna = Aries (0)
  assert(Boolean(lajjitadi.Venus), 'Venus Lajjitadi evaluated');
  assert(lajjitadi.Venus.isGarvita, 'Venus in Pisces triggers Garvita (Proud / Exalted) Avastha');
  assert(lajjitadi.Sun.isKshudhita, 'Sun in Taurus (Enemy sign) triggers Kshudhita (Starved) Avastha');
  console.log(`  ✓ Venus Dominant State: ${lajjitadi.Venus.dominantState}, Sun Dominant State: ${lajjitadi.Sun.dominantState}`);

  // -------------------------------------------------------------------------
  // TEST 4: Lal Kitab Special Tevas & Ancestral Debts (Rules 830–833)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: Lal Kitab Tevas & Ancestral Debts (Rules 830–833) ---');
  const lalKitab = calculateLalKitabTevasFacts(mockPlanets, 0); // Lagna = Aries (0)
  assert(lalKitab.ancestralDebts.length === 9, 'All 9 Ancestral Debts evaluated');
  assert(typeof lalKitab.isAndhaTeva === 'boolean', 'Andha Teva evaluated as boolean');
  assert(typeof lalKitab.isAdhAndhaTeva === 'boolean', 'Adh-Andha Teva evaluated as boolean');
  assert(typeof lalKitab.isNabaligTeva === 'boolean', 'Nabalig Teva evaluated as boolean');
  console.log(`  ✓ Lal Kitab Classification: ${lalKitab.overallClassification}`);
  console.log(`  ✓ Active Ancestral Debts Count: ${lalKitab.activeDebtsCount}/9`);

  // Test explicit Andha Teva condition: Sun + Saturn in 10th house
  const andhaPlanets: PlanetPosition[] = [
    { name: 'Sun', sign: 'Capricorn', signIndex: 9, degreeInSign: 10, siderealLongitude: 280, nakshatra: 'Shravana', pada: 1, nakshatraLord: 'Moon', isRetrograde: false, house: 10 },
    { name: 'Saturn', sign: 'Capricorn', signIndex: 9, degreeInSign: 15, siderealLongitude: 285, nakshatra: 'Shravana', pada: 2, nakshatraLord: 'Moon', isRetrograde: false, house: 10 },
    { name: 'Moon', sign: 'Aries', signIndex: 0, degreeInSign: 10, siderealLongitude: 10, nakshatra: 'Ashwini', pada: 1, nakshatraLord: 'Ketu', isRetrograde: false, house: 1 },
  ];
  const andhaTest = calculateLalKitabTevasFacts(andhaPlanets, 0); // Lagna = Aries, 10th = Capricorn
  assert(andhaTest.isAndhaTeva, 'Andha Teva positively flagged when Sun + Saturn occupy 10th house');

  // -------------------------------------------------------------------------
  // TEST 5: Classical Nabhasa Yogas Continuous Geometries (Rules 501–505)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: Nabhasa Yogas Engine (Rules 501–505) ---');
  const nabhasa = calculateNabhasaYogasFacts(mockPlanets, 0);
  assert(Array.isArray(nabhasa.allYogasFound), 'Nabhasa yogas found array initialized');
  console.log(`  ✓ Active Nabhasa Yogas: [${nabhasa.allYogasFound.join(', ') || 'Mixed Geometries'}]`);

  // Test explicit Rajju Yoga (all 7 planets in Movable signs: Aries, Cancer, Libra, Capricorn)
  const rajjuPlanets: PlanetPosition[] = [
    { name: 'Sun', sign: 'Aries', signIndex: 0, degreeInSign: 10, siderealLongitude: 10, nakshatra: 'Ashwini', pada: 1, nakshatraLord: 'Ketu', isRetrograde: false, house: 1 },
    { name: 'Moon', sign: 'Cancer', signIndex: 3, degreeInSign: 10, siderealLongitude: 100, nakshatra: 'Pushya', pada: 3, nakshatraLord: 'Saturn', isRetrograde: false, house: 4 },
    { name: 'Mars', sign: 'Libra', signIndex: 6, degreeInSign: 10, siderealLongitude: 190, nakshatra: 'Swati', pada: 2, nakshatraLord: 'Rahu', isRetrograde: false, house: 7 },
    { name: 'Mercury', sign: 'Capricorn', signIndex: 9, degreeInSign: 10, siderealLongitude: 280, nakshatra: 'Shravana', pada: 1, nakshatraLord: 'Moon', isRetrograde: false, house: 10 },
    { name: 'Jupiter', sign: 'Cancer', signIndex: 3, degreeInSign: 15, siderealLongitude: 105, nakshatra: 'Pushya', pada: 4, nakshatraLord: 'Saturn', isRetrograde: false, house: 4 },
    { name: 'Venus', sign: 'Aries', signIndex: 0, degreeInSign: 20, siderealLongitude: 20, nakshatra: 'Bharani', pada: 3, nakshatraLord: 'Venus', isRetrograde: false, house: 1 },
    { name: 'Saturn', sign: 'Libra', signIndex: 6, degreeInSign: 25, siderealLongitude: 205, nakshatra: 'Vishakha', pada: 2, nakshatraLord: 'Jupiter', isRetrograde: false, house: 7 },
  ];
  const rajjuTest = calculateNabhasaYogasFacts(rajjuPlanets, 0);
  assert(rajjuTest.activeAshrayaYoga?.name === 'Rajju Yoga', 'Rajju Yoga correctly identified for all planets in Movable signs');

  // -------------------------------------------------------------------------
  // TEST 6: Core Canonical Chart Pipeline Special Points Output
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 6: Canonical Chart specialPoints Integration ---');
  const birthProfile: BirthProfileInput = {
    name: 'Srinivasa Ramanujan',
    year: 1887,
    month: 12,
    day: 22,
    hour: 18,
    minute: 20,
    second: 0,
    latitude: 10.9602,
    longitude: 79.3845,
    timezone: 'Asia/Kolkata',
  };

  const chart = computeCanonicalChart(birthProfile as any);
  assert(Boolean(chart.specialPoints), 'chart.specialPoints exists on canonical chart');
  assert(Boolean(chart.specialPoints.kotaChakra), 'chart.specialPoints.kotaChakra generated');
  assert(Boolean(chart.specialPoints.lajjitadiAvasthas), 'chart.specialPoints.lajjitadiAvasthas generated');
  assert(Boolean(chart.specialPoints.lalKitabTevas), 'chart.specialPoints.lalKitabTevas generated');
  assert(Boolean(chart.specialPoints.nabhasaYogas), 'chart.specialPoints.nabhasaYogas generated');
  assert(Boolean(chart.specialPoints.tajikaSahams), 'chart.specialPoints.tajikaSahams generated');
  assert(Boolean(chart.specialPoints.academicStream), 'chart.specialPoints.academicStream generated');
  assert(Boolean(chart.specialPoints.academicStream.hardwareToLogicRatio), 'chart.specialPoints.academicStream.hardwareToLogicRatio generated (Rule 1193)');
  assert(Boolean(chart.specialPoints.academicStream.temporalLookback), 'chart.specialPoints.academicStream.temporalLookback generated (Rule 1101)');
  assert(Boolean(chart.specialPoints.academicStream.enrolledVsCareer), 'chart.specialPoints.academicStream.enrolledVsCareer generated (Rule 1102 & 1200)');
  console.log(`  ✓ Ramanujan Punya Saham: ${chart.specialPoints.tajikaSahams.punyaSaham.formattedDegree} ${chart.specialPoints.tajikaSahams.punyaSaham.sign}`);
  console.log(`  ✓ Ramanujan Vidya Saham: ${chart.specialPoints.tajikaSahams.vidyaSaham.formattedDegree} ${chart.specialPoints.tajikaSahams.vidyaSaham.sign}`);
  console.log(`  ✓ Ramanujan Primary Academic Stream: ${chart.specialPoints.academicStream.primaryStream} (${chart.specialPoints.academicStream.primaryStreamScore}%)`);
  console.log(`  ✓ Ramanujan Hardware-to-Logic Classification: ${chart.specialPoints.academicStream.hardwareToLogicRatio.classification} (Ratio: ${chart.specialPoints.academicStream.hardwareToLogicRatio.ratio})`);
  console.log(`  ✓ Ramanujan Enrolled vs Career: Enrolled "${chart.specialPoints.academicStream.enrolledVsCareer.enrolledDegreeBranch}" -> Career "${chart.specialPoints.academicStream.enrolledVsCareer.appliedCareerDomain}"`);

  console.log(`  ✓ Ramanujan Chart Kota Swami: ${chart.specialPoints.kotaChakra.kotaSwami}`);
  console.log(`  ✓ Ramanujan Chart Kota Paala: ${chart.specialPoints.kotaChakra.kotaPaala}`);
  console.log(`  ✓ Ramanujan Chart Kota Siege State: ${chart.specialPoints.kotaChakra.siegeState}`);
  console.log(`  ✓ Ramanujan Lal Kitab Classification: ${chart.specialPoints.lalKitabTevas.overallClassification}`);
  console.log(`  ✓ Ramanujan Active Nabhasa Yogas: [${chart.specialPoints.nabhasaYogas.allYogasFound.join(', ') || 'Mixed'}]`);

  // -------------------------------------------------------------------------
  // TEST 7: AI Consult Agent Dynamic Ingestion
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 7: Consult Agent Dynamic Ingestion of Batch 4 Rules ---');
  const agent = createConsultAgent();
  const res = await agent.consult({
    birthProfile: birthProfile as any,
    userMessage: 'How do my Kota Chakra fortress placements, Lajjitadi psychological avasthas, and Lal Kitab teva shape my career and destiny?',
  });

  assert(Boolean(res && res.text && res.text.length > 50), 'ConsultAgent produced substantive astrological synthesis');
  console.log(`  ✓ Consult Agent Response Length: ${res.text.length} characters`);
  console.log(`  ✓ Consult Agent Success: ${res.success}`);
  console.log(`  ✓ Consult Agent Text Snippet:\n  ${res.text.slice(0, 200).replace(/\n/g, '\n  ')}...\n`);

  console.log('\n=============================================================');
  console.log('🎉 ALL 7 SUITES OF BATCH 4 VERIFICATION PASSED WITH 100% SUCCESS!');
  console.log('=============================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Failure:', err);
  process.exit(1);
});
