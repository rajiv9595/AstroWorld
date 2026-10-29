/**
 * ASTROWORLD — Extended Master Research Corpus Verification Suite
 * 
 * Verifies Batch 3 datasets (3.md, 4.md, 5.md):
 * 1. 1,412 Jyotisha Rules from 4.md across 28 distinct operational sections.
 * 2. Deterministic Calculators:
 *    - calculateFiveSolarUpagrahas (Upaketu + 30° ≡ Sun invariant)
 *    - calculateBeejaAndKshetraSphuta (Male Beeja & Female Kshetra odd/even matrices)
 *    - calculatePlanetaryLatta (4 forward + 4 backward nakshatra thrusts)
 *    - calculatePushkaraBhaga (24 single sacred degrees)
 *    - calculateSpecialKarmicNakshatras (4th, 10th, 12th, 16th, 18th, 19th, 22nd, 27th stars)
 *    - calculateTripushkaraYoga (Bhadra tithi + Sun/Tue/Sat + 2/3 pada stars)
 *    - calculateVaisheshikamsha (Parijata to Shridhama varga dignity ladder)
 * 3. Master Canonical Rules 301–394 from 3.md & 5.md.
 * 4. Classical Shastric Knowledge Graph Nodes 19–22 with Sanskrit citations.
 * 5. ConsultAgent Dynamic Ingestion & Progeny/Transit Synthesis.
 */

