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

      claims.push({
        claimId: `claim_fact_${factIdx++}_${factor.evidenceId}`,
        text: `The verified chart placement of ${factor.entity} (${factor.property}: ${factor.value}) ${roleDescriptor}.`,
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
   * Constructs controlled synthesis phrasing strictly avoiding forbidden certainty words.
   */
  private buildSynthesisText(reasoning: ReasoningPacket, plan: QuestionPlan): string {
    const domainStr = plan.domain.toLowerCase();

    if (reasoning.direction === 'supportive') {
      if (reasoning.strength === 'strong') {
        return `The converging chart layers and applied classical rules provide strong astrological support for constructive developments in ${domainStr}; this is an indication, not a guaranteed outcome.`;
      }
      return `The astrological factors provide supportive indications for constructive developments in ${domainStr} during the active period.`;
    }

    if (reasoning.direction === 'mixed') {
      const restCount = reasoning.restrictingFactors.length;
      return `The astrological indications support constructive movement in ${domainStr}, but operate alongside ${restCount} structural factor(s) requiring patience and discipline.`;
    }

    if (reasoning.direction === 'challenging') {
      return `The active astrological factors present structural demands in ${domainStr}, emphasizing steady perseverance rather than hasty expansion.`;
    }

    return `The available astrological evidence is neutral for the queried ${domainStr} timeframe; no strong directional conclusion is established.`;
  }
}
