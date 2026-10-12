/**
 * AI V3 Phase 3 — cross-layer synthesis regression contracts.
 *
 * Checks that multi-domain plans influence factor classification and that
 * divisional charts are evaluated separately rather than merged into one score.
 */

import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { QuestionPlan } from '../src/ai_v2/schemas/questionPlan.ts';
import { EvidencePacket, FactItem } from '../src/ai_v2/schemas/evidencePacket.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const plan: QuestionPlan = {
  questionId: 'q_ai_v3_cross_layer_test',
  rawQuestion: 'Will my career improve and income rise between 2027 and 2029?',
  normalizedQuestion: 'Will my career improve and income rise between 2027 and 2029?',
  intent: 'career_timing',
  domain: 'career',
  secondaryDomains: ['finance'],
  planetFocus: [],
  houseFocus: [10],
  chartLayers: ['D1', 'D10', 'D4'],
  temporalScope: {
    type: 'date_range',
    startIso: '2027-01-01T00:00:00.000Z',
    endIso: '2029-12-31T23:59:59.999Z',
  },
  targetDatesIso: [
    '2027-06-15T00:00:00.000Z',
    '2028-06-15T00:00:00.000Z',
    '2029-06-15T00:00:00.000Z',
  ],
  requiredTools: [],
  priority: 1,
  ambiguities: [],
  clarificationRequired: false,
  version: 'test',
  createdAtIso: '2026-10-09T00:00:00.000Z',
};

const facts: FactItem[] = [
  {
    id: 'fact_d1_saturn',
    category: 'natal',
    entity: 'Saturn',
    property: 'position',
    value: 'Saturn in Aquarius',
    sign: 'Aquarius',
    house: 10,
    dignity: 'EXALTED',
    sourceTool: 'get_birth_chart',
    verified: true,
  },
  {
    id: 'fact_d10_sun',
    category: 'varga',
    entity: 'Sun in D10',
    property: 'varga_sign',
    value: 'Leo (House 10)',
    sign: 'Leo',
    house: 10,
    dignity: 'OWN_SIGN',
    sourceTool: 'get_divisional_chart',
    verified: true,
  },
  {
    id: 'fact_d4_saturn',
    category: 'varga',
    entity: 'Saturn in D4',
    property: 'varga_sign',
    value: 'Libra (House 12)',
    sign: 'Libra',
    house: 12,
    dignity: 'DEBILITATED',
    sourceTool: 'get_divisional_chart',
    verified: true,
  },
  {
    id: 'fact_sav_house11',
    category: 'ashtakavarga',
    entity: 'SAV House 11',
    property: 'bindu_score',
    value: 34,
    house: 11,
    sourceTool: 'get_ashtakavarga',
    verified: true,
  },
];

const evidence: EvidencePacket = {
  version: 'test',
  createdAtIso: '2026-10-09T00:00:00.000Z',
  question: {
    raw: plan.rawQuestion,
    normalized: plan.normalizedQuestion,
    intent: plan.intent,
    domain: plan.domain,
  },
  plan,
  facts,
  derivedFacts: [],
  toolResults: [],
  provenance: [],
  warnings: [],
  missingEvidence: [],
  executionMetrics: { totalDurationMs: 0, toolsExecutedCount: 0, parallelBatchesCount: 0 },
  verified: true,
};

async function main(): Promise<void> {
  const reasoner = new AstrologyReasoner();
  const rag = {
    results: [],
    retrievalVersion: 'test',
    totalMatches: 0,
    matchedTopics: [],
    warnings: [],
    verified: true,
  };
  const packet = reasoner.reason(plan, evidence, rag);

  assert(
    packet.primaryFactors.some(f =>
      f.evidenceId === 'fact_sav_house11' && f.rationale.toLowerCase().includes('finance')
    ),
    'A verified finance fact must be promoted into the relevant factor set for a career-plus-finance question.',
  );

  const divisionalLayers = packet.confluence.layers.filter(layer => layer.layer === 'Varga');
  const d10 = divisionalLayers.find(layer => /\bD10\b/.test(layer.factorDescription));
  const d4 = divisionalLayers.find(layer => /\bD4\b/.test(layer.factorDescription));

  assert(
    Boolean(d10 && d4),
    'D10 career evidence and D4 relocation evidence must remain separately identifiable during synthesis.',
  );
  assert(
    d10?.alignment === 'supportive' && d4?.alignment === 'restricting',
    'Opposing D10 and D4 signals must not be averaged into a falsely neutral single divisional layer.',
  );

  assert(
    packet.evidenceLineage.includes('fact_sav_house11') &&
      packet.evidenceLineage.includes('fact_d10_sun') &&
      packet.evidenceLineage.includes('fact_d4_saturn'),
    'The synthesis audit lineage must preserve evidence from every contributing domain and divisional chart.',
  );

  console.log('AI V3 CROSS-LAYER SYNTHESIS: PASS (3 contracts)');
}

try {
  await main();
} catch (error) {
  console.error('AI V3 CROSS-LAYER SYNTHESIS: FAIL');
  console.error(error);
  process.exitCode = 1;
}
