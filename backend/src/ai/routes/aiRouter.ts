/**
 * ASTROWORLD AI — Unified API Router
 * Consolidates all consultation, memory, and conversation endpoints into a clean,
 * production-ready structure while preserving 100% backwards compatibility for both
 * /api/ai-agent and /api/ai-v2.
 */

import { Router, Request, Response } from 'express';
import { optionalAuthenticateRequest, authenticateRequest, getAuthenticatedUser, requireAdmin } from '../../middleware/authMiddleware.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';
import { ConsultAgent } from '../agent/consultAgent.ts';
import { ProductionConsultationService } from '../production/productionConsultationService.ts';
import { ProductionError } from '../production/productionErrors.ts';
import { ConversationState, ConversationTurn } from '../conversation/conversationStateTypes.ts';
import { MemoryCandidateGenerator } from '../memory/memoryCandidateGenerator.ts';
import { UserMemoryService } from '../memory/userMemoryService.ts';

// Shared Singletons
export const productionConsultationService = new ProductionConsultationService();
export const userMemoryService = new UserMemoryService();
export const masterConsultAgent = new ConsultAgent({
  forceMockMode: process.env.AI_AGENT_FORCE_MOCK === '1',
});

function getIpAddress(req: Request): string {
  return req.ip || '0.0.0.0';
}

// ---------------------------------------------------------------------------
// 1. Primary AI Agent Router (Chat, Tool Execution, ReAct Synthesis)
// ---------------------------------------------------------------------------
export const aiAgentRouter = Router();

aiAgentRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    system: 'AstroWorld Unified AI Engine',
    status: 'operational',
    mode: 'agentic-tool-calling',
    capabilities: [
      'gemini_react_loop',
      'deterministic_engine_tools',
      'future_timing_scans',
      'domain_playbooks',
      'classical_rag',
      'specialization_tech_corpus',
      'web_search_world_facts',
      'fact_date_verifier',
      'persistent_memory',
    ],
  });
});

aiAgentRouter.use(optionalAuthenticateRequest);

