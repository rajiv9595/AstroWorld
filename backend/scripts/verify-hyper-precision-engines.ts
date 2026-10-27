/**
 * ASTROWORLD — Hyper-Precision Predictive Engines Verification Suite
 * 
 * Verifies:
 * 1. Ashtakavarga Kakshya Timing Engine (Micro-Transit 3°45' Arcs)
 * 2. Sarvatobhadra Chakra & Special Nakshatra Vedha Engine
 * 3. D60 Shashtiamsha Esoteric Karmic Architecture Engine
 * 4. Chronological Milestone Timeline Engine
 */

import {
  getKakshyaSlot,
  evaluateKakshyaTransit,
  evaluateTargetHouseKakshya,
  KAKSHYA_LORDS,
} from '../src/ai/reasoning/kakshyaTransitEngine.ts';
import {
  computeSpecialNakshatras,
  evaluateSarvatobhadraTransits,
} from '../src/ai/reasoning/sarvatobhadraChakraEngine.ts';
import {
  computeD60PlanetProfile,
  synthesizeD60Chart,
} from '../src/ai/reasoning/shashtiamshaEngine.ts';
import {
  buildChronologicalRoadmap,
} from '../src/ai/reasoning/milestoneTimelineEngine.ts';
import { evaluateDoubleTransit } from '../src/ai/reasoning/doubleTransitValidator.ts';

