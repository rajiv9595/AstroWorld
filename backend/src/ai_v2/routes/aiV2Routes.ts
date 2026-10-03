/**
 * ASTROWORLD — AI V2 API Routes
 * Exposes Question Planning and Deterministic Evidence Orchestration endpoints.
 */

import { Router, Request, Response } from 'express';
import { QuestionPlanner } from '../planner/questionPlanner.ts';
import { ToolExecutionOrchestrator } from '../orchestrator/toolOrchestrator.ts';
import { validateBirthProfile } from '../schemas/birthProfile.ts';
import { ConsultationOrchestrator } from '../consultation/consultationOrchestrator.ts';

export const aiV2Router = Router();

const questionPlanner = new QuestionPlanner();
const toolOrchestrator = new ToolExecutionOrchestrator();

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

const consultationOrchestrator = new ConsultationOrchestrator();

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