aiAgentRouter.post('/v1/consult', async (req: Request, res: Response) => {
  try {
    const authenticatedUser = req.authenticatedUser || { userId: 'guest_user', role: 'user' as const };
    const userMessage = req.body?.userMessage || req.body?.message || req.body?.question;
    const birthProfile = req.body?.birthProfile;

    if (!userMessage || typeof userMessage !== 'string') {
      res.status(400).json({
        success: false,
        errorCode: 'INVALID_QUESTION',
        userMessage: 'A question is required.',
        isRetryable: false,
      });
      return;
    }

    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid) {
      res.status(422).json({
        success: false,
        errorCode: 'INVALID_BIRTH_PROFILE',
        userMessage: birthValidation.error || 'Birth profile is invalid.',
        isRetryable: false,
      });
      return;
    }

    // Multi-tenant IDOR defense: verify ownership if a conversationId is requested
    const requestedConversationId = req.body?.conversationId;
    if (requestedConversationId && typeof requestedConversationId === 'string') {
      const memOwner = productionConsultationService.getConversationOwner(requestedConversationId);
      if (memOwner && memOwner !== authenticatedUser.userId) {
        res.status(403).json({
          success: false,
          errorCode: 'CONVERSATION_OWNERSHIP_ERROR',
          userMessage: 'You cannot access or modify a consultation session belonging to another user.',
          isRetryable: false,
        });
        return;
      }

      const repo = productionConsultationService.getOrchestrator().getConversationPersistenceRepository();
      if (repo.isEnabled()) {
        const dbOwner = await repo.getOwner(requestedConversationId);
        if (dbOwner && dbOwner !== authenticatedUser.userId) {
          res.status(403).json({
            success: false,
            errorCode: 'CONVERSATION_OWNERSHIP_ERROR',
            userMessage: 'You cannot access or modify a consultation session belonging to another user.',
            isRetryable: false,
          });
          return;
        }
      }
    }

    // Fetch active user facts to spoon-feed into consultation context
    let activeUserFacts: string[] = [];
    if (authenticatedUser.userId !== 'guest_user') {
      try {
        const mems = await userMemoryService.listMemories(authenticatedUser.userId, { status: 'active' });
        activeUserFacts = mems.map((m: any) => `${m.key}: ${m.value}`);
      } catch (memReadErr) {
        console.warn('[ai-agent/v1/consult] Failed to list user memories:', memReadErr);
      }
    }

    const result = await masterConsultAgent.consult({
      userMessage,
      birthProfile: birthValidation.data!,
      conversationId: requestedConversationId,
      consultationContext: req.body?.consultationContext || req.body?.conversationContext,
      forceMockMode: req.body?.executionMode === 'mock' || req.body?.executionMode === 'deterministic_ci',
      timezone: req.body?.timezone,
      userFacts: activeUserFacts,
    });

    const conversationId = result.conversationId;
    productionConsultationService.setConversationOwner(conversationId, authenticatedUser.userId);

    // Commit state and persist turns to Supabase PostgreSQL for this authenticated user
    const stateManager = productionConsultationService.getStateManager();
    let state = stateManager.getState(conversationId);
    if (!state) {
      state = stateManager.createInitialState(conversationId);
    }
    const turnIndex = (state.turnIndex || 0) + 1;
    const updatedState: ConversationState = {
      ...state,
      turnIndex,
      currentDomain: result.conversationMetadata?.domain || state.currentDomain || 'general',
      currentTopic: result.conversationMetadata?.topic || state.currentTopic || 'Astrological Consultation',
      lastQuestion: userMessage,
      lastAnswerSummary: {
        mainConclusion: result.text.slice(0, 300),
        supportingFactors: result.toolsCalled || [],
      },
      stateVersion: (state.stateVersion || 0) + 1,
      updatedAtIso: new Date().toISOString(),
    };
    stateManager.commitState(conversationId, updatedState);

    const newTurn: ConversationTurn = {
      turnId: result.turnId,
      turnIndex,
      userMessage,
      answerSummary: {
        mainConclusion: result.text.slice(0, 300),
        supportingFactors: result.toolsCalled || [],
      },
      approvedClaimIds: [],
      dominantFactors: result.toolsCalled || [],
      domain: result.conversationMetadata?.domain || 'general',
      intent: result.conversationMetadata?.topic || 'astrological_consultation',
      referencedFactors: [],
      createdAt: result.timestamp,
      executionMode: req.body?.executionMode || 'production',
      fullAnswer: result.text,
    };

    stateManager.commitState(conversationId, updatedState, newTurn);

    const repo = productionConsultationService.getOrchestrator().getConversationPersistenceRepository();
    if (repo.isEnabled() && authenticatedUser.userId !== 'guest_user') {
      try {
        await repo.save(authenticatedUser.userId, updatedState, newTurn);
      } catch (persistErr) {
        console.warn('[ai-agent/v1/consult] Conversation persistence warning:', persistErr);
      }
    }

    // Auto-extract and persist explicit user facts / corrections into long-term memory
    if (authenticatedUser.userId !== 'guest_user') {
      try {
        const generator = new MemoryCandidateGenerator();
        const candidates = generator.generateCandidates({
          userId: authenticatedUser.userId,
          userMessage,
        });
        for (const candidate of candidates) {
          await userMemoryService.createOrUpdateMemory(authenticatedUser.userId, candidate);
        }
      } catch (memErr) {
        console.warn('[ai-agent/v1/consult] Memory candidate extraction warning:', memErr);
      }
    }

    res.json({
      success: true,
      requestId: result.executionMetadata.requestId,
      conversationId: result.conversationId,
      turnId: result.turnId,
      userResponse: {
        text: result.text,
        format: result.format,
        timestamp: result.timestamp,
        visualizations: result.visualizations,
        agentCouncil: result.agentCouncil,
      },
      conversationMetadata: result.conversationMetadata,
      executionMetadata: {
        requestId: result.executionMetadata.requestId,
        durationMs: result.executionMetadata.durationMs,
        modelUsed: result.executionMetadata.modelUsed,
        cachedOrIdempotent: false,
        retryCount: result.executionMetadata.retryCount,
        agentMode: result.executionMetadata.mode,
        toolsCalled: result.toolsCalled,
        webSearchUsed: result.webSearchUsed,
        temporalWindow: result.temporalWindow,
        factVerification: result.factVerification,
        userId: authenticatedUser.userId,
      },
    });
  } catch (err: any) {
    console.error('[ai-agent/v1/consult] Consultation error:', err);
    res.status(500).json({
      success: false,
      errorCode: 'CONSULTATION_INTERNAL_ERROR',
      userMessage: 'A temporary error occurred during the consultation. Please try again.',
      isRetryable: true,
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Secondary AI V2 Router (Memory, Conversation State, Metrics)
// ---------------------------------------------------------------------------
export const aiV2Router = Router();

aiV2Router.get('/status', (_req: Request, res: Response) => {
  res.json({
    system: 'AstroWorld Unified AI V2 Endpoint',
    status: 'operational',
    phase: 'unified-architecture',
  });
});

aiV2Router.use(authenticateRequest);

aiV2Router.get('/metrics', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, metrics: productionConsultationService.getMetrics().getSnapshot() });
});

aiV2Router.post('/v1/consult', async (req: Request, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      (typeof req.body?.idempotencyKey === 'string' ? req.body.idempotencyKey : undefined);

    const response = await productionConsultationService.consult({
      authenticatedUser: {
        userId: authenticatedUser.userId,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        ipAddress: getIpAddress(req),
      },
      conversationId: req.body?.conversationId,
      userMessage: req.body?.userMessage || req.body?.message || req.body?.question,
      birthProfile: req.body?.birthProfile,
      idempotencyKey,
      clientTurnId: req.body?.clientTurnId,
      locale: req.body?.locale,
      timezone: req.body?.timezone,
      executionMode: req.body?.executionMode,
      consultationContext: req.body?.consultationContext || req.body?.conversationContext,
    });

    if (response.executionMetadata.cachedOrIdempotent) {
      res.setHeader('X-Idempotent-Replay', 'true');
    }

    res.status(200).json(response);
  } catch (err: unknown) {
    if (err instanceof ProductionError) {
      if (err.retryAfterSeconds) {
        res.setHeader('Retry-After', String(err.retryAfterSeconds));
      }
      res.status(err.statusCode).json(err.toClientResponse('req_' + Date.now()));
      return;
    }

    console.error('[AI V2] canonical consult failure:', err);
    res.status(500).json({
      success: false,
      errorCode: 'INTERNAL_ERROR',
      statusCode: 500,
      userMessage: 'An unexpected internal error occurred during the consultation.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Memory Endpoints
aiV2Router.get('/memory', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as any) : undefined;
    const memories = await userMemoryService.listMemories(userId, {
      categories: category ? [category as any] : undefined,
      status,
    });
    res.json({ success: true, count: memories.length, memories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to list memories' });
  }
});

aiV2Router.get('/memory/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const summary = await userMemoryService.formatUserVisibleSummary(userId);
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to get memory summary' });
  }
});

aiV2Router.post('/memory', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const { category, key, value, sensitivity, tags, expiresAt } = req.body || {};

    if (!category || !key || !value) {
      res.status(400).json({ success: false, error: 'category, key, and value are required fields.' });
      return;
    }

    const result = await userMemoryService.createOrUpdateMemory(userId, {
      userId,
      category,
      key,
      value,
      sourceType: 'user_explicit',
      sensitivity: sensitivity || 'normal',
      tags: Array.isArray(tags) ? tags : [],
      expiresAt,
    });

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, memory: result.memory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create memory' });
  }
});

