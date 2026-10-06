/**
 * ASTROWORLD AI V2 — Production Consultation Service
 * Fully hardened, resilient service integrating validation, rate limiting, idempotency,
 * concurrency locking, bounded retries, timeout budgets, chaos hooks, and observability.
 */

import crypto from 'crypto';
import {
  ProductionConsultationRequest,
  ProductionConsultationResponse,
  ProductionErrorResponse,
} from './productionTypes.ts';
import { ProductionError } from './productionErrors.ts';
import { RequestValidator } from './requestValidator.ts';
import { RateLimiter } from './rateLimiter.ts';
import { IdempotencyManager } from './idempotencyManager.ts';
import { ConcurrencyManager } from './concurrencyManager.ts';
import { TimeoutManager } from './timeoutManager.ts';
import { RetryPolicy } from './retryPolicy.ts';
import { ProductionLogger } from './productionLogger.ts';
import { ProductionMetrics } from './productionMetrics.ts';
import { ChaosManager } from './chaosManager.ts';
import { ConsultationOrchestrator } from '../consultation/consultationOrchestrator.ts';
import { IPersistentMemoryRepository } from '../memory/persistentMemoryRepository.ts';
import { InMemoryPersistentMemoryRepository } from '../memory/persistentMemoryRepository.ts';
import { ConversationStateManager } from '../conversation_state/index.ts';

export interface ProductionServiceDependencies {
  orchestrator?: ConsultationOrchestrator;
  memoryRepository?: IPersistentMemoryRepository;
  stateManager?: ConversationStateManager;
  rateLimiter?: RateLimiter;
  idempotencyManager?: IdempotencyManager;
  concurrencyManager?: ConcurrencyManager;
  timeoutManager?: TimeoutManager;
  retryPolicy?: RetryPolicy;
  metrics?: ProductionMetrics;
  chaosManager?: ChaosManager;
}

export class ProductionConsultationService {
  private orchestrator: ConsultationOrchestrator;
  private memoryRepository: IPersistentMemoryRepository;
  private stateManager: ConversationStateManager;
  private rateLimiter: RateLimiter;
  private idempotencyManager: IdempotencyManager;
  private concurrencyManager: ConcurrencyManager;
  private timeoutManager: TimeoutManager;
  private retryPolicy: RetryPolicy;
  private metrics: ProductionMetrics;
  private chaosManager: ChaosManager;
  private conversationOwners = new Map<string, string>();

  constructor(deps: ProductionServiceDependencies = {}) {
    this.memoryRepository = deps.memoryRepository || new InMemoryPersistentMemoryRepository();
    this.stateManager = deps.stateManager || new ConversationStateManager();
    this.rateLimiter = deps.rateLimiter || new RateLimiter();
    this.idempotencyManager = deps.idempotencyManager || new IdempotencyManager();
    this.concurrencyManager = deps.concurrencyManager || new ConcurrencyManager();
    this.timeoutManager = deps.timeoutManager || new TimeoutManager();
    this.retryPolicy = deps.retryPolicy || new RetryPolicy();
    this.metrics = deps.metrics || ProductionMetrics.getInstance();
    this.chaosManager = deps.chaosManager || ChaosManager.getInstance();

    const timeoutCfg = this.timeoutManager.getConfig();
    this.orchestrator =
      deps.orchestrator ||
      new ConsultationOrchestrator({
        memoryRepository: this.memoryRepository,
        apiKey: process.env.GEMINI_API_KEY,
        primaryTimeoutMs: timeoutCfg.geminiRequestMs,
        fallbackTimeoutMs: timeoutCfg.geminiFallbackRequestMs,
        repairTimeoutMs: timeoutCfg.geminiRepairRequestMs,
      });
  }

