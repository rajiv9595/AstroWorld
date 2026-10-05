/**
 * ASTROWORLD AI V2 — Reasoning Packet Schema & Validation
 * Defines the structured output of the Astrology Reasoning Engine.
 * Contains factor classification, rule applicability, confluence, temporal windows, and complete lineage.
 */

import { QuestionPlan } from './questionPlan.ts';
import { FactItem, DerivedFactItem } from './evidencePacket.ts';
import { JyotishTradition, ClassicalRuleType } from './knowledgeRecord.ts';

export type InterpretationDirection =
  | 'supportive'
  | 'challenging'
  | 'mixed'
  | 'neutral'
  | 'insufficient_evidence';

export type InterpretationStrength = 'strong' | 'moderate' | 'weak' | 'inconclusive';

export type FactorRelevance = 'high' | 'medium' | 'low' | 'irrelevant';

export type FactorRole =
  | 'primary'
  | 'supporting'
  | 'restricting'
  | 'conflicting'
  | 'background'
  | 'irrelevant';

export interface ClassifiedFactor {
  id: string;
  entity: string;
  property: string;
  value: any;
  role: FactorRole;
  relevance: FactorRelevance;
  rationale: string;
  sourceTool: string;
  evidenceId: string;
  /** Deterministic contribution weight used by confluence synthesis. */
  weight?: number;
}

export interface AppliedRuleRecord {
  ruleId: string;
  sourceId: string;
  sourceText: string;
  citation: string;
  tradition: JyotishTradition;
  ruleType: ClassicalRuleType;
  applicabilityStatus: 'applied' | 'rejected' | 'partially_satisfied';
  rejectionReason?: string;
  satisfiedPrerequisites: string[];
  missingPrerequisites?: string[];
  evidenceIds: string[];
  interpretationSummary: string;
}

export interface ConfluenceItem {
  layer: 'D1' | 'Varga' | 'Dasha' | 'Transit' | 'Yoga' | 'Ashtakavarga' | 'Jaimini';
  factorDescription: string;
  alignment: 'supportive' | 'restricting' | 'neutral';
  evidenceId: string;
  ruleId?: string;
  supportScore?: number;
  restrictingScore?: number;
}

export interface ConfluenceResult {
  hasConfluence: boolean;
  confluenceStrength: InterpretationStrength;
  convergingLayersCount: number;
  layers: ConfluenceItem[];
  confluenceSummary: string;
  supportiveScore?: number;
  restrictingScore?: number;
}

export interface TemporalWindowResult {
  id: string;
  label: string;
  startDateIso: string;
  endDateIso: string;
  startIso?: string;
  endIso?: string;
  type: 'supportive_window' | 'restricting_window' | 'peak_confluence_window' | 'general_dasha_period';
  contributingDasha?: string;
  contributingTransits?: string[];
  evidenceIds: string[];
  strength: InterpretationStrength;
}

export interface ReasoningAuditTrace {
  questionId: string;
  intent: string;
  domain: string;
  requiredFactsCount: number;
  verifiedFactsCount: number;
  applicableRulesCount: number;
  rejectedRulesCount: number;
  supportingFactorsCount: number;
  restrictingFactorsCount: number;
  conflictingFactorsCount: number;
  hasTemporalConfluence: boolean;
  stepSequence: string[];
  executionDurationMs: number;
}

export interface ReasoningPacket {
  questionId: string;
  direction: InterpretationDirection;
  strength: InterpretationStrength;
  primaryFactors: ClassifiedFactor[];
  supportingFactors: ClassifiedFactor[];
  restrictingFactors: ClassifiedFactor[];
  conflictingFactors: ClassifiedFactor[];
  irrelevantFactors: ClassifiedFactor[];
  appliedRules: AppliedRuleRecord[];
  confluence: ConfluenceResult;
  temporalWindows: TemporalWindowResult[];
  unresolvedQuestions: string[];
  evidenceLineage: string[];
  ruleLineage: string[];
  sourceLineage: string[];
  coverageStatus: 'complete' | 'partial' | 'insufficient_evidence';
  confidence: 'high' | 'medium' | 'low';
  auditTrace: ReasoningAuditTrace;
  version: string;
  createdAtIso: string;
  verified: boolean;
}

export function validateReasoningPacket(packet: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!packet || typeof packet !== 'object') {
    return { valid: false, errors: ['ReasoningPacket must be a non-null object.'] };
  }

  if (!packet.questionId || typeof packet.questionId !== 'string') {
    errors.push('ReasoningPacket.questionId must be a string.');
  }

  const validDirections: InterpretationDirection[] = [
    'supportive',
    'challenging',
    'mixed',
    'neutral',
    'insufficient_evidence',
  ];
  if (!validDirections.includes(packet.direction)) {
    errors.push(`Invalid direction: ${packet.direction}`);
  }

  const validStrengths: InterpretationStrength[] = ['strong', 'moderate', 'weak', 'inconclusive'];
  if (!validStrengths.includes(packet.strength)) {
    errors.push(`Invalid strength: ${packet.strength}`);
  }

  if (!Array.isArray(packet.primaryFactors)) errors.push('primaryFactors must be an array.');
  if (!Array.isArray(packet.supportingFactors)) errors.push('supportingFactors must be an array.');
  if (!Array.isArray(packet.restrictingFactors)) errors.push('restrictingFactors must be an array.');
  if (!Array.isArray(packet.conflictingFactors)) errors.push('conflictingFactors must be an array.');
  if (!Array.isArray(packet.appliedRules)) errors.push('appliedRules must be an array.');
  if (!packet.confluence || typeof packet.confluence !== 'object') errors.push('confluence must be an object.');
  if (!Array.isArray(packet.temporalWindows)) errors.push('temporalWindows must be an array.');
  if (!Array.isArray(packet.evidenceLineage)) errors.push('evidenceLineage must be an array.');
  if (!Array.isArray(packet.ruleLineage)) errors.push('ruleLineage must be an array.');
  if (!Array.isArray(packet.sourceLineage)) errors.push('sourceLineage must be an array.');
  if (!packet.auditTrace || typeof packet.auditTrace !== 'object') errors.push('auditTrace must be an object.');
  if (typeof packet.verified !== 'boolean') errors.push('verified must be a boolean.');

  return {
    valid: errors.length === 0,
    errors,
  };
}
