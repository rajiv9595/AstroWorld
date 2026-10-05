/**
 * ASTROWORLD AI V2 — Typed Production API Client
 *
 * Authentication is provided by the backend's HttpOnly session cookie.
 * This client never sends a user id as an authorization credential.
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

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  public setUserId(_userId: string): void {
    // Backward-compatible no-op. Authorization is never derived from client user ids.
  }

  public getUserId(): string {
    return '';
  }

  public static mapErrorToUserMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'That question could not be processed. Please rephrase or provide more details.';
      case 401:
        return 'Your consultation session has expired. Please sign in again.';
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

  private async parseResponse(res: Response): Promise<any> {
    return res.json().catch(() => null);
  }

  public async consult(
    req: ClientConsultRequest,
    abortSignal?: AbortSignal,
  ): Promise<ClientConsultResponse> {
    const idempotencyKey =
      req.idempotencyKey || ('idem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'idempotency-key': idempotencyKey,
    };

    const payload = {
      conversationId: req.conversationId,
      userMessage: req.userMessage,
      birthProfile: req.birthProfile,
      idempotencyKey,
      clientTurnId: req.clientTurnId || ('turn_' + Date.now()),
      executionMode: req.executionMode || 'production',
      consultationContext: req.consultationContext,
      locale: req.locale || 'en-US',
      timezone: req.timezone || req.birthProfile.timezone,
    };

    const res = await fetch(this.baseUrl + '/api/ai-v2/v1/consult', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(payload),
      signal: abortSignal,
    });

    const data = await this.parseResponse(res);

    if (!res.ok || !data?.success) {
      const statusCode = res.status;
      const errorCode = data?.errorCode || 'API_ERROR';
      const userMessage = data?.userMessage || AIApiClient.mapErrorToUserMessage(statusCode);
      const isRetryable = [429, 502, 503, 504].includes(statusCode);
      const retryAfterSeconds =
        data?.retryAfterSeconds ||
        (res.headers.get('Retry-After') ? Number(res.headers.get('Retry-After')) : undefined);

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

  public async listMemories(): Promise<UserMemoryItem[]> {
    const res = await fetch(this.baseUrl + '/api/ai-v2/memory', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to list memories (HTTP ' + res.status + ').');
    const data = await this.parseResponse(res);
    return Array.isArray(data?.memories) ? data.memories : [];
  }

  public async getMemorySummary(): Promise<string> {
    const res = await fetch(this.baseUrl + '/api/ai-v2/memory/summary', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return '';
    const data = await this.parseResponse(res);
    return data?.summary || '';
  }

  public async deleteMemory(memoryId: string): Promise<boolean> {
    const res = await fetch(this.baseUrl + '/api/ai-v2/memory/' + encodeURIComponent(memoryId), {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    return res.ok;
  }

  public async clearAllMemories(): Promise<number> {
    const res = await fetch(this.baseUrl + '/api/ai-v2/memory', {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error('Failed to clear memories (HTTP ' + res.status + ').');
    const data = await this.parseResponse(res);
    return Number(data?.clearedCount || 0);
  }

  public async listConversations(): Promise<ConversationSummary[]> {
    const res = await fetch(this.baseUrl + '/api/ai-v2/conversations', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return [];
    const data = await this.parseResponse(res);
    return Array.isArray(data?.conversations) ? data.conversations : [];
  }

  public async deleteConversation(conversationId: string): Promise<boolean> {
    const res = await fetch(
      this.baseUrl + '/api/ai-v2/conversations/' + encodeURIComponent(conversationId),
      {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      },
    );

    return res.ok;
  }
}

export const aiApiClient = new AIApiClient();