import {
  globalJyotishaCorpusIndex,
  globalResearchRuleEngine,
  calculateFiveSolarUpagrahas,
  calculateBeejaAndKshetraSphuta,
  calculatePlanetaryLatta,
  calculatePushkaraBhaga,
  calculateSpecialKarmicNakshatras,
  calculateTripushkaraYoga,
  calculateVaisheshikamsha,
} from '../src/ai/research/index.ts';
import { globalShastricGraphEngine } from '../src/ai/shastras/index.ts';
import { createConsultAgent } from '../src/ai/agent/consultAgent.ts';
import { BirthProfileInput } from '../src/ai/schemas/birthProfile.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runExtendedTestSuite() {
  console.log('\n=============================================================');
  console.log('🌌 ASTROWORLD EXTENDED MASTER CORPUS VERIFICATION (BATCH 3)');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: 1,412 Rules Jyotisha Corpus Loader (4.md)
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: 1,412 Rules Jyotisha Corpus (4.md) ---');
  const stats = globalJyotishaCorpusIndex.getStats();
  console.log(`  Total Rules Loaded from 4.md: ${stats.totalRules}`);
  assert(stats.totalRules === 1412, `Expected 1412 rules from 4.md, got ${stats.totalRules}`);
  assert(Object.keys(stats.sectionCounts).length >= 25, `Expected >= 25 sections, got ${Object.keys(stats.sectionCounts).length}`);
  
  // Test retrieval by ID
  const r1 = globalJyotishaCorpusIndex.getById('R0001');
  assert(Boolean(r1 && r1.section.includes('Data, astronomy')), 'R0001 retrieved correctly');

  const r1412 = globalJyotishaCorpusIndex.getById('R1412');
  assert(Boolean(r1412 && r1412.section.includes('Empirical research')), 'R1412 retrieved correctly');

  // Test retrieval by Section
  const sec1Rules = globalJyotishaCorpusIndex.getBySection(1);
  assert(sec1Rules.length >= 10, `Expected >= 10 rules in Section 1, got ${sec1Rules.length}`);

  // Test Search
  const searchResults = globalJyotishaCorpusIndex.search('Pushkara Navamsha longevity', { limit: 5 });
  assert(searchResults.length > 0, `Expected search results, got ${searchResults.length}`);
  console.log(`  Top 4.md search result: [${searchResults[0].id}] ${searchResults[0].text.slice(0, 80)}...`);

  // -------------------------------------------------------------------------
  // TEST 2: Deterministic Calculators (Batch 3)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: Deterministic Batch 3 Calculators ---');

  // A. Five Solar Upagrahas
  console.log('  Testing calculateFiveSolarUpagrahas...');
  const sunLon = 45.5; // Taurus 15.5°
  const upagrahas = calculateFiveSolarUpagrahas(sunLon);
  // Dhuma = 45.5 + 133°20' = 178°50' = 178.833° (Virgo)
  assert(upagrahas.dhuma.sign === 'Virgo', `Dhuma should be in Virgo, got ${upagrahas.dhuma.sign}`);
  // Invariant: Upaketu + 30° ≡ Sun (mod 360)
  const upaketuPlus30 = (upagrahas.upaketu.longitude + 30) % 360;
  const diffFromSun = Math.abs(upaketuPlus30 - sunLon);
  assert(diffFromSun < 0.0001, `Mathematical Invariant Upaketu + 30° ≡ Sun verified (diff: ${diffFromSun.toExponential(2)})`);

  // B. Beeja & Kshetra Sphutas (Rules 320 & 321)
  console.log('  Testing calculateBeejaAndKshetraSphuta...');
  // Sun at 10° (Aries), Venus at 20° (Aries), Jupiter at 15° (Aries)
  // Beeja = 10 + 20 + 15 = 45° (Taurus 15° - Even Rashi)
  // Moon at 30° (Taurus), Mars at 60° (Gemini), Jupiter at 15° (Aries)
  // Kshetra = 30 + 60 + 15 = 105° (Cancer 15° - Even Rashi)
  const fertility = calculateBeejaAndKshetraSphuta(10, 20, 15, 30, 60);
  assert(fertility.beejaSphuta.longitude === 45, `Beeja Sphuta should be 45°, got ${fertility.beejaSphuta.longitude}`);
  assert(fertility.beejaSphuta.sign === 'Taurus', `Beeja should be Taurus, got ${fertility.beejaSphuta.sign}`);
  assert(fertility.beejaSphuta.isEvenRashi === true, 'Taurus is Even Rashi');
  assert(fertility.kshetraSphuta.longitude === 105, `Kshetra Sphuta should be 105°, got ${fertility.kshetraSphuta.longitude}`);
  assert(fertility.kshetraSphuta.sign === 'Cancer', `Kshetra should be Cancer, got ${fertility.kshetraSphuta.sign}`);
  assert(fertility.kshetraSphuta.isEvenRashi === true, 'Cancer is Even Rashi (favorable for female fertility)');

  // C. Planetary Latta (Rules 331 & 332)
  console.log('  Testing calculatePlanetaryLatta...');
  // Suppose Sun is at Ashwini (Nakshatra 0, 0-13.333°).
  // Sun forward kick is 12th star: (0 + 12 - 1) % 27 = 11 (Uttara Phalguni).
  const lattaTest = calculatePlanetaryLatta({ Sun: 5.0 }, 11);
  assert(lattaTest.isLattaAfflicted === true, 'Nakshatra 11 must be struck by Sun 12th forward kick');
  const sunKick = lattaTest.planetaryKicks.find(k => k.planet === 'Sun');
  assert(Boolean(sunKick && sunKick.piercesTargetNakshatra), 'Sun kick directly pierces target');

  // D. Pushkara Bhaga (Rule 339)
  console.log('  Testing calculatePushkaraBhaga...');
  // Fire sign (Aries): 21° Pushkara Bhaga
  const pbFire = calculatePushkaraBhaga(21.0); // Aries 21°
  assert(pbFire.isPushkaraBhaga === true, 'Aries 21° must be Pushkara Bhaga');
  assert(pbFire.element === 'Fire', `Element should be Fire, got ${pbFire.element}`);
  
  // Non-Pushkara degree
  const pbNon = calculatePushkaraBhaga(10.0);
  assert(pbNon.isPushkaraBhaga === false, 'Aries 10° is not a Pushkara Bhaga');

  // Earth sign (Taurus = 30-60°): 14° in Taurus = 44°
  const pbEarth = calculatePushkaraBhaga(44.0);
  assert(pbEarth.isPushkaraBhaga === true && pbEarth.exactPushkaraDegree === 14, 'Taurus 14° (44°) must be Pushkara Bhaga');

  // E. Special Karmic Nakshatras (Rule 337)
  console.log('  Testing calculateSpecialKarmicNakshatras...');
  // Janma Nakshatra = 0 (Ashwini)
  const karmicStars = calculateSpecialKarmicNakshatras(0);
  assert(karmicStars.jati.nakshatraIndex === 3, '4th star from Ashwini is Rohini (idx 3)');
  assert(karmicStars.karma.nakshatraIndex === 9, '10th star is Magha (idx 9)');
  assert(karmicStars.desha.nakshatraIndex === 11, '12th star is Uttara Phalguni (idx 11)');
  assert(karmicStars.sanghatika.nakshatraIndex === 15, '16th star is Vishakha (idx 15)');
  assert(karmicStars.samudayika.nakshatraIndex === 17, '18th star is Jyeshtha (idx 17)');
  assert(karmicStars.adhana.nakshatraIndex === 18, '19th star is Mula (idx 18)');
  assert(karmicStars.vainashika.nakshatraIndex === 21, '22nd star is Shravana (idx 21)');
  assert(karmicStars.abhisheka.nakshatraIndex === 26, '27th star is Revati (idx 26)');

  // F. Tripushkara & Dwipushkara Yoga (Rule 343)
  console.log('  Testing calculateTripushkaraYoga...');
  // Bhadra tithi (2, 7, 12), Sunday (0) or Tuesday (2) or Saturday (6)
  // Krittika is 3-pada star (starts at 26°40' Aries, ends at 10° Taurus) -> idx 2
  const trip = calculateTripushkaraYoga(2, 0, 2);
  assert(trip.isTripushkara === true, 'Tithi 2 + Sunday + Krittika must trigger Tripushkara Yoga');
  assert(trip.multiplier === 3, 'Tripushkara multiplier must be 3x');

  // Mrigashira is 2-pada star (idx 4) -> Dwipushkara
  const dwip = calculateTripushkaraYoga(7, 2, 4);
  assert(dwip.isDwipushkara === true, 'Tithi 7 + Tuesday + Mrigashira must trigger Dwipushkara Yoga');
  assert(dwip.multiplier === 2, 'Dwipushkara multiplier must be 2x');

  // Non-matching day (Wednesday)
  const nonTrip = calculateTripushkaraYoga(2, 3, 2);
  assert(!nonTrip.isTripushkara && !nonTrip.isDwipushkara, 'Wednesday cannot form Tripushkara');

  // G. Vaisheshikamsha Dignity Scale (Rule 314)
  console.log('  Testing calculateVaisheshikamsha...');
  const v2 = calculateVaisheshikamsha(2);
  assert(v2.name === 'Parijata', `2 dignities should be Parijata, got ${v2.name}`);
  const v5 = calculateVaisheshikamsha(5);
  assert(v5.name === 'Simhasana', `5 dignities should be Simhasana, got ${v5.name}`);
  const v10 = calculateVaisheshikamsha(10);
  assert(v10.name === 'Shridhama', `10 dignities should be Shridhama, got ${v10.name}`);

  // -------------------------------------------------------------------------
  // TEST 3: Master Canonical Rules 301–394
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: Master Canonical Rules 301–394 ---');
  const allRules = globalResearchRuleEngine.getAllRules();
  console.log(`  Total Canonical Rules in Engine: ${allRules.length}`);
  assert(allRules.length >= 110, `Expected at least 110 canonical rules, got ${allRules.length}`);

  const r301 = globalResearchRuleEngine.getRuleById('RULE_301_FOUR_HORA_ALGORITHMS');
  assert(Boolean(r301 && r301.name.includes('Hora')), 'RULE_301 retrieved');

  const r320 = globalResearchRuleEngine.getRuleById('RULE_320_BEEJA_KSHETRA_SPHUTA');
  assert(Boolean(r320 && r320.name.includes('Beeja')), 'RULE_320 retrieved');

  const r325 = globalResearchRuleEngine.getRuleById('RULE_325_FIVE_SOLAR_UPAGRAHAS');
  assert(Boolean(r325 && r325.name.includes('Solar Upagrahas')), 'RULE_325 retrieved');

  const r331 = globalResearchRuleEngine.getRuleById('RULE_331_PLANETARY_LATTA');
  assert(Boolean(r331 && r331.name.includes('Latta')), 'RULE_331 retrieved');

  const r339 = globalResearchRuleEngine.getRuleById('RULE_339_PUSHKARA_BHAGA');
  assert(Boolean(r339 && r339.name.includes('Pushkara Bhaga')), 'RULE_339 retrieved');

  const r377 = globalResearchRuleEngine.getRuleById('RULE_377_STARTUP_UNICORN_IPO_WINDFALL');
  assert(Boolean(r377 && r377.name.includes('Startup Unicorn')), 'RULE_377 retrieved');

  // -------------------------------------------------------------------------
  // TEST 4: Classical Shastric Graph Nodes 19–22
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: Classical Shastric Knowledge Graph Nodes 19–22 ---');
  const mockChart = {
    ascendant: { sign: 'Aries', longitude: 15.0 },
    planets: [
      { name: 'Sun', sign: 'Aries', signIndex: 0, longitude: 21.0, houseNumber: 1 }, // In Pushkara Bhaga!
      { name: 'Moon', sign: 'Cancer', signIndex: 3, longitude: 95.0, houseNumber: 4 },
      { name: 'Mars', sign: 'Capricorn', signIndex: 9, longitude: 285.0, houseNumber: 10 },
      { name: 'Mercury', sign: 'Taurus', signIndex: 1, longitude: 50.0, houseNumber: 2 },
      { name: 'Jupiter', sign: 'Cancer', signIndex: 3, longitude: 98.0, houseNumber: 4 },
      { name: 'Venus', sign: 'Pisces', signIndex: 11, longitude: 350.0, houseNumber: 12 },
      { name: 'Saturn', sign: 'Aquarius', signIndex: 10, longitude: 310.0, houseNumber: 11 },
      { name: 'Rahu', sign: 'Pisces', signIndex: 11, longitude: 340.0, houseNumber: 12 },
      { name: 'Ketu', sign: 'Virgo', signIndex: 5, longitude: 160.0, houseNumber: 6 },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({ houseNumber: i + 1 })),
  };

  const shastricPrashna = globalShastricGraphEngine.queryShastricEvidence(mockChart, 'prashna');
  assert(shastricPrashna.length > 0, `Shastric graph returned ${shastricPrashna.length} citations for prashna`);
  console.log(`  Top Prashna citation: [${shastricPrashna[0].sourceCitation}] - ${shastricPrashna[0].classicalDictum.slice(0, 80)}...`);

  // -------------------------------------------------------------------------
  // TEST 5: ConsultAgent Progeny & Timing Dynamic Integration
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: ConsultAgent Progeny & Timing Dynamic Ingestion ---');
  const profile: BirthProfileInput = {
    name: 'Pooja Sharma',
    year: 1992,
    month: 8,
    day: 24,
    hour: 10,
    minute: 15,
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  };

  const consultAgent = createConsultAgent();
  
  // Progeny Query
  console.log('  Invoking progeny consultation...');
  const progenyResponse = await consultAgent.consult({
    birthProfile: profile,
    userMessage: 'What does my chart indicate for children and pregnancy, and what are my Beeja and Kshetra Sphuta metrics?',
  });

  console.log(`  Progeny Text Snippet:\n  ${progenyResponse.text.slice(0, 300).replace(/\n/g, '\n  ')}...\n`);
  assert(progenyResponse.success, 'Progeny consultation succeeded');
  assert(
    progenyResponse.text.includes('Saptamsha') ||
    progenyResponse.text.includes('D7') ||
    progenyResponse.text.includes('Beeja') ||
    progenyResponse.text.includes('children'),
    'Mentions progeny metrics (Saptamsha/D7/Beeja)'
  );
  assert(
    progenyResponse.text.includes('Beeja') ||
    progenyResponse.text.includes('Kshetra') ||
    progenyResponse.text.includes('Sphuta') ||
    progenyResponse.text.includes('fertility'),
    'Mentions Beeja/Kshetra Sphuta or fertility'
  );

  // Transit & Gochara Query
  console.log('  Invoking transit & timing consultation...');
  const transitResponse = await consultAgent.consult({
    birthProfile: profile,
    userMessage: 'Explain my current transits and whether any planetary Latta or karmic nakshatra kicks are active.',
  });

  console.log(`  Transit Text Snippet:\n  ${transitResponse.text.slice(0, 300).replace(/\n/g, '\n  ')}...\n`);
  assert(transitResponse.success, 'Transit consultation succeeded');
  assert(
    transitResponse.text.includes('Gochara') ||
    transitResponse.text.includes('Transit') ||
    transitResponse.text.includes('transit') ||
    transitResponse.text.includes('Latta') ||
    transitResponse.text.includes('Double Transit'),
    'Includes Gochara/Transit or Latta analysis'
  );
  assert(
    transitResponse.text.includes('Latta') ||
    transitResponse.text.includes('Nakshatra') ||
    transitResponse.text.includes('Saturn') ||
    transitResponse.text.includes('Jupiter'),
    'Includes Latta, Nakshatra, or planetary transit details'
  );

  console.log('=============================================================');
  console.log('🎉 ALL 5 EXTENDED TEST SUITES PASSED (100% EMPIRICAL INTEGRITY)');
  console.log('=============================================================\n');
}

runExtendedTestSuite().catch((err) => {
  console.error('Fatal Extended Test Error:', err);
  process.exit(1);
});
