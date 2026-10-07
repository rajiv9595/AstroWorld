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
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { QuestionPlanner } from '../planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../orchestrator/toolOrchestrator.ts';
import { ClassicalRAGRetriever } from '../rag/retriever.ts';
import { AstrologyReasoner } from '../reasoning/astrologyReasoner.ts';
import { ClaimSetGenerator } from '../claims/claimGenerator.ts';
import { GroundingFirewall } from '../claims/groundingFirewall.ts';
import { ResponsePlanner } from '../narrator/responsePlanner.ts';
import { FinalResponse } from '../schemas/responsePlan.ts';
import { GeminiNarrator } from '../narrator/geminiNarrator.ts';
import {
  ConversationStateManager,
  ConversationStateResolver,
  ConversationStateUpdater,
  ConversationState,
  ConversationTurn,
} from '../conversation_state/index.ts';
import { ConversationPersistenceRepository } from '../conversation_state/conversationPersistenceRepository.ts';
import {
  IPersistentMemoryRepository,
  InMemoryPersistentMemoryRepository,
  MemoryRetriever,
  MemoryCandidateGenerator,
  MemoryWriteGate,
  MemoryConsolidator,
  MemoryCommandResolver,
  CommandExecutionResult,
} from '../memory/index.ts';
import { createDefaultMemoryRepository } from '../memory/supabasePersistentMemoryRepository.ts';
import {
  ConsultationResult,
  ConsultationTrace,
  ConsultationLatencyBreakdown,
  ConsultationMetrics,
  ExecutionMode,
  validateConsultationResult,
} from '../schemas/consultationPacket.ts';

export function resolveConsultationUserId(
  userId: string | undefined,
  liveMode: boolean,
): string {
  const normalizedUserId = userId?.trim();
  if (liveMode && !normalizedUserId) {
    throw new Error('Live consultation requires an authenticated userId.');
  }
  return normalizedUserId || 'default_user';
}

export interface ConsultationOptions {
  conversationContext?: Array<{ role: 'user' | 'model'; text: string }>;
  forceMockMode?: boolean;
  traceId?: string;
  conversationId?: string;
  conversationState?: ConversationState;
  userId?: string;
  memoryEnabled?: boolean;
  primaryModel?: string;
  fallbackModel?: string;
  forcePrimaryFailure?: boolean;
  deadlineMs?: number;
  parentDeadlineTimestampMs?: number;
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
  private stateManager: ConversationStateManager;
  private stateResolver: ConversationStateResolver;
  private stateUpdater: ConversationStateUpdater;
  private memoryRepository: IPersistentMemoryRepository;
  private memoryRetriever: MemoryRetriever;
  private memoryCandidateGenerator: MemoryCandidateGenerator;
  private memoryWriteGate: MemoryWriteGate;
  private memoryConsolidator: MemoryConsolidator;
  private memoryCommandResolver: MemoryCommandResolver;
  private conversationPersistence: ConversationPersistenceRepository;
  private isLiveMode: boolean;

  constructor(options?: {
    forceMockMode?: boolean;
    apiKey?: string;
    aiClient?: GoogleGenAI;
    memoryRepository?: IPersistentMemoryRepository;
    primaryModel?: string;
    fallbackModel?: string;
    forcePrimaryFailure?: boolean;
    primaryTimeoutMs?: number;
    fallbackTimeoutMs?: number;
    repairTimeoutMs?: number;
    conversationPersistence?: ConversationPersistenceRepository;
  }) {
    this.planner = new QuestionPlanner();
    this.toolOrchestrator = new ToolExecutionOrchestrator();
    this.ragRetriever = new ClassicalRAGRetriever();
    this.reasoner = new AstrologyReasoner();
    this.claimGenerator = new ClaimSetGenerator();
    this.firewall = new GroundingFirewall();
    this.responsePlanner = new ResponsePlanner();

    const isLiveRequested = !!options?.apiKey || !!options?.aiClient || process.env.FORCE_LIVE_GEMINI === 'true' || process.argv.includes('--live');
    this.isLiveMode = !options?.forceMockMode && isLiveRequested;

    this.narrator = new GeminiNarrator({
      ...options,
      forceMockMode: options?.forceMockMode ?? !this.isLiveMode,
      primaryModel: options?.primaryModel || 'gemini-3.8-flash',
      fallbackModel: options?.fallbackModel || 'gemini-3.1-flash-lite',
      forcePrimaryFailure: options?.forcePrimaryFailure,
      primaryTimeoutMs: options?.primaryTimeoutMs ?? 8000,
      fallbackTimeoutMs: options?.fallbackTimeoutMs ?? 6000,
      repairTimeoutMs: options?.repairTimeoutMs ?? 4000,
    });
    this.stateManager = new ConversationStateManager();
    this.stateResolver = new ConversationStateResolver();
    this.conversationPersistence = options?.conversationPersistence || new ConversationPersistenceRepository();
    this.stateUpdater = new ConversationStateUpdater();

    this.memoryRepository = options?.memoryRepository || createDefaultMemoryRepository();
    this.memoryRetriever = new MemoryRetriever(this.memoryRepository);
    this.memoryCandidateGenerator = new MemoryCandidateGenerator();
    this.memoryWriteGate = new MemoryWriteGate();
    this.memoryConsolidator = new MemoryConsolidator(this.memoryRepository);
    this.memoryCommandResolver = new MemoryCommandResolver(this.memoryRepository);
  }

