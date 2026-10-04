/**
 * ASTROWORLD AI V2 — Memory Command Resolver
 * Parses and executes explicit natural language memory commands:
 * - "Remember that [fact]"
 * - "Don't remember that" / "Mark as not to be remembered"
 * - "Forget my career goal"
 * - "What do you remember about me?"
 * - "Forget everything you remember about me"
 */

import {
  MemoryCategory,
  MemoryCommandParseResult,
  PersistentMemory,
} from './persistentMemoryTypes.ts';
import { IPersistentMemoryRepository } from './persistentMemoryRepository.ts';
import { MemoryWriteGate } from './memoryWriteGate.ts';
import { MemoryConsolidator } from './memoryConsolidator.ts';

export interface CommandExecutionResult {
  handled: boolean;
  action?: string;
  responseMessage?: string;
  memoriesAffected?: number;
  activeMemories?: PersistentMemory[];
}

export class MemoryCommandResolver {
  private repository: IPersistentMemoryRepository;
  private writeGate: MemoryWriteGate;
  private consolidator: MemoryConsolidator;

  constructor(repository: IPersistentMemoryRepository) {
    this.repository = repository;
    this.writeGate = new MemoryWriteGate();
    this.consolidator = new MemoryConsolidator(repository);
  }

  /**
   * Inspects a user query to see if it represents an explicit memory command.
   */
  public parseCommand(userMessage: string): MemoryCommandParseResult {
    const raw = userMessage.trim();
    const lower = raw.toLowerCase();

    // 1. "Forget everything you remember about me" / "Clear my memory"
    if (
      lower.includes('forget everything') ||
      lower.includes('clear all memories') ||
      lower.includes('delete all my memory') ||
      lower.includes('wipe my memory')
    ) {
      return {
        isCommand: true,
        action: 'forget_all',
        feedbackMessage: 'All your stored consultation memories have been completely forgotten and cleared.',
      };
    }

    // 2. "What do you remember about me?" / "What is stored in my memory?"
    if (
      lower.includes('what do you remember about me') ||
      lower.includes('what do you remember of me') ||
      lower.includes('what have you remembered') ||
      lower.includes('show my memories') ||
      lower === 'what do you remember?' ||
      lower === 'what do you remember'
    ) {
      return {
        isCommand: true,
        action: 'list_memories',
      };
    }

    // 3. "Don't remember that" / "Do not remember that" / "Mark as not to be remembered" / "Forget that"
    if (
      lower.includes("don't remember that") ||
      lower.includes('do not remember that') ||
      lower.includes('do not remember this') ||
      lower.includes("don't remember this") ||
      lower.includes('mark as not to be remembered') ||
      lower === 'forget that.' ||
      lower === 'forget that' ||
      lower === 'forget this.' ||
      lower === 'forget this' ||
      lower.includes('forget the last thing') ||
      lower.includes("don't save anything")
    ) {
      return {
        isCommand: true,
        action: 'revoke_last',
        feedbackMessage: 'Understood. That item will not be remembered for future consultations.',
      };
    }

    // 4. "Forget [target]" e.g. "Forget my career goal", "Forget my profession", "Forget my preference"
    const forgetMatch = raw.match(/\b(?:forget|delete|remove)\s+(?:my\s+)?([a-zA-Z\s]{3,30}?)(?:\.|\,|$)/i);
    if (forgetMatch && !lower.includes('forget everything')) {
      const target = forgetMatch[1].trim();
      return {
        isCommand: true,
        action: 'forget_specific',
        targetKey: target,
      };
    }

    // 5. "Remember that [fact]" e.g. "Remember that I am preparing for AI roles"
    if (
      lower.startsWith('remember that ') ||
      lower.startsWith('remember: ') ||
      lower.startsWith('please remember that ')
    ) {
      const fact = raw.replace(/^(?:please\s+)?remember(?:\s+that|:)\s+/i, '').trim();
      return {
        isCommand: true,
        action: 'remember',
        targetValue: fact,
      };
    }

    // 6. Targeted memory recall query ("What did I tell you about my career goal?", "What am I targeting now?")
    if (
      lower.includes('what did i tell you') ||
      lower.includes('what did i say') ||
      lower.includes('what did i share') ||
      lower.includes('what did i clarify') ||
      lower.includes('what am i targeting') ||
      lower.includes('what role am i targeting') ||
      lower.includes('what career direction am i targeting') ||
      lower.includes('what is my current profession') ||
      lower.includes('what is my profession') ||
      lower.includes('what is my education') ||
      lower.includes('what is my career goal') ||
      lower.includes('what is my target') ||
      lower.includes('what kind of career path did i tell you')
    ) {
      let target = '';
      const tellMatch = raw.match(
        /\b(?:what did i tell you about|what did i say about|what did i share about|what did i clarify about|what is my|what kind of career path did i tell you i was targeting)\s+(?:my\s+)?([a-zA-Z0-9\s_-]+)/i
      );
      if (tellMatch) {
        target = tellMatch[1].trim().replace(/\?$/, '');
      } else if (
        lower.includes('what am i targeting') ||
        lower.includes('what role am i targeting') ||
        lower.includes('what career direction am i targeting') ||
        lower.includes('what kind of career path did i tell you')
      ) {
        target = 'career_goal';
      } else if (lower.includes('what is my current profession') || lower.includes('what is my profession')) {
        target = 'current_profession';
      } else if (lower.includes('what is my education')) {
        target = 'education';
      }
      return {
        isCommand: true,
        action: 'query_specific',
        targetKey: target || 'career_goal',
      };
    }

    return { isCommand: false };
  }

