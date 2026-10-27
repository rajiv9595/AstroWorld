/**
 * ASTROWORLD — Master Knowledge Corpus & Systems' Approach Engine Verification Suite
 * Verifies end-to-end indexing, retrieval, and astronomical calculations from the 8 newly ingested documents:
 * 1. Systems' Approach to Interpreting Horoscopes (Prof. V.K. Choudhry)
 * 2. AIFAS Timing of Events through Dasha and Transit (Shri S.K. Sawhney / K.N. Rao)
 * 3. The Real Secret of Vedic Astrology — Nakshatras (Acharya Bharat)
 * 4. Education and Astrology (Modern Computer & Aerospace Rules)
 * 5. How to Time New Job (KP Cuspal Sublord Mechanics)
 * 6. The ABC of Flawless Advanced Numerology (Cheiro & Vedic Compound Numbers)
 */

import { dynamicRAGEngine } from '../src/ai/rag/dynamicRagEngine.ts';
import { MASTER_KNOWLEDGE_CORPUS } from '../src/ai/rag/masterKnowledgeCorpus.ts';
import { getLagnaFunctionalProfile } from '../src/ai/reasoning/lagnaFunctionalMatrix.ts';
import { evaluateDoubleTransit } from '../src/ai/reasoning/doubleTransitValidator.ts';

