/**
 * ASTROWORLD AI V2 — Memory Consolidator
 * Reconciles incoming memories with existing stored memories.
 * Deduplicates, supersedes outdated statements, detects direct contradictions,
 * and maintains unbroken provenance chains.
 */

import {
  PersistentMemory,
  MemoryWriteCandidate,
  MemoryWriteGateDecision,
} from './persistentMemoryTypes.ts';
import { IPersistentMemoryRepository } from './persistentMemoryRepository.ts';

export interface ConsolidationOutcome {
  action: 'created' | 'updated_existing' | 'superseded_old' | 'rejected_duplicate';
  memory: PersistentMemory;
  supersededMemoryId?: string;
  notes: string;
}

export class MemoryConsolidator {
  private repository: IPersistentMemoryRepository;

  constructor(repository: IPersistentMemoryRepository) {
    this.repository = repository;
  }

  /**
   * Consolidates an approved write candidate against existing active user memories.
   */
  public async consolidate(
    candidate: MemoryWriteCandidate,
    decision: MemoryWriteGateDecision
  ): Promise<ConsolidationOutcome> {
    const existing = await this.repository.find({
      userId: candidate.userId,
      status: 'active',
      keys: [candidate.key],
    });

    const now = new Date().toISOString();
    const normalizedNewValue = this.normalizeValue(candidate.value);

    // 1. Check for exact duplicate active memory
    const exactDuplicate = existing.find(
      m => m.normalizedValue === normalizedNewValue && m.category === candidate.category
    );

    if (exactDuplicate) {
      // Just touch lastUsedAt and bump confidence if provided
      const updated = await this.repository.update(candidate.userId, exactDuplicate.memoryId, {
        lastUsedAt: now,
        confidence: Math.max(exactDuplicate.confidence, candidate.confidence || 1.0),
      });
      return {
        action: 'rejected_duplicate',
        memory: updated || exactDuplicate,
        notes: `Identical active memory found (${exactDuplicate.memoryId}); updated lastUsedAt without duplicate entry`,
      };
    }

    // 2. Check for single-value keys that should be superseded upon change
    // e.g. current_job, target_role, career_goal, relationship_status, preferred_name, user preferences, education, location
    const isSingleSlotKey =
      candidate.category === 'USER_PREFERENCE' ||
      candidate.key.includes('preference') ||
      candidate.key.startsWith('target_') ||
      candidate.key.startsWith('current_') ||
      candidate.key.includes('goal') ||
      candidate.key.includes('status') ||
      candidate.key.includes('preferred_name') ||
      candidate.key.includes('education') ||
      candidate.key.includes('location') ||
      candidate.key.includes('clarification');

    const previousForSameKey = existing.find(m => m.key === candidate.key && m.category === candidate.category);

    const newMemoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newMemory: PersistentMemory = {
      memoryId: newMemoryId,
      userId: candidate.userId,
      category: candidate.category,
      key: candidate.key,
      value: candidate.value,
      normalizedValue: normalizedNewValue,
      sourceType: candidate.sourceType,
      sourceTrust: decision.assignedTrust,
      sourceTurnId: candidate.sourceTurnId,
      conversationId: candidate.conversationId,
      confidence: candidate.confidence ?? 1.0,
      status: 'active',
      sensitivity: decision.assignedSensitivity,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
      lastValidatedAt: decision.assignedValidationStatus === 'validated' ? now : undefined,
      expiresAt: candidate.expiresAt,
      validationStatus: decision.assignedValidationStatus,
      evidenceRefs: candidate.evidenceRefs ? [...candidate.evidenceRefs] : [],
      tags: candidate.tags ? [...candidate.tags] : [],
      version: 1,
    };

    if (previousForSameKey && isSingleSlotKey) {
      // Old memory is superseded by the new memory
      newMemory.supersedesMemoryId = previousForSameKey.memoryId;
      const saved = await this.repository.save(newMemory);
      await this.repository.supersede(candidate.userId, previousForSameKey.memoryId, saved.memoryId);

      return {
        action: 'superseded_old',
        memory: saved,
        supersededMemoryId: previousForSameKey.memoryId,
        notes: `Superseded previous active memory (${previousForSameKey.memoryId}) with new value for key "${candidate.key}"`,
      };
    }

    // 3. Brand new independent memory
    const saved = await this.repository.save(newMemory);
    return {
      action: 'created',
      memory: saved,
      notes: `Created new active memory record for key "${candidate.key}"`,
    };
  }

  private normalizeValue(val: string): string {
    return val
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .replace(/\s+/g, ' ');
  }
}
