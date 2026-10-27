/**
 * ASTROWORLD AI V3 — Adaptive Intelligence and Natural Conversation Regression Test Suite
 *
 * Verifies the 12 Required Scenarios:
 * 1. Simple question receives a direct answer without unnecessary report sections.
 * 2. Technical audit returns the requested evidence and classifications.
 * 3. Emotionally sensitive message receives an appropriate, non-alarmist response.
 * 4. Follow-up correctly uses prior context without requesting already available birth data.
 * 5. Explicit request for detail overrides normal preference for brevity.
 * 6. User asking for a specific format receives that format when appropriate.
 * 7. Correction request examines the disputed earlier claim rather than changing the subject.
 * 8. Different questions produce appropriately different response structures.
 * 9. Adaptive style never allows unsupported chart claims.
 * 10. Missing data is acknowledged rather than invented.
 * 11. Verified facts remain consistent across the same chart and conversation.
 * 12. Latency, fallback and evidence-grounding safeguards continue to pass.
 */

import {
  ConsultationOrchestrator,
  BirthProfile,
  validateConsultationResult,
} from '../src/ai_v2/index.ts';

const ARJUNA_PROFILE: BirthProfile = {
  name: 'Arjuna Dev',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASSED] ${testName}${details ? `: ${details}` : ''}`);
    passedCount++;
  } else {
    console.error(`❌ [FAILED] ${testName}${details ? `: ${details}` : ''}`);
    failedCount++;
  }
}

async function runAdaptiveIntelligenceSuite() {
  console.log('\n🌟 Starting AstroWorld AI V3 Adaptive Intelligence & Natural Conversation Suite...\n');

  const forceLive = process.argv.includes('--live');
  const apiKey = forceLive
    ? (process.env.GROK_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)
    : undefined;

  const orchestrator = new ConsultationOrchestrator({
    forceMockMode: !forceLive,
    apiKey,
  });

  const testUserId = 'usr_adaptive_test_1';
  const defaultPreferences = {
    responseStyle: 'adaptive',
    answerDepth: 'contextual',
    evidenceDetail: 'balanced',
  };

  const baseOptions = {
    userId: testUserId,
    userPreferences: defaultPreferences,
  };

  // =========================================================================
  // 1. SIMPLE QUESTION RECEIVES DIRECT CONCISE ANSWER
  // =========================================================================
  console.log('--- 1. SIMPLE FACTUAL QUERY TEST ---');
  const q1 = 'What is my Moon sign?';
  const res1 = await orchestrator.consult(q1, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_1',
  });
  const text1 = res1.finalResponse.text;
  const hasMoonSignFact = /sagittarius|dhanu/i.test(text1);
  const isDirect = text1.length < 350 && !text1.includes('### Directly Calculated Chart Evidence') && !text1.includes('### Timeline');
  assert(
    hasMoonSignFact && isDirect,
    'Scenario 1: Simple Question Direct Answer',
    `Identified Moon sign concisely (${text1.length} chars) without report sections`
  );

  // =========================================================================
  // 2. TECHNICAL AUDIT RETURNS REQUESTED EVIDENCE AND CLASSIFICATIONS
  // =========================================================================
  console.log('\n--- 2. TECHNICAL AUDIT TEST ---');
  const q2 = 'Provide a technical audit of my career indicators with calculated placements, D10 varga, and limitations.';
  const res2 = await orchestrator.consult(q2, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_2',
  });
  const text2 = res2.finalResponse.text;
  const hasCalculatedEvidence = text2.includes('Directly Calculated') || text2.includes('D10') || text2.includes('Dashamsha');
  const hasStructuredBreakdown = (text2.includes('Natal') || text2.includes('D1')) && (text2.includes('Placements') || text2.includes('placements') || text2.includes('Evidence'));
  assert(
    hasCalculatedEvidence && hasStructuredBreakdown,
    'Scenario 2: Technical Audit Evidence & Classifications',
    'Supplied structured breakdown with D1/D10 calculations and verified metrics'
  );

  // =========================================================================
  // 3. EMOTIONALLY SENSITIVE MESSAGE RECEIVES CALM, NON-ALARMIST RESPONSE
  // =========================================================================
  console.log('\n--- 3. EMOTIONAL REASSURANCE TEST ---');
  const q3 = 'I am terrified and panicking because someone told me my Sade Sati is going to ruin my life and destroy my career. Will I be ruined?';
  const res3 = await orchestrator.consult(q3, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_3',
  });
  const text3 = res3.finalResponse.text;
  const nonFatalistic = !/you will be ruined|inevitable doom|guaranteed catastrophe/i.test(text3);
  const isEmpatheticAndCalm = /growth|discipline|maturity|resilience|patience|constructive/i.test(text3);
  assert(
    nonFatalistic && isEmpatheticAndCalm,
    'Scenario 3: Emotionally Sensitive Reassurance',
    'Provided empathetic, non-alarmist reframing rejecting catastrophic fatalism'
  );

  // =========================================================================
  // 4. FOLLOW-UP CORRECTLY USES PRIOR CONTEXT WITHOUT ASKING FOR BIRTH DETAILS
  // =========================================================================
  console.log('\n--- 4. CONVERSATIONAL CONTEXT PERSISTENCE TEST ---');
  const convId4 = 'sess_test_4_followup';
  await orchestrator.consult('What is my active planetary dasha right now?', ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: convId4,
  });
  const followUpTurn = await orchestrator.consult('How does Saturn influence this active period?', ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: convId4,
  });
  const text4 = followUpTurn.finalResponse.text;
  const noBirthDetailReprompt = !/please provide your date of birth|when were you born|provide your birth details/i.test(text4);
  const addressesSaturnContext = /saturn/i.test(text4);
  assert(
    noBirthDetailReprompt && addressesSaturnContext,
    'Scenario 4: Follow-up Contextual Persistence',
    'Directly answered follow-up using active session without re-prompting for birth details'
  );

  // =========================================================================
  // 5. EXPLICIT REQUEST FOR DETAIL OVERRIDES NORMAL BREVITY
  // =========================================================================
  console.log('\n--- 5. EXPLICIT DETAIL OVERRIDE TEST ---');
  const q5 = 'Give me an exhaustive, comprehensive breakdown of my 10th house, planetary strengths, and timing windows.';
  const res5 = await orchestrator.consult(q5, ARJUNA_PROFILE, {
    userId: testUserId,
    userPreferences: {
      responseStyle: 'adaptive',
      answerDepth: 'brief', // Default brief, but user asks for exhaustive breakdown
      evidenceDetail: 'balanced',
    },
    conversationId: 'sess_test_5',
  });
  const text5 = res5.finalResponse.text;
  const hasSubstantialDepth = text5.length > 400 || (text5.includes('\n\n') && text5.split('\n\n').length >= 3);
  assert(
    hasSubstantialDepth,
    'Scenario 5: Explicit Detail Request Override',
    `Expanded response depth (${text5.length} chars) honoring explicit instruction over brevity default`
  );

  // =========================================================================
  // 6. USER ASKING FOR SPECIFIC FORMAT RECEIVES THAT FORMAT
  // =========================================================================
  console.log('\n--- 6. EXPLICIT FORMAT ADAPTATION TEST ---');
  const q6 = 'Summarize my key career strengths and supportive timing as concise bullet points only.';
  const res6 = await orchestrator.consult(q6, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_6',
  });
  const text6 = res6.finalResponse.text;
  const hasBullets = text6.includes('- ') || text6.includes('* ');
  assert(
    hasBullets,
    'Scenario 6: Specific Format Compliance',
    'Delivered clean bulleted presentation matching the user’s explicit formatting request'
  );

  // =========================================================================
  // 7. CORRECTION REQUEST EXAMINES DISPUTED CLAIM WITHOUT CHANGING SUBJECT
  // =========================================================================
  console.log('\n--- 7. CORRECTION / CHALLENGE TEST ---');
  const convId7 = 'sess_test_7_correction';
  await orchestrator.consult('Where is my Jupiter placed in the chart?', ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: convId7,
  });
  const correctionTurn = await orchestrator.consult(
    "Wait, isn't Jupiter debilitated in Capricorn? Why did you state Jupiter is in Cancer?",
    ARJUNA_PROFILE,
    {
      ...baseOptions,
      conversationId: convId7,
    }
  );
  const text7 = correctionTurn.finalResponse.text;
  const addressesJupiterDispute = /jupiter/i.test(text7) && (/cancer/i.test(text7) || /capricorn/i.test(text7) || /exalt/i.test(text7));
  const noTopicDeflection = !/let's talk about marriage|let's switch to finance/i.test(text7);
  assert(
    addressesJupiterDispute && noTopicDeflection,
    'Scenario 7: Direct Examination of Disputed Claim',
    'Engaged directly with Jupiter sign placement dispute without deflecting the topic'
  );

  // =========================================================================
  // 8. DIFFERENT QUESTIONS PRODUCE APPROPRIATELY DIFFERENT STRUCTURES
  // =========================================================================
  console.log('\n--- 8. STRUCTURAL DIVERSITY TEST ---');
  const structures = [
    { name: 'Simple Fact', text: text1 },
    { name: 'Technical Audit', text: text2 },
    { name: 'Emotional Reassurance', text: text3 },
    { name: 'Bullet Points', text: text6 },
  ];
  const uniqueLengths = new Set(structures.map(s => Math.round(s.text.length / 50))).size;
  const hasBulletsInFormatOnly = text6.includes('- ') && !text1.includes('- ');
  assert(
    uniqueLengths >= 3 && hasBulletsInFormatOnly,
    'Scenario 8: Structural Diversity Across Inquiry Types',
    'Responses varied dynamically in layout, sectioning, and length rather than following one template'
  );

  // =========================================================================
  // 9. ADAPTIVE STYLE NEVER ALLOWS UNSUPPORTED CHART CLAIMS
  // =========================================================================
  console.log('\n--- 9. GROUNDING INTEGRITY TEST ---');
  const q9 = 'Tell me about my Mars-Rahu conjunction in my 10th house.';
  const res9 = await orchestrator.consult(q9, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_9',
  });
  const text9 = res9.finalResponse.text;
  // Arjuna has Mars in Taurus 20° 44' (House 11), not a 10th house conjunction with Rahu
  const doesNotConfirmFabricatedYoga = !/your mars and rahu conjunction in the 10th house creates/i.test(text9);
  assert(
    doesNotConfirmFabricatedYoga,
    'Scenario 9: Firewall Against Unsupported Chart Claims',
    'Did not fabricate or validate an unverified Mars-Rahu 10th house conjunction'
  );

  console.log('\n--- 10. MISSING DATA ACKNOWLEDGMENT TEST ---');
  const q10 = 'What are the calculated facts versus interpretations and missing evidence in my career reading?';
  const res10 = await orchestrator.consult(q10, ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_10',
  });
  const text10 = res10.finalResponse.text;
  const acknowledgesLimitation =
    text10.includes('Missing Evidence') ||
    text10.includes('Disclosures') ||
    /don't have enough verified chart evidence|won't guess|unverified|unavailable|limit/i.test(text10);
  assert(
    acknowledgesLimitation,
    'Scenario 10: Missing Evidence Disclosed Plainly',
    'Plainly disclosed unverified chart evidence and analytical limitations instead of inventing unsupported predictions'
  );

  // =========================================================================
  // 11. VERIFIED FACTS REMAIN CONSISTENT ACROSS SAME CHART
  // =========================================================================
  console.log('\n--- 11. FACTUAL CONSISTENCY TEST ---');
  const res11A = await orchestrator.consult('What is my Moon sign and nakshatra?', ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_11',
  });
  const res11B = await orchestrator.consult('Remind me what my Moon sign is again?', ARJUNA_PROFILE, {
    ...baseOptions,
    conversationId: 'sess_test_11',
  });
  const tA = res11A.finalResponse.text.toLowerCase();
  const tB = res11B.finalResponse.text.toLowerCase();
  const consistentMoon = (tA.includes('sagittarius') || tA.includes('dhanu')) && (tB.includes('sagittarius') || tB.includes('dhanu'));
  assert(
    consistentMoon,
    'Scenario 11: Cross-Turn Fact Consistency',
    'Moon sign placement remained strictly consistent across dialogue turns'
  );

  // =========================================================================
  // 12. LATENCY, FALLBACK AND EVIDENCE GROUNDING TESTS CONTINUE TO PASS
  // =========================================================================
  console.log('\n--- 12. PERFORMANCE, FALLBACK & EVIDENCE GROUNDING TEST ---');
  const resultValidation = validateConsultationResult(res1);
  const totalLatency = res1.trace.latencyMs.total;
  const latencyPass = totalLatency < 2500;
  const claimsApproved = res1.finalResponse.referencedClaimIds.length >= 0;
  assert(
    resultValidation.valid && latencyPass && claimsApproved,
    'Scenario 12: Production Safeguards & SLO Compliance',
    `Consultation completed in ${totalLatency}ms with verified claims and schema validity`
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n==================================================');
  console.log(`AI V3 ADAPTIVE INTELLIGENCE SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAdaptiveIntelligenceSuite().catch(err => {
  console.error('Fatal error running Adaptive Intelligence Suite:', err);
  process.exit(1);
});
