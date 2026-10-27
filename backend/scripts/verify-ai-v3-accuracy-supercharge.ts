/**
 * ASTROWORLD AI V3 — Accuracy Supercharge Verification Suite
 * Tests the core breakthroughs:
 * 1. 12-Lagna Functional Benefic/Malefic/Yogakaraka matrix (BPHS Ch. 34)
 * 2. Double Transit (Guru-Shani) Confluence Engine
 * 3. Empirical Case Studies Corpus in RAG
 * 4. Derived facts generation in Tool Execution Orchestrator
 */

import { getLagnaFunctionalProfile, evaluatePlanetForLagna } from '../src/ai_v2/reasoning/lagnaFunctionalMatrix.ts';
import { evaluateDoubleTransit } from '../src/ai_v2/reasoning/doubleTransitValidator.ts';
import { EMPIRICAL_CASE_STUDIES, getRelevantCaseStudies } from '../src/ai_v2/rag/empiricalCaseStudies.ts';
import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from '../src/ai_v2/rag/knowledgeBase.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${msg}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${msg}`);
}

async function run() {
  console.log('================================================================================');
  console.log('ASTROWORLD AI V3 — ACCURACY SUPERCHARGE AUDIT');
  console.log('================================================================================');

  // 1. Lagna Functional Matrix Test
  const taurus = getLagnaFunctionalProfile('Taurus');
  assert(taurus.yogakarakas.includes('Saturn'), 'Taurus Lagna identifies Saturn as premier Yogakaraka (9th & 10th lord)');
  assert(taurus.functionalMalefics.includes('Jupiter'), 'Taurus Lagna identifies Jupiter as functional malefic (8th & 11th lord)');
  assert(taurus.badhakaHouse === 9, 'Taurus Lagna (fixed sign) identifies 9th house as Badhaka');

  const cancer = getLagnaFunctionalProfile('Cancer');
  assert(cancer.yogakarakas.includes('Mars'), 'Cancer Lagna identifies Mars as Yogakaraka (5th & 10th lord)');
  assert(cancer.badhakaLord === 'Venus', 'Cancer Lagna (movable sign) identifies 11th lord Venus as Badhaka');

  const libra = getLagnaFunctionalProfile('Libra');
  assert(libra.yogakarakas.includes('Saturn'), 'Libra Lagna identifies Saturn as supreme Yogakaraka (4th & 5th lord)');

  const capricorn = getLagnaFunctionalProfile('Capricorn');
  assert(capricorn.yogakarakas.includes('Venus'), 'Capricorn Lagna identifies Venus as Yogakaraka (5th & 10th lord)');
  const capJup = evaluatePlanetForLagna('Capricorn', 'Jupiter');
  assert(capJup.role === 'functional_malefic', 'Capricorn Lagna correctly classifies Jupiter as functional malefic (3rd & 12th lord)');

  // 2. Double Transit (Guru-Shani) Validator Test
  // Scenario A: Jupiter in 6th (aspects 10th via 5th aspect), Saturn in 1st (aspects 10th via 10th aspect) -> Double transit on 10th
  const dtActive = evaluateDoubleTransit({
    targetHouse: 10,
    domain: 'career',
    jupiterHouse: 6,
    saturnHouse: 1,
  });
  assert(dtActive.doubleTransitActive === true, 'Double transit correctly detects simultaneous activation on 10th house');
  assert(dtActive.verdict === 'imminent_manifestation', 'Double transit verdict flags imminent manifestation');
  assert(dtActive.probabilityScore >= 85, 'Double transit gives high probability score (>= 85%)');

  // Scenario B: Neither Jupiter nor Saturn aspecting 10th
  const dtInactive = evaluateDoubleTransit({
    targetHouse: 10,
    domain: 'career',
    jupiterHouse: 8,
    saturnHouse: 6,
  });
  assert(dtInactive.doubleTransitActive === false, 'Double transit correctly detects inactive window');
  assert(dtInactive.verdict === 'internal_cultivation', 'Inactive double transit flags internal cultivation phase');

  // 3. Empirical Case Studies Corpus in RAG
  assert(EMPIRICAL_CASE_STUDIES.length >= 8, `Empirical case studies repository contains ${EMPIRICAL_CASE_STUDIES.length} verified studies (>= 8 required)`);

  const careerStudies = getRelevantCaseStudies('career', 'Taurus');
  assert(careerStudies.length > 0, 'Retrieves relevant Taurus career case studies');
  assert(careerStudies[0].title.includes('CTO Founder'), 'Retrieved Taurus tech layoff to CTO founder case study');

  // 4. Verification that case studies are loaded in CLASSICAL_JYOTISH_KNOWLEDGE_BASE
  const caseRecords = CLASSICAL_JYOTISH_KNOWLEDGE_BASE.filter(r => r.id.startsWith('kb_empirical_'));
  assert(caseRecords.length === EMPIRICAL_CASE_STUDIES.length, `Knowledge base loaded all ${caseRecords.length} empirical case study records`);

  console.log('================================================================================');
  console.log('ALL ACCURACY SUPERCHARGE CONTRACTS PASSED (100%)');
  console.log('================================================================================');
}

run().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
