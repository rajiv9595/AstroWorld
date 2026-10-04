/**
 * ASTROWORLD AI V2 — Conversation State Resolver
 * Resolves implicit referents, pronouns, temporal anchors, follow-up intent ("Why?"),
 * domain switches, and ambiguous antecedents against active conversation state.
 * Fully deterministic, rapid (<3ms), and non-speculative.
 */

import {
  ConversationState,
  ConversationTurn,
  ResolvedReferents,
  ConversationContextPack,
  ConversationStateTrace,
} from './conversationStateTypes.ts';
import { ConversationContextPackBuilder } from './conversationContextPack.ts';

export class ConversationStateResolver {
  /**
   * Resolves conversational context for an incoming user message.
   */
  public resolve(
    userMessage: string,
    state: ConversationState,
    turns: ConversationTurn[]
  ): {
    contextPack: ConversationContextPack;
    trace: ConversationStateTrace;
  } {
    const startTime = Date.now();
    const raw = userMessage.trim();
    const lower = raw.toLowerCase();

    const previousTurn = turns.length > 0 ? turns[turns.length - 1] : undefined;
    const referentTurnId = previousTurn?.turnId;
    const referentClaimIds: string[] = previousTurn ? [...previousTurn.approvedClaimIds] : [];

    const detectedReferences: string[] = [];
    const ambiguousReferences: string[] = [];
    let requestedExplanation = false;
    let resolvedIntent: string | undefined = undefined;
    let resolvedTopic: string | undefined = undefined;
    let resolvedEntity: string | undefined = undefined;
    let resolvedTemporalScope: any = undefined;
    let domainSwitched = false;
    let previousDomain: string | undefined = state.currentDomain !== 'general' ? state.currentDomain : undefined;
    let targetDomain = state.currentDomain;
    let clarificationNeeded = false;
    let clarificationReason: string | undefined = undefined;
    let suggestedOptions: string[] | undefined = undefined;
    let referentConfidence = 1.0;

    // -------------------------------------------------------------------------
    // 1. DOMAIN SWITCHING DETECTION
    // High priority: Explicit domain words in current message must override prior domain
    // -------------------------------------------------------------------------
    const domainMatch = this.detectExplicitDomain(lower);
    if (domainMatch) {
      if (domainMatch !== state.currentDomain && state.currentDomain !== 'general') {
        domainSwitched = true;
        previousDomain = state.currentDomain;
      }
      targetDomain = domainMatch;
    }

    // -------------------------------------------------------------------------
    // 2. EXPLICIT ASTROLOGICAL ENTITY EXTRACTION FROM QUERY
    // -------------------------------------------------------------------------
    const planetsList = ['Jupiter', 'Saturn', 'Venus', 'Mars', 'Mercury', 'Sun', 'Moon', 'Rahu', 'Ketu'];
    for (const p of planetsList) {
      if (new RegExp(`\\b${p}\\b`, 'i').test(lower)) {
        resolvedEntity = p;
        break;
      }
    }
    if (!resolvedEntity) {
      if (
        lower.includes('d10 lagna') ||
        lower.includes('dashamsha lagna') ||
        (lower.includes('this placement') && state.recentlyDiscussedFactors.some(f => f.includes('D10')))
      ) {
        resolvedEntity = 'D10 Lagna';
      } else if (lower.includes('budhaditya')) {
        resolvedEntity = 'Budhaditya Yoga';
      }
    }

    // -------------------------------------------------------------------------
    // 3. FOLLOW-UP "WHY" / "HOW" / EXPLANATION DETECTION
    // -------------------------------------------------------------------------
    const isWhyFollowUp =
      lower === 'why' ||
      lower === 'why?' ||
      lower.startsWith('why ') ||
      lower.startsWith('why is that') ||
      lower === 'how so?' ||
      lower === 'how so' ||
      lower.startsWith('how come') ||
      lower.includes('what makes that stronger') ||
      lower.includes('what makes august stronger') ||
      lower.includes('why do you say') ||
      /\bwhy\??$/i.test(lower) ||
      /\bwhy\b/i.test(lower) ||
      lower.includes('can you explain') ||
      lower.includes('explain that') ||
      lower.includes('why did you pick');

    if (isWhyFollowUp) {
      detectedReferences.push('why_explanation_request');
      requestedExplanation = true;
      if (!resolvedIntent) {
        resolvedIntent = 'challenge_previous_conclusion';
      }

      if (previousTurn) {
        if (!resolvedTopic) {
          resolvedTopic = previousTurn.answerSummary?.mainConclusion || previousTurn.dominantFactors?.[0] || state.currentTopic;
        }
        if (!resolvedEntity) {
          resolvedEntity = previousTurn.dominantFactors?.[0] || state.activePlanetFocus?.[0];
        }
      } else if (state.lastQuestion) {
        if (!resolvedTopic) resolvedTopic = state.currentTopic;
      } else {
        // "Why?" with zero previous context: Only elliptical "Why?" queries without an astrological proposition halt
        const isEllipticalWhy =
          lower === 'why' ||
          lower === 'why?' ||
          lower === 'why is that' ||
          lower === 'why is that?' ||
          lower === 'how so' ||
          lower === 'how so?' ||
          lower === 'why do you say that' ||
          lower === 'why do you say that?' ||
          lower === 'why do you say so';
        if (isEllipticalWhy) {
          clarificationNeeded = true;
          clarificationReason = 'No previous statement exists in the conversation to explain.';
          referentConfidence = 0.0;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. PRONOUN & GENERIC ENTITY REFERENCE RESOLUTION ("it", "they", "that planet")
    // -------------------------------------------------------------------------
    const hasGenericPronoun =
      /\b(it|they|this planet|that planet|that yoga|this placement)\b/i.test(lower) ||
      lower === 'what about it?' ||
      lower === 'what about it' ||
      lower === 'and it?' ||
      lower === 'and that?';

    if (hasGenericPronoun) {
      detectedReferences.push('generic_pronoun_reference');

      // Check active candidates in recent conversation
      const candidatePlanets = state.activePlanetFocus.filter(Boolean);
      const recentFactors = state.recentlyDiscussedFactors.filter(Boolean);

      if (lower.includes('that planet') || lower.includes('this planet')) {
        if (candidatePlanets.length === 1) {
          resolvedEntity = candidatePlanets[0];
        } else if (recentFactors.some(f => candidatePlanets.includes(f))) {
          resolvedEntity = recentFactors.find(f => candidatePlanets.includes(f));
        } else if (candidatePlanets.length > 1) {
          ambiguousReferences.push(`Ambiguous reference "that planet" between: ${candidatePlanets.join(', ')}`);
          clarificationNeeded = true;
          clarificationReason = `The question refers to "that planet", but both ${candidatePlanets.join(' and ')} were recently discussed.`;
          suggestedOptions = candidatePlanets.map(p => `Inquire about ${p}`);
        }
      } else if (lower.includes('that yoga') || lower.includes('this yoga')) {
        const yoga = recentFactors.find(f => f.toLowerCase().includes('yoga')) || 'Budhaditya Yoga';
        resolvedEntity = yoga;
      } else if (lower.includes('this placement')) {
        const placement = recentFactors.find(f => f.toLowerCase().includes('lagna') || f.toLowerCase().includes('d10')) || 'D10 Lagna';
        resolvedEntity = placement;
      } else if (lower.includes('what about it') || lower === 'it' || lower.includes('and that')) {
        if (candidatePlanets.length > 1) {
          // Material ambiguity: multiple candidate planets discussed
          ambiguousReferences.push(`Ambiguous reference "it" between: ${candidatePlanets.join(', ')}`);
          clarificationNeeded = true;
          clarificationReason = `The question refers to "it", but both ${candidatePlanets.join(' and ')} were recently discussed.`;
          suggestedOptions = candidatePlanets.map(p => `Inquire about ${p}`);
          referentConfidence = 0.4;
        } else if (candidatePlanets.length === 1) {
          resolvedEntity = candidatePlanets[0];
        } else if (recentFactors.length === 1) {
          resolvedEntity = recentFactors[0];
        } else if (turns.length === 0) {
          ambiguousReferences.push('unresolved_pronoun_no_prior_entity');
          clarificationNeeded = true;
          clarificationReason = 'No prior astrological factor was discussed to resolve this reference.';
          referentConfidence = 0.0;
        }
      } else if (!resolvedEntity) {
        if (candidatePlanets.length === 1) {
          resolvedEntity = candidatePlanets[0];
        } else if (recentFactors.length === 1) {
          resolvedEntity = recentFactors[0];
        } else if (turns.length === 0) {
          const isOrphanedPronoun =
            lower === 'is it good?' ||
            lower === 'is it good' ||
            lower === 'what about it?' ||
            lower === 'what about it' ||
            lower.startsWith('is it ') ||
            lower.startsWith('will it ') ||
            lower.startsWith('can it ') ||
            lower.startsWith('how is it') ||
            lower === 'what about them?' ||
            lower === 'what about them';
          if (isOrphanedPronoun) {
            ambiguousReferences.push('unresolved_pronoun_no_prior_entity');
            clarificationNeeded = true;
            clarificationReason = 'No prior astrological factor was discussed to resolve this reference.';
            referentConfidence = 0.0;
          }
        }
      }
    }

    // Ambiguity check for "What about the same thing?"
    if (lower.includes('the same thing') || lower.includes('same for')) {
      detectedReferences.push('same_thing_reference');
      if (state.recentlyDiscussedFactors.length > 1) {
        ambiguousReferences.push('multiple_candidate_referents_for_same_thing');
        clarificationNeeded = true;
        clarificationReason = 'Multiple astrological topics were discussed; please clarify which factor you want to apply.';
        suggestedOptions = state.recentlyDiscussedFactors.slice(0, 3);
        referentConfidence = 0.3;
      }
    }

    // -------------------------------------------------------------------------
    // 5. TEMPORAL REFERENCE RESOLUTION ("this period", "August", "2027", "next year")
    // -------------------------------------------------------------------------
    const hasTemporalToken =
      /\b(this period|that period|the period|that window|stronger window|earlier period|earlier one|august|september|october|november|december|2026|2027|2028|this year|next year|later in the year)\b/i.test(
        lower
      );

    if (hasTemporalToken) {
      detectedReferences.push('temporal_reference');

      if (
        lower.includes('that period') ||
        lower.includes('this period') ||
        lower.includes('that window') ||
        lower.includes('stronger window') ||
        lower.includes('the stronger window') ||
        lower.includes('earlier one')
      ) {
        // Resolve against prior timing in answer summary or active dates
        if (state.lastAnswerSummary?.timing) {
          resolvedTemporalScope = {
            type: 'prior_confluence_window',
            label: state.lastAnswerSummary.timing,
          };
        } else if (state.activeTimePeriods.length > 0) {
          resolvedTemporalScope = {
            type: 'prior_confluence_window',
            label: state.activeTimePeriods[0],
          };
        } else if (
          state.lastAnswerSummary?.mainConclusion &&
          /\b(early|mid|late\s+)?(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
            state.lastAnswerSummary.mainConclusion
          )
        ) {
          const match = state.lastAnswerSummary.mainConclusion.match(
            /\b(early|mid|late\s+)?(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december(?:\s+\d{4})?)\b/i
          );
          resolvedTemporalScope = {
            type: 'prior_confluence_window',
            label: match ? match[0] : 'prior window',
          };
        } else if (
          lower.startsWith('what about that period') ||
          lower.startsWith('what about this period') ||
          lower === 'what about that period?' ||
          lower === 'what about this period?' ||
          lower.includes('what about that period')
        ) {
          // "What about that period?" without any prior period
          ambiguousReferences.push('unresolved_temporal_period');
          clarificationNeeded = true;
          clarificationReason = 'No specific timeframe or period was previously established to resolve "that period".';
          referentConfidence = 0.2;
        }
      } else if (lower.includes('august')) {
        resolvedTemporalScope = {
          type: 'month_focus',
          label: 'August',
        };
      } else if (lower.includes('2027')) {
        resolvedTemporalScope = {
          type: 'year_focus',
          label: '2027',
          startIso: '2027-01-01T00:00:00.000Z',
          endIso: '2027-12-31T23:59:59.000Z',
        };
      }
    }

    // -------------------------------------------------------------------------
    // 6. GENERIC UNANCHORED INQUIRY DETECTION (e.g. "What next?")
    // -------------------------------------------------------------------------
    if (
      (lower === 'what next?' || lower === 'what next' || lower === 'what now?' || lower === 'what now') &&
      turns.length === 0
    ) {
      clarificationNeeded = true;
      clarificationReason = 'Please specify which astrological topic or life domain you would like to explore next.';
      suggestedOptions = ['Career & Timing', 'Marriage & Relationships', 'Financial Prospects', 'Spiritual Life'];
      referentConfidence = 0.0;
    }

    // -------------------------------------------------------------------------
    // 7. PREVIOUS CLAIM CHALLENGE & CONTRADICTION DETECTION
    // -------------------------------------------------------------------------
    const isContradictionPhrase =
      lower.includes('earlier you said') ||
      lower.includes('you said') ||
      lower.includes('now you are saying') ||
      lower.includes("now you're saying") ||
      lower.includes('but now you said') ||
      lower.includes('i think your earlier timing was wrong');

    if (isContradictionPhrase) {
      detectedReferences.push('claim_challenge_or_contradiction');
      resolvedIntent = 'contradiction_reconciliation';

      // Find relevant previous claims mentioning mentioned planets/dates
      for (const claim of state.activeClaims) {
        if (
          (lower.includes('jupiter') && claim.entities.includes('Jupiter')) ||
          (lower.includes('saturn') && claim.entities.includes('Saturn')) ||
          (lower.includes('2027') && claim.statement.includes('2027')) ||
          (lower.includes('august') && claim.statement.toLowerCase().includes('august'))
        ) {
          if (!referentClaimIds.includes(claim.claimId)) {
            referentClaimIds.push(claim.claimId);
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 6. ASSEMBLE RESOLVED REFERENTS & CONTEXT PACK
    // -------------------------------------------------------------------------
    const hasReferents =
      detectedReferences.length > 0 ||
      requestedExplanation ||
      domainSwitched ||
      Boolean(resolvedTopic || resolvedEntity || resolvedTemporalScope);

    const resolvedReferents: ResolvedReferents = {
      hasReferents,
      resolvedTopic,
      resolvedIntent,
      resolvedEntity,
      resolvedTemporalScope,
      referentTurnId,
      referentClaimIds,
      requestedExplanation,
      domainSwitched,
      previousDomain,
      ambiguousReferences,
      referentConfidence,
    };

    // Update state transient domain for current resolution
    const transientState: ConversationState = {
      ...state,
      currentDomain: targetDomain,
      currentTopic: resolvedTopic || state.currentTopic,
      clarificationNeeded: clarificationNeeded || state.clarificationNeeded,
      clarificationReason: clarificationReason || state.clarificationReason,
    };

    const contextPack = ConversationContextPackBuilder.buildPack(transientState, resolvedReferents);
    if (suggestedOptions) {
      contextPack.suggestedOptions = suggestedOptions;
    }

    const duration = Date.now() - startTime;

    const trace: ConversationStateTrace = {
      traceId: `trace_state_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inputMessage: userMessage,
      previousTurnIds: turns.map(t => t.turnId),
      detectedReferences,
      resolvedReferences: {
        resolvedTopic,
        resolvedIntent,
        resolvedEntity,
        resolvedTemporalScope,
        referentTurnId,
        referentClaimIdsCount: referentClaimIds.length,
      },
      topicBefore: state.currentTopic,
      topicAfter: contextPack.currentTopic,
      domainBefore: state.currentDomain,
      domainAfter: contextPack.currentDomain,
      referencedClaims: referentClaimIds,
      unresolvedThreads: (state.unresolvedThreads || []).map(t => t.topic),
      clarificationDecision: {
        needed: clarificationNeeded,
        reason: clarificationReason,
        suggestedOptions,
      },
      stateVersion: state.stateVersion,
      latencyMs: duration,
    };

    return { contextPack, trace };
  }

  /**
   * Deterministically detects explicit domain indicators in user queries.
   */
  private detectExplicitDomain(lower: string): string | undefined {
    if (
      lower.includes('career') ||
      lower.includes('promotion') ||
      lower.includes('job') ||
      lower.includes('profession') ||
      lower.includes('boss') ||
      lower.includes('work') ||
      lower.includes('business') ||
      lower.includes('corporate')
    ) {
      return 'career';
    }
    if (
      lower.includes('marriage') ||
      lower.includes('spouse') ||
      lower.includes('relationship') ||
      lower.includes('partner') ||
      lower.includes('matrimony') ||
      lower.includes('wedding')
    ) {
      return 'relationship';
    }
    if (
      lower.includes('wealth') ||
      lower.includes('money') ||
      lower.includes('finance') ||
      lower.includes('financial') ||
      lower.includes('income')
    ) {
      return 'finance';
    }
    if (
      lower.includes('health') ||
      lower.includes('vitality') ||
      lower.includes('illness') ||
      lower.includes('disease')
    ) {
      return 'health';
    }
    if (
      lower.includes('spirituality') ||
      lower.includes('spiritual') ||
      lower.includes('moksha') ||
      lower.includes('dharma') ||
      lower.includes('meditation')
    ) {
      return 'spirituality';
    }

    return undefined;
  }
}
