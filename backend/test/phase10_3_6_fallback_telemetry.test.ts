/**
 * ASTROWORLD AI V2 — Phase 10.3.6 Fallback Causality Telemetry Test Suite
 * 
 * Deterministically verifies the attempt-level fallback causality telemetry matrix:
 * A. Primary succeeds
 * B. Primary controlled failure -> fallback succeeds
 * C. Primary timeout -> fallback succeeds
 * D. Primary fails -> fallback timeout -> deterministic failsafe
 * E. Primary fails -> deterministic path
 * F. Parent deadline nearly exhausted -> deterministic fallback
 */

import { describe, it, expect } from 'vitest';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';
import { QuestionPlan } from '../src/ai_v2/schemas/questionPlan.ts';
import { ReasoningPacket } from '../src/ai_v2/schemas/reasoningPacket.ts';
import { ApprovedClaimSet } from '../src/ai_v2/schemas/claimPacket.ts';
import { ResponsePlan } from '../src/ai_v2/schemas/responsePlan.ts';

const mockPlan: QuestionPlan = {
  questionId: 'q_test_telemetry',
  rawQuestion: 'What does Jupiter in Cancer indicate?',
  intent: 'planetary_influence',
  domain: 'general',
  targetFactors: ['Jupiter'],
  planetFocus: ['Jupiter'],
  timeHorizon: 'long_term',
  relevantCharts: ['D1'],
  depth: 'detailed',
  questionType: 'interpretative',
  primaryFocus: 'growth',
};

const mockReasoning: ReasoningPacket = {
  reasoningId: 'reason_test',
  questionId: 'q_test_telemetry',
  primaryInsights: ['Jupiter is exalted in Cancer bringing benevolence.'],
  corroboratingFactors: ['Exaltation in 4th house'],
  contradictingFactors: [],
  confidenceScore: 0.95,
  synthesisNarrative: 'Jupiter in Cancer indicates expansive wisdom.',
};

const mockClaims: ApprovedClaimSet = {
  claims: [
    {
      claimId: 'claim_1',
      statement: 'Jupiter is exalted in Cancer',
      text: 'Jupiter is exalted in Cancer',
      status: 'approved',
      confidence: 1.0,
      ruleId: 'dignity_rule',
      evidenceIds: ['ev_1'],
    } as any,
  ],
};

const mockResponsePlan: ResponsePlan = {
  responseId: 'rp_test',
  responseType: 'direct_answer',
  structure: {
    opening: 'Jupiter in Cancer is in its exaltation sign.',
    keyFactors: ['Exalted Jupiter'],
    practicalGuidance: 'Focus on wisdom and learning.',
  },
  approvedClaimIds: ['claim_1'],
};

function createMockAiClient(handlers: {
  generateContent: (req: any) => Promise<any>;
}) {
  return {
    models: {
      generateContent: handlers.generateContent,
    },
  } as any;
}

