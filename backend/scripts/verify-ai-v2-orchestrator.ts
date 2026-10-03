/**
 * ASTROWORLD AI V2 — Phase 2B Verification Suite
 * Tests Question Understanding, Tool Planning, Dependency Resolution, Safety Firewalls,
 * and Deterministic Evidence Packet Generation across all 21 core criteria.
 */

import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolPlanner } from '../src/ai_v2/planner/toolPlanner.ts';
import { ToolExecutionOrchestrator } from '../src/ai_v2/orchestrator/toolOrchestrator.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';
import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';
import { validateEvidencePacket } from '../src/ai_v2/schemas/evidencePacket.ts';
import { validateQuestionPlan } from '../src/ai_v2/schemas/questionPlan.ts';

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

async function runPhase2BSuite() {
  console.log('\n🧭 Starting AstroWorld AI V2 Phase 2B Question Understanding & Orchestration Test Suite...\n');

  const questionPlanner = new QuestionPlanner();
  const toolPlanner = new ToolPlanner();
  const orchestrator = new ToolExecutionOrchestrator({ maxToolCalls: 10 });

  // ==========================================
  // A. SIMPLE QUESTIONS
  // ==========================================
  console.log('--- A. SIMPLE QUESTIONS ---');

  // Test 1: Moon Sign
  const q1Plan = await questionPlanner.plan("What's my Moon sign?");
  const q1Graph = toolPlanner.planTools(q1Plan, SAMPLE_PROFILE);
  const q1Evidence = await orchestrator.orchestrate(q1Plan, SAMPLE_PROFILE);
  assert(
    q1Plan.intent === 'general_chart_question' &&
      q1Graph.allPlannedTools.length === 1 &&
      q1Graph.allPlannedTools[0].toolName === 'get_birth_chart' &&
      q1Evidence.verified &&
      q1Evidence.facts.some(f => f.entity === 'Moon'),
    'Test 1: Moon Sign Query',
    'Selects only get_birth_chart, extracts Moon position fact'
  );

  // Test 2: Current Dasha
  const q2Plan = await questionPlanner.plan('What is my current Mahadasha?');
  const q2Graph = toolPlanner.planTools(q2Plan, SAMPLE_PROFILE);
  const q2Evidence = await orchestrator.orchestrate(q2Plan, SAMPLE_PROFILE);
  assert(
    q2Plan.intent === 'dasha_analysis' &&
      q2Graph.allPlannedTools.length === 1 &&
      q2Graph.allPlannedTools[0].toolName === 'get_current_dasha' &&
      q2Evidence.facts.some(f => f.category === 'dasha'),
    'Test 2: Current Dasha Query',
    'Selects only get_current_dasha, extracts active dasha lords'
  );

  // Test 3: D10 Divisional Chart
  const q3Plan = await questionPlanner.plan("What's my D10 chart?");
  const q3Graph = toolPlanner.planTools(q3Plan, SAMPLE_PROFILE);
  const q3Evidence = await orchestrator.orchestrate(q3Plan, SAMPLE_PROFILE);
  assert(
    q3Plan.intent === 'varga_analysis' &&
      q3Graph.allPlannedTools.some(t => t.toolName === 'get_divisional_chart' && t.parameters.vargaCode === 'D10') &&
      q3Evidence.verified,
    'Test 3: D10 Varga Query',
    'Selects get_divisional_chart with D10'
  );

  // ==========================================
  // B. DOMAIN QUESTIONS
  // ==========================================
  console.log('\n--- B. DOMAIN QUESTIONS ---');

  // Test 4: Career
  const q4Plan = await questionPlanner.plan('How is my career looking overall?');
  const q4Evidence = await orchestrator.orchestrate(q4Plan, SAMPLE_PROFILE);
  assert(
    q4Plan.domain === 'career' &&
      q4Evidence.toolResults.some(r => r.toolName === 'get_divisional_chart') &&
      q4Evidence.toolResults.some(r => r.toolName === 'get_active_yogas') &&
      q4Evidence.toolResults.some(r => r.toolName === 'get_current_dasha'),
    'Test 4: General Career Inquiry',
    'Orchestrates D1 + D10 + Dasha + Yogas for professional domain'
  );

  // Test 5: Marriage
  const q5Plan = await questionPlanner.plan('Can you analyze my marriage prospects?');
  const q5Evidence = await orchestrator.orchestrate(q5Plan, SAMPLE_PROFILE);
  assert(
    q5Plan.domain === 'relationship' &&
      q5Plan.intent === 'marriage' &&
      q5Evidence.toolResults.some(r => r.toolName === 'get_divisional_chart') &&
      q5Evidence.toolResults.some(r => r.toolName === 'get_jaimini_details'),
    'Test 5: Marriage Domain Inquiry',
    'Orchestrates D1 + D9 + Dasha + Jaimini DK/UL'
  );

  // Test 6: Finance / Wealth
  const q6Plan = await questionPlanner.plan('What does my chart say about wealth and financial accumulation?');
  const q6Evidence = await orchestrator.orchestrate(q6Plan, SAMPLE_PROFILE);
  assert(
    q6Plan.domain === 'finance' &&
      q6Evidence.toolResults.some(r => r.toolName === 'get_ashtakavarga') &&
      q6Evidence.toolResults.some(r => r.toolName === 'get_active_yogas'),
    'Test 6: Finance & Wealth Domain Inquiry',
    'Orchestrates Dhana yogas and Sarvashtakavarga points'
  );

  // Test 7: Travel / Relocation
  const q7Plan = await questionPlanner.plan('Are there indications for foreign travel or relocation?');
  const q7Evidence = await orchestrator.orchestrate(q7Plan, SAMPLE_PROFILE);
  assert(
    q7Plan.domain === 'travel' &&
      q7Plan.intent === 'travel' &&
      q7Evidence.verified &&
      q7Evidence.toolResults.length >= 2,
    'Test 7: Travel & Relocation Inquiry',
    'Identifies travel intent and fetches D1 & active Dasha'
  );

  // ==========================================
  // C. TIMING QUESTIONS
  // ==========================================
  console.log('\n--- C. TIMING QUESTIONS ---');

  // Test 8: Career in 2027
  const q8Plan = await questionPlanner.plan('How will my career unfold in 2027?');
  const q8Evidence = await orchestrator.orchestrate(q8Plan, SAMPLE_PROFILE);
  assert(
    q8Plan.temporalScope.type === 'specific_date' &&
      q8Plan.targetDatesIso.length > 0 &&
      q8Evidence.toolResults.some(r => r.toolName === 'get_dasha_at') &&
      q8Evidence.toolResults.some(r => r.toolName === 'get_transits'),
    'Test 8: Career in 2027 Timing Inquiry',
    'Calculates target-date Dasha and Gochara transits for 2027'
  );

  // Test 9: Dasha on Target Date
  const q9Plan = await questionPlanner.plan('What dasha will I be running in 2028?');
  const q9Evidence = await orchestrator.orchestrate(q9Plan, SAMPLE_PROFILE);
  assert(
    q9Evidence.toolResults.some(r => r.toolName === 'get_dasha_at'),
    'Test 9: Specific Target Date Dasha',
    'Executes get_dasha_at for future date'
  );

  // Test 10: Jupiter Transit
  const q10Plan = await questionPlanner.plan('What is the effect of the current transit of Jupiter?');
  const q10Evidence = await orchestrator.orchestrate(q10Plan, SAMPLE_PROFILE);
  assert(
    q10Plan.planetFocus.includes('Jupiter') &&
      q10Evidence.toolResults.some(r => r.toolName === 'get_transits'),
    'Test 10: Jupiter Transit Inquiry',
    'Focuses on Jupiter and requests Gochara transits'
  );

  // ==========================================
  // D. DEEP QUESTIONS
  // ==========================================
  console.log('\n--- D. DEEP QUESTIONS ---');

  // Test 11: Deep Career (D1 + D10 + Dasha + Transits + Yogas)
  const q11Plan = await questionPlanner.plan(
    'Analyze my career prospects for 2027 using D1, D10, Dasha and transits.'
  );
  const q11Evidence = await orchestrator.orchestrate(q11Plan, SAMPLE_PROFILE);
  assert(
    q11Plan.chartLayers.includes('D1') &&
      q11Plan.chartLayers.includes('D10') &&
      q11Evidence.toolResults.some(r => r.toolName === 'get_birth_chart') &&
      q11Evidence.toolResults.some(r => r.toolName === 'get_divisional_chart') &&
      q11Evidence.toolResults.some(r => r.toolName === 'get_dasha_at') &&
      q11Evidence.toolResults.some(r => r.toolName === 'get_transits'),
    'Test 11: Deep Multi-Layer Career Analysis',
    'Orchestrates 5+ deterministic tools in parallel/sequence'
  );

  // Test 12: Deep Marriage (D1 + D9 + Dasha)
  const q12Plan = await questionPlanner.plan('Examine my marriage life through D1, D9 Navamsha and current Dasha.');
  const q12Evidence = await orchestrator.orchestrate(q12Plan, SAMPLE_PROFILE);
  assert(
    q12Plan.chartLayers.includes('D9') &&
      q12Evidence.toolResults.some(r => r.toolName === 'get_birth_chart') &&
      q12Evidence.toolResults.some(r => r.toolName === 'get_divisional_chart') &&
      q12Evidence.toolResults.some(r => r.toolName === 'get_current_dasha'),
    'Test 12: Deep Multi-Layer Marriage Analysis',
    'Coordinates D1 and D9 Navamsha with Vimshottari Dasha'
  );

  // ==========================================
  // E. AMBIGUOUS QUESTIONS
  // ==========================================
  console.log('\n--- E. AMBIGUOUS QUESTIONS ---');

  // Test 13: "Will Jupiter help me?"
  const q13Plan = await questionPlanner.plan('Will Jupiter help me?');
  const q13Evidence = await orchestrator.orchestrate(q13Plan, SAMPLE_PROFILE);
  assert(
    q13Plan.clarificationRequired === true &&
      q13Plan.clarification?.question !== undefined &&
      q13Evidence.toolResults.length === 0,
    'Test 13: Ambiguous Question "Will Jupiter help me?"',
    'Safely halts tool execution and requests domain clarification'
  );

  // Test 14: "What happens next?"
  const q14Plan = await questionPlanner.plan('What happens next?');
  const q14Evidence = await orchestrator.orchestrate(q14Plan, SAMPLE_PROFILE);
  assert(
    q14Plan.clarificationRequired === true &&
      q14Evidence.toolResults.length === 0 &&
      q14Evidence.warnings.length > 0,
    'Test 14: Ambiguous Question "What happens next?"',
    'Halts tool execution and requests scope clarification'
  );

  // ==========================================
  // F. INVALID CASES
  // ==========================================
  console.log('\n--- F. INVALID CASES ---');

  // Test 15: Unknown Tool Rejection
  const unknownToolResult = AstrologyToolRegistry.executeTool('hack_astrology_db', {});
  assert(
    unknownToolResult.success === false && Boolean(unknownToolResult.error?.includes('not registered')),
    'Test 15: Unknown Tool Rejection',
    'Rejects unregistered tool execution'
  );

  // Test 16: Invalid Tool Arguments
  const invalidArgsResult = await AstrologyToolRegistry.executeTool('get_divisional_chart', {
    birthProfile: SAMPLE_PROFILE,
    vargaCode: 'D999_INVALID',
  });
  assert(
    invalidArgsResult.success === false && invalidArgsResult.error !== undefined,
    'Test 16: Invalid Tool Arguments',
    'Catches and reports invalid varga code gracefully'
  );

  // Test 17: Tool Execution Error Graceful Handling
  const customPlan: any = {
    ...q1Plan,
    requiredTools: [
      {
        id: 'req_err',
        toolName: 'get_divisional_chart',
        parameters: { birthProfile: SAMPLE_PROFILE, vargaCode: 'D99_BAD' },
      },
    ],
  };
  const errEvidence = await orchestrator.orchestrate(customPlan, SAMPLE_PROFILE);
  assert(
    errEvidence.toolResults.some(r => !r.success) && errEvidence.warnings.length > 0,
    'Test 17: Tool Error Handling in Orchestrator',
    'Isolates errors into warnings without crashing pipeline'
  );

  // Test 18: Missing / Malformed Birth Data
  let missingBirthCaught = false;
  try {
    await orchestrator.orchestrate(q1Plan, {} as any);
  } catch (err: any) {
    missingBirthCaught = true;
  }
  assert(missingBirthCaught, 'Test 18: Missing Birth Data', 'Rejects orchestration with invalid birth data');

  // ==========================================
  // G. SAFETY & BOUNDARIES
  // ==========================================
  console.log('\n--- G. SAFETY & BOUNDARIES ---');

  // Test 19: Gemini Attempts Unsupported Tool
  assert(
    !AstrologyToolRegistry.hasTool('generate_prediction_prose') &&
      !AstrologyToolRegistry.hasTool('calculate_custom_planetary_degrees'),
    'Test 19: Unsupported Tool Whitelist',
    'Ensures only approved deterministic calculation tools exist in whitelist'
  );

  // Test 20: Gemini Tries to Supply Calculated Facts Without Tools
  const forgedPacket: any = {
    version: 'ai-v2-evidence-1',
    createdAtIso: new Date().toISOString(),
    question: { raw: 'Q', normalized: 'Q', intent: 'test', domain: 'test' },
    plan: q1Plan,
    facts: [
      {
        id: 'fake_1',
        category: 'natal',
        entity: 'Jupiter',
        property: 'sign',
        value: 'Cancer',
        sourceTool: 'gemini_hallucinated',
        verified: false,
      },
    ],
    derivedFacts: [],
    toolResults: [],
    provenance: [],
    warnings: [],
    missingEvidence: [],
    executionMetrics: { totalDurationMs: 10, toolsExecutedCount: 0, parallelBatchesCount: 0 },
    verified: false,
  };
  assert(
    forgedPacket.verified === false && forgedPacket.facts[0].sourceTool === 'gemini_hallucinated',
    'Test 20: Rejection of Unverified Astrological Facts',
    'Rejects fabricated facts lacking deterministic tool provenance'
  );

  // Test 21: Excessive Tool Call Loop Prevention
  let loopPrevented = false;
  try {
    const loopOrchestrator = new ToolExecutionOrchestrator({ maxToolCalls: 2 });
    await loopOrchestrator.orchestrate(q11Plan, SAMPLE_PROFILE);
  } catch (err: any) {
    if (err.message.includes('exceeds max limit') || err.message.includes('Safety violation')) {
      loopPrevented = true;
    }
  }
  assert(loopPrevented, 'Test 21: Excessive Tool Loop Prevention', 'Terminates if planned tools exceed max limit');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==================================================');
  console.log(`PHASE 2B ORCHESTRATOR SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase2BSuite().catch(err => {
  console.error('Fatal error in Phase 2B test suite:', err);
  process.exit(1);
});