aiV2Router.get('/memory/:id', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const memory = await userMemoryService.getMemory(userId, req.params.id);
    if (!memory) {
      res.status(404).json({ success: false, error: 'Memory record not found' });
      return;
    }
    res.json({ success: true, memory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to get memory' });
  }
});

aiV2Router.delete('/memory/:id', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const deleted = await userMemoryService.deleteMemory(userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Memory record not found' });
      return;
    }
    res.json({ success: true, message: 'Memory successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete memory' });
  }
});

aiV2Router.delete('/memory', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const count = await userMemoryService.clearUserMemory(userId);
    res.json({ success: true, clearedCount: count, message: 'All memories successfully cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to clear memories' });
  }
});

// Conversation Sessions Endpoints
aiV2Router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const summaries = await productionConsultationService.listConversationSummariesAsync(userId);
    res.json({ success: true, conversations: summaries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to list conversations' });
  }
});

aiV2Router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const conversationId = req.params.id;

    if (!(await productionConsultationService.isConversationOwnedByAsync(conversationId, userId))) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const stateManager = productionConsultationService.getStateManager();
    let state = stateManager.getState(conversationId);
    let turns = stateManager.getTurns(conversationId);

    if (!state) {
      const orchestrator = productionConsultationService.getOrchestrator();
      const repo = orchestrator.getConversationPersistenceRepository();
      if (repo.isEnabled()) {
        const stored = await repo.load(userId, conversationId);
        if (stored) {
          state = stored.state;
          turns = stored.turns;
          stateManager.commitState(conversationId, state);
        }
      }
    }

    if (!state) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.json({ success: true, conversationId, state, turns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to get conversation' });
  }
});

aiV2Router.delete('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const deleted = await productionConsultationService.deleteOwnedConversationAsync(req.params.id, userId);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete conversation' });
  }
});
