/**
 * ASTROWORLD AI V2 — Conversational Response Planner
 * Plans the structure, depth, tone, and budgeted claim allocation for the conversational response.
 * Enforces Transit-First strategy, Answer-First structure, and builds a clean NarratorContextPack.
 */

import { QuestionPlan } from '../schemas/questionPlan.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';
import { ApprovedClaimSet } from '../schemas/claimPacket.ts';
import {
  ResponsePlan,
  ResponseType,
  RequestedDepth,
  NarratorTone,
  ResponseSectionPlan,
} from '../schemas/responsePlan.ts';
import { NarratorContextPack } from '../schemas/narratorContext.ts';
import { ResponseEvidenceSelector } from './evidenceSelector.ts';
import { TemporalSanityValidator } from './temporalValidator.ts';

export class ResponsePlanner {
  private evidenceSelector: ResponseEvidenceSelector;
  private temporalValidator: TemporalSanityValidator;

  constructor() {
    this.evidenceSelector = new ResponseEvidenceSelector();
    this.temporalValidator = new TemporalSanityValidator();
  }

  /**
   * Plans the conversational response structure and focused context from validated inputs.
   */
  public planResponse(
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    approvedClaimSet: ApprovedClaimSet,
    technicalMode: 'normal' | 'technical' = 'normal'
  ): ResponsePlan {
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const questionId = plan.questionId;

    // 1. Determine Response Type
    const responseType = this.determineResponseType(plan, reasoning, approvedClaimSet);

    // 2. Determine Depth & Tone
    const requestedDepth: RequestedDepth =
      responseType === 'simple_fact' || responseType === 'clarification'
        ? 'concise'
        : responseType === 'deep_analysis' || responseType === 'comparison'
        ? 'deep'
        : 'standard';

    const tone: NarratorTone =
      responseType === 'clarification' || responseType === 'insufficient_evidence'
        ? 'humble_clarifying'
        : responseType === 'deep_analysis'
        ? 'conversational_mentor'
        : 'warm_direct';

    // 3. Select Budgeted Claims & Sanitize Timing Windows
    const selection = this.evidenceSelector.selectEvidence(plan, reasoning, approvedClaimSet, technicalMode);
    const sanitizedWindows = this.temporalValidator.sanitizeWindows(reasoning.temporalWindows);

    // 4. Calculate Confluence & Factor Separation
    const dashaWindow = sanitizedWindows.find(w => w.windowCategory === 'dasha_cycle');
    const transitWindow = sanitizedWindows.find(w => w.windowCategory === 'transit_period' || w.windowCategory === 'confluence_window');
    const confluenceWindow = this.temporalValidator.computeConfluenceWindow(sanitizedWindows) ||
      sanitizedWindows.find(w => w.type === 'peak_confluence_window');

    const isTransitQuestion =
      plan.intent.toLowerCase().includes('transit') ||
      /\b(transits?|gochara)\b/i.test(plan.rawQuestion);

    const hasVerifiedTransitEvidence = approvedClaimSet.claims.some(claim =>
      claim.allowed &&
      (claim.type === 'factual' && claim.factorType === 'transit' ||
        claim.type === 'timing' && claim.timingCategory === 'transit_period') &&
      (claim.evidenceIds?.length || 0) > 0
    );

    const synthesisClaim = [...selection.supportingClaims, ...selection.restrictingClaims]
      .find(claim => claim.type === 'qualified_prediction');
    const directAnswerDirection =
      synthesisClaim?.naturalText ||
      (reasoning.direction === 'supportive'
        ? 'The chart-specific factors lean supportive, with the qualifications described below.'
        : reasoning.direction === 'challenging'
        ? 'The chart-specific factors suggest additional effort and patience, with the reasons described below.'
        : reasoning.direction === 'mixed'
        ? 'The chart-specific factors are mixed; the conclusion depends on balancing the supportive and restricting indications.'
        : reasoning.direction === 'insufficient_evidence'
        ? 'There is not enough verified evidence to reach a useful conclusion yet.'
        : 'The chart factors are inconclusive for this question.');

    const natalFactors = selection.supportingClaims.filter(c => c.factorType === 'natal').map(c => c.naturalText);
    const transitFactors = selection.supportingClaims.filter(c => c.factorType === 'transit' || c.isTransit).map(c => c.naturalText);
    const dashaFactors = selection.supportingClaims.filter(c => c.factorType === 'dasha').map(c => c.naturalText);
    const vargaFactors = selection.supportingClaims.filter(c => c.factorType === 'varga').map(c => c.naturalText);

    const contextPack: NarratorContextPack = {
      originalQuestion: plan.rawQuestion,
      domain: plan.domain,
      intent: plan.intent,
      responseType,
      technicalMode,
      directAnswerDirection,
      transitFocus: isTransitQuestion &&
        hasVerifiedTransitEvidence &&
        Boolean(plan.planetFocus[0]) &&
        transitFactors.length > 0
        ? {
            isTransitQuestion: true,
            transitingPlanet: plan.planetFocus[0],
            targetHouse: plan.houseFocus[0],
            activationSummary: transitFactors[0],
            hasVerifiedTransitEvidence: true,
          }
        : undefined,
      natalFactors,
      transitFactors,
      dashaFactors,
      vargaFactors,
      supportingFactors: selection.supportingClaims.map(c => c.naturalText),
      restrictingFactors: selection.restrictingClaims.map(c => c.naturalText),
      timingWindows: sanitizedWindows,
      dashaWindow,
      transitWindow,
      confluenceWindow,
      classicalContextSummary: selection.classicalContextSummary,
      uncertaintyLevel: reasoning.confidence === 'high'
        ? 'low'
        : reasoning.confidence === 'low'
        ? 'high'
        : 'moderate',
      requestedDepth,
      selectedClaimIds: selection.selectedClaimIds,
      selectedEvidenceIds: selection.selectedEvidenceIds,
      version: 'ai-v2-context-pack-2',
      createdAtIso: new Date().toISOString(),
    };

    // 5. Allocate Claims into Conversational Sections
    const { sections, claimIdsPerSection, timingClaims, restrictions, unansweredParts } =
      this.buildSections(responseType, plan, reasoning, selection, sanitizedWindows);

    const followUpStrategy = this.buildFollowUpStrategy(plan, reasoning);

    return {
      responseId,
      questionId,
      responseType,
      answerFirst: responseType !== 'clarification',
      requestedDepth,
      tone,
      sections,
      claimIdsPerSection,
      timingClaims,
      restrictions,
      unansweredParts,
      contextPack,
      followUpStrategy,
      responseVersion: 'ai-v2-response-plan-2',
      createdAtIso: new Date().toISOString(),
    };
  }

