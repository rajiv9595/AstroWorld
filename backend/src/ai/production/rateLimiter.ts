/**
 * ASTROWORLD AI V2 — Multi-Tier Rate Limiter
 * Enforces per-user, per-conversation, and per-IP rate limiting windows.
 */

import { ProductionError } from './productionErrors.ts';

export interface RateLimitConfig {
  maxRequestsPerUserPerMinute: number;
  maxRequestsPerConversationPerMinute: number;
  maxRequestsPerIpPerMinute: number;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerUserPerMinute: 30,
  maxRequestsPerConversationPerMinute: 15,
  maxRequestsPerIpPerMinute: 60,
};

interface RateBucket {
  timestamps: number[];
}

export class RateLimiter {
  private userBuckets = new Map<string, RateBucket>();
  private conversationBuckets = new Map<string, RateBucket>();
  private ipBuckets = new Map<string, RateBucket>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
  }

  /**
   * Checks whether a request exceeds any rate limit tier. Throws ProductionError(RATE_LIMIT_EXCEEDED) if violated.
   */
  public checkRateLimit(options: {
    userId: string;
    conversationId?: string;
    ipAddress?: string;
  }) {
    const now = Date.now();
    const windowMs = 60 * 1000;

    const targets: Array<{
      store: Map<string, RateBucket>;
      key: string;
      limit: number;
      tierName: string;
      userMessage: string;
    }> = [];

    if (options.userId) {
      targets.push({
        store: this.userBuckets,
        key: options.userId,
        limit: this.config.maxRequestsPerUserPerMinute,
        tierName: 'user',
        userMessage: 'You have reached the maximum consultation rate (30 requests/minute). Please wait a moment.',
      });
    }

    if (options.conversationId) {
      targets.push({
        store: this.conversationBuckets,
        key: options.conversationId,
        limit: this.config.maxRequestsPerConversationPerMinute,
        tierName: 'conversation',
        userMessage: 'Too many rapid messages in this conversation. Please wait a moment before sending another query.',
      });
    }

    if (options.ipAddress) {
      targets.push({
        store: this.ipBuckets,
        key: options.ipAddress,
        limit: this.config.maxRequestsPerIpPerMinute,
        tierName: 'ip',
        userMessage: 'High request volume from your IP address. Please slow down.',
      });
    }

    // Step 1: Pre-check all limits
    for (const target of targets) {
      const check = this.peek(target.store, target.key, target.limit, now, windowMs);
      if (!check.allowed) {
        throw new ProductionError({
          errorCode: 'RATE_LIMIT_EXCEEDED',
          userMessage: target.userMessage,
          retryAfterSeconds: Math.ceil(check.retryAfterMs / 1000),
        });
      }
    }

    // Step 2: Commit usage across all targets
    for (const target of targets) {
      this.commit(target.store, target.key, now, windowMs);
    }
  }

  private peek(
    store: Map<string, RateBucket>,
    key: string,
    limit: number,
    now: number,
    windowMs: number
  ): { allowed: boolean; retryAfterMs: number } {
    const bucket = store.get(key);
    if (!bucket) {
      return { allowed: true, retryAfterMs: 0 };
    }

    const activeTimestamps = bucket.timestamps.filter(ts => now - ts < windowMs);
    if (activeTimestamps.length >= limit) {
      const oldest = activeTimestamps[0];
      const retryAfterMs = Math.max(1000, windowMs - (now - oldest));
      return { allowed: false, retryAfterMs };
    }

    return { allowed: true, retryAfterMs: 0 };
  }

  private commit(
    store: Map<string, RateBucket>,
    key: string,
    now: number,
    windowMs: number
  ) {
    let bucket = store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      store.set(key, bucket);
    }
    bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);
    bucket.timestamps.push(now);
  }

  public reset() {
    this.userBuckets.clear();
    this.conversationBuckets.clear();
    this.ipBuckets.clear();
  }
}
