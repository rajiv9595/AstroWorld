/**
 * ASTROWORLD AI V2 — Persistent Memory Repository
 * Deterministic relational storage layer for consultation memories.
 * Strictly enforces authenticated user isolation: cross-user access is impossible.
 */

import {
  PersistentMemory,
  MemoryFilterOptions,
  validatePersistentMemory,
} from './persistentMemoryTypes.ts';

export interface IPersistentMemoryRepository {
  save(memory: PersistentMemory): Promise<PersistentMemory>;
  getById(userId: string, memoryId: string): Promise<PersistentMemory | undefined>;
  find(options: MemoryFilterOptions): Promise<PersistentMemory[]>;
  update(userId: string, memoryId: string, updates: Partial<PersistentMemory>): Promise<PersistentMemory | undefined>;
  delete(userId: string, memoryId: string): Promise<boolean>;
  clearUser(userId: string): Promise<number>;
  supersede(userId: string, oldMemoryId: string, newMemoryId: string): Promise<void>;
  count(userId: string): Promise<number>;
}

export class InMemoryPersistentMemoryRepository implements IPersistentMemoryRepository {
  // Store partitioned strictly by userId: userId -> (memoryId -> PersistentMemory)
  private userStores: Map<string, Map<string, PersistentMemory>> = new Map();

  private getUserStore(userId: string): Map<string, PersistentMemory> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Access denied: userId must be a non-empty string');
    }
    let store = this.userStores.get(userId);
    if (!store) {
      store = new Map<string, PersistentMemory>();
      this.userStores.set(userId, store);
    }
    return store;
  }

  public async save(memory: PersistentMemory): Promise<PersistentMemory> {
    const validation = validatePersistentMemory(memory);
    if (!validation.valid) {
      throw new Error(`Cannot persist invalid memory: ${validation.errors.join('; ')}`);
    }

    const store = this.getUserStore(memory.userId);
    const cloned = JSON.parse(JSON.stringify(memory));
    store.set(memory.memoryId, cloned);
    return JSON.parse(JSON.stringify(cloned));
  }

  public async getById(userId: string, memoryId: string): Promise<PersistentMemory | undefined> {
    const store = this.getUserStore(userId);
    const mem = store.get(memoryId);
    if (!mem) return undefined;
    return JSON.parse(JSON.stringify(mem));
  }

  public async find(options: MemoryFilterOptions): Promise<PersistentMemory[]> {
    const store = this.getUserStore(options.userId);
    let results: PersistentMemory[] = [];

    const allowedStatuses: string[] = options.status
      ? Array.isArray(options.status)
        ? options.status
        : [options.status]
      : ['active'];

    for (const mem of store.values()) {
      // Status filtering
      if (!allowedStatuses.includes(mem.status)) {
        continue;
      }

      // Category filtering
      if (options.categories && options.categories.length > 0) {
        if (!options.categories.includes(mem.category)) {
          continue;
        }
      }

      // Key filtering
      if (options.keys && options.keys.length > 0) {
        if (!options.keys.includes(mem.key)) {
          continue;
        }
      }

      // Domain/Topic tag filtering
      if (options.domain) {
        const domLower = options.domain.toLowerCase();
        const matchesDomain =
          mem.tags.some(t => t.toLowerCase() === domLower) ||
          mem.key.toLowerCase().includes(domLower) ||
          mem.value.toLowerCase().includes(domLower);
        if (!matchesDomain) continue;
      }

      if (options.topic) {
        const topLower = options.topic.toLowerCase();
        const matchesTopic =
          mem.tags.some(t => t.toLowerCase().includes(topLower)) ||
          mem.value.toLowerCase().includes(topLower);
        if (!matchesTopic) continue;
      }

      // Expiration check
      if (!options.includeExpired && mem.expiresAt) {
        const expiresTime = new Date(mem.expiresAt).getTime();
        if (Date.now() > expiresTime) {
          continue;
        }
      }

      results.push(JSON.parse(JSON.stringify(mem)));
    }

    // Sort by updatedAt descending (recency)
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply offset and limit
    if (options.offset && options.offset > 0) {
      results = results.slice(options.offset);
    }
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  public async update(
    userId: string,
    memoryId: string,
    updates: Partial<PersistentMemory>
  ): Promise<PersistentMemory | undefined> {
    const store = this.getUserStore(userId);
    const existing = store.get(memoryId);
    if (!existing) return undefined;

    const updated: PersistentMemory = {
      ...existing,
      ...updates,
      memoryId: existing.memoryId, // Immutable identity
      userId: existing.userId,     // Immutable identity
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    store.set(memoryId, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  public async delete(userId: string, memoryId: string): Promise<boolean> {
    const store = this.getUserStore(userId);
    const existing = store.get(memoryId);
    if (!existing) return false;
    store.delete(memoryId);
    return true;
  }

  public async clearUser(userId: string): Promise<number> {
    const store = this.getUserStore(userId);
    const count = store.size;
    store.clear();
    return count;
  }

  public async supersede(userId: string, oldMemoryId: string, newMemoryId: string): Promise<void> {
    const store = this.getUserStore(userId);
    const oldMem = store.get(oldMemoryId);
    const newMem = store.get(newMemoryId);

    if (oldMem) {
      oldMem.status = 'superseded';
      oldMem.supersededByMemoryId = newMemoryId;
      oldMem.updatedAt = new Date().toISOString();
      oldMem.version += 1;
    }

    if (newMem) {
      newMem.supersedesMemoryId = oldMemoryId;
      newMem.updatedAt = new Date().toISOString();
      newMem.version += 1;
    }
  }

  public async count(userId: string): Promise<number> {
    const store = this.getUserStore(userId);
    return store.size;
  }

  /**
   * Diagnostic / test helper
   */
  public reset(): void {
    this.userStores.clear();
  }
}