describe('Phase 10.3.6 — Fallback Causality Telemetry Matrix', () => {
  it('A. Primary succeeds -> records primary success and execution path', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async (req: any) => ({
        text: 'Jupiter in Cancer is exalted, bringing spiritual wisdom and grounded growth.',
      }),
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
    });

    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan);
    const tel = narrator.getLastTelemetry();

    expect(res.text).toContain('Jupiter in Cancer is exalted');
    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primarySucceeded).toBe(true);
    expect(tel.primaryTimeoutTriggered).toBe(false);
    expect(tel.fallbackAttempted).toBe(false);
    expect(tel.fallbackSucceeded).toBe(false);
    expect(tel.deterministicFallbackUsed).toBe(false);
    expect(tel.finalExecutionPath).toBe('primary_model');
    expect(tel.effectiveModel).toBe('gemini-3.8-flash');
  });

  it('B. Primary controlled failure -> fallback succeeds -> records fallback success', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async (req: any) => {
        if (req.model === 'gemini-3.8-flash') {
          throw new Error('RateLimitExceeded: Primary model 429 quota reached');
        }
        return {
          text: 'From the secondary model, Jupiter in Cancer brings expansive emotional and career wisdom.',
        };
      },
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
    });

    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan);
    const tel = narrator.getLastTelemetry();

    expect(res.text).toContain('secondary model');
    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primarySucceeded).toBe(false);
    expect(tel.primaryFailureReason).toContain('RateLimitExceeded');
    expect(tel.fallbackAttempted).toBe(true);
    expect(tel.fallbackSucceeded).toBe(true);
    expect(tel.fallbackTimeoutTriggered).toBe(false);
    expect(tel.deterministicFallbackUsed).toBe(false);
    expect(tel.finalExecutionPath).toBe('fallback_model');
    expect(tel.effectiveModel).toBe('gemini-3.1-flash-lite');
  });

  it('C. Primary timeout -> fallback succeeds -> records primary timeout and fallback success', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async (req: any) => {
        if (req.model === 'gemini-3.8-flash') {
          // Delay longer than primaryTimeoutMs (80ms)
          await new Promise(r => setTimeout(r, 150));
          return { text: 'Late response' };
        }
        return {
          text: 'Fallback succeeded after primary timeout with grounded Jupiter analysis.',
        };
      },
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      primaryTimeoutMs: 60,
      fallbackTimeoutMs: 500,
    });

    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan);
    const tel = narrator.getLastTelemetry();

    expect(res.text).toContain('Fallback succeeded after primary timeout');
    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primarySucceeded).toBe(false);
    expect(tel.primaryTimeoutTriggered).toBe(true);
    expect(tel.primaryFailureReason).toContain('ModelCallTimeout');
    expect(tel.fallbackAttempted).toBe(true);
    expect(tel.fallbackSucceeded).toBe(true);
    expect(tel.deterministicFallbackUsed).toBe(false);
    expect(tel.finalExecutionPath).toBe('fallback_model');
  });

  it('D. Primary fails -> fallback timeout -> deterministic failsafe engaged', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async (req: any) => {
        if (req.model === 'gemini-3.8-flash') {
          throw new Error('Primary network failure');
        }
        // Fallback model delays past its 50ms budget
        await new Promise(r => setTimeout(r, 120));
        return { text: 'Late fallback' };
      },
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      primaryTimeoutMs: 200,
      fallbackTimeoutMs: 50,
    });

    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan);
    const tel = narrator.getLastTelemetry();

    expect(res.text).toBeTruthy();
    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primarySucceeded).toBe(false);
    expect(tel.fallbackAttempted).toBe(true);
    expect(tel.fallbackSucceeded).toBe(false);
    expect(tel.fallbackTimeoutTriggered).toBe(true);
    expect(tel.deterministicFallbackUsed).toBe(true);
    expect(tel.deterministicFallbackDurationMs).toBeGreaterThanOrEqual(0);
    expect(tel.finalExecutionPath).toBe('deterministic_failsafe');
    expect(tel.effectiveModel).toBe('AstroWorld Classical Deterministic Narrator');
  });

  it('E. Force primary failure simulation -> fallback fails -> deterministic failsafe', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async () => {
        throw new Error('Fallback quota failure');
      },
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      forcePrimaryFailure: true,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
    });

    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan);
    const tel = narrator.getLastTelemetry();

    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primarySucceeded).toBe(false);
    expect(tel.primaryFailureReason).toBe('CONTROLLED_PRIMARY_FAILURE_SIMULATION');
    expect(tel.fallbackAttempted).toBe(true);
    expect(tel.fallbackSucceeded).toBe(false);
    expect(tel.deterministicFallbackUsed).toBe(true);
    expect(tel.finalExecutionPath).toBe('deterministic_failsafe');
  });

  it('F. Parent deadline exhausted -> immediate deterministic fallback with telemetry', async () => {
    const mockAiClient = createMockAiClient({
      generateContent: async () => ({ text: 'Should not run' }),
    });

    const narrator = new GeminiNarrator({
      aiClient: mockAiClient,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
    });

    // Pass parent deadline already in the past
    const res = await narrator.narrate(mockPlan, mockReasoning, mockClaims, mockResponsePlan, {
      parentDeadlineTimestampMs: Date.now() - 10,
    });
    const tel = narrator.getLastTelemetry();

    expect(tel.primaryAttempted).toBe(true);
    expect(tel.primaryTimeoutTriggered).toBe(true);
    expect(tel.primaryFailureReason).toContain('PARENT_DEADLINE_EXHAUSTED_BEFORE_PRIMARY');
    expect(tel.deterministicFallbackUsed).toBe(true);
    expect(tel.finalExecutionPath).toBe('deterministic_failsafe');
  });
});
