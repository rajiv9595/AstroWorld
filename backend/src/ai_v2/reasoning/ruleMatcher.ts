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

  private hasExactVargaCode(text: string, varga: string): boolean {
    const normalizedVarga = varga.trim().toUpperCase();
    return new RegExp(
      `(^|[^A-Z0-9])${normalizedVarga}([^A-Z0-9]|$)`,
      'i',
    ).test(text);
  }

  private normalizeYogaKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^yoga/, '')
      .replace(/yoga$/, '');
  }

  private normalizeTransitIdentity(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s*\(transit\)\s*$/i, '');
  }

  private extractDashaTokens(value: string): string[] {
    return value
      .split(/\s*[-/,:]\s*/)
      .map(token => token.trim().toLowerCase())
      .filter(Boolean);
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
          f => f.verified && f.entity.trim().toLowerCase() === planet.trim().toLowerCase()
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
        const matchingVargaFacts = evidence.facts.filter(
          f => f.category === 'varga' && f.verified && this.hasExactVargaCode(f.entity, varga),
        );

        const hasVargaEvidence =
          varga === 'D1'
            ? evidence.facts.some(f => f.category === 'natal' && f.verified)
            : matchingVargaFacts.length > 0 ||
              evidence.toolResults.some(
                r => r.toolName === 'get_divisional_chart' &&
                  r.success &&
                  r.provenance?.verified &&
                  typeof r.data?.vargaCode === 'string' &&
                  r.data.vargaCode.toUpperCase() === varga.toUpperCase(),
              );

        if (hasVargaEvidence) {
          satisfiedPrerequisites.push(`Verified ${varga} divisional chart computed`);
          matchedEvidenceIds.push(...matchingVargaFacts.map(f => f.id));
        } else {
          missingPrerequisites.push(`Required divisional chart ${varga} was not computed in EvidencePacket`);
        }
      }
    }

    // 3. House scope check. The corpus historically stores houses as an
    // allowed/covered set (e.g. 1,4,7,10), not an all-of conjunction.
    // Require at least one verified fact inside the declared scope; exact
    // single-house rules therefore remain strict.
    if (meta.houseSubjects && meta.houseSubjects.length > 0) {
      const matchingHouseFacts = evidence.facts.filter(
        f => f.verified && typeof f.house === 'number' && meta.houseSubjects.includes(f.house),
      );
      if (matchingHouseFacts.length > 0) {
        satisfiedPrerequisites.push(
          `Verified evidence exists within declared house scope [${meta.houseSubjects.join(', ')}]`,
        );
        matchedEvidenceIds.push(...matchingHouseFacts.map(f => f.id));
      } else {
        missingPrerequisites.push(
          `No verified evidence found in declared house scope [${meta.houseSubjects.join(', ')}]`,
        );
      }
    }

    // 4. Yoga Precondition Check
    if (meta.yogaSubjects && meta.yogaSubjects.length > 0) {
      for (const yogaName of meta.yogaSubjects) {
        const expectedYogaKey = this.normalizeYogaKey(yogaName);
        const matchingYoga = evidence.derivedFacts.find(
          f => f.type === 'Yoga' &&
            f.verified &&
            this.normalizeYogaKey(f.id) === expectedYogaKey,
        );
        if (matchingYoga) {
          satisfiedPrerequisites.push(`Verified classical formation of ${yogaName} in chart`);
          matchedEvidenceIds.push(matchingYoga.id);
        } else {
          missingPrerequisites.push(`Classical yoga "${yogaName}" is not mathematically formed in native chart`);
        }
      }
    }

    // 5. Transit precondition check. A metadata list represents supported
    // transit scopes/labels; standardized planetary identities are matched
    // exactly, while descriptive scope labels require an actual transit tool.
    if (meta.transitSubjects && meta.transitSubjects.length > 0) {
      const transitFacts = evidence.facts.filter(
        f => f.category === 'transit' && f.verified,
      );
      const transitTool = evidence.toolResults.find(
        r => r.toolName === 'get_transits' &&
          r.success &&
          r.provenance?.verified &&
          Array.isArray(r.data?.transits),
      );

      const standardizedSubjects = meta.transitSubjects
        .map(s => s.trim().toLowerCase())
        .filter(s => ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'].includes(s));

      const exactTransitMatches = transitFacts.filter(f => {
        const identity = this.normalizeTransitIdentity(f.entity);
        return standardizedSubjects.includes(identity);
      });
      const toolMatchesStandardized = Boolean(transitTool?.data?.transits?.some(
        (t: any) => standardizedSubjects.includes(
          this.normalizeTransitIdentity(String(t?.planet || '')),
        ),
      ));

      // Descriptive labels such as "Sade Sati" or "Career Activation" are
      // contextual scopes and are satisfied by the verified transit tool itself.
      const hasDescriptiveScope = meta.transitSubjects.some(
        s => !['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'].includes(s.trim().toLowerCase()),
      );

      if (exactTransitMatches.length > 0 || toolMatchesStandardized || (hasDescriptiveScope && transitTool)) {
        satisfiedPrerequisites.push('Verified Gochara transit evidence available for the declared scope');
        matchedEvidenceIds.push(...exactTransitMatches.map(f => f.id));
      } else {
        missingPrerequisites.push(
          `Declared transit scope [${meta.transitSubjects.join(', ')}] was not found in verified evidence`,
        );
      }
    }

    // 6. Dasha Precondition Check — match declared active-lord identities exactly.
    if (meta.dashaSubjects && meta.dashaSubjects.length > 0) {
      for (const subject of meta.dashaSubjects) {
        const expected = subject.trim().toLowerCase();
        const dashaFacts = evidence.facts.filter(
          f => f.category === 'dasha' && f.verified,
        );
        const matchingDashaFacts = dashaFacts.filter(
          f => this.extractDashaTokens(String(f.value ?? '')).includes(expected),
        );
        const dashaTool = evidence.toolResults.find(
          r =>
            (r.toolName === 'get_current_dasha' || r.toolName === 'get_dasha_at') &&
            r.success &&
            r.provenance?.verified,
        );
        const hierarchy = dashaTool?.data?.currentHierarchy || dashaTool?.data?.activeHierarchy;
        const activeLordTokens = hierarchy
          ? [
              hierarchy.mahadasha?.lord,
              hierarchy.antardasha?.subLord || hierarchy.antardasha?.lord,
              hierarchy.pratyantardasha?.pratyantarLord || hierarchy.pratyantardasha?.lord,
            ]
              .filter(Boolean)
              .map((v: string) => v.toLowerCase())
          : [];

        // "Mahadasha"/"Antardasha"/"Vimshottari" are structural requirements.
        const structuralSubject = ['mahadasha', 'antardasha', 'vimshottari'].includes(expected);
        const matches = matchingDashaFacts.length > 0 || activeLordTokens.includes(expected) ||
          (structuralSubject && dashaTool);
        if (matches) {
          satisfiedPrerequisites.push(`Verified Dasha evidence for ${subject}`);
          matchedEvidenceIds.push(...dashaFacts.map(f => f.id));
        } else {
          missingPrerequisites.push(`Required Dasha condition "${subject}" was not found in verified evidence`);
        }
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
