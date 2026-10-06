/**
 * ASTROWORLD — Phase 13 Evidence/Source Hardening TDD
 *
 * These contracts protect the final reasoning boundary from partial prerequisite
 * matches, unstable yoga identity, and unresolvable lineage.
 */

import { RulePrerequisiteMatcher } from '../src/ai_v2/reasoning/ruleMatcher.ts';
import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { EvidencePacket, validateEvidencePacket } from '../src/ai_v2/schemas/evidencePacket.ts';
import { validateReasoningPacket } from '../src/ai_v2/schemas/reasoningPacket.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const plan: any = {
  questionId: 'phase13-lineage',
  rawQuestion: 'Will my career improve?',
  normalizedQuestion: 'will my career improve',
  intent: 'career_timing',
  domain: 'career',
  planetFocus: [],
  houseFocus: [10],
  chartLayers: ['D1', 'D10'],
  temporalScope: { type: 'upcoming' },
  targetDatesIso: [],
  requiredTools: [],
  priority: 1,
  ambiguities: [],
  clarificationRequired: false,
  version: 'phase13',
  createdAtIso: '2026-10-06T00:00:00.000Z',
};

function evidence(facts: any[], derivedFacts: any[] = [], toolResults: any[] = []): EvidencePacket {
  return {
    version: 'phase13',
    createdAtIso: '2026-10-06T00:00:00.000Z',
    question: { raw: plan.rawQuestion, normalized: plan.normalizedQuestion, intent: plan.intent, domain: plan.domain },
    plan,
    facts,
    derivedFacts,
    toolResults,
    provenance: toolResults.map(r => ({ toolName: r.toolName, ...r.provenance })),
    warnings: [],
    missingEvidence: [],
    executionMetrics: { totalDurationMs: 0, toolsExecutedCount: toolResults.length, parallelBatchesCount: 1 },
    verified: true,
  };
}

const natal = (id: string, entity: string, house: number) => ({
  id, category: 'natal', entity, property: 'position', value: entity, sign: 'Taurus', house, sourceTool: 'get_birth_chart', verified: true,
});

const transit = (id: string, entity: string) => ({
  id, category: 'transit', entity: entity + ' (Transit)', property: 'position', value: entity, sourceTool: 'get_transits', verified: true,
});

const rule = (overrides: any = {}) => ({
  id: 'kb_phase13_rule',
  source: 'Test Source',
  author: 'Test Author',
  chapter: 'Test',
  section: '1',
  citation: 'TEST-13.1',
  content: 'Test',
  normalizedRule: 'Test rule',
  relevanceScore: 1,
  tradition: 'parashari',
  metadata: {
    tradition: 'parashari',
    topic: 'career',
    subtopic: 'test',
    ruleType: 'house_lord_rule',
    planetarySubjects: [],
    houseSubjects: [],
    signSubjects: [],
    vargaSubjects: [],
    authorityLevel: 'primary_foundational',
    tags: ['test'],
    ...overrides,
  },
} as any);

