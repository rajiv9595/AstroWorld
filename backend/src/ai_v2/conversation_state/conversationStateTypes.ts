/**
 * ASTROWORLD AI V2 — Phase 5A Conversation State Engine Types & Schemas
 * Defines strict, auditable, and immutable schemas for conversation state,
 * compact turn records, contextual referent resolution, previous claims, and context packs.
 */

export type ThreadStatus = 'open' | 'partially_resolved' | 'resolved' | 'superseded';

export interface StructuredAnswerSummary {
  mainConclusion: string;
  supportingFactors: string[];
  timing?: string;
  qualification?: string;
  unresolved?: string[];
}

export interface PreviousClaimRecord {
  claimId: string;
  topic: string;
  statement: string;
  type: string;
  confidence: 'high' | 'supported' | 'moderate' | 'cautious' | 'insufficient';
  source: 'reasoning' | 'evidence' | 'transit' | 'dasha' | 'varga';
  turnId: string;
  entities: string[];
  timingScope?: string;
  allowed: boolean;
}

export interface CorrectionRecord {
  correctionId: string;
  correctedClaimId?: string;
  previousStatement: string;
  correctedStatement: string;
  reason: string;
  turnId: string;
  createdAtIso: string;
}

export interface UnresolvedThread {
  threadId: string;
  topic: string;
  domain: string;
  originalQuestion: string;
  status: ThreadStatus;
  lastReferencedTurn: number;
  relatedClaimIds: string[];
  createdAtIso: string;
  resolvedAtIso?: string;
}

export interface ConversationTurn {
  turnId: string;
  turnIndex: number;
  userMessage: string;
  questionPlan?: any;
  responseType?: string;
  answerSummary: StructuredAnswerSummary;
  approvedClaimIds: string[];
  dominantFactors: string[];
  domain: string;
  intent: string;
  referencedFactors: string[];
  createdAt: string;
  executionMode: string;
}

export interface ResolvedReferents {
  hasReferents: boolean;
  resolvedTopic?: string;
  resolvedIntent?: string;
  resolvedEntity?: string;
  resolvedTemporalScope?: {
    type: string;
    startIso?: string;
    endIso?: string;
    label?: string;
  };
  referentTurnId?: string;
  referentClaimIds: string[];
  requestedExplanation: boolean;
  domainSwitched: boolean;
  previousDomain?: string;
  ambiguousReferences: string[];
  referentConfidence: number;
}

export interface ConversationContextPack {
  conversationId: string;
  currentTopic: string;
  currentDomain: string;
  previousDomain?: string;
  resolvedReferents: ResolvedReferents;
  recentRelevantClaims: PreviousClaimRecord[];
  relevantPreviousAnswerSummary?: StructuredAnswerSummary;
  unresolvedThreads: UnresolvedThread[];
  corrections: CorrectionRecord[];
  recentFactors: string[];
  clarificationNeeded: boolean;
  clarificationReason?: string;
  suggestedOptions?: string[];
  contextConfidence: number;
}

export interface ConversationState {
  conversationId: string;
  turnIndex: number;
  currentTopic: string;
  currentIntent: string;
  currentDomain: string;
  currentSubtopic?: string;
  activePlanetFocus: string[];
  activeHouseFocus: number[];
  activeVargas: string[];
  activeTimePeriods: string[];
  activeDates: string[];
  lastQuestion: string;
  lastAnswerSummary?: StructuredAnswerSummary;
  previousQuestion?: string;
  previousAnswerSummary?: StructuredAnswerSummary;
  activeClaims: PreviousClaimRecord[];
  relevantPreviousClaims: PreviousClaimRecord[];
  userCorrections: CorrectionRecord[];
  unresolvedThreads: UnresolvedThread[];
  recentlyDiscussedFactors: string[];
  recentQuestions: string[];
  recentAnswers: string[];
  referencedTurnIds: string[];
  clarificationNeeded: boolean;
  clarificationReason?: string;
  contextConfidence: number;
  stateVersion: number;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ConversationStateTrace {
  traceId: string;
  inputMessage: string;
  previousTurnIds: string[];
  detectedReferences: string[];
  resolvedReferences: Record<string, any>;
  topicBefore: string;
  topicAfter: string;
  domainBefore: string;
  domainAfter: string;
  referencedClaims: string[];
  unresolvedThreads: string[];
  clarificationDecision: {
    needed: boolean;
    reason?: string;
    suggestedOptions?: string[];
  };
  stateVersion: number;
  latencyMs: number;
}

export function validateConversationState(state: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!state) {
    return { valid: false, errors: ['ConversationState is null or undefined'] };
  }
  if (!state.conversationId || typeof state.conversationId !== 'string') {
    errors.push('conversationId is required and must be a string');
  }
  if (typeof state.turnIndex !== 'number' || state.turnIndex < 0) {
    errors.push('turnIndex must be a non-negative number');
  }
  if (!state.currentTopic || typeof state.currentTopic !== 'string') {
    errors.push('currentTopic is required and must be a string');
  }
  if (!state.currentDomain || typeof state.currentDomain !== 'string') {
    errors.push('currentDomain is required and must be a string');
  }
  if (!Array.isArray(state.activePlanetFocus)) {
    errors.push('activePlanetFocus must be an array');
  }
  if (!Array.isArray(state.activeClaims)) {
    errors.push('activeClaims must be an array');
  }
  if (!Array.isArray(state.unresolvedThreads)) {
    errors.push('unresolvedThreads must be an array');
  }
  if (typeof state.stateVersion !== 'number' || state.stateVersion < 1) {
    errors.push('stateVersion must be a positive integer');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
