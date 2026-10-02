/**
 * ASTROWORLD — Semantic Conversation Memory & Non-Repetition Tracker
 * Retains conversation context, tracks established timeframes and topics,
 * and maintains a set of discussed fact keys to eliminate repetitive answers.
 */

import { ConversationMemoryState, ConversationTurn, UserIntent } from '../types.ts';

const SESSION_MEMORY_CACHE = new Map<string, ConversationMemoryState>();

export function getOrCreateConversationMemory(sessionId: string): ConversationMemoryState {
  if (!SESSION_MEMORY_CACHE.has(sessionId)) {
    SESSION_MEMORY_CACHE.set(sessionId, {
      sessionId,
      turns: [],
      discussedFactKeys: new Set<string>(),
      unresolvedQuestions: [],
    });
  }
  return SESSION_MEMORY_CACHE.get(sessionId)!;
}

export function recordConversationTurn(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  intents: UserIntent[],
  factsUsed: string[],
  timeframe?: string,
  topic?: string
): void {
  const memory = getOrCreateConversationMemory(sessionId);

  const userTurn: ConversationTurn = {
    id: `turn-${Date.now()}-u`,
    role: 'user',
    content: userMessage,
    timestampIso: new Date().toISOString(),
    intents,
  };

  const assistantTurn: ConversationTurn = {
    id: `turn-${Date.now()}-a`,
    role: 'assistant',
    content: assistantMessage,
    timestampIso: new Date().toISOString(),
    factsReferenced: factsUsed,
  };

  memory.turns.push(userTurn, assistantTurn);

  // Keep memory compact (last 10 turns max)
  if (memory.turns.length > 10) {
    memory.turns = memory.turns.slice(memory.turns.length - 10);
  }

  // Update discussed facts
  factsUsed.forEach((f) => memory.discussedFactKeys.add(f));

  // Update established timeframe and topic
  if (timeframe) {
    memory.establishedTimeframe = timeframe;
  }
  if (topic) {
    memory.establishedTopic = topic;
  }
}

export function buildConversationSummary(memory: ConversationMemoryState): string {
  if (memory.turns.length === 0) return 'New consultation session.';
  const recentTurns = memory.turns.slice(-4);
  return recentTurns
    .map((t) => `${t.role === 'user' ? 'Client' : 'Astrologer'}: ${t.content.slice(0, 180)}...`)
    .join('\n');
}
