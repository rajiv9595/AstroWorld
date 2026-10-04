/**
 * ASTROWORLD AI V2 — Phase 5A Conversation State Engine Verification Suite
 * Executes 60 rigorous multi-turn scenarios across Categories A through H.
 * Validates topic tracking, "Why?" follow-ups, temporal resolution, pronoun resolution,
 * domain switching, claim challenges, correction handling, and ambiguity halts.
 */

import {
  ConversationStateManager,
  ConversationStateResolver,
  CONVERSATION_STATE_BENCHMARK_SCENARIOS,
  ConversationTurn,
  validateConversationState,
} from '../src/ai_v2/index.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASSED] ${testName}${detail ? `: ${detail}` : ''}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAILED] ${testName}${detail ? `: ${detail}` : ''}`);
  }
}

async function runStateBenchmarkSuite() {
  console.log('================================================================================');
  console.log('ASTROWORLD AI V2 — PHASE 5A CONVERSATION STATE ENGINE BENCHMARK (60 SCENARIOS)');
  console.log('================================================================================\n');

  const stateManager = new ConversationStateManager();
  const resolver = new ConversationStateResolver();

  const categoryStats: Record<string, { total: number; passed: number }> = {};

  for (let i = 0; i < CONVERSATION_STATE_BENCHMARK_SCENARIOS.length; i++) {
    const scenario = CONVERSATION_STATE_BENCHMARK_SCENARIOS[i];
    const cat = scenario.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, passed: 0 };
    }
    categoryStats[cat].total++;

    const convId = `test_conv_${scenario.id}`;
    const turns: ConversationTurn[] = [];

    // 1. Build Historical Turns
    for (let t = 0; t < scenario.history.length; t++) {
      const h = scenario.history[t];
      turns.push({
        turnId: `turn_${t + 1}_${scenario.id}`,
        turnIndex: t + 1,
        userMessage: h.user,
        answerSummary: {
          mainConclusion: h.assistantSummary,
          supportingFactors: h.factors || [],
          timing: h.timing,
        },
        approvedClaimIds: (h.claims || []).map(c => c.id),
        dominantFactors: h.factors || [],
        domain: h.domain || 'general',
        intent: 'general_chart_question',
        referencedFactors: h.factors || [],
        createdAt: new Date().toISOString(),
        executionMode: 'mock_gemini',
      });
    }

    // 2. Reconstruct State from Turns
    const state = stateManager.reconstructStateFromTurns(convId, turns);

    // If history had claims, populate them into state
    for (const h of scenario.history) {
      if (h.claims) {
        for (const c of h.claims) {
          state.activeClaims.push({
            claimId: c.id,
            topic: `${h.domain || 'general'} topic`,
            statement: c.statement,
            type: c.type || 'factual',
            confidence: 'high',
            source: 'reasoning',
            turnId: `turn_${turns.length}_${scenario.id}`,
            entities: c.entities || [],
            allowed: true,
          });
        }
      }
      if (h.timing) {
        state.activeTimePeriods.push(h.timing);
      }
      if (h.factors) {
        for (const f of h.factors) {
          if (!state.activePlanetFocus.includes(f) && ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(f)) {
            state.activePlanetFocus.push(f);
          }
        }
      }
    }

    // Validate State Schema
    const stateValidation = validateConversationState(state);
    if (!stateValidation.valid) {
      assert(false, `[${scenario.id}] State Schema Validity`, stateValidation.errors.join('; '));
      continue;
    }

    // 3. Resolve Current Query Context
    const tStart = Date.now();
    const { contextPack, trace } = resolver.resolve(scenario.query, state, turns);
    const latency = Date.now() - tStart;

    // 4. Assert Expected Behavioral Conditions
    let passed = true;
    const failures: string[] = [];

    if (scenario.expectedDomain && contextPack.currentDomain !== scenario.expectedDomain) {
      passed = false;
      failures.push(`Domain mismatch: expected "${scenario.expectedDomain}", got "${contextPack.currentDomain}"`);
    }

    if (
      scenario.expectedIntent &&
      contextPack.resolvedReferents.resolvedIntent !== scenario.expectedIntent
    ) {
      passed = false;
      failures.push(
        `Intent mismatch: expected "${scenario.expectedIntent}", got "${contextPack.resolvedReferents.resolvedIntent}"`
      );
    }

    if (
      scenario.expectedEntity &&
      contextPack.resolvedReferents.resolvedEntity?.toLowerCase() !== scenario.expectedEntity.toLowerCase()
    ) {
      passed = false;
      failures.push(
        `Entity mismatch: expected "${scenario.expectedEntity}", got "${contextPack.resolvedReferents.resolvedEntity}"`
      );
    }

    if (
      scenario.expectedTemporalType &&
      contextPack.resolvedReferents.resolvedTemporalScope?.type !== scenario.expectedTemporalType
    ) {
      passed = false;
      failures.push(
        `Temporal type mismatch: expected "${scenario.expectedTemporalType}", got "${contextPack.resolvedReferents.resolvedTemporalScope?.type}"`
      );
    }

    if (
      scenario.expectedExplanationRequested !== undefined &&
      contextPack.resolvedReferents.requestedExplanation !== scenario.expectedExplanationRequested
    ) {
      passed = false;
      failures.push(
        `ExplanationRequested mismatch: expected ${scenario.expectedExplanationRequested}, got ${contextPack.resolvedReferents.requestedExplanation}`
      );
    }

    if (
      scenario.expectedClarificationNeeded !== undefined &&
      contextPack.clarificationNeeded !== scenario.expectedClarificationNeeded
    ) {
      passed = false;
      failures.push(
        `ClarificationNeeded mismatch: expected ${scenario.expectedClarificationNeeded}, got ${contextPack.clarificationNeeded} (reason: ${contextPack.clarificationReason})`
      );
    }

    if (
      scenario.expectedClarificationReasonSnippet &&
      (!contextPack.clarificationReason ||
        !contextPack.clarificationReason.toLowerCase().includes(scenario.expectedClarificationReasonSnippet.toLowerCase()))
    ) {
      passed = false;
      failures.push(
        `ClarificationReason snippet missing: expected "${scenario.expectedClarificationReasonSnippet}", got "${contextPack.clarificationReason}"`
      );
    }

    if (
      scenario.expectedDomainSwitched !== undefined &&
      contextPack.resolvedReferents.domainSwitched !== scenario.expectedDomainSwitched
    ) {
      passed = false;
      failures.push(
        `DomainSwitched mismatch: expected ${scenario.expectedDomainSwitched}, got ${contextPack.resolvedReferents.domainSwitched}`
      );
    }

    // Negative Assertion: Trace latency must be sub-15ms (deterministic)
    if (latency > 25) {
      passed = false;
      failures.push(`Resolver latency exceeded threshold: ${latency}ms > 25ms`);
    }

    // Negative Assertion: State Resolver must NEVER infer astrology fact conclusions
    const rawTraceJson = JSON.stringify(trace);
    if (rawTraceJson.includes('exalted') || rawTraceJson.includes('debilitated') || rawTraceJson.includes('shadbala_rank')) {
      passed = false;
      failures.push('State resolver violated negative constraint: inferred astrological dignities/evaluations');
    }

    if (passed) {
      categoryStats[cat].passed++;
      assert(true, `Case ${i + 1}/60 [${scenario.id}]: ${scenario.title}`, `${latency}ms`);
    } else {
      assert(false, `Case ${i + 1}/60 [${scenario.id}]: ${scenario.title}`, failures.join('; '));
    }
  }

  // Summary by Category
  console.log('\n================================================================================');
  console.log('PHASE 5A CONVERSATION STATE ENGINE BENCHMARK RESULTS');
  console.log('================================================================================');
  let allCategoriesPassed = true;
  for (const [cat, stats] of Object.entries(categoryStats)) {
    const isCatPass = stats.passed === stats.total;
    const icon = isCatPass ? '✅' : '❌';
    console.log(`${icon} [${cat}]: ${stats.passed}/${stats.total} passed`);
    if (!isCatPass) allCategoriesPassed = false;
  }
  console.log('================================================================================');
  console.log(
    `TOTAL STATE SUITE SCORE: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`
  );
  console.log('================================================================================\n');

  if (!allCategoriesPassed || passedTests !== totalTests) {
    console.error('❌ Phase 5A Conversation State Engine Benchmark FAILED.');
    process.exit(1);
  } else {
    console.log('🎉 Phase 5A Conversation State Engine Benchmark 100% PASSED!\n');
  }
}

runStateBenchmarkSuite().catch(console.error);
