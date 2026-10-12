/**
 * ASTROWORLD AI V3 — Grounded Career Consultation Regression Verification
 *
 * Verifies the evidence-to-answer contract for compound career consultations:
 * - Query planning maps to career domain with D1 and D10 chart layers.
 * - Tool planning requests birth chart, D10 divisional chart, dasha, and yogas.
 * - Reasoning preserves both supportive strengths and structural limiting factors.
 * - Narrative separates calculated chart facts from astrological interpretations.
 * - Missing evidence is explicitly disclosed (D10 birth time sensitivity, transits).
 * - Avoids repetitive textbook explanations and guaranteed predictions.
 * - Validator rejects ungrounded, incomplete, or fatalistic answers.
 */

import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolPlanner } from '../src/ai_v2/planner/toolPlanner.ts';
import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { ClaimSetGenerator } from '../src/ai_v2/claims/claimGenerator.ts';
import { GroundingFirewall } from '../src/ai_v2/claims/groundingFirewall.ts';
import { ResponsePlanner } from '../src/ai_v2/narrator/responsePlanner.ts';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';
import { PostResponseGroundingValidator } from '../src/ai_v2/narrator/postResponseValidator.ts';
import { ConsultationOrchestrator } from '../src/ai_v2/consultation/consultationOrchestrator.ts';
import { BirthProfile } from '../src/ai_v2/schemas/birthProfile.ts';
import { EvidencePacket, FactItem } from '../src/ai_v2/schemas/evidencePacket.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[ASSERTION_FAILED]: ${message}`);
  }
}

