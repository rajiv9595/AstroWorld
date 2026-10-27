/**
 * ASTROWORLD AI V2 — Idempotency Manager
 * Guarantees exactly-once execution semantics for consultation turns.
 */

import {
  IdempotencyRecord,
  ProductionConsultationResponse,
  ProductionErrorResponse,
} from './productionTypes.ts';
import { ProductionError } from './productionErrors.ts';

export class IdempotencyManager {
  private records = new Map<string, IdempotencyRecord>();
  private readonly defaultTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  private makeKey(userId: string, idempotencyKey: string): string {
    return `${userId}::${idempotencyKey}`;
  }

  /**
   * Begins or checks an idempotent consultation request.
   * Returns cached response if completed, throws CONCURRENCY_CONFLICT if already in progress,
   * or claims the idempotency slot.
   */
  public async claimOrRetrieve(
    userId: string,
    idempotencyKey: string
  ): Promise<{ isReplay: boolean; cachedResponse?: ProductionConsultationResponse }> {
    const key = this.makeKey(userId, idempotencyKey);
    const now = Date.now();
    const existing = this.records.get(key);

    if (existing) {
      if (existing.expiresAt < now) {
        this.records.delete(key);
      } else if (existing.status === 'in_progress') {
        throw new ProductionError({
          errorCode: 'CONCURRENCY_CONFLICT',
          userMessage: 'An identical request with this idempotency key is currently being processed. Please wait.',
        });
      } else if (existing.status === 'completed' && existing.responsePayload) {
        // Return cached response with idempotent replay indicator
        const replayed: ProductionConsultationResponse = {
          ...existing.responsePayload,
          executionMetadata: {
            ...existing.responsePayload.executionMetadata,
            cachedOrIdempotent: true,
          },
        };
        return { isReplay: true, cachedResponse: replayed };
      }
    }

    // Claim slot as in_progress
    this.records.set(key, {
      key: idempotencyKey,
      userId,
      status: 'in_progress',
      createdAt: now,
      expiresAt: now + this.defaultTtlMs,
    });

    return { isReplay: false };
  }

  /**
   * Marks the idempotent operation as successfully completed.
   */
  public async complete(
    userId: string,
    idempotencyKey: string,
    response: ProductionConsultationResponse
  ) {
    const key = this.makeKey(userId, idempotencyKey);
    const existing = this.records.get(key);
    if (existing) {
      existing.status = 'completed';
      existing.responsePayload = response;
    }
  }

  /**
   * Releases or records failure for an idempotent slot.
   */
  public async recordFailure(
    userId: string,
    idempotencyKey: string,
    errorResponse?: ProductionErrorResponse
  ) {
    const key = this.makeKey(userId, idempotencyKey);
    const existing = this.records.get(key);
    if (existing) {
      existing.status = 'failed';
      existing.errorPayload = errorResponse;
    }
  }

  public reset() {
    this.records.clear();
  }
}