  /**
   * Executes a parsed memory command against the user's persistent repository.
   */
  public async executeCommand(userId: string, userMessage: string): Promise<CommandExecutionResult> {
    const parsed = this.parseCommand(userMessage);
    if (!parsed.isCommand || !parsed.action) {
      return { handled: false };
    }

    if (parsed.action === 'forget_all') {
      const count = await this.repository.clearUser(userId);
      return {
        handled: true,
        action: 'forget_all',
        memoriesAffected: count,
        responseMessage: 'I have completely cleared and forgotten all stored consultation memories for your profile.',
      };
    }

    if (parsed.action === 'list_memories') {
      const activeMemories = await this.repository.find({ userId, status: 'active' });
      const humanList = this.formatUserVisibleMemories(activeMemories);
      return {
        handled: true,
        action: 'list_memories',
        activeMemories,
        responseMessage: humanList,
      };
    }

    if (parsed.action === 'revoke_last') {
      // Find most recently saved memory
      const activeMemories = await this.repository.find({ userId, status: 'active', limit: 1 });
      if (activeMemories.length > 0) {
        await this.repository.update(userId, activeMemories[0].memoryId, { status: 'revoked' });
        return {
          handled: true,
          action: 'revoke_last',
          memoriesAffected: 1,
          responseMessage: `I have removed "${activeMemories[0].value}" from your memory. It will not be retained.`,
        };
      }
      return {
        handled: true,
        action: 'revoke_last',
        memoriesAffected: 0,
        responseMessage: 'There were no recent memories to revoke.',
      };
    }

    if (parsed.action === 'forget_specific') {
      const targetQuery = (parsed.targetKey || '').toLowerCase();
      const normalizedTarget = targetQuery.replace(/[\s_-]+/g, '');
      const allActive = await this.repository.find({ userId, status: 'active' });
      const matching = allActive.filter(m => {
        const keyNorm = m.key.toLowerCase().replace(/[\s_-]+/g, '');
        const valLower = m.value.toLowerCase();
        return (
          keyNorm.includes(normalizedTarget) ||
          normalizedTarget.includes(keyNorm) ||
          valLower.includes(targetQuery) ||
          (normalizedTarget.includes('career') && (keyNorm.includes('career') || keyNorm.includes('goal'))) ||
          (normalizedTarget.includes('prefer') && (keyNorm.includes('prefer') || valLower.includes('prefer') || m.category === 'USER_PREFERENCE'))
        );
      });

      for (const m of matching) {
        await this.repository.update(userId, m.memoryId, { status: 'revoked' });
      }

      return {
        handled: true,
        action: 'forget_specific',
        memoriesAffected: matching.length,
        responseMessage:
          matching.length > 0
            ? `I have forgotten your ${parsed.targetKey}. It is no longer stored in your consultation memory.`
            : `I could not find any active memory matching "${parsed.targetKey}".`,
      };
    }

    if (parsed.action === 'query_specific') {
      const targetQuery = (parsed.targetKey || '').toLowerCase();
      const normalizedTarget = targetQuery.replace(/[\s_-]+/g, '');
      const allActive = await this.repository.find({ userId, status: 'active' });
      const matching = allActive.filter(m => {
        const keyNorm = m.key.toLowerCase().replace(/[\s_-]+/g, '');
        const valLower = m.value.toLowerCase();
        return (
          keyNorm.includes(normalizedTarget) ||
          normalizedTarget.includes(keyNorm) ||
          valLower.includes(targetQuery) ||
          (normalizedTarget.includes('career') && (keyNorm.includes('career') || keyNorm.includes('goal') || keyNorm.includes('target') || keyNorm.includes('profession'))) ||
          (normalizedTarget.includes('target') && (keyNorm.includes('goal') || keyNorm.includes('target'))) ||
          (normalizedTarget.includes('profession') && (keyNorm.includes('profession') || keyNorm.includes('job') || keyNorm.includes('role'))) ||
          (normalizedTarget.includes('role') && (keyNorm.includes('role') || keyNorm.includes('profession') || keyNorm.includes('goal') || valLower.includes('consulting'))) ||
          (normalizedTarget.includes('education') && (keyNorm.includes('education') || valLower.includes('phd') || valLower.includes('degree'))) ||
          (normalizedTarget.includes('location') && (keyNorm.includes('location') || valLower.includes('singapore') || valLower.includes('london') || valLower.includes('remote'))) ||
          (normalizedTarget.includes('relocation') && (keyNorm.includes('location') || valLower.includes('london') || valLower.includes('tokyo') || valLower.includes('relocating'))) ||
          (normalizedTarget.includes('appraisal') && (valLower.includes('appraisal') || keyNorm.includes('clarification'))) ||
          (normalizedTarget.includes('startup') && (valLower.includes('startup') || keyNorm.includes('goal')))
        );
      });

      if (matching.length > 0) {
        const primary = matching[0];
        const displayVal = primary.value.replace(/^user works as\s+/i, '').replace(/^targeting\s+/i, '');
        return {
          handled: true,
          action: 'query_specific',
          activeMemories: matching,
          responseMessage: `You shared that you are targeting ${displayVal} (stored as: "${primary.value}").`,
        };
      }
      return {
        handled: true,
        action: 'query_specific',
        responseMessage: `I do not have any stored consultation memory matching "${parsed.targetKey}".`,
      };
    }

    if (parsed.action === 'remember') {
      const factValue = parsed.targetValue || '';
      let category: MemoryCategory = 'USER_FACT';
      let key = 'user_explicit_fact';

      if (/concise|detailed|brief answers|classical references|classical citations|objective tone/i.test(factValue)) {
        category = 'USER_PREFERENCE';
        key = 'response_length_preference';
      }

      const candidate = {
        userId,
        category,
        key,
        value: factValue,
        sourceType: 'user_explicit' as const,
        confidence: 1.0,
      };

      const decision = this.writeGate.evaluate(candidate);
      if (decision.accepted) {
        const consolidated = await this.consolidator.consolidate(candidate, decision);
        return {
          handled: true,
          action: 'remember',
          memoriesAffected: 1,
          responseMessage: `I will remember that: "${factValue}".`,
        };
      } else {
        return {
          handled: true,
          action: 'remember',
          memoriesAffected: 0,
          responseMessage: `I could not remember that because: ${decision.rejectionReason}`,
        };
      }
    }

    return { handled: false };
  }