const TEST_PROFILE: BirthProfile = {
  name: 'Career Test Native',
  year: 1992,
  month: 5,
  day: 14,
  hour: 9,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

const COMPOUND_QUERY =
  'Based on this chart, what are the main career strengths and limiting factors? ' +
  'Explain which conclusions are directly supported by calculated chart evidence and which are interpretations. ' +
  'Include both supportive and challenging indications, avoid guaranteed predictions, and tell me clearly if any important evidence is missing.';

async function testQuestionAndToolPlanning(): Promise<void> {
  console.log('Test 1: Question and Tool Planning Contract...');
  const questionPlanner = new QuestionPlanner({ geminiApiKey: '' });
  const toolPlanner = new ToolPlanner();

  const plan = await questionPlanner.plan(COMPOUND_QUERY);

  assert(plan.domain === 'career', `Expected domain 'career', received '${plan.domain}'`);
  assert(
    plan.intent === 'career_strengths_limitations' || plan.intent === 'career',
    `Expected career intent, received '${plan.intent}'`
  );
  assert(plan.chartLayers.includes('D10'), 'Question plan must include D10 Dashamsha');
  assert(plan.chartLayers.includes('D1'), 'Question plan must include D1 natal chart');

  const toolGraph = toolPlanner.planTools(plan, TEST_PROFILE);
  const toolNames = toolGraph.allPlannedTools.map(t => t.toolName);

  assert(toolNames.includes('get_birth_chart'), 'Tool planner must plan get_birth_chart');
  assert(toolNames.includes('get_divisional_chart'), 'Tool planner must plan get_divisional_chart');
  assert(toolNames.includes('get_current_dasha'), 'Tool planner must plan get_current_dasha');
  assert(toolNames.includes('get_active_yogas'), 'Tool planner must plan get_active_yogas');

  const d10Tool = toolGraph.allPlannedTools.find(
    t => t.toolName === 'get_divisional_chart' && t.parameters?.vargaCode === 'D10'
  );
  assert(Boolean(d10Tool), 'Tool planner must specifically configure D10 divisional chart');
  console.log('  -> PASS');
}

async function testReasoningAndClaimGrounding(): Promise<void> {
  console.log('Test 2: Reasoning and Claim Grounding (Strengths vs Limitations)...');
  const questionPlanner = new QuestionPlanner({ geminiApiKey: '' });
  const plan = await questionPlanner.plan(COMPOUND_QUERY);
  const reasoner = new AstrologyReasoner();
  const claimGenerator = new ClaimSetGenerator();
  const firewall = new GroundingFirewall();

  const mockEvidence: EvidencePacket = {
    packetId: 'ev_test_1',
    facts: [
      {
        id: 'fact_asc',
        category: 'natal',
        entity: 'Ascendant',
        property: 'sign',
        value: 'Gemini',
        sourceTool: 'get_birth_chart',
        verified: true,
      },
      {
        id: 'fact_sun',
        category: 'natal',
        entity: 'Sun',
        property: 'position',
        value: 'Aries 29° 51\' 42"',
        house: 11,
        sourceTool: 'get_birth_chart',
        verified: true,
      },
      {
        id: 'fact_saturn',
        category: 'natal',
        entity: 'Saturn',
        property: 'position',
        value: 'Capricorn 24° 34\' 07"',
        house: 8,
        sourceTool: 'get_birth_chart',
        verified: true,
      },
      {
        id: 'fact_d10_lagna',
        category: 'varga',
        entity: 'D10 Lagna',
        property: 'sign',
        value: 'Aquarius',
        vargaCode: 'D10',
        sourceTool: 'get_divisional_chart',
        verified: true,
      },
      {
        id: 'fact_d10_jupiter',
        category: 'varga',
        entity: 'Jupiter in D10',
        property: 'varga_sign',
        value: 'Scorpio (House 10)',
        vargaCode: 'D10',
        sourceTool: 'get_divisional_chart',
        verified: true,
      },
      {
        id: 'fact_d10_sun',
        category: 'varga',
        entity: 'Sun in D10',
        property: 'varga_sign',
        value: 'Capricorn (House 12)',
        vargaCode: 'D10',
        sourceTool: 'get_divisional_chart',
        verified: true,
      },
      {
        id: 'fact_dasha',
        category: 'dasha',
        entity: 'Vimshottari Dasha',
        property: 'active_periods',
        value: 'Jupiter - Moon - Mercury',
        sourceTool: 'get_current_dasha',
        verified: true,
      },
    ],
    derivedFacts: [
      {
        id: 'yoga_budhaditya',
        type: 'Yoga',
        description: 'Budhaditya Yoga',
        sourceTool: 'get_active_yogas',
        verified: true,
      },
      {
        id: 'yoga_gajakesari_absence',
        type: 'Yoga',
        description: 'Gajakesari Yoga absent: no qualifying Kendra formation',
        sourceTool: 'get_active_yogas',
        verified: true,
      },
    ],
    verified: true,
    verifiedAtIso: new Date().toISOString(),
    overallQuality: 'gold',
    missingFacts: [],
    toolResults: [],
  };

  const mockRag = { query: COMPOUND_QUERY, results: [], totalMatched: 0 };
  const reasoning = await reasoner.reason(plan, mockEvidence, mockRag as any);

  assert(reasoning.primaryFactors.length > 0, 'Reasoning must have supportive primary factors');
  assert(reasoning.restrictingFactors.length > 0, 'Reasoning must have restricting/limiting factors (e.g. D10 House 12, yoga absence)');

  const candidateClaims = claimGenerator.generateClaims(plan, reasoning, mockEvidence);
  const approvedClaims = firewall.validate(candidateClaims, plan, reasoning, mockEvidence);

  const synthesisClaim = approvedClaims.claims.find(c => c.type === 'qualified_prediction');
  assert(Boolean(synthesisClaim), 'Must generate an approved synthesis claim');
  assert(!synthesisClaim!.text.includes('in astrological'), 'Synthesis text must not contain awkward phrase "in astrological"');
  assert(
    synthesisClaim!.text.toLowerCase().includes('strengths') &&
    (synthesisClaim!.text.toLowerCase().includes('limiting') || synthesisClaim!.text.toLowerCase().includes('structural')),
    'Synthesis claim must address both strengths and structural limiting factors'
  );
  console.log('  -> PASS');
}

async function testStructuredNarrativeAndValidator(): Promise<void> {
  console.log('Test 3: Structured Narrative and Release-Quality Validator Contract...');
  const questionPlanner = new QuestionPlanner({ geminiApiKey: '' });
  const plan = await questionPlanner.plan(COMPOUND_QUERY);
  const responsePlanner = new ResponsePlanner();
  const narrator = new GeminiNarrator({ forceMockMode: true });
  const validator = new PostResponseGroundingValidator();

  const facts: FactItem[] = [
    {
      id: 'fact_asc',
      category: 'natal',
      entity: 'Ascendant',
      property: 'sign',
      value: 'Gemini',
      sourceTool: 'get_birth_chart',
      verified: true,
    },
    {
      id: 'fact_sun',
      category: 'natal',
      entity: 'Sun',
      property: 'position',
      value: 'Aries 29° 51\' 42"',
      house: 11,
      sourceTool: 'get_birth_chart',
      verified: true,
    },
    {
      id: 'fact_saturn',
      category: 'natal',
      entity: 'Saturn',
      property: 'position',
      value: 'Capricorn 24° 34\' 07"',
      house: 8,
      sourceTool: 'get_birth_chart',
      verified: true,
    },
    {
      id: 'fact_d10_lagna',
      category: 'varga',
      entity: 'D10 Lagna',
      property: 'sign',
      value: 'Aquarius',
      vargaCode: 'D10',
      sourceTool: 'get_divisional_chart',
      verified: true,
    },
    {
      id: 'fact_d10_jupiter',
      category: 'varga',
      entity: 'Jupiter in D10',
      property: 'varga_sign',
      value: 'Scorpio (House 10)',
      vargaCode: 'D10',
      sourceTool: 'get_divisional_chart',
      verified: true,
    },
    {
      id: 'fact_d10_sun',
      category: 'varga',
      entity: 'Sun in D10',
      property: 'varga_sign',
      value: 'Capricorn (House 12)',
      vargaCode: 'D10',
      sourceTool: 'get_divisional_chart',
      verified: true,
    },
    {
      id: 'fact_dasha',
      category: 'dasha',
      entity: 'Vimshottari Dasha',
      property: 'active_periods',
      value: 'Jupiter - Moon - Mercury',
      sourceTool: 'get_current_dasha',
      verified: true,
    },
  ];

  const evidence: EvidencePacket = {
    packetId: 'ev_test_2',
    facts,
    derivedFacts: [
      {
        id: 'yoga_budhaditya',
        type: 'Yoga',
        description: 'Budhaditya Yoga',
        sourceTool: 'get_active_yogas',
        verified: true,
      },
      {
        id: 'yoga_gajakesari_absence',
        type: 'Yoga',
        description: 'Gajakesari Yoga absent: verified yoga engine returned no qualifying formation',
        sourceTool: 'get_active_yogas',
        verified: true,
      },
    ],
    verified: true,
    verifiedAtIso: new Date().toISOString(),
    overallQuality: 'gold',
    missingFacts: [],
    toolResults: [],
  };

  const mockRag = { query: COMPOUND_QUERY, results: [], totalMatched: 0 };
  const reasoner = new AstrologyReasoner();
  const reasoning = await reasoner.reason(plan, evidence, mockRag as any);
  const claimGenerator = new ClaimSetGenerator();
  const firewall = new GroundingFirewall();
  const candidateClaims = claimGenerator.generateClaims(plan, reasoning, evidence);
  const approvedClaims = firewall.validate(candidateClaims, plan, reasoning, evidence);

  const responsePlan = responsePlanner.planResponse(plan, reasoning, approvedClaims);
  const finalResponse = await narrator.narrate(plan, reasoning, approvedClaims, responsePlan, {
    forceMockMode: true,
  });

  const text = finalResponse.text;

  // Verify section headers and grounding contract
  assert(
    text.includes('Directly Calculated Chart Evidence'),
    'Response must contain explicit "Directly Calculated Chart Evidence" section'
  );
  assert(
    text.includes('Interpretations — Career Strengths'),
    'Response must contain explicit "Interpretations — Career Strengths" section'
  );
  assert(
    text.includes('Interpretations — Limiting Factors & Structural Demands'),
    'Response must contain explicit "Interpretations — Limiting Factors" section'
  );
  assert(
    text.includes('Missing Evidence & Analytical Disclosures'),
    'Response must contain explicit "Missing Evidence & Analytical Disclosures" section'
  );

  // Verify specific facts and interpretations
  assert(text.includes('Jupiter in D10') || text.includes('Scorpio (House 10)'), 'Response must cite D10 Jupiter 10th house strength');
  assert(text.includes('Capricorn (House 12)') || text.includes('House 12'), 'Response must cite D10 12th house limiting factor');
  assert(text.includes('Birth-Time Sensitivity'), 'Response must disclose D10 birth time sensitivity');
  assert(text.includes('Real-Time Transits'), 'Response must disclose unqueried transits/ashtakavarga');

  // Verify absence of boilerplate repetition
  const d10Matches = text.match(/The Dashamsha chart \(D10\) refines the 10th house/gi);
  assert(!d10Matches || d10Matches.length <= 1, 'Standard D10 rule must not be repeated verbatim across paragraphs');

  // Verify validator approval
  assert(finalResponse.validatorStatus === 'approved', 'Final response must be approved by validator');

  // Negative test: Validator MUST reject ungrounded drafts
  const ungroundedDraft =
    'Your career has 100% guaranteed success in July 2030! Neptune in the 10th house guarantees you will become CEO.';
  const fakeExtractedClaims: any[] = [
    { planets: ['Neptune'], certaintyLevel: 'certain', referencedDates: ['July 2030'], yogas: [] },
  ];
  const negativeValidation = validator.validate(fakeExtractedClaims, ungroundedDraft, approvedClaims, reasoning, plan);

  assert(!negativeValidation.valid, 'Validator must reject ungrounded draft with modern planets and fatalistic certainty');
  assert(negativeValidation.violations.length >= 2, 'Validator must catch multiple violations in ungrounded draft');
  console.log('  -> PASS');
}

async function testEndToEndConsultation(): Promise<void> {
  console.log('Test 4: End-to-End Consultation Orcherstrator Execution...');
  const orchestrator = new ConsultationOrchestrator({ forceMockMode: true });
  const result = await orchestrator.consult(COMPOUND_QUERY, TEST_PROFILE, {
    userId: 'reg_user_1',
    conversationId: 'reg_conv_1',
    forceMockMode: true,
  });

  assert(result.questionPlan.domain === 'career', `Expected domain 'career', received '${result.questionPlan.domain}'`);
  assert(result.finalResponse.validatorStatus === 'approved', 'End-to-end response must be approved by validator');
  assert(
    result.finalResponse.text.includes('Directly Calculated Chart Evidence'),
    'End-to-end response must contain Directly Calculated Chart Evidence'
  );
  assert(
    result.finalResponse.text.includes('Missing Evidence & Analytical Disclosures'),
    'End-to-end response must contain Missing Evidence Disclosures'
  );
  console.log('  -> PASS');
}

async function main(): Promise<void> {
  console.log('================================================================');
  console.log('AI V3 GROUNDED CAREER CONSULTATION REGRESSION SUITE');
  console.log('================================================================\n');

  try {
    await testQuestionAndToolPlanning();
    await testReasoningAndClaimGrounding();
    await testStructuredNarrativeAndValidator();
    await testEndToEndConsultation();

    console.log('\n================================================================');
    console.log('ALL GROUNDED CAREER CONSULTATION CONTRACTS PASSED (4/4)');
    console.log('================================================================');
  } catch (err: any) {
    console.error('\n[REGRESSION_FAILURE]:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