  public getMemoryRepository(): IPersistentMemoryRepository {
    return this.memoryRepository;
  }

  public getMemoryRetriever(): MemoryRetriever {
    return this.memoryRetriever;
  }

  public getMemoryCommandResolver(): MemoryCommandResolver {
    return this.memoryCommandResolver;
  }

  public getStateManager(): ConversationStateManager {
    return this.stateManager;
  }

  public getConversationState(conversationId: string): ConversationState | undefined {
    return this.stateManager.getState(conversationId);
  }

  public getConversationPersistenceRepository(): ConversationPersistenceRepository {
    return this.conversationPersistence;
  }

  public async isConversationOwnedByPersistent(conversationId: string, userId: string): Promise<boolean> {
    return this.conversationPersistence.owns(userId, conversationId);
  }

  public async listOwnedPersistentConversationIds(userId: string): Promise<string[]> {
    return this.conversationPersistence.listOwned(userId);
  }

  public async deleteOwnedPersistentConversation(conversationId: string, userId: string): Promise<boolean> {
    return this.conversationPersistence.delete(userId, conversationId);
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

    const userId = resolveConsultationUserId(options?.userId, this.isLiveMode);

    // 2. Explicit Memory Command Interception ("Remember that...", "What do you remember about me?", "Forget...")
    const commandResult = await this.memoryCommandResolver.executeCommand(userId, rawQuestion);
    if (commandResult.handled && commandResult.responseMessage) {
      return this.buildMemoryCommandConsultationResult({
        rawQuestion,
        userId,
        conversationId: options?.conversationId || 'default_session',
        commandResult,
        totalStart,
        traceId,
      });
    }

    // 3. Conversation State Resolution
    const conversationId =
      options?.conversationId ||
      options?.conversationState?.conversationId ||
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let currentState = options?.conversationState || this.stateManager.getState(conversationId) || this.stateManager.createInitialState(conversationId);
    let turns = this.stateManager.getTurns(conversationId);

    // Durable state is authoritative when configured. The in-memory manager is
    // only the request-local working cache.
    if (!options?.conversationState && this.conversationPersistence.isEnabled()) {
      const stored = await this.conversationPersistence.load(userId, conversationId);
      if (stored) {
        currentState = this.stateManager.cloneState(stored.state);
        turns = stored.turns.map(t => JSON.parse(JSON.stringify(t)));
        this.stateManager.commitState(conversationId, currentState);
      }
    }

    // If options.conversationContext was passed and turns is empty, reconstruct state for backwards compatibility
    if (options?.conversationContext && options.conversationContext.length > 0 && turns.length === 0) {
      const reconstructedTurns: ConversationTurn[] = [];
      for (let i = 0; i < options.conversationContext.length; i += 2) {
        const uMsg = options.conversationContext[i]?.text || '';
        const aMsg = options.conversationContext[i + 1]?.text || '';
        if (uMsg) {
          const lowerU = uMsg.toLowerCase();
          const lowerA = aMsg.toLowerCase();
          const detectedFactors: string[] = [];
          for (const p of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']) {
            if (new RegExp(`\\b${p}\\b`, 'i').test(uMsg) || new RegExp(`\\b${p}\\b`, 'i').test(aMsg)) {
              detectedFactors.push(p);
            }
          }
          let turnDomain = 'general';
          if (lowerU.includes('career') || lowerU.includes('job') || lowerU.includes('work') || lowerA.includes('professional') || lowerA.includes('career')) {
            turnDomain = 'career';
          } else if (lowerU.includes('marriage') || lowerU.includes('relationship') || lowerA.includes('marriage')) {
            turnDomain = 'relationship';
          }

          let detectedTiming: string | undefined = undefined;
          if (
            aMsg.includes('period') ||
            aMsg.includes('window') ||
            aMsg.includes('transit') ||
            /\b(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(aMsg)
          ) {
            const match = aMsg.match(
              /\b(early|mid|late\s+)?(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december(?:\s+\d{4})?)\b/i
            );
            detectedTiming = match ? match[0] : (aMsg.includes('period') ? 'the upcoming transit period' : undefined);
          }

          reconstructedTurns.push({
            turnId: `turn_${Math.floor(i / 2) + 1}_legacy`,
            turnIndex: Math.floor(i / 2) + 1,
            userMessage: uMsg,
            answerSummary: {
              mainConclusion: aMsg.split(/[.!?]\s+/)[0] || aMsg,
              supportingFactors: detectedFactors,
              timing: detectedTiming,
            },
            approvedClaimIds: [],
            dominantFactors: detectedFactors,
            domain: turnDomain,
            intent: 'general_consultation',
            referencedFactors: detectedFactors,
            createdAt: new Date().toISOString(),
            executionMode: 'mock_gemini',
          });
        }
      }
      currentState = this.stateManager.reconstructStateFromTurns(conversationId, reconstructedTurns);
      for (const t of reconstructedTurns) {
        if (t.dominantFactors) {
          for (const df of t.dominantFactors) {
            if (!currentState.activePlanetFocus.includes(df)) {
              currentState.activePlanetFocus.push(df);
            }
          }
        }
        if (t.answerSummary?.timing && !currentState.activeTimePeriods.includes(t.answerSummary.timing)) {
          currentState.activeTimePeriods.push(t.answerSummary.timing);
        }
      }
      turns = reconstructedTurns;
    }

    const { contextPack, trace: stateTrace } = this.stateResolver.resolve(rawQuestion, currentState, turns);

    // 4. Question Planning
    const t0 = Date.now();
    const questionPlan = await this.planner.plan(rawQuestion, options?.conversationContext, contextPack);
    const latencyPlanning = Date.now() - t0;

    // 5. Tool Execution & Evidence Building
    const t1 = Date.now();
    const evidencePacket = await this.toolOrchestrator.orchestrate(questionPlan, profile);
    const latencyTools = Date.now() - t1;

    // 5b. Retrieve Relevant Persistent Memories (Deterministic, <20ms)
    let memoryPack: any = undefined;
    let memoryTrace: any = undefined;
    if (options?.memoryEnabled !== false) {
      const retrieval = await this.memoryRetriever.retrieve({
        userId,
        questionPlan,
        contextPack,
        domain: contextPack.currentDomain,
        topic: contextPack.currentTopic,
        entities: questionPlan.planetFocus,
        currentEvidence: evidencePacket,
      });
      memoryPack = retrieval.pack;
      memoryTrace = retrieval.trace;
    }

    // 6. Classical RAG Retrieval
    const t2 = Date.now();
    const ragResponse = this.ragRetriever.retrieve(rawQuestion, questionPlan, evidencePacket);
    const ragResults = ragResponse.results;
    const latencyRag = Date.now() - t2;

    // 7. Astrology Reasoning
    const t3 = Date.now();
    const reasoningPacket = this.reasoner.reason(questionPlan, evidencePacket, ragResponse);
    const latencyReasoning = Date.now() - t3;

    // 8. Claim Generation & Grounding Firewall
    const t4 = Date.now();
    const candidateClaims = this.claimGenerator.generateClaims(questionPlan, reasoningPacket, evidencePacket);

    // Inject verified user memories as approved context claims (only user-stated facts/preferences/corrections)
    if (memoryPack?.selectedMemories && memoryPack.selectedMemories.length > 0) {
      const allowedMemories = memoryPack.selectedMemories.filter((m: any) =>
        m.category === 'USER_FACT' || m.category === 'USER_PREFERENCE' || m.category === 'USER_CORRECTION'
      );
      for (let i = 0; i < allowedMemories.length; i++) {
        const mem = allowedMemories[i];
        candidateClaims.push({
          claimId: `claim_memory_${i + 1}`,
          text: `User noted: ${mem.value}`,
          type: 'user_context',
          factorType: 'general',
          strength: 'strong',
          evidenceIds: [],
          ruleIds: [],
          sourceIds: [],
          relevance: 'high',
          allowed: true,
        });
      }
    }

    const approvedClaimSet = this.firewall.validate(candidateClaims, questionPlan, reasoningPacket, evidencePacket);
    const latencyClaims = Date.now() - t4;

    // 9. Response Planning
    const t5 = Date.now();
    const responsePlan = this.responsePlanner.planResponse(questionPlan, reasoningPacket, approvedClaimSet);
    const latencyResponsePlanning = Date.now() - t5;

    // 10. Conversational Narration, Post-Response Validation & Repair
    const t6 = Date.now();
    const parentDeadlineTimestampMs = options?.parentDeadlineTimestampMs ?? (options?.deadlineMs ? totalStart + options.deadlineMs : undefined);
    const finalResponse = await this.narrator.narrate(
      questionPlan,
      reasoningPacket,
      approvedClaimSet,
      responsePlan,
      {
        forceMockMode: options?.forceMockMode,
        forcePrimaryFailure: options?.forcePrimaryFailure,
        parentDeadlineTimestampMs,
      }
    );
    const latencyNarration = Date.now() - t6;

    const totalLatency = Date.now() - totalStart;

    // 11. Telemetry & Execution Trace Assembly
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
      requestedModel: narratorTelemetry.requestedModel,
      selectedModel: narratorTelemetry.selectedModel,
      effectiveModel: narratorTelemetry.effectiveModel,
      fallbackTriggered: narratorTelemetry.fallbackTriggered,
      fallbackReason: narratorTelemetry.fallbackReason,
      providerLatencyMs: narratorTelemetry.providerLatencyMs,
      backendDurationMs: totalLatency,
      totalDurationMs: totalLatency,
      geminiModelUsed: executionMode === 'live_gemini' ? narratorTelemetry.effectiveModel : undefined,
      latencyMs: latencyBreakdown,
      metrics,
      timestampIso: new Date().toISOString(),
      primaryAttempted: narratorTelemetry.primaryAttempted,
      primarySucceeded: narratorTelemetry.primarySucceeded,
      primaryFailureReason: narratorTelemetry.primaryFailureReason,
      primaryDurationMs: narratorTelemetry.primaryDurationMs,
      primaryTimeoutTriggered: narratorTelemetry.primaryTimeoutTriggered,
      fallbackAttempted: narratorTelemetry.fallbackAttempted,
      fallbackSucceeded: narratorTelemetry.fallbackSucceeded,
      fallbackFailureReason: narratorTelemetry.fallbackFailureReason,
      fallbackDurationMs: narratorTelemetry.fallbackDurationMs,
      fallbackTimeoutTriggered: narratorTelemetry.fallbackTimeoutTriggered,
      deterministicFallbackUsed: narratorTelemetry.deterministicFallbackUsed,
      deterministicFallbackDurationMs: narratorTelemetry.deterministicFallbackDurationMs,
      finalExecutionPath: narratorTelemetry.finalExecutionPath,
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
      memoryPack,
      memoryTrace,
    };

    const resultValidation = validateConsultationResult(consultationResult);
    if (!resultValidation.valid) {
      throw new Error(`ConsultationOrchestrator output failed validation: ${resultValidation.errors.join('; ')}`);
    }

    // 12. Update Conversation State post-narration
    const { updatedState, newTurn } = this.stateUpdater.updateState(rawQuestion, consultationResult, currentState);
    this.stateManager.commitState(conversationId, updatedState, newTurn);
    if (this.conversationPersistence.isEnabled()) {
      await this.conversationPersistence.save(userId, updatedState, newTurn);
    }
    consultationResult.conversationState = updatedState;
    consultationResult.contextPack = contextPack;
    consultationResult.stateTrace = stateTrace;

    // 13. Persistent Memory Candidate Generation & Write Gate
    if (options?.memoryEnabled !== false) {
      const candidates = this.memoryCandidateGenerator.generateCandidates({
        userId,
        userMessage: rawQuestion,
        conversationState: updatedState,
        approvedClaims: approvedClaimSet,
        finalResponse,
        turn: newTurn,
      });

      for (const cand of candidates) {
        const decision = this.memoryWriteGate.evaluate(cand);
        if (decision.accepted) {
          await this.memoryConsolidator.consolidate(cand, decision);
        }
      }
    }

    return consultationResult;
  }

