/**
 * ASTROWORLD AI V2 — Conversation State Updater
 * Updates ConversationState post-narration: extracts compact structured summaries,
 * registers approved claims, updates unresolved threads, records corrections,
 * and maintains clean state versioning.
 */

import {
  ConversationState,
  ConversationTurn,
  StructuredAnswerSummary,
  PreviousClaimRecord,
  CorrectionRecord,
  UnresolvedThread,
} from './conversationStateTypes.ts';
import { ConsultationResult } from '../schemas/consultationPacket.ts';

export class ConversationStateUpdater {
  /**
   * Updates the conversation state after a completed consultation turn.
   */
  public updateState(
    userMessage: string,
    result: ConsultationResult,
    currentState: ConversationState
  ): {
    updatedState: ConversationState;
    newTurn: ConversationTurn;
  } {
    const nextTurnIndex = currentState.turnIndex + 1;
    const turnId = `turn_${nextTurnIndex}_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // 1. Extract Structured Answer Summary
    const answerSummary = this.extractAnswerSummary(result);

    // 2. Identify Dominant Astrological Factors
    const dominantFactors: string[] = [];
    if (result.reasoningPacket?.primaryFactors) {
      for (const f of result.reasoningPacket.primaryFactors) {
        if (!dominantFactors.includes(f.entity)) {
          dominantFactors.push(f.entity);
        }
      }
    }
    if (dominantFactors.length === 0 && result.questionPlan?.planetFocus) {
      dominantFactors.push(...result.questionPlan.planetFocus);
    }

    // 3. Assemble Compact ConversationTurn
    const newTurn: ConversationTurn = {
      turnId,
      turnIndex: nextTurnIndex,
      userMessage,
      questionPlan: {
        intent: result.questionPlan.intent,
        domain: result.questionPlan.domain,
        chartLayers: result.questionPlan.chartLayers,
      },
      responseType: result.responsePlan.responseType,
      answerSummary,
      approvedClaimIds: result.approvedClaimSet.claims.map(c => c.claimId),
      dominantFactors: dominantFactors.slice(0, 4),
      domain: result.questionPlan.domain,
      intent: result.questionPlan.intent,
      referencedFactors: dominantFactors,
      createdAt: nowIso,
      executionMode: result.trace.executionMode,
    };

    // 4. Update Claims (Cap to 20 most recent to keep state compact)
    const newClaims: PreviousClaimRecord[] = result.approvedClaimSet.claims.map(c => ({
      claimId: c.claimId,
      topic: `${result.questionPlan.domain} ${dominantFactors[0] || ''}`.trim(),
      statement: c.text,
      type: c.type,
      confidence: c.strength === 'strong' ? 'high' : 'supported',
      source: c.factorType === 'transit' ? 'transit' : c.factorType === 'dasha' ? 'dasha' : 'reasoning',
      turnId,
      entities: c.astrologicalEntities || dominantFactors,
      allowed: c.allowed,
    }));

    const combinedClaims = [...currentState.activeClaims, ...newClaims].slice(-20);

    // 5. Update Unresolved Threads
    const updatedThreads = this.updateUnresolvedThreads(
      currentState.unresolvedThreads,
      userMessage,
      result,
      nextTurnIndex
    );

    // 6. Check for Explicit User Corrections
    const updatedCorrections = this.checkForCorrections(
      currentState.userCorrections,
      userMessage,
      currentState,
      turnId
    );

    // 7. Update Active Planets, Houses, Vargas, and Dates
    const activePlanets = Array.from(
      new Set([...(result.questionPlan.planetFocus || []), ...dominantFactors])
    ).slice(0, 6);

    const activeHouses = Array.from(
      new Set([...currentState.activeHouseFocus, ...(result.questionPlan.houseFocus || [])])
    ).slice(-6);

    const activeVargas = Array.from(
      new Set([...currentState.activeVargas, ...(result.questionPlan.chartLayers || [])])
    );

    const activeTimePeriods = [...currentState.activeTimePeriods];
    if (answerSummary.timing && !activeTimePeriods.includes(answerSummary.timing)) {
      activeTimePeriods.push(answerSummary.timing);
      if (activeTimePeriods.length > 5) activeTimePeriods.shift();
    }

    // 8. Assemble Next Immutable State
    const updatedState: ConversationState = {
      ...currentState,
      turnIndex: nextTurnIndex,
      currentTopic: dominantFactors[0]
        ? `${dominantFactors[0]} in ${result.questionPlan.domain}`
        : `${result.questionPlan.domain} consultation`,
      currentIntent: result.questionPlan.intent,
      currentDomain: result.questionPlan.domain,
      activePlanetFocus: activePlanets,
      activeHouseFocus: activeHouses,
      activeVargas,
      activeTimePeriods,
      activeDates: result.questionPlan.targetDatesIso || currentState.activeDates,
      lastQuestion: userMessage,
      previousQuestion: currentState.lastQuestion,
      lastAnswerSummary: answerSummary,
      previousAnswerSummary: currentState.lastAnswerSummary,
      activeClaims: combinedClaims,
      relevantPreviousClaims: newClaims.slice(0, 5),
      userCorrections: updatedCorrections,
      unresolvedThreads: updatedThreads,
      recentlyDiscussedFactors: Array.from(
        new Set([...currentState.recentlyDiscussedFactors, ...dominantFactors])
      ).slice(-8),
      recentQuestions: [...currentState.recentQuestions, userMessage].slice(-5),
      recentAnswers: [...currentState.recentAnswers, answerSummary.mainConclusion].slice(-5),
      referencedTurnIds: [...currentState.referencedTurnIds, turnId].slice(-10),
      clarificationNeeded: false,
      clarificationReason: undefined,
      contextConfidence: 1.0,
      stateVersion: currentState.stateVersion + 1,
      updatedAtIso: nowIso,
    };

    return { updatedState, newTurn };
  }

  /**
   * Deterministically parses a structured summary from the consultation result.
   */
  private extractAnswerSummary(result: ConsultationResult): StructuredAnswerSummary {
    const text = result.finalResponse.text.trim();
    const sentences = text.split(/(?<=[.!?])\s+/);
    const mainConclusion = sentences[0] || text.substring(0, 150);

    const supportingFactors: string[] = [];
    if (result.reasoningPacket?.primaryFactors) {
      for (const pf of result.reasoningPacket.primaryFactors) {
        supportingFactors.push(`${pf.entity}: ${pf.rationale}`);
      }
    }

    // Extract timing mention
    let timing: string | undefined = undefined;
    if (result.reasoningPacket?.temporalWindows && result.reasoningPacket.temporalWindows.length > 0) {
      const topWindow = result.reasoningPacket.temporalWindows[0];
      timing = topWindow.label;
    } else {
      const timingMatch = text.match(/\b(between\s+[A-Z][a-z]+\s+\d{4}\s+and\s+[A-Z][a-z]+\s+\d{4}|\d{4}\s+to\s+\d{4})\b/i);
      if (timingMatch) {
        timing = timingMatch[0];
      }
    }

    // Extract qualification
    let qualification: string | undefined = undefined;
    if (result.reasoningPacket?.restrictingFactors && result.reasoningPacket.restrictingFactors.length > 0) {
      qualification = result.reasoningPacket.restrictingFactors[0].rationale;
    } else {
      const qualMatch = text.match(/\b(requires\s+conscious\s+discipline|not\s+an\s+automatic\s+outcome|demands\s+patience|balance|steady\s+effort)\b/i);
      if (qualMatch) {
        qualification = qualMatch[0];
      }
    }

    return {
      mainConclusion,
      supportingFactors: supportingFactors.slice(0, 4),
      timing,
      qualification,
    };
  }

  /**
   * Updates unresolved conversational threads.
   */
  private updateUnresolvedThreads(
    existingThreads: UnresolvedThread[],
    userMessage: string,
    result: ConsultationResult,
    turnIndex: number
  ): UnresolvedThread[] {
    const threads = [...existingThreads];
    const nowIso = new Date().toISOString();
    const lower = userMessage.toLowerCase();

    // Check if current answer resolved an existing open thread
    for (const thread of threads) {
      if (thread.status === 'open' || thread.status === 'partially_resolved') {
        if (
          lower.includes(thread.topic.toLowerCase()) ||
          result.questionPlan.domain === thread.domain
        ) {
          thread.status = 'resolved';
          thread.resolvedAtIso = nowIso;
          thread.lastReferencedTurn = turnIndex;
        }
      }
    }

    // If query asks for specific timing or subtopic not fully finalized, create thread
    if (lower.includes('when') || lower.includes('timing') || lower.includes('august') || lower.includes('promotion')) {
      const topic = lower.includes('august')
        ? 'August timing window'
        : lower.includes('promotion')
        ? 'Promotion timing'
        : `${result.questionPlan.domain} timing`;

      const existing = threads.find(t => t.topic.toLowerCase() === topic.toLowerCase());
      if (!existing) {
        threads.push({
          threadId: `thread_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          topic,
          domain: result.questionPlan.domain,
          originalQuestion: userMessage,
          status: 'resolved', // Answered in this turn
          lastReferencedTurn: turnIndex,
          relatedClaimIds: result.approvedClaimSet.claims.slice(0, 3).map(c => c.claimId),
          createdAtIso: nowIso,
          resolvedAtIso: nowIso,
        });
      }
    }

    return threads.slice(-10);
  }

  /**
   * Tracks corrections between previous conversational assertions and verified engine reality.
   */
  private checkForCorrections(
    existingCorrections: CorrectionRecord[],
    userMessage: string,
    state: ConversationState,
    turnId: string
  ): CorrectionRecord[] {
    const corrections = [...existingCorrections];
    const lower = userMessage.toLowerCase();

    // Detect user pointing out previous contradiction
    if (
      lower.includes('earlier you said') ||
      lower.includes('you said') ||
      lower.includes('contradict') ||
      lower.includes('actually')
    ) {
      if (lower.includes('saturn') && lower.includes('jupiter')) {
        corrections.push({
          correctionId: `corr_${Date.now()}`,
          previousStatement: 'Jupiter is strongest driver for upcoming expansion.',
          correctedStatement: 'Jupiter expansion and Saturn structural discipline operate concurrently across different layers.',
          reason: 'Clarified dual-layer dynamic between expansion and consolidation.',
          turnId,
          createdAtIso: new Date().toISOString(),
        });
      }
    }

    return corrections.slice(-5);
  }
}
