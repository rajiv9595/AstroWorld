/**
 * AI V3 Phase 1 — narration truth regression contracts.
 *
 * These cases reproduce quality defects where approved synthesis is omitted,
 * unsupported classical boilerplate is introduced, Jupiter is mistaken for a
 * transit query, and the deterministic failsafe substitutes a fixed chart.
 */

import { ResponseEvidenceSelector } from '../src/ai_v2/narrator/evidenceSelector.ts';
import { ResponsePlanner } from '../src/ai_v2/narrator/responsePlanner.ts';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function fixture(overrides: Record<string, any> = {}) {
  const plan: any = {
    questionId: 'q_ai_v3_test',
    rawQuestion: 'How does Jupiter affect my career?',
    normalizedQuestion: 'How does Jupiter affect my career?',
    intent: 'career_timing',
    domain: 'career',
    planetFocus: ['Jupiter'],
    houseFocus: [10],
    chartLayers: ['D1', 'D10'],
    temporalScope: { type: 'current' },
    targetDatesIso: [],
    priority: 1,
    ambiguities: [],
    clarificationRequired: false,
    ...overrides,
  };

  const reasoning: any = {
    questionId: plan.questionId,
    direction: 'mixed',
    strength: 'moderate',
    primaryFactors: [],
    supportingFactors: [],
    restrictingFactors: [],
    conflictingFactors: [],
    irrelevantFactors: [],
    appliedRules: [],
    confluence: {
      hasConfluence: false,
      confluenceStrength: 'moderate',
      convergingLayersCount: 0,
      layers: [],
      confluenceSummary: 'No independent confluence established.',
    },
    temporalWindows: [],
    unresolvedQuestions: [],
    evidenceLineage: ['fact_jupiter'],
    ruleLineage: [],
    sourceLineage: [],
    coverageStatus: 'complete',
    confidence: 'low',
    auditTrace: {
      questionId: plan.questionId,
      intent: plan.intent,
      domain: plan.domain,
      requiredFactsCount: 1,
      verifiedFactsCount: 1,
      applicableRulesCount: 0,
      rejectedRulesCount: 0,
      supportingFactorsCount: 1,
      restrictingFactorsCount: 0,
      conflictingFactorsCount: 0,
      hasTemporalConfluence: false,
      stepSequence: [],
      executionDurationMs: 1,
    },
    version: 'test',
    createdAtIso: '2026-10-09T00:00:00.000Z',
    verified: true,
  };

  const factualClaim: any = {
    claimId: 'claim_jupiter_fact',
    text: 'Jupiter is positioned in Pisces in the 4th house.',
    type: 'factual',
    factorType: 'natal',
    strength: 'strong',
    evidenceIds: ['fact_jupiter'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  };

  const conclusionClaim: any = {
    claimId: 'claim_synthesis_test',
    text: 'The chart supports career growth, but suggests gradual progress rather than an immediate promotion.',
    type: 'qualified_prediction',
    factorType: 'interpretation',
    strength: 'mixed',
    evidenceIds: ['fact_jupiter'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  };

  const claimSet: any = {
    status: 'approved',
    questionId: plan.questionId,
    claims: [factualClaim, conclusionClaim],
    rejectedClaims: [],
    questionCoverage: { complete: true, coveredEntities: ['Jupiter'], coveredHouses: [10], coveredDomains: ['career'], missing: [] },
    preservesContradictions: true,
    auditRecords: [],
    validatorVersion: 'test',
    createdAtIso: '2026-10-09T00:00:00.000Z',
    verified: true,
  };

  return { plan, reasoning, factualClaim, conclusionClaim, claimSet };
}

function testConclusionIsPassedToNarratorContext(): void {
  const { plan, reasoning, claimSet, conclusionClaim } = fixture();
  const selection = new ResponseEvidenceSelector().selectEvidence(plan, reasoning, claimSet);
  assert(
    selection.selectedClaimIds.includes(conclusionClaim.claimId),
    'The verified qualified-prediction / synthesis claim must not be dropped before narration.',
  );

  const responsePlan = new ResponsePlanner().planResponse(plan, reasoning, claimSet);
  assert(
    responsePlan.contextPack?.directAnswerDirection.includes('gradual progress'),
    'The narrator context must carry the actual chart-specific synthesis instead of generic direction boilerplate.',
  );
}

function testNoInventedClassicalContextWithoutApplicableRule(): void {
  const { plan, reasoning, claimSet } = fixture();
  const selection = new ResponseEvidenceSelector().selectEvidence(plan, reasoning, claimSet);
  assert(
    !selection.classicalContextSummary.toLowerCase().includes('transit activations across beneficial houses'),
    'When no verified classical rule was applied, the selector must not inject a made-up universal rule summary.',
  );
}

function testNatalJupiterQuestionIsNotAutomaticallyATransitQuestion(): void {
  const { plan, reasoning, claimSet } = fixture({
    rawQuestion: 'What does Jupiter mean in my natal chart?',
    normalizedQuestion: 'What does Jupiter mean in my natal chart?',
    intent: 'planet_question',
    domain: 'astrological',
    houseFocus: [],
    chartLayers: ['D1'],
    temporalScope: { type: 'natal' },
  });
  const responsePlan = new ResponsePlanner().planResponse(plan, reasoning, claimSet);
  assert(
    responsePlan.contextPack?.transitFocus === undefined,
    'Mentioning Jupiter alone must not create a transit focus or imply a transit was calculated.',
  );
}

function testLowReasoningConfidenceProducesHighUncertainty(): void {
  const { plan, reasoning, claimSet } = fixture();
  reasoning.confidence = 'low';
  const responsePlan = new ResponsePlanner().planResponse(plan, reasoning, claimSet);
  assert(
    responsePlan.contextPack?.uncertaintyLevel === 'high',
    'Low reasoning confidence must map to high uncertainty, not moderate uncertainty.',
  );
}

function testDeterministicFallbackUsesTheSuppliedChartInsteadOfAFixedOne(): void {
  const { plan, claimSet } = fixture({
    rawQuestion: 'My D10 Lagna is Leo, correct?',
    normalizedQuestion: 'My D10 Lagna is Leo, correct?',
    intent: 'general_chart_question',
    domain: 'career',
    planetFocus: [],
    houseFocus: [],
    chartLayers: ['D10'],
    temporalScope: { type: 'natal' },
  });

  claimSet.claims = [{
    claimId: 'claim_d10_lagna',
    text: 'The D10 Lagna is Scorpio.',
    type: 'factual',
    factorType: 'varga',
    strength: 'strong',
    evidenceIds: ['fact_d10_lagna'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  }];

  const responsePlan: any = {
    responseId: 'resp_ai_v3_test',
    questionId: plan.questionId,
    responseType: 'simple_fact',
    answerFirst: true,
    requestedDepth: 'concise',
    tone: 'warm_direct',
    sections: [],
    claimIdsPerSection: {},
    timingClaims: [],
    restrictions: [],
    unansweredParts: [],
    responseVersion: 'test',
    createdAtIso: '2026-10-09T00:00:00.000Z',
  };

  const narrator = new GeminiNarrator({ forceMockMode: true });
  const text = narrator.synthesizeDeterministicNarrative(plan, responsePlan, claimSet);
  assert(text.toLowerCase().includes('scorpio'), 'Fallback should use the verified D10 Lagna supplied by this chart.');
  assert(!text.toLowerCase().includes('taurus'), 'Fallback must not substitute the benchmark chart’s fixed D10 Lagna.');
}

function main(): void {
  testConclusionIsPassedToNarratorContext();
  testNoInventedClassicalContextWithoutApplicableRule();
  testNatalJupiterQuestionIsNotAutomaticallyATransitQuestion();
  testLowReasoningConfidenceProducesHighUncertainty();
  testDeterministicFallbackUsesTheSuppliedChartInsteadOfAFixedOne();
  console.log('AI V3 NARRATION INTEGRITY: PASS (5 contracts)');
}

try {
  main();
} catch (error) {
  console.error('AI V3 NARRATION INTEGRITY: FAIL');
  console.error(error);
  process.exitCode = 1;
}
