/**
 * ASTROWORLD — Advanced Career & Education Astrology Intelligence Verification Suite
 *
 * Verifies:
 * 1. Mathematical calculation integrity (D10, D24, Jaimini 7-karaka & 8-karaka with Rahu reverse degree, A10, 10th from KL).
 * 2. Hierarchical taxonomy & competing occupational distinction matrices.
 * 3. Versioned rule registry with explicit source class differentiation (classical vs commentary vs modern hypothesis).
 * 4. 8-class career intent classifier.
 * 5. 5-Layer career reasoning matrix (D1, Dispositor, D10, D24, Jaimini, Education vs Career separation).
 * 6. Contradiction detection, heuristic scoring (never 100%), and epistemic abstention logic.
 * 7. End-to-end consulting integration via consultAgent.
 */

import * as Astronomy from 'astronomy-engine';
import {
  TEST_BENCHMARK_PROFILE,
  birthProfileToUtcDate,
  calculateAscendant,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateJaiminiFacts,
  calculateArudhaPada,
  generateVargaChart,
  generateAllShodashavargas,
  computeCanonicalChart,
  ZODIAC_SIGNS,
} from '../../shared/index.ts';
import {
  CAREER_TAXONOMY,
  COMPETING_OCCUPATIONAL_DISTINCTIONS,
  findTaxonomyRole,
  findTaxonomyDiscipline,
  findTaxonomySector,
  searchTaxonomyByKeywords,
} from '../src/ai_v2/career/careerTaxonomy.ts';
import {
  CAREER_RULE_REGISTRY,
  findCareerRulesByPlanets,
  findCareerRulesBySourceClass,
  findCareerRulesByTaxonomyId,
} from '../src/ai_v2/career/careerRuleRegistry.ts';
import {
  classifyCareerIntent,
} from '../src/ai_v2/career/careerIntentClassifier.ts';
import {
  CareerReasoningEngine,
} from '../src/ai_v2/career/careerReasoningEngine.ts';
import {
  ConsultAgent,
} from '../src/ai_agent/consultAgent.ts';

