/**
 * ASTROWORLD AI V2 — User Memory Service
 * High-level service layer managing user memory operations, privacy toggles,
 * API controllers, and human-facing summaries.
 */

import {
  PersistentMemory,
  MemoryFilterOptions,
  MemoryWriteCandidate,
} from './persistentMemoryTypes.ts';
import { IPersistentMemoryRepository } from './persistentMemoryRepository.ts';
import { createDefaultMemoryRepository } from './supabasePersistentMemoryRepository.ts';
import { MemoryWriteGate } from './memoryWriteGate.ts';
import { MemoryConsolidator } from './memoryConsolidator.ts';
import { MemoryCommandResolver } from './memoryCommandResolver.ts';

export class UserMemoryService {
  private repository: IPersistentMemoryRepository;
  private writeGate: MemoryWriteGate;
  private consolidator: MemoryConsolidator;
  private commandResolver: MemoryCommandResolver;
  private userEnabledMap: Map<string, boolean> = new Map();

  constructor(repository?: IPersistentMemoryRepository) {
    this.repository = repository || createDefaultMemoryRepository();
    this.writeGate = new MemoryWriteGate();
    this.consolidator = new MemoryConsolidator(this.repository);
    this.commandResolver = new MemoryCommandResolver(this.repository);
  }

  public getRepository(): IPersistentMemoryRepository {
    return this.repository;
  }

  public isMemoryEnabled(userId: string): boolean {
    return this.userEnabledMap.get(userId) ?? true;
  }

  public setMemoryEnabled(userId: string, enabled: boolean): void {
    this.userEnabledMap.set(userId, enabled);
  }

  public async listMemories(userId: string, options?: Partial<MemoryFilterOptions>): Promise<PersistentMemory[]> {
    if (!this.isMemoryEnabled(userId)) return [];
    return this.repository.find({
      userId,
      status: options?.status || 'active',
      categories: options?.categories,
      domain: options?.domain,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  public async getMemory(userId: string, memoryId: string): Promise<PersistentMemory | undefined> {
    return this.repository.getById(userId, memoryId);
  }

  public async createOrUpdateMemory(
    userId: string,
    candidate: MemoryWriteCandidate
  ): Promise<{ success: boolean; memory?: PersistentMemory; error?: string }> {
    if (!this.isMemoryEnabled(userId)) {
      return { success: false, error: 'Persistent memory is disabled for this user' };
    }

    const scopedCandidate = { ...candidate, userId };
    const decision = this.writeGate.evaluate(scopedCandidate);

    if (!decision.accepted) {
      return { success: false, error: decision.rejectionReason };
    }

    const outcome = await this.consolidator.consolidate(scopedCandidate, decision);
    return { success: true, memory: outcome.memory };
  }

  public async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    return this.repository.delete(userId, memoryId);
  }

  public async clearUserMemory(userId: string): Promise<number> {
    return this.repository.clearUser(userId);
  }

  public async formatUserVisibleSummary(userId: string): Promise<string> {
    if (!this.isMemoryEnabled(userId)) {
      return "Persistent memory is currently disabled for your account.";
    }
    const memories = await this.repository.find({ userId, status: 'active' });
    return this.commandResolver.formatUserVisibleMemories(memories);
  }

  public getCommandResolver(): MemoryCommandResolver {
    return this.commandResolver;
  }
}
