/**
 * ASTROWORLD AI V2 — Deterministic Memory Retriever
 * Fast, auditable, relational retrieval (<20ms) of question-relevant user memories.
 * Strictly avoids full transcript dumps, ungrounded vector search, or cross-domain bleed.
 */

import {
  PersistentMemory,
  RelevantMemoryPack,
  MemoryTrace,
} from './persistentMemoryTypes.ts';
import { IPersistentMemoryRepository } from './persistentMemoryRepository.ts';
import { AstrologyMemoryValidator } from './astrologyMemoryValidator.ts';
import { QuestionPlan } from '../schemas/questionPlan.ts';
import { ConversationContextPack } from '../conversation_state/conversationStateTypes.ts';
import { EvidencePacket } from '../schemas/evidencePacket.ts';
import { ReasoningPacket } from '../schemas/reasoningPacket.ts';

export interface MemoryRetrievalOptions {
  userId: string;
  questionPlan?: QuestionPlan;
  contextPack?: ConversationContextPack;
  domain?: string;
  topic?: string;
  entities?: string[];
  maxMemories?: number;
  currentEvidence?: EvidencePacket;
  currentReasoning?: ReasoningPacket;
}

export class MemoryRetriever {
  private repository: IPersistentMemoryRepository;
  private astrologyValidator: AstrologyMemoryValidator;

  constructor(repository: IPersistentMemoryRepository) {
    this.repository = repository;
    this.astrologyValidator = new AstrologyMemoryValidator();
  }

