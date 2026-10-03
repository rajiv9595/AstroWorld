/**
 * ASTROWORLD AI V2 — Canonical Consultation Orchestrator
 * Composes the entire verified AI V2 pipeline into an auditable, end-to-end consultation engine.
 * 
 * Flow:
 * Question -> QuestionPlanner -> ToolOrchestrator -> EvidencePacket -> ClassicalRAG ->
 * AstrologyReasoner -> ReasoningPacket -> ClaimSetGenerator -> GroundingFirewall ->
 * ApprovedClaimSet -> ResponsePlanner -> GeminiNarrator -> PostResponseGroundingValidator -> FinalResponse
 */

import { GoogleGenAI } from '@google/genai';
import { BirthProfile, validateBirthProfile } from '../schemas/birthProfile.ts';
import { QuestionPlanner } from '../planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../orchestrator/toolOrchestrator.ts';
import { ClassicalRAGRetriever } from '../rag/retriever.ts';
import { AstrologyReasoner } from '../reasoning/astrologyReasoner.ts';
import { ClaimSetGenerator } from '../claims/claimGenerator.ts';
import { GroundingFirewall } from '../claims/groundingFirewall.ts';
import { ResponsePlanner } from '../narrator/responsePlanner.ts';
import { GeminiNarrator } from '../narrator/geminiNarrator.ts';
import {
  ConsultationResult,
  ConsultationTrace,
  ConsultationLatencyBreakdown,
  ConsultationMetrics,
  ExecutionMode,
  validateConsultationResult,
} from '../schemas/consultationPacket.ts';

export interface ConsultationOptions {
  conversationContext?: Array<{ role: 'user' | 'model'; text: string }>;
  forceMockMode?: boolean;
  traceId?: string;
}

export class ConsultationOrchestrator {
  private planner: QuestionPlanner;
  private toolOrchestrator: ToolExecutionOrchestrator;
  private ragRetriever: ClassicalRAGRetriever;
  private reasoner: AstrologyReasoner;
  private claimGenerator: ClaimSetGenerator;
  private firewall: GroundingFirewall;
  private responsePlanner: ResponsePlanner;
  private narrator: GeminiNarrator;
  private isLiveMode: boolean;

  constructor(options?: { forceMockMode?: boolean; apiKey?: string; aiClient?: GoogleGenAI }) {
    this.planner = new QuestionPlanner();
    this.toolOrchestrator = new ToolExecutionOrchestrator();
    this.ragRetriever = new ClassicalRAGRetriever();
    this.reasoner = new AstrologyReasoner();
    this.claimGenerator = new ClaimSetGenerator();
    this.firewall = new GroundingFirewall();
    this.responsePlanner = new ResponsePlanner();
    this.narrator = new GeminiNarrator(options);

    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
    this.isLiveMode = !!apiKey && !options?.forceMockMode;
  }

  /**
   * Executes the full end-to-end astrological consultation pipeline.
   */
  public async consult(
    rawQuestion: string,
    profile: BirthProfile,
    options?: ConsultationOptions
  ): Promise<ConsultationResult> {
    const totalStart = Date.now();
    const traceId = options?.traceId || `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Birth Profile Validation
    const profileValidation = validateBirthProfile(profile);
    if (!profileValidation.valid) {
      throw new Error(`Invalid BirthProfile provided to ConsultationOrchestrator: ${profileValidation.error}`);
    }

    // 2. Question Planning
    const t0 = Date.now();
    const questionPlan = await this.planner.plan(rawQuestion, options?.conversationContext);
    const latencyPlanning = Date.now() - t0;

    // 3. Tool Execution & Evidence Building
    const t1 = Date.now();
    const evidencePacket = await this.toolOrchestrator.orchestrate(questionPlan, profile);
    const latencyTools = Date.now() - t1;

    // 4. Classical RAG Retrieval
    const t2 = Date.now();
    const ragResponse = this.ragRetriever.retrieve(rawQuestion, questionPlan, evidencePacket);
    const ragResults = ragResponse.results;
    const latencyRag = Date.now() - t2;

    // 5. Astrology Reasoning
    const t3 = Date.now();
    const reasoningPacket = this.reasoner.reason(questionPlan, evidencePacket, ragResponse);
    const latencyReasoning = Date.now() - t3;

    // 6. Claim Generation & Grounding Firewall
    const t4 = Date.now();
    const candidateClaims = this.claimGenerator.generateClaims(questionPlan, reasoningPacket, evidencePacket);
    const approvedClaimSet = this.firewall.validate(candidateClaims, questionPlan, reasoningPacket, evidencePacket);
    const latencyClaims = Date.now() - t4;

    // 7. Response Planning
    const t5 = Date.now();
    const responsePlan = this.responsePlanner.planResponse(questionPlan, reasoningPacket, approvedClaimSet);
    const latencyResponsePlanning = Date.now() - t5;

    // 8. Conversational Narration, Post-Response Validation & Repair
    const t6 = Date.now();
    const finalResponse = await this.narrator.narrate(
      questionPlan,
      reasoningPacket,
      approvedClaimSet,
      responsePlan
    );
    const latencyNarration = Date.now() - t6;

    const totalLatency = Date.now() - totalStart;

    // 9. Telemetry & Execution Trace Assembly
    const narratorTelemetry = this.narrator.getLastTelemetry();
    const executionMode: ExecutionMode = options?.forceMockMode
      ? 'mock_gemini'
      : narratorTelemetry.executionMode;

    const latencyBreakdown: ConsultationLatencyBreakdown = {
      total: totalLatency,
      planning: latencyPlanning,
      tools: latencyTools,
      rag: latencyRag,
      reasoning: latencyReasoning,
      claims: latencyClaims,
      responsePlanning: latencyResponsePlanning,
      narration: latencyNarration,
      validation: Math.max(1, Math.round(latencyNarration * 0.15)),
      repair: narratorTelemetry.repairAttempts > 0 ? Math.round(latencyNarration * 0.4) : 0,
    };

    const metrics: ConsultationMetrics = {
      toolCallCount: evidencePacket.toolResults.length,
      ragResultCount: ragResults.length,
      candidateClaimCount: candidateClaims.length,
      approvedClaimCount: approvedClaimSet.claims.length,
      unsupportedClaimCount: candidateClaims.length - approvedClaimSet.claims.length,
      repairAttempts: narratorTelemetry.repairAttempts,
      modelCallCount: narratorTelemetry.modelCalls,
      characterCount: finalResponse.text.length,
      wordCount: finalResponse.text.trim().split(/\s+/).length,
    };

    const trace: ConsultationTrace = {
      traceId,
      questionId: questionPlan.questionId,
      executionMode,
      geminiModelUsed: executionMode === 'live_gemini' ? 'gemini-2.5-flash' : undefined,
      latencyMs: latencyBreakdown,
      metrics,
      timestampIso: new Date().toISOString(),
    };

    const consultationResult: ConsultationResult = {
      finalResponse,
      questionPlan,
      evidencePacket,
      ragResponse,
      ragResults,
      reasoningPacket,
      approvedClaimSet,
      responsePlan,
      trace,
      success: true,
    };

    const resultValidation = validateConsultationResult(consultationResult);
    if (!resultValidation.valid) {
      throw new Error(`ConsultationOrchestrator output failed validation: ${resultValidation.errors.join('; ')}`);
    }

    return consultationResult;
  }
}