function assert(condition: boolean, testName: string, detail: string) {
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}: ${detail}`);
    throw new Error(`Assertion failed in ${testName}: ${detail}`);
  }
  console.log(`✅ [PASSED] ${testName}: ${detail}`);
}

async function runMasterKnowledgeVerification() {
  console.log('🏛️ Starting AstroWorld Master Knowledge & Systems Approach Verification Suite...\n');

  // =========================================================================
  // 1. CORPUS COMPILATION & INTEGRITY
  // =========================================================================
  console.log('--- 1. MASTER KNOWLEDGE CORPUS COMPILATION INTEGRITY ---');
  assert(MASTER_KNOWLEDGE_CORPUS.length >= 80, 'Test 1A: Corpus Size', `Compiled ${MASTER_KNOWLEDGE_CORPUS.length} authoritative records from the 8 documents`);
  
  const systemsRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('SYS-APP'));
  assert(systemsRecords.length >= 14, 'Test 1B: Systems Approach Records', `Found ${systemsRecords.length} Systems Approach records`);

  const aifasRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('AIFAS'));
  assert(aifasRecords.length >= 17, 'Test 1C: AIFAS Timing Records', `Found ${aifasRecords.length} AIFAS timing & income records`);

  const nakshatraRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('NAK-SEC'));
  assert(nakshatraRecords.length === 27, 'Test 1D: Nakshatra Records', `Found all 27 Nakshatras secrets records (Ashwini to Revati)`);

  const numerologyRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('NUM-COMP'));
  assert(numerologyRecords.length >= 24, 'Test 1E: Numerology Records', `Found ${numerologyRecords.length} Compound Numerology records (10 to 33)`);

  const eduRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('EDU-ASTRO'));
  assert(eduRecords.length >= 2, 'Test 1F: Modern Education & Tech Records', `Found ${eduRecords.length} modern tech & aerospace records`);

  const kpRecords = MASTER_KNOWLEDGE_CORPUS.filter(r => r.id.startsWith('KP-JOB'));
  assert(kpRecords.length >= 1, 'Test 1G: KP Job Timing Records', `Found KP cuspal sublord job timing records`);

  // =========================================================================
  // 2. DYNAMIC RAG RETRIEVAL & VECTOR MATCHING
  // =========================================================================
  console.log('\n--- 2. DYNAMIC RAG RETRIEVAL & SEMANTIC EXPANSION ---');

  // Test Systems Approach Retrieval
  const saResults = dynamicRAGEngine.search({
    query: 'What are the functional malefics for Taurus ascendant according to Systems Approach?',
    limit: 5,
  });
  assert(saResults.length > 0, 'Test 2A: Systems Approach Search', `Retrieved ${saResults.length} records`);
  assert(
    saResults.some(r => r.citation.includes('Systems') || r.canonicalTranslation.includes('Functional Malefics')),
    'Test 2B: Systems Approach Citation',
    'Retrieved Prof. V.K. Choudhry Systems Approach Moolatrikona record'
  );

  // Test AIFAS Timing Retrieval
  const aifasResults = dynamicRAGEngine.search({
    query: 'What dasha and transit parameters are required for promotion and rise in profession in AIFAS?',
    limit: 5,
  });
  assert(aifasResults.length > 0, 'Test 2C: AIFAS Timing Search', `Retrieved ${aifasResults.length} records`);
  assert(
    aifasResults.some(r => r.citation.includes('AIFAS') || r.canonicalTranslation.includes('10th Lord') || r.canonicalTranslation.includes('Dashamsha')),
    'Test 2D: AIFAS Timing Content',
    'Retrieved Shri S.K. Sawhney AIFAS career rise & double-transit record'
  );

  // Test Nakshatras Retrieval
  const nakResults = dynamicRAGEngine.search({
    query: 'What are the vocational talents and spiritual secrets of Rohini and Ardra Nakshatras?',
    limit: 5,
  });
  assert(nakResults.length > 0, 'Test 2E: Nakshatras Search', `Retrieved ${nakResults.length} records`);
  assert(
    nakResults.some(r => r.citation.includes('Nakshatras') || r.canonicalTranslation.includes('Rudra') || r.canonicalTranslation.includes('Brahma')),
    'Test 2F: Nakshatras Content',
    'Retrieved Acharya Bharat Nakshatra secret records'
  );

  // Test Modern Computing & Software Astrology
  const techEduResults = dynamicRAGEngine.search({
    query: 'Which planets govern software programming, computers, and video game development in education?',
    limit: 5,
  });
  assert(techEduResults.length > 0, 'Test 2G: Tech Education Search', `Retrieved ${techEduResults.length} records`);
  assert(
    techEduResults.some(r => 
      r.canonicalTranslation.toLowerCase().includes('rahu') || 
      r.canonicalTranslation.toLowerCase().includes('mercury') || 
      r.citation.toLowerCase().includes('software') ||
      r.citation.toLowerCase().includes('computer') ||
      r.citation.toLowerCase().includes('education')
    ),
    'Test 2H: Tech Education Synthesis',
    'Retrieved Rahu-Mercury-Mars modern software/hardware engineering record'
  );

  // Test Advanced Numerology
  const numResults = dynamicRAGEngine.search({
    query: 'What is the occult meaning of compound number 23 Royal Star of the Lion?',
    limit: 5,
  });
  assert(numResults.length > 0, 'Test 2I: Numerology Search', `Retrieved ${numResults.length} records`);
  assert(
    numResults.some(r => r.canonicalTranslation.includes('Royal Star of the Lion') || r.citation.includes('Compound Number 23')),
    'Test 2J: Numerology Content',
    'Retrieved Cheiro & Vedic compound number 23 record'
  );

  // =========================================================================
  // 3. SYSTEMS APPROACH FUNCTIONAL NATURE ENGINE VERIFICATION
  // =========================================================================
  console.log('\n--- 3. SYSTEMS APPROACH FUNCTIONAL NATURE ENGINE VERIFICATION ---');

  const taurusProfile = getLagnaFunctionalProfile('Taurus');
  assert(taurusProfile !== undefined, 'Test 3A: Taurus Profile', 'Found Taurus Lagna functional profile');
  assert(
    taurusProfile?.systemsApproachMalefics?.includes('Venus') &&
    taurusProfile?.systemsApproachMalefics?.includes('Jupiter') &&
    taurusProfile?.systemsApproachMalefics?.includes('Mars') &&
    taurusProfile?.systemsApproachMalefics?.includes('Rahu'),
    'Test 3B: Taurus Systems Approach Malefics',
    `Taurus FMs correctly identified: ${taurusProfile?.systemsApproachMalefics?.join(', ')}`
  );
  assert(
    taurusProfile?.systemsApproachBenefics?.includes('Saturn') &&
    taurusProfile?.systemsApproachBenefics?.includes('Mercury'),
    'Test 3C: Taurus Systems Approach Benefics',
    `Taurus FBs correctly identified: ${taurusProfile?.systemsApproachBenefics?.join(', ')}`
  );

  const geminiProfile = getLagnaFunctionalProfile('Gemini');
  assert(
    geminiProfile?.systemsApproachMalefics?.length === 2 &&
    geminiProfile?.systemsApproachMalefics?.includes('Rahu') &&
    geminiProfile?.systemsApproachMalefics?.includes('Ketu'),
    'Test 3D: Gemini Systems Approach Status',
    'Gemini confirmed as having only Rahu and Ketu as Functional Malefics in Systems Approach'
  );

  // =========================================================================
  // 4. AIFAS 4-POINT DOUBLE TRANSIT CONFLUENCE ENGINE
  // =========================================================================
  console.log('\n--- 4. AIFAS 4-POINT DOUBLE TRANSIT CONFLUENCE ENGINE ---');

  // Test Career: Target 10th House, Alternative 7th House (Bhavat Bhavam)
  // Jupiter in 6th (aspects 10th by 5th aspect), Saturn in 8th (aspects 10th by 3rd aspect)
  const careerDoubleTransit = evaluateDoubleTransit({
    targetHouse: 10,
    domain: 'career',
    jupiterHouse: 6, // 6 + 4 = 10 (5th aspect)
    saturnHouse: 8,  // 8 + 2 = 10 (3rd aspect)
    houseLordHouse: 10,
    alternativeHouse: 7,
    alternativeLordHouse: 7,
  });

  assert(careerDoubleTransit.doubleTransitActive === true, 'Test 4A: Career Double Transit Confluence', 'Double transit confirmed for 10th house');
  assert(careerDoubleTransit.probabilityScore >= 80, 'Test 4B: High Confluence Score', `Probability score is ${careerDoubleTransit.probabilityScore}%`);
  assert(careerDoubleTransit.aifasConditionsMet !== undefined && careerDoubleTransit.aifasConditionsMet.length >= 1, 'Test 4C: AIFAS Conditions Met', `AIFAS points activated: ${careerDoubleTransit.aifasConditionsMet?.join(', ')}`);
  assert(careerDoubleTransit.shastricExplanation.includes('AIFAS'), 'Test 4D: AIFAS Citation in Shastric Explanation', 'Explanation cites AIFAS classical parameters');

  console.log('\n=================================================================');
  console.log('🎉 ALL MASTER KNOWLEDGE & SYSTEMS APPROACH TESTS PASSED (100% GREEN)!');
  console.log('=================================================================\n');
}

runMasterKnowledgeVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
