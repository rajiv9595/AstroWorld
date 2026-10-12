/**
 * ASTROWORLD AI V2 — Question Plan Schema & Validation
 * Defines the structured contract for natural-language astrological question understanding.
 */

import { VargaCode } from '../../../../shared/index.ts';

export type QuestionIntent =
  | 'career'
  | 'career_timing'
  | 'promotion_timing'
  | 'job_change'
  | 'education'
  | 'marriage'
  | 'relationship'
  | 'finance'
  | 'wealth'
  | 'business'
  | 'travel'
  | 'health'
  | 'spirituality'
  | 'dasha_analysis'
  | 'transit_analysis'
  | 'yoga_analysis'
  | 'varga_analysis'
  | 'general_chart_question'
  | 'planet_question'
  | 'house_question'
  | 'compatibility'
  | 'muhurta'
  | 'panchanga'
  | 'clarification_needed'
  | string;

export type QuestionDomain =
  | 'career'
  | 'relationship'
  | 'finance'
  | 'health'
  | 'education'
  | 'spirituality'
  | 'timing'
  | 'general'
  | 'astrological'
  | string;

export type TemporalScopeType =
  | 'natal'
  | 'current'
  | 'upcoming'
  | 'specific_date'
  | 'date_range'
  | 'lifetime';

export interface TemporalScope {
  type: TemporalScopeType;
  startIso?: string;
  endIso?: string;
  targetDatesIso?: string[];
}

export interface ClarificationDetails {
  question: string;
  reason?: string;
  suggestedOptions?: string[];
}

export interface ToolDependency {
  tool: string;
  dependsOn: string[];
}

export interface PlannedToolRequest {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  dependsOn?: string[];
  priority?: number;
}

export interface QuestionPlan {
  questionId: string;
  rawQuestion: string;
  normalizedQuestion: string;
  intent: QuestionIntent;
  domain: QuestionDomain;
  /** Additional life domains requested by compound or context-dependent follow-up questions. */
  secondaryDomains?: QuestionDomain[];
  event?: string;
  planetFocus: string[];
  houseFocus: number[];
  chartLayers: VargaCode[];
  temporalScope: TemporalScope;
  targetDatesIso: string[];
  requestedComparison?: boolean;
  requiredTools: PlannedToolRequest[];
  toolDependencies?: ToolDependency[];
  priority: number;
  ambiguities: string[];
  clarificationRequired: boolean;
  clarification?: ClarificationDetails;
  followUpContext?: {
    isFollowUp: boolean;
    parentQuestionId?: string;
    resolvedEntity?: string;
  };
  version: string;
  createdAtIso: string;
}

export interface QuestionPlanValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateQuestionPlan(plan: any): QuestionPlanValidationResult {
  const errors: string[] = [];

  if (!plan || typeof plan !== 'object') {
    return { valid: false, errors: ['QuestionPlan must be a non-null object.'] };
  }

  if (!plan.questionId || typeof plan.questionId !== 'string') {
    errors.push('QuestionPlan.questionId must be a non-empty string.');
  }

  if (!plan.rawQuestion || typeof plan.rawQuestion !== 'string') {
    errors.push('QuestionPlan.rawQuestion must be a non-empty string.');
  }

  if (!plan.intent || typeof plan.intent !== 'string') {
    errors.push('QuestionPlan.intent must be a non-empty string.');
  }

  if (!plan.domain || typeof plan.domain !== 'string') {
    errors.push('QuestionPlan.domain must be a non-empty string.');
  }

  if (!Array.isArray(plan.planetFocus)) {
    errors.push('QuestionPlan.planetFocus must be an array of planet names.');
  }

  if (!Array.isArray(plan.houseFocus)) {
    errors.push('QuestionPlan.houseFocus must be an array of house numbers (1-12).');
  } else {
    for (const h of plan.houseFocus) {
      if (typeof h !== 'number' || h < 1 || h > 12) {
        errors.push(`Invalid house in houseFocus: ${h}. Must be 1-12.`);
      }
    }
  }

  if (!Array.isArray(plan.chartLayers)) {
    errors.push('QuestionPlan.chartLayers must be an array of Varga codes.');
  }

  if (!plan.temporalScope || typeof plan.temporalScope !== 'object') {
    errors.push('QuestionPlan.temporalScope must be an object.');
  }

  if (!Array.isArray(plan.requiredTools)) {
    errors.push('QuestionPlan.requiredTools must be an array of tool requests.');
  } else {
    for (let i = 0; i < plan.requiredTools.length; i++) {
      const tool = plan.requiredTools[i];
      if (!tool.toolName || typeof tool.toolName !== 'string') {
        errors.push(`requiredTools[${i}].toolName must be a non-empty string.`);
      }
      if (!tool.parameters || typeof tool.parameters !== 'object') {
        errors.push(`requiredTools[${i}].parameters must be an object.`);
      }
    }
  }

  if (typeof plan.clarificationRequired !== 'boolean') {
    errors.push('QuestionPlan.clarificationRequired must be a boolean.');
  }

  if (plan.clarificationRequired && !plan.clarification?.question) {
    errors.push('When clarificationRequired is true, clarification.question must be provided.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
