/**
 * ASTROWORLD AI V2 — End-to-End Consultation Packet Schema
 * Defines the complete consultation output, performance latency breakdown, and execution trace.
 */

import { QuestionPlan } from './questionPlan.ts';
import { EvidencePacket } from './evidencePacket.ts';
import { RetrievalResultItem, RAGRetrievalResponse } from './knowledgeRecord.ts';
import { ReasoningPacket } from './reasoningPacket.ts';
import { ApprovedClaimSet } from './claimPacket.ts';
import { ResponsePlan, FinalResponse } from './responsePlan.ts';

export type ExecutionMode = 'live_gemini' | 'mock_gemini' | 'deterministic_ci';

export interface ConsultationLatencyBreakdown {
  total: number;
  planning: number;
  tools: number;
  rag: number;
  reasoning: number;
  claims: number;
  responsePlanning: number;
  narration: number;
  validation: number;
  repair: number;
}

export interface ConsultationMetrics {
  toolCallCount: number;
  ragResultCount: number;
  candidateClaimCount: number;
  approvedClaimCount: number;
  unsupportedClaimCount: number;
  repairAttempts: number;
  modelCallCount: number;
  characterCount: number;
  wordCount: number;
}

export interface ConsultationTrace {
  traceId: string;
  questionId: string;
  executionMode: ExecutionMode;
  geminiModelUsed?: string;
  latencyMs: ConsultationLatencyBreakdown;
  metrics: ConsultationMetrics;
  timestampIso: string;
}

export interface ConsultationResult {
  finalResponse: FinalResponse;
  questionPlan: QuestionPlan;
  evidencePacket: EvidencePacket;
  ragResponse: RAGRetrievalResponse;
  ragResults: RetrievalResultItem[];
  reasoningPacket: ReasoningPacket;
  approvedClaimSet: ApprovedClaimSet;
  responsePlan: ResponsePlan;
  trace: ConsultationTrace;
  success: boolean;
  conversationState?: any;
  contextPack?: any;
  stateTrace?: any;
  memoryPack?: any;
  memoryTrace?: any;
}

/**
 * Validates a ConsultationResult object.
 */
export function validateConsultationResult(result: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!result || typeof result !== 'object') {
    return { valid: false, errors: ['ConsultationResult must be an object'] };
  }

  if (!result.finalResponse || typeof result.finalResponse.text !== 'string') {
    errors.push('ConsultationResult.finalResponse must contain valid text');
  }

  if (!result.questionPlan || typeof result.questionPlan.questionId !== 'string') {
    errors.push('ConsultationResult.questionPlan must contain a valid questionId');
  }

  if (!result.evidencePacket || !Array.isArray(result.evidencePacket.facts)) {
    errors.push('ConsultationResult.evidencePacket must contain facts array');
  }

  if (!result.reasoningPacket || typeof result.reasoningPacket.direction !== 'string') {
    errors.push('ConsultationResult.reasoningPacket must contain direction');
  }

  if (!result.approvedClaimSet || !Array.isArray(result.approvedClaimSet.claims)) {
    errors.push('ConsultationResult.approvedClaimSet must contain claims array');
  }

  if (!result.responsePlan || !Array.isArray(result.responsePlan.sections)) {
    errors.push('ConsultationResult.responsePlan must contain sections array');
  }

  if (!result.trace || typeof result.trace.traceId !== 'string') {
    errors.push('ConsultationResult.trace must contain traceId');
  }

  if (!result.trace || !result.trace.latencyMs || typeof result.trace.latencyMs.total !== 'number') {
    errors.push('ConsultationResult.trace must contain valid latencyMs');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
