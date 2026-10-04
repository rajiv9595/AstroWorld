/**
 * ASTROWORLD AI V2 — Typed Production API Client
 * Authoritative client for canonical consultation API, persistent memory, and conversation history.
 */

import { BirthProfile } from '../engine/types.ts';

export interface ClientConsultRequest {
  userMessage: string;
  conversationId: string;
  birthProfile: BirthProfile;
  idempotencyKey?: string;
  clientTurnId?: string;
  executionMode?: 'production' | 'mock' | 'deterministic_ci';
  consultationContext?: Array<{ role: 'user' | 'model'; text: string }>;
  locale?: string;
  timezone?: string;
}

export interface ClientConsultResponse {
  success: boolean;
  requestId: string;
  conversationId: string;
  turnId: string;
  userResponse: {
    text: string;
    format: string;
    timestamp: string;
  };
  conversationMetadata: {
    conversationId: string;
    turnIndex: number;
    domain: string;
    topic: string;
    requiresClarification: boolean;
    activeDomainConfidence: number;
  };
  executionMetadata: {
    requestId: string;
    durationMs: number;
    modelUsed: string;
    cachedOrIdempotent?: boolean;
    retryCount: number;
  };
}

export interface UserMemoryItem {
  memoryId: string;
  category: 'USER_FACT' | 'USER_PREFERENCE' | 'CONSULTATION_THREAD' | 'ASSISTANT_CONCLUSION';
  key: string;
  value: string;
  sensitivity: 'normal' | 'sensitive';
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationSummary {
  conversationId: string;
  title: string;
  domain: string;
  lastActivityIso: string;
  turnCount: number;
  preview: string;
}

export interface ClientApiError {
  errorCode: string;
  statusCode: number;
  userMessage: string;
  isRetryable: boolean;
  retryAfterSeconds?: number;
}

export class AIApiClient {
  private baseUrl: string;
  private userId: string;

  constructor(baseUrl: string = '', userId: string = 'default_user') {
    this.baseUrl = baseUrl;
    this.userId = userId;
  }

  public setUserId(userId: string) {
    this.userId = userId || 'default_user';
  }

  public getUserId(): string {
    return this.userId;
  }

  /**
   * Translates HTTP status and error codes to user-friendly messages.
   */
  public static mapErrorToUserMessage(statusCode: number, errorCode?: string): string {
    switch (statusCode) {
      case 400:
        return 'That question could not be processed. Please rephrase or provide more details.';
      case 401:
        return 'Your consultation session has expired. Please refresh or sign in again.';
      case 403:
        return 'This consultation thread is not accessible from your account.';
      case 404:
        return 'The requested consultation could not be found.';
      case 409:
        return 'Another response is currently being prepared for this consultation. Please wait a moment.';
      case 413:
        return 'Your question is too long. Please shorten your message and try again.';
      case 422:
        return 'Some birth details appear invalid or out of range. Please review your birth chart profile.';
      case 429:
        return 'You are sending questions a bit too quickly. Please wait a few moments before trying again.';
      case 502:
      case 503:
        return 'The astrological calculation service is momentarily busy. Please try again.';
      case 504:
        return 'The consultation timed out. Please try sending your inquiry again.';
      default:
        return 'An unexpected issue occurred. Please try asking your question again.';
    }
  }

  /**
   * Executes a hardened consultation query via POST /api/ai-v2/v1/consult
   */
  public async consult(
    req: ClientConsultRequest,
    abortSignal?: AbortSignal
  ): Promise<ClientConsultResponse> {
    const idempotencyKey = req.idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
      'idempotency-key': idempotencyKey,
    };

    const payload = {
      conversationId: req.conversationId,
      userMessage: req.userMessage,
      birthProfile: req.birthProfile,
      idempotencyKey,
      clientTurnId: req.clientTurnId || `turn_${Date.now()}`,
      executionMode: req.executionMode || 'production',
      consultationContext: req.consultationContext,
      locale: req.locale || 'en-US',
      timezone: req.timezone || req.birthProfile.timezone,
    };

    const res = await fetch(`${this.baseUrl}/api/ai-v2/v1/consult`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: abortSignal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      const statusCode = res.status;
      const errorCode = data?.errorCode || 'API_ERROR';
      const userMessage = data?.userMessage || AIApiClient.mapErrorToUserMessage(statusCode, errorCode);
      const isRetryable = statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504;
      const retryAfterSeconds = data?.retryAfterSeconds || (res.headers.get('Retry-After') ? Number(res.headers.get('Retry-After')) : undefined);

      const err: ClientApiError = {
        errorCode,
        statusCode,
        userMessage,
        isRetryable,
        retryAfterSeconds,
      };

      throw err;
    }

    return data as ClientConsultResponse;
  }

  /**
   * Fetches the user's active memories via GET /api/ai-v2/memory
   */
  public async listMemories(): Promise<UserMemoryItem[]> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/memory`, {
      headers: { 'x-user-id': this.userId },
    });

    if (!res.ok) {
      throw new Error(`Failed to list memories (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data?.memories || [];
  }

  /**
   * Fetches a formatted human-readable memory summary via GET /api/ai-v2/memory/summary
   */
  public async getMemorySummary(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/memory/summary`, {
      headers: { 'x-user-id': this.userId },
    });

    if (!res.ok) {
      return '';
    }

    const data = await res.json();
    return data?.summary || '';
  }

  /**
   * Deletes a specific memory record via DELETE /api/ai-v2/memory/:id
   */
  public async deleteMemory(memoryId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/memory/${encodeURIComponent(memoryId)}`, {
      method: 'DELETE',
      headers: { 'x-user-id': this.userId },
    });

    return res.ok;
  }

  /**
   * Clears all stored memories for the user via DELETE /api/ai-v2/memory
   */
  public async clearAllMemories(): Promise<number> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/memory`, {
      method: 'DELETE',
      headers: { 'x-user-id': this.userId },
    });

    if (!res.ok) {
      throw new Error(`Failed to clear memories (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data?.clearedCount || 0;
  }

  /**
   * Lists previous consultation threads via GET /api/ai-v2/conversations
   */
  public async listConversations(): Promise<ConversationSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/conversations`, {
      headers: { 'x-user-id': this.userId },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data?.conversations || [];
  }

  /**
   * Deletes a specific conversation thread via DELETE /api/ai-v2/conversations/:id
   */
  public async deleteConversation(conversationId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/ai-v2/conversations/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE',
      headers: { 'x-user-id': this.userId },
    });

    return res.ok;
  }
}

export const aiApiClient = new AIApiClient();
