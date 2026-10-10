/**
 * AI V3 Phase 4 follow-on — end-to-end answer-quality benchmark.
 *
 * Deterministic contract cases cover compound-domain prioritization, mixed
 * indications, transit uncertainty, and explicit disclosure of evidence gaps.
 * One force-mock consultation exercises the full planner → tools → reasoner →
 * firewall → response plan → narrator pipeline without external model calls.
 */
import { ConsultationOrchestrator, BirthProfile } from '../src/ai_v2/index.ts';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';
import { buildNarratorUserPrompt } from '../src/ai_v2/narrator/narratorPrompt.ts';

const profile: BirthProfile = {
  name: 'Benchmark Native',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

const failures: string[] = [];
let passed = 0;

function check(condition: boolean, name: string, details = ''): void {
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${name}${details ? `: ${details}` : ''}`);
  } else {
    failures.push(name);
    console.error(`❌ [FAIL] ${name}${details ? `: ${details}` : ''}`);
  }
}

const narrator = new GeminiNarrator({ forceMockMode: true });

function contextPack(overrides: Record<string, unknown> = {}): any {
  return {
    originalQuestion: 'How will my career and income/savings look between 2027 and 2029?',
    domain: 'career',
    secondaryDomains: ['finance'],
    intent: 'career_timing',
    responseType: 'focused_analysis',
    technicalMode: 'normal',
    directAnswerDirection:
      'The chart indications are mixed for career growth over this period: constructive development is possible, but steady execution matters.',
    natalFactors: [],
    transitFactors: [],
    dashaFactors: [],
    vargaFactors: [],
    supportingFactors: [
      'The D10 chart emphasizes sustained career development through structured work.',
      'A separate verified career indicator highlights leadership responsibility.',
      'The D10 chart also emphasizes consistent execution of professional goals.',
      'The verified 11th-house Ashtakavarga score is 34 and provides context for income and savings.',
    ],
    restrictingFactors: ['A separate restrictive indication calls for caution around rapid expansion.'],
    timingWindows: [],
    classicalContextSummary: '',
    uncertaintyLevel: 'moderate',
    requestedDepth: 'standard',
    selectedClaimIds: [],
    selectedEvidenceIds: [],
    version: 'ai-v3-answer-quality-test',
    createdAtIso: '2026-10-10T00:00:00.000Z',
    ...overrides,
  };
}

function responsePlan(pack: any): any {
  return { responseType: 'focused_analysis', requestedDepth: 'standard', contextPack: pack, sections: [] };
}

function plan(overrides: Record<string, unknown> = {}): any {
  return {
    questionId: 'q_ai_v3_e2e_quality',
    rawQuestion: 'How will my career and income/savings look between 2027 and 2029?',
    normalizedQuestion: 'How will my career and income/savings look between 2027 and 2029?',
    intent: 'career_timing',
    domain: 'career',
    secondaryDomains: ['finance'],
    planetFocus: [],
    houseFocus: [10],
    chartLayers: ['D1', 'D10'],
    temporalScope: { type: 'date_range', startIso: '2027-01-01T00:00:00.000Z', endIso: '2029-12-31T23:59:59.999Z' },
    targetDatesIso: ['2027-06-15T00:00:00.000Z', '2029-06-15T00:00:00.000Z'],
    requiredTools: [],
    priority: 1,
    ambiguities: [],
    clarificationRequired: false,
    version: 'test',
    createdAtIso: '2026-10-10T00:00:00.000Z',
    ...overrides,
  };
}

function claimSet(overrides: Record<string, unknown> = {}): any {
  return {
    status: 'approved',
    questionId: 'q_ai_v3_e2e_quality',
    claims: [
      {
        claimId: 'claim_career',
        text: 'The verified D10 evidence supports a measured career-development interpretation.',
        type: 'factual',
        factorType: 'varga',
        strength: 'moderate',
        evidenceIds: ['fact_d10_career'],
        ruleIds: [],
        sourceIds: [],
        relevance: 'high',
        allowed: true,
      },
    ],
    rejectedClaims: [],
    auditRecords: [],
    questionCoverage: {
      complete: true,
      coveredEntities: [],
      coveredHouses: [10],
      coveredDomains: ['career', 'finance'],
      missing: [],
    },
    verified: true,
    ...overrides,
  };
}

async function main(): Promise<void> {
  console.log('\nAI V3 END-TO-END ANSWER QUALITY BENCHMARK\n');

  // A. A secondary-domain fact must survive a tight normal-response budget.
  const multiDomainPlan = plan();
  const multiDomainResponsePlan = responsePlan(contextPack());
  const multiDomainText = narrator.synthesizeDeterministicNarrative(
    multiDomainPlan,
    multiDomainResponsePlan,
    claimSet(),
  ).toLowerCase();
  check(
    multiDomainText.includes('income') && multiDomainText.includes('savings'),
    'Compound answer preserves the finance facet when several career facts compete for space',
    'Expected both the primary career answer and the approved income/savings evidence',
  );

  // B. A mixed conclusion must keep both supporting and restricting indications visible.
  const mixedText = narrator.synthesizeDeterministicNarrative(
    plan(),
    responsePlan(contextPack({
      directAnswerDirection:
        'The verified indications are mixed for career growth: constructive development is possible, but the result is not one-sided.',
      supportingFactors: [
        'The D10 chart supports sustained career development.',
        'A verified career factor highlights leadership responsibility.',
      ],
      restrictingFactors: [
        'A separate verified restriction calls for caution and sustained effort before rapid expansion.',
      ],
    })),
    claimSet(),
  ).toLowerCase();
  check(
    mixedText.includes('mixed') &&
      mixedText.includes('supports sustained career development') &&
      mixedText.includes('restriction calls for caution'),
    'Mixed indications retain both supporting and restricting evidence',
  );

  // C. Verified transit evidence must not be narrated as a guaranteed event.
  const transitPlan = plan({
    rawQuestion: 'Will Jupiter transit guarantee a promotion in 2027?',
    intent: 'transit_analysis',
    secondaryDomains: [],
  });
  const transitText = narrator.synthesizeDeterministicNarrative(
    transitPlan,
    responsePlan(contextPack({
      originalQuestion: transitPlan.rawQuestion,
      secondaryDomains: [],
      directAnswerDirection:
        'The verified chart factors may support a career opportunity, but they do not establish a specific promotion outcome.',
      transitFocus: {
        isTransitQuestion: true,
        transitingPlanet: 'Jupiter',
        targetHouse: 10,
        activationSummary: 'Jupiter is calculated to activate a career-relevant house',
        hasVerifiedTransitEvidence: true,
      },
      supportingFactors: ['The verified D10 evidence supports career development.'],
      restrictingFactors: ['The running dasha and other chart factors remain relevant to the timing.'],
    })),
    claimSet(),
  );
  check(
    /cannot confirm a specific event/i.test(transitText) &&
      !/\b(guaranteed|definitely|inevitable|will happen for sure)\b/i.test(transitText),
    'Transit narrative preserves calibrated uncertainty and rejects certainty claims',
  );

  // D. The same missing-domain signal must reach both deterministic and model prompts.
  const partialPlan = plan();
  const partialCoverage = {
    complete: false,
    coveredEntities: [],
    coveredHouses: [10],
    coveredDomains: ['career'],
    missing: ['Secondary domain "finance" not adequately covered'],
  };
  const partialClaims = claimSet({ questionCoverage: partialCoverage });
  const partialResponsePlan = responsePlan(contextPack({
    supportingFactors: [
      'The verified D10 chart supports a measured career-development interpretation.',
      'A separate verified career factor highlights leadership responsibility.',
    ],
    secondaryDomains: ['finance'],
  }));
  const partialText = narrator.synthesizeDeterministicNarrative(
    partialPlan,
    partialResponsePlan,
    partialClaims,
  ).toLowerCase();
  check(
    /not enough verified chart evidence.*(finance|income|financial)|(finance|income|financial).*not enough verified chart evidence|cannot assess.*(finance|income|financial)|won't guess/i.test(partialText),
    'Partial coverage is disclosed to the user instead of silently omitting the finance facet',
  );

  const modelPrompt = buildNarratorUserPrompt(partialPlan.rawQuestion, partialResponsePlan, partialClaims);
  check(
    modelPrompt.includes('COVERAGE LIMITATIONS') &&
      /finance/i.test(modelPrompt) &&
      /do not guess|rather than guess|don't guess/i.test(modelPrompt),
    'Live-model prompt names the known uncovered domain and instructs the model not to guess',
  );

  // E. Real deterministic calculation pipeline for a realistic compound user question.
  const orchestrator = new ConsultationOrchestrator({ forceMockMode: true });
  const consultation = await orchestrator.consult(
    'How will my career progress and income/savings look between 2027 and 2029, including both supportive and limiting indications?',
    profile,
    { forceMockMode: true, memoryEnabled: false },
  );
  const finalText = consultation.finalResponse.text.toLowerCase();
  const planHasFinance = (consultation.questionPlan.secondaryDomains || []).some(
    (domain: string) => domain.toLowerCase() === 'finance',
  );
  const coverage = consultation.approvedClaimSet.questionCoverage;
  const financeCovered = Boolean(coverage?.coveredDomains?.some(
    (domain: string) => domain.toLowerCase() === 'finance',
  ));
  const financeInFinalAnswer = /income|savings|financial|finance|wealth|ashtakavarga|11th house/i.test(finalText);
  const financeGapDisclosed = /not enough verified.*(finance|income|financial)|can't assess.*(finance|income|financial)|cannot assess.*(finance|income|financial)|won't guess/i.test(finalText);
  check(
    planHasFinance,
    'Full consultation planner preserves finance as a secondary domain',
    `domains=${JSON.stringify(consultation.questionPlan.secondaryDomains || [])}`,
  );
  check(
    financeCovered ? financeInFinalAnswer : financeGapDisclosed,
    'Full consultation either answers the finance facet from approved evidence or discloses the evidence gap',
    `coverageComplete=${coverage?.complete}, financeCovered=${financeCovered}, finalAnswerMentionsFinance=${financeInFinalAnswer}, gapDisclosed=${financeGapDisclosed}`,
  );
  check(
    !/\b(guaranteed|100% certain|will definitely happen|inevitable)\b/i.test(finalText),
    'Full consultation avoids fatalistic certainty language',
  );

  console.log(`\nAI V3 END-TO-END ANSWER QUALITY: ${failures.length ? 'FAIL' : 'PASS'} (${passed} passed, ${failures.length} failed)\n`);
  if (failures.length) throw new Error(`AI V3 end-to-end answer quality failed: ${failures.join('; ')}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
