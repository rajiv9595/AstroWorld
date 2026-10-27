/**
 * ASTROWORLD AI V2 — Conversation Context Pack Builder
 * Generates compact, question-relevant context objects for downstream QuestionPlanning and Narration.
 * Contains ONLY the context relevant to the active question, omitting redundant history.
 */

import {
  ConversationState,
  ConversationContextPack,
  ResolvedReferents,
  PreviousClaimRecord,
  StructuredAnswerSummary,
} from './conversationStateTypes.ts';

export class ConversationContextPackBuilder {
  /**
   * Builds a compact context pack tailored specifically for the current turn.
   */
  public static buildPack(
    state: ConversationState,
    referents: ResolvedReferents,
    options?: {
      maxRecentClaims?: number;
      includeUnresolvedThreads?: boolean;
    }
  ): ConversationContextPack {
    const maxClaims = options?.maxRecentClaims ?? 4;

    // Filter claims relevant to the current domain or referents
    const relevantClaims: PreviousClaimRecord[] = [];
    for (const c of state.activeClaims) {
      if (referents.referentClaimIds.includes(c.claimId)) {
        relevantClaims.push(c);
      } else if (
        referents.resolvedTopic &&
        c.topic.toLowerCase().includes(referents.resolvedTopic.toLowerCase())
      ) {
        relevantClaims.push(c);
      } else if (c.topic.toLowerCase().includes(state.currentDomain.toLowerCase())) {
        relevantClaims.push(c);
      }
      if (relevantClaims.length >= maxClaims) break;
    }

    // Determine relevant previous answer summary
    let relevantPreviousSummary: StructuredAnswerSummary | undefined = undefined;
    if (referents.hasReferents && state.lastAnswerSummary) {
      relevantPreviousSummary = state.lastAnswerSummary;
    } else if (state.lastAnswerSummary && !referents.domainSwitched) {
      relevantPreviousSummary = state.lastAnswerSummary;
    }

    // Filter active open threads
    const openThreads = (state.unresolvedThreads || []).filter(
      t => t.status === 'open' || t.status === 'partially_resolved'
    );

    return {
      conversationId: state.conversationId,
      currentTopic: referents.resolvedTopic || state.currentTopic,
      currentDomain: state.currentDomain,
      previousDomain: referents.previousDomain,
      resolvedReferents: referents,
      recentRelevantClaims: relevantClaims,
      relevantPreviousAnswerSummary: relevantPreviousSummary,
      unresolvedThreads: openThreads.slice(0, 3),
      corrections: state.userCorrections || [],
      recentFactors: state.recentlyDiscussedFactors.slice(0, 5),
      clarificationNeeded: referents.ambiguousReferences.length > 0 || state.clarificationNeeded,
      clarificationReason:
        state.clarificationReason ||
        (referents.ambiguousReferences.length > 0
          ? `Ambiguous referent(s) detected: ${referents.ambiguousReferences.join(', ')}`
          : undefined),
      contextConfidence: referents.referentConfidence,
    };
  }

  /**
   * Formats the context pack into a concise text representation for downstream modules.
   */
  public static formatForPrompt(pack: ConversationContextPack): string {
    const lines: string[] = [];
    lines.push(`Active Topic: ${pack.currentTopic} (Domain: ${pack.currentDomain})`);

    if (pack.previousDomain && pack.previousDomain !== pack.currentDomain) {
      lines.push(`Context Transition: Switched from ${pack.previousDomain} to ${pack.currentDomain}`);
    }

    if (pack.resolvedReferents.hasReferents) {
      lines.push(
        `Resolved Referents: topic="${pack.resolvedReferents.resolvedTopic || 'N/A'}", entity="${
          pack.resolvedReferents.resolvedEntity || 'N/A'
        }", explanationRequested=${pack.resolvedReferents.requestedExplanation}`
      );
    }

    if (pack.relevantPreviousAnswerSummary) {
      lines.push(`Prior Answer Summary: ${pack.relevantPreviousAnswerSummary.mainConclusion}`);
      if (pack.relevantPreviousAnswerSummary.timing) {
        lines.push(`Prior Verified Timing: ${pack.relevantPreviousAnswerSummary.timing}`);
      }
    }

    if (pack.recentRelevantClaims.length > 0) {
      lines.push(
        `Relevant Prior Claims: ${pack.recentRelevantClaims.map(c => `[${c.type}] ${c.statement}`).join('; ')}`
      );
    }

    if (pack.corrections.length > 0) {
      lines.push(
        `Active Corrections: ${pack.corrections.map(c => `"${c.previousStatement}" was corrected to "${c.correctedStatement}" (${c.reason})`).join('; ')}`
      );
    }

    return lines.join('\n');
  }
}
