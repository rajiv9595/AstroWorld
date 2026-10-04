/**
 * ASTROWORLD — AI V2 API Routes
 * Exposes Question Planning and Deterministic Evidence Orchestration endpoints.
 */

import { Router, Request, Response } from 'express';
import { QuestionPlanner } from '../planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../orchestrator/toolOrchestrator.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';
import { ConsultationOrchestrator } from '../consultation/consultationOrchestrator.ts';
import { ProductionConsultationService } from '../production/productionConsultationService.ts';
import { ProductionError } from '../production/productionErrors.ts';

export const aiV2Router = Router();

const questionPlanner = new QuestionPlanner();
const toolOrchestrator = new ToolExecutionOrchestrator();
export const productionConsultationService = new ProductionConsultationService();

/**
 * GET /api/ai-v2/metrics
 * Returns current observability metrics snapshot (latencies, counts, error rates)
 */
aiV2Router.get('/metrics', (_req: Request, res: Response) => {
  res.json({ success: true, metrics: productionConsultationService.getMetrics().getSnapshot() });
});

/**
 * POST /api/ai-v2/v1/consult
 * Hardened canonical production consultation API
 */
aiV2Router.post('/v1/consult', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body?.idempotencyKey;
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';

    const response = await productionConsultationService.consult({
      authenticatedUser: {
        userId,
        ipAddress,
        email: req.body?.userEmail,
        role: req.body?.userRole || 'user',
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
  } catch (err: any) {
    if (err instanceof ProductionError) {
      if (err.retryAfterSeconds) {
        res.setHeader('Retry-After', String(err.retryAfterSeconds));
      }
      res.status(err.statusCode).json(err.toClientResponse(`req_${Date.now()}`));
    } else {
      res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        statusCode: 500,
        userMessage: 'An unexpected internal error occurred during the consultation.',
        timestamp: new Date().toISOString(),
      });
    }
  }
});

/**
 * GET /api/ai-v2/status
 * Phase 2B Status Endpoint
 */
aiV2Router.get('/status', (_req: Request, res: Response) => {
  res.json({
    system: 'AstroWorld AI V2',
    status: 'operational',
    phase: '2B',
    capabilities: [
      'question_understanding',
      'tool_planning',
      'dependency_resolution',
      'deterministic_tool_orchestration',
      'provenance_tracking',
    ],
  });
});

/**
 * POST /api/ai-v2/plan
 * Translates a user question into a validated QuestionPlan.
 */
aiV2Router.post('/plan', async (req: Request, res: Response) => {
  try {
    const { question, followUpContext } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question must be a non-empty string.' });
      return;
    }

    const plan = await questionPlanner.plan(question, followUpContext);
    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate question plan.' });
  }
});

/**
 * POST /api/ai-v2/orchestrate
 * Translates a question and executes the required deterministic tools, returning an EvidencePacket.
 */
aiV2Router.post('/orchestrate', async (req: Request, res: Response) => {
  try {
    const { question, birthProfile, followUpContext } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question must be a non-empty string.' });
      return;
    }

    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid) {
      res.status(400).json({ error: birthValidation.error });
      return;
    }

    const plan = await questionPlanner.plan(question, followUpContext);
    const evidencePacket = await toolOrchestrator.orchestrate(plan, birthProfile);

    res.json({ success: true, evidencePacket });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to orchestrate astrological tools.' });
  }
});