  private determineResponseType(
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    approvedClaimSet: ApprovedClaimSet
  ): ResponseType {
    if (plan.clarificationRequired) {
      return 'clarification';
    }

    if (reasoning.direction === 'insufficient_evidence' || approvedClaimSet.status === 'insufficient_evidence') {
      return 'insufficient_evidence';
    }

    if (plan.intent === 'promotion_timing' || plan.intent === 'career_timing' || plan.temporalScope.type === 'specific_date') {
      return 'timing_analysis';
    }

    if (plan.chartLayers.length >= 2 || plan.intent === 'yoga_analysis' || plan.intent === 'deep_analysis') {
      return 'deep_analysis';
    }

    const rawLower = plan.rawQuestion.toLowerCase();
    if (
      (plan.intent === 'general_chart_question' && plan.planetFocus.length <= 1 && plan.houseFocus.length === 0) ||
      ((rawLower.startsWith('what is my') ||
        rawLower.startsWith("what's my") ||
        rawLower.startsWith('which sign is') ||
        rawLower.startsWith('which house') ||
        rawLower.startsWith('where is') ||
        rawLower.startsWith('is jupiter') ||
        rawLower.startsWith('which planet is')) &&
        !rawLower.includes('influence') &&
        !rawLower.includes('timing') &&
        !rawLower.includes('synthesize'))
    ) {
      return 'simple_fact';
    }

    if (plan.intent === 'planet_question' || plan.intent === 'house_question') {
      return 'simple_interpretation';
    }

    return 'focused_analysis';
  }

