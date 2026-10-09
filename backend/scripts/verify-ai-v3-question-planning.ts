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

  console.log('AI V3 QUESTION-TO-EVIDENCE PLANNING: PASS (3 scenarios)');
}

try {
  await main();
} catch (error) {
  console.error('AI V3 QUESTION-TO-EVIDENCE PLANNING: FAIL');
  console.error(error);
  process.exitCode = 1;
}
