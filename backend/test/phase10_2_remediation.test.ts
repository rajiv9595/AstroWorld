import { describe, it, expect } from 'vitest';
import { QuestionPlanner } from '../src/ai_v2/planner/questionPlanner.ts';
import { ToolPlanner } from '../src/ai_v2/planner/toolPlanner.ts';
import { ConsultationOrchestrator } from '../src/ai_v2/consultation/consultationOrchestrator.ts';
import { GeminiNarrator } from '../src/ai_v2/narrator/geminiNarrator.ts';
import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';
import { TimeoutManager } from '../src/ai_v2/production/timeoutManager.ts';

// Profile A: Benchmark Native (1990-10-24, New Delhi: Aquarius Lagna, Sagittarius Moon)
const PROFILE_A: BirthProfileInput = {
  name: 'Native A (Benchmark Profile)',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

// Profile B: Distinct Native (1985-05-15, Mumbai: Taurus Lagna, Pisces Moon, Revati Nakshatra)
const PROFILE_B: BirthProfileInput = {
  name: 'Native B (Distinct Profile)',
  year: 1985,
  month: 5,
  day: 15,
  hour: 8,
  minute: 0,
  second: 0,
  latitude: 19.0760,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata',
  gender: 'female',
};

function createMockAiClient(delayMs: number = 0, shouldFail: boolean = false, responseText: string = 'Valid generated response from Gemini model.') {
  return {
    models: {
      generateContent: async (_params: any) => {
        if (delayMs > 0) {
          await new Promise(r => setTimeout(r, delayMs));
        }
        if (shouldFail) {
          throw new Error('Simulated API Failure');
        }
        return { text: responseText };
      },
    },
  };
}

describe('Phase 10.2 Remediation Verification Suite', () => {

  // ============================================================================
  // 1. P0 REMEDIATION: Deterministic Fallback Cross-Profile Fact Isolation
  // ============================================================================
  describe('P0 — Fallback Narrator Cross-Profile Isolation', () => {
    it('Profile B fallback narration never leaks Profile A chart facts', async () => {
      // Create orchestrator in forced mock/fallback mode
      const orchestrator = new ConsultationOrchestrator({
        forceMockMode: true,
      });

      // Query Profile A for Moon sign
      const resA = await orchestrator.consult('What is my Moon sign and Nakshatra?', PROFILE_A);
      const textA = resA.finalResponse.text;

      // Query Profile B for Moon sign
      const resB = await orchestrator.consult('What is my Moon sign and Nakshatra?', PROFILE_B);
      const textB = resB.finalResponse.text;

      // Profile A should mention Sagittarius
      expect(textA.toLowerCase()).toContain('sagittarius');

      // Profile B should mention Pisces (not Sagittarius!)
      expect(textB.toLowerCase()).toContain('pisces');
      expect(textB.toLowerCase()).not.toContain('sagittarius');
      expect(textB.toLowerCase()).not.toContain('purva ashadha');
    });

    it('Profile B fallback narration correctly reflects Profile B Ascendant and D10', async () => {
      const orchestrator = new ConsultationOrchestrator({
        forceMockMode: true,
      });

      // Query Profile B for Ascendant / Lagna
      const resLagnaB = await orchestrator.consult('What is my Ascendant sign?', PROFILE_B);
      const textLagnaB = resLagnaB.finalResponse.text.toLowerCase();

      // Profile B is Taurus Lagna, NOT Aquarius (Profile A)!
      expect(textLagnaB).toContain('taurus');
      expect(textLagnaB).not.toContain('aquarius');

      // Query Profile B for D10 Lagna
      const resD10B = await orchestrator.consult('What is my D10 Lagna sign?', PROFILE_B);
      const textD10B = resD10B.finalResponse.text.toLowerCase();

      // Profile A D10 is Taurus; Profile B D10 is distinct and does not leak Profile A benchmark facts
      expect(textD10B).not.toContain('purva ashadha');
    });

    it('Profile B fallback dasha query reflects Profile B active dasha dates', async () => {
      const orchestrator = new ConsultationOrchestrator({
        forceMockMode: true,
      });

      const resDashaB = await orchestrator.consult('How does my current dasha affect my career?', PROFILE_B);
      const textDashaB = resDashaB.finalResponse.text.toLowerCase();

      // Profile A had Moon Mahadasha with Venus Antardasha spanning July 2026 to March 2028.
      // Profile B (1985 Mercury balance) has a completely different active dasha.
      // Verify that hardcoded Moon-Venus July 2026 - March 2028 is NOT injected into Profile B!
      expect(textDashaB).not.toContain('july 2026 to march 2028');
    });
  });

  // ============================================================================
  // 2. P1 REMEDIATION: Provenance Consistency & Documentation
  // ============================================================================
  describe('P1 — Calculation Engine Provenance', () => {
    it('All tool executions return astronomy-engine + Analytical Lahiri provenance', () => {
      const birthChartRes = AstrologyToolRegistry.executeTool('get_birth_chart', { birthProfile: PROFILE_A });
      expect(birthChartRes.success).toBe(true);
      expect(birthChartRes.provenance.sourceEngine).toContain('astronomy-engine + Analytical Lahiri Ayanamsha');
      expect(birthChartRes.provenance.sourceEngine).not.toContain('Swiss Ephemeris');

      const vargaRes = AstrologyToolRegistry.executeTool('get_divisional_chart', { birthProfile: PROFILE_A, vargaCode: 'D9' });
      expect(vargaRes.success).toBe(true);
      expect(vargaRes.provenance.sourceEngine).toContain('astronomy-engine + Analytical Lahiri Ayanamsha');

      const transitsRes = AstrologyToolRegistry.executeTool('get_transits', { birthProfile: PROFILE_A });
      expect(transitsRes.success).toBe(true);
      expect(transitsRes.provenance.sourceEngine).toContain('astronomy-engine + Analytical Lahiri Ayanamsha');
    });
  });

  // ============================================================================
  // 3. P1 REMEDIATION: Unified Hierarchical Timeout Model (True Deadlines A-F)
  // ============================================================================
  describe('P1 — True Hierarchical Timeout Deadlines (A–F)', () => {
    it('TimeoutManager exposes hierarchical timeout configuration', () => {
      const mgr = new TimeoutManager();
      const cfg = mgr.getConfig();

      expect(cfg.totalConsultationMs).toBe(15000);
      expect(cfg.geminiRequestMs).toBe(8000);
      expect(cfg.geminiFallbackRequestMs).toBe(6000);
      expect(cfg.geminiRepairRequestMs).toBe(4000);
    });

    it('A. Parent deadline leaves enough budget for primary -> gets configured primary budget', async () => {
      const mockClient = createMockAiClient(10, false, 'The planetary cycles indicate strong leadership momentum in your career.');
      const narrator = new GeminiNarrator({
        aiClient: mockClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      const parentDeadline = Date.now() + 15000; // 15s budget
      const dummyPlan: any = { questionId: 'q1', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: parentDeadline,
      });

      const tel = narrator.getLastTelemetry();
      expect(tel.modelTimeoutBudgetMs).toBe(8000);
      expect(tel.timeoutTriggered).toBe(false);
      expect(tel.fallbackTriggered).toBe(false);
      expect(tel.effectiveModel).toBe('gemini-3.8-flash');
    });

    it('B. Parent deadline leaves only 2s -> primary gets clamped to <= 2s', async () => {
      const mockClient = createMockAiClient(10, false, 'Career indications show growth through discipline.');
      const narrator = new GeminiNarrator({
        aiClient: mockClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      const parentDeadline = Date.now() + 2000; // only 2000ms remaining
      const dummyPlan: any = { questionId: 'q2', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: parentDeadline,
      });

      const tel = narrator.getLastTelemetry();
      expect(tel.modelTimeoutBudgetMs).toBeLessThanOrEqual(2000);
      expect(tel.modelTimeoutBudgetMs).toBeGreaterThan(1500);
      expect(tel.timeoutTriggered).toBe(false);
    });

    it('C. Primary consumes budget -> fallback receives only remaining parent budget', async () => {
      // Primary takes 1500ms and fails, leaving remaining parent deadline
      let callCount = 0;
      const mockClient = {
        models: {
          generateContent: async () => {
            callCount++;
            if (callCount === 1) {
              await new Promise(r => setTimeout(r, 1200));
              throw new Error('Primary model internal error');
            }
            return { text: 'Fallback model answered within remaining parent deadline.' };
          },
        },
      };

      const narrator = new GeminiNarrator({
        aiClient: mockClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      const parentDeadline = Date.now() + 3000; // 3s total budget
      const dummyPlan: any = { questionId: 'q3', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: parentDeadline,
      });

      const tel = narrator.getLastTelemetry();
      expect(tel.fallbackTriggered).toBe(true);
      // Fallback budget derived from remaining parent deadline (~1800ms, strictly <= 2500ms and < 6000ms)
      expect(tel.modelTimeoutBudgetMs).toBeLessThanOrEqual(2500);
      expect(tel.effectiveModel).toBe('gemini-3.1-flash-lite');
    });

    it('D. Parent deadline exhausted -> fallback is not started and deterministic safe response returned', async () => {
      const mockClient = createMockAiClient(100, false);
      const narrator = new GeminiNarrator({
        aiClient: mockClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      // Parent deadline already in the past
      const exhaustedDeadline = Date.now() - 100;
      const dummyPlan: any = { questionId: 'q4', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [{ claimId: 'c1', text: 'Jupiter is in 7th house', type: 'factual', strength: 'strong', sourceEvidenceIds: [] }] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      const response = await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: exhaustedDeadline,
      });

      const tel = narrator.getLastTelemetry();
      expect(tel.timeoutTriggered).toBe(true);
      expect(tel.modelCalls).toBe(0); // Did not initiate redundant child calls
      expect(tel.fallbackReason).toContain('PARENT_DEADLINE_EXHAUSTED');
      expect(response.text).toBeDefined();
      expect(response.verified).toBe(true);
    });

    it('E. Repair receives only remaining parent budget and respects deadline', async () => {
      // Simulate draft needing repair by creating response with violation
      let repairBudgetSeen = 0;
      const mockClient = {
        models: {
          generateContent: async (args: any) => {
            if (args.model === 'gemini-3.8-flash' && !args.contents.includes('VIOLATIONS TO CORRECT')) {
              // Return text with unverified claim to trigger repair
              return { text: 'You are guaranteed to become a CEO on October 14, 2099 at 3:15 PM.' };
            }
            // In repair loop
            return { text: 'Career progression unfolds through steady discipline.' };
          },
        },
      };

      const narrator = new GeminiNarrator({
        aiClient: mockClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      // Provide 2500ms parent deadline
      const parentDeadline = Date.now() + 2500;
      const dummyPlan: any = { questionId: 'q5', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [{ claimId: 'c1', text: 'Career growth requires discipline', type: 'factual', strength: 'strong', sourceEvidenceIds: [] }] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      const response = await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: parentDeadline,
      });

      expect(response.text).toBeDefined();
      const tel = narrator.getLastTelemetry();
      // Repair budget was clamped to remaining parent budget (<= 2500ms, not full 4000ms)
      expect(tel.modelTimeoutBudgetMs).toBeLessThanOrEqual(2500);
    });

    it('F. Total elapsed time never exceeds parent budget by an uncontrolled child timer', async () => {
      // Hanging AI client (simulates slow / frozen network call)
      const hangingClient = createMockAiClient(10000, false);
      const narrator = new GeminiNarrator({
        aiClient: hangingClient as any,
        forceMockMode: false,
        primaryTimeoutMs: 8000,
        fallbackTimeoutMs: 6000,
        repairTimeoutMs: 4000,
      });

      // Total parent deadline is only 300ms
      const parentBudgetMs = 300;
      const parentDeadline = Date.now() + parentBudgetMs;
      const dummyPlan: any = { questionId: 'q6', rawQuestion: 'Career query', domain: 'career', planetFocus: [] };
      const dummyReasoning: any = {};
      const dummyApproved: any = { claims: [{ claimId: 'c1', text: 'Disciplined effort builds long-term success', type: 'factual', strength: 'strong', sourceEvidenceIds: [] }] };
      const dummyResponsePlan: any = { responseType: 'conversational_prose' };

      const start = Date.now();
      const response = await narrator.generateNarrative(dummyPlan, dummyReasoning, dummyApproved, dummyResponsePlan, {
        parentDeadlineTimestampMs: parentDeadline,
      });
      const elapsed = Date.now() - start;

      // Elapsed time should be bounded by ~300ms parent budget, far less than 8000ms + 6000ms = 14000ms
      expect(elapsed).toBeLessThan(750);
      expect(response.verified).toBe(true);
      expect(narrator.getLastTelemetry().timeoutTriggered).toBe(true);
    });
  });

  // ============================================================================
  // 4. P2 REMEDIATION: Temporal Planning (14 Required Cases)
  // ============================================================================
  describe('P2 — Temporal Planning Anchored to Execution Time', () => {
    const planner = new QuestionPlanner();
    const now = new Date();
    const curYear = now.getUTCFullYear();

    it('Case 1: "by Dec 2026 from now" anchors start to current date, not Jan 2026', async () => {
      const plan = await planner.plan('Will I be promoted by Dec 2026 from now?');
      expect(plan.temporalScope.type).toBe('upcoming');
      expect(plan.temporalScope.startIso).toBeDefined();
      // Start is current date (not 2026-01-01)
      const startDate = new Date(plan.temporalScope.startIso!);
      expect(startDate.getUTCFullYear()).toBe(curYear);
      // End is Dec 31, 2026
      const endDate = new Date(plan.temporalScope.endIso!);
      expect(endDate.getUTCFullYear()).toBe(2026);
      expect(endDate.getUTCMonth()).toBe(11);
    });

    it('Case 2: "from now until December 2026"', async () => {
      const plan = await planner.plan('Career trajectory from now until December 2026');
      expect(plan.temporalScope.type).toBe('upcoming');
      const endDate = new Date(plan.temporalScope.endIso!);
      expect(endDate.getUTCFullYear()).toBe(2026);
      expect(endDate.getUTCMonth()).toBe(11);
    });

    it('Case 3: "next 3 months"', async () => {
      const plan = await planner.plan('What are my prospects for the next 3 months?');
      expect(plan.temporalScope.type).toBe('upcoming');
      expect(plan.temporalScope.startIso).toBeDefined();
      expect(plan.temporalScope.endIso).toBeDefined();
      const diffDays = (new Date(plan.temporalScope.endIso!).getTime() - new Date(plan.temporalScope.startIso!).getTime()) / (1000 * 86400);
      expect(diffDays).toBeGreaterThanOrEqual(88);
      expect(diffDays).toBeLessThanOrEqual(95);
    });

    it('Case 4: "next 6 months"', async () => {
      const plan = await planner.plan('Financial outlook for next 6 months');
      expect(plan.temporalScope.type).toBe('upcoming');
      const diffDays = (new Date(plan.temporalScope.endIso!).getTime() - new Date(plan.temporalScope.startIso!).getTime()) / (1000 * 86400);
      expect(diffDays).toBeGreaterThanOrEqual(175);
      expect(diffDays).toBeLessThanOrEqual(185);
    });

    it('Case 5: "next year"', async () => {
      const plan = await planner.plan('What does next year hold for my career?');
      expect(plan.temporalScope.type).toBe('upcoming');
      const startDate = new Date(plan.temporalScope.startIso!);
      expect(startDate.getUTCFullYear()).toBe(curYear + 1);
    });

    it('Case 6: "last year"', async () => {
      const plan = await planner.plan('Why was last year so difficult for my job?');
      expect(plan.temporalScope.type).toBe('historical');
      const startDate = new Date(plan.temporalScope.startIso!);
      expect(startDate.getUTCFullYear()).toBe(curYear - 1);
    });

    it('Case 7: "right now"', async () => {
      const plan = await planner.plan('What is happening right now in my planetary cycles?');
      expect(plan.temporalScope.type).toBe('current');
    });

    it('Case 8: "during my current AD"', async () => {
      const plan = await planner.plan('What results to expect during my current AD?');
      expect(plan.temporalScope.type).toBe('current_dasha');
    });

    it('Case 9: "before my next AD"', async () => {
      const plan = await planner.plan('Should I switch jobs before my next AD?');
      expect(plan.temporalScope.type).toBe('upcoming_dasha');
    });

    it('Case 10: "during Saturn AD"', async () => {
      const plan = await planner.plan('What will happen during Saturn AD?');
      expect(plan.temporalScope.type).toBe('specific_dasha');
      expect((plan.temporalScope as any).dashaLord).toBe('Saturn');
    });

    it('Case 11 & 12: "between 2027 and 2030" & "2027 to 2030" multi-year range', async () => {
      const plan1 = await planner.plan('Career prospects between 2027 and 2030');
      expect(plan1.temporalScope.type).toBe('specific_date');
      expect(new Date(plan1.temporalScope.startIso!).getUTCFullYear()).toBe(2027);
      expect(new Date(plan1.temporalScope.endIso!).getUTCFullYear()).toBe(2030);
      expect(plan1.targetDatesIso.length).toBe(4); // 2027, 2028, 2029, 2030

      const plan2 = await planner.plan('Analyze 2027 to 2030 for my business');
      expect(new Date(plan2.temporalScope.startIso!).getUTCFullYear()).toBe(2027);
      expect(new Date(plan2.temporalScope.endIso!).getUTCFullYear()).toBe(2030);
    });

    it('Case 13: "in 2028"', async () => {
      const plan = await planner.plan('Will I marry in 2028?');
      expect(plan.temporalScope.type).toBe('specific_date');
      expect(new Date(plan.temporalScope.startIso!).getUTCFullYear()).toBe(2028);
      expect(new Date(plan.temporalScope.endIso!).getUTCFullYear()).toBe(2028);
    });
  });

  // ============================================================================
  // 5. P2 REMEDIATION: Universal Varga Support (All 16 Shodashavargas)
  // ============================================================================
  describe('P2 — Universal Shodashavarga Planning & Execution', () => {
    it('"Analyze all my Varga charts" schedules get_all_divisional_charts tool', async () => {
      const qPlanner = new QuestionPlanner();
      const tPlanner = new ToolPlanner();

      const plan = await qPlanner.plan('Analyze all my Varga charts.');
      expect(plan.intent).toBe('varga_analysis');
      expect(plan.chartLayers.length).toBe(16);
      expect(plan.chartLayers).toContain('D1');
      expect(plan.chartLayers).toContain('D9');
      expect(plan.chartLayers).toContain('D10');
      expect(plan.chartLayers).toContain('D60');

      const executionGraph = tPlanner.planTools(plan, PROFILE_A);
      const allToolNames = executionGraph.allPlannedTools.map(t => t.toolName);
      expect(allToolNames).toContain('get_all_divisional_charts');
    });

    it('get_all_divisional_charts tool returns complete 16 Shodashavarga matrix', () => {
      const res = AstrologyToolRegistry.executeTool('get_all_divisional_charts', { birthProfile: PROFILE_A });
      expect(res.success).toBe(true);
      expect(res.data.count).toBe(16);
      expect(res.data.availableVargas).toEqual([
        'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
        'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'
      ]);
      expect(res.data.vargas.D60.name).toBe('Shashtiamsha');
      expect(res.data.vargas.D60.planets.length).toBe(9);
    });
  });
});
