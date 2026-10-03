/**
 * ASTROWORLD AI V2 — Response Plan & Narrator Schemas
 * Defines the structured ResponsePlan, ExtractedResponseClaim, and FinalResponse.
 */

import { ClaimItem } from './claimPacket.ts';

export type ResponseType =
  | 'simple_fact'
  | 'simple_interpretation'
  | 'focused_analysis'
  | 'timing_analysis'
  | 'deep_analysis'
  | 'comparison'
  | 'clarification'
  | 'insufficient_evidence'
  | 'follow_up'
  | 'correction';

export type RequestedDepth = 'concise' | 'standard' | 'deep';

export type NarratorTone =
  | 'warm_direct'
  | 'conversational_mentor'
  | 'calm_analytical'
  | 'humble_clarifying';

export interface ResponseSectionPlan {
  id: string;
  title: string;
  intent: string;
  claimIds: string[];
}

import { NarratorContextPack } from './narratorContext.ts';

export interface ResponsePlan {
  responseId: string;
  questionId: string;
  responseType: ResponseType;
  answerFirst: boolean;
  requestedDepth: RequestedDepth;
  tone: NarratorTone;
  sections: ResponseSectionPlan[];
  claimIdsPerSection: Record<string, string[]>;
  timingClaims: string[];
  restrictions: string[];
  unansweredParts: string[];
  contextPack?: NarratorContextPack;
  followUpStrategy?: {
    suggestedNextTopics: string[];
  };
  responseVersion: string;
  createdAtIso: string;
}

export interface ExtractedResponseClaim {
  claimText: string;
  claimType: 'factual' | 'interpretive' | 'timing' | 'prediction' | 'unverified';
  referencedDates: string[];
  planets: string[];
  houses: number[];
  yogas: string[];
  entities: string[];
  certaintyLevel: 'certain' | 'probabilistic' | 'insufficient';
}

export interface PostResponseValidationResult {
  valid: boolean;
  violations: string[];
  unapprovedEntities: string[];
  unapprovedDates: string[];
  unapprovedRemedies: string[];
  certaintyEscalations: string[];
  suppressedContradictions: boolean;
}

export interface FinalResponse {
  responseId: string;
  questionId: string;
  text: string;
  responseType: ResponseType;
  referencedClaimIds: string[];
  referencedEvidenceIds: string[];
  validatorStatus: 'approved' | 'repaired' | 'fallback_safe';
  responseVersion: string;
  createdAtIso: string;
  verified: boolean;
}

export function validateFinalResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['FinalResponse must be a non-null object.'] };
  }

  if (!response.responseId || typeof response.responseId !== 'string') {
    errors.push('FinalResponse.responseId must be a string.');
  }

  if (!response.questionId || typeof response.questionId !== 'string') {
    errors.push('FinalResponse.questionId must be a string.');
  }

  if (!response.text || typeof response.text !== 'string') {
    errors.push('FinalResponse.text must be a non-empty string.');
  }

  if (!Array.isArray(response.referencedClaimIds)) {
    errors.push('FinalResponse.referencedClaimIds must be an array.');
  }

  if (!Array.isArray(response.referencedEvidenceIds)) {
    errors.push('FinalResponse.referencedEvidenceIds must be an array.');
  }

  const validStatuses = ['approved', 'repaired', 'fallback_safe'];
  if (!validStatuses.includes(response.validatorStatus)) {
    errors.push(`Invalid validatorStatus: "${response.validatorStatus}". Must be one of: ${validStatuses.join(', ')}`);
  }

  if (typeof response.verified !== 'boolean') {
    errors.push('FinalResponse.verified must be a boolean.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
