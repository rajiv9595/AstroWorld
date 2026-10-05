/**
 * ASTROWORLD AI V2 — Classical Rule Prerequisite Matcher
 * Determines whether retrieved classical rules are strictly satisfied by verified EvidencePacket facts.
 * Disallows applying rules whose astrological preconditions are absent in the chart.
 */

import { KnowledgeRecord, RetrievalResultItem } from '../schemas/knowledgeRecord.ts';
import { EvidencePacket, FactItem, DerivedFactItem } from '../schemas/evidencePacket.ts';
import { AppliedRuleRecord } from '../schemas/reasoningPacket.ts';

export class RulePrerequisiteMatcher {
  /**
   * Matches an array of retrieved classical rules against verified engine evidence.
   */
  public evaluateRules(
    retrievedRules: RetrievalResultItem[],
    evidence: EvidencePacket
  ): { appliedRules: AppliedRuleRecord[]; appliedCount: number; rejectedCount: number } {
    const appliedRules: AppliedRuleRecord[] = [];
    let appliedCount = 0;
    let rejectedCount = 0;

    for (const ruleItem of retrievedRules) {
      const evaluation = this.evaluateSingleRule(ruleItem, evidence);
      appliedRules.push(evaluation);
      if (evaluation.applicabilityStatus === 'applied') {
        appliedCount++;
      } else {
        rejectedCount++;
      }
    }

    return {
      appliedRules,
      appliedCount,
      rejectedCount,
    };
  }

  /**
   * Evaluates a single classical rule against verified evidence facts.
   */
  private evaluateSingleRule(
    ruleItem: RetrievalResultItem,
    evidence: EvidencePacket
  ): AppliedRuleRecord {
    const satisfiedPrerequisites: string[] = [];
    const missingPrerequisites: string[] = [];
    const matchedEvidenceIds: string[] = [];
    const meta = ruleItem.metadata;

    // 1. Planetary Precondition Check
    if (meta.planetarySubjects && meta.planetarySubjects.length > 0) {
      for (const planet of meta.planetarySubjects) {
        const matchingFact = evidence.facts.find(
          f => f.entity.toLowerCase() === planet.toLowerCase() || f.entity.toLowerCase().includes(planet.toLowerCase())
        );
        if (matchingFact) {
          satisfiedPrerequisites.push(`Verified presence and placement of ${planet} (${matchingFact.value})`);
          matchedEvidenceIds.push(matchingFact.id);
        } else {
          missingPrerequisites.push(`Missing placement data for required planet: ${planet}`);
        }
      }
    }

    // 2. Varga / Divisional Chart Precondition Check
    if (meta.vargaSubjects && meta.vargaSubjects.length > 0) {
      for (const varga of meta.vargaSubjects) {
        if (varga === 'D1') {
          satisfiedPrerequisites.push('Verified D1 Rasi chart facts present');
        } else {
          const hasVargaEvidence = evidence.facts.some(f => f.category === 'varga' && f.entity.includes(varga)) ||
            evidence.toolResults.some(r => r.toolName === 'get_divisional_chart' && r.success && r.data?.vargaCode === varga);

          const matchingVargaFacts = evidence.facts.filter(
            f => f.category === 'varga' && f.entity.toLowerCase().includes(varga.toLowerCase()),
          );
          if (hasVargaEvidence) {
            satisfiedPrerequisites.push(`Verified ${varga} divisional chart computed`);
            matchedEvidenceIds.push(...matchingVargaFacts.map(f => f.id));
          } else {
            missingPrerequisites.push(`Required divisional chart ${varga} was not computed in EvidencePacket`);
          }
        }
      }
    }

    // 3. Yoga Precondition Check
    if (meta.yogaSubjects && meta.yogaSubjects.length > 0) {
      for (const yogaName of meta.yogaSubjects) {
        const matchingYoga = evidence.derivedFacts.find(
          f => f.type === 'Yoga' && f.description.toLowerCase().includes(yogaName.toLowerCase())
        );
        if (matchingYoga) {
          satisfiedPrerequisites.push(`Verified classical formation of ${yogaName} in chart`);
          matchedEvidenceIds.push(matchingYoga.id);
        } else {
          // If the rule is specifically about a yoga that is absent from the engine detection
          missingPrerequisites.push(`Classical yoga "${yogaName}" is not mathematically formed in native chart`);
        }
      }
    }

    // 4. Transit Precondition Check
    if (meta.transitSubjects && meta.transitSubjects.length > 0) {
      const hasTransits = evidence.facts.some(f => f.category === 'transit') ||
        evidence.toolResults.some(r => r.toolName === 'get_transits' && r.success);
      if (hasTransits) {
        satisfiedPrerequisites.push('Verified Gochara planetary transits available');
        matchedEvidenceIds.push(...evidence.facts.filter(f => f.category === 'transit').map(f => f.id));
      } else {
        missingPrerequisites.push('Gochara transit positions not computed in EvidencePacket');
      }
    }

    // 5. Dasha Precondition Check
    if (meta.dashaSubjects && meta.dashaSubjects.length > 0) {
      const hasDasha = evidence.facts.some(f => f.category === 'dasha') ||
        evidence.toolResults.some(r => (r.toolName === 'get_current_dasha' || r.toolName === 'get_dasha_at') && r.success);
      if (hasDasha) {
        satisfiedPrerequisites.push('Verified Vimshottari Dasha hierarchy available');
        matchedEvidenceIds.push(...evidence.facts.filter(f => f.category === 'dasha').map(f => f.id));
      } else {
        missingPrerequisites.push('Vimshottari Dasha timeline not computed in EvidencePacket');
      }
    }

    // Determine applicability status
    const isApplied = missingPrerequisites.length === 0;
    const isPartiallySatisfied = satisfiedPrerequisites.length > 0 && missingPrerequisites.length > 0;

    // Never manufacture evidence lineage. If a rule has no concrete
    // prerequisites, it may remain an applied general principle, but it must
    // carry an empty evidenceIds array rather than falsely pointing at an
    // unrelated first fact.
    if (isApplied && matchedEvidenceIds.length === 0 && meta.houseSubjects?.length) {
      const houseMatches = evidence.facts.filter(f => meta.houseSubjects.includes(f.house || 0));
      matchedEvidenceIds.push(...houseMatches.map(f => f.id));
    }

    return {
      ruleId: ruleItem.id,
      sourceId: ruleItem.id,
      sourceText: ruleItem.source,
      citation: ruleItem.citation,
      tradition: ruleItem.tradition,
      ruleType: ruleItem.metadata.ruleType,
      applicabilityStatus: isApplied ? 'applied' : isPartiallySatisfied ? 'partially_satisfied' : 'rejected',
      rejectionReason: isApplied ? undefined : missingPrerequisites.join('; '),
      satisfiedPrerequisites,
      missingPrerequisites: isApplied ? undefined : missingPrerequisites,
      evidenceIds: Array.from(new Set(matchedEvidenceIds)),
      interpretationSummary: isApplied
        ? ruleItem.normalizedRule
        : `Rule not applied: ${missingPrerequisites.join('; ')}`,
    };
  }
}
