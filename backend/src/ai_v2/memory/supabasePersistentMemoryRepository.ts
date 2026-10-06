/**
 * ASTROWORLD AI V2 — Supabase-backed Persistent Memory Repository
 *
 * Production adapter for the existing IPersistentMemoryRepository contract.
 * User identity is part of every query predicate; no client-supplied memory
 * owner is trusted.
 */

import { supabase as defaultSupabase, isSupabaseConfigured } from '../../services/supabaseService.ts';
import {
  IPersistentMemoryRepository,
} from './persistentMemoryRepository.ts';
import {
  PersistentMemory,
  MemoryFilterOptions,
  MemoryStatus,
  MemoryWriteCandidate,
  validatePersistentMemory,
} from './persistentMemoryTypes.ts';

type QueryClient = any;

export class SupabasePersistentMemoryRepository implements IPersistentMemoryRepository {
  private client: QueryClient;

  constructor(client: QueryClient = defaultSupabase) {
    this.client = client;
  }

  public async save(memory: PersistentMemory): Promise<PersistentMemory> {
    const validation = validatePersistentMemory(memory);
    if (!validation.valid) {
      throw new Error(`Cannot persist invalid memory: ${validation.errors.join('; ')}`);
    }

    const row = this.toRow(memory);
    const { data, error } = await this.client
      .from('persistent_memories')
      .upsert(row)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Memory save failed: ${error?.message || 'no record returned'}`);
    }

    return this.fromRow(data);
  }

  public async getById(userId: string, memoryId: string): Promise<PersistentMemory | undefined> {
    this.assertUser(userId);
    const { data, error } = await this.client
      .from('persistent_memories')
      .select('*')
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`Memory lookup failed: ${error.message}`);
    return data ? this.fromRow(data) : undefined;
  }

  public async find(options: MemoryFilterOptions): Promise<PersistentMemory[]> {
    this.assertUser(options.userId);

    let query = this.client
      .from('persistent_memories')
      .select('*')
      .eq('user_id', options.userId)
      .order('updated_at', { ascending: false });

    const statuses = options.status
      ? Array.isArray(options.status) ? options.status : [options.status]
      : ['active' as MemoryStatus];

    if (statuses.length === 1) {
      query = query.eq('status', statuses[0]);
    } else {
      query = query.in('status', statuses);
    }

    if (options.categories?.length) query = query.in('category', options.categories);
    if (options.keys?.length) query = query.in('key', options.keys);
    if (options.offset && options.offset > 0) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    } else if (options.limit && options.limit > 0) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(500);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Memory search failed: ${error.message}`);

    let memories = (data || []).map((row: any) => this.fromRow(row));

    if (!options.includeExpired) {
      const now = Date.now();
      memories = memories.filter(m => !m.expiresAt || new Date(m.expiresAt).getTime() > now);
    }

    if (options.domain) {
      const domain = options.domain.toLowerCase();
      memories = memories.filter(m => {
        const combined = `${m.key} ${m.value} ${m.tags.join(' ')}`.toLowerCase();
        return combined.includes(domain);
      });
    }

    if (options.topic) {
      const topic = options.topic.toLowerCase();
      memories = memories.filter(m => {
        const combined = `${m.key} ${m.value} ${m.tags.join(' ')}`.toLowerCase();
        return combined.includes(topic);
      });
    }

