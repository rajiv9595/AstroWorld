/**
 * ASTROWORLD AI V2 — Claim Packet Schema & Validation
 * Defines the structured claim model, audit record, and ApprovedClaimSet.
 * Acts as the strict contract between the Reasoning Engine and future Narrator.
 */

export type ClaimType =
  | 'factual'
  | 'interpretive'
  | 'timing'
  | 'qualified_prediction'
  | 'source_explanation'
  | 'user_context';

export type AstrologicalFactorType =
  | 'natal'
  | 'transit'
  | 'dasha'
  | 'varga'
  | 'confluence'
  | 'interpretation'
  | 'classical_rule'
  | 'general';

export type TimingWindowCategory =
  | 'dasha_cycle'
  | 'transit_period'
  | 'confluence_window'
  | 'event_window';

export type ClaimStrength =
  | 'strong'
  | 'moderate'
  | 'mixed'
  | 'weak'
  | 'insufficient';

export type ClaimRelevance = 'high' | 'medium' | 'low' | 'irrelevant';

export interface TemporalScopeClaim {
  startIso?: string;
  endIso?: string;
  label?: string;
  windowCategory?: TimingWindowCategory;
}

export interface ClaimItem {
  claimId: string;
  text: string;
  type: ClaimType;
  factorType?: AstrologicalFactorType;
  strength: ClaimStrength;
  evidenceIds: string[];
  ruleIds: string[];
  sourceIds: string[];
  temporalScope?: TemporalScopeClaim;
  timingCategory?: TimingWindowCategory;
  relevance: ClaimRelevance;
  allowed: boolean;
  rejectionReason?: string;
  failedChecks?: string[];
  astrologicalEntities?: string[];
  houseReferences?: number[];
}

export interface ClaimAuditRecord {
  claimId: string;
  validationStatus: 'approved' | 'rejected';
  failedChecks: string[];
  evidenceIds: string[];
  ruleIds: string[];
  sourceIds: string[];
  timestampIso: string;
}

export interface QuestionCoverageStatus {
  complete: boolean;
  coveredEntities: string[];
  coveredHouses: number[];
  coveredDomains: string[];
  missing: string[];
}

export interface ApprovedClaimSet {
  status: 'approved' | 'rejected' | 'insufficient_evidence';
  questionId: string;
  claims: ClaimItem[];
  rejectedClaims: ClaimItem[];
  questionCoverage: QuestionCoverageStatus;
  preservesContradictions: boolean;
  auditRecords: ClaimAuditRecord[];
  validatorVersion: string;
  createdAtIso: string;
  verified: boolean;
}

/**
 * Validates the schema integrity of an ApprovedClaimSet.
 */
export function validateApprovedClaimSet(claimSet: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!claimSet || typeof claimSet !== 'object') {
    return { valid: false, errors: ['ApprovedClaimSet must be a non-null object.'] };
  }

  if (!claimSet.questionId || typeof claimSet.questionId !== 'string') {
    errors.push('ApprovedClaimSet.questionId must be a string.');
  }

  const validStatuses = ['approved', 'rejected', 'insufficient_evidence'];
  if (!validStatuses.includes(claimSet.status)) {
    errors.push(`Invalid status: "${claimSet.status}". Must be one of: ${validStatuses.join(', ')}`);
  }

  if (!Array.isArray(claimSet.claims)) {
    errors.push('ApprovedClaimSet.claims must be an array.');
  } else {
    for (let i = 0; i < claimSet.claims.length; i++) {
      const c = claimSet.claims[i];
      if (!c.claimId) errors.push(`Claim at index ${i} missing claimId.`);
      if (!c.text) errors.push(`Claim at index ${i} missing text.`);
      if (!Array.isArray(c.evidenceIds)) errors.push(`Claim ${c.claimId || i} missing evidenceIds array.`);
      if (!Array.isArray(c.ruleIds)) errors.push(`Claim ${c.claimId || i} missing ruleIds array.`);
      if (!Array.isArray(c.sourceIds)) errors.push(`Claim ${c.claimId || i} missing sourceIds array.`);
      if (typeof c.allowed !== 'boolean') errors.push(`Claim ${c.claimId || i} missing boolean "allowed".`);
    }
  }

  if (!Array.isArray(claimSet.rejectedClaims)) {
    errors.push('ApprovedClaimSet.rejectedClaims must be an array.');
  }

  if (!claimSet.questionCoverage || typeof claimSet.questionCoverage !== 'object') {
    errors.push('ApprovedClaimSet.questionCoverage must be an object.');
  }

  if (typeof claimSet.preservesContradictions !== 'boolean') {
    errors.push('ApprovedClaimSet.preservesContradictions must be a boolean.');
  }

  if (!Array.isArray(claimSet.auditRecords)) {
    errors.push('ApprovedClaimSet.auditRecords must be an array.');
  }

  if (typeof claimSet.verified !== 'boolean') {
    errors.push('ApprovedClaimSet.verified must be a boolean.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