async function main() {
  const matcher = new RulePrerequisiteMatcher();

  // Every declared house prerequisite must be satisfied, not merely present in metadata.
  const houseRule = matcher.evaluateRules(
    [rule({ houseSubjects: [10] })],
    evidence([natal('p9', 'Sun', 9)]),
  ).appliedRules[0];
  assert(houseRule.applicabilityStatus === 'rejected', 'House prerequisite must reject a fact in the wrong house.');

  // Transit subjects must match exact named transiting planets.
  const transitRule = matcher.evaluateRules(
    [rule({ transitSubjects: ['Jupiter'] })],
    evidence([transit('saturn_t', 'Saturn')]),
  ).appliedRules[0];
  assert(transitRule.applicabilityStatus === 'rejected', 'Transit prerequisite must reject Saturn evidence for a Jupiter-specific rule.');

  // Dasha subjects must match the requested lord when that constraint is declared.
  const dashaRule = matcher.evaluateRules(
    [rule({ dashaSubjects: ['Jupiter'] })],
    evidence([
      { id: 'd1', category: 'dasha', entity: 'Vimshottari Dasha', property: 'active_periods', value: 'Saturn - Mercury', sourceTool: 'get_current_dasha', verified: true },
    ]),
  ).appliedRules[0];
  assert(dashaRule.applicabilityStatus === 'rejected', 'Dasha prerequisite must reject a mismatched active lord.');

  // Yoga extraction must use the deterministic engine id when available.
  const engine = {
    id: 'gajakesari',
    name: 'Gajakesari Yoga',
    present: true,
    planetsInvolved: ['Moon', 'Jupiter'],
  };
  const gajaRule = rule({ yogaSubjects: ['gajakesari'] });
  const gajaEvidence = evidence([], [{
    id: 'yoga_gajakesari',
    type: 'Yoga',
    description: 'Gajakesari Yoga',
    sourceTool: 'get_active_yogas',
    verified: true,
  }]);
  const gajaMatched = matcher.evaluateRules([gajaRule], gajaEvidence).appliedRules[0];
  assert(gajaMatched.applicabilityStatus === 'applied', 'Stable Gajakesari yoga identity must apply the matching classical rule.');
  void engine;

  // Missing evidence lineage must invalidate the packet rather than silently pass.
  const invalidEvidence: any = evidence([natal('n1', 'Jupiter', 10)]);
  invalidEvidence.derivedFacts = [{
    id: 'yoga_gajakesari',
    type: 'Yoga',
    description: 'Gajakesari Yoga',
    sourceTool: 'get_active_yogas',
    verified: true,
  }];
  invalidEvidence.derivedFacts[0].evidenceIds = ['does_not_exist'];
  const packetResult = validateEvidencePacket(invalidEvidence);
  assert(packetResult.valid === false, 'EvidencePacket validation must reject derived lineage that points to missing evidence.');

  // Reasoning packet lineage must reference known verified evidence/rule IDs.
  const invalidReasoning: any = {
    questionId: 'phase13-lineage',
    direction: 'supportive',
    strength: 'moderate',
    primaryFactors: [{
      id: 'factor_bad',
      entity: 'Jupiter',
      property: 'position',
      value: 'Taurus',
      role: 'primary',
      relevance: 'high',
      rationale: 'test',
      sourceTool: 'get_birth_chart',
      evidenceId: 'missing-evidence',
      weight: 1,
    }],
    supportingFactors: [],
    restrictingFactors: [],
    conflictingFactors: [],
    irrelevantFactors: [],
    appliedRules: [],
    confluence: { hasConfluence: false, confluenceStrength: 'weak', convergingLayersCount: 0, layers: [], confluenceSummary: 'test' },
    temporalWindows: [],
    unresolvedQuestions: [],
    evidenceLineage: ['missing-evidence'],
    ruleLineage: [],
    sourceLineage: [],
    coverageStatus: 'partial',
    confidence: 'low',
    auditTrace: {
      questionId: 'phase13-lineage', intent: 'career_timing', domain: 'career',
      requiredFactsCount: 1, verifiedFactsCount: 0, applicableRulesCount: 0, rejectedRulesCount: 0,
      supportingFactorsCount: 1, restrictingFactorsCount: 0, conflictingFactorsCount: 0,
      hasTemporalConfluence: false, stepSequence: [], executionDurationMs: 0,
    },
    version: 'phase13', createdAtIso: new Date().toISOString(), verified: true,
  };
  const reasoningResult = validateReasoningPacket(invalidReasoning, evidence([
    natal('j1', 'Jupiter', 10),
  ]));
  assert(reasoningResult.valid === false, 'ReasoningPacket validation must reject unresolvable evidence lineage.');

  console.log('PHASE 13 EVIDENCE/SOURCE HARDENING: PASS');
}

main().catch(error => {
  console.error('PHASE 13 EVIDENCE/SOURCE HARDENING: FAIL');
  console.error(error);
  process.exitCode = 1;
});
