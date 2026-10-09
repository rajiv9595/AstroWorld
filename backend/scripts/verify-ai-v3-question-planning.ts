/**
 * AI V3 Phase 2 — question-to-evidence planning regression contracts.
 *
 * These tests ensure relocation/foreign-settlement questions request evidence
 * appropriate to the question and that adding "abroad" to career questions does
 * not erase the career chart or its timing context.
 */

import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolPlanner } from '../src/ai_v2/planner/toolPlanner.ts';
import { BirthProfile } from '../src/ai_v2/schemas/birthProfile.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const PROFILE: BirthProfile = {
  name: 'AI V3 Planning Regression',
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
};

async function main(): Promise<void> {
  const questionPlanner = new QuestionPlanner({ geminiApiKey: '' });
  const toolPlanner = new ToolPlanner();

  // Case 1: A pure foreign-settlement question needs more than D1 + current dasha.
  const settlementQuestion = 'Will I settle abroad permanently in 2027?';
  const settlementPlan = await questionPlanner.plan(settlementQuestion);
  const settlementGraph = toolPlanner.planTools(settlementPlan, PROFILE);
  const settlementTools = settlementGraph.allPlannedTools.map(tool => tool.toolName);
  const settlementVargas = settlementGraph.allPlannedTools
    .filter(tool => tool.toolName === 'get_divisional_chart')
    .map(tool => tool.parameters.vargaCode);

  assert(
    settlementPlan.domain === 'travel',
    'A foreign-settlement question should retain the travel/relocation domain.',
  );
  assert(
    settlementVargas.includes('D4'),
    'Foreign settlement planning must include the D4 relocation/property-related divisional chart.',
  );
  assert(
    settlementTools.includes('get_dasha_at') && settlementTools.includes('get_transits'),
    'A dated foreign-settlement question must evaluate the target-period dasha and transits.',
  );

  // Case 2: A foreign-career question must preserve both D10 career evidence and D4 relocation context.
  const careerQuestion = 'Will my career take me abroad in 2027?';
  const careerPlan = await questionPlanner.plan(careerQuestion);
  const careerGraph = toolPlanner.planTools(careerPlan, PROFILE);
  const careerTools = careerGraph.allPlannedTools.map(tool => tool.toolName);
  const careerVargas = careerGraph.allPlannedTools
    .filter(tool => tool.toolName === 'get_divisional_chart')
    .map(tool => tool.parameters.vargaCode);

  assert(
    careerPlan.domain === 'career' && careerVargas.includes('D10'),
    'A career-abroad question must retain the normal D10 career evidence.',
  );
  assert(
    careerVargas.includes('D4'),
    'A career-abroad question must additionally request relocation context rather than dropping the foreign dimension.',
  );
  assert(
    careerTools.includes('get_dasha_at') && careerTools.includes('get_transits'),
    'A dated career-abroad question must preserve target-period timing evidence.',
  );

  // Case 3: A normal career timing question must not acquire relocation-only D4 evidence.
  const normalCareerPlan = await questionPlanner.plan('Will I get a promotion in 2027?');
  const normalCareerGraph = toolPlanner.planTools(normalCareerPlan, PROFILE);
  const normalCareerVargas = normalCareerGraph.allPlannedTools
    .filter(tool => tool.toolName === 'get_divisional_chart')
    .map(tool => tool.parameters.vargaCode);

  assert(
    normalCareerVargas.includes('D10') && !normalCareerVargas.includes('D4'),
    'A normal promotion question should retain D10 without unrelated relocation tools.',
  );

  // Case 4: Compound questions preserve more than one life-domain and their date window.
  const compoundQuestion = 'Will I get a promotion and improve my income between 2027 and 2029?';
  const compoundPlan = await questionPlanner.plan(compoundQuestion);
  const compoundGraph = toolPlanner.planTools(compoundPlan, PROFILE);
  const compoundTools = compoundGraph.allPlannedTools.map(tool => tool.toolName);
  const compoundSecondaryDomains = (compoundPlan as any).secondaryDomains || [];

  assert(
    compoundPlan.domain === 'career' && compoundSecondaryDomains.includes('finance'),
    'A compound career-and-income question must preserve finance as an additional evidence domain.',
  );
  assert(
    compoundPlan.temporalScope.type === 'date_range' &&
      compoundPlan.temporalScope.startIso?.startsWith('2027-01-01') &&
      compoundPlan.temporalScope.endIso?.startsWith('2029-12-31') &&
      compoundPlan.targetDatesIso.length === 3,
    'A multi-year question must preserve its complete date range and representative dates.',
  );
  assert(
    compoundTools.includes('get_ashtakavarga') && compoundTools.includes('get_active_yogas'),
    'Compound financial questions must add financial evidence even when career remains the primary domain.',
  );

  // Case 5: An elliptical follow-up adds a new dimension without dropping prior intent or timing.
  const priorQuestion = 'Will I get a promotion between 2027 and 2029?';
  const followUpPlan = await questionPlanner.plan('What about abroad?', { prevUserText: priorQuestion });
  const followUpGraph = toolPlanner.planTools(followUpPlan, PROFILE);
  const followUpTools = followUpGraph.allPlannedTools.map(tool => tool.toolName);
  const followUpVargas = followUpGraph.allPlannedTools
    .filter(tool => tool.toolName === 'get_divisional_chart')
    .map(tool => tool.parameters.vargaCode);

  assert(
    followUpPlan.domain === 'travel' && ((followUpPlan as any).secondaryDomains || []).includes('career'),
    'An elliptical abroad follow-up must retain the prior career domain as secondary evidence.',
  );
  assert(
    followUpVargas.includes('D4') && followUpVargas.includes('D10'),
    'A career follow-up about relocation must include both D4 and D10 evidence.',
  );
  assert(
    followUpPlan.temporalScope.type === 'date_range' &&
      followUpPlan.temporalScope.startIso?.startsWith('2027-01-01') &&
      followUpPlan.temporalScope.endIso?.startsWith('2029-12-31'),
    'An undated follow-up must inherit the prior question’s full time window.',
  );
  assert(
    followUpTools.includes('get_dasha_at') && followUpTools.includes('get_transits'),
    'The inherited date window must continue to trigger target-period timing evidence.',
  );

  // Case 6: Safety against over-planning vague prompts remains intact.
  const ambiguousPlan = await questionPlanner.plan('What should I do?');
  const ambiguousGraph = toolPlanner.planTools(ambiguousPlan, PROFILE);
  assert(
    ambiguousPlan.clarificationRequired && ambiguousGraph.allPlannedTools.length === 0,
    'A genuinely ambiguous question must still pause for clarification rather than guess evidence.',
  );

  console.log('AI V3 QUESTION-TO-EVIDENCE PLANNING: PASS (6 scenarios)');
}

try {
  await main();
} catch (error) {
  console.error('AI V3 QUESTION-TO-EVIDENCE PLANNING: FAIL');
  console.error(error);
  process.exitCode = 1;
}
