/**
 * ASTROWORLD AI V2 — Astrology Reasoning Engine
 * Synthesizes QuestionPlan, verified EvidencePacket, and Classical RAG results into a structured ReasoningPacket.
 * Enforces strict boundaries:
 * - Engine facts are immutable.
 * - Rules apply only when preconditions are verified.
 * - Supporting, restricting, and conflicting factors remain distinct.
 * - Temporal windows use verified dates only.
 * - Missing evidence produces 'insufficient_evidence' rather than speculative guesses.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { EvidencePacket, FactItem, DerivedFactItem } from '../schemas/evidencePacket.ts';
import { RAGRetrievalResponse } from '../schemas/knowledgeRecord.ts';
import {
  ReasoningPacket,
  ClassifiedFactor,
  InterpretationDirection,
  InterpretationStrength,
  FactorRole,
  FactorRelevance,
  validateReasoningPacket,
} from '../schemas/reasoningPacket.ts';
import { RulePrerequisiteMatcher } from './ruleMatcher.ts';
import { ConfluenceEngine } from './confluenceEngine.ts';

export class AstrologyReasoner {
  private ruleMatcher: RulePrerequisiteMatcher;
  private confluenceEngine: ConfluenceEngine;

  constructor() {
    this.ruleMatcher = new RulePrerequisiteMatcher();
    this.confluenceEngine = new ConfluenceEngine();
  }

  /**
   * Synthesizes inputs into an immutable, verifiable ReasoningPacket.
   */
  public reason(
    plan: QuestionPlan,
    evidence: EvidencePacket,
    ragResponse: RAGRetrievalResponse
  ): ReasoningPacket {
    const startTime = Date.now();

    // 1. Handle Ambiguous or Insufficient Evidence Pre-condition
    if (
      plan.clarificationRequired ||
      !evidence.verified ||
      (evidence.facts.length === 0 && evidence.derivedFacts.length === 0)
    ) {
      return this.buildInsufficientEvidencePacket(plan, evidence, startTime);
    }

    // 2. Classify Evidence Factors according to QuestionPlan domain and intent
    const { primaryFactors, supportingFactors, restrictingFactors, conflictingFactors, irrelevantFactors } =
      this.classifyFactors(plan, evidence);

    // 3. Match Classical Rules with Prerequisites
    const { appliedRules, appliedCount, rejectedCount } = this.ruleMatcher.evaluateRules(
      ragResponse.results,
      evidence
    );

    // 4. Evaluate Astrological Confluence
    const confluence = this.confluenceEngine.evaluateConfluence(
      plan,
      evidence,
      primaryFactors,
      restrictingFactors
    );

    // 5. Build Verified Temporal Windows
    const temporalWindows = this.confluenceEngine.buildTemporalWindows(plan, evidence);

    // 6. Determine Synthesis Direction and Strength
    const { direction, strength, coverageStatus, confidence } = this.determineDirectionAndStrength(
      plan,
      primaryFactors,
      supportingFactors,
      restrictingFactors,
      conflictingFactors,
      appliedCount,
      confluence
    );

    // 7. Compile Verified Lineage
    const evidenceLineage = Array.from(
      new Set([
        ...primaryFactors.map(f => f.evidenceId),
        ...supportingFactors.map(f => f.evidenceId),
        ...restrictingFactors.map(f => f.evidenceId),
        ...appliedRules.flatMap(r => r.evidenceIds),
      ])
    );

    const ruleLineage = appliedRules.filter(r => r.applicabilityStatus === 'applied').map(r => r.ruleId);
    const sourceLineage = Array.from(new Set(appliedRules
      .filter(r => r.applicabilityStatus === 'applied')
      .map(r => r.citation)));

    const executionDurationMs = Date.now() - startTime;

    // 8. Assemble Machine-Readable Reasoning Audit Trace
    const auditTrace = {
      questionId: plan.questionId,
      intent: plan.intent,
      domain: plan.domain,
      requiredFactsCount: plan.chartLayers.length + (plan.planetFocus.length || 1),
      verifiedFactsCount: evidence.facts.length,
      applicableRulesCount: appliedCount,
      rejectedRulesCount: rejectedCount,
      supportingFactorsCount: primaryFactors.length + supportingFactors.length,
      restrictingFactorsCount: restrictingFactors.length,
      conflictingFactorsCount: conflictingFactors.length,
      hasTemporalConfluence: temporalWindows.length > 0,
      stepSequence: [
        '1. Validate QuestionPlan & EvidencePacket',
        '2. Filter and rank domain-specific factors',
        '3. Evaluate classical rule preconditions',
        '4. Calculate multi-layer chart confluence',
        '5. Construct verified temporal windows',
        '6. Synthesize direction and strength',
      ],
      executionDurationMs,
    };

    const reasoningPacket: ReasoningPacket = {
      questionId: plan.questionId,
      direction,
      strength,
      primaryFactors,
      supportingFactors,
      restrictingFactors,
      conflictingFactors,
      irrelevantFactors,
      appliedRules,
      confluence,
      temporalWindows,
      unresolvedQuestions: plan.ambiguities || [],
      evidenceLineage,
      ruleLineage,
      sourceLineage,
      coverageStatus,
      confidence,
      auditTrace,
      version: 'ai-v2-reasoning-1',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };

    const validation = validateReasoningPacket(reasoningPacket, evidence);
    if (!validation.valid) {
      throw new Error(`AstrologyReasoner generated invalid ReasoningPacket: ${validation.errors.join('; ')}`);
    }

    return reasoningPacket;
  }

  /**
   * Classifies verified evidence factors into domain-aligned categories.
   */
  private classifyFactors(
    plan: QuestionPlan,
    evidence: EvidencePacket
  ): {
    primaryFactors: ClassifiedFactor[];
    supportingFactors: ClassifiedFactor[];
    restrictingFactors: ClassifiedFactor[];
    conflictingFactors: ClassifiedFactor[];
    irrelevantFactors: ClassifiedFactor[];
  } {
    const primaryFactors: ClassifiedFactor[] = [];
    const supportingFactors: ClassifiedFactor[] = [];
    const restrictingFactors: ClassifiedFactor[] = [];
    const conflictingFactors: ClassifiedFactor[] = [];
    const irrelevantFactors: ClassifiedFactor[] = [];

    const domain = plan.domain.toLowerCase();

    for (const fact of evidence.facts) {
      const isPlanetFocus = plan.planetFocus.some(p => p.toLowerCase() === fact.entity.toLowerCase());
      const isHouseFocus = plan.houseFocus.includes(fact.house || 0);

      // A. Career Domain Classification
      if (domain === 'career') {
        if (
          fact.house === 10 ||
          fact.house === 6 ||
          fact.category === 'varga' ||
          isPlanetFocus ||
          fact.entity === 'Sun' ||
          fact.entity === 'Saturn'
        ) {
          if (fact.dignity === 'DEBILITATED') {
            restrictingFactors.push(this.createFactor(fact, 'restricting', 'high', 'Debilitation indicates discipline/challenge'));
          } else {
            primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct career house or authority karaka'));
          }
        } else if (fact.category === 'dasha' || fact.category === 'transit') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Active timing activation'));
        } else if (fact.house === 7 || fact.entity === 'Venus') {
          irrelevantFactors.push(this.createFactor(fact, 'irrelevant', 'irrelevant', 'Marriage/relational factor not primary for career inquiry'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'General chart background factor'));
        }
      }

      // B. Relationship / Marriage Domain Classification
      else if (domain === 'relationship') {
        if (
          fact.house === 7 ||
          fact.house === 2 ||
          fact.category === 'jaimini' ||
          fact.entity === 'Venus' ||
          fact.entity === 'Jupiter' ||
          isPlanetFocus
        ) {
          if (fact.dignity === 'DEBILITATED') {
            restrictingFactors.push(this.createFactor(fact, 'restricting', 'high', 'Relational factor in debilitation requires mindfulness'));
          } else {
            primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct 7th house / matrimonial significator'));
          }
        } else if (fact.category === 'dasha' || fact.category === 'varga') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Navamsha or dasha alignment'));
        } else if (fact.house === 10 || fact.house === 6) {
          irrelevantFactors.push(this.createFactor(fact, 'irrelevant', 'irrelevant', 'Professional factor not relevant to relationship query'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'General chart background'));
        }
      }

      // C. Finance / Wealth Domain Classification
      else if (domain === 'finance') {
        if (fact.house === 2 || fact.house === 11 || fact.category === 'ashtakavarga' || isPlanetFocus) {
          primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct wealth / gains bhava or SAV matrix'));
        } else if (fact.category === 'dasha' || fact.category === 'natal') {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Supporting chart disposition'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'background', 'low', 'Background factor'));
        }
      }

      // D. General / Timing Classification
      else {
        const isLagnaFocus =
          (plan.rawQuestion.toLowerCase().includes('lagna') || plan.rawQuestion.toLowerCase().includes('ascendant')) &&
          (fact.entity.toLowerCase().includes('lagna') || fact.entity.toLowerCase().includes('ascendant'));

        if (isPlanetFocus || isLagnaFocus || fact.category === 'dasha' || fact.category === 'transit') {
          primaryFactors.push(this.createFactor(fact, 'primary', 'high', 'Direct focus of user inquiry'));
        } else {
          supportingFactors.push(this.createFactor(fact, 'supporting', 'medium', 'Supporting placement'));
        }
      }
    }

    // Revisit only secondary domains so existing single-domain behavior stays stable.
    // A fact already classified as primary/restricting remains so; a stronger secondary
    // domain classification may upgrade a background/irrelevant fact. Each evidence ID
    // stays in exactly one factor bucket to avoid double-counting it in confluence.
    const factorBuckets: Array<{ key: 'primaryFactors' | 'supportingFactors' | 'restrictingFactors' | 'conflictingFactors' | 'irrelevantFactors'; factors: ClassifiedFactor[] }> = [
      { key: 'primaryFactors', factors: primaryFactors },
      { key: 'supportingFactors', factors: supportingFactors },
      { key: 'restrictingFactors', factors: restrictingFactors },
      { key: 'conflictingFactors', factors: conflictingFactors },
      { key: 'irrelevantFactors', factors: irrelevantFactors },
    ];
    const roleRank: Record<ClassifiedFactor['role'], number> = {
      primary: 4,
      restricting: 4,
      conflicting: 4,
      supporting: 3,
      background: 2,
      irrelevant: 0,
    };

    for (const fact of evidence.facts) {
      for (const secondaryDomain of Array.from(new Set(plan.secondaryDomains || [])).map(d => String(d).toLowerCase())) {
        const candidate = this.classifyForSecondaryDomain(fact, secondaryDomain, plan);
        if (!candidate) continue;

        let existing: ClassifiedFactor | undefined;
        let existingBucket: ClassifiedFactor[] | undefined;
        for (const bucket of factorBuckets) {
          const matched = bucket.factors.find(f => f.evidenceId === fact.id);
          if (matched) {
            existing = matched;
            existingBucket = bucket.factors;
            break;
          }
        }

        if (existing && roleRank[candidate.factor.role] <= roleRank[existing.role]) continue;
        if (existing && existingBucket) {
          const existingIndex = existingBucket.findIndex(f => f.evidenceId === fact.id);
          if (existingIndex >= 0) existingBucket.splice(existingIndex, 1);
        }
        factorBuckets.find(bucket => bucket.key === candidate.bucket)?.factors.push(candidate.factor);
      }
    }

    // Process Derived Facts (Yogas)
    for (const derived of evidence.derivedFacts) {
      if (derived.type === 'Yoga') {
        const isNegativeYoga = derived.id.toLowerCase().endsWith('_absence');
        primaryFactors.push({
          id: derived.id,
          entity: derived.description,
          property: isNegativeYoga ? 'presence' : 'classical_yoga',
          value: derived.ruleCitation || 'Brihat Parashara Hora Shastra',
          role: 'primary',
          relevance: 'high',
          rationale: isNegativeYoga
            ? 'Verified deterministic yoga engine explicitly reported this classical formation as absent'
            : 'Classical combination verified in the deterministic rule engine',
          sourceTool: derived.sourceTool,
          evidenceId: derived.id,
          weight: 1.0,
        });
      }
    }

    return {
      primaryFactors,
      supportingFactors,
      restrictingFactors,
      conflictingFactors,
      irrelevantFactors,
    };
  }

  private classifyForSecondaryDomain(
    fact: FactItem,
    domain: string,
    plan: QuestionPlan,
  ): { bucket: 'primaryFactors' | 'supportingFactors' | 'restrictingFactors' | 'conflictingFactors' | 'irrelevantFactors'; factor: ClassifiedFactor } | undefined {
    const isPlanetFocus = plan.planetFocus.some(p => p.toLowerCase() === fact.entity.toLowerCase());
    const primary = (rationale: string) => ({
      bucket: 'primaryFactors' as const,
      factor: this.createFactor(fact, 'primary', 'high', `Secondary ${domain} domain: ${rationale}`),
    });
    const restricting = (rationale: string) => ({
      bucket: 'restrictingFactors' as const,
      factor: this.createFactor(fact, 'restricting', 'high', `Secondary ${domain} domain: ${rationale}`),
    });
    const supporting = (rationale: string) => ({
      bucket: 'supportingFactors' as const,
      factor: this.createFactor(fact, 'supporting', 'medium', `Secondary ${domain} domain: ${rationale}`),
    });
    const background = (rationale: string) => ({
      bucket: 'supportingFactors' as const,
      factor: this.createFactor(fact, 'background', 'low', `Secondary ${domain} domain: ${rationale}`),
    });
    const irrelevant = (rationale: string) => ({
      bucket: 'irrelevantFactors' as const,
      factor: this.createFactor(fact, 'irrelevant', 'irrelevant', `Secondary ${domain} domain: ${rationale}`),
    });
    const ifDebilitated = (why: string) =>
      fact.dignity === 'DEBILITATED' ? restricting(why) : primary(why);

    if (domain === 'career') {
      if (fact.house === 10 || fact.house === 6 || fact.category === 'varga' || isPlanetFocus ||
          fact.entity === 'Sun' || fact.entity === 'Saturn') {
        return ifDebilitated('direct professional house, D10, or career significator');
      }
      if (fact.category === 'dasha' || fact.category === 'transit') return supporting('verified timing activation');
      if (fact.house === 7 || fact.entity === 'Venus') return irrelevant('relational-only signal for this domain');
      return background('general professional background');
    }

    if (domain === 'relationship') {
      if (fact.house === 7 || fact.house === 2 || fact.category === 'jaimini' ||
          fact.entity === 'Venus' || fact.entity === 'Jupiter' || isPlanetFocus) {
        return ifDebilitated('direct relationship house or classical significator');
      }
      if (fact.category === 'dasha' || fact.category === 'varga') return supporting('verified D9 or timing context');
      if (fact.house === 10 || fact.house === 6) return irrelevant('professional-only signal for this domain');
      return background('general relationship background');
    }

    if (domain === 'finance' || domain === 'wealth' || domain === 'business') {
      if (fact.house === 2 || fact.house === 11 || fact.category === 'ashtakavarga' || isPlanetFocus) {
        return ifDebilitated('direct wealth/gains house or verified Ashtakavarga evidence');
      }
      if (fact.category === 'dasha' || fact.category === 'natal') return supporting('verified financial chart disposition');
      return background('general financial background');
    }

    if (domain === 'travel') {
      if (fact.category === 'varga' && /\bD4\b/i.test(fact.entity) ||
          fact.house === 4 || fact.house === 9 || fact.house === 12) {
        return ifDebilitated('relocation-related divisional or house evidence');
      }
      if (fact.category === 'dasha' || fact.category === 'transit') return supporting('verified relocation timing activation');
      return background('general relocation background');
    }

    if (domain === 'health') {
      if (fact.house === 1 || fact.house === 6 || fact.house === 8 || fact.category === 'shadbala') {
        return ifDebilitated('health-related house or verified planetary strength');
      }
      if (fact.category === 'dasha' || fact.category === 'transit') return supporting('verified timing context');
      return background('general health background');
    }

    if (domain === 'spirituality') {
      if (fact.house === 9 || fact.house === 12 || fact.category === 'jaimini' ||
          (fact.category === 'varga' && /\bD9\b/i.test(fact.entity)) ||
          fact.entity === 'Jupiter' || fact.entity === 'Ketu') {
        return ifDebilitated('spiritual house, D9, or relevant significator');
      }
      return background('general spiritual background');
    }

    if (domain === 'education') {
      if (fact.house === 4 || fact.house === 5 || fact.house === 9 ||
          (fact.category === 'varga' && /\bD24\b/i.test(fact.entity)) ||
          fact.entity === 'Jupiter' || fact.entity === 'Mercury') {
        return ifDebilitated('education-related house, D24, or learning significator');
      }
      if (fact.category === 'dasha' || fact.category === 'transit') return supporting('verified study-period timing');
      return background('general education background');
    }

    return undefined;
  }

  private createFactor(
    fact: FactItem,
    role: FactorRole,
    relevance: FactorRelevance,
    rationale: string
  ): ClassifiedFactor {
    const roleWeight: Record<FactorRole, number> = {
      primary: 1.0,
      supporting: 0.65,
      restricting: 1.0,
      conflicting: 1.0,
      background: 0.2,
      irrelevant: 0,
    };
    const relevanceWeight: Record<FactorRelevance, number> = {
      high: 1.0,
      medium: 0.7,
      low: 0.35,
      irrelevant: 0,
    };

    return {
      id: `factor_${fact.id}`,
      entity: fact.entity,
      property: fact.property,
      value: fact.value,
      role,
      relevance,
      rationale,
      sourceTool: fact.sourceTool,
      evidenceId: fact.id,
      weight: Number((roleWeight[role] * relevanceWeight[relevance]).toFixed(3)),
    };
  }

  /**
   * Determines direction, strength, coverage status, and confidence.
   */
  private determineDirectionAndStrength(
    plan: QuestionPlan,
    primaryFactors: ClassifiedFactor[],
    supportingFactors: ClassifiedFactor[],
    restrictingFactors: ClassifiedFactor[],
    conflictingFactors: ClassifiedFactor[],
    appliedRulesCount: number,
    confluence: any
  ): {
    direction: InterpretationDirection;
    strength: InterpretationStrength;
    coverageStatus: 'complete' | 'partial' | 'insufficient_evidence';
    confidence: 'high' | 'medium' | 'low';
  } {
    const supportScore = [...primaryFactors, ...supportingFactors]
      .reduce((sum, factor) => sum + (factor.weight ?? 0), 0);
    const restrictingScore = restrictingFactors
      .reduce((sum, factor) => sum + (factor.weight ?? 0), 0);
    const conflictingScore = conflictingFactors
      .reduce((sum, factor) => sum + (factor.weight ?? 0), 0);

    // A factor count is not evidence of strength. A hundred background facts
    // must not outweigh two directly relevant, independently verified factors.
    const dominant = Math.max(supportScore, restrictingScore, conflictingScore);
    const margin = supportScore - restrictingScore;
    let direction: InterpretationDirection = 'neutral';
    let strength: InterpretationStrength = 'weak';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (dominant === 0) {
      direction = 'neutral';
      strength = 'inconclusive';
      confidence = 'low';
    } else if (supportScore > 0 && restrictingScore > 0 && Math.abs(margin) < 0.75) {
      direction = 'mixed';
      strength = 'moderate';
      confidence = 'medium';
    } else if (supportScore > restrictingScore && supportScore >= 1.25) {
      direction = 'supportive';
      strength = confluence.confluenceStrength === 'strong' ? 'strong' : supportScore >= 2.5 ? 'moderate' : 'weak';
      confidence = supportScore >= 2.5 && restrictingScore < 0.75 ? 'high' : 'medium';
    } else if (restrictingScore > supportScore && restrictingScore >= 1.25) {
      direction = 'challenging';
      strength = restrictingScore >= 2.5 ? 'moderate' : 'weak';
      confidence = restrictingScore >= 2.5 && supportScore < 0.75 ? 'high' : 'medium';
    } else if (supportScore > 0 || restrictingScore > 0) {
      direction = margin > 0 ? 'supportive' : 'challenging';
      strength = 'weak';
      confidence = 'low';
    } else {
      direction = conflictingScore > 0 ? 'mixed' : 'neutral';
      strength = 'inconclusive';
      confidence = 'low';
    }

    const relevantFactorCount = [...primaryFactors, ...supportingFactors, ...restrictingFactors]
      .filter(f => (f.weight ?? 0) > 0)
      .length;
    const coverageStatus =
      appliedRulesCount >= 1 && relevantFactorCount >= 2 && confluence.convergingLayersCount >= 1
        ? 'complete'
        : 'partial';

    return {
      direction,
      strength,
      coverageStatus,
      confidence,
    };
  }

  private buildInsufficientEvidencePacket(
    plan: QuestionPlan,
    evidence: EvidencePacket,
    startTime: number
  ): ReasoningPacket {
    return {
      questionId: plan.questionId,
      direction: 'insufficient_evidence',
      strength: 'inconclusive',
      primaryFactors: [],
      supportingFactors: [],
      restrictingFactors: [],
      conflictingFactors: [],
      irrelevantFactors: [],
      appliedRules: [],
      confluence: {
        hasConfluence: false,
        confluenceStrength: 'inconclusive',
        convergingLayersCount: 0,
        layers: [],
        confluenceSummary: 'Insufficient evidence or ambiguous query halted reasoning synthesis.',
      },
      temporalWindows: [],
      unresolvedQuestions: plan.ambiguities || ['User query requires clarification.'],
      evidenceLineage: [],
      ruleLineage: [],
      sourceLineage: [],
      coverageStatus: 'insufficient_evidence',
      confidence: 'low',
      auditTrace: {
        questionId: plan.questionId,
        intent: plan.intent,
        domain: plan.domain,
        requiredFactsCount: 0,
        verifiedFactsCount: 0,
        applicableRulesCount: 0,
        rejectedRulesCount: 0,
        supportingFactorsCount: 0,
        restrictingFactorsCount: 0,
        conflictingFactorsCount: 0,
        hasTemporalConfluence: false,
        stepSequence: ['Ambiguity/insufficient evidence gate triggered.'],
        executionDurationMs: Date.now() - startTime,
      },
      version: 'ai-v2-reasoning-1',
      createdAtIso: new Date().toISOString(),
      verified: true,
    };
  }
}
