/**
 * ASTROWORLD AI V2 — Phase 6A Production AI API Hardening Types
 * Canonical schemas for production consultation requests, responses, error contracts,
 * observability metrics, health checks, and idempotency records.
 */

import { BirthProfile } from '../schemas/birthProfile.ts';
import { MemoryCategory, MemorySensitivity } from '../memory/persistentMemoryTypes.ts';

export type ProductionErrorCode =
  | 'CLIENT_VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'CONVERSATION_NOT_FOUND'
  | 'CONVERSATION_OWNERSHIP_ERROR'
  | 'ASTROLOGY_INPUT_ERROR'
  | 'TOOL_EXECUTION_ERROR'
  | 'KNOWLEDGE_RETRIEVAL_ERROR'
  | 'REASONING_ERROR'
  | 'MEMORY_ERROR'
  | 'MODEL_TIMEOUT'
  | 'MODEL_RATE_LIMIT'
  | 'MODEL_PROVIDER_ERROR'
  | 'MODEL_UNAVAILABLE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'REQUEST_TOO_LARGE'
  | 'CONCURRENCY_CONFLICT'
  | 'INTERNAL_ERROR';

export type ExecutionMode = 'production' | 'deterministic_ci' | 'mock';

export interface AuthenticatedUserContext {
  userId: string;
  email?: string;
  role?: 'user' | 'admin' | 'subscriber' | 'anonymous';
  sessionToken?: string;
  ipAddress?: string;
}

export interface ProductionConsultationRequest {
  authenticatedUser: AuthenticatedUserContext;
  conversationId: string;
  userMessage: string;
  birthProfile: BirthProfile;
  idempotencyKey?: string;
  clientTurnId?: string;
  locale?: string;
  timezone?: string;
  executionMode?: ExecutionMode;
  consultationContext?: Array<{
    role: 'user' | 'assistant';
    text: string;
    turnIndex?: number;
  }>;
}

export interface ProductionUserResponse {
  text: string;
  format: 'conversational_prose' | 'structured_summary';
  timestamp: string;
}

export interface ProductionConversationMetadata {
  conversationId: string;
  turnIndex: number;
  domain: string;
  topic: string;
  requiresClarification: boolean;
  activeDomainConfidence: number;
}

export interface ProductionExecutionMetadata {
  requestId: string;
  durationMs: number;
  requestedModel?: string;
  selectedModel?: string;
  effectiveModel?: string;
  fallbackTriggered?: boolean;
  fallbackReason?: string;
  executionMode?: string;
  providerLatencyMs?: number;
  backendDurationMs?: number;
  totalDurationMs?: number;
  modelUsed?: string;
  stageTimingsMs: {
    validation: number;
    memoryLookup: number;
    planning: number;
    toolExecution: number;
    ragLookup: number;
    reasoning: number;
    generation: number;
    firewallValidation: number;
    memoryPersist: number;
  };
  retryCount: number;
  toolCount: number;
  memoryCount: number;
  cachedOrIdempotent?: boolean;
}

export interface ProductionConsultationResponse {
  success: true;
  requestId: string;
  conversationId: string;
  turnId: string;
  userResponse: ProductionUserResponse;
  conversationMetadata: ProductionConversationMetadata;
  executionMetadata: ProductionExecutionMetadata;
}

export interface ProductionErrorResponse {
  success: false;
  requestId: string;
  errorCode: ProductionErrorCode;
  statusCode: number;
  userMessage: string;
  timestamp: string;
  retryAfterSeconds?: number;
}

export interface IdempotencyRecord {
  key: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'failed';
  responsePayload?: ProductionConsultationResponse;
  errorPayload?: ProductionErrorResponse;
  createdAt: number;
  expiresAt: number;
}

export interface ReadinessCheckResult {
  status: 'ready' | 'degraded' | 'not_ready';
  checks: {
    geminiConfigured: boolean;
    databaseConfigured: boolean;
    corsConfigured: boolean;
    astrologyEngineOperational: boolean;
    memorySubsystemOperational: boolean;
    conversationStateOperational: boolean;
  };
  timestamp: string;
  environment: string;
  version: string;
}
