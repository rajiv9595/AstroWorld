/**
 * ASTROWORLD AI V2 — Chaos & Failure Injection Manager
 * Enables controlled, deterministic failure injection for testing safe degradation.
 */

export interface ChaosConfig {
  injectGeminiTimeout?: boolean;
  injectGeminiRateLimit?: boolean;
  injectGeminiError?: boolean;
  injectDatabaseTimeout?: boolean;
  injectMemoryError?: boolean;
  injectToolError?: boolean;
  injectRagError?: boolean;
  injectReasonerError?: boolean;
  injectValidatorFailure?: boolean;
}

export class ChaosManager {
  private static instance: ChaosManager;
  private config: ChaosConfig = {};

  public static getInstance(): ChaosManager {
    if (!this.instance) {
      this.instance = new ChaosManager();
    }
    return this.instance;
  }

  public setConfig(config: ChaosConfig) {
    this.config = { ...config };
  }

  public getConfig(): ChaosConfig {
    return { ...this.config };
  }

  public reset() {
    this.config = {};
  }

  public checkFault(fault: keyof ChaosConfig) {
    if (this.config[fault]) {
      if (fault === 'injectGeminiTimeout') {
        const err = new Error('Gemini API request timed out');
        (err as any).code = 'ETIMEDOUT';
        (err as any).status = 504;
        throw err;
      }
      if (fault === 'injectGeminiRateLimit') {
        const err = new Error('ResourceExhausted: 429 Rate limit exceeded');
        (err as any).status = 429;
        throw err;
      }
      if (fault === 'injectGeminiError') {
        const err = new Error('Gemini model 500 Internal Server Error');
        (err as any).status = 502;
        throw err;
      }
      if (fault === 'injectDatabaseTimeout') {
        throw new Error('DatabaseConnectionTimeout: Postgres connection timed out');
      }
      if (fault === 'injectMemoryError') {
        throw new Error('MemoryRepositoryUnavailable: Failed to connect to memory store');
      }
      if (fault === 'injectToolError') {
        throw new Error('EphemerisToolExecutionError: Failed to calculate planetary positions');
      }
      if (fault === 'injectRagError') {
        throw new Error('ClassicalRAGCorrupted: Vector store index unavailable');
      }
      if (fault === 'injectReasonerError') {
        throw new Error('AstrologyReasonerCrash: synthesis exception');
      }
      if (fault === 'injectValidatorFailure') {
        throw new Error('PostResponseGroundingValidatorFailed: claim unverified');
      }
    }
  }
}