  /**
   * Deterministically retrieves memories relevant to the active question context.
   */
  public async retrieve(options: MemoryRetrievalOptions): Promise<{
    pack: RelevantMemoryPack;
    trace: MemoryTrace;
  }> {
    const startTime = Date.now();
    const maxItems = options.maxMemories ?? 6;
    const targetDomain = (options.domain || options.questionPlan?.domain || options.contextPack?.currentDomain || 'general').toLowerCase();
    const queryEntities: string[] = options.entities || options.questionPlan?.planetFocus || [];
    const queryEntitiesLower = queryEntities.map((e: string) => e.toLowerCase());

    // 1. Fetch all active memories for the authenticated user
    const candidateMemories = await this.repository.find({
      userId: options.userId,
      status: 'active',
      limit: 50,
    });

    const rejectionReasons: Array<{ memoryId: string; reason: string }> = [];
    const revalidationResults: Array<{ memoryId: string; status: any; note: string }> = [];

    const scoredMemories: Array<{ memory: PersistentMemory; score: number }> = [];

    for (const mem of candidateMemories) {
      // Relevance Evaluation:
      // High relevance:
      // - USER_PREFERENCE (always relevant to how answers are presented)
      // - User facts matching target domain or general identity
      // - Consultation topics or threads matching target domain
      // - Astrological conclusions matching target domain & entities
      let score = 0;

      // Check category baseline
      if (mem.category === 'USER_PREFERENCE') {
        score += 8; // High baseline relevance for tone/structure preferences
      } else if (mem.category === 'USER_FACT') {
        // Direct domain match or global personal fact (e.g. preferred_name)
        if (mem.key.includes('preferred_name') || mem.key.includes('identity')) {
          if (targetDomain === 'general') {
            score += 10;
          } else {
            rejectionReasons.push({ memoryId: mem.memoryId, reason: `Identity facts reserved for general domain, not "${targetDomain}"` });
            continue;
          }
        } else if (this.matchesDomain(mem, targetDomain)) {
          score += 12;
        } else if (targetDomain === 'general') {
          score += 6;
        } else {
          rejectionReasons.push({ memoryId: mem.memoryId, reason: `User fact domain does not match active domain "${targetDomain}"` });
          continue;
        }
      } else if (mem.category === 'CONSULTATION_THREAD' || mem.category === 'CONSULTATION_TOPIC') {
        if (this.matchesDomain(mem, targetDomain)) {
          score += 10;
        } else {
          rejectionReasons.push({ memoryId: mem.memoryId, reason: `Thread/Topic domain mismatch with "${targetDomain}"` });
          continue;
        }
      } else if (mem.category === 'ASSISTANT_CONCLUSION') {
        // MUST revalidate against current evidence
        const valResult = this.astrologyValidator.validateAgainstCurrentContext(
          mem,
          options.currentEvidence,
          options.currentReasoning
        );
        revalidationResults.push({
          memoryId: mem.memoryId,
          status: valResult.validationStatus,
          note: valResult.revalidationReason,
        });

        if (valResult.conflictsWithCurrentEvidence) {
          // Immediately reject invalidated historical conclusions! Current engine evidence always wins!
          rejectionReasons.push({
            memoryId: mem.memoryId,
            reason: `Historical assistant conclusion invalidated by current ephemeris evidence: ${valResult.revalidationReason}`,
          });
          continue;
        }

        if (this.matchesDomain(mem, targetDomain)) {
          score += 7;
        } else {
          rejectionReasons.push({ memoryId: mem.memoryId, reason: `Historical conclusion unrelated to domain "${targetDomain}"` });
          continue;
        }
      } else if (mem.category === 'IMPORTANT_EVENT' || mem.category === 'USER_CORRECTION') {
        if (this.matchesDomain(mem, targetDomain) || targetDomain === 'general') {
          score += 9;
        } else {
          rejectionReasons.push({ memoryId: mem.memoryId, reason: `Event/Correction not relevant to domain "${targetDomain}"` });
          continue;
        }
      }

      // Bonus for entity overlap (e.g. Jupiter, Saturn)
      if (this.matchesEntities(mem, queryEntitiesLower)) {
        score += 6;
      }

      // Recency decay / boost (more recent = slight preference)
      const ageHours = (Date.now() - new Date(mem.updatedAt).getTime()) / (1000 * 60 * 60);
      if (ageHours < 24) score += 2;
      else if (ageHours < 168) score += 1;

      // Trust weight
      if (mem.sourceTrust === 'USER_CONFIRMED') score += 3;

      scoredMemories.push({ memory: mem, score });
    }

    // Sort by score descending
    scoredMemories.sort((a, b) => b.score - a.score);

    const selected = scoredMemories.slice(0, maxItems).map(s => s.memory);

    // Categorized breakdown
    const userFacts = selected.filter(m => m.category === 'USER_FACT');
    const userPreferences = selected.filter(m => m.category === 'USER_PREFERENCE');
    const activeThreads = selected.filter(m => m.category === 'CONSULTATION_THREAD');
    const revalidatedConclusions = selected.filter(m => m.category === 'ASSISTANT_CONCLUSION');
    const invalidatedConclusions = candidateMemories.filter(
      m => m.category === 'ASSISTANT_CONCLUSION' && revalidationResults.some(r => r.memoryId === m.memoryId && r.status === 'invalidated')
    );

    // Build concise human-scannable context summary for downstream modules
    const summaryLines: string[] = [];
    if (userFacts.length > 0) {
      summaryLines.push(`Known User Facts: ${userFacts.map(f => `${f.key}=${f.value}`).join('; ')}`);
    }
    if (userPreferences.length > 0) {
      summaryLines.push(`User Preferences: ${userPreferences.map(p => p.value).join('; ')}`);
    }
    if (activeThreads.length > 0) {
      summaryLines.push(`Recurring Consultation Threads: ${activeThreads.map(t => t.value).join('; ')}`);
    }
    if (revalidatedConclusions.length > 0) {
      summaryLines.push(`Prior Verified Consultation Context: ${revalidatedConclusions.map(c => c.value).join('; ')}`);
    }

    const latencyMs = Date.now() - startTime;

    const pack: RelevantMemoryPack = {
      userId: options.userId,
      retrievedAt: new Date().toISOString(),
      totalMemoriesConsidered: candidateMemories.length,
      selectedMemories: selected,
      userFacts,
      userPreferences,
      activeThreads,
      revalidatedAstrologyConclusions: revalidatedConclusions,
      invalidatedAstrologyConclusions: invalidatedConclusions,
      contextSummary: summaryLines.join('\n'),
      latencyMs,
    };

    const trace: MemoryTrace = {
      traceId: `trace_mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: options.userId,
      retrievalQuery: options.questionPlan?.rawQuestion,
      domain: targetDomain,
      memoriesConsideredCount: candidateMemories.length,
      memoriesSelectedCount: selected.length,
      rejectionReasons,
      writeCandidatesCount: 0,
      writeDecisions: [],
      consolidationDecisions: [],
      revalidationResults,
      latencyMs,
    };

    return { pack, trace };
  }

  private matchesDomain(mem: PersistentMemory, targetDomain: string): boolean {
    if (targetDomain === 'general') return true;
    const combined = `${mem.key} ${mem.value} ${mem.tags.join(' ')}`.toLowerCase();
    if (targetDomain === 'career') {
      return (
        combined.includes('career') ||
        combined.includes('job') ||
        combined.includes('profession') ||
        combined.includes('promotion') ||
        combined.includes('work') ||
        combined.includes('appraisal') ||
        combined.includes('role') ||
        combined.includes('consulting') ||
        combined.includes('management') ||
        combined.includes('position') ||
        combined.includes('salary') ||
        combined.includes('interview') ||
        combined.includes('company') ||
        combined.includes('engineering') ||
        combined.includes('10th') ||
        combined.includes('tenth') ||
        combined.includes('authority') ||
        combined.includes('business')
      );
    }
    if (targetDomain === 'relationship') {
      return combined.includes('marriage') || combined.includes('relationship') || combined.includes('spouse') || combined.includes('partner');
    }
    if (targetDomain === 'finance') {
      return combined.includes('finance') || combined.includes('wealth') || combined.includes('money') || combined.includes('income');
    }
    if (targetDomain === 'health') {
      return combined.includes('health') || combined.includes('vitality') || combined.includes('diet');
    }
    if (targetDomain === 'spirituality') {
      return combined.includes('spiritual') || combined.includes('dharma') || combined.includes('meditation') || combined.includes('moksha');
    }
    return combined.includes(targetDomain);
  }

  private matchesEntities(mem: PersistentMemory, entitiesLower: string[]): boolean {
    if (entitiesLower.length === 0) return false;
    const combined = `${mem.key} ${mem.value} ${mem.tags.join(' ')}`.toLowerCase();
    return entitiesLower.some(e => combined.includes(e));
  }
}
