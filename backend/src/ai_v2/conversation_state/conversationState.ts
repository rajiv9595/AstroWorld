/**
 * ASTROWORLD AI V2 — Conversation State Manager
 * Maintains in-memory session consultation states, version tracking, state cloning,
 * and deterministic state reconstruction from historical turns.
 * Strictly request/session-scoped without external persistent storage.
 */

import {
  ConversationState,
  ConversationTurn,
  validateConversationState,
} from './conversationStateTypes.ts';

export class ConversationStateManager {
  private sessions: Map<string, { state: ConversationState; turns: ConversationTurn[] }> = new Map();

  /**
   * Initializes a fresh, valid initial conversation state.
   */
  public createInitialState(conversationId?: string): ConversationState {
    const id = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialState: ConversationState = {
      conversationId: id,
      turnIndex: 0,
      currentTopic: 'Initial Consultation Overview',
      currentIntent: 'general_consultation',
      currentDomain: 'general',
      activePlanetFocus: [],
      activeHouseFocus: [],
      activeVargas: ['D1'],
      activeTimePeriods: [],
      activeDates: [],
      lastQuestion: '',
      activeClaims: [],
      relevantPreviousClaims: [],
      userCorrections: [],
      unresolvedThreads: [],
      recentlyDiscussedFactors: [],
      recentQuestions: [],
      recentAnswers: [],
      referencedTurnIds: [],
      clarificationNeeded: false,
      contextConfidence: 1.0,
      stateVersion: 1,
      createdAtIso: now,
      updatedAtIso: now,
    };

    this.sessions.set(id, { state: initialState, turns: [] });
    return this.cloneState(initialState);
  }

  /**
   * Retrieves current conversation state for a given session.
   */
  public getState(conversationId: string): ConversationState | undefined {
    const session = this.sessions.get(conversationId);
    return session ? this.cloneState(session.state) : undefined;
  }

  /**
   * Retrieves conversation turns for a given session.
   */
  public getTurns(conversationId: string): ConversationTurn[] {
    const session = this.sessions.get(conversationId);
    return session ? [...session.turns] : [];
  }

  /**
   * Stores an updated state and registers the latest turn.
   */
  public commitState(conversationId: string, updatedState: ConversationState, newTurn?: ConversationTurn): void {
    const validation = validateConversationState(updatedState);
    if (!validation.valid) {
      throw new Error(`Cannot commit invalid ConversationState: ${validation.errors.join('; ')}`);
    }

    let session = this.sessions.get(conversationId);
    if (!session) {
      session = { state: updatedState, turns: [] };
      this.sessions.set(conversationId, session);
    }

    session.state = this.cloneState(updatedState);
    if (newTurn) {
      session.turns.push({ ...newTurn });
    }
  }

  /**
   * Reconstructs conversation state deterministically from an ordered array of historical turns.
   */
  public reconstructStateFromTurns(conversationId: string, turns: ConversationTurn[]): ConversationState {
    const state = this.createInitialState(conversationId);

    if (!turns || turns.length === 0) {
      return state;
    }

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      state.turnIndex = i + 1;
      state.lastQuestion = turn.userMessage;
      state.previousQuestion = turns[i - 1]?.userMessage;
      state.currentDomain = turn.domain || state.currentDomain;
      state.currentIntent = turn.intent || state.currentIntent;
      state.currentTopic = turn.dominantFactors?.[0] ? `${turn.dominantFactors[0]} in ${state.currentDomain}` : state.currentTopic;

      state.previousAnswerSummary = state.lastAnswerSummary;
      state.lastAnswerSummary = turn.answerSummary;

      state.recentQuestions.push(turn.userMessage);
      if (state.recentQuestions.length > 5) state.recentQuestions.shift();

      if (turn.answerSummary?.mainConclusion) {
        state.recentAnswers.push(turn.answerSummary.mainConclusion);
        if (state.recentAnswers.length > 5) state.recentAnswers.shift();
      }

      state.referencedTurnIds.push(turn.turnId);
      if (turn.referencedFactors) {
        for (const f of turn.referencedFactors) {
          if (!state.recentlyDiscussedFactors.includes(f)) {
            state.recentlyDiscussedFactors.push(f);
          }
        }
      }

      state.stateVersion = i + 2;
      state.updatedAtIso = turn.createdAt || new Date().toISOString();
    }

    this.sessions.set(conversationId, { state: this.cloneState(state), turns: [...turns] });
    return state;
  }

  /**
   * Deep-clones state to guarantee immutability across turns.
   */
  public cloneState(state: ConversationState): ConversationState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Resets or clears a session state.
   */
  public resetState(conversationId: string): void {
    this.sessions.delete(conversationId);
  }
}
