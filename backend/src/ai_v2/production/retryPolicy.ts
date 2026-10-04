/**
 * ASTROWORLD AI V2 — Bounded Retry Policy with Exponential Backoff & Jitter
 * Retries only transient, recoverable errors without creating retry storms.
 */

import { ProductionError } from './productionErrors.ts';
import { ProductionLogger } from './productionLogger.ts';

export interface RetryPolicyConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  jitterFactor: number; // 0.2 = ±20%
}

export const DEFAULT_RETRY_CONFIG: RetryPolicyConfig = {
  maxRetries: 2, // 3 attempts total
  initialDelayMs: 200,
  maxDelayMs: 1500,
  backoffFactor: 2,
  jitterFactor: 0.2,
};

export class RetryPolicy {
  private config: RetryPolicyConfig;

  constructor(config: Partial<RetryPolicyConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Executes an operation with bounded exponential backoff.
   */
  public async execute<T>(
    operation: (attempt: number) => Promise<T>,
    operationName: string,
    onRetry?: (error: any, attempt: number, delayMs: number) => void
  ): Promise<{ result: T; attempts: number }> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        const result = await operation(attempt);
        return { result, attempts: attempt };
      } catch (err: any) {
        lastError = err;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(err);
        if (!isRetryable || attempt > this.config.maxRetries) {
          throw err;
        }

        // Calculate backoff delay with jitter
        const baseDelay = Math.min(
          this.config.initialDelayMs * Math.pow(this.config.backoffFactor, attempt - 1),
          this.config.maxDelayMs
        );
        const jitter = baseDelay * this.config.jitterFactor * (Math.random() * 2 - 1);
        const delayMs = Math.max(10, Math.floor(baseDelay + jitter));

        ProductionLogger.warn(`[RetryPolicy] Transient failure on ${operationName} (attempt ${attempt}/${this.config.maxRetries + 1}). Retrying in ${delayMs}ms...`, {
          operationName,
          attempt,
          delayMs,
          error: err?.message || String(err),
        });

        if (onRetry) {
          onRetry(err, attempt, delayMs);
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  public isRetryableError(err: any): boolean {
    if (err instanceof ProductionError) {
      return err.isRetryable;
    }
    const msg = String(err?.message || err || '').toLowerCase();
    const status = err?.status || err?.statusCode || err?.code;

    if (status === 429 || status === 502 || status === 503 || status === 504) {
      return true;
    }

    if (
      msg.includes('rate limit') ||
      msg.includes('resource exhausted') ||
      msg.includes('quota') ||
      msg.includes('timeout') ||
      msg.includes('timed out') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('service unavailable') ||
      msg.includes('overloaded')
    ) {
      return true;
    }

    return false;
  }
}
