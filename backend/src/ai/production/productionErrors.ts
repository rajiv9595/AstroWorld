/**
 * ASTROWORLD AI V2 — Production Error Taxonomy
 * Explicit error codes, HTTP status mapping, and sanitized user-facing messages.
 */

import { ProductionErrorCode } from './productionTypes.ts';

export const ERROR_STATUS_MAP: Record<ProductionErrorCode, number> = {
  CLIENT_VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  CONVERSATION_NOT_FOUND: 404,
  CONVERSATION_OWNERSHIP_ERROR: 403,
  ASTROLOGY_INPUT_ERROR: 422,
  TOOL_EXECUTION_ERROR: 502,
  KNOWLEDGE_RETRIEVAL_ERROR: 502,
  REASONING_ERROR: 500,
  MEMORY_ERROR: 500,
  MODEL_TIMEOUT: 504,
  MODEL_RATE_LIMIT: 429,
  MODEL_PROVIDER_ERROR: 502,
  MODEL_UNAVAILABLE: 503,
  RATE_LIMIT_EXCEEDED: 429,
  REQUEST_TOO_LARGE: 413,
  CONCURRENCY_CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export const DEFAULT_USER_MESSAGES: Record<ProductionErrorCode, string> = {
  CLIENT_VALIDATION_ERROR: 'The consultation request contained invalid or missing fields. Please check your query and birth details.',
  AUTHENTICATION_ERROR: 'Authentication required. Please sign in to continue your consultation.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this consultation action.',
  CONVERSATION_NOT_FOUND: 'The specified consultation conversation could not be found.',
  CONVERSATION_OWNERSHIP_ERROR: 'You cannot access or modify a consultation session belonging to another user.',
  ASTROLOGY_INPUT_ERROR: 'The provided birth profile contains invalid dates, coordinates, or time parameters for astrological calculation.',
  TOOL_EXECUTION_ERROR: 'A temporary issue occurred while calculating planetary positions. Please retry your question.',
  KNOWLEDGE_RETRIEVAL_ERROR: 'A temporary issue occurred while referencing classical astrological texts. Please retry.',
  REASONING_ERROR: 'A temporary issue occurred during chart synthesis. Please retry your inquiry.',
  MEMORY_ERROR: 'A temporary issue occurred in the consultation memory subsystem.',
  MODEL_TIMEOUT: 'The consultation synthesis timed out. Please try asking your question again in a moment.',
  MODEL_RATE_LIMIT: 'Our astrology AI service is experiencing high traffic. Please wait a few moments before sending your next inquiry.',
  MODEL_PROVIDER_ERROR: 'A temporary issue occurred with the AI provider. Please retry your question.',
  MODEL_UNAVAILABLE: 'The AI consultation service is temporarily undergoing maintenance. Please try again shortly.',
  RATE_LIMIT_EXCEEDED: 'You have exceeded the allowed number of consultation queries for this window. Please wait a moment.',
  REQUEST_TOO_LARGE: 'Your message or consultation context exceeds the maximum allowed length (2,000 characters).',
  CONCURRENCY_CONFLICT: 'Another turn in this conversation is currently being processed. Please wait for it to complete.',
  INTERNAL_ERROR: 'An unexpected internal error occurred during the consultation. Our engineering team has been notified.',
};

export class ProductionError extends Error {
  public readonly errorCode: ProductionErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly internalDetails?: string;
  public readonly retryAfterSeconds?: number;
  public readonly isRetryable: boolean;

  constructor(options: {
    errorCode: ProductionErrorCode;
    userMessage?: string;
    internalDetails?: string;
    retryAfterSeconds?: number;
    cause?: Error;
  }) {
    const userMsg = options.userMessage || DEFAULT_USER_MESSAGES[options.errorCode];
    super(options.internalDetails || userMsg);
    this.name = 'ProductionError';
    this.errorCode = options.errorCode;
    this.statusCode = ERROR_STATUS_MAP[options.errorCode] || 500;
    this.userMessage = userMsg;
    this.internalDetails = options.internalDetails;
    this.retryAfterSeconds = options.retryAfterSeconds;

    // Retryable classification
    this.isRetryable = [
      'MODEL_TIMEOUT',
      'MODEL_RATE_LIMIT',
      'MODEL_PROVIDER_ERROR',
      'MODEL_UNAVAILABLE',
      'TOOL_EXECUTION_ERROR',
      'KNOWLEDGE_RETRIEVAL_ERROR',
    ].includes(options.errorCode);

    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Sanitized payload for client HTTP responses.
   * Strips internal details, stack traces, and sensitive data.
   */
  public toClientResponse(requestId: string) {
    return {
      success: false as const,
      requestId,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      userMessage: this.userMessage,
      timestamp: new Date().toISOString(),
      ...(this.retryAfterSeconds ? { retryAfterSeconds: this.retryAfterSeconds } : {}),
    };
  }
}
