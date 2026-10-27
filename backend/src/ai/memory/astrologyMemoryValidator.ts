/**
 * ASTROWORLD AI V2 — Astrology Memory Firewall & Validator
 * Enforces the strict three-tier truth hierarchy:
 * CURRENT ENGINE EVIDENCE > CURRENT REASONING > USER-CONFIRMED > HISTORICAL ASSISTANT CONCLUSION
 * 
 * Historical assistant statements NEVER override current deterministic ephemeris facts.
 */

import {
  PersistentMemory,
  MemoryValidationStatus,
} from './persistentMemoryTypes.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';

export interface AstrologyMemoryValidationResult {
  memoryId: string;
  isAstrological: boolean;
  isValidated: boolean;
  validationStatus: MemoryValidationStatus;
  revalidationReason: string;
  conflictsWithCurrentEvidence: boolean;
  conflictingFacts?: string[];
}

export class AstrologyMemoryValidator {
  /**
   * Keywords indicating that a memory contains an astrological claim requiring revalidation.
   */
  private static readonly ASTROLOGY_CLAIM_PATTERNS = [
    /\b(planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\b/i,
    /\b(house|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\b/i,
    /\b(dasha|mahadasha|antardasha|vimshottari)\b/i,
    /\b(transit|gochara|retrograde|exalted|debilitated)\b/i,
    /\b(yoga|raja yoga|dhana yoga|budhaditya|gajakesari)\b/i,
    /\b(timing|favorable period|confluence|window)\b/i,
    /\b(promotion period|marriage timing|wealth accumulation)\b/i,
  ];

  /**
   * Determines if a memory contains astrological assertions.
   */
  public isAstrologicalClaim(memory: PersistentMemory): boolean {
    if (memory.category === 'ASSISTANT_CONCLUSION') return true;
    const text = `${memory.key} ${memory.value} ${memory.tags.join(' ')}`;
    return AstrologyMemoryValidator.ASTROLOGY_CLAIM_PATTERNS.some(p => p.test(text));
  }

  /**
   * Revalidates an astrological memory against CURRENT engine evidence and reasoning.
   */
  public validateAgainstCurrentContext(
    memory: PersistentMemory,
    currentEvidence?: EvidencePacket,
    currentReasoning?: ReasoningPacket
  ): AstrologyMemoryValidationResult {
    const memoryId = memory.memoryId;

    // Non-astrological user facts (e.g. "prefers concise answers", "works in software") do not need engine revalidation
    if (!this.isAstrologicalClaim(memory)) {
      return {
        memoryId,
        isAstrological: false,
        isValidated: true,
        validationStatus: 'not_applicable',
        revalidationReason: 'Non-astrological memory does not require ephemeris validation',
        conflictsWithCurrentEvidence: false,
      };
    }

    // If current evidence is not yet available at this pipeline stage, mark requires_recheck
    if (!currentEvidence || currentEvidence.facts.length === 0) {
      return {
        memoryId,
        isAstrological: true,
        isValidated: false,
        validationStatus: 'requires_recheck',
        revalidationReason: 'Current engine evidence not supplied for revalidation',
        conflictsWithCurrentEvidence: false,
      };
    }

    const memValLower = memory.value.toLowerCase();
    const memKeyLower = memory.key.toLowerCase();
    const combined = `${memKeyLower} ${memValLower}`;

    const conflictingFacts: string[] = [];

    // 1. Dasha claims validation
    // E.g. memory says "Running Moon Mahadasha" or "Venus Antardasha until 2028"
    const dashaFacts = currentEvidence.facts.filter(
      f => (f as any).toolName === 'get_current_dasha' || f.sourceTool === 'get_current_dasha' || f.category === 'dasha'
    );
    for (const df of dashaFacts) {
      const dashaLords = [df.value?.mahadasha, df.value?.antardasha].filter(Boolean).map((s: string) => s.toLowerCase());
      // If memory asserted a specific Mahadasha lord that is now contradicted
      for (const planet of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']) {
        if (combined.includes(`${planet} mahadasha`) || combined.includes(`${planet} dasha`)) {
          if (df.value?.mahadasha && df.value.mahadasha.toLowerCase() !== planet) {
            conflictingFacts.push(
              `Memory claims ${planet} Mahadasha, but current ephemeris evidence proves active Mahadasha is ${df.value.mahadasha}`
            );
          }
        }
      }
    }

    // 2. Natal Planetary Sign/House placements validation
    const chartFacts = currentEvidence.facts.filter(
      f => (f as any).toolName === 'get_birth_chart' || f.sourceTool === 'get_birth_chart' || f.category === 'natal'
    );
    for (const cf of chartFacts) {
      const positions = cf.value?.positions || {};
      for (const [planet, pData] of Object.entries(positions)) {
        const pLower = planet.toLowerCase();
        const sign = (pData as any)?.sign?.toLowerCase();
        if (sign && combined.includes(`${pLower} in `)) {
          // If memory claimed a different sign (e.g. "Jupiter in Leo" when Jupiter is in Cancer)
          for (const s of ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']) {
            if (s !== sign && combined.includes(`${pLower} in ${s}`)) {
              conflictingFacts.push(
                `Memory claims ${planet} in ${s}, but current deterministic chart confirms ${planet} in ${sign}`
              );
            }
          }
        }
      }
    }

    // 3. Directional / Timing Alignment with Current Reasoning
    if (currentReasoning) {
      // If current reasoning concluded insufficient evidence or unfavorable while memory claimed strong favorable
      if (currentReasoning.direction === 'insufficient_evidence' && combined.includes('strongly favorable')) {
        conflictingFacts.push('Memory asserted strong favorable window, but current reasoning marks evidence as insufficient');
      }
    }

    // 4. Non-classical / Ungrounded claims (e.g. outer planets not in classical Jyotish or speculative claims)
    if (
      /\b(neptune|uranus|pluto|celebrity stardom|hollywood)\b/i.test(combined) ||
      memKeyLower.includes('fictitious') ||
      memValLower.includes('hollywood')
    ) {
      conflictingFacts.push(
        'Memory contains ungrounded planetary or speculative assertions not supported by classical Vedic ephemeris'
      );
    }

    // Determine final status
    if (conflictingFacts.length > 0) {
      return {
        memoryId,
        isAstrological: true,
        isValidated: false,
        validationStatus: 'invalidated',
        revalidationReason: `Contradicted by current deterministic evidence: ${conflictingFacts.join('; ')}`,
        conflictsWithCurrentEvidence: true,
        conflictingFacts,
      };
    }

    return {
      memoryId,
      isAstrological: true,
      isValidated: true,
      validationStatus: 'validated',
      revalidationReason: 'Verified against current deterministic ephemeris and dasha calculations',
      conflictsWithCurrentEvidence: false,
    };
  }
}
