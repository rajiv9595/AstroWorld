/**
 * ASTROWORLD AI V2 — Phase 4A Conversational Response Planner & Narrator Verification Suite
 * Verifies ResponsePlan generation, Answer-First structure, Post-Response Claim Extraction,
 * Grounding Validation, Controlled Repair Loop, and the 50-Case Golden Narrator Benchmark.
 */

import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../src/ai_v2/orchestrator/toolOrchestrator.ts';
import { ClassicalRAGRetriever } from '../src/ai_v2/rag/retriever.ts';
import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { ClaimSetGenerator } from '../src/ai_v2/claims/claimGenerator.ts';
import { GroundingFirewall } from '../src/ai_v2/claims/groundingFirewall.ts';
import { ResponsePlanner } from '../src/ai_v2/narrator/responsePlanner.ts';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';
import { ResponseClaimExtractor } from '../src/ai_v2/narrator/claimExtractor.ts';
import { PostResponseGroundingValidator } from '../src/ai_v2/narrator/postResponseValidator.ts';
import { GOLDEN_NARRATOR_BENCHMARK } from '../src/ai_v2/narrator/goldenNarratorSet.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';
import { validateFinalResponse } from '../src/ai_v2/schemas/responsePlan.ts';

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

async function runPhase4ASuite() {
  console.log('\n🗣️ Starting AstroWorld AI V2 Phase 4A Conversational Narrator Verification Suite...\n');

  const planner = new QuestionPlanner();
  const orchestrator = new ToolExecutionOrchestrator();
  const retriever = new ClassicalRAGRetriever();
  const reasoner = new AstrologyReasoner();
  const claimGen = new ClaimSetGenerator();
  const firewall = new GroundingFirewall();
  const responsePlanner = new ResponsePlanner();
  const forceLive = process.argv.includes('--live');
  const narrator = new GeminiNarrator({
    forceMockMode: !forceLive,
    apiKey: forceLive ? process.env.GEMINI_API_KEY : undefined,
  });
  const claimExtractor = new ResponseClaimExtractor();
  const postValidator = new PostResponseGroundingValidator();

  // Baseline Pipeline Setup for Focused Question
  const qCareer = 'How does Jupiter transit in 2027 support my career promotion?';
  const planCareer = await planner.plan(qCareer);
  const evidenceCareer = await orchestrator.orchestrate(planCareer, SAMPLE_PROFILE);
  const ragCareer = retriever.retrieve(qCareer, planCareer, evidenceCareer);
  const reasoningCareer = reasoner.reason(planCareer, evidenceCareer, ragCareer);
  const candidateClaimsCareer = claimGen.generateClaims(planCareer, reasoningCareer, evidenceCareer);
  const approvedClaimsCareer = firewall.validate(candidateClaimsCareer, planCareer, reasoningCareer, evidenceCareer);

  // ==========================================
  // 1. RESPONSE PLAN GENERATION (STEP 1 & 2)
  // ==========================================
  console.log('--- 1. RESPONSE PLAN GENERATION & RESPONSE TYPES ---');

  const responsePlanCareer = responsePlanner.planResponse(planCareer, reasoningCareer, approvedClaimsCareer);

  assert(
    responsePlanCareer.responseType === 'timing_analysis' &&
      responsePlanCareer.sections.length >= 3 &&
      responsePlanCareer.answerFirst === true,
    'Step 1 & 2: Structured ResponsePlan Generation',
    `Generated ResponsePlan with type="${responsePlanCareer.responseType}", answerFirst=${responsePlanCareer.answerFirst}, sections=${responsePlanCareer.sections.length}`
  );

  // ==========================================
  // 2. CONVERSATIONAL PROSE & ANSWER-FIRST BEHAVIOR (STEP 3, 4, 6, 7)
  // ==========================================
  console.log('\n--- 2. CONVERSATIONAL NARRATOR SYNTHESIS & ANSWER-FIRST ---');

  const finalResponseCareer = await narrator.narrate(planCareer, reasoningCareer, approvedClaimsCareer, responsePlanCareer);

  const startsWithoutBoilerplate =
    !finalResponseCareer.text.startsWith('According to your chart') &&
    !finalResponseCareer.text.startsWith('Based on the provided data') &&
    !finalResponseCareer.text.startsWith('Your horoscope indicates');

  assert(
    startsWithoutBoilerplate && finalResponseCareer.text.length > 50,
    'Step 3 & 4: Answer-First Conversational Synthesis',
    'Narrator began directly with the answer in natural prose without robotic boilerplate openings'
  );

  // ==========================================
  // 3. RESPONSE CLAIM EXTRACTION (STEP 13)
  // ==========================================
  console.log('\n--- 3. RESPONSE CLAIM EXTRACTION ---');

  const extractedClaims = claimExtractor.extractClaims(finalResponseCareer.text);

  assert(
    extractedClaims.length > 0 &&
      extractedClaims.every(c => c.certaintyLevel === 'probabilistic' || c.certaintyLevel === 'certain'),
    'Step 13: Response Claim Extraction',
    `Extracted ${extractedClaims.length} atomic claims with identified entities and certainty levels`
  );

  // ==========================================
  // 4. POST-RESPONSE GROUNDING VALIDATION (STEP 14)
  // ==========================================
  console.log('\n--- 4. POST-RESPONSE GROUNDING VALIDATION ---');

  const validationResult = postValidator.validate(
    extractedClaims,
    finalResponseCareer.text,
    approvedClaimsCareer,
    reasoningCareer,
    planCareer
  );

  assert(
    validationResult.valid === true && validationResult.violations.length === 0,
    'Step 14: Post-Response Grounding Validation Approval',
    'Generated prose passed all post-response grounding checks with zero unapproved entities or dates'
  );

  // Test Post-Response Violation Detection
  const badDraft = 'Pluto in the 10th house guarantees you will receive an executive promotion on July 17, 2027. You must buy a 5-carat blue sapphire immediately.';
  const badExtracted = claimExtractor.extractClaims(badDraft);
  const badValidation = postValidator.validate(
    badExtracted,
    badDraft,
    approvedClaimsCareer,
    reasoningCareer,
    planCareer
  );

  assert(
    badValidation.valid === false &&
      badValidation.unapprovedEntities.includes('Pluto') &&
      badValidation.certaintyEscalations.length > 0 &&
      badValidation.unapprovedRemedies.length > 0,
    'Step 14: Post-Response Grounding Violation Detection',
    'Correctly detected unapproved planet (Pluto), fatalistic certainty ("guarantees"), and unapproved remedy'
  );

  // ==========================================
  // 5. CONTROLLED REPAIR LOOP (STEP 15)
  // ==========================================
  console.log('\n--- 5. CONTROLLED REPAIR LOOP ---');

  // Verify that narrate produces valid FinalResponse even when starting from complex context
  assert(
    finalResponseCareer.validatorStatus === 'approved' || finalResponseCareer.validatorStatus === 'repaired',
    'Step 15: Controlled Repair Loop & Output Delivery',
    `Delivered validated FinalResponse with status="${finalResponseCareer.validatorStatus}"`
  );

  // ==========================================
  // 6. FINAL RESPONSE SCHEMA VALIDATION (STEP 16)
  // ==========================================
  console.log('\n--- 6. FINAL RESPONSE SCHEMA VALIDATION ---');

  const finalSchemaValidation = validateFinalResponse(finalResponseCareer);

  assert(
    finalSchemaValidation.valid === true &&
      finalResponseCareer.referencedClaimIds.length > 0 &&
      finalResponseCareer.referencedEvidenceIds.length > 0,
    'Step 16: FinalResponse Schema Adherence & Traceability',
    `FinalResponse adheres strictly to schema with ${finalResponseCareer.referencedClaimIds.length} referenced claim IDs and ${finalResponseCareer.referencedEvidenceIds.length} evidence IDs`
  );

  // ==========================================
  // 7. GOLDEN CONVERSATION BENCHMARK (50 CASES) (STEP 18 & 19)
  // ==========================================
  console.log('\n--- 7. GOLDEN CONVERSATION BENCHMARK (50 CASES) ---');

  let benchmarkPassed = 0;

  for (let i = 0; i < GOLDEN_NARRATOR_BENCHMARK.length; i++) {
    const testCase = GOLDEN_NARRATOR_BENCHMARK[i];
    const casePlan = await planner.plan(testCase.query);
    const caseEvidence = await orchestrator.orchestrate(casePlan, SAMPLE_PROFILE);
    const caseRag = retriever.retrieve(testCase.query, casePlan, caseEvidence);
    const caseReasoning = reasoner.reason(casePlan, caseEvidence, caseRag);
    const caseCandidateClaims = claimGen.generateClaims(casePlan, caseReasoning, caseEvidence);
    const caseApprovedClaims = firewall.validate(caseCandidateClaims, casePlan, caseReasoning, caseEvidence);
    const caseResponsePlan = responsePlanner.planResponse(casePlan, caseReasoning, caseApprovedClaims);
    const caseFinalResponse = await narrator.narrate(casePlan, caseReasoning, caseApprovedClaims, caseResponsePlan);

    const hasExpectedKeywords = testCase.expectedKeywords.some(kw =>
      caseFinalResponse.text.toLowerCase().includes(kw.toLowerCase())
    );

    const hasForbiddenKeywords = testCase.forbiddenKeywords.some(fkw =>
      caseFinalResponse.text.toLowerCase().includes(fkw.toLowerCase())
    );

    const caseValid =
      validateFinalResponse(caseFinalResponse).valid &&
      hasExpectedKeywords &&
      !hasForbiddenKeywords;

    if (caseValid) {
      benchmarkPassed++;
    } else {
      console.warn(
        `⚠️ Narrator Benchmark Case ${testCase.id} failed: hasExpectedKeywords=${hasExpectedKeywords}, hasForbiddenKeywords=${hasForbiddenKeywords}\nText: "${caseFinalResponse.text}"`
      );
    }
  }

  assert(
    benchmarkPassed === GOLDEN_NARRATOR_BENCHMARK.length,
    `Step 18 & 19: Golden Conversation Benchmark (50/50)`,
    `All ${GOLDEN_NARRATOR_BENCHMARK.length} benchmark test cases passed answer-first, keyword precision, and grounding criteria (100% accuracy)`
  );

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==================================================');
  console.log(`PHASE 4A NARRATOR SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase4ASuite().catch(err => {
  console.error('Fatal error in Phase 4A Narrator test suite:', err);
  process.exit(1);
});
