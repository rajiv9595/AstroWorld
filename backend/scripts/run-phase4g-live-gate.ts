/**
 * ASTROWORLD AI V2 — PHASE 4G LIVE GEMINI CONVERSATION SMOKE GATE RUNNER
 * Executes the 10 canonical live cases with the real Gemini API.
 * Captures all traces, validation metrics, quality attributes, and exact responses.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import {
  ConsultationOrchestrator,
  BirthProfile,
  ConversationEvaluator,
} from '../src/ai_v2/index.ts';

const CANONICAL_TEST_PROFILE: BirthProfile = {
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

interface SmokeCaseDefinition {
  caseIndex: number;
  caseId: string;
  question: string;
  conversationContext?: Array<{ role: 'user' | 'model'; text: string }>;
  expectedFocus: string;
}

const LIVE_CASES: SmokeCaseDefinition[] = [
  {
    caseIndex: 1,
    caseId: 'CASE_1_MOON_SIGN',
    question: 'What is my Moon sign?',
    expectedFocus: 'Directly identify Moon sign (Sagittarius) without irrelevant chart dump',
  },
  {
    caseIndex: 2,
    caseId: 'CASE_2_D10_LAGNA',
    question: 'What is my D10 Lagna?',
    expectedFocus: 'Identify deterministic D10 Lagna (Taurus) rather than a nearby planet',
  },
  {
    caseIndex: 3,
    caseId: 'CASE_3_JUPITER_CAREER',
    question: 'How does Jupiter affect my career?',
    expectedFocus: 'Jupiter placement, dignity, and career/10th house influence',
  },
  {
    caseIndex: 4,
    caseId: 'CASE_4_JUPITER_PROMOTION_GOLDEN',
    question: 'How does the upcoming transit of Jupiter support my promotion timing?',
    expectedFocus: 'Jupiter transit, 10th house, D1/D10, Dasha window, and non-fatalistic qualification',
  },
  {
    caseIndex: 5,
    caseId: 'CASE_5_STRONGEST_CAREER_PERIOD',
    question: 'When is my strongest career period?',
    expectedFocus: 'Vimshottari timing window (Moon-Venus) grounded in dasha/transit confluence',
  },
  {
    caseIndex: 6,
    caseId: 'CASE_6_FOLLOWUP_WHY',
    question: 'Why?',
    conversationContext: [
      { role: 'user', text: 'When is my strongest career period?' },
      {
        role: 'model',
        text: 'Your most supportive career timing window runs from July 2026 to March 2028 during the Moon-Venus dasha cycle, bolstered by the favorable transit activation of your 10th house.',
      },
    ],
    expectedFocus: 'Continues prior career timing answer instead of restarting or saying no context',
  },
  {
    caseIndex: 7,
    caseId: 'CASE_7_FALSE_GAJAKESARI',
    question: 'I have Gajakesari Yoga, right?',
    expectedFocus: 'Politely verifies chart and explains why Gajakesari is not present (Jupiter not in Kendra from Moon)',
  },
  {
    caseIndex: 8,
    caseId: 'CASE_8_EMOTIONAL_REJECTIONS',
    question: "I've had several rejections. Does my chart show a better career phase?",
    expectedFocus: 'Warm, grounded, empathetic, frames setbacks in Saturnian maturation, upcoming supportive window without fatalism',
  },
  {
    caseIndex: 9,
    caseId: 'CASE_9_CONTRADICTION_JUPITER_SATURN',
    question: "Earlier you said Jupiter was strongest, now you're saying Saturn.",
    conversationContext: [
      { role: 'user', text: 'What is driving my career right now?' },
      {
        role: 'model',
        text: 'Jupiter provides expansive momentum and upcoming promotion opportunities in your professional trajectory.',
      },
      { role: 'user', text: 'Why is work feeling so heavy and demanding?' },
      {
        role: 'model',
        text: 'Saturn is currently the strongest factor enforcing discipline, structural perseverance, and patience in your career.',
      },
    ],
    expectedFocus: 'Explains complementary roles of Jupiter (expansion) and Saturn (structure) across different layers',
  },
  {
    caseIndex: 10,
    caseId: 'CASE_10_AMBIGUOUS_JUPITER',
    question: 'Will Jupiter help me?',
    conversationContext: [
      { role: 'user', text: 'Hello, I want to ask about my chart.' },
      { role: 'model', text: 'Namaste! I would be glad to examine your Vedic horoscope. What specific area would you like to explore?' },
    ],
    expectedFocus: 'Asks useful clarification on which life domain (career, marriage, finance, health) to explore',
  },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLiveGate() {
  console.log('====================================================');
  console.log('ASTROWORLD AI V2 — PHASE 4G LIVE GEMINI SMOKE GATE');
  console.log('====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in environment!');
    process.exit(1);
  }

  const orchestrator = new ConsultationOrchestrator({ apiKey });
  const evaluator = new ConversationEvaluator();
  const recordedResults: any[] = [];

  for (let i = 0; i < LIVE_CASES.length; i++) {
    const smokeCase = LIVE_CASES[i];
    console.log(`\n▶️ Executing Case ${smokeCase.caseIndex}/10: "${smokeCase.question}"`);
    if (smokeCase.conversationContext && smokeCase.conversationContext.length > 0) {
      console.log(`   Context turns: ${smokeCase.conversationContext.length}`);
    }

    const tStart = Date.now();
    try {
      const consultation = await orchestrator.consult(
        smokeCase.question,
        CANONICAL_TEST_PROFILE,
        {
          userId: 'phase4g_live_gate',
          conversationId: smokeCase.caseId,
          conversationContext: smokeCase.conversationContext,
        }
      );
      const latencyMs = Date.now() - tStart;

      const evalResult = evaluator.evaluate(consultation, {
        caseId: smokeCase.caseId,
        category: 'A_SIMPLE_FACTUAL' as any,
        title: smokeCase.question,
        question: smokeCase.question,
        profile: CANONICAL_TEST_PROFILE,
        expectedConcepts: [],
        prohibitedConcepts: ['evidence_id', 'rule_id', 'source_id', 'varga_sign'],
        maxWordBudget: 350,
      });

      const responseText = consultation.finalResponse.text;
      const trace = consultation.trace;

      // Leakage and quality inspection
      const hasMetadataLeakage = /evidence_id|rule_id|source_id|varga_sign|active_periods|dossier/i.test(responseText);
      const hasRagLeakage = /\[BPHS Ch\.|\[Phaladeepika|normalizedRule|retrieval/i.test(responseText);
      const hasTimingLeakage = /202\d-\d{2}-\d{2}T\d{2}:\d{2}/i.test(responseText);
      const hasGuaranteedOutcome = /100% guarantee|absolutely promised|destiny is fixed|inevitable promotion/i.test(responseText);
      const hasTechnicalNoise = /undefined|null|object Object|NaN/i.test(responseText);

      // Answer-first inspection: does the first sentence directly address the question?
      const firstSentence = responseText.split(/[.!?]\s+/)[0] || '';
      const isAnswerFirst = firstSentence.length > 5 && !firstSentence.toLowerCase().startsWith('in this chart');

      const caseRecord = {
        caseIndex: smokeCase.caseIndex,
        caseId: smokeCase.caseId,
        userQuestion: smokeCase.question,
        conversationContext: smokeCase.conversationContext || [],
        executionMode: trace.executionMode,
        geminiModel: trace.geminiModelUsed || 'gemini-3.8-flash',
        response: responseText,
        latencyMs: latencyMs,
        toolCalls: consultation.evidencePacket.toolResults.map((r) => r.toolName),
        approvedClaimsCount: consultation.approvedClaimSet.claims.length,
        approvedClaimsSample: consultation.approvedClaimSet.claims.slice(0, 4).map((c) => c.text),
        postResponseValidationResult: consultation.finalResponse.validatorStatus,
        metadataLeakage: hasMetadataLeakage,
        rawRagCitationLeakage: hasRagLeakage,
        timingLeakage: hasTimingLeakage,
        unsupportedClaims: consultation.trace.metrics.unsupportedClaimCount,
        technicalNoise: hasTechnicalNoise,
        guaranteedOutcomeLanguage: hasGuaranteedOutcome,
        answerFirst: isAnswerFirst,
        firstSentence: firstSentence,
        wordCount: responseText.trim().split(/\s+/).length,
      };

      recordedResults.push(caseRecord);

      console.log(`   Mode: ${trace.executionMode} (${trace.geminiModelUsed || 'gemini-3.8-flash'})`);
      console.log(`   Latency: ${latencyMs}ms | Words: ${caseRecord.wordCount}`);
      console.log(`   Validator: ${consultation.finalResponse.validatorStatus} | Repairs: ${trace.metrics.repairAttempts}`);
      console.log(`   Response Preview: "${responseText.substring(0, 120)}..."\n`);
    } catch (err: any) {
      console.error(`❌ Case ${smokeCase.caseIndex} FAILED with error:`, err);
      recordedResults.push({
        caseIndex: smokeCase.caseIndex,
        caseId: smokeCase.caseId,
        userQuestion: smokeCase.question,
        error: err.message,
      });
    }

    // Gentle 10-second cooloff between queries to respect Free Tier RPM limits
    if (i < LIVE_CASES.length - 1) {
      console.log('   ⏳ Waiting 10s cooloff for API rate limit stability...');
      await sleep(10000);
    }
  }

  // Export results to JSON
  const outputPath = path.resolve(__dirname, '../../phase4g_live_smoke_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(recordedResults, null, 2), 'utf-8');
  console.log(`\n✅ All 10 cases executed. Results saved to: ${outputPath}`);
}

runLiveGate().catch(console.error);