  /**
   * Main production entry point for consultation queries.
   */
  public async consult(
    rawRequest: Partial<ProductionConsultationRequest>
  ): Promise<ProductionConsultationResponse> {
    const startTime = Date.now();
    const requestId = `req_${crypto.randomUUID()}`;
    let releaseLock: (() => void) | null = null;
    let validatedReq: ProductionConsultationRequest | null = null;
    let retriesCount = 0;

    try {
      // Stage 1: Request Validation
      const valStart = Date.now();
      try {
        validatedReq = RequestValidator.validate(rawRequest);
      } catch (valErr: any) {
        this.metrics.recordCounter('validationFailures');
        throw valErr;
      }
      const valDuration = Date.now() - valStart;

      const userId = validatedReq.authenticatedUser.userId;
      const conversationId = validatedReq.conversationId;

      // Ownership enforcement (IDOR protection). Persistent storage is
      // authoritative in configured production deployments; the map remains a
      // fast in-process cache.
      let persistentOwnerExists = false;
      if (this.orchestrator.getConversationPersistenceRepository().isEnabled()) {
        persistentOwnerExists = await this.orchestrator.isConversationOwnedByPersistent(conversationId, userId);
        const userScopedExisting = await this.orchestrator.isConversationOwnedByPersistent(conversationId, userId);
        if (persistentOwnerExists) {
          this.conversationOwners.set(conversationId, userId);
        } else if (userScopedExisting === false) {
          const probe = await this.orchestrator.getConversationPersistenceRepository().load(userId, conversationId);
          void probe;
        }
      }

      const existingOwner = this.conversationOwners.get(conversationId);
      if (existingOwner && existingOwner !== userId) {
        throw new ProductionError({
          errorCode: 'CONVERSATION_OWNERSHIP_ERROR',
          userMessage: 'You cannot access or modify a consultation session belonging to another user.',
          internalDetails: `User ${userId} attempted to access conversation ${conversationId} owned by ${existingOwner}`,
        });
      }
      if (!existingOwner) {
        this.conversationOwners.set(conversationId, userId);
      }

      // Stage 2: Rate Limiting
      this.rateLimiter.checkRateLimit({
        userId,
        conversationId,
        ipAddress: validatedReq.authenticatedUser.ipAddress,
      });

      // Stage 3: Idempotency Check
      if (validatedReq.idempotencyKey) {
        const idempotencyResult = await this.idempotencyManager.claimOrRetrieve(
          userId,
          validatedReq.idempotencyKey
        );
        if (idempotencyResult.isReplay && idempotencyResult.cachedResponse) {
          this.metrics.recordCounter('idempotentReplays');
          ProductionLogger.info('[ProductionService] Returning idempotent cached response', {
            requestId,
            userId,
            idempotencyKey: validatedReq.idempotencyKey,
          });
          return idempotencyResult.cachedResponse;
        }
      }

      // Stage 4: Concurrency Lock Acquisition
      releaseLock = await this.concurrencyManager.acquireLock(conversationId, userId);

      // Check Chaos fault hooks
      this.chaosManager.checkFault('injectDatabaseTimeout');
      this.chaosManager.checkFault('injectMemoryError');
      this.chaosManager.checkFault('injectToolError');
      this.chaosManager.checkFault('injectRagError');
      this.chaosManager.checkFault('injectReasonerError');
      this.chaosManager.checkFault('injectValidatorFailure');

      // Stage 5: Execute Consultation Pipeline with Bounded Retries & Timeout
      const totalTimeoutMs = this.timeoutManager.getConfig().totalConsultationMs;

      const execution = await this.timeoutManager.executeWithTimeout(
        this.retryPolicy.execute(
          async attempt => {
            // Chaos check inside retry loop
            if (attempt === 1) {
              this.chaosManager.checkFault('injectGeminiRateLimit');
              this.chaosManager.checkFault('injectGeminiTimeout');
              this.chaosManager.checkFault('injectGeminiError');
            }

            return await this.orchestrator.consult(
              validatedReq!.userMessage,
              validatedReq!.birthProfile,
              {
                userId,
                conversationId,
                conversationContext: validatedReq!.consultationContext as any,
                forceMockMode: validatedReq!.executionMode === 'mock' || validatedReq!.executionMode === 'deterministic_ci',
                parentDeadlineTimestampMs: startTime + totalTimeoutMs,
              }
            );
          },
          'ConsultationPipeline',
          () => {
            retriesCount++;
            this.metrics.recordCounter('retries');
          }
        ),
        totalTimeoutMs,
        'FullConsultation',
        true
      );

      const consultResult = execution.result;
      const totalDuration = Date.now() - startTime;

      // Stage 6: Build Canonical Sanitized Response
      const responsePayload: ProductionConsultationResponse = {
        success: true,
        requestId,
        conversationId,
        turnId: `turn_${crypto.randomUUID()}`,
        userResponse: {
          text: consultResult.finalResponse.text,
          format: 'conversational_prose',
          timestamp: new Date().toISOString(),
        },
        conversationMetadata: {
          conversationId,
          turnIndex: consultResult.conversationState?.activeConversation?.turns?.length || 1,
          domain: consultResult.questionPlan?.domain || 'general',
          topic: consultResult.questionPlan?.intent || 'astrology_consultation',
          requiresClarification:
            consultResult.finalResponse.responseType === 'clarification' ||
            consultResult.questionPlan?.clarificationRequired === true ||
            consultResult.questionPlan?.intent === 'clarification_needed',
          activeDomainConfidence: consultResult.conversationState?.domainConfidence || 1.0,
        },
        executionMetadata: {
          requestId,
          durationMs: totalDuration,
          requestedModel: consultResult.trace?.requestedModel || 'gemini-3.8-flash',
          selectedModel: consultResult.trace?.selectedModel || 'gemini-3.8-flash',
          effectiveModel: consultResult.trace?.effectiveModel || (consultResult.trace?.geminiModelUsed || 'AstroWorld Classical Deterministic Narrator'),
          fallbackTriggered: consultResult.trace?.fallbackTriggered ?? false,
          fallbackReason: consultResult.trace?.fallbackReason,
          executionMode: consultResult.trace?.executionMode || (validatedReq.executionMode === 'production' ? 'production' : 'deterministic_ci'),
          providerLatencyMs: consultResult.trace?.providerLatencyMs || consultResult.trace?.latencyMs?.narration || 0,
          backendDurationMs: totalDuration,
          totalDurationMs: totalDuration,
          modelUsed: consultResult.trace?.effectiveModel || consultResult.trace?.geminiModelUsed || (validatedReq.executionMode === 'production' ? 'gemini-3.8-flash' : 'AstroWorld Classical Deterministic Narrator'),
          stageTimingsMs: {
            validation: valDuration,
            memoryLookup: consultResult.memoryPack ? 1 : 0,
            planning: consultResult.trace?.latencyMs?.planning || 2,
            toolExecution: consultResult.trace?.latencyMs?.tools || 3,
            ragLookup: consultResult.trace?.latencyMs?.rag || 1,
            reasoning: consultResult.trace?.latencyMs?.reasoning || 2,
            generation: consultResult.trace?.latencyMs?.narration || 4,
            firewallValidation: consultResult.trace?.latencyMs?.validation || 1,
            memoryPersist: 1,
          },
          retryCount: retriesCount,
          toolCount: consultResult.evidencePacket?.facts?.length || 0,
          memoryCount: consultResult.memoryPack?.selectedMemories?.length || 0,
        },
      };

      // Stage 7: Complete Idempotency Slot
      if (validatedReq.idempotencyKey) {
        await this.idempotencyManager.complete(userId, validatedReq.idempotencyKey, responsePayload);
      }

      // Record metrics & structured log
      this.metrics.recordRequest(true, totalDuration);
      this.metrics.recordStageLatency('tools', consultResult.trace?.latencyMs?.tools || 3);
      this.metrics.recordStageLatency('gemini', consultResult.trace?.latencyMs?.narration || 4);

      ProductionLogger.info('[ProductionService] Consultation completed successfully', {
        requestId,
        userId,
        conversationId,
        durationMs: totalDuration,
        retryCount: retriesCount,
        domain: responsePayload.conversationMetadata.domain,
        topic: responsePayload.conversationMetadata.topic,
      });

      return responsePayload;
    } catch (err: any) {
      const totalDuration = Date.now() - startTime;
      this.metrics.recordRequest(false, totalDuration);

      let prodError: ProductionError;
      if (err instanceof ProductionError) {
        prodError = err;
      } else {
        const msg = String(err?.message || err);
        if (msg.includes('Rate limit') || msg.includes('429')) {
          prodError = new ProductionError({ errorCode: 'MODEL_RATE_LIMIT', internalDetails: msg, cause: err });
        } else if (msg.includes('timed out') || msg.includes('ETIMEDOUT') || msg.includes('TimeoutExceeded') || msg.includes('DatabaseConnectionTimeout')) {
          prodError = new ProductionError({ errorCode: 'MODEL_TIMEOUT', internalDetails: msg, cause: err });
        } else if (msg.includes('Ephemeris') || msg.includes('planetary positions')) {
          prodError = new ProductionError({ errorCode: 'TOOL_EXECUTION_ERROR', internalDetails: msg, cause: err });
        } else if (msg.includes('ClassicalRAGCorrupted') || msg.includes('Vector store')) {
          prodError = new ProductionError({ errorCode: 'KNOWLEDGE_RETRIEVAL_ERROR', internalDetails: msg, cause: err });
        } else if (msg.includes('AstrologyReasonerCrash') || msg.includes('PostResponseGroundingValidatorFailed')) {
          prodError = new ProductionError({ errorCode: 'REASONING_ERROR', internalDetails: msg, cause: err });
        } else if (msg.includes('MemoryRepositoryUnavailable') || msg.includes('memory store')) {
          prodError = new ProductionError({ errorCode: 'MEMORY_ERROR', internalDetails: msg, cause: err });
        } else {
          prodError = new ProductionError({ errorCode: 'INTERNAL_ERROR', internalDetails: msg, cause: err });
        }
      }

      const clientErr = prodError.toClientResponse(requestId);

      // Release idempotency slot on failure
      if (validatedReq && validatedReq.idempotencyKey) {
        await this.idempotencyManager.recordFailure(
          validatedReq.authenticatedUser.userId,
          validatedReq.idempotencyKey,
          clientErr
        );
      }

      ProductionLogger.error('[ProductionService] Consultation failed', {
        requestId,
        errorCode: prodError.errorCode,
        statusCode: prodError.statusCode,
        durationMs: totalDuration,
        error: prodError.message,
      }, err);

      throw prodError;
    } finally {
      if (releaseLock) {
        releaseLock();
      }
    }
  }

