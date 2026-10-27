/**
 * ASTROWORLD — Daivajna Architecture & Prompt Verification Suite
 * 
 * Verifies:
 * 1. 5-Tier Luxury Daivajna Consultation Layout
 * 2. Past Flashback Anchor Rule (Empirical Icebreaker)
 * 3. Strict Chalit Sandhi Longitudinal Verification
 * 4. Karmic Weather vs. Free Will (Purushartha) Epistemic Balance
 * 5. Multi-Turn Follow-Up Laser Directness
 */

import { getAgentSystemInstruction } from '../src/ai/agent/systemPrompt.ts';

function assert(condition: boolean, testName: string, detail: string) {
  if (!condition) {
    console.error(`❌ [FAILED] ${testName}: ${detail}`);
    throw new Error(`Assertion failed in ${testName}: ${detail}`);
  }
  console.log(`✅ [PASSED] ${testName}: ${detail}`);
}

async function runDaivajnaArchitectureVerification() {
  console.log('🏛️ Starting AstroWorld Daivajna Architecture & Prompt Verification Suite...\n');

  // Test 1: Fresh Consultation System Prompt
  const freshPrompt = getAgentSystemInstruction('Current Horizon: 2026–2028', {
    isFollowUp: false,
    timingDirectQuery: false,
    communicationModality: 'balanced',
    conversationalRegister: 'balanced_mentor',
  });

  assert(freshPrompt.includes('5-TIER DAIVAJNA LUXURY CONSULTATION ARCHITECTURE'), 'Test 1A: 5-Tier Architecture Present', 'System prompt includes 5-Tier Daivajna layout');
  assert(freshPrompt.includes('The Oracle Verdict'), 'Test 1B: Tier 1 Oracle Verdict', 'Includes Oracle Verdict directive');
  assert(freshPrompt.includes('Astronomical & Shastric Confluence'), 'Test 1C: Tier 2 Confluence', 'Includes D1/Chalit/Varga/D60 confluence');
  assert(freshPrompt.includes('Frontier Timing & Active Triggers'), 'Test 1D: Tier 3 Timing', 'Includes Dasha/Double Transit/Sarvatobhadra/Kakshya');
  assert(freshPrompt.includes('Chronological Milestone Roadmap'), 'Test 1E: Tier 4 Roadmap', 'Includes quarterly timeline table directive');
  assert(freshPrompt.includes('Authentic Remedial Blueprint'), 'Test 1F: Tier 5 Upayas', 'Includes gemstones/Daana/mantras/habits');

  // Test 2: Past Flashback Anchor Rule
  assert(freshPrompt.includes('PAST FLASHBACK ANCHOR RULE'), 'Test 2A: Past Flashback Anchor Rule', 'Includes Past Flashback anchor instruction');
  assert(freshPrompt.includes('empirical anchor of astrological truth'), 'Test 2B: Icebreaker Authority', 'Directs citation of historical milestone before future');

  // Test 3: Chalit Sandhi Verification
  assert(freshPrompt.includes('STRICT CHALIT SANDHI LONGITUDINAL VERIFICATION'), 'Test 3A: Chalit Sandhi Rule', 'Includes strict Chalit vs Rashi distinction');
  assert(freshPrompt.includes('Sandhi boundary'), 'Test 3B: Sandhi Boundary Check', 'Instructs checking boundary crossings');

  // Test 4: Karmic Weather vs Purushartha
  assert(freshPrompt.includes('KARMIC WEATHER VS. PURUSHARTHA'), 'Test 4A: Purushartha Epistemic Tone', 'Includes cosmic weather vs human agency philosophy');
  assert(freshPrompt.includes('alchemical crucible'), 'Test 4B: Constructive Framing', 'Forbids fatalism and frames trials as crucibles');

  // Test 5: Follow-Up Turn Continuity
  const followUpPrompt = getAgentSystemInstruction('Current Horizon: 2026–2028', {
    isFollowUp: true,
    timingDirectQuery: true,
    communicationModality: 'auditory_digital',
    conversationalRegister: 'scholarly_technical',
  });

  assert(followUpPrompt.includes('FOLLOW-UP CONVERSATION TURN'), 'Test 5A: Follow-Up Directive Active', 'Instructs no greeting repetitions on follow-ups');
  assert(followUpPrompt.includes('Jump IMMEDIATELY and directly into answering their specific follow-up'), 'Test 5B: Laser Focus on Follow-Up', 'Mandates immediate direct answer on line 1');
  assert(followUpPrompt.includes('DIRECT TIMING INQUIRY DETECTED'), 'Test 5C: Timing Inquiry Handling', 'Directs verdict in the very first sentence');

  console.log('\n=================================================================');
  console.log('🎉 ALL DAIVAJNA ARCHITECTURE & PROMPT TESTS PASSED (100% GREEN)!');
  console.log('=================================================================\n');
}

runDaivajnaArchitectureVerification().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
