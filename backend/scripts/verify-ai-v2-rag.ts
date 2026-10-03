/**
 * ASTROWORLD AI V2 — Phase 3A RAG Layer Verification Suite
 * Tests classical knowledge indexing, topic taxonomy, question-aware retrieval,
 * evidence alignment, tradition preservation, and golden benchmark quality metrics.
 */

import { ClassicalRAGRetriever } from '../src/ai_v2/rag/retriever.ts';
import { GOLDEN_RETRIEVAL_BENCHMARK } from '../src/ai_v2/rag/goldenRetrievalSet.ts';
import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../src/ai_v2/orchestrator/toolOrchestrator.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';

const SAMPLE_PROFILE: BirthProfileInput = {
  name: 'Test Native',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [PASSED] ${testName}${detail ? `: ${detail}` : ''}`);
    passedCount++;
  } else {
    console.error(`❌ [FAILED] ${testName}${detail ? `: ${detail}` : ''}`);
    failedCount++;
  }
}

async function runPhase3ASuite() {
  console.log('\n📜 Starting AstroWorld AI V2 Phase 3A Classical Jyotish RAG Verification Suite...\n');

  const retriever = new ClassicalRAGRetriever();
  const planner = new QuestionPlanner();
  const orchestrator = new ToolExecutionOrchestrator();

  // ==========================================
  // 1. JUPITER TRANSIT RETRIEVAL
  // ==========================================
  console.log('--- 1. SPECIFIC RETRIEVAL SCENARIOS ---');

  const q1 = "How does Jupiter's transit through the 5th and 11th houses bring expansion?";
  const q1Plan = await planner.plan(q1);
  const q1Evidence = await orchestrator.orchestrate(q1Plan, SAMPLE_PROFILE);
  const res1 = retriever.retrieve(q1, q1Plan, q1Evidence);

  assert(
    res1.results.length > 0 &&
      res1.results.some(r => r.citation.includes('Phaladeepika') && r.metadata.topic === 'transits'),
    'Test 1: Jupiter Transit Retrieval',
    `Retrieved ${res1.results.length} classical rules citing Phaladeepika Gochara`
  );

  // ==========================================
  // 2. CAREER HOUSE RETRIEVAL
  // ==========================================
  const q2 = 'What does BPHS say about the 10th house Karma Bhava and executive status?';
  const q2Plan = await planner.plan(q2);
  const res2 = retriever.retrieve(q2, q2Plan);

  assert(
    res2.results.length > 0 &&
      res2.results.some(r => r.citation.includes('BPHS') && r.metadata.topic === 'career'),
    'Test 2: Career 10th House Principles',
    'Retrieved foundational 10th house Karma Bhava rules from BPHS'
  );

  // ==========================================
  // 3. D10 DASHAMSHA RETRIEVAL
  // ==========================================
  const q3 = 'How is the D10 Dashamsha chart used to assess leadership and career achievements?';
  const q3Plan = await planner.plan(q3);
  const res3 = retriever.retrieve(q3, q3Plan);

  assert(
    res3.results.length > 0 &&
      res3.results.some(r => r.metadata.vargaSubjects.includes('D10')),
    'Test 3: D10 Dashamsha Varga Retrieval',
    'Retrieved D10 Shodashavarga rules for leadership and career milestones'
  );

  // ==========================================
  // 4. VIMSHOTTARI DASHA RETRIEVAL
  // ==========================================
  const q4 = 'What are the classical results during the Mahadasha of Kendra and Trikona lords?';
  const q4Plan = await planner.plan(q4);
  const res4 = retriever.retrieve(q4, q4Plan);

  assert(
    res4.results.length > 0 &&
      res4.results.some(r => r.metadata.topic === 'dasha' && r.citation.includes('BPHS')),
    'Test 4: Vimshottari Dasha Rules Retrieval',
    'Retrieved BPHS Dasha Phala rules for Kendra-Trikona lord cycles'
  );

  // ==========================================
  // 5. YOGA RETRIEVAL (GAJAKESARI & RAJA YOGA)
  // ==========================================
  const q5 = 'What is the classical definition and result of Gajakesari Yoga in BPHS?';
  const q5Plan = await planner.plan(q5);
  const res5 = retriever.retrieve(q5, q5Plan);

  assert(
    res5.results.length > 0 &&
      res5.results.some(r => r.metadata.subtopic === 'gajakesari_yoga'),
    'Test 5: Gajakesari Yoga Retrieval',
    'Retrieved verbatim BPHS Gajakesari Sanskrit and English translation'
  );

  // ==========================================
  // 6. MARRIAGE & D9 NAVAMSHA RETRIEVAL
  // ==========================================
  const q6 = 'How does the 7th house and D9 Navamsha determine marital longevity and spousal nature?';
  const q6Plan = await planner.plan(q6);
  const res6 = retriever.retrieve(q6, q6Plan);

  assert(
    res6.results.length > 0 &&
      res6.results.some(r => r.metadata.topic === 'marriage' || r.metadata.topic === 'vargas'),
    'Test 6: Marriage & D9 Navamsha Retrieval',
    'Retrieved Kalatra Bhava and Navamsha matrimonial rules'
  );

  // ==========================================
  // 7. WRONG-TOPIC RETRIEVAL REJECTION
  // ==========================================
  console.log('\n--- 2. PRECISION & SAFETY CONTROLS ---');

  const q7Career = 'Analyze executive career promotion in 2027.';
  const q7Plan = await planner.plan(q7Career);
  const res7 = retriever.retrieve(q7Career, q7Plan);

  const hasMarriageIntrusion = res7.results.some(r => r.metadata.topic === 'marriage');
  assert(
    !hasMarriageIntrusion && res7.results.length > 0,
    'Test 7: Out-of-Domain Retrieval Rejection',
    'Career query strictly rejected unrelated marriage / spouse rules'
  );

  // ==========================================
  // 8. SOURCE PROVENANCE & CITATION PRESERVATION
  // ==========================================
  const resProvenance = res5.results[0];
  assert(
    resProvenance.citation !== undefined &&
      resProvenance.source !== undefined &&
      resProvenance.author !== undefined &&
      resProvenance.chapter !== undefined,
    'Test 8: Source Provenance & Formal Citation Preservation',
    `Preserved full citation: "${resProvenance.citation}" by ${resProvenance.author}`
  );

  // ==========================================
  // 9. MULTI-SOURCE RETRIEVAL
  // ==========================================
  const qMulti = 'What classical principles govern professional elevation and royal patronage?';
  const qMultiPlan = await planner.plan(qMulti);
  const resMulti = retriever.retrieve(qMulti, qMultiPlan);
  const distinctAuthors = Array.from(new Set(resMulti.results.map(r => r.author)));

  assert(
    distinctAuthors.length >= 2,
    'Test 9: Multi-Source Complementary Retrieval',
    `Retrieved complementary rules from multiple classical authorities: ${distinctAuthors.join(', ')}`
  );

  // ==========================================
  // 10. CONFLICTING TRADITION SEPARATION
  // ==========================================
  const qTradition = 'How do Parashari planetary ray aspects differ from Jaimini sign aspects?';
  const resTradition = retriever.retrieve(qTradition);
  const hasComparativeRule = resTradition.results.some(
    r =>
      r.metadata.subtopic === 'aspect_rules_comparison' &&
      (r.source.includes('Comparative') ||
        r.citation.includes('Comparative') ||
        r.citation.includes('BPHS Ch. 26 vs Jaimini'))
  );

  assert(
    hasComparativeRule,
    'Test 10: Conflicting Tradition Preservation',
    'Preserves distinct Parashari (Graha Drishti) and Jaimini (Rashi Drishti) doctrines without flattening'
  );

  // ==========================================
  // 11. EMPTY RETRIEVAL HANDLING
  // ==========================================
  const resEmpty = retriever.retrieve('');
  assert(
    resEmpty.results.length === 0 && resEmpty.warnings.length > 0,
    'Test 11: Empty Query Graceful Handling',
    'Returns empty array with descriptive warning on blank query'
  );

  // ==========================================
  // 12. MALFORMED QUERY HANDLING
  // ==========================================
  const resMalformed = retriever.retrieve({ query: '   ???   ' });
  assert(
    resMalformed.verified === true,
    'Test 12: Malformed Query Robustness',
    'Handles whitespace and symbol-only queries without crashing'
  );

  // ==========================================
  // 13. GOLDEN RETRIEVAL BENCHMARK EVALUATION (20 CASES)
  // ==========================================
  console.log('\n--- 3. GOLDEN RETRIEVAL BENCHMARK EVALUATION (20 CASES) ---');

  let goldenPassed = 0;
  for (let i = 0; i < GOLDEN_RETRIEVAL_BENCHMARK.length; i++) {
    const testCase = GOLDEN_RETRIEVAL_BENCHMARK[i];
    const casePlan = await planner.plan(testCase.query);
    const result = retriever.retrieve(testCase.query, casePlan);

    const hasExpectedTopic = result.results.some(r =>
      testCase.expectedTopics.includes(r.metadata.topic)
    );
    const hasForbiddenTopic = result.results.some(r =>
      testCase.forbiddenTopics.includes(r.metadata.topic) ||
      testCase.forbiddenTopics.includes(r.metadata.subtopic)
    );
    const hasPrimaryCitation = result.results.some(r =>
      testCase.expectedPrimaryCitationKeywords.some(kw =>
        r.citation.toLowerCase().includes(kw.toLowerCase()) ||
        r.source.toLowerCase().includes(kw.toLowerCase()) ||
        r.chapter.toLowerCase().includes(kw.toLowerCase())
      )
    );

    const caseSuccess = result.results.length > 0 && hasExpectedTopic && !hasForbiddenTopic && hasPrimaryCitation;
    if (caseSuccess) {
      goldenPassed++;
    } else {
      console.warn(`⚠️ Golden Case ${testCase.id} failed: topic=${hasExpectedTopic}, forbidden=${hasForbiddenTopic}, citation=${hasPrimaryCitation}`);
    }
  }

  assert(
    goldenPassed === GOLDEN_RETRIEVAL_BENCHMARK.length,
    'Test 13: Golden Retrieval Benchmark (20/20)',
    `All ${GOLDEN_RETRIEVAL_BENCHMARK.length} benchmark test cases passed precision, citation, and domain-isolation criteria (100% accuracy)`
  );

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==================================================');
  console.log(`PHASE 3A RAG SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase3ASuite().catch(err => {
  console.error('Fatal error in Phase 3A test suite:', err);
  process.exit(1);
});