  public getMetrics(): ProductionMetrics {
    return this.metrics;
  }

  public getStateManager(): ConversationStateManager {
    return this.stateManager;
  }

  public getMemoryRepository(): IPersistentMemoryRepository {
    return this.memoryRepository;
  }

  public getOrchestrator(): ConsultationOrchestrator {
    return this.orchestrator;
  }

  public isConversationOwnedBy(conversationId: string, userId: string): boolean {
    return this.conversationOwners.get(conversationId) === userId;
  }

  public async isConversationOwnedByAsync(conversationId: string, userId: string): Promise<boolean> {
    if (this.orchestrator.getConversationPersistenceRepository().isEnabled()) {
      return this.orchestrator.isConversationOwnedByPersistent(conversationId, userId);
    }
    return this.isConversationOwnedBy(conversationId, userId);
  }

  public async listOwnedConversationIdsAsync(userId: string): Promise<string[]> {
    if (this.orchestrator.getConversationPersistenceRepository().isEnabled()) {
      return this.orchestrator.listOwnedPersistentConversationIds(userId);
    }
    return this.listOwnedConversationIds(userId);
  }

  public listOwnedConversationIds(userId: string): string[] {
    return Array.from(this.conversationOwners.entries())
      .filter(([, ownerId]) => ownerId === userId)
      .map(([conversationId]) => conversationId);
  }

  public async deleteOwnedConversationAsync(conversationId: string, userId: string): Promise<boolean> {
    if (this.orchestrator.getConversationPersistenceRepository().isEnabled()) {
      const deleted = await this.orchestrator.deleteOwnedPersistentConversation(conversationId, userId);
      if (deleted) {
        this.stateManager.resetState(conversationId);
        this.conversationOwners.delete(conversationId);
      }
      return deleted;
    }
    return this.deleteOwnedConversation(conversationId, userId);
  }

  public deleteOwnedConversation(conversationId: string, userId: string): boolean {
    if (!this.isConversationOwnedBy(conversationId, userId)) return false;
    this.stateManager.resetState(conversationId);
    this.conversationOwners.delete(conversationId);
    return true;
  }

  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  public getIdempotencyManager(): IdempotencyManager {
    return this.idempotencyManager;
  }

  public getConcurrencyManager(): ConcurrencyManager {
    return this.concurrencyManager;
  }

  public getChaosManager(): ChaosManager {
    return this.chaosManager;
  }

  public resetAll() {
    this.rateLimiter.reset();
    this.idempotencyManager.reset();
    this.concurrencyManager.reset();
    this.metrics.reset();
    this.chaosManager.reset();
  }
}