  private buildSections(
    responseType: ResponseType,
    plan: QuestionPlan,
    reasoning: ReasoningPacket,
    selection: { supportingClaims: any[]; restrictingClaims: any[]; selectedClaimIds: string[] },
    sanitizedWindows: any[]
  ): {
    sections: ResponseSectionPlan[];
    claimIdsPerSection: Record<string, string[]>;
    timingClaims: string[];
    restrictions: string[];
    unansweredParts: string[];
  } {
    const sections: ResponseSectionPlan[] = [];
    const claimIdsPerSection: Record<string, string[]> = {};
    const timingClaims: string[] = [];
    const restrictions: string[] = [];
    const unansweredParts: string[] = [];

    // A. Clarification / Insufficient Evidence Structure
    if (responseType === 'clarification' || responseType === 'insufficient_evidence') {
      sections.push({
        id: 'sec_clarify',
        title: 'Clarification Needed',
        intent: 'Explain what is missing and ask for the specific area of life to examine.',
        claimIds: selection.selectedClaimIds,
      });
      claimIdsPerSection['sec_clarify'] = selection.selectedClaimIds;
      unansweredParts.push(...(plan.ambiguities || ['Target area of life / timeframe']));
      return { sections, claimIdsPerSection, timingClaims, restrictions, unansweredParts };
    }

    // B. Direct Answer Section (Answer-First)
    const directClaimIds = selection.supportingClaims.slice(0, 1).map(c => c.claimId);
    sections.push({
      id: 'sec_direct_answer',
      title: 'Direct Answer',
      intent: 'Answer the user query directly in plain, friendly language in the first 1-2 sentences.',
      claimIds: directClaimIds,
    });
    claimIdsPerSection['sec_direct_answer'] = directClaimIds;

    // C. Supporting Astrological Drivers (Budgeted)
    const supportClaimIds = selection.supportingClaims.map(c => c.claimId);
    if (supportClaimIds.length > 0) {
      sections.push({
        id: 'sec_astrological_support',
        title: 'Core Astrological Drivers',
        intent: 'Explain the key verified planetary drivers supporting the reading without dumping raw metadata.',
        claimIds: supportClaimIds,
      });
      claimIdsPerSection['sec_astrological_support'] = supportClaimIds;
    }

    // D. Qualifications / Structural Restrictions (Budgeted)
    const restrictionClaimIds = selection.restrictingClaims.map(c => c.claimId);
    if (restrictionClaimIds.length > 0) {
      sections.push({
        id: 'sec_constraints',
        title: 'Structural Disciplines & Qualifications',
        intent: 'Address required patience, discipline, or challenges without fatalism.',
        claimIds: restrictionClaimIds,
      });
      claimIdsPerSection['sec_constraints'] = restrictionClaimIds;
      restrictions.push(...selection.restrictingClaims.map(c => c.naturalText));
    }

    // E. Sanitized Timing Horizon
    if (sanitizedWindows.length > 0) {
      const timeClaimIds = selection.supportingClaims.filter(c => c.type === 'timing').map(c => c.claimId);
      sections.push({
        id: 'sec_timing_horizon',
        title: 'Timing Horizon',
        intent: 'Highlight verified Dasha and Gochara transit periods in human-friendly date ranges.',
        claimIds: timeClaimIds,
      });
      claimIdsPerSection['sec_timing_horizon'] = timeClaimIds;
      timingClaims.push(...sanitizedWindows.map(w => `${w.label}: ${w.periodText}`));
    }

    // F. Contextual Closing
    sections.push({
      id: 'sec_closing',
      title: 'Contextual Summary',
      intent: 'Provide an encouraging, grounded closing statement with classical context.',
      claimIds: [],
    });
    claimIdsPerSection['sec_closing'] = [];

    return {
      sections,
      claimIdsPerSection,
      timingClaims,
      restrictions,
      unansweredParts,
    };
  }

  private buildFollowUpStrategy(plan: QuestionPlan, reasoning: ReasoningPacket): { suggestedNextTopics: string[] } {
    const domain = plan.domain.toLowerCase();

    if (domain === 'career') {
      return {
        suggestedNextTopics: [
          'D10 Dashamsha leadership potential',
          'Vimshottari Antardasha transition timing',
          'Saturn discipline strategies for long-term growth',
        ],
      };
    }

    if (domain === 'relationship') {
      return {
        suggestedNextTopics: [
          'D9 Navamsha spousal dynamics',
          '7th Lord Dasha cycle activation',
          'Venus-Jupiter relational balance',
        ],
      };
    }

    return {
      suggestedNextTopics: [
        'Upcoming Vimshottari Dasha cycles',
        'Key benefic planetary transits',
        'Sarvashtakavarga strength distribution',
      ],
    };
  }
}
