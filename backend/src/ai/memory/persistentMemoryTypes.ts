/**
 * ASTROWORLD AI V2 — Phase 5B Persistent Consultation Memory Data Model
 * Strict TypeScript definitions for persistent consultation memories, categories,
 * source trust hierarchies, validation states, write gates, consolidation, and traces.
 */

export type MemoryCategory =
  | 'USER_FACT'
  | 'USER_PREFERENCE'
  | 'CONSULTATION_TOPIC'
  | 'CONSULTATION_THREAD'
  | 'USER_CORRECTION'
  | 'ASSISTANT_CONCLUSION'
  | 'IMPORTANT_EVENT';

export type MemorySourceType =
  | 'user_explicit'
  | 'user_confirmation'
  | 'assistant_derived'
  | 'system_import';

export type MemoryStatus =
  | 'active'
  | 'superseded'
  | 'revoked'
  | 'expired'
  | 'pending_validation';

export type MemorySensitivity =
  | 'normal'
  | 'personal'
  | 'sensitive';

export type MemoryValidationStatus =
  | 'not_applicable'
  | 'validated'
  | 'stale'
  | 'invalidated'
  | 'requires_recheck';

/**
 * Explicit semantic source trust hierarchy:
 * USER_CONFIRMED > ENGINE_CANONICAL > CURRENT_REASONING > HISTORICAL_INTERPRETATION
 */
export type MemorySourceTrust =
  | 'USER_CONFIRMED'
  | 'ENGINE_CANONICAL'
  | 'CURRENT_REASONING'
  | 'HISTORICAL_INTERPRETATION';

export interface PersistentMemory {
  memoryId: string;
  userId: string;
  category: MemoryCategory;
  key: string;
  value: string;
  normalizedValue: string;
  sourceType: MemorySourceType;
  sourceTrust: MemorySourceTrust;
  sourceTurnId?: string;
  conversationId?: string;
  confidence: number;
  status: MemoryStatus;
  sensitivity: MemorySensitivity;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  lastValidatedAt?: string;
  expiresAt?: string;
  supersedesMemoryId?: string;
  supersededByMemoryId?: string;
  validationStatus: MemoryValidationStatus;
  evidenceRefs: string[];
  tags: string[];
  version: number;
  metadata?: Record<string, any>;
}

export interface MemoryFilterOptions {
  userId: string;
  categories?: MemoryCategory[];
  status?: MemoryStatus | MemoryStatus[];
  domain?: string;
  topic?: string;
  keys?: string[];
  limit?: number;
  offset?: number;
  includeSuperseded?: boolean;
  includeExpired?: boolean;
}

export interface MemoryWriteCandidate {
  candidateId?: string;
  userId: string;
  category: MemoryCategory;
  key: string;
  value: string;
  sourceType: MemorySourceType;
  sourceTrust?: MemorySourceTrust;
  sensitivity?: MemorySensitivity;
  confidence?: number;
  sourceTurnId?: string;
  conversationId?: string;
  evidenceRefs?: string[];
  tags?: string[];
  expiresAt?: string;
  isAstrologyConclusion?: boolean;
  astrologyContext?: {
    entities?: string[];
    domain?: string;
    timingWindow?: string;
    claimedOutcome?: string;
  };
}

export interface MemoryWriteGateDecision {
  accepted: boolean;
  candidate: MemoryWriteCandidate;
  rejectionReason?: string;
  assignedSensitivity: MemorySensitivity;
  assignedTrust: MemorySourceTrust;
  assignedValidationStatus: MemoryValidationStatus;
  suggestedSupersedesId?: string;
  requiresUserConfirmation?: boolean;
}

export interface RelevantMemoryPack {
  userId: string;
  retrievedAt: string;
  totalMemoriesConsidered: number;
  selectedMemories: PersistentMemory[];
  userFacts: PersistentMemory[];
  userPreferences: PersistentMemory[];
  activeThreads: PersistentMemory[];
  revalidatedAstrologyConclusions: PersistentMemory[];
  invalidatedAstrologyConclusions: PersistentMemory[];
  contextSummary: string;
  latencyMs: number;
}

export interface MemoryTrace {
  traceId: string;
  userId: string;
  conversationId?: string;
  retrievalQuery?: string;
  domain?: string;
  memoriesConsideredCount: number;
  memoriesSelectedCount: number;
  rejectionReasons: Array<{ memoryId: string; reason: string }>;
  writeCandidatesCount: number;
  writeDecisions: MemoryWriteGateDecision[];
  consolidationDecisions: Array<{ oldId?: string; newId?: string; action: string; reason: string }>;
  revalidationResults: Array<{ memoryId: string; status: MemoryValidationStatus; note: string }>;
  latencyMs: number;
}

export interface UserVisibleMemoryItem {
  id: string;
  category: MemoryCategory;
  summary: string;
  dateRemembered: string;
}

export interface MemoryCommandParseResult {
  isCommand: boolean;
  action?: 'remember' | 'forget_specific' | 'forget_all' | 'list_memories' | 'revoke_last' | 'query_specific';
  targetKey?: string;
  targetValue?: string;
  feedbackMessage?: string;
}

export function validatePersistentMemory(mem: Partial<PersistentMemory>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!mem.memoryId || typeof mem.memoryId !== 'string') errors.push('Missing or invalid memoryId');
  if (!mem.userId || typeof mem.userId !== 'string') errors.push('Missing or invalid userId');
  if (!mem.category) errors.push('Missing category');
  if (!mem.key || typeof mem.key !== 'string') errors.push('Missing or invalid key');
  if (!mem.value || typeof mem.value !== 'string') errors.push('Missing or invalid value');
  if (!mem.sourceType) errors.push('Missing sourceType');
  if (!mem.status) errors.push('Missing status');
  if (!mem.createdAt) errors.push('Missing createdAt');

  return { valid: errors.length === 0, errors };
}
