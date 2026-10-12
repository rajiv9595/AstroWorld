import { ClaimType, AstrologicalFactorType, TimingWindowCategory } from './claimPacket.ts';

export interface SanitizedTimingWindow {
  id: string;
  label: string;
  periodText: string;
  type: 'supportive_window' | 'restricting_window' | 'peak_confluence_window' | 'general_dasha_period';
  windowCategory: TimingWindowCategory;
  startIso?: string;
  endIso?: string;
}

export interface SelectedClaimSummary {
  claimId: string;
  naturalText: string;
  type: ClaimType;
  factorType: AstrologicalFactorType;
  strength: 'strong' | 'moderate' | 'weak' | 'mixed' | 'insufficient';
  isRestriction: boolean;
  isTransit: boolean;
  evidenceIds: string[];
}

export interface NarratorContextPack {
  originalQuestion: string;
  domain: string;
  /** Additional question facets that must be answered when approved evidence exists. */
  secondaryDomains?: string[];
  intent: string;
  responseType: string;
  technicalMode: 'normal' | 'technical';
  directAnswerDirection: string;
  transitFocus?: {
    isTransitQuestion: boolean;
    transitingPlanet?: string;
    targetHouse?: number;
    activationSummary?: string;
    hasVerifiedTransitEvidence: boolean;
  };
  natalFactors: string[];
  transitFactors: string[];
  dashaFactors: string[];
  vargaFactors: string[];
  supportingFactors: string[];
  restrictingFactors: string[];
  timingWindows: SanitizedTimingWindow[];
  dashaWindow?: SanitizedTimingWindow;
  transitWindow?: SanitizedTimingWindow;
  confluenceWindow?: SanitizedTimingWindow;
  classicalContextSummary: string;
  uncertaintyLevel: 'low' | 'moderate' | 'high';
  requestedDepth: 'concise' | 'standard' | 'deep';
  selectedClaimIds: string[];
  selectedEvidenceIds: string[];
  version: string;
  createdAtIso: string;
}

export function validateNarratorContextPack(pack: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!pack || typeof pack !== 'object') {
    return { valid: false, errors: ['NarratorContextPack must be an object.'] };
  }

  if (!pack.originalQuestion || typeof pack.originalQuestion !== 'string') {
    errors.push('NarratorContextPack.originalQuestion is required.');
  }

  if (!Array.isArray(pack.supportingFactors)) {
    errors.push('NarratorContextPack.supportingFactors must be an array.');
  }

  if (!Array.isArray(pack.timingWindows)) {
    errors.push('NarratorContextPack.timingWindows must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
