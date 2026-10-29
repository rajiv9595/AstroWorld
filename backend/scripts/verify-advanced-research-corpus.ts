/**
 * ASTROWORLD — Advanced Research Corpus Verification & Test Suite
 * 
 * Validates the complete ingestion of all research datasets:
 * 1. 1,309 Atomic Rules from astrology_research_corpus.md
 * 2. 225+ Master Canonical Rules from researchRuleCorpus.ts
 * 3. Deterministic Calculators (Dagdha, Bhavat Bhavam, Chara Karakas, Arudhas, Tajika, Pushkara, Gandanta)
 * 4. Classical Shastric GraphRAG (Jaimini Sutras, Prasna Marga, Tajika Neelakanthi, Charaka Samhita)
 * 5. ConsultAgent Dynamic Integration
 */

import {
  globalAstrologyCorpusIndex,
  globalResearchRuleEngine,
  calculateDagdhaRashi,
  calculateBhavatBhavam,
  calculateJaiminiCharaKarakas,
  calculateJaiminiArudhaPada,
  evaluateTajikaIthasala,
  calculateBhriguAgeClock,
  calculatePushkaraNavamsha,
  calculateGandanta,
  calculateInduLagna,
  calculateBhriguBindu,
  calculateYogiAvayogi,
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

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🔮 ASTROWORLD ADVANCED RESEARCH CORPUS VALIDATION SUITE');
  console.log('=============================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: 1,309 Atomic Rules Corpus Loader
  // -------------------------------------------------------------------------
  console.log('--- TEST 1: Atomic Rules Corpus (astrology_research_corpus.md) ---');
  const stats = globalAstrologyCorpusIndex.getStats();
  console.log(`  Total Rules Loaded: ${stats.totalRules}`);
  assert(stats.totalRules === 1309, `Expected 1309 atomic rules, got ${stats.totalRules}`);
  assert(Object.keys(stats.groupCounts).length === 17, `Expected 17 groups, got ${Object.keys(stats.groupCounts).length}`);
  assert(stats.statusCounts.COMPUTATIONAL_INVARIANT === 86, `Expected 86 COMPUTATIONAL_INVARIANT rules`);
  assert(stats.statusCounts.TRADITIONAL_HYPOTHESIS === 966, `Expected 966 TRADITIONAL_HYPOTHESIS rules`);

  // Test retrieval by ID
  const r1 = globalAstrologyCorpusIndex.getById('AST-00001');
  assert(Boolean(r1 && r1.title.includes('Store raw birth input')), 'AST-00001 retrieved correctly');

  const r117 = globalAstrologyCorpusIndex.getById('AST-00117');
  assert(Boolean(r117 && r117.type === 'LORD-IN-HOUSE'), 'AST-00117 (Lord 1 in House 1) retrieved correctly');

  const r991 = globalAstrologyCorpusIndex.getById('AST-00991');
  assert(Boolean(r991 && r991.status === 'HISTORICAL_ONLY'), 'AST-00991 (Historical Medical) retrieved correctly');

  // Test search
  const dashaSearchResults = globalAstrologyCorpusIndex.search('Vimshottari house 7', { limit: 5 });
  assert(dashaSearchResults.length > 0, `Search returned ${dashaSearchResults.length} dasha results`);
  console.log(`  Top search result: [${dashaSearchResults[0].id}] ${dashaSearchResults[0].title}`);

  // -------------------------------------------------------------------------
  // TEST 2: Research Rule Corpus (Master Canonical Rules 1–225+)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: Master Canonical Rules Corpus ---');
  const allRules = globalResearchRuleEngine.getAllRules();
  console.log(`  Total Canonical Rules: ${allRules.length}`);
  assert(allRules.length >= 75, `Expected at least 75 master rules, got ${allRules.length}`);

  const jaiminiRules = globalResearchRuleEngine.getRulesByCategory('jaimini');
  assert(jaiminiRules.length >= 7, `Expected at least 7 Jaimini rules, got ${jaiminiRules.length}`);

  const medicalRules = globalResearchRuleEngine.getRulesByCategory('medical');
  assert(medicalRules.length >= 8, `Expected at least 8 Medical rules, got ${medicalRules.length}`);

  const prashnaRules = globalResearchRuleEngine.getRulesByCategory('prashna');
  assert(prashnaRules.length >= 6, `Expected at least 6 Prashna rules, got ${prashnaRules.length}`);

  const ruleConvergence = globalResearchRuleEngine.getRuleById('RULE_224_MASTER_SYNTHESIS_CONVERGENCE');
  assert(Boolean(ruleConvergence), 'RULE_224_MASTER_SYNTHESIS_CONVERGENCE retrieved');

  // -------------------------------------------------------------------------
  // TEST 3: Deterministic Astronomical Calculators
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: Deterministic Astronomical Calculators ---');

  // A. Dagdha Rashi (Burnt Signs)
  const d1 = calculateDagdhaRashi(1);
  assert(d1.dagdhaSigns.includes('Libra') && d1.dagdhaSigns.includes('Capricorn'), '1st Tithi burns Libra and Capricorn');
  const d6 = calculateDagdhaRashi(6);
  assert(d6.dagdhaSigns.includes('Aries') && d6.dagdhaSigns.includes('Leo'), '6th Tithi burns Aries and Leo');
  const d15 = calculateDagdhaRashi(15);
  assert(d15.dagdhaSigns.length === 0, 'Purnima (15th) does not burn signs');

  // B. Bhavat Bhavam
  const bb4 = calculateBhavatBhavam(4);
  assert(bb4.secondaryHouse === 7, `4th from 4th is 7th (got ${bb4.secondaryHouse})`);
  const bb5 = calculateBhavatBhavam(5);
  assert(bb5.secondaryHouse === 9, `5th from 5th is 9th (got ${bb5.secondaryHouse})`);
  const bb8 = calculateBhavatBhavam(8);
  assert(bb8.secondaryHouse === 3, `8th from 8th is 3rd (got ${bb8.secondaryHouse})`);

  // C. Jaimini Chara Karakas
  const samplePlanets: Record<string, { longitude: number; degreeInSign?: number }> = {
    Sun: { longitude: 15.5 }, // Aries 15.5°
    Moon: { longitude: 42.2 }, // Taurus 12.2°
    Mars: { longitude: 88.9 }, // Gemini 28.9° -> Highest degree!
    Mercury: { longitude: 124.1 }, // Leo 4.1°
    Jupiter: { longitude: 219.0 }, // Scorpio 9.0°
    Venus: { longitude: 356.4 }, // Pisces 26.4° -> 2nd highest!
    Saturn: { longitude: 301.2 }, // Aquarius 1.2° -> Lowest!
  };
  const charaReport = calculateJaiminiCharaKarakas(samplePlanets);
  assert(charaReport.atmakaraka.planet === 'Mars', `AK should be Mars with 28.9°, got ${charaReport.atmakaraka.planet}`);
  assert(charaReport.amatyakaraka.planet === 'Venus', `AmK should be Venus with 26.4°, got ${charaReport.amatyakaraka.planet}`);
  assert(charaReport.karakas.DK.planet === 'Saturn', `DK should be Saturn with 1.2°, got ${charaReport.karakas.DK.planet}`);

  // D. Jaimini Arudha Pada with Shift Exception
  // Lagna = Aries (0). Suppose 1st Lord (Mars) is in Taurus (1 sign away).
  // Arudha = 1 step from Taurus = Gemini (2). Diff from house = 2. No shift.
  const aNormal = calculateJaiminiArudhaPada(1, 0, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]);
  assert(aNormal.finalArudhaSign === 'Gemini' && !aNormal.shifted, `Normal Arudha should be Gemini, got ${aNormal.finalArudhaSign}`);

  // Suppose Lagna = Aries (0), 1st Lord (Mars) is in Aries (0).
  // Unadjusted Arudha = Aries (0). Diff from house = 0. MUST SHIFT 10 SIGNS!
  // Aries (0) + 9 steps = Capricorn (9).
  const aShifted = calculateJaiminiArudhaPada(1, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert(aShifted.shifted && aShifted.finalArudhaSign === 'Capricorn', `Swastha Daridra exception must shift to Capricorn, got ${aShifted.finalArudhaSign}`);

  // E. Tajika Ithasala Yoga
  // Faster Moon at Aries 5° applying to slower Sun at Leo 9° (Trine aspect: signDiff = 4).
  // Deeptamsha orb: Moon 12, Sun 15 -> Allowed orb = 13.5°.
  // Difference = 9° - 5° = 4° <= 13.5°. Ithasala MUST be active!
  const ithasalaCheck = evaluateTajikaIthasala(
    { name: 'Moon', longitude: 5.0 },
    { name: 'Sun', longitude: 129.0 } // Leo 9°
  );
  assert(ithasalaCheck.aspectType === 'trine', `Aspect should be trine, got ${ithasalaCheck.aspectType}`);
  assert(ithasalaCheck.ithasalaYoga === true, 'Ithasala Yoga must be TRUE (Moon applying to Sun)');

  // F. Pushkara Navamsha & Gandanta
  const pushFire = calculatePushkaraNavamsha(21.5); // Aries 21.5° (Fire 20°–23°20')
  assert(pushFire.isPushkara && pushFire.pushkaraNavamshaSign === 'Libra', `Aries 21.5° should be Libra Pushkara, got ${pushFire.pushkaraNavamshaSign}`);

  const gandPisces = calculateGandanta(359.5); // Pisces 29.5° (within 0°30' of Aries)
  assert(gandPisces.isGandanta && gandPisces.isCriticalCore, '359.5° must be critical Gandanta core');

  // G. Bhrigu 12-Year Age Clock
  const clockAge30 = calculateBhriguAgeClock(0, 30); // Natal Jupiter in Aries (0), Age 30
  // Age 30: (30-1)%12 = 5 steps from Aries = Virgo (sign index 5, 6th house from Jup)
  assert(clockAge30.activeSign === 'Virgo' && clockAge30.cycleNumber === 3, `Age 30 should be Virgo in Cycle 3, got ${clockAge30.activeSign} Cycle ${clockAge30.cycleNumber}`);

  // -------------------------------------------------------------------------
  // TEST 4: Classical Shastric Knowledge Graph (GraphRAG)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: Classical Shastric Knowledge Graph ---');
  const mockChart = {
    ascendant: { sign: 'Taurus', longitude: 45.0 },
    planets: [
      { name: 'Sun', sign: 'Aries', signIndex: 0, longitude: 15.0, houseNumber: 12 },
      { name: 'Moon', sign: 'Cancer', signIndex: 3, longitude: 95.0, houseNumber: 3 },
      { name: 'Mars', sign: 'Capricorn', signIndex: 9, longitude: 285.0, houseNumber: 9 },
      { name: 'Mercury', sign: 'Taurus', signIndex: 1, longitude: 50.0, houseNumber: 1 },
      { name: 'Jupiter', sign: 'Cancer', signIndex: 3, longitude: 98.0, houseNumber: 3 },
      { name: 'Venus', sign: 'Pisces', signIndex: 11, longitude: 350.0, houseNumber: 11 },
      { name: 'Saturn', sign: 'Aquarius', signIndex: 10, longitude: 310.0, houseNumber: 10 },
      { name: 'Rahu', sign: 'Pisces', signIndex: 11, longitude: 340.0, houseNumber: 11 },
      { name: 'Ketu', sign: 'Virgo', signIndex: 5, longitude: 160.0, houseNumber: 5 },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({ houseNumber: i + 1 })),
  };

  const shastricCareer = globalShastricGraphEngine.queryShastricEvidence(mockChart, 'career');
  assert(shastricCareer.length > 0, `Shastric graph returned ${shastricCareer.length} citations for career`);
  console.log(`  Top citation: [${shastricCareer[0].sourceCitation}] - ${shastricCareer[0].classicalDictum.slice(0, 80)}...`);

  // -------------------------------------------------------------------------
  // TEST 5: ConsultAgent Dynamic Integration
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 5: ConsultAgent Dynamic Invocation ---');
  const profile: BirthProfileInput = {
    name: 'Sadhaka Arjun',
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata',
  };

  const consultAgent = createConsultAgent();
  const consultResponse = await consultAgent.consult({
    birthProfile: profile,
    userMessage: 'Who is my Atmakaraka and what are my Jaimini Chara Karakas and Arudha Lagna?',
  });

  assert(consultResponse.success, 'ConsultAgent answered successfully');
  assert(consultResponse.text.includes('Atmakaraka'), 'Response contains Atmakaraka analysis');
  assert(consultResponse.text.includes('Amatyakaraka'), 'Response contains Amatyakaraka analysis');
  assert(consultResponse.text.includes('Arudha Lagna'), 'Response contains Arudha Lagna analysis');
  console.log(`\nAgent Text Preview:\n${consultResponse.text.slice(0, 350)}...\n`);

  console.log('=============================================================');
  console.log('🎉 ALL 5 TEST SUITES PASSED (100% EMPIRICAL INTEGRITY)');
  console.log('=============================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
