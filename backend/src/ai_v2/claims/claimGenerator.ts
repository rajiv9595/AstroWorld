/**
 * ASTROWORLD AI V2 — Claim Set Generator
 * Converts a verified ReasoningPacket and QuestionPlan into candidate ClaimItem objects.
 * Strictly forbids creating new astrological conclusions outside the ReasoningPacket.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';
import {
  ReasoningPacket,
  ClassifiedFactor,
  AppliedRuleRecord,
  TemporalWindowResult,
} from '../schemas/reasoningPacket.ts';
import { ClaimItem, ClaimType, ClaimStrength, ClaimRelevance } from '../schemas/claimPacket.ts';

export class ClaimSetGenerator {
  /**
   * Generates candidate claims strictly from the verified ReasoningPacket.
   */
  public generateClaims(
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    evidence: EvidencePacket
  ): ClaimItem[] {
    const claims: ClaimItem[] = [];

    // 1. Handle Insufficient Evidence State
    if (reasoning.direction === 'insufficient_evidence' || reasoning.coverageStatus === 'insufficient_evidence') {
      claims.push({
        claimId: `claim_insufficient_${Date.now()}`,
        text: `The available astrological evidence is insufficient or too ambiguous to formulate a definitive evaluation. Clarification is required regarding ${reasoning.unresolvedQuestions.join('; ')}.`,
        type: 'interpretive',
        strength: 'insufficient',
        evidenceIds: [],
        ruleIds: [],
        sourceIds: [],
        relevance: 'high',
        allowed: true,
      });
      return claims;
    }

    // 2. Generate Factual Claims from Verified Factors
    let factIdx = 1;
    for (const factor of [...reasoning.primaryFactors, ...reasoning.supportingFactors, ...reasoning.restrictingFactors]) {
      if (factor.role === 'irrelevant') continue;

      const entities = [factor.entity];
      const houseRef = typeof factor.value === 'string' && factor.value.match(/House\s+(\d+)/i)
        ? [parseInt(factor.value.match(/House\s+(\d+)/i)![1], 10)]
        : undefined;

      const roleDescriptor =
        factor.role === 'restricting'
          ? 'represents a structural factor requiring conscious discipline'
          : factor.role === 'primary'
          ? 'acts as a primary astrological driver'
          : 'provides supporting astrological background';

      const factorType: any =
        factor.sourceTool === 'get_transits' || factor.entity.toLowerCase().includes('transit')
          ? 'transit'
          : factor.sourceTool === 'get_current_dasha' || factor.sourceTool === 'get_dasha_at' || factor.entity.toLowerCase().includes('dasha')
          ? 'dasha'
          : factor.sourceTool === 'get_divisional_chart' || factor.entity.includes('in D')
          ? 'varga'
          : 'natal';

      // Present the Ashtakavarga numbers in user-facing terms. Generic property names
      // such as "bindu_score" and "total_bindus" are internal schema metadata, not prose.
      const naturalFactText =
        factor.sourceTool === 'get_ashtakavarga' && factor.property === 'bindu_score'
          ? `${factor.entity} is ${factor.value} bindus.`
          : factor.sourceTool === 'get_ashtakavarga' && factor.property === 'total_bindus'
          ? `The total Sarvashtakavarga score is ${factor.value} bindus across all twelve signs.`
          : `The verified chart placement of ${factor.entity} (${factor.property}: ${factor.value}) ${roleDescriptor}.`;

      claims.push({
        claimId: `claim_fact_${factIdx++}_${factor.evidenceId}`,
        text: naturalFactText,
        type: 'factual',
        factorType,
        strength: factor.role === 'primary' ? 'strong' : factor.role === 'restricting' ? 'mixed' : 'moderate',
        evidenceIds: [factor.evidenceId],
        ruleIds: [],
        sourceIds: [],
        relevance: factor.relevance,
        allowed: true,
        astrologicalEntities: entities,
        houseReferences: houseRef,
      });
    }

    // 3. Generate Interpretive Claims from Applied Classical Rules
    let ruleIdx = 1;
    for (const rule of reasoning.appliedRules) {
      if (rule.applicabilityStatus === 'applied') {
        claims.push({
          claimId: `claim_rule_${ruleIdx++}_${rule.ruleId}`,
          text: `According to ${rule.citation}, ${rule.interpretationSummary}`,
          type: 'interpretive',
          factorType: 'classical_rule',
          strength: 'moderate',
          evidenceIds: rule.evidenceIds,
          ruleIds: [rule.ruleId],
          sourceIds: [rule.sourceId],
          relevance: 'high',
          allowed: true,
        });
      }
    }

    // 4. Generate Timing Claims from Verified Temporal Windows
    let timeIdx = 1;
    for (const win of reasoning.temporalWindows) {
      const timingCategory: any =
        win.label.toLowerCase().includes('dasha')
          ? 'dasha_cycle'
          : win.label.toLowerCase().includes('transit') || win.label.toLowerCase().includes('gochara')
          ? 'transit_period'
          : win.type === 'peak_confluence_window'
          ? 'confluence_window'
          : 'event_window';

      claims.push({
        claimId: `claim_time_${timeIdx++}_${win.id}`,
        text: `The verified timing window (${win.label}) spans from ${win.startDateIso} to ${win.endDateIso}, marked as a ${win.type.replace(/_/g, ' ')}.`,
        type: 'timing',
        factorType: 'confluence',
        timingCategory,
        strength: win.strength === 'strong' ? 'strong' : 'moderate',
        evidenceIds: win.evidenceIds,
        ruleIds: [],
        sourceIds: [],
        temporalScope: {
          startIso: win.startDateIso,
          endIso: win.endDateIso,
          label: win.label,
          windowCategory: timingCategory,
        },
        relevance: 'high',
        allowed: true,
      });
    }

    // 5. Generate Synthesis / Qualified Prediction Claim
    const synthesisText = this.buildSynthesisText(reasoning, plan);
    const synthesisStrength: ClaimStrength =
      reasoning.direction === 'supportive' && reasoning.strength === 'strong'
        ? 'strong'
        : reasoning.direction === 'supportive'
        ? 'moderate'
        : reasoning.direction === 'mixed'
        ? 'mixed'
        : reasoning.direction === 'challenging'
        ? 'moderate'
        : 'weak';

    claims.push({
      claimId: `claim_synthesis_${reasoning.questionId}`,
      text: synthesisText,
      type: 'qualified_prediction',
      strength: synthesisStrength,
      evidenceIds: reasoning.evidenceLineage,
      ruleIds: reasoning.ruleLineage,
      sourceIds: reasoning.sourceLineage,
      relevance: 'high',
      allowed: true,
    });

    // 6. Generate Source Explanation Claim
    if (reasoning.sourceLineage.length > 0) {
      claims.push({
        claimId: `claim_source_expl_${Date.now()}`,
        text: `Interpretive principles derived from classical Jyotish authorities: ${reasoning.sourceLineage.join('; ')}.`,
        type: 'source_explanation',
        strength: 'moderate',
        evidenceIds: [],
        ruleIds: reasoning.ruleLineage,
        sourceIds: reasoning.sourceLineage,
        relevance: 'medium',
        allowed: true,
      });
    }

    return claims;
  }

  /**
   * Constructs dynamic, question-tailored synthesis phrasing derived directly
   * from verified astronomical drivers and temporal windows, avoiding fixed boilerplate.
   */
  private buildSynthesisText(reasoning: ReasoningPacket, plan: QuestionPlan): string {
    let domainStr = plan.domain.toLowerCase();
    if (domainStr === 'astrological' || domainStr === 'general') {
      domainStr = plan.secondaryDomains?.[0]?.toLowerCase() || 'your inquiry';
    }

    const rawLower = plan.rawQuestion.toLowerCase();
    const primaryFactor = reasoning.primaryFactors[0];
    const restrictingFactor = reasoning.restrictingFactors[0];
    const topWindow = reasoning.temporalWindows[0];

    // Simple fact inquiries: directly describe the verified chart placement
    if (
      plan.intent === 'general_chart_question' ||
      plan.intent === 'planet_question' ||
      rawLower.startsWith('what is my') ||
      rawLower.startsWith("what's my")
    ) {
      if (primaryFactor) {
        return `Your verified chart placement indicates ${primaryFactor.entity} with ${primaryFactor.property} at ${primaryFactor.value}.`;
      }
    }

    const asksStrengthsAndLimits =
      plan.intent === 'career_strengths_limitations' ||
      (rawLower.includes('strength') && (rawLower.includes('limit') || rawLower.includes('challeng') || rawLower.includes('weakness')));

    if (asksStrengthsAndLimits) {
      const driverDesc = primaryFactor ? primaryFactor.entity : 'prominent planetary placements';
      if (reasoning.restrictingFactors.length > 0) {
        const restDesc = restrictingFactor ? restrictingFactor.entity : 'structural factors';
        return `The chart displays foundational career strengths led by ${driverDesc}, operating alongside structural discipline required by ${restDesc}.`;
      }
      return `The chart demonstrates clear foundational career strengths across ${driverDesc}, with supportive placements guiding professional progress.`;
    }

    const primaryEntity = primaryFactor ? primaryFactor.entity : 'key planetary placements';
    const primaryDesc = primaryFactor ? `${primaryFactor.entity} (${primaryFactor.property}: ${primaryFactor.value})` : 'chart confluence';
    const timingDesc = topWindow
      ? `during ${topWindow.label} (${topWindow.startDateIso.slice(0, 10)} to ${topWindow.endDateIso.slice(0, 10)})`
      : 'over the active cycle';

    if (reasoning.direction === 'supportive') {
      if (reasoning.strength === 'strong') {
        return `Chart indications for ${domainStr} are strongly reinforced by ${primaryDesc}, with constructive momentum concentrated ${timingDesc}.`;
      }
      return `Astrological factors for ${domainStr} show constructive support led by ${primaryEntity} ${timingDesc}.`;
    }

    if (reasoning.direction === 'mixed') {
      const restDesc = restrictingFactor ? `${restrictingFactor.entity}` : 'structural discipline';
      return `Indications for ${domainStr} combine active potential through ${primaryEntity} alongside structural patience demanded by ${restDesc} ${timingDesc}.`;
    }

    if (reasoning.direction === 'challenging') {
      const restDesc = restrictingFactor ? `${restrictingFactor.entity}` : 'planetary friction';
      return `The active cycle in ${domainStr} centers on consolidation and steady discipline under ${restDesc}, prioritizing stability ${timingDesc}.`;
    }

    return `Chart factors for ${domainStr} reflect a balanced, steady progression anchored by ${primaryEntity} ${timingDesc}.`;
  }
}