const consultationOrchestrator = new ConsultationOrchestrator({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * POST /api/ai-v2/consult
 * Full end-to-end consultation endpoint composing QuestionPlan -> Tools -> Evidence -> RAG -> Reasoner -> Claims -> Narrator -> FinalResponse
 */
aiV2Router.post('/consult', async (req: Request, res: Response) => {
  try {
    const { question, birthProfile, conversationContext, forceMockMode } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Question must be a non-empty string.' });
      return;
    }

    const birthValidation = validateBirthProfile(birthProfile);
    if (!birthValidation.valid) {
      res.status(400).json({ error: birthValidation.error });
      return;
    }

    const result = await consultationOrchestrator.consult(question, birthProfile, {
      conversationContext,
      forceMockMode,
    });

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to complete consultation pipeline.' });
  }
});

import { UserMemoryService } from '../memory/userMemoryService.ts';
const userMemoryService = new UserMemoryService();

// Helper to extract authenticated user ID
function getRequestUserId(req: Request): string {
  const headerId = req.headers['x-user-id'] as string;
  const queryId = req.query.userId as string;
  const bodyId = req.body?.userId as string;
  return headerId || queryId || bodyId || 'default_user';
}

/**
 * GET /api/ai-v2/memory
 * List active memories for the authenticated user
 */
aiV2Router.get('/memory', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const domain = req.query.domain as string | undefined;
    const memories = await userMemoryService.listMemories(userId, { domain });
    res.json({ success: true, userId, memories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list memories' });
  }
});

/**
 * GET /api/ai-v2/memory/summary
 * Returns user-visible formatted explanation of stored memories
 */
aiV2Router.get('/memory/summary', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const summary = await userMemoryService.formatUserVisibleSummary(userId);
    res.json({ success: true, userId, summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get memory summary' });
  }
});

/**
 * POST /api/ai-v2/memory
 * Create a new persistent memory record
 */
aiV2Router.post('/memory', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const { category, key, value, sensitivity, tags, expiresAt } = req.body;

    if (!category || !key || !value) {
      res.status(400).json({ error: 'category, key, and value are required fields.' });
      return;
    }

    const result = await userMemoryService.createOrUpdateMemory(userId, {
      userId,
      category,
      key,
      value,
      sourceType: 'user_explicit',
      sensitivity: sensitivity || 'normal',
      tags: tags || [],
      expiresAt,
    });

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true, memory: result.memory });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create memory' });
  }
});

/**
 * GET /api/ai-v2/memory/:id
 * Retrieve a specific memory record by ID
 */
aiV2Router.get('/memory/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const memory = await userMemoryService.getMemory(userId, req.params.id);
    if (!memory) {
      res.status(404).json({ error: 'Memory record not found' });
      return;
    }
    res.json({ success: true, memory });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get memory' });
  }
});

/**
 * DELETE /api/ai-v2/memory/:id
 * Delete a specific memory record
 */
aiV2Router.delete('/memory/:id', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const deleted = await userMemoryService.deleteMemory(userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Memory record not found to delete' });
      return;
    }
    res.json({ success: true, message: 'Memory successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete memory' });
  }
});

/**
 * DELETE /api/ai-v2/memory
 * Clear all memories for the authenticated user
 */
aiV2Router.delete('/memory', async (req: Request, res: Response) => {
  try {
    const userId = getRequestUserId(req);
    const count = await userMemoryService.clearUserMemory(userId);
    res.json({ success: true, clearedCount: count, message: 'All memories successfully cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear memories' });
  }
});

/**
 * GET /api/ai-v2/conversations
 * Returns summaries of active consultations
 */
aiV2Router.get('/conversations', (req: Request, res: Response) => {
  try {
    const stateManager = productionConsultationService.getStateManager();
    const sessions = (stateManager as any).sessions as Map<string, { state: any; turns: any[] }>;
    const summaries: Array<{
      conversationId: string;
      title: string;
      domain: string;
      lastActivityIso: string;
      turnCount: number;
      preview: string;
    }> = [];

    if (sessions) {
      for (const [id, session] of sessions.entries()) {
        const lastTurn = session.turns[session.turns.length - 1];
        const title = session.state?.currentTopic || (lastTurn ? lastTurn.question : 'Astrological Consultation');
        const preview = lastTurn ? lastTurn.answer.slice(0, 120) + (lastTurn.answer.length > 120 ? '...' : '') : 'Fresh consultation';
        summaries.push({
          conversationId: id,
          title,
          domain: session.state?.currentDomain || 'general',
          lastActivityIso: session.state?.updatedAtIso || new Date().toISOString(),
          turnCount: session.turns.length,
          preview,
        });
      }
    }

    res.json({ success: true, conversations: summaries });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list conversations' });
  }
});

/**
 * GET /api/ai-v2/conversations/:id
 * Retrieve turns for a specific conversation
 */
aiV2Router.get('/conversations/:id', (req: Request, res: Response) => {
  try {
    const stateManager = productionConsultationService.getStateManager();
    const state = stateManager.getState(req.params.id);
    const turns = stateManager.getTurns(req.params.id);

    if (!state && turns.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({
      success: true,
      conversationId: req.params.id,
      state,
      turns,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get conversation' });
  }
});

/**
 * DELETE /api/ai-v2/conversations/:id
 * Clear/delete a specific conversation
 */
aiV2Router.delete('/conversations/:id', (req: Request, res: Response) => {
  try {
    const stateManager = productionConsultationService.getStateManager();
    const sessions = (stateManager as any).sessions as Map<string, any>;
    if (sessions) {
      sessions.delete(req.params.id);
    }
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete conversation' });
  }
});

