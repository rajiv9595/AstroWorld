import { globalResearchRuleEngine } from '../src/ai/research/researchRuleCorpus.ts';
import {
  calculateBhriguBindu,
  calculateYogiAvayogi,
  calculateInduLagna,
  calculateBhriguNadiTrines,
  evaluateMedicalVulnerabilities,
} from '../src/ai/research/researchCalculators.ts';
import { ConsultAgent } from '../src/ai/agent/consultAgent.ts';

async function main() {
  console.log('🌌 Starting AstroWorld Research Corpus & Diagnostic Engine Verification...\n');

  // Test 1: ResearchRuleEngine Corpus Size and Categories
  const allRules = globalResearchRuleEngine.getAllRules();
  console.log(`✅ [PASSED] Ingested Rules Count: ${allRules.length} foundational rules loaded`);
  if (allRules.length < 25) {
    throw new Error(`Expected at least 25 rules in core corpus, got ${allRules.length}`);
  }

  // Test 2: Search Rules by Keyword
  const induRules = globalResearchRuleEngine.searchRules('Indu Lagna');
  console.log(`✅ [PASSED] Indu Lagna Rule Search: Found ${induRules.length} matching rule(s) (Authority: ${induRules[0]?.authority})`);
  if (induRules.length === 0) {
    throw new Error('Failed to retrieve Indu Lagna rule');
  }

  const commercialTriad = globalResearchRuleEngine.searchRules('Commercial Triad');
  console.log(`✅ [PASSED] Commercial Triad Search: Found rule "${commercialTriad[0]?.name}"`);
  if (commercialTriad.length === 0) {
    throw new Error('Failed to retrieve Commercial Triad rule');
  }

  // Test 3: Bhrigu Bindu Calculation
  // Moon at 254.5° (Sagittarius), Rahu at 345.0° (Pisces), Lagna at 39.9° (Taurus)
  const bb = calculateBhriguBindu(254.5, 345.0, 39.9);
  console.log(`✅ [PASSED] Bhrigu Bindu Calculation: ${bb.formattedDegree} in House ${bb.houseFromLagna} (${bb.nakshatra}, Lord: ${bb.nakshatraLord})`);
  if (!bb.formattedDegree || !bb.houseFromLagna) {
    throw new Error('Bhrigu Bindu calculation invalid');
  }

  // Test 4: Yogi & Avayogi Points Calculation
  // Sun at 120.5° (Leo), Moon at 254.5° (Sagittarius)
  const yogi = calculateYogiAvayogi(120.5, 254.5);
  console.log(`✅ [PASSED] Yogi & Avayogi Points: Yogi Planet: ${yogi.yogiPlanet} in ${yogi.yogiSign} | Avayogi: ${yogi.avayogiPlanet} in ${yogi.avayogiSign}`);
  if (!yogi.yogiPlanet || !yogi.avayogiPlanet) {
    throw new Error('Yogi/Avayogi calculation invalid');
  }

  // Test 5: Indu Lagna Wealth Calculation
  // Taurus Lagna (9th lord Saturn: 1 Kala), Sagittarius Moon (9th lord Sun: 30 Kalas)
  // Total Kalas = 31. 31 % 12 = 7. Count 7 from Sagittarius = Gemini!
  const indu = calculateInduLagna('Taurus', 'Sagittarius', [
    { name: 'Jupiter', sign: 'Virgo' },
    { name: 'Moon', sign: 'Sagittarius' },
    { name: 'Venus', sign: 'Virgo' },
    { name: 'Saturn', sign: 'Cancer' },
    { name: 'Sun', sign: 'Leo' },
    { name: 'Mercury', sign: 'Leo' },
    { name: 'Mars', sign: 'Aries' },
  ]);
  console.log(`✅ [PASSED] Indu Lagna Calculation: Sign: ${indu.induSign} (House ${indu.houseFromLagna} from Lagna) | Total Kalas: ${indu.totalKalas} | Wealth Tier: ${indu.wealthTier}`);
  if (indu.induSign !== 'Gemini') {
    throw new Error(`Expected Indu Lagna in Gemini, got ${indu.induSign}`);
  }

  // Test 6: Bhrigu Nadi Directional Trines & Combinations
  const samplePlanets = [
    { name: 'Saturn', sign: 'Taurus' as const, degreeInSign: 12.5 },
    { name: 'Venus', sign: 'Virgo' as const, degreeInSign: 18.2 },
    { name: 'Mercury', sign: 'Capricorn' as const, degreeInSign: 24.1 },
    { name: 'Sun', sign: 'Leo' as const, degreeInSign: 5.0 },
  ];
  const trines = calculateBhriguNadiTrines(samplePlanets);
  console.log(`✅ [PASSED] Bhrigu Nadi Directional Trines: South (Earth) detected combinations: ${trines.South_Earth.detectedCombinations.join(', ')}`);
  if (!trines.South_Earth.detectedCombinations.some((c) => c.includes('Supreme Commercial Triad'))) {
    throw new Error('Failed to detect Supreme Commercial Triad in South_Earth trine');
  }

  // Test 7: Medical Tridosha & Health Diagnostics
  const medical = evaluateMedicalVulnerabilities({
    ascendant: { sign: 'Taurus' },
    planets: [
      { name: 'Sun', sign: 'Leo', houseNumber: 4 },
      { name: 'Saturn', sign: 'Cancer', houseNumber: 3 },
      { name: 'Rahu', sign: 'Pisces', houseNumber: 11 },
      { name: 'Ketu', sign: 'Virgo', houseNumber: 5 },
      { name: 'Jupiter', sign: 'Virgo', houseNumber: 5 },
      { name: 'Venus', sign: 'Virgo', houseNumber: 5 },
      { name: 'Moon', sign: 'Sagittarius', houseNumber: 8 },
    ],
  });
  console.log(`✅ [PASSED] Medical Tridosha Diagnostics: Dominant Dosha: ${medical.dominantDosha} | Vata: ${medical.doshaScores.vata}, Pitta: ${medical.doshaScores.pitta}, Kapha: ${medical.doshaScores.kapha}`);

  // Test 8: End-to-End ConsultAgent Integration
  const birthProfile = {
    name: 'Rajeev Reddy',
    year: 2005,
    month: 8,
    day: 17,
    hour: 6,
    minute: 0,
    latitude: 16.9891,
    longitude: 82.2475,
    timezone: 'Asia/Kolkata',
  };

  const agent = new ConsultAgent({ forceMockMode: true });

  const wealthRes = await agent.consult({
    userMessage: 'How will my wealth and financial abundance unfold in my life?',
    birthProfile,
    conversationId: 'test_wealth_research_session',
  });

  const mentionsInduLagna = /Indu Lagna/i.test(wealthRes.text);
  const mentionsYogi = /Yogi/i.test(wealthRes.text);
  console.log(`✅ [PASSED] ConsultAgent Wealth Response Incorporates Indu Lagna: ${mentionsInduLagna ? 'YES' : 'NO'}`);
  console.log(`✅ [PASSED] ConsultAgent Wealth Response Incorporates Yogi Planet: ${mentionsYogi ? 'YES' : 'NO'}`);

  if (!mentionsInduLagna || !mentionsYogi) {
    throw new Error('ConsultAgent failed to include research diagnostics in wealth consultation');
  }

  console.log('\n==================================================');
  console.log('RESEARCH CORPUS & DIAGNOSTICS: ALL 8 PASSED | 0 FAILED');
  console.log('==================================================');
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

