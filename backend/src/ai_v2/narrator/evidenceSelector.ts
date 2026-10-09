/**
 * ASTROWORLD AI V2 — Response Evidence Selector
 * Filters and ranks ApprovedClaimSet claims strictly relevant to the active QuestionPlan.
 * Prevents evidence dumping by enforcing a semantic claim budget and natural language normalization.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';
import { ApprovedClaimSet, ClaimItem } from '../schemas/claimPacket.ts';
import { SelectedClaimSummary } from '../schemas/narratorContext.ts';

export interface EvidenceSelectionResult {
  budget: number;
  supportingClaims: SelectedClaimSummary[];
  restrictingClaims: SelectedClaimSummary[];
  selectedClaimIds: string[];
  selectedEvidenceIds: string[];
  classicalContextSummary: string;
}

export class ResponseEvidenceSelector {
  /**
   * Selects and normalizes the most relevant claims adhering to the semantic claim budget.
   */
  public selectEvidence(
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    approvedClaimSet: ApprovedClaimSet,
    technicalMode: 'normal' | 'technical' = 'normal'
  ): EvidenceSelectionResult {
    const claims = approvedClaimSet.claims;
    const budget = this.getClaimBudget(plan, technicalMode);

    // 1. Separate claims by role
    const candidateSupporting: Array<{ claim: ClaimItem; score: number }> = [];
    const candidateRestricting: Array<{ claim: ClaimItem; score: number }> = [];

    const isTransitQuestion =
      plan.intent.toLowerCase().includes('transit') ||
      /\b(transits?|gochara)\b/i.test(plan.rawQuestion);

    const queriedPlanets = plan.planetFocus.map(p => p.toLowerCase());
    const queriedDomain = plan.domain.toLowerCase();

    const rawLower = plan.rawQuestion.toLowerCase();
    const isLagnaQuestion = rawLower.includes('lagna') || rawLower.includes('ascendant');

    for (const claim of claims) {
      // The approved synthesis claim is the direct answer. Preserve it alongside evidence.


      const textLower = claim.text.toLowerCase();
      let score = claim.type === 'qualified_prediction' ? 100 : 0;

      // 0. Direct Lagna / Ascendant Match (Highest Priority for Lagna inquiries)
      if (isLagnaQuestion) {
        if (rawLower.includes('d10') && (textLower.includes('d10 lagna') || textLower.includes('ascendant in d10'))) {
          score += 120;
        } else if (rawLower.includes('d9') && (textLower.includes('d9 lagna') || textLower.includes('ascendant in d9'))) {
          score += 120;
        } else if (!rawLower.includes('d10') && !rawLower.includes('d9') && (textLower.includes('ascendant') || textLower.includes('d1 lagna'))) {
          score += 120;
        } else if (textLower.includes('lagna') || textLower.includes('ascendant')) {
          score += 80;
        }
      }

      // 1. Direct Planet Match (Top Priority)
      for (const planet of queriedPlanets) {
        if (textLower.includes(planet)) {
          score += 50;
        }
      }

      // 2. Transit Match for Transit Questions
      if (isTransitQuestion && (textLower.includes('transit') || textLower.includes('gochara') || textLower.includes('jupiter'))) {
        score += 40;
      }

      // 3. Domain & Career / 10th House Match
      if (queriedDomain === 'career' && (textLower.includes('10th') || textLower.includes('career') || textLower.includes('d10') || textLower.includes('promotion') || textLower.includes('leadership'))) {
        score += 30;
      } else if (queriedDomain === 'relationship' && (textLower.includes('7th') || textLower.includes('marriage') || textLower.includes('d9') || textLower.includes('navamsha'))) {
        score += 30;
      } else if (queriedDomain === 'finance' && (textLower.includes('2nd') || textLower.includes('11th') || textLower.includes('wealth') || textLower.includes('dhana'))) {
        score += 30;
      }

      // 4. Dasha overlap match
      if (textLower.includes('dasha') || textLower.includes('vimshottari') || textLower.includes('antardasha')) {
        score += 25;
      }

      // 5. Relevant Yoga Match
      if (textLower.includes('raja yoga') || textLower.includes('budhaditya') || textLower.includes('gajakesari')) {
        score += 20;
      }

      // 6. Demote full D10/D1 inventory of unrelated background planets
      if (
        (textLower.includes('mars') || textLower.includes('venus') || textLower.includes('mercury') || textLower.includes('rahu') || textLower.includes('ketu')) &&
        !queriedPlanets.some(p => textLower.includes(p)) &&
        !textLower.includes('dasha') &&
        !textLower.includes('yoga')
      ) {
        score -= 25;
      }

      // 7. Demote verbatim classical sloka dumps in normal mode (handled by classicalContextSummary)
      if (textLower.includes('according to bphs') || textLower.includes('according to phaladeepika')) {
        score -= 15;
      }

      const isRestriction =
        claim.type !== 'factual' &&
        claim.type !== 'qualified_prediction' &&
        (
          claim.strength === 'mixed' ||
          textLower.includes('structural') ||
          textLower.includes('discipline') ||
          textLower.includes('patience') ||
          textLower.includes('debilitated') ||
          textLower.includes('delay')
        );

      if (isRestriction) {
        candidateRestricting.push({ claim, score });
      } else {
        candidateSupporting.push({ claim, score });
      }
    }

    // Sort by relevance score descending
    candidateSupporting.sort((a, b) => b.score - a.score);
    candidateRestricting.sort((a, b) => b.score - a.score);

    // Allocate Budget
    const maxRestrictions = Math.min(2, Math.max(1, Math.floor(budget * 0.3)));
    const maxSupporting = budget - maxRestrictions;

    const rankedSupporting = candidateSupporting.slice(0, maxSupporting);

    // For transit questions, reserve one slot for the verified transit of the queried planet.
    // A generic natal placement or D10 fact must not crowd out the exact event the user asked about.
    if (isTransitQuestion && queriedPlanets.length > 0 && maxSupporting > 0) {
      const queriedTransit = candidateSupporting.find(({ claim }) => {
        if (claim.type !== 'factual' || claim.factorType !== 'transit') return false;
        const entityMatch = (claim.astrologicalEntities || []).some(entity =>
          queriedPlanets.some(planet => entity.toLowerCase().startsWith(planet)),
        );
        const text = claim.text.toLowerCase();
        const textMatch = queriedPlanets.some(planet => text.includes(`${planet} (transit)`));
        return entityMatch || textMatch;
      });

      if (
        queriedTransit &&
        !rankedSupporting.some(candidate => candidate.claim.claimId === queriedTransit.claim.claimId)
      ) {
        if (rankedSupporting.length >= maxSupporting) {
          rankedSupporting[rankedSupporting.length - 1] = queriedTransit;
        } else {
          rankedSupporting.push(queriedTransit);
        }
      }
    }

    const selectedSupporting = rankedSupporting.map(c => this.toSelectedSummary(c.claim, false, technicalMode));
    const selectedRestricting = candidateRestricting.slice(0, maxRestrictions).map(c => this.toSelectedSummary(c.claim, true, technicalMode));

    const selectedClaims = [...selectedSupporting, ...selectedRestricting];
    const selectedClaimIds = selectedClaims.map(c => c.claimId);
    const selectedEvidenceIds = Array.from(new Set(selectedClaims.flatMap(c => c.evidenceIds)));

    const classicalContextSummary = this.buildClassicalContextSummary(plan, reasoning, technicalMode);

    return {
      budget,
      supportingClaims: selectedSupporting,
      restrictingClaims: selectedRestricting,
      selectedClaimIds,
      selectedEvidenceIds,
      classicalContextSummary,
    };
  }

  /**
   * Translates raw engine claim text into clean, natural astrological statements.
   */
  public normalizeClaimText(rawText: string, technicalMode: 'normal' | 'technical' = 'normal'): string {
    let text = rawText
      // Strip rigid engine prefixes
      .replace(/The verified chart placement of\s+/gi, '')
      .replace(/\s+acts as a primary astrological driver\./gi, '.')
      .replace(/\s+provides supporting astrological background\./gi, '.')
      .replace(/\s+represents a structural factor requiring conscious discipline\./gi, ' (requires conscious discipline).')
      .replace(/\s*\(classical_yoga:\s*Brihat Parashara Hora Shastra\)/gi, '')
      .replace(/varga_sign:\s*/gi, '')
      .replace(/active_periods:\s*/gi, 'active period: ');

    if (technicalMode !== 'technical') {
      // DEF-01: Translate raw classical rule citation headers into smooth natural Jyotish principles
      text = text
        .replace(/According to BPHS Ch\.\s*\d+[^,:]*,\s*[^:]*:\s*/gi, 'In classical Jyotish, ')
        .replace(/According to Phaladeepika Ch\.\s*\d+[^,:]*,\s*[^:]*:\s*/gi, 'In classical Gochara principles, ')
        .replace(/According to Jaimini Sutras\s*[\d.–]+,\s*[^:]*:\s*/gi, 'In classical Jaimini principles, ')
        .replace(/According to Saravali Ch\.\s*\d+[^,:]*,\s*[^:]*:\s*/gi, 'In classical Saravali principles, ')
        .replace(/According to [^,:]+,\s*/gi, 'In classical Jyotish, ');

      // DEF-04: Clean up database parenthetical formats
      text = text
        .replace(/\(position:\s*(?:in\s+)?([^)]+)\)/gi, 'in $1')
        .replace(/\(sign:\s*([^)]+)\)/gi, 'is in $1')
        .replace(/\((House\s+\d+)\)/gi, 'in $1');
    }

    // Convert raw ISO timestamps like 2026-07-22T12:15:53.902Z to natural month/year
    text = text.replace(/(\d{4})-(\d{2})-(\d{2})T[\d:.]+Z/gi, (_match, year, month) => {
      const monthIndex = parseInt(month, 10) - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const monthName = monthNames[monthIndex] || month;
      return `${monthName} ${year}`;
    });

    return text.replace(/\s+/g, ' ').replace(/\s*\.\s*\./g, '.').replace(/\s*,\s*,/g, ',').trim();
  }

  private toSelectedSummary(claim: ClaimItem, isRestriction: boolean, technicalMode: 'normal' | 'technical' = 'normal'): SelectedClaimSummary {
    const textLower = claim.text.toLowerCase();
    const factorType: any =
      claim.factorType ||
      (claim.type === 'qualified_prediction'
        ? 'interpretation'
        : textLower.includes('transit') || textLower.includes('gochara')
        ? 'transit'
        : textLower.includes('dasha') || textLower.includes('vimshottari')
        ? 'dasha'
        : claim.text.includes('in D') || textLower.includes('navamsha') || textLower.includes('dashamsha')
        ? 'varga'
        : claim.type === 'interpretive' || textLower.includes('according to')
        ? 'classical_rule'
        : 'natal');

    return {
      claimId: claim.claimId,
      naturalText: this.normalizeClaimText(claim.text, technicalMode),
      type: claim.type,
      factorType,
      strength: claim.strength,
      isRestriction,
      isTransit: factorType === 'transit' || textLower.includes('transit') || textLower.includes('gochara'),
      evidenceIds: claim.evidenceIds || [],
    };
  }

  private getClaimBudget(plan: QuestionPlan, technicalMode: string): number {
    if (technicalMode === 'technical') {
      return 15;
    }

    switch (plan.intent) {
      case 'general_chart_question':
        return 3;
      case 'planet_question':
      case 'house_question':
        return 4;
      case 'promotion_timing':
      case 'career_timing':
      case 'timing':
        return 5;
      case 'varga_analysis':
      case 'yoga_analysis':
      case 'deep_analysis':
        return 7;
      default:
        return 5;
    }
  }

  private buildClassicalContextSummary(
    _plan: QuestionPlan,
    reasoning: ReasoningPacket,
    technicalMode: 'normal' | 'technical' = 'normal',
  ): string {
    const applicableRules = (reasoning.appliedRules || [])
      .filter(rule => rule.applicabilityStatus === 'applied')
      .slice(0, 3);

    if (applicableRules.length === 0) {
      return 'No directly applicable classical rule passed verified prerequisite checks for this question. Do not present a named classical rule as established.';
    }

    // Source lineage belongs in technical mode. Normal conversation should explain the
    // relevant principle without dumping citation headers and long catalogue-like passages.
    if (technicalMode === 'technical') {
      return applicableRules
        .map(rule => `${rule.citation}: ${rule.interpretationSummary}`)
        .join('\n');
    }

    const concisePrinciples = applicableRules.map(rule => {
      let summary = String(rule.interpretationSummary || '').trim();
      summary = summary.replace(/^[^:]{1,100}:\\s*/, '');
      const end = summary.search(/[.!?](?:\\s|$)/);
      if (end >= 0) summary = summary.slice(0, end + 1);
      return summary.trim();
    }).filter(Boolean);

    return Array.from(new Set(concisePrinciples)).slice(0, 2).join(' ');
  }
}