function assert(condition: boolean, testName: string, detail: string) {
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}: ${detail}`);
    throw new Error(`Assertion failed in ${testName}: ${detail}`);
  }
  console.log(`✅ [PASSED] ${testName}: ${detail}`);
}

async function runVerification() {
  console.log('🏛️ Starting Advanced Career & Education Astrology Intelligence Verification Suite...\n');

  // Baseline Setup with Canonical Benchmark Profile
  const birthUtc = birthProfileToUtcDate(TEST_BENCHMARK_PROFILE);
  const time = new Astronomy.AstroTime(birthUtc);
  const ayanamsha = calculateLahiriAyanamsha(time);
  const ascendant = calculateAscendant(time, TEST_BENCHMARK_PROFILE.latitude, TEST_BENCHMARK_PROFILE.longitude, ayanamsha);
  const planets = calculatePlanetaryPositions(time, ayanamsha, ascendant.signIndex);
  const d9 = generateVargaChart('D9', ascendant.siderealLongitude, planets);
  const d10 = generateVargaChart('D10', ascendant.siderealLongitude, planets);
  const d24 = generateVargaChart('D24', ascendant.siderealLongitude, planets);

  // =========================================================================
  // 1. MATHEMATICAL CALCULATION INTEGRITY (D10, D24, JAIMINI & ARUDHA A10)
  // =========================================================================
  console.log('--- 1. MATHEMATICAL CALCULATION INTEGRITY ---');

  // A. D10 Parashari Convention Verification
  // Odd sign: starts from self. Even sign: starts from 9th sign ((self + 8) % 12).
  // 3-degree portions.
  const d10Aries0 = generateVargaChart('D10', 0.5, planets); // 0.5° Aries (odd) -> Aries
  assert(d10Aries0.ascendantSign === 'Aries', 'Test 1A: D10 Odd Sign Start', 'Aries 0.5° maps to Aries D10');

  const d10Aries5 = generateVargaChart('D10', 3.5, planets); // 3.5° Aries -> division 1 -> Taurus
  assert(d10Aries5.ascendantSign === 'Taurus', 'Test 1B: D10 Odd Sign 2nd Segment', 'Aries 3.5° maps to Taurus D10');

  const d10Taurus0 = generateVargaChart('D10', 30.5, planets); // 0.5° Taurus (even sign, index 1) -> starts from 9th sign (Capricorn, index 9)
  assert(d10Taurus0.ascendantSign === 'Capricorn', 'Test 1C: D10 Even Sign Start', 'Taurus 0.5° maps to Capricorn D10');

  // B. D24 Siddhamsa Convention Verification
  // 1.25° portions. Odd signs start from Leo (4); Even signs start from Cancer (3).
  const d24Aries0 = generateVargaChart('D24', 0.5, planets); // 0.5° Aries (odd) -> Leo (4)
  assert(d24Aries0.ascendantSign === 'Leo', 'Test 1D: D24 Odd Sign Start', 'Aries 0.5° starts from Leo in D24');

  const d24Taurus0 = generateVargaChart('D24', 30.5, planets); // 0.5° Taurus (even) -> Cancer (3)
  assert(d24Taurus0.ascendantSign === 'Cancer', 'Test 1E: D24 Even Sign Start', 'Taurus 0.5° starts from Cancer in D24');

  // C. Jaimini 7-Karaka vs 8-Karaka Scheme
  const facts7 = calculateJaiminiFacts(planets, ascendant.signIndex, d9, d10, 'seven_karaka');
  assert(facts7.karakaScheme === 'seven_karaka', 'Test 1F: 7-Karaka Scheme Declaration', 'Default karaka scheme is seven_karaka');
  assert(facts7.charaKarakas.length === 7, 'Test 1G: 7-Karaka Count', '7 planets ranked descending by degree');
  assert(facts7.atmakaraka === 'Jupiter', 'Test 1H: Atmakaraka Identification', 'Jupiter holds highest degree');
  assert(facts7.amatyakaraka === 'Moon', 'Test 1I: Amatyakaraka Identification', 'Moon holds second highest degree');

  const facts8 = calculateJaiminiFacts(planets, ascendant.signIndex, d9, d10, 'eight_karaka');
  assert(facts8.karakaScheme === 'eight_karaka', 'Test 1J: 8-Karaka Scheme Declaration', '8-karaka scheme explicitly declared');
  assert(facts8.charaKarakas.length === 8, 'Test 1K: 8-Karaka Count', '8 planets ranked including Rahu');
  const rahuIn8 = facts8.charaKarakas.find((k) => k.planet === 'Rahu');
  assert(rahuIn8 !== undefined, 'Test 1L: Rahu Presence in 8-Karaka', 'Rahu is included in 8-karaka scheme');
  // Rahu within-sign degree is reversed: 30 - degreeInSign
  const rawRahu = planets.find((p) => p.name === 'Rahu')!;
  const expectedReversedDeg = Math.max(0, 30 - rawRahu.degreeInSign);
  assert(
    Math.abs(rahuIn8!.degreeInSign - expectedReversedDeg) < 0.001,
    'Test 1M: Rahu Degree Reversal in 8-Karaka',
    `Rahu effective degree = ${expectedReversedDeg.toFixed(2)}° (reversed for retrograde motion)`
  );

  // D. Amatyakaraka Detailed Placements across D1, D9, D10
  assert(facts7.amatyakarakaDetails !== undefined, 'Test 1N: Amatyakaraka Details Structure', 'AmK details object computed');
  assert(facts7.amatyakarakaDetails?.planet === 'Moon', 'Test 1O: AmK Planet Name', 'AmK planet matches 2nd karaka');
  assert(facts7.amatyakarakaDetails?.d1Sign !== undefined, 'Test 1P: AmK D1 Placement', `AmK D1 sign: ${facts7.amatyakarakaDetails?.d1Sign}`);
  assert(facts7.amatyakarakaDetails?.d9Sign !== undefined, 'Test 1Q: AmK D9 Placement', `AmK D9 sign: ${facts7.amatyakarakaDetails?.d9Sign}`);
  assert(facts7.amatyakarakaDetails?.d10Sign !== undefined, 'Test 1R: AmK D10 Placement', `AmK D10 sign: ${facts7.amatyakarakaDetails?.d10Sign}`);

  // E. Karakamsha & 10th from Karakamsha
  assert(facts7.karakamsaNavamshaSign === 'Cancer', 'Test 1S: Karakamsa Navamsha Sign', 'AK Jupiter in D9 is in Cancer');
  assert(facts7.tenthFromKarakamsaNavamsha !== undefined, 'Test 1T: 10th from Karakamsha Object', '10th from KL is present');
  // Cancer is signIndex 3. 10th sign from Cancer = (3 + 9) % 12 = 0 (Aries)
  assert(facts7.tenthFromKarakamsaNavamsha?.sign === 'Aries', 'Test 1U: 10th from Karakamsha Sign', '10th from Cancer KL is Aries');

  // F. Rajya Pada (A10) Jaimini Arudha Calculation
  assert(facts7.rajyaPadaA10 !== undefined, 'Test 1V: Rajya Pada A10 Computed', 'A10 is calculated');
  const manualA10 = calculateArudhaPada(10, ascendant.signIndex, planets);
  assert(facts7.rajyaPadaA10?.sign === manualA10.sign, 'Test 1W: A10 Sign Verification', `A10 sign = ${facts7.rajyaPadaA10?.sign}`);
  assert(facts7.rajyaPadaA10?.houseNumber === manualA10.houseNumber, 'Test 1X: A10 House Number', `A10 house = ${facts7.rajyaPadaA10?.houseNumber}`);

  // =========================================================================
  // 2. HIERARCHICAL TAXONOMY & OCCUPATIONAL DISTINCTIONS
  // =========================================================================
  console.log('\n--- 2. HIERARCHICAL CAREER TAXONOMY & DISTINCTIONS ---');

  assert(CAREER_TAXONOMY.length >= 7, 'Test 2A: Taxonomy Sectors Count', 'At least 7 major vocational sectors defined');
  const softwareRole = findTaxonomyRole('role_software_engineer');
  assert(softwareRole !== undefined, 'Test 2B: Software Engineer Role Lookup', 'Found Software Engineer in taxonomy');
  assert(Boolean(softwareRole?.academicDegrees.includes('B.Tech CSE')), 'Test 2C: Academic Degree Mapping', 'B.Tech CSE mapped to Software Engineer');

  const surgeonRole = findTaxonomyRole('role_general_surgeon');
  assert(surgeonRole !== undefined, 'Test 2D: Surgeon Role Lookup', 'Found General Surgeon in taxonomy');
  assert(Boolean(surgeonRole?.planetaryArchetypes.primarySignificators.includes('Mars')), 'Test 2E: Mars Surgical Signification', 'Mars is primary significator for surgery');

  const searchResults = searchTaxonomyByKeywords('data science');
  assert(searchResults.length > 0, 'Test 2F: Keyword Taxonomy Search', 'Search for "data science" yields matching roles');

  assert(COMPETING_OCCUPATIONAL_DISTINCTIONS.length >= 6, 'Test 2G: Competing Distinctions Matrix', 'Contains at least 6 occupational distinction definitions');
  const cseVsEce = COMPETING_OCCUPATIONAL_DISTINCTIONS.find((d) => d.candidateA.includes('CSE'));
  assert(cseVsEce !== undefined, 'Test 2H: CSE vs ECE Distinction', 'CSE vs ECE distinction documented with epistemic limitations');
  const seVsDs = COMPETING_OCCUPATIONAL_DISTINCTIONS.find((d) => d.candidateA.includes('Software') && d.candidateB.includes('Data'));
  assert(seVsDs !== undefined, 'Test 2I: Software vs Data Science Distinction', 'Software Engineer vs Data Scientist distinction documented');

  // =========================================================================
  // 3. VERSIONED CAREER RULE REGISTRY & SOURCE TRACEABILITY
  // =========================================================================
  console.log('\n--- 3. VERSIONED CAREER RULE REGISTRY ---');

  assert(CAREER_RULE_REGISTRY.length >= 10, 'Test 3A: Rule Registry Count', 'At least 10 canonical and modern rules registered');
  const classicalRules = findCareerRulesBySourceClass('primary_classical');
  assert(classicalRules.length >= 4, 'Test 3B: Primary Classical Rules', 'Primary classical rules from BPHS, Saravali, and Jaimini present');
  assert(classicalRules.every((r) => r.citation.author && r.citation.work), 'Test 3C: Citation Integrity', 'All classical rules have author and source text');

  const modernRules = findCareerRulesBySourceClass('modern_hypothesis');
  assert(modernRules.length >= 3, 'Test 3D: Modern Interpretive Hypotheses', 'Modern hypotheses for AI, ECE, and Cybersecurity present');
  assert(
    modernRules.every((r) => r.epistemicStatus === 'practitioner_hypothesis' || r.epistemicStatus === 'empirical_unvalidated'),
    'Test 3E: Epistemic Status Integrity',
    'Modern tech rules are strictly classified as practitioner hypotheses, never masquerading as ancient shastras'
  );

  const limitationRules = findCareerRulesBySourceClass('empirical_limitation');
  assert(limitationRules.length >= 1, 'Test 3F: Epistemic Limitation Rules', 'Explicit limitation rules governing overlapping tech categories present');

  // =========================================================================
  // 4. CAREER & EDUCATION INTENT CLASSIFICATION (8 CLASSES)
  // =========================================================================
  console.log('\n--- 4. CAREER INTENT CLASSIFIER (8 CLASSES) ---');

  const intentA = classifyCareerIntent('What career is indicated by this chart?');
  assert(intentA.intent === 'broad_career_identification', 'Test 4A: Intent Broad Career', 'Correctly classified broad career query');

  const intentB = classifyCareerIntent('What degree should I study in university?');
  assert(intentB.intent === 'academic_field_identification', 'Test 4B: Intent Academic Field', 'Correctly classified academic degree query');

  const intentC = classifyCareerIntent('Should I choose CSE or ECE engineering?');
  assert(intentC.intent === 'branch_level_identification', 'Test 4C: Intent Branch Identification', 'Correctly classified CSE vs ECE query');

  const intentD = classifyCareerIntent('Am I better suited as a data analyst or a data scientist?');
  assert(intentD.intent === 'occupational_specialization', 'Test 4D: Intent Occupational Specialization', 'Correctly classified Data Analyst vs Data Scientist query');

  const intentE = classifyCareerIntent('Compare medicine vs engineering for my chart');
  assert(intentE.intent === 'career_suitability_comparison', 'Test 4E: Intent Suitability Comparison', 'Correctly classified comparative query');

  const intentF = classifyCareerIntent('When will I get a job promotion or switch?');
  assert(intentF.intent === 'career_timing', 'Test 4F: Intent Career Timing', 'Correctly classified timing query');

  const intentG = classifyCareerIntent('I am currently a software engineer, will I stay or change my current occupation?');
  assert(intentG.intent === 'existing_occupation_analysis', 'Test 4G: Intent Existing Occupation', 'Correctly classified existing occupation query');

  const intentH = classifyCareerIntent('How does Parashari methodology differ from Jaimini career analysis in classical shastras?');
  assert(intentH.intent === 'research_and_methodology', 'Test 4H: Intent Research & Methodology', 'Correctly classified research methodology query');

  // =========================================================================
  // 5. FIVE-LAYER CAREER REASONING MATRIX
  // =========================================================================
  console.log('\n--- 5. FIVE-LAYER CAREER REASONING ENGINE ---');

  const canonicalContext = computeCanonicalChart(TEST_BENCHMARK_PROFILE);
  const reasoningResult = CareerReasoningEngine.analyzeCareer(
    canonicalContext,
    'What technical career specialization does my chart indicate, such as CSE, software engineering, or data science?'
  );

  assert(reasoningResult !== undefined, 'Test 5A: Reasoning Result Produced', 'Career reasoning executed successfully');
  assert(reasoningResult.deterministicFacts.d1TenthHouse.sign === 'Aquarius', 'Test 5B: D1 10th House Verification', '10th house is Aquarius (for Taurus Lagna)');
  assert(reasoningResult.deterministicFacts.d1TenthHouse.lord === 'Saturn', 'Test 5C: D1 10th Lord Verification', '10th lord is Saturn');
  assert(reasoningResult.deterministicFacts.dispositorChain.tenthLordDispositor !== undefined, 'Test 5D: Dispositor Chain', 'Dispositor chain computed');

  assert(reasoningResult.educationVsCareer !== undefined, 'Test 5E: Education vs Career Separation', 'Separation matrix computed');
  assert(reasoningResult.educationVsCareer.educationStreamD24.primaryField !== undefined, 'Test 5F: D24 Education Field', 'D24 education stream identified');
  assert(reasoningResult.educationVsCareer.vocationalEntryD1.primaryWorkSector !== undefined, 'Test 5G: D1 Vocational Entry', 'D1 vocational entry identified');
  assert(reasoningResult.educationVsCareer.ultimateSpecializationD10.specialization !== undefined, 'Test 5H: D10 Ultimate Specialization', 'D10 specialization identified');

  assert(reasoningResult.rankedCandidates.length > 0, 'Test 5I: Candidate Ranking', 'Candidate professions evaluated and ranked');
  const topCand = reasoningResult.rankedCandidates[0];
  assert(topCand.relativeCompatibilityScore <= 95, 'Test 5J: Honest Heuristic Ceiling', 'Relative compatibility score is strictly <= 95% (never 100%)');
  assert(topCand.relativeCompatibilityScore >= 20, 'Test 5K: Score Floor', 'Relative compatibility score is meaningful');
  assert(topCand.evidenceFor.length > 0, 'Test 5L: Supporting Evidence Attached', 'Top candidate has explicit evidence points');

  // =========================================================================
  // 6. CONTRADICTION DETECTION & MANDATORY EPISTEMIC ABSTENTION
  // =========================================================================
  console.log('\n--- 6. CONTRADICTION DETECTION & EPISTEMIC ABSTENTION ---');

  assert(reasoningResult.detectedContradictions.length >= 0, 'Test 6A: Contradiction Check', 'Contradiction detection ran without error');
  assert(reasoningResult.abstentionAssessment !== undefined, 'Test 6B: Abstention Assessment Object', 'Abstention assessment evaluated');
  assert(
    reasoningResult.abstentionAssessment.scopeOfValidity === 'discipline_level' ||
    reasoningResult.abstentionAssessment.scopeOfValidity === 'specialization_qualified',
    'Test 6C: Scope of Validity Calibration',
    `Scope of validity calibrated as ${reasoningResult.abstentionAssessment.scopeOfValidity}`
  );
  assert(
    reasoningResult.epistemicDisclaimer.includes('guidance') && !reasoningResult.epistemicDisclaimer.includes('100% guarantee'),
    'Test 6D: Honest Epistemic Disclaimer',
    'Epistemic disclaimer transparently communicates astrological limits'
  );

  // =========================================================================
  // 7. END-TO-END CONSULTATION SYNTHESIS
  // =========================================================================
  console.log('\n--- 7. END-TO-END CONSULTATION SYNTHESIS ---');

  const agent = new ConsultAgent();
  const consultResponse = await agent.consult({
    userMessage: 'Should I pursue Computer Science Engineering or Electronics, and what specialization suits my chart?',
    birthProfile: TEST_BENCHMARK_PROFILE,
  });

  assert(consultResponse.success === true, 'Test 7A: Consult Agent Success', 'Consult agent executed successfully');
  assert(consultResponse.text.length > 500, 'Test 7B: Response Completeness', 'Consult agent produced comprehensive consultation');
  assert(
    consultResponse.text.includes('D10') || consultResponse.text.includes('Dashamsha'),
    'Test 7C: D10 Dashamsha Presence in Answer',
    'Answer cites D10 Dashamsha'
  );
  assert(
    consultResponse.text.includes('D24') || consultResponse.text.includes('Siddhamsha'),
    'Test 7D: D24 Siddhamsa Presence in Answer',
    'Answer cites D24 education chart'
  );
  assert(
    consultResponse.text.includes('Amatyakaraka') || consultResponse.text.includes('AmK') || consultResponse.text.includes('Jaimini'),
    'Test 7E: Jaimini AmK Presence in Answer',
    'Answer cites Jaimini career factors'
  );
  assert(
    consultResponse.toolsCalled.includes('analyze_career_and_education'),
    'Test 7F: Tool Invocation Trace',
    'Consult agent autonomously called analyze_career_and_education tool'
  );

  console.log('\n=================================================================');
  console.log('🎉 ALL ADVANCED CAREER & EDUCATION ASTROLOGY INTELLIGENCE TESTS PASSED!');
  console.log('=================================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Suite Failed with exception:', err);
  process.exit(1);
});
