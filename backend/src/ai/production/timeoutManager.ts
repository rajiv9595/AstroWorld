/**
 * ASTROWORLD AI V2 — Timeout & Deadline Manager
 * Enforces hierarchical component deadlines and overall consultation timeouts.
 */

import { ProductionError } from './productionErrors.ts';

export interface TimeoutConfig {
  totalConsultationMs: number;
  geminiRequestMs: number;
  geminiFallbackRequestMs: number;
  geminiRepairRequestMs: number;
  toolExecutionMs: number;
  memoryLookupMs: number;
  ragLookupMs: number;
  reasoningMs: number;
  databaseMs: number;
}

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  totalConsultationMs: 15000,
  geminiRequestMs: 8000,
  geminiFallbackRequestMs: 6000,
  geminiRepairRequestMs: 4000,
  toolExecutionMs: 3000,
  memoryLookupMs: 1500,
  ragLookupMs: 1500,
  reasoningMs: 2000,
  databaseMs: 1500,
};

export class TimeoutManager {
  private config: TimeoutConfig;

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = { ...DEFAULT_TIMEOUT_CONFIG, ...config };
  }

  /**
   * Wraps an asynchronous operation with an explicit timeout limit.
   */
  public async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string,
    isModelOperation: boolean = false
  ): Promise<T> {
    if (timeoutMs <= 0) {
      const errorCode = isModelOperation ? 'MODEL_TIMEOUT' : 'INTERNAL_ERROR';
      throw new ProductionError({
        errorCode,
        userMessage: isModelOperation
          ? 'The AI consultation timed out. Please retry your inquiry.'
          : `Operation "${operationName}" timed out after ${timeoutMs}ms.`,
        internalDetails: `TimeoutExceeded: ${operationName} exceeded ${timeoutMs}ms deadline.`,
      });
    }

    let timer: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const errorCode = isModelOperation ? 'MODEL_TIMEOUT' : 'INTERNAL_ERROR';
        reject(
          new ProductionError({
            errorCode,
            userMessage: isModelOperation
              ? 'The AI consultation timed out. Please retry your inquiry.'
              : `Operation "${operationName}" timed out after ${timeoutMs}ms.`,
            internalDetails: `TimeoutExceeded: ${operationName} exceeded ${timeoutMs}ms deadline.`,
          })
        );
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  public getConfig(): TimeoutConfig {
    return { ...this.config };
  }
}