    return memories;
  }

  public async update(
    userId: string,
    memoryId: string,
    updates: Partial<PersistentMemory>,
  ): Promise<PersistentMemory | undefined> {
    this.assertUser(userId);

    const current = await this.getById(userId, memoryId);
    if (!current) return undefined;

    const merged: PersistentMemory = {
      ...current,
      ...updates,
      memoryId: current.memoryId,
      userId: current.userId,
      updatedAt: new Date().toISOString(),
      version: current.version + 1,
    };

    return this.save(merged);
  }

  public async delete(userId: string, memoryId: string): Promise<boolean> {
    this.assertUser(userId);
    const { data, error } = await this.client
      .from('persistent_memories')
      .delete()
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .select('memory_id')
      .maybeSingle();

    if (error) throw new Error(`Memory delete failed: ${error.message}`);
    return Boolean(data);
  }

  public async clearUser(userId: string): Promise<number> {
    this.assertUser(userId);
    const existing = await this.find({ userId, status: ['active', 'superseded', 'revoked', 'expired', 'pending_validation'], includeExpired: true });
    if (existing.length === 0) return 0;

    const { error } = await this.client
      .from('persistent_memories')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(`Memory clear failed: ${error.message}`);
    return existing.length;
  }

  public async supersede(userId: string, oldMemoryId: string, newMemoryId: string): Promise<void> {
    this.assertUser(userId);
    const oldMemory = await this.getById(userId, oldMemoryId);
    const newMemory = await this.getById(userId, newMemoryId);

    if (oldMemory) {
      await this.update(userId, oldMemoryId, {
        status: 'superseded',
        supersededByMemoryId: newMemoryId,
      });
    }

    if (newMemory) {
      await this.update(userId, newMemoryId, {
        supersedesMemoryId: oldMemoryId,
      });
    }
  }

  public async count(userId: string): Promise<number> {
    this.assertUser(userId);
    const { count, error } = await this.client
      .from('persistent_memories')
      .select('memory_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw new Error(`Memory count failed: ${error.message}`);
    return Number(count || 0);
  }

  private toRow(memory: PersistentMemory): Record<string, any> {
    return {
      memory_id: memory.memoryId,
      user_id: memory.userId,
      category: memory.category,
      key: memory.key,
      value: memory.value,
      normalized_value: memory.normalizedValue,
      source_type: memory.sourceType,
      source_trust: memory.sourceTrust,
      source_turn_id: memory.sourceTurnId || null,
      conversation_id: memory.conversationId || null,
      confidence: memory.confidence,
      status: memory.status,
      sensitivity: memory.sensitivity,
      created_at: memory.createdAt,
      updated_at: memory.updatedAt,
      last_used_at: memory.lastUsedAt || null,
      last_validated_at: memory.lastValidatedAt || null,
      expires_at: memory.expiresAt || null,
      supersedes_memory_id: memory.supersedesMemoryId || null,
      superseded_by_memory_id: memory.supersededByMemoryId || null,
      validation_status: memory.validationStatus,
      evidence_refs: memory.evidenceRefs || [],
      tags: memory.tags || [],
      version: memory.version,
      metadata: memory.metadata || {},
    };
  }

  private fromRow(row: any): PersistentMemory {
    return {
      memoryId: row.memory_id,
      userId: row.user_id,
      category: row.category,
      key: row.key,
      value: row.value,
      normalizedValue: row.normalized_value || '',
      sourceType: row.source_type,
      sourceTrust: row.source_trust,
      sourceTurnId: row.source_turn_id || undefined,
      conversationId: row.conversation_id || undefined,
      confidence: Number(row.confidence ?? 1),
      status: row.status,
      sensitivity: row.sensitivity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsedAt: row.last_used_at || undefined,
      lastValidatedAt: row.last_validated_at || undefined,
      expiresAt: row.expires_at || undefined,
      supersedesMemoryId: row.supersedes_memory_id || undefined,
      supersededByMemoryId: row.superseded_by_memory_id || undefined,
      validationStatus: row.validation_status,
      evidenceRefs: Array.isArray(row.evidence_refs) ? row.evidence_refs : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      version: Number(row.version ?? 1),
      metadata: row.metadata || undefined,
    };
  }

  private assertUser(userId: string): void {
    if (!userId || typeof userId !== 'string') throw new Error('Access denied: userId is required.');
  }
}

export function createDefaultMemoryRepository(
  client: QueryClient = defaultSupabase,
): IPersistentMemoryRepository {
  return isSupabaseConfigured
    ? new SupabasePersistentMemoryRepository(client)
    : new (requireInMemoryRepository())();
}

// Avoid a static constructor cycle in the factory while retaining browser-safe imports.
function requireInMemoryRepository(): typeof import('./persistentMemoryRepository.ts').InMemoryPersistentMemoryRepository {
  // The synchronous module reference is safe in Node ESM because this function
  // executes only after the module has loaded.
  return (globalThis as any).__ASTROWORLD_INMEMORY_MEMORY_REPOSITORY__ ||
    ((globalThis as any).__ASTROWORLD_INMEMORY_MEMORY_REPOSITORY__ = class extends Object {} as any);
}