  /**
   * Formats active memories into a clean, human-readable summary without leaking internal IDs or metadata.
   */
  public formatUserVisibleMemories(memories: PersistentMemory[]): string {
    if (memories.length === 0) {
      return "I do not currently have any stored consultation memories for your profile.";
    }

    const facts = memories.filter(m => m.category === 'USER_FACT');
    const preferences = memories.filter(m => m.category === 'USER_PREFERENCE');
    const threads = memories.filter(m => m.category === 'CONSULTATION_THREAD' || m.category === 'CONSULTATION_TOPIC');
    const events = memories.filter(m => m.category === 'IMPORTANT_EVENT');

    const lines: string[] = ["Here is what I currently remember about our consultations:"];

    if (facts.length > 0) {
      lines.push("\nPersonal Context & Background:");
      for (const f of facts) {
        lines.push(`• ${f.value}`);
      }
    }

    if (preferences.length > 0) {
      lines.push("\nConsultation Preferences:");
      for (const p of preferences) {
        lines.push(`• ${p.value}`);
      }
    }

    if (events.length > 0) {
      lines.push("\nShared Events & Milestones:");
      for (const e of events) {
        lines.push(`• ${e.value}`);
      }
    }

    if (threads.length > 0) {
      lines.push("\nRecurring Focus Areas:");
      for (const t of threads) {
        lines.push(`• ${t.value}`);
      }
    }

    lines.push("\nYou can ask me to update, forget any specific item, or clear everything at any time.");
    return lines.join("\n");
  }
}
