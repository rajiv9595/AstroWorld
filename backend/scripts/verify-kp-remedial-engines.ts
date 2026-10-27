/**
 * ASTROWORLD — KP Decision & Remedial Shastra Engines Verification Suite
 * 
 * Verifies:
 * 1. KP Sub-Lord Arc Calculation & Binary Prashna Decision Intelligence
 * 2. Authentic Remedial Shastra Engine (Gemstone Safety Law, Daana, Mantras, Habits)
 */

import {
  calculateKPSubLord,
  evaluateKPDecision,
  KP_DOMAIN_MATRICES,
} from '../src/ai/reasoning/kpPrashnaEngine.ts';
import {
  generateRemedialDossier,
} from '../src/ai/reasoning/remedialShastraEngine.ts';

function assert(condition: boolean, testName: string, detail: string) {
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}: ${detail}`);
    throw new Error(`Assertion failed in ${testName}: ${detail}`);
  }
  console.log(`✅ [PASSED] ${testName}: ${detail}`);
}

async function runKPAndRemedialVerification() {
  console.log('🏛️ Starting AstroWorld KP Decision & Remedial Shastra Verification Suite...\n');

  // =========================================================================
  // 1. KP SUB-LORD ARCS & PRASHNA DECISION ENGINE
  // =========================================================================
  console.log('--- 1. KP SUB-LORD ARCS & PRASHNA DECISION ENGINE ---');

  // Ashwini: 0° to 13°20' (Star Lord: Ketu). First sub-lord is Ketu (0° to 0°46'40")
  const sub1 = calculateKPSubLord(0.5);
  assert(sub1.nakshatraName === 'Ashwini', 'Test 1A: Nakshatra Resolution', `0.5° is Ashwini`);
  assert(sub1.starLord === 'Ketu', 'Test 1B: Star Lord Resolution', `Ashwini star lord is Ketu`);
  assert(sub1.subLord === 'Ketu', 'Test 1C: First Sub-Lord', `First sub-lord in Ashwini is Ketu`);

  // Later in Ashwini (e.g. 1.2° -> Venus sub-lord)
  const sub2 = calculateKPSubLord(1.2);
  assert(sub2.subLord === 'Venus', 'Test 1D: Second Sub-Lord', `1.2° in Ashwini is Venus sub-lord`);

  // Test Binary Career Query: Strong Affirmative
  const sub285 = calculateKPSubLord(285.5);
  const careerAffirmative = evaluateKPDecision({
    domain: 'JOB_PROMOTION_CAREER',
    question: 'Will I be offered the senior staff software engineer position?',
    cuspalLongitude: 285.5, // 10th cusp in Capricorn/Aquarius
    cslSignifiedHouses: [2, 6, 10, 11],
    starLordSignifiedHouses: [2, 10],
    rulingPlanets: [sub285.subLord, sub285.starLord],
  });
  assert(careerAffirmative.verdict === 'STRONG_AFFIRMATIVE_YES', 'Test 1E: Career Yes Verdict', `Verdict: ${careerAffirmative.verdict}`);
  assert(careerAffirmative.confidenceScore >= 85, 'Test 1F: High Confidence Score', `Score: ${careerAffirmative.confidenceScore}%`);
  assert(careerAffirmative.signifiedFruitfulHouses.length >= 3, 'Test 1G: Fruitful Houses', `Fruitful: ${careerAffirmative.signifiedFruitfulHouses.join(', ')}`);

  // Test Binary Career Query: Strong Obstruction
  const careerObstruction = evaluateKPDecision({
    domain: 'JOB_PROMOTION_CAREER',
    question: 'Will my current dispute with management resolve in my promotion?',
    cuspalLongitude: 142.0,
    cslSignifiedHouses: [5, 8, 12],
    starLordSignifiedHouses: [8, 12],
  });
  assert(careerObstruction.verdict === 'STRONG_NEGATIVE_OBSTRUCTION', 'Test 1H: Career Obstruction Verdict', `Verdict: ${careerObstruction.verdict}`);
  assert(careerObstruction.strategicWarning !== undefined, 'Test 1I: Strategic Warning Present', `Warning: ${careerObstruction.strategicWarning}`);

  // Test Foreign Travel & Visa
  const visaQuery = evaluateKPDecision({
    domain: 'FOREIGN_TRAVEL_VISA',
    question: 'Will my overseas work visa be granted this quarter?',
    cuspalLongitude: 345.0,
    cslSignifiedHouses: [3, 9, 11, 12],
  });
  assert(visaQuery.verdict === 'STRONG_AFFIRMATIVE_YES', 'Test 1J: Visa Affirmative', `Verdict: ${visaQuery.verdict}`);

  // =========================================================================
  // 2. AUTHENTIC REMEDIAL SHASTRA & GEMSTONE SAFETY
  // =========================================================================
  console.log('\n--- 2. AUTHENTIC REMEDIAL SHASTRA & GEMSTONE SAFETY ---');

  // Test Taurus Lagna
  const taurusRemedies = generateRemedialDossier({
    lagnaSign: 'Taurus',
    activeDashaLord: 'Saturn',
  });

  // Verify Taurus Prohibitions: In Systems Approach, Venus rules 6th (Libra), Jupiter rules 8th (Sagittarius), Mars rules 12th (Aries)
  const prohibitedVenus = taurusRemedies.prohibitedGemstones.find(g => g.planet === 'Venus');
  assert(prohibitedVenus !== undefined, 'Test 2A: Taurus Venus Prohibition', `Diamond is PROHIBITED for Taurus because Venus is 6th lord FM`);
  assert(prohibitedVenus?.rationale.includes('Functional Malefic'), 'Test 2B: Prohibition Rationale', prohibitedVenus?.rationale || '');

  const prohibitedJupiter = taurusRemedies.prohibitedGemstones.find(g => g.planet === 'Jupiter');
  assert(prohibitedJupiter !== undefined, 'Test 2C: Taurus Jupiter Prohibition', `Yellow Sapphire is PROHIBITED for Taurus (8th lord FM)`);

  // Verify Taurus Approved Gemstones: Mercury (5th lord FB), Saturn (9th lord FB)
  const approvedMercury = taurusRemedies.recommendedGemstones.find(g => g.planet === 'Mercury');
  assert(approvedMercury !== undefined, 'Test 2D: Taurus Mercury Gemstone', `Emerald is APPROVED for Taurus: ${approvedMercury?.gemstoneName} on ${approvedMercury?.finger}`);

  const approvedSaturn = taurusRemedies.recommendedGemstones.find(g => g.planet === 'Saturn');
  assert(approvedSaturn !== undefined, 'Test 2E: Taurus Saturn Gemstone', `Blue Sapphire / Amethyst is APPROVED for Taurus: ${approvedSaturn?.gemstoneName}`);

  // Test Cancer Lagna: Saturn is 8th lord FM -> Blue Sapphire MUST BE PROHIBITED! Mars is Yogakaraka -> Red Coral APPROVED!
  const cancerRemedies = generateRemedialDossier({
    lagnaSign: 'Cancer',
  });
  const cancerProhibitedSaturn = cancerRemedies.prohibitedGemstones.find(g => g.planet === 'Saturn');
  assert(cancerProhibitedSaturn !== undefined, 'Test 2F: Cancer Saturn Prohibition', `Blue Sapphire is STRICTLY PROHIBITED for Cancer Lagna`);

  const cancerApprovedMars = cancerRemedies.recommendedGemstones.find(g => g.planet === 'Mars');
  assert(cancerApprovedMars !== undefined, 'Test 2G: Cancer Mars Approval', `Red Coral is HIGHLY APPROVED for Cancer Lagna (Yogakaraka)`);

  // Verify Daana Prescriptions
  assert(taurusRemedies.daanaPrescriptions.length >= 3, 'Test 2H: Daana Charity Prescriptions', `Found ${taurusRemedies.daanaPrescriptions.length} Daana pacification remedies`);
  const saturnDaana = taurusRemedies.daanaPrescriptions.find(d => d.planet === 'Saturn') || cancerRemedies.daanaPrescriptions.find(d => d.planet === 'Saturn');
  assert(saturnDaana !== undefined && saturnDaana.itemsToDonate.includes('Black sesame seeds (Til)'), 'Test 2I: Saturn Daana Details', `Items: ${saturnDaana?.itemsToDonate.join(', ')}`);

  // Verify Vedic Beeja Mantras & Japa Target
  assert(taurusRemedies.mantraSadhana.length >= 3, 'Test 2J: Vedic Beeja Mantras', `Found ${taurusRemedies.mantraSadhana.length} Beeja Mantra prescriptions`);
  const saturnMantra = taurusRemedies.mantraSadhana.find(m => m.planet === 'Saturn');
  assert(saturnMantra !== undefined && saturnMantra.prescribedRepetitions === 23000, 'Test 2K: Exact Classical Japa Count', `Saturn Japa target: 23,000 recitations`);

  // Verify Behavioral Karmic Habits
  assert(taurusRemedies.behavioralHabits.length >= 3, 'Test 2L: Behavioral Habits', `Found ${taurusRemedies.behavioralHabits.length} daily habit calibrations`);

  console.log('\n=================================================================');
  console.log('🎉 ALL KP DECISION & REMEDIAL SHASTRA ENGINES VERIFIED (100% GREEN)!');
  console.log('=================================================================\n');
}

runKPAndRemedialVerification().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
