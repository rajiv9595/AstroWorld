/**
 * ASTROWORLD AI V2 — Conversation Concurrency & Turn Lock Manager
 * Prevents race conditions and turn interleaving within the same consultation thread.
 */

import { ProductionError } from './productionErrors.ts';

export class ConcurrencyManager {
  private activeLocks = new Map<string, { lockedAt: number; userId: string }>();
  private readonly lockTimeoutMs = 15000;

  /**
   * Acquires an exclusive lock on a conversation thread.
   */
  public async acquireLock(conversationId: string, userId: string): Promise<() => void> {
    const now = Date.now();
    const existing = this.activeLocks.get(conversationId);

    if (existing) {
      if (now - existing.lockedAt < this.lockTimeoutMs) {
        throw new ProductionError({
          errorCode: 'CONCURRENCY_CONFLICT',
          userMessage: 'This consultation session is currently processing another inquiry. Please wait for the previous turn to complete.',
          internalDetails: `ConversationLockHeld: ${conversationId} is locked by user ${existing.userId}`,
        });
      }
    }

    this.activeLocks.set(conversationId, { lockedAt: now, userId });

    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.activeLocks.delete(conversationId);
      }
    };
  }

  public isLocked(conversationId: string): boolean {
    const existing = this.activeLocks.get(conversationId);
    if (!existing) return false;
    if (Date.now() - existing.lockedAt >= this.lockTimeoutMs) {
      this.activeLocks.delete(conversationId);
      return false;
    }
    return true;
  }

  public reset() {
    this.activeLocks.clear();
  }
}
