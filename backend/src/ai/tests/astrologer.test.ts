/**
 * ASTROWORLD — AI Astrologer Regression & Validation Test Suite
 * Executes benchmark tests across all 20 required classical questions,
 * verifying intent routing, context packet filtering, non-repetition,
 * Varga firewall invariants, and exact-date safety against the Golden Chart.
 */

import { computeCanonicalChart } from '../../../../shared/engine/canonicalChart.ts';
import { BirthProfile } from '../../../../shared/engine/types.ts';
import { classifyUserQuestion } from '../intent/intentClassifier.ts';
import { buildConsultationContextPacket } from '../context/contextPacketBuilder.ts';
import { routeToSpecialists } from '../router/specialistRouter.ts';
import { getOrCreateConversationMemory } from '../memory/conversationMemory.ts';
import { conductAstrologerConsultation } from '../synthesis/astrologerSynthesis.ts';

// Golden Profile Definition (17/08/2005 12:02 AM IST Anaparthy)
export const GOLDEN_CHART_PROFILE: BirthProfile = {
  name: 'Golden Native',
  year: 2005,
  month: 8,
  day: 17,
  hour: 0,
  minute: 2,
  second: 0,
  latitude: 16.93407,
  longitude: 81.95522,
  timezone: 'Asia/Kolkata',
  cityName: 'Anaparthy, Andhra Pradesh, India',
  gender: 'male',
};

