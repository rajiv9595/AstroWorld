/**
 * ASTROWORLD AI V2 — Durable Conversation Persistence
 *
 * Production state store for conversation state and compact turns.
 * Supabase/PostgreSQL is authoritative when configured; callers may still
 * inject a compatible client for deterministic tests.
 */

import { supabase as defaultSupabase, isSupabaseConfigured } from '../../services/supabaseService.ts';
import {
  ConversationState,
  ConversationTurn,
  validateConversationState,
} from './conversationStateTypes.ts';

export interface StoredConversation {
  state: ConversationState;
  turns: ConversationTurn[];
  stateVersion: number;
}

export interface ConversationSummary {
  conversationId: string;
  title: string;
  domain: string;
  lastActivityIso: string;
  turnCount: number;
  preview: string;
}

type QueryClient = any;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPostgresUuid(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export class ConversationPersistenceRepository {
  private client: QueryClient;
  private configured: boolean;

  constructor(options?: { supabaseClient?: QueryClient; configured?: boolean }) {
    this.client = options?.supabaseClient || defaultSupabase;
    this.configured = options?.configured ?? isSupabaseConfigured;
  }

  public isEnabled(): boolean {
    return this.configured;
  }

  private canQueryRemote(userId: string): boolean {
    if (!this.configured) return false;
    // Real Supabase PostgreSQL enforces UUID foreign keys referencing auth.users.
    // Non-UUID identities (e.g. mock 'default_user') cannot exist in production UUID columns.
    if (this.client === defaultSupabase && !isPostgresUuid(userId)) {
      return false;
    }
    return true;
  }

  public async load(userId: string, conversationId: string): Promise<StoredConversation | null> {
    this.assertIdentity(userId, conversationId);
    if (!this.canQueryRemote(userId)) return null;

    const conversationResult = await this.client
      .from('conversations')
      .select('id,user_id,title,status,state_version,state_payload')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (conversationResult.error) {
      throw new Error(`Conversation load failed: ${conversationResult.error.message}`);
    }
    if (!conversationResult.data) return null;

    const messagesResult = await this.client
      .from('conversation_messages')
      .select('turn_index,turn_payload,user_id,conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('turn_index', { ascending: true });

    if (messagesResult.error) {
      throw new Error(`Conversation turn load failed: ${messagesResult.error.message}`);
    }

    const state = conversationResult.data.state_payload as ConversationState | null;
    if (!state) return null;

    const validation = validateConversationState(state);
    if (!validation.valid) {
      throw new Error(`Persisted ConversationState is invalid: ${validation.errors.join('; ')}`);
    }

    return {
      state,
      turns: (messagesResult.data || [])
        .map((row: any) => {
          const payload = (row.turn_payload || {}) as ConversationTurn;
          if (!payload.fullAnswer && row.content) {
            payload.fullAnswer = row.content;
          }
          return payload;
        })
        .filter(Boolean) as ConversationTurn[],
      stateVersion: Number(conversationResult.data.state_version || state.stateVersion),
    };
  }

  public async save(
    userId: string,
    state: ConversationState,
    newTurn?: ConversationTurn,
  ): Promise<void> {
    this.assertIdentity(userId, state.conversationId);
    const validation = validateConversationState(state);
    if (!validation.valid) {
      throw new Error(`Cannot persist invalid ConversationState: ${validation.errors.join('; ')}`);
    }
    if (!this.canQueryRemote(userId)) return;

    const nextVersion = state.stateVersion;
    const title = state.currentTopic || 'AstroWorld Consultation';

    const existing = await this.client
      .from('conversations')
      .select('id,state_version')
      .eq('id', state.conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing.error) {
      throw new Error(`Conversation ownership check failed: ${existing.error.message}`);
    }

    if (!existing.data) {
      const created = await this.client
        .from('conversations')
        .insert({
          id: state.conversationId,
          user_id: userId,
          title,
          status: 'active',
          state_version: nextVersion,
          state_payload: state,
          created_at: state.createdAtIso,
          updated_at: state.updatedAtIso,
        })
        .select('id')
        .single();

      if (created.error) {
        throw new Error(`Conversation create failed: ${created.error.message}`);
      }
    } else {
      const currentVersion = Number(existing.data.state_version || 0);
      if (currentVersion !== nextVersion - 1 && currentVersion !== nextVersion) {
        throw new Error(
          `Conversation state version conflict: stored=${currentVersion}, requested=${nextVersion - 1}`,
        );
      }

      if (currentVersion !== nextVersion) {
        const updated = await this.client
          .from('conversations')
          .update({
            title,
            state_version: nextVersion,
            state_payload: state,
            updated_at: state.updatedAtIso,
          })
          .eq('id', state.conversationId)
          .eq('user_id', userId)
          .eq('state_version', currentVersion)
          .select('id')
          .maybeSingle();

        if (updated.error) {
          throw new Error(`Conversation state update failed: ${updated.error.message}`);
        }
        if (!updated.data) {
          throw new Error('Conversation state update lost optimistic-concurrency race.');
        }
      }
    }

    if (newTurn) {
      const inserted = await this.client
        .from('conversation_messages')
        .insert({
          id: newTurn.turnId,
          conversation_id: state.conversationId,
          user_id: userId,
          role: 'assistant',
          content: newTurn.fullAnswer || newTurn.answerSummary?.mainConclusion || '',
          turn_index: newTurn.turnIndex,
          turn_payload: newTurn,
          created_at: newTurn.createdAt,
        });

      if (inserted.error) {
        throw new Error(`Conversation turn persistence failed: ${inserted.error.message}`);
      }
    }
  }

  public async getOwner(conversationId: string): Promise<string | null> {
    if (!conversationId || typeof conversationId !== 'string') return null;
    if (!this.configured) return null;

    try {
      const result = await this.client
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (result.error || !result.data) return null;
      return (result.data.user_id as string) || null;
    } catch {
      return null;
    }
  }

  public async owns(userId: string, conversationId: string): Promise<boolean> {
    this.assertIdentity(userId, conversationId);
    if (!this.canQueryRemote(userId)) return false;

    const result = await this.client
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error) throw new Error(`Conversation ownership lookup failed: ${result.error.message}`);
    return Boolean(result.data);
  }

  public async listOwned(userId: string): Promise<string[]> {
    if (!userId || typeof userId !== 'string') throw new Error('Access denied: userId is required.');
    if (!this.canQueryRemote(userId)) return [];

    const result = await this.client
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (result.error) throw new Error(`Conversation list failed: ${result.error.message}`);
    return (result.data || []).map((row: any) => row.id).filter(Boolean);
  }

  public async listSummaries(userId: string): Promise<ConversationSummary[]> {
    if (!userId || typeof userId !== 'string') throw new Error('Access denied: userId is required.');
    if (!this.canQueryRemote(userId)) return [];

    const result = await this.client
      .from('conversations')
      .select('id, title, status, state_payload, created_at, updated_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (result.error) throw new Error(`Conversation summaries failed: ${result.error.message}`);

    return (result.data || []).map((row: any) => {
      const state = row.state_payload as ConversationState | null;
      return {
        conversationId: row.id,
        title: row.title || state?.currentTopic || 'Astrological Consultation',
        domain: state?.currentDomain || 'general',
        lastActivityIso: row.updated_at || row.created_at || new Date().toISOString(),
        turnCount: state?.turnIndex || 1,
        preview: state?.lastAnswerSummary?.mainConclusion?.slice(0, 120) || 'Active consultation',
      };
    });
  }

  public async delete(userId: string, conversationId: string): Promise<boolean> {
    this.assertIdentity(userId, conversationId);
    if (!this.canQueryRemote(userId)) return false;

    const result = await this.client
      .from('conversations')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .select('id')
      .maybeSingle();

    if (result.error) throw new Error(`Conversation delete failed: ${result.error.message}`);
    return Boolean(result.data);
  }

  private assertIdentity(userId: string, conversationId: string): void {
    if (!userId || typeof userId !== 'string') throw new Error('Access denied: userId is required.');
    if (!conversationId || typeof conversationId !== 'string') throw new Error('conversationId is required.');
  }
}