function assert(condition: boolean, testName: string, detail: string) {
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}: ${detail}`);
    throw new Error(`Assertion failed in ${testName}: ${detail}`);
  }
  console.log(`✅ [PASSED] ${testName}: ${detail}`);
}

async function runHyperPrecisionVerification() {
  console.log('🏛️ Starting AstroWorld Hyper-Precision Engines Verification Suite...\n');

  // =========================================================================
  // 1. ASHTAKAVARGA KAKSHYA TIMING ENGINE (3°45' ARCS)
  // =========================================================================
  console.log('--- 1. ASHTAKAVARGA KAKSHYA TIMING ENGINE ---');

  const slot1 = getKakshyaSlot(1.5);
  assert(slot1.lord === 'Saturn' && slot1.kakshyaIndex === 0, 'Test 1A: First Kakshya (Saturn)', `0°–3°45' assigned to Saturn: ${slot1.formattedArc}`);

  const slot2 = getKakshyaSlot(5.0);
  assert(slot2.lord === 'Jupiter' && slot2.kakshyaIndex === 1, 'Test 1B: Second Kakshya (Jupiter)', `3°45'–7°30' assigned to Jupiter: ${slot2.formattedArc}`);

  const slot8 = getKakshyaSlot(28.5);
  assert(slot8.lord === 'Lagna' && slot8.kakshyaIndex === 7, 'Test 1C: Eighth Kakshya (Lagna)', `26°15'–30°00' assigned to Lagna: ${slot8.formattedArc}`);

  // Test Transit Evaluation
  const fruitTransit = evaluateKakshyaTransit({
    planet: 'Jupiter',
    currentSign: 'Taurus',
    degreeInSign: 4.2,
    bavBindusForSign: 5,
  });
  assert(fruitTransit.status === 'FRUITFUL_ACTIVE', 'Test 1D: Fruitful Transit Status', `Identified ${fruitTransit.windowTitle} as Fruitful Active`);
  assert(fruitTransit.predictiveManifestation.includes('catalyst window'), 'Test 1E: Predictive Insight', 'Generated actionable manifest text');

  const targetHouseStatus = evaluateTargetHouseKakshya({
    targetHouse: 10,
    targetSign: 'Aquarius',
    jupiterDegreeInSign: 5.0,
    jupiterSign: 'Taurus',
    saturnDegreeInSign: 18.0,
    saturnSign: 'Aquarius',
  });
  assert(targetHouseStatus !== undefined, 'Test 1F: Target House Status', `Directive: ${targetHouseStatus?.operationalDirective}`);

  // =========================================================================
  // 2. SARVATOBHADRA CHAKRA & SPECIAL NAKSHATRA VEDHA
  // =========================================================================
  console.log('\n--- 2. SARVATOBHADRA CHAKRA & SPECIAL NAKSHATRA VEDHA ---');

  // Rohini is Index 3 (4th Nakshatra)
  const specialNakshatras = computeSpecialNakshatras(3);
  assert(specialNakshatras.JANMA.nakshatraName === 'Rohini', 'Test 2A: Janma Star', `Janma is ${specialNakshatras.JANMA.nakshatraName}`);
  assert(specialNakshatras.KARMA.nakshatraName === 'Hasta', 'Test 2B: Karma Star (10th from Rohini)', `Karma star is ${specialNakshatras.KARMA.nakshatraName}`);
  assert(specialNakshatras.SAMUDAYIKA.nakshatraName === 'Uttara Ashadha', 'Test 2C: Samudayika Star (18th)', `Samudayika star is ${specialNakshatras.SAMUDAYIKA.nakshatraName}`);
  assert(specialNakshatras.VAINASHIKA.nakshatraName === 'Uttara Bhadrapada', 'Test 2D: Vainashika Star (23rd)', `Vainashika star is ${specialNakshatras.VAINASHIKA.nakshatraName}`);
  assert(specialNakshatras.MANASA.nakshatraName === 'Ashwini', 'Test 2E: Manasa Star (25th)', `Manasa star is ${specialNakshatras.MANASA.nakshatraName}`);

  // Test Transits against Special Stars
  const sbcResult = evaluateSarvatobhadraTransits({
    janmaNakshatraIndex: 3, // Rohini
    transitingPlanets: [
      { planet: 'Saturn', nakshatraIndex: 12 }, // Saturn in Hasta (Karma Nakshatra!)
      { planet: 'Jupiter', nakshatraIndex: 20 }, // Jupiter in Uttara Ashadha (Samudayika Nakshatra!)
    ],
  });

  assert(sbcResult.activeVedhas.length >= 2, 'Test 2F: Active Vedhas Found', `Detected ${sbcResult.activeVedhas.length} Vedhas`);
  const karmaHit = sbcResult.activeVedhas.find(v => v.targetRole === 'KARMA');
  assert(karmaHit !== undefined, 'Test 2G: Karma Nakshatra Activation', `Saturn in Karma Nakshatra: ${karmaHit?.predictiveInsight}`);
  const samudayikaHit = sbcResult.activeVedhas.find(v => v.targetRole === 'SAMUDAYIKA');
  assert(samudayikaHit !== undefined, 'Test 2H: Samudayika Elevation', `Jupiter in Samudayika Nakshatra: ${samudayikaHit?.predictiveInsight}`);

  // =========================================================================
  // 3. D60 SHASHTIAMSHA ESOTERIC KARMIC DECODER
  // =========================================================================
  console.log('\n--- 3. D60 SHASHTIAMSHA ESOTERIC KARMIC DECODER ---');

  const d60Lagna = computeD60PlanetProfile({
    planet: 'Lagna',
    sign: 'Taurus',
    degreeInSign: 16.2, // 16.2 / 0.5 = 32 -> Davagni / Ghora
  });
  assert(d60Lagna.amshaIndex === 32, 'Test 3A: Amsha Index', `16.2° maps to D60 Amsha index 32`);
  assert(d60Lagna.devataName.length > 0, 'Test 3B: Devata Lookup', `Devata: ${d60Lagna.devataName} (${d60Lagna.category})`);

  const d60Full = synthesizeD60Chart({
    lagnaDegree: 16.2,
    lagnaSign: 'Taurus',
    atmakarakaPlanet: 'Mercury',
    atmakarakaDegree: 8.5,
    atmakarakaSign: 'Virgo',
    tenthLordPlanet: 'Saturn',
    tenthLordDegree: 12.0,
    tenthLordSign: 'Aquarius',
  });
  assert(d60Full.sanchitaKarmaSynthesis.includes('Atmakaraka'), 'Test 3C: Synthesis Content', 'Synthesis incorporates Atmakaraka soul directive');
  assert(d60Full.sanchitaKarmaSynthesis.includes('10th Lord'), 'Test 3D: Career Karmic Root', 'Synthesis incorporates 10th Lord karmic root');

  // =========================================================================
  // 4. CHRONOLOGICAL MILESTONE TIMELINE ROADMAP
  // =========================================================================
  console.log('\n--- 4. CHRONOLOGICAL MILESTONE TIMELINE ROADMAP ---');

  const careerDT = evaluateDoubleTransit({
    targetHouse: 10,
    domain: 'career',
    jupiterHouse: 6,
    saturnHouse: 8,
    alternativeHouse: 7,
  });

  const roadmap = buildChronologicalRoadmap({
    nativeLagna: 'Taurus',
    currentDateIso: '2026-10-24T00:00:00.000Z',
    mahadashaLord: 'Moon',
    antardashaLord: 'Rahu',
    pratyantardashaLord: 'Jupiter',
    doubleTransitCareer: careerDT,
    activeVedhas: sbcResult.activeVedhas,
  });

  assert(roadmap.currentQuarterMilestone.confluenceScore >= 80, 'Test 4A: High Confluence Score', `Score: ${roadmap.currentQuarterMilestone.confluenceScore}%`);
  assert(roadmap.upcomingQuarterMilestones.length === 2, 'Test 4B: Upcoming Quarters Count', `Found ${roadmap.upcomingQuarterMilestones.length} upcoming quarter milestones`);
  assert(roadmap.macroSummary.includes('Taurus'), 'Test 4C: Macro Trajectory Synthesis', 'Roadmap reflects native Lagna trajectory');

  console.log('\n=================================================================');
  console.log('🎉 ALL HYPER-PRECISION PREDICTIVE ENGINES VERIFIED (100% GREEN)!');
  console.log('=================================================================\n');
}

runHyperPrecisionVerification().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
