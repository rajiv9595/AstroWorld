/**
 * AI V3 Phase 4 — answer-quality contracts for compound questions.
 *
 * Verifies coverage across secondary domains, claim-budget allocation, and
 * narrator instructions to answer every requested facet without losing the
 * grounded direct conclusion.
 */

import { GroundingFirewall } from '../src/ai_v2/claims/groundingFirewall.ts';
import { ResponseEvidenceSelector } from '../src/ai_v2/narrator/evidenceSelector.ts';
import { ResponsePlanner } from '../src/ai_v2/narrator/responsePlanner.ts';
import { buildNarratorUserPrompt } from '../src/ai_v2/narrator/narratorPrompt.ts';
import { QuestionPlan } from '../src/ai_v2/schemas/questionPlan.ts';
import { EvidencePacket, FactItem } from '../src/ai_v2/schemas/evidencePacket.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const plan: QuestionPlan = {
  questionId: 'q_ai_v3_answer_quality',
  rawQuestion: 'Will my career improve and income rise between 2027 and 2029?',
  normalizedQuestion: 'Will my career improve and income rise between 2027 and 2029?',
  intent: 'career_timing',
  domain: 'career',
  secondaryDomains: ['finance'],
  planetFocus: [],
  houseFocus: [10],
  chartLayers: ['D1', 'D10'],
  temporalScope: {
    type: 'date_range',
    startIso: '2027-01-01T00:00:00.000Z',
    endIso: '2029-12-31T23:59:59.999Z',
  },
  targetDatesIso: ['2027-06-15T00:00:00.000Z', '2029-06-15T00:00:00.000Z'],
  requiredTools: [],
  priority: 1,
  ambiguities: [],
  clarificationRequired: false,
  version: 'test',
  createdAtIso: '2026-10-10T00:00:00.000Z',
};

const facts: FactItem[] = [
  {
    id: 'fact_career_synthesis',
    category: 'natal',
    entity: 'Saturn',
    property: 'position',
    value: 'Saturn supports sustained career development',
    sign: 'Aquarius',
    house: 10,
    sourceTool: 'get_birth_chart',
    verified: true,
  },
  {
    id: 'fact_d10_1',
    category: 'varga',
    entity: 'Sun in D10',
    property: 'position',
    value: 'Sun supports public authority',
    sign: 'Leo',
    house: 10,
    sourceTool: 'get_divisional_chart',
    verified: true,
  },
  {
    id: 'fact_d10_2',
    category: 'varga',
    entity: 'Saturn in D10',
    property: 'position',
    value: 'Saturn in D10',
    sign: 'Capricorn',
    house: 10,
    sourceTool: 'get_divisional_chart',
    verified: true,
  },
  {
    id: 'fact_d10_3',
    category: 'varga',
    entity: 'Mars in D10',
    property: 'position',
    value: 'Mars in D10',
    sign: 'Aries',
    house: 10,
    sourceTool: 'get_divisional_chart',
    verified: true,
  },
  {
    id: 'fact_sav_income',
    category: 'ashtakavarga',
    entity: 'Ashtakavarga House 11',
    property: 'bindu_score',
    value: 34,
    house: 11,
    sourceTool: 'get_ashtakavarga',
    verified: true,
  },
];

const evidence: EvidencePacket = {
  version: 'test',
  createdAtIso: '2026-10-10T00:00:00.000Z',
  question: { raw: plan.rawQuestion, normalized: plan.normalizedQuestion, intent: plan.intent, domain: plan.domain },
  plan,
  facts,
  derivedFacts: [],
  toolResults: [],
  provenance: [],
  warnings: [],
  missingEvidence: [],
  executionMetrics: { totalDurationMs: 0, toolsExecutedCount: facts.length, parallelBatchesCount: 1 },
  verified: true,
};

