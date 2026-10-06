/**
 * ASTROWORLD — Phase 10 Correctness Audit Repair TDD
 *
 * These tests capture regressions discovered during the post-phase10 forensic
 * audit. They intentionally fail against the current phase10 branch before
 * the repair is applied.
 */

import { RulePrerequisiteMatcher } from '../src/ai_v2/reasoning/ruleMatcher.ts';
import { ConfluenceEngine } from '../src/ai_v2/reasoning/confluenceEngine.ts';
import { AstrologyReasoner } from '../src/ai_v2/reasoning/astrologyReasoner.ts';
import { ClassicalRAGRetriever } from '../src/ai_v2/rag/retriever.ts';
import type { EvidencePacket } from '../src/ai_v2/schemas/evidencePacket.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function basePlan() {
  return {
    questionId: 'phase10-audit-repair',
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
    version: 'phase10-audit-repair-test',
    createdAtIso: '2026-10-06T00:00:00.000Z',
  } as any;
}

function evidenceWithFacts(facts: any[] = [], derivedFacts: any[] = [], toolResults: any[] = []): EvidencePacket {
  return {
    version: 'phase10-audit-repair-test',
    createdAtIso: '2026-10-06T00:00:00.000Z',
    question: {
      raw: 'Will my career improve?',
      normalized: 'will my career improve',
      intent: 'career_timing',
      domain: 'career',
    },
    plan: basePlan(),
    facts,
    derivedFacts,
    toolResults,
    provenance: [],
    warnings: [],
    missingEvidence: [],
    executionMetrics: { totalDurationMs: 0, toolsExecutedCount: toolResults.length, parallelBatchesCount: 1 },
    verified: true,
  } as EvidencePacket;
}

function natalFact(entity: string, id = 'fact_1') {
  return {
    id,
    category: 'natal',
    entity,
    property: 'position',
    value: entity,
    sign: 'Taurus',
    house: 10,
    sourceTool: 'get_birth_chart',
    verified: true,
  };
}

