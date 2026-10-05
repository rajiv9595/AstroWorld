/**
 * ASTROWORLD — AI V2 API Routes
 * All consultation, memory, and conversation data is bound to the verified
 * Supabase identity attached by authMiddleware.
 */

import { Router, Request, Response } from 'express';
import { QuestionPlanner } from '../planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../orchestrator/toolOrchestrator.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';
import { ProductionConsultationService } from '../production/productionConsultationService.ts';
import { ProductionError } from '../production/productionErrors.ts';
import { authenticateRequest, getAuthenticatedUser, requireAdmin } from '../../../middleware/authMiddleware.ts';
import { UserMemoryService } from '../memory/userMemoryService.ts';

export const aiV2Router = Router();

const questionPlanner = new QuestionPlanner();
const toolOrchestrator = new ToolExecutionOrchestrator();
export const productionConsultationService = new ProductionConsultationService();
const userMemoryService = new UserMemoryService();

function getIpAddress(req: Request): string {
  return req.ip || '0.0.0.0';
}

aiV2Router.get('/status', (_req: Request, res: Response) => {
  res.json({
    system: 'AstroWorld AI V2',
    status: 'operational',
    phase: 'production-convergence',
    capabilities: [
      'question_understanding',
      'deterministic_astrology_tools',
      'classical_knowledge_retrieval',
      'evidence_grounded_reasoning',
      'claim_grounding',
      'conversational_narration',
      'conversation_state',
      'persistent_memory',
    ],
  });
});

// Everything below this point requires a verified authenticated session.
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

aiV2Router.post('/plan', async (req: Request, res: Response) => {
  try {
    const question = req.body?.question;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ success: false, error: 'Question must be a non-empty string.' });
      return;
    }

    const plan = await questionPlanner.plan(question, req.body?.followUpContext);
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to generate question plan.' });
  }
});

aiV2Router.post('/orchestrate', async (req: Request, res: Response) => {
  try {
    const { question, birthProfile, followUpContext } = req.body || {};

    if (!question || typeof question !== 'string') {
      res.status(400).json({ success: false, error: 'Question must be a non-empty string.' });
      return;
    }

    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid || !birthValidation.data) {
      res.status(400).json({ success: false, error: birthValidation.error });
      return;
    }

    const plan = await questionPlanner.plan(question, followUpContext);
    const evidencePacket = await toolOrchestrator.orchestrate(plan, birthValidation.data);

    res.json({ success: true, evidencePacket });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to orchestrate astrological tools.' });
  }
});

aiV2Router.post('/consult', async (req: Request, res: Response) => {
  try {
    const authenticatedUser = getAuthenticatedUser(req);
    const response = await productionConsultationService.consult({
      authenticatedUser: {
        userId: authenticatedUser.userId,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
        ipAddress: getIpAddress(req),
      },
      conversationId: req.body?.conversationId,
      userMessage: req.body?.question || req.body?.userMessage || req.body?.message,
      birthProfile: req.body?.birthProfile,
      consultationContext: req.body?.conversationContext || req.body?.consultationContext,
      executionMode: req.body?.forceMockMode ? 'mock' : 'production',
    });

    res.json({ success: true, result: response });
  } catch (err: any) {
    if (err instanceof ProductionError) {
      res.status(err.statusCode).json(err.toClientResponse('req_' + Date.now()));
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to complete consultation pipeline.' });
  }
});

aiV2Router.get('/memory', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
    const memories = await userMemoryService.listMemories(userId, { domain });
    res.json({ success: true, memories });
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

aiV2Router.get('/conversations', (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const stateManager = productionConsultationService.getStateManager();
    const summaries = productionConsultationService.listOwnedConversationIds(userId)
      .map((conversationId) => {
        const state = stateManager.getState(conversationId);
        const turns = stateManager.getTurns(conversationId);
        if (!state) return null;

        const lastTurn = turns[turns.length - 1];
        return {
          conversationId,
          title: state.currentTopic || 'Astrological Consultation',
          domain: state.currentDomain || 'general',
          lastActivityIso: state.updatedAtIso,
          turnCount: turns.length,
          preview: lastTurn?.answerSummary?.mainConclusion?.slice(0, 120) || 'Fresh consultation',
        };
      })
      .filter(Boolean);

    res.json({ success: true, conversations: summaries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to list conversations' });
  }
});

aiV2Router.get('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const conversationId = req.params.id;

    if (!productionConsultationService.isConversationOwnedBy(conversationId, userId)) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const stateManager = productionConsultationService.getStateManager();
    const state = stateManager.getState(conversationId);
    const turns = stateManager.getTurns(conversationId);

    if (!state) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.json({ success: true, conversationId, state, turns });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to get conversation' });
  }
});

aiV2Router.delete('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { userId } = getAuthenticatedUser(req);
    const deleted = productionConsultationService.deleteOwnedConversation(req.params.id, userId);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete conversation' });
  }
});