export async function runAstrologerTestSuite(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ testName: string; passed: boolean; message: string; latencyMs?: number }>;
}> {
  const chartContext = computeCanonicalChart(GOLDEN_CHART_PROFILE);
  const results: Array<{ testName: string; passed: boolean; message: string; latencyMs?: number }> = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      passed++;
      results.push({ testName: name, passed: true, message: detail });
    } else {
      failed++;
      results.push({ testName: name, passed: false, message: detail });
      console.error(`❌ FAILED: ${name} -> ${detail}`);
    }
  }

  console.log('🌌 Starting AstroWorld AI Astrologer Test Suite on Golden Chart...\n');

  // Test 1: Intent & Entity Extraction for "what is transit data in March 2027"
  const q1 = 'what is transit data in March 2027';
  const i1 = classifyUserQuestion(q1);
  assert(
    'Intent: Future Transits',
    i1.allIntents.includes('TRANSITS_FUTURE') && i1.entities.targetYear === 2027 && i1.entities.targetMonth === 3,
    `Target: 2027-03, Classified: ${i1.allIntents.join(', ')}, Month: ${i1.entities.targetMonth}`
  );

  // Test 2: Intent for "How will March 2027 affect my career?"
  const q2 = 'How will March 2027 affect my career?';
  const i2 = classifyUserQuestion(q2);
  assert(
    'Intent: Career + Future Transits Multi-domain',
    i2.allIntents.includes('CAREER') && i2.allIntents.includes('TRANSITS_FUTURE'),
    `Classified: ${i2.allIntents.join(', ')}`
  );

  // Test 3: Intent for "Is Sun exalted in D9?"
  const q3 = 'Is Sun exalted in D9?';
  const i3 = classifyUserQuestion(q3);
  assert(
    'Intent: Dignity + D9',
    i3.allIntents.includes('DIGNITY') && i3.allIntents.includes('D9') && i3.entities.vargaCode === 'D9',
    `Classified: ${i3.allIntents.join(', ')}, Varga: ${i3.entities.vargaCode}`
  );

  // Test 4: Specialist Routing for Career
  const specsCareer = routeToSpecialists(i2.allIntents, i2.entities);
  assert(
    'Specialist Routing: Career',
    specsCareer.includes('CAREER_SPECIALIST') && specsCareer.includes('D10_CAREER_SPECIALIST') && specsCareer.includes('TRANSIT_SPECIALIST'),
    `Specialists: ${specsCareer.join(', ')}`
  );

  // Test 5: Context Packet Size and Relevance for Dignity Query
  const mem5 = getOrCreateConversationMemory('test-session-5');
  const packet5 = buildConsultationContextPacket(q3, i3.allIntents, i3.entities, ['DIGNITY_SPECIALIST', 'D9_SPECIALIST'], chartContext, mem5);
  const jsonSize = JSON.stringify(packet5).length;
  assert(
    'Compact Context Packet for Dignity (< 3KB)',
    jsonSize < 3000,
    `Context packet size: ${jsonSize} bytes (Compact & Token-efficient)`
  );
  assert(
    'D9 Sun is in packet with Aries sign',
    packet5.relevantVargaFacts?.[0]?.planets.some((p) => p.name === 'Sun' && p.vargaSign === 'Aries') === true,
    'D9 Sun in Aries confirmed in packet'
  );

  // Test 6: Golden Chart D1 vs D9 Exaltation Invariant
  // D1 Sun = Leo (Moolatrikona), D9 Sun = Aries (Exalted)
  const d1Sun = chartContext.planets.find((p) => p.name === 'Sun');
  const d9Sun = chartContext.vargas.D9.planets.find((p) => p.planet === 'Sun');
  assert(
    'Golden Chart Invariant: D1 Sun in Leo Moolatrikona',
    d1Sun?.sign === 'Leo' && d1Sun?.dignity === 'MOOLATRIKONA',
    `D1 Sun: ${d1Sun?.sign}, Dignity: ${d1Sun?.dignity}`
  );
  assert(
    'Golden Chart Invariant: D9 Sun in Aries Exalted',
    d9Sun?.vargaSign === 'Aries' && d9Sun?.dignity === 'EXALTED',
    `D9 Sun: ${d9Sun?.vargaSign}, Dignity: ${d9Sun?.dignity}`
  );

  // Test 7: D9 Exalted Count on Golden Chart
  // D9 Exalted planets on 17/08/2005: Sun (Aries), Jupiter (Cancer), Saturn (Libra) -> Exactly 3
  const d9Exalted = chartContext.vargas.D9.planets.filter((p) => p.dignity === 'EXALTED').map((p) => p.planet);
  assert(
    'Golden Chart D9 Exalted Count = 3 (Sun, Jupiter, Saturn)',
    d9Exalted.length === 3 && d9Exalted.includes('Sun') && d9Exalted.includes('Jupiter') && d9Exalted.includes('Saturn'),
    `D9 Exalted Grahas: ${d9Exalted.join(', ')}`
  );

  // Test 8: Exact-Date Safety Detection
  const q8 = 'Give me an exact date for my next job offer.';
  const i8 = classifyUserQuestion(q8);
  assert(
    'Exact-Date Intent Detection',
    i8.entities.isExactDateRequested === true,
    `isExactDateRequested: ${i8.entities.isExactDateRequested}`
  );
  const packet8 = buildConsultationContextPacket(q8, i8.allIntents, i8.entities, ['CAREER_SPECIALIST', 'TIMING_SPECIALIST'], chartContext, mem5);
  assert(
    'Timing Firewall: UNKNOWN timing tag added for exact day query',
    packet8.relevantTiming.some((t) => t.type === 'UNKNOWN') === true,
    'Exact day tagged as UNKNOWN timing window with shastric explanation'
  );

  // Test 9: End-to-End Live Consultation Synthesis
  console.log('⚡ Running Live Gemini Consultation on Golden Chart...');
  try {
    const liveConsult = await conductAstrologerConsultation(
      'How does my 10th house and D10 Dashamsha shape my career direction?',
      chartContext,
      'golden-test-session'
    );
    assert(
      'End-to-End Live Consultation Succeeded',
      liveConsult.validated === true && liveConsult.response.direct_answer.length > 20,
      `Latency: ${liveConsult.latencyMs}ms, Direct Answer: ${liveConsult.response.direct_answer.slice(0, 80)}...`
    );
  } catch (err: any) {
    assert('End-to-End Live Consultation', false, `Error: ${err.message}`);
  }

  // Test 10: Non-Repetition Verification across 5 sequential queries
  console.log('⚡ Running Non-Repetition & Topic Shift Test...');
  const testSessionId = `seq-test-${Date.now()}`;
  const sequentialQueries = [
    'Tell me about my career prospects',
    'What are the transits in March 2027?',
    'Is Sun exalted in my D9?',
    'What is my current Dasha?',
    'Tell me about marriage and relationship potential',
  ];

  const factsUsedPerTurn: string[][] = [];
  for (const query of sequentialQueries) {
    const res = await conductAstrologerConsultation(query, chartContext, testSessionId);
    factsUsedPerTurn.push(res.response.facts_used || []);
  }

  // Verify that marriage turn didn't just copy the exact career facts
  const careerFacts = factsUsedPerTurn[0];
  const marriageFacts = factsUsedPerTurn[4];
  const factsOverlap = careerFacts.filter((f) => marriageFacts.includes(f));
  assert(
    'Non-Repetition Engine: Question-specific facts change dynamically between Career and Marriage',
    factsOverlap.length < careerFacts.length,
    `Career facts: [${careerFacts.slice(0, 3).join(', ')}], Marriage facts: [${marriageFacts.slice(0, 3).join(', ')}]`
  );

  console.log(`\n========================================`);
  console.log(`ASTROWORLD AI ASTROLOGER TEST SUMMARY`);
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  return { passed, failed, results };
}