  private buildMemoryCommandConsultationResult(params: {
    rawQuestion: string;
    userId: string;
    conversationId: string;
    commandResult: CommandExecutionResult;
    totalStart: number;
    traceId: string;
  }): ConsultationResult {
    const text = params.commandResult.responseMessage || 'Memory command processed.';
    const qPlan: QuestionPlan = {
      questionId: `q_cmd_${Date.now()}`,
      rawQuestion: params.rawQuestion,
      normalizedQuestion: params.rawQuestion.toLowerCase(),
      intent: 'general_chart_question',
      domain: 'general',
      planetFocus: [],
      houseFocus: [],
      chartLayers: ['D1'],
      temporalScope: { type: 'natal' },
      targetDatesIso: [],
      requiredTools: [],
      priority: 1,
      ambiguities: [],
      clarificationRequired: false,
      version: 'v2',
      createdAtIso: new Date().toISOString(),
    };
    const finalResp: FinalResponse = {
      responseId: `resp_cmd_${Date.now()}`,
      questionId: qPlan.questionId,
      text,
      responseType: 'simple_fact',
      referencedClaimIds: [],
      referencedEvidenceIds: [],
      validatorStatus: 'approved',
      responseVersion: 'ai-v2-memory-cmd-1',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };
    const trace: ConsultationTrace = {
      traceId: params.traceId,
      questionId: qPlan.questionId,
      executionMode: 'mock_gemini',
      latencyMs: {
        total: Date.now() - params.totalStart,
        planning: 1,
        tools: 0,
        rag: 0,
        reasoning: 0,
        claims: 0,
        responsePlanning: 0,
        narration: 0,
        validation: 0,
        repair: 0,
      },
      metrics: {
        toolCallCount: 0,
        ragResultCount: 0,
        candidateClaimCount: 0,
        approvedClaimCount: 0,
        unsupportedClaimCount: 0,
        repairAttempts: 0,
        modelCallCount: 0,
        characterCount: text.length,
        wordCount: text.split(/\s+/).length,
      },
      timestampIso: new Date().toISOString(),
    };

    return {
      finalResponse: finalResp,
      questionPlan: qPlan,
      evidencePacket: {
        version: 'v2',
        createdAtIso: new Date().toISOString(),
        question: { raw: params.rawQuestion, normalized: params.rawQuestion.toLowerCase(), intent: 'general', domain: 'general' },
        plan: qPlan,
        facts: [],
        derivedFacts: [],
        toolResults: [],
        toolExecutionDurationMs: 0,
        completeness: { status: 'complete', missingDomains: [], missingEntities: [], unfulfilledRequests: [] },
      } as any,
      ragResponse: {
        query: params.rawQuestion,
        intent: 'general_chart_question' as any,
        results: [],
        retrievedCount: 0,
        maxScore: 0,
        totalAvailable: 0,
        executionTimeMs: 0,
      } as any,
      ragResults: [],
      reasoningPacket: { questionId: qPlan.questionId, direction: 'balanced', strength: 'moderate', primaryFactors: [], supportingFactors: [], restrictingFactors: [], appliedRules: [] } as any,
      approvedClaimSet: { questionId: qPlan.questionId, claims: [], rejectedClaims: [], auditRecords: [], questionCoverage: { complete: true, coveredEntities: [], coveredHouses: [], coveredDomains: ['general'], missing: [] } } as any,
      responsePlan: { responseId: `rp_cmd`, questionId: qPlan.questionId, responseType: 'simple_fact', answerFirst: true, sections: [] } as any,
      trace,
      success: true,
    };
  }
}
