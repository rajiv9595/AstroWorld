/**
 * ASTROWORLD AI V2 — Phase 3C Claim Validation & Grounding Firewall Verification Suite
 * Verifies Candidate Claim Generation, Factual Grounding, Temporal Boundaries,
 * Rule Lineage Enforcement, Certainty Controls, Relevance/Drift Firewalls,
 * Contradiction Preservation, Question Coverage, and the 50-Case Golden Claim Benchmark.
 */

import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../src/ai_v2/orchestrator/toolOrchestrator.ts';
import { ClassicalRAGRetriever } from '../src/ai_v2/rag/retriever.ts';
import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { ClaimSetGenerator } from '../src/ai_v2/claims/claimGenerator.ts';
import { GroundingFirewall } from '../src/ai_v2/claims/groundingFirewall.ts';
import { GOLDEN_CLAIM_BENCHMARK } from '../src/ai_v2/claims/goldenClaimSet.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';
import { validateApprovedClaimSet } from '../src/ai_v2/schemas/claimPacket.ts';

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

async function runPhase3CSuite() {
  console.log('\n🛡️ Starting AstroWorld AI V2 Phase 3C Claim Validation & Grounding Firewall Verification Suite...\n');

  const planner = new QuestionPlanner();
  const orchestrator = new ToolExecutionOrchestrator();
  const retriever = new ClassicalRAGRetriever();
  const reasoner = new AstrologyReasoner();
  const claimGen = new ClaimSetGenerator();
  const firewall = new GroundingFirewall();

  // Baseline Setup for Pipeline
  const qCareer = 'How does my 10th house and D10 Dashamsha support my career promotion in 2027?';
  const planCareer = await planner.plan(qCareer);
  const evidenceCareer = await orchestrator.orchestrate(planCareer, SAMPLE_PROFILE);
  const ragCareer = retriever.retrieve(qCareer, planCareer, evidenceCareer);
  const reasoningCareer = reasoner.reason(planCareer, evidenceCareer, ragCareer);

  // ==========================================
  // 1. CANDIDATE CLAIM GENERATION (STEP 1 & 2)
  // ==========================================
  console.log('--- 1. CANDIDATE CLAIM GENERATION ---');

  const candidateClaims = claimGen.generateClaims(planCareer, reasoningCareer, evidenceCareer);

  const hasFactual = candidateClaims.some(c => c.type === 'factual' && c.evidenceIds.length > 0);
  const hasInterpretive = candidateClaims.some(c => c.type === 'interpretive' && c.ruleIds.length > 0);
  const hasTiming = candidateClaims.some(c => c.type === 'timing' && c.temporalScope !== undefined);
  const hasSynthesis = candidateClaims.some(c => c.type === 'qualified_prediction');

  assert(
    candidateClaims.length >= 4 && hasFactual && hasInterpretive && hasTiming && hasSynthesis,
    'Step 1 & 2: Structured Candidate Claim Generation',
    `Generated ${candidateClaims.length} structured candidate claims with explicit types (factual, interpretive, timing, qualified_prediction)`
  );

  // ==========================================
  // 2. FACTUAL GROUNDING & INVENTION DEFENSE (STEP 3 & 5)
  // ==========================================
  console.log('\n--- 2. FACTUAL GROUNDING & ASTROLOGICAL INVENTION FIREWALL ---');

  const approvedSet = firewall.validate(candidateClaims, planCareer, reasoningCareer, evidenceCareer);

  assert(
    approvedSet.claims.length > 0 && approvedSet.claims.every(c => c.allowed),
    'Step 3: Canonical Factual Grounding Approval',
    `Approved ${approvedSet.claims.length} validly grounded claims with verified chart evidence lineage`
  );

  // Test Fabricated Entity Rejection
  const fakeEntityClaim = {
    claimId: 'claim_fake_neptune',
    text: 'Neptune in the 10th house creates executive confusion.',
    type: 'factual' as const,
    strength: 'moderate' as const,
    evidenceIds: ['fact_neptune_1'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high' as const,
    allowed: true,
    astrologicalEntities: ['Neptune'],
  };

  const fakeSet = firewall.validate([fakeEntityClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    fakeSet.rejectedClaims.length === 1 &&
      Boolean(fakeSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Unverified astrological entity'))),
    'Step 5: Astrological Invention Firewall Rejection',
    'Strictly rejected unverified planet (Neptune) absent from canonical Vedic ephemeris'
  );

  // ==========================================
  // 3. TEMPORAL BOUNDARIES & DATE FABRICATION DEFENSE (STEP 4)
  // ==========================================
  console.log('\n--- 3. TEMPORAL GROUNDING & NO DATE FABRICATION ---');

  const fakeDateClaim = {
    claimId: 'claim_fake_date',
    text: 'Your promotion will occur on July 17, 2027 at 2:00 PM.',
    type: 'timing' as const,
    strength: 'strong' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: [],
    sourceIds: [],
    temporalScope: { startIso: '2027-07-17T14:00:00.000Z', endIso: '2027-07-17T14:00:00.000Z' },
    relevance: 'high' as const,
    allowed: true,
  };

  const dateSet = firewall.validate([fakeDateClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    dateSet.rejectedClaims.length === 1 &&
      Boolean(dateSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Fabricated specific event date'))),
    'Step 4: Temporal Date Fabrication Rejection',
    'Strictly rejected fabricated specific event date ("July 17, 2027") not calculated by ephemeris engine'
  );

  // ==========================================
  // 4. LINEAGE & PROVENANCE VERIFICATION (STEP 6)
  // ==========================================
  console.log('\n--- 4. LINEAGE & SOURCE PROVENANCE ENFORCEMENT ---');

  const noLineageClaim = {
    claimId: 'claim_no_lin',
    text: 'You will rise to power and high authority in society.',
    type: 'interpretive' as const,
    strength: 'strong' as const,
    evidenceIds: [],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high' as const,
    allowed: true,
  };

  const linSet = firewall.validate([noLineageClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    linSet.rejectedClaims.length === 1 &&
      Boolean(linSet.rejectedClaims[0].failedChecks?.some(f => f.includes('missing required evidence or rule lineage'))),
    'Step 6: Missing Lineage Firewall Rejection',
    'Strictly rejected interpretive claim lacking evidence and rule lineage IDs'
  );

  // Additional strict lineage checks introduced in AI V2 firewall-2.
  const fakeRuleClaim = {
    claimId: 'claim_fake_rule',
    text: 'A verified career rule supports promotion.',
    type: 'interpretive' as const,
    strength: 'moderate' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: ['rule_that_was_not_applied'],
    sourceIds: ['source_that_was_not_verified'],
    relevance: 'high' as const,
    allowed: true,
  };
  const fakeRuleSet = firewall.validate([fakeRuleClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    fakeRuleSet.rejectedClaims.length === 1 &&
      fakeRuleSet.rejectedClaims[0].failedChecks?.some(f => f.includes('rules that were not applied')) === true &&
      fakeRuleSet.rejectedClaims[0].failedChecks?.some(f => f.includes('unverified source IDs')) === true,
    'AI V2 Firewall-2: Rule/Source Lineage Rejection',
    'Rejected claims that cite rule or source IDs not present in the applied reasoning lineage'
  );

  const substringEntityClaim = {
    claimId: 'claim_substring_entity',
    text: 'Moonlight is a verified astrological factor in the chart.',
    type: 'factual' as const,
    strength: 'moderate' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high' as const,
    allowed: true,
    astrologicalEntities: ['Moonlight'],
  };
  const substringSet = firewall.validate([substringEntityClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    substringSet.rejectedClaims.length === 1 &&
      substringSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Unverified astrological entity')) === true,
    'AI V2 Firewall-2: Exact Entity Grounding',
    'Rejected entity names that only partially match a verified planet'
  );

  // ==========================================
  // 5. CERTAINTY CONTROL FIREWALL (STEP 7)
  // ==========================================
  console.log('\n--- 5. CERTAINTY CONTROL & FATALISM DEFENSE ---');

  const guaranteedClaim = {
    claimId: 'claim_guaranteed',
    text: 'A promotion is guaranteed to happen in April 2027.',
    type: 'qualified_prediction' as const,
    strength: 'strong' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: ['bphs_rule_1'],
    sourceIds: ['bphs_source_1'],
    relevance: 'high' as const,
    allowed: true,
  };

  const certSet = firewall.validate([guaranteedClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    certSet.rejectedClaims.length === 1 &&
      Boolean(certSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Unsupported fatalistic certainty language'))),
    'Step 7: Fatalistic Certainty Language Rejection',
    'Strictly blocked forbidden certainty term ("guaranteed") in astrological prediction'
  );

  // ==========================================
  // 6. QUESTION COVERAGE (STEP 8)
  // ==========================================
  console.log('\n--- 6. QUESTION COVERAGE VERIFICATION ---');

  assert(
    approvedSet.questionCoverage.complete === true,
    'Step 8: Comprehensive Question Coverage',
    `Approved claim set satisfies required question focus (entities: ${approvedSet.questionCoverage.coveredEntities.join(', ') || 'N/A'}, domain: ${approvedSet.questionCoverage.coveredDomains.join(', ')})`
  );

  // ==========================================
  // 7. RELEVANCE & DOMAIN DRIFT FIREWALL (STEP 9 & 10)
  // ==========================================
  console.log('\n--- 7. RELEVANCE & DOMAIN DRIFT FIREWALL ---');

  const driftClaim = {
    claimId: 'claim_drift_marriage',
    text: 'Your future marriage partner will possess attractive physical appearance and wealthy family.',
    type: 'interpretive' as const,
    strength: 'moderate' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: ['bphs_rule_1'],
    sourceIds: ['bphs_source_1'],
    relevance: 'irrelevant' as const,
    allowed: true,
  };

  const driftSet = firewall.validate([driftClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    driftSet.rejectedClaims.length === 1 &&
      Boolean(driftSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Relevance drift'))),
    'Step 9 & 10: Cross-Domain Drift Firewall Rejection',
    'Strictly rejected unrelated marriage claim injected into professional career inquiry'
  );

  // ==========================================
  // 8. CONTRADICTION PRESERVATION & UNSUPPORTED STATE (STEP 11 & 12)
  // ==========================================
  console.log('\n--- 8. CONTRADICTION PRESERVATION & UNSUPPORTED STATE ---');

  assert(
    approvedSet.preservesContradictions === true,
    'Step 11: Contradiction & Restriction Preservation',
    'Maintains structural restrictions without flattening mixed evidence'
  );

  // Test Insufficient Evidence Handling
  const qAmbiguous = 'Will Jupiter help me?';
  const planAmbiguous = await planner.plan(qAmbiguous);
  const evidenceAmbiguous = await orchestrator.orchestrate(planAmbiguous, SAMPLE_PROFILE);
  const ragAmbiguous = retriever.retrieve(qAmbiguous, planAmbiguous, evidenceAmbiguous);
  const reasoningAmbiguous = reasoner.reason(planAmbiguous, evidenceAmbiguous, ragAmbiguous);
  const candidateAmbiguous = claimGen.generateClaims(planAmbiguous, reasoningAmbiguous, evidenceAmbiguous);
  const approvedAmbiguous = firewall.validate(candidateAmbiguous, planAmbiguous, reasoningAmbiguous, evidenceAmbiguous);

  assert(
    approvedAmbiguous.status === 'insufficient_evidence' &&
      approvedAmbiguous.claims.some(c => c.strength === 'insufficient'),
    'Step 12: Insufficient Evidence State Safe Handling',
    'Ambiguous inquiry safely yielded unconfident explanatory claim without predictive overreach'
  );

  // ==========================================
  // 9. REMEDY FIREWALL (STEP 13)
  // ==========================================
  console.log('\n--- 9. REMEDY FIREWALL ---');

  const remedyClaim = {
    claimId: 'claim_gemstone',
    text: 'You must wear a 5-carat blue sapphire on your middle finger.',
    type: 'interpretive' as const,
    strength: 'strong' as const,
    evidenceIds: [evidenceCareer.facts[0]?.id || 'fact_dasha_1'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high' as const,
    allowed: true,
  };

  const remSet = firewall.validate([remedyClaim], planCareer, reasoningCareer, evidenceCareer);
  assert(
    remSet.rejectedClaims.length === 1 &&
      Boolean(remSet.rejectedClaims[0].failedChecks?.some(f => f.includes('Unsupported remedy'))),
    'Step 13: Unsupported Remedy Firewall Rejection',
    'Blocked commercial gemstone prescription lacking classical rule citation'
  );

  // ==========================================
  // 10. CLAIM AUDIT RECORDS & SCHEMA INTEGRITY (STEP 14, 17, 18)
  // ==========================================
  console.log('\n--- 10. CLAIM AUDIT & STRICT SCHEMA VALIDATION ---');

  const validation = validateApprovedClaimSet(approvedSet);

  assert(
    validation.valid === true &&
      approvedSet.auditRecords.length === candidateClaims.length &&
      approvedSet.auditRecords.every(r => r.timestampIso !== undefined),
    'Step 14 & 17: Auditable ApprovedClaimSet & Schema Integrity',
    `Generated ${approvedSet.auditRecords.length} audit records adhering strictly to ApprovedClaimSet schema`
  );

  // ==========================================
  // 11. GOLDEN CLAIM VALIDATION BENCHMARK (50 CASES) (STEP 15 & 16)
  // ==========================================
  console.log('\n--- 11. GOLDEN CLAIM VALIDATION BENCHMARK (50 CASES) ---');

  let benchmarkPassed = 0;

  // Prepare Mock Context for Benchmark Cases
  const mockEvidence = {
    ...evidenceCareer,
    facts: [
      ...evidenceCareer.facts,
      { id: 'fact_saturn_1', category: 'natal' as const, entity: 'Saturn', property: 'position', value: 'Capricorn 15.2°', sign: 'Capricorn', house: 10, sourceTool: 'get_birth_chart', verified: true },
      { id: 'fact_jupiter_transit_1', category: 'transit' as const, entity: 'Jupiter', property: 'position', value: 'Taurus 12°', sign: 'Taurus', house: 5, sourceTool: 'get_transits', verified: true },
      { id: 'fact_d10_sun_1', category: 'varga' as const, entity: 'Sun in D10', property: 'varga_sign', value: 'Leo (House 10)', sign: 'Leo', house: 10, sourceTool: 'get_divisional_chart', verified: true },
      { id: 'fact_d9_venus_1', category: 'varga' as const, entity: 'Venus in D9', property: 'varga_sign', value: 'Pisces (House 7)', sign: 'Pisces', house: 7, sourceTool: 'get_divisional_chart', verified: true },
      { id: 'fact_moon_1', category: 'natal' as const, entity: 'Moon', property: 'position', value: 'Sagittarius 0.5°', sign: 'Sagittarius', house: 9, sourceTool: 'get_birth_chart', verified: true },
      { id: 'fact_dasha_1', category: 'dasha' as const, entity: 'Vimshottari Dasha', property: 'active_periods', value: 'Jupiter - Saturn', sourceTool: 'get_current_dasha', verified: true },
      { id: 'fact_transit_1', category: 'transit' as const, entity: 'Gochara Transits', property: 'active_transits', value: 'Jupiter in Taurus', sourceTool: 'get_transits', verified: true },
      { id: 'fact_ak_1', category: 'jaimini' as const, entity: 'Atmakaraka (AK)', property: 'graha', value: 'Sun', sourceTool: 'get_jaimini_details', verified: true },
    ],
  };

  const mockReasoning = {
    ...reasoningCareer,
    appliedRules: [
      ...reasoningCareer.appliedRules,
      {
        ruleId: 'bphs_career_10th_general',
        sourceId: 'bphs_ch24_110',
        sourceText: 'BPHS Ch. 24',
        citation: 'BPHS Ch. 24 Sloka 110',
        tradition: 'parashari' as const,
        ruleType: 'placement' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified 10th house'],
        evidenceIds: ['fact_saturn_1'],
        interpretationSummary: '10th house strength brings career elevation.',
      },
      {
        ruleId: 'phaladeepika_gochara_jup_5th',
        sourceId: 'phala_ch26_15',
        sourceText: 'Phaladeepika Ch. 26',
        citation: 'Phaladeepika Ch. 26 Sloka 15',
        tradition: 'parashari' as const,
        ruleType: 'transit' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified transit'],
        evidenceIds: ['fact_jupiter_transit_1'],
        interpretationSummary: 'Jupiter transit confers intellectual expansion.',
      },
      {
        ruleId: 'saravali_d10_principles',
        sourceId: 'saravali_ch3',
        sourceText: 'Saravali Ch. 3',
        citation: 'Saravali Ch. 3',
        tradition: 'parashari' as const,
        ruleType: 'varga' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified D10'],
        evidenceIds: ['fact_d10_sun_1'],
        interpretationSummary: 'D10 planets govern executive status.',
      },
      {
        ruleId: 'jaimini_atmakaraka_foundations',
        sourceId: 'jaimini_1_1_11',
        sourceText: 'Jaimini Sutras 1.1.11',
        citation: 'Jaimini Sutras 1.1.11',
        tradition: 'jaimini' as const,
        ruleType: 'jaimini' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified AK'],
        evidenceIds: ['fact_ak_1'],
        interpretationSummary: 'Atmakaraka signifies the spiritual soul driver.',
      },
      {
        ruleId: 'bphs_rule_1',
        sourceId: 'bphs_source_1',
        sourceText: 'BPHS Rule 1',
        citation: 'BPHS Rule 1',
        tradition: 'parashari' as const,
        ruleType: 'placement' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified'],
        evidenceIds: ['fact_saturn_1'],
        interpretationSummary: 'BPHS foundational governance.',
      },
      {
        ruleId: 'phala_rule_1',
        sourceId: 'phala_ch26',
        sourceText: 'Phala Rule 1',
        citation: 'Phaladeepika Ch. 26',
        tradition: 'parashari' as const,
        ruleType: 'transit' as const,
        applicabilityStatus: 'applied' as const,
        satisfiedPrerequisites: ['Verified'],
        evidenceIds: ['fact_transit_1'],
        interpretationSummary: 'Phaladeepika transit governance.',
      },
    ],
  };

  for (let i = 0; i < GOLDEN_CLAIM_BENCHMARK.length; i++) {
    const testCase = GOLDEN_CLAIM_BENCHMARK[i];
    const casePlan = await planner.plan(testCase.query);
    const caseReasoning = casePlan.clarificationRequired
      ? { ...mockReasoning, direction: 'insufficient_evidence' as const, coverageStatus: 'insufficient_evidence' as const }
      : mockReasoning;
    const caseResult = firewall.validate([testCase.candidateClaim], casePlan, caseReasoning as any, mockEvidence);

    const actualAllowed = caseResult.claims.length === 1 && caseResult.rejectedClaims.length === 0;
    const allowedMatches = actualAllowed === testCase.expectedAllowed;

    let keywordMatches = true;
    if (!testCase.expectedAllowed && testCase.expectedFailedCheckKeyword) {
      const failedChecks = caseResult.rejectedClaims[0]?.failedChecks || [];
      keywordMatches = failedChecks.some(fc =>
        fc.toLowerCase().includes(testCase.expectedFailedCheckKeyword!.toLowerCase())
      );
    }

    if (allowedMatches && keywordMatches) {
      benchmarkPassed++;
    } else {
      console.warn(
        `⚠️ Benchmark Case ${testCase.id} failed: expectedAllowed=${testCase.expectedAllowed}, actualAllowed=${actualAllowed}, keywordMatches=${keywordMatches}`
      );
    }
  }

  assert(
    benchmarkPassed === GOLDEN_CLAIM_BENCHMARK.length,
    `Step 15 & 16: Golden Claim Validation Benchmark (50/50)`,
    `All ${GOLDEN_CLAIM_BENCHMARK.length} benchmark test cases passed factual, temporal, lineage, certainty, and safety firewall criteria (100% accuracy)`
  );

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==================================================');
  console.log(`PHASE 3C CLAIM FIREWALL SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase3CSuite().catch(err => {
  console.error('Fatal error in Phase 3C Claim Firewall test suite:', err);
  process.exit(1);
});