const claims: any[] = [
  {
    claimId: 'claim_direct_synthesis',
    text: 'The chart supports career development, although discipline and patience remain important.',
    type: 'qualified_prediction',
    factorType: 'interpretation',
    strength: 'mixed',
    evidenceIds: ['fact_career_synthesis'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  },
  {
    claimId: 'claim_d10_sun',
    text: 'The D10 career picture highlights leadership and public responsibility.',
    type: 'factual',
    factorType: 'varga',
    strength: 'strong',
    evidenceIds: ['fact_d10_1'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  },
  {
    claimId: 'claim_d10_saturn',
    text: 'A second career indicator in D10 reinforces consistency and sustained work.',
    type: 'factual',
    factorType: 'varga',
    strength: 'strong',
    evidenceIds: ['fact_d10_2'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  },
  {
    claimId: 'claim_d10_mars',
    text: 'Career execution is another visible theme in D10.',
    type: 'factual',
    factorType: 'varga',
    strength: 'strong',
    evidenceIds: ['fact_d10_3'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  },
  {
    claimId: 'claim_income_sav',
    text: 'For finances, the verified 11th-house Ashtakavarga score is 34, adding context for income and savings.',
    type: 'factual',
    factorType: 'confluence',
    strength: 'moderate',
    evidenceIds: ['fact_sav_income'],
    ruleIds: [],
    sourceIds: [],
    relevance: 'high',
    allowed: true,
  },
];

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
  confluence: { hasConfluence: false, confluenceStrength: 'weak', convergingLayersCount: 0, layers: [], confluenceSummary: 'Mixed.' },
  temporalWindows: [],
  unresolvedQuestions: [],
  evidenceLineage: facts.map(f => f.id),
  ruleLineage: [],
  sourceLineage: [],
  coverageStatus: 'partial',
  confidence: 'medium',
  auditTrace: {
    questionId: plan.questionId, intent: plan.intent, domain: plan.domain, requiredFactsCount: 4,
    verifiedFactsCount: facts.length, applicableRulesCount: 0, rejectedRulesCount: 0,
    supportingFactorsCount: 2, restrictingFactorsCount: 1, conflictingFactorsCount: 0,
    hasTemporalConfluence: false, stepSequence: [], executionDurationMs: 1,
  },
  version: 'test',
  createdAtIso: '2026-10-10T00:00:00.000Z',
  verified: true,
};

function claimSet(selectedClaims: any[]) {
  return {
    status: 'approved',
    questionId: plan.questionId,
    claims: selectedClaims,
    rejectedClaims: [],
    questionCoverage: { complete: true, coveredEntities: [], coveredHouses: [10], coveredDomains: ['career'], missing: [] },
    preservesContradictions: true,
    auditRecords: [],
    validatorVersion: 'test',
    createdAtIso: '2026-10-10T00:00:00.000Z',
    verified: true,
  } as any;
}

async function main(): Promise<void> {
  const firewall = new GroundingFirewall();

  const careerOnlySet = firewall.validate([claims[0]], plan, reasoning, evidence);
  assert(
    careerOnlySet.questionCoverage.complete === false &&
      careerOnlySet.questionCoverage.missing.some((item: string) => item.toLowerCase().includes('finance')),
    'Question coverage must remain incomplete when the primary career topic is covered but the requested finance domain is missing.',
  );

  const completeSet = firewall.validate([claims[0], claims[4]], plan, reasoning, evidence);
  assert(
    completeSet.questionCoverage.complete === true &&
      completeSet.questionCoverage.coveredDomains.includes('finance'),
    'Question coverage must mark finance as covered when an approved finance claim is present.',
  );

  const fullClaims = claimSet(claims);
  const selection = new ResponseEvidenceSelector().selectEvidence(plan, reasoning, fullClaims);
  assert(
    selection.selectedClaimIds.includes('claim_income_sav'),
    'The evidence selector must reserve a claim slot for a requested secondary domain when higher-scoring primary-domain facts would otherwise crowd it out.',
  );
  assert(
    selection.selectedClaimIds.includes('claim_direct_synthesis'),
    'Reserving secondary-domain coverage must not evict the approved direct synthesis claim.',
  );

  const responsePlan = new ResponsePlanner().planResponse(plan, reasoning, fullClaims);
  assert(
    ((responsePlan.contextPack as any)?.secondaryDomains || []).includes('finance'),
    'The narrator context must explicitly retain secondary domains for answer planning.',
  );

  // Combined transit + finance question: neither the exact transit claim nor the
  // reserved secondary-domain claim may be evicted by the other's priority rule.
  const transitPlan: QuestionPlan = {
    ...plan,
    rawQuestion: 'How does Jupiter transit affect my career and income in 2027?',
    normalizedQuestion: 'How does Jupiter transit affect my career and income in 2027?',
    planetFocus: ['Jupiter'],
  };
  const transitClaim = {
    claimId: 'claim_jupiter_transit',
    text: 'A verified transit activation contributes to the timing assessment.',
    type: 'factual',
    factorType: 'transit',
    strength: 'moderate',
    evidenceIds: ['fact_career_synthesis'],
    ruleIds: [],
    sourceIds: [],
    astrologicalEntities: ['Jupiter'],
    relevance: 'high',
    allowed: true,
  };
  const combinedSelection = new ResponseEvidenceSelector().selectEvidence(
    transitPlan,
    reasoning,
    claimSet([...claims, transitClaim]),
  );
  assert(
    combinedSelection.selectedClaimIds.includes('claim_jupiter_transit') &&
      combinedSelection.selectedClaimIds.includes('claim_income_sav') &&
      combinedSelection.selectedClaimIds.includes('claim_direct_synthesis'),
    'Transit prioritization must coexist with the direct synthesis and secondary finance coverage.',
  );

  const prompt = buildNarratorUserPrompt(plan.rawQuestion, responsePlan, fullClaims);
  assert(
    prompt.toLowerCase().includes('secondary domains') && prompt.toLowerCase().includes('finance'),
    'The narrator prompt must instruct the model to cover secondary domains rather than answering only the primary topic.',
  );

  console.log('AI V3 ANSWER QUALITY: PASS (7 contracts)');
}

try {
  await main();
} catch (error) {
  console.error('AI V3 ANSWER QUALITY: FAIL');
  console.error(error);
  process.exitCode = 1;
}
