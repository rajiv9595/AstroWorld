/**
 * ASTROWORLD — Phase 10 Calculation Truth Contract
 *
 * Adversarial, deterministic tests for classical aspect semantics and
 * prerequisite-driven yoga/dosha detection. These are intentionally synthetic
 * placements so a regression cannot be hidden by a single natal golden chart.
 */

import { getParashariAspectHouses, hasParashariAspect } from '../../shared/engine/aspects.ts';
import { calculateYogasAndDoshas } from '../../shared/engine/yogas.ts';
import { calculateVimshottariDasha } from '../../shared/engine/dasha.ts';
import { ConfluenceEngine } from '../src/ai_v2/reasoning/confluenceEngine.ts';
import { RulePrerequisiteMatcher } from '../src/ai_v2/reasoning/ruleMatcher.ts';
import { ClassicalRAGRetriever } from '../src/ai_v2/rag/retriever.ts';
import type { PlanetName, PlanetPosition, ZodiacSign } from '../../shared/engine/types.ts';

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function expect(name: string, actual: unknown, expected: unknown) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({
    name,
    pass,
    detail: pass ? '' : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  });
}

function syntheticPlanet(
  name: PlanetName,
  houseNumber: number,
  signIndex: number,
): PlanetPosition {
  const signs: ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  return {
    name,
    sanskritName: name,
    tropicalLongitude: signIndex * 30 + 10,
    siderealLongitude: signIndex * 30 + 10,
    sign: signs[signIndex],
    signIndex,
    degreeInSign: 10,
    formattedDegree: '10° 00\' 00"',
    houseNumber,
    nakshatra: 'Ashwini',
    nakshatraNumber: 1,
    nakshatraLord: 'Ketu',
    pada: 1,
    speed: 1,
    retrograde: false,
    combust: false,
    dignity: 'NEUTRAL',
    dignityScore: 15,
    signLord: 'Sun',
    naturalRelationshipToLord: 'NEUTRAL',
  };
}

const marsTargets = getParashariAspectHouses(1, 'Mars');
const jupiterTargets = getParashariAspectHouses(5, 'Jupiter');
const saturnTargets = getParashariAspectHouses(10, 'Saturn');
const venusTargets = getParashariAspectHouses(2, 'Venus');
expect('Mars casts 4th, 7th and 8th aspects', marsTargets, [4, 7, 8]);
expect('Jupiter casts 5th, 7th and 9th aspects', jupiterTargets, [9, 11, 1]);
expect('Saturn casts 3rd, 7th and 10th aspects', saturnTargets, [12, 4, 7]);
expect('Ordinary planets cast 7th aspect only', venusTargets, [8]);
expect(
  'Node special aspects are excluded by default',
  getParashariAspectHouses(1, 'Rahu'),
  [7],
);
expect(
  'Node special aspects can be explicitly opted in',
  getParashariAspectHouses(1, 'Rahu', true),
  [5, 7, 9],
);
expect(
  'Mars 4th aspect is recognized as sambandha',
  hasParashariAspect(
    syntheticPlanet('Mars', 4, 0),
    syntheticPlanet('Mercury', 7, 6),
  ),
  true,
);

// Capricorn ascendant: 4th lord Mars + 9th lord Mercury.
// Their only relationship below is Mars' special 4th aspect, which the
// previous house-difference implementation could not recognize.
const capricornPlanets: PlanetPosition[] = [
  syntheticPlanet('Mars', 4, 0),
  syntheticPlanet('Mercury', 7, 6),
  syntheticPlanet('Sun', 2, 10),
  syntheticPlanet('Moon', 3, 11),
  syntheticPlanet('Jupiter', 5, 4),
  syntheticPlanet('Venus', 6, 5),
  syntheticPlanet('Saturn', 1, 9),
  syntheticPlanet('Rahu', 8, 7),
  syntheticPlanet('Ketu', 2, 1),
];
const capricornYogas = calculateYogasAndDoshas(capricornPlanets, 'Capricorn');
expect(
  'Raja Yoga recognizes Kendra-Trikona lord sambandha through Mars special aspect',
  capricornYogas.yogas.find(y => y.id === 'raja_yoga')?.present,
  true,
);

