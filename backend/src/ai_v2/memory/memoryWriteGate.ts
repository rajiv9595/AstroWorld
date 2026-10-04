/**
 * ASTROWORLD AI V2 — Memory Write Gate
 * Validates candidate memories before persistence to prevent noise, transcript bloat,
 * unauthorized inference of sensitive attributes, and low-value ephemeral storage.
 */

import {
  MemoryWriteCandidate,
  MemoryWriteGateDecision,
  MemorySensitivity,
  MemorySourceTrust,
  MemoryValidationStatus,
} from './persistentMemoryTypes.ts';

export class MemoryWriteGate {
  /**
   * Disallowed patterns that represent temporary conversational artifacts or low-value filler.
   */
  private static readonly DISALLOWED_PATTERNS = [
    /\b(why\??|how so\??|what do you mean|what next\??)\b/i,
    /\b(unresolved_pronoun|ambiguous reference|clarification reason)\b/i,
    /\b(temporary|ephemeral|placeholder|testing 123)\b/i,
    /\b(raw tool output|execution trace|evidence packet|rag sloka)\b/i,
    /\b(random prose|filler|chitchat)\b/i,
  ];

  /**
   * Sensitive attributes that must NEVER be inferred or persisted automatically without explicit confirmation.
   */
  private static readonly FORBIDDEN_INFERRED_SENSITIVE = [
    /\b(medical condition|disease diagnosis|cancer|hiv|mental illness|depression)\b/i,
    /\b(sexual orientation|homosexual|heterosexual|bisexual)\b/i,
    /\b(political affiliation|democrat|republican|conservative|liberal|politics|voting history|voting|election)\b/i,
    /\b(criminal record|conviction|arrest)\b/i,
    /\b(caste|ethnic supremacy)\b/i,
  ];

  /**
   * Evaluates a candidate memory against all write criteria.
   */
  public evaluate(candidate: MemoryWriteCandidate): MemoryWriteGateDecision {
    const rawVal = candidate.value.trim();
    const rawKey = candidate.key.trim().toLowerCase();
    const testKey = rawKey.replace(/_/g, ' ');
    const testVal = rawVal.replace(/_/g, ' ');

    // 1. Minimum content check
    if (!rawVal || rawVal.length < 2) {
      return {
        accepted: false,
        candidate,
        rejectionReason: 'Memory value is empty or too short to be meaningful',
        assignedSensitivity: 'normal',
        assignedTrust: 'HISTORICAL_INTERPRETATION',
        assignedValidationStatus: 'not_applicable',
      };
    }

    // 2. Reject disallowed temporary/ephemeral patterns
    for (const pat of MemoryWriteGate.DISALLOWED_PATTERNS) {
      if (pat.test(rawVal) || pat.test(rawKey) || pat.test(testVal) || pat.test(testKey)) {
        return {
          accepted: false,
          candidate,
          rejectionReason: `Rejected low-value conversational artifact matching pattern ${pat}`,
          assignedSensitivity: 'normal',
          assignedTrust: 'HISTORICAL_INTERPRETATION',
          assignedValidationStatus: 'not_applicable',
        };
      }
    }

    // 3. Sensitive attribute inference check
    // If not explicitly provided by the user, never infer or store sensitive private traits
    if (candidate.sourceType !== 'user_explicit' && candidate.sourceType !== 'user_confirmation') {
      for (const sensPat of MemoryWriteGate.FORBIDDEN_INFERRED_SENSITIVE) {
        if (sensPat.test(rawVal) || sensPat.test(rawKey) || sensPat.test(testVal) || sensPat.test(testKey)) {
          return {
            accepted: false,
            candidate,
            rejectionReason: `Forbidden inference of sensitive private attribute matching ${sensPat}`,
            assignedSensitivity: 'sensitive',
            assignedTrust: 'HISTORICAL_INTERPRETATION',
            assignedValidationStatus: 'invalidated',
          };
        }
      }
    }

    // 4. Sensitivity Classification
    let assignedSensitivity: MemorySensitivity = candidate.sensitivity || 'normal';
    if (
      rawKey.includes('health') ||
      rawKey.includes('medical') ||
      rawKey.includes('relationship_status') ||
      rawKey.includes('financial_net_worth') ||
      rawVal.includes('health condition')
    ) {
      assignedSensitivity = 'personal';
    }

    // 5. Source Trust Assignment
    let assignedTrust: MemorySourceTrust;
    if (candidate.sourceType === 'user_explicit' || candidate.sourceType === 'user_confirmation') {
      assignedTrust = 'USER_CONFIRMED';
    } else if (candidate.sourceType === 'assistant_derived' || candidate.category === 'ASSISTANT_CONCLUSION') {
      assignedTrust = 'HISTORICAL_INTERPRETATION';
    } else {
      assignedTrust = 'CURRENT_REASONING';
    }

    // 6. Validation Status Assignment
    let assignedValidationStatus: MemoryValidationStatus = 'not_applicable';
    if (
      candidate.category === 'ASSISTANT_CONCLUSION' ||
      candidate.sourceType === 'assistant_derived' ||
      candidate.isAstrologyConclusion
    ) {
      // Historical astrology conclusions and assistant-derived consultation context require revalidation
      assignedValidationStatus = 'requires_recheck';
    } else if (candidate.sourceType === 'user_explicit' || candidate.sourceType === 'user_confirmation') {
      assignedValidationStatus = 'validated';
    }

    return {
      accepted: true,
      candidate,
      assignedSensitivity,
      assignedTrust,
      assignedValidationStatus,
      requiresUserConfirmation: assignedSensitivity === 'sensitive' && candidate.sourceType !== 'user_confirmation',
    };
  }
}