function run() {
  // 1. Exact planetary prerequisite matching.
  const matcher = new RulePrerequisiteMatcher();
  const exactPlanetRule = {
    id: 'rule_exact_planet',
    source: 'Test Source',
    author: 'Test Author',
    chapter: 'Test Chapter',
    citation: 'Test Ch. 1',
    content: 'Test',
    normalizedRule: 'Moon rule',
    relevanceScore: 0.9,
    tradition: 'parashari',
    metadata: {
      tradition: 'parashari',
      topic: 'test',
      subtopic: 'test',
      ruleType: 'definition',
      planetarySubjects: ['Moon'],
      houseSubjects: [],
      signSubjects: [],
      vargaSubjects: [],
      authorityLevel: 'primary_foundational',
      tags: ['test'],
    },
  } as any;

  const exactPlanetEvidence = evidenceWithFacts([natalFact('Moonlight', 'moonlight_1')]);
  const exactPlanetResult = matcher.evaluateRules([exactPlanetRule], exactPlanetEvidence);
  assert(
    exactPlanetResult.appliedRules[0]?.applicabilityStatus === 'rejected',
    'Planet prerequisite must reject substring entity matches such as Moonlight -> Moon.',
  );
  assert(
    exactPlanetResult.appliedRules[0]?.evidenceIds.length === 0,
    'Rejected planet prerequisite must not fabricate evidence lineage.',
  );

  // 2. Exact Varga code matching.
  const exactVargaRule = {
    ...exactPlanetRule,
    id: 'rule_exact_varga',
    metadata: {
      ...exactPlanetRule.metadata,
      planetarySubjects: [],
      vargaSubjects: ['D10'],
    },
  } as any;
  const exactVargaEvidence = evidenceWithFacts([{
    id: 'varga_1',
    category: 'varga',
    entity: 'Sun in D100',
    property: 'varga_sign',
    value: 'Leo',
    sign: 'Leo',
    house: 10,
    sourceTool: 'get_divisional_chart',
    verified: true,
  }]);
  const exactVargaResult = matcher.evaluateRules([exactVargaRule], exactVargaEvidence);
  assert(
    exactVargaResult.appliedRules[0]?.applicabilityStatus === 'rejected',
    'Varga prerequisite must reject D100 as evidence for D10.',
  );

  // 3. Gajakesari absence may not be inferred from missing derived yoga data.
  const reasoner = new AstrologyReasoner();
  const gajaPlan = {
    ...basePlan(),
    rawQuestion: 'I have Gajakesari Yoga, right?',
    normalizedQuestion: 'i have gajakesari yoga right',
    intent: 'yoga_analysis',
    domain: 'astrological',
  } as any;
  const gajaEvidence = evidenceWithFacts([
    natalFact('Moon', 'moon_1'),
    natalFact('Jupiter', 'jupiter_1'),
  ]);
  const classified = (reasoner as any).classifyFactors(gajaPlan, gajaEvidence);
  assert(
    !classified.primaryFactors.some((f: any) => f.id === 'yoga_gajakesari_absence'),
    'Missing Gajakesari derived evidence must not be converted into a fabricated absence claim.',
  );

  // 4. A query scope is not a predictive temporal window.
  const confluence = new ConfluenceEngine();
  const scopeOnly = confluence.buildTemporalWindows(basePlan(), evidenceWithFacts());
  assert(
    scopeOnly.length === 0,
    'A temporal query scope without verified event evidence must not become a peak confluence window.',
  );

  // 5. Temporal window IDs must be deterministic.
  const dashaTool = {
    toolName: 'get_current_dasha',
    executionDurationMs: 1,
    success: true,
    provenance: {
      sourceEngine: 'Vimshottari Dasha Engine',
      ruleStandard: 'BPHS Ch. 46',
      calculatedAtIso: '2026-10-06T00:00:00.000Z',
      verified: true,
    },
    data: {
      currentHierarchy: {
        mahadasha: {
          lord: 'Jupiter',
          startDateIso: '2024-01-01T00:00:00.000Z',
          endDateIso: '2040-01-01T00:00:00.000Z',
        },
        antardasha: {
          lord: 'Jupiter',
          subLord: 'Saturn',
          startDateIso: '2026-01-01T00:00:00.000Z',
          endDateIso: '2028-08-01T00:00:00.000Z',
        },
      },
    },
  };
  const dashaEvidence = evidenceWithFacts([
    { id: 'dasha_1', category: 'dasha', entity: 'Vimshottari Dasha', property: 'active_periods', value: 'Jupiter-Saturn', sourceTool: 'get_current_dasha', verified: true },
  ], [], [dashaTool]);
  const windowsA = confluence.buildTemporalWindows(basePlan(), dashaEvidence);
  const windowsB = confluence.buildTemporalWindows(basePlan(), dashaEvidence);
  assert(
    windowsA[0]?.id === windowsB[0]?.id,
    'Temporal window IDs must be deterministic for identical evidence.',
  );
  assert(
    windowsA.every((w: any) => w.strength !== 'strong' || w.type !== 'peak_confluence_window'),
    'A raw Dasha period must not be mislabeled as a strong peak-confluence window.',
  );

  // 6. Ashtakavarga and Jaimini are real confluence layers, not merely weights.
  const avEvidence = evidenceWithFacts([
    { id: 'av_1', category: 'ashtakavarga', entity: 'Sarvashtakavarga', property: 'total_bindus', value: 337, sourceTool: 'get_ashtakavarga', verified: true },
    { id: 'j_1', category: 'jaimini', entity: 'Atmakaraka (AK)', property: 'graha', value: 'Jupiter', sourceTool: 'get_jaimini_details', verified: true },
  ]);
  const avFactors = [
    { id: 'factor_av', entity: 'Sarvashtakavarga', property: 'total_bindus', value: 337, role: 'primary', relevance: 'high', rationale: 'AV support', sourceTool: 'get_ashtakavarga', evidenceId: 'av_1', weight: 1 },
    { id: 'factor_j', entity: 'Atmakaraka (AK)', property: 'graha', value: 'Jupiter', role: 'primary', relevance: 'high', rationale: 'Jaimini support', sourceTool: 'get_jaimini_details', evidenceId: 'j_1', weight: 1 },
  ] as any;
  const layered = confluence.evaluateConfluence(basePlan(), avEvidence, avFactors, []);
  assert(
    layered.layers.some((l: any) => l.layer === 'Ashtakavarga' && l.alignment === 'neutral'),
    'Ashtakavarga evidence is retained as explicit neutral context until an outcome-specific interpretation is proven.',
  );
  assert(
    layered.layers.some((l: any) => l.layer === 'Jaimini' && l.alignment === 'neutral'),
    'Jaimini evidence is retained as explicit neutral context until an outcome-specific interpretation is proven.',
  );

  // 7. RAG yoga matching uses stable identifiers, not loose substring matching.
  const rag = new ClassicalRAGRetriever({
    customKnowledgeBase: [{
      id: 'kb_test_yoga',
      sourceText: 'Test Source',
      author: 'Test',
      chapter: '1',
      citation: 'TEST-1',
      canonicalTranslation: 'Test rule',
      normalizedInterpretation: 'Test interpretation',
      metadata: {
        tradition: 'classical',
        topic: 'yoga',
        subtopic: 'test',
        ruleType: 'yoga_rule',
        planetarySubjects: [],
        houseSubjects: [],
        signSubjects: [],
        vargaSubjects: [],
        yogaSubjects: ['gajakesari'],
        authorityLevel: 'primary_foundational',
        tags: ['gajakesari'],
      },
      version: '1.0',
      verified: true,
    } as any],
  });
  const ragEvidence = evidenceWithFacts([], [{
    id: 'yoga_gajakesari_like_variant',
    type: 'Yoga',
    description: 'Gajakesari-like variant',
    sourceTool: 'get_active_yogas',
    verified: true,
  }]);
  const ragResult = rag.retrieve('What about the variant yoga?', basePlan(), ragEvidence);
  assert(
    ragResult.results.length === 0,
    'RAG must not match an unrelated yoga merely because its description contains the requested yoga name.',
  );

  console.log('PHASE 10 AUDIT-REPAIR TDD: RED/GREEN CONTRACTS EXECUTED');
}

run();