// Kala Sarpa: validate both orientations of the Rahu-Ketu half-axis.
const firstHalfPlanets = [
  syntheticPlanet('Rahu', 1, 0),
  syntheticPlanet('Ketu', 7, 6),
  syntheticPlanet('Sun', 2, 1),
  syntheticPlanet('Moon', 3, 2),
  syntheticPlanet('Mars', 4, 3),
  syntheticPlanet('Mercury', 5, 4),
  syntheticPlanet('Jupiter', 6, 5),
  syntheticPlanet('Venus', 11, 4),
  syntheticPlanet('Saturn', 12, 5),
];
const secondHalfPlanets = firstHalfPlanets.map((p) => ({
  ...p,
  signIndex: p.name === 'Rahu' ? 0 : p.name === 'Ketu' ? 6 : (p.signIndex + 6) % 12,
  sign: (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as ZodiacSign[])[p.name === 'Rahu' ? 0 : p.name === 'Ketu' ? 6 : (p.signIndex + 6) % 12],
}));
expect(
  'Kala Sarpa detects the Rahu-to-Ketu half-axis',
  calculateYogasAndDoshas(firstHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  true,
);
expect(
  'Kala Sarpa detects the opposite half-axis',
  calculateYogasAndDoshas(secondHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  true,
);

const mixedHalfPlanets = secondHalfPlanets.map(p => p.name === 'Jupiter'
  ? { ...p, signIndex: 2, sign: 'Gemini' as ZodiacSign }
  : p
);
expect(
  'Kala Sarpa rejects a split-axis chart',
  calculateYogasAndDoshas(mixedHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  false,
);

const dashaBirth = new Date('2005-08-16T18:32:00.000Z');
const dashaAtBirth = calculateVimshottariDasha(257.8637656115666, dashaBirth, dashaBirth);
const activeAtBirth = dashaAtBirth.mahadashas
  .filter(md => md.period.activeNow)
  .map(md => md.period.path);
expect('Vimshottari has exactly one active Mahadasha at birth', activeAtBirth.length, 1);

let preBirthRejected = false;
try {
  calculateVimshottariDasha(
    257.8637656115666,
    dashaBirth,
    new Date(dashaBirth.getTime() - 1),
  );
} catch {
  preBirthRejected = true;
}
expect('Vimshottari rejects an evaluation date before birth', preBirthRejected, true);

// Weighted confluence guard: raw existence of a layer must remain neutral unless
// classified, relevant evidence actually supports the user's domain.
const confluenceEngine = new ConfluenceEngine();
const timingPlan = {
  questionId: 'phase10-weighted-confluence',
  rawQuestion: 'Will career timing improve?',
  normalizedQuestion: 'will career timing improve',
  intent: 'career_timing',
  domain: 'career',
  planetFocus: ['Jupiter'],
  houseFocus: [10],
  chartLayers: ['D1', 'D10'],
  temporalScope: { type: 'upcoming' },
  targetDatesIso: [],
  requestedComparison: false,
  requiredTools: [],
  priority: 1,
  ambiguities: [],
  clarificationRequired: false,
  version: 'phase10-test',
  createdAtIso: new Date().toISOString(),
};
const natalEvidence = {
  version: 'phase10-test',
  createdAtIso: new Date().toISOString(),
  question: {
    raw: 'Will career timing improve?',
    normalized: 'will career timing improve',
    intent: 'career_timing',
    domain: 'career',
  },
  plan: timingPlan,
  facts: [
    {
      id: 'natal_1',
      category: 'natal',
      entity: 'Saturn',
      property: 'placement',
      value: 'Saturn in 10th',
      sign: 'Capricorn',
      house: 10,
      sourceTool: 'get_birth_chart',
      verified: true,
    },
    {
      id: 'varga_1',
      category: 'varga',
      entity: 'D10',
      property: 'placement',
      value: 'Saturn strong in D10',
      sign: 'Capricorn',
      house: 1,
      sourceTool: 'get_divisional_chart',
      verified: true,
    },
  ],
  derivedFacts: [],
  toolResults: [],
  provenance: [],
  warnings: [],
  missingEvidence: [],
  executionMetrics: { totalDurationMs: 0, toolsExecutedCount: 2, parallelBatchesCount: 1 },
  verified: true,
} as any;
const backgroundOnly = [{
  id: 'factor_background',
  entity: 'Saturn',
  property: 'placement',
  value: 'background',
  role: 'background',
  relevance: 'low',
  rationale: 'background only',
  sourceTool: 'get_birth_chart',
  evidenceId: 'natal_1',
  weight: 0.2,
}] as any;
const noConfluence = confluenceEngine.evaluateConfluence(timingPlan as any, natalEvidence, backgroundOnly, []);
expect('A background fact does not create supportive D1 confluence', noConfluence.layers[0]?.alignment, 'neutral');

const primaryNatal = [{
  ...backgroundOnly[0],
  role: 'primary',
  relevance: 'high',
  weight: 1,
}] as any;
const primaryVarga = [{
  id: 'factor_varga',
  entity: 'Saturn',
  property: 'placement',
  value: 'strong D10',
  role: 'primary',
  relevance: 'high',
  rationale: 'direct career varga factor',
  sourceTool: 'get_divisional_chart',
  evidenceId: 'varga_1',
  weight: 1,
}] as any;
const weightedConfluence = confluenceEngine.evaluateConfluence(
  timingPlan as any,
  natalEvidence,
  [...primaryNatal, ...primaryVarga],
  [],
);
expect('Two genuinely supportive independent layers produce confluence', weightedConfluence.hasConfluence, true);
expect('Weighted confluence exposes a positive support score', weightedConfluence.supportiveScore! > weightedConfluence.restrictingScore!, true);

// Classical-rule lineage must be exact and must never fall back to evidence[0].
const matcher = new RulePrerequisiteMatcher();
const unmatchedRule = {
  id: 'phase10_unmatched_rule',
  source: 'Test Source',
  author: 'Test Author',
  chapter: 'Test Chapter',
  citation: 'Test Ch. 1',
  content: 'Test',
  normalizedRule: 'Jupiter in the 5th house supports education.',
  relevanceScore: 0.9,
  tradition: 'parashari',
  metadata: {
    tradition: 'parashari',
    topic: 'education',
    subtopic: 'education',
    ruleType: 'house_lord_rule',
    planetarySubjects: ['Jupiter'],
    houseSubjects: [5],
    signSubjects: [],
    vargaSubjects: ['D1'],
    authorityLevel: 'primary_foundational',
    tags: ['education'],
  },
} as any;
const unrelatedEvidence = {
  ...natalEvidence,
  facts: [{
    ...natalEvidence.facts[0],
    id: 'unrelated_1',
    entity: 'Saturn',
    house: 10,
  }],
} as any;
const matched = matcher.evaluateRules([unmatchedRule], unrelatedEvidence);
expect('Unmatched classical prerequisite is rejected', matched.appliedRules[0]?.applicabilityStatus, 'rejected');
expect('Rejected classical rule contains no fabricated evidence lineage', matched.appliedRules[0]?.evidenceIds, []);

const unverifiedRetriever = new ClassicalRAGRetriever({
  customKnowledgeBase: [{
    ...unmatchedRule,
    verified: false,
  }] as any,
});
expect('Unverified classical records are excluded from RAG', unverifiedRetriever.retrieve('Jupiter education').results.length, 0);

let passed = 0;
for (const c of checks) {
  if (c.pass) {
    passed++;
    console.log('✅ ' + c.name);
  } else {
    console.error('❌ ' + c.name + ' — ' + c.detail);
  }
}

console.log('\n==================================================');
console.log(`PHASE 10 CALCULATION TRUTH CONTRACT: ${passed} PASSED | ${checks.length - passed} FAILED`);
console.log('==================================================');

if (passed !== checks.length) process.exitCode = 1;
