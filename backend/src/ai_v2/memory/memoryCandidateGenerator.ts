/**
 * ASTROWORLD AI V2 — Memory Candidate Generator
 * Identifies high-value persistent facts, preferences, corrections, and threads
 * from a completed consultation turn to present to the MemoryWriteGate.
 */

import {
  MemoryWriteCandidate,
} from './persistentMemoryTypes.ts';
import { ConversationState, ConversationTurn } from '../conversation_state/conversationStateTypes.ts';
import { ApprovedClaimSet } from '../schemas/claimPacket.ts';
import { FinalResponse } from '../schemas/responsePlan.ts';

export interface CandidateGenerationInput {
  userId: string;
  userMessage: string;
  conversationState?: ConversationState;
  approvedClaims?: ApprovedClaimSet;
  finalResponse?: FinalResponse;
  turn?: ConversationTurn;
}

export class MemoryCandidateGenerator {
  /**
   * Evaluates a completed turn to generate 0..N candidate persistent memories.
   */
  public generateCandidates(input: CandidateGenerationInput): MemoryWriteCandidate[] {
    const candidates: MemoryWriteCandidate[] = [];
    const rawMsg = input.userMessage.trim();
    const lower = rawMsg.toLowerCase();

    // 1. Explicit user preferences (e.g. "Please give me concise answers", "Prefer classical references")
    if (lower.includes('concise answer') || lower.includes('keep it brief') || lower.includes('short answer')) {
      candidates.push({
        userId: input.userId,
        category: 'USER_PREFERENCE',
        key: 'response_length_preference',
        value: 'Prefers concise, direct answers without unnecessary expansion',
        sourceType: 'user_explicit',
        tags: ['preference', 'style', 'concise'],
        confidence: 1.0,
      });
    } else if (lower.includes('detailed explanation') || lower.includes('in-depth') || lower.includes('thorough')) {
      candidates.push({
        userId: input.userId,
        category: 'USER_PREFERENCE',
        key: 'response_length_preference',
        value: 'Prefers detailed, in-depth astrological analysis',
        sourceType: 'user_explicit',
        tags: ['preference', 'style', 'detailed'],
        confidence: 1.0,
      });
    }

    if (lower.includes('classical reference') || lower.includes('quote bphs') || lower.includes('cite classical texts')) {
      candidates.push({
        userId: input.userId,
        category: 'USER_PREFERENCE',
        key: 'tradition_preference',
        value: 'Prefers classical Jyotish citations and textual rules',
        sourceType: 'user_explicit',
        tags: ['preference', 'classical', 'bphs'],
        confidence: 1.0,
      });
    }

    // 2. Explicit User Facts (occupation, role, goals)
    // "I am a [role]", "I work as a [role]", "I am targeting [role]"
    const jobRoleMatch = rawMsg.match(/\b(?:i am a|i work as a|i work as an|i am an)\s+([a-zA-Z\s]{3,30}?)(?:\.|\,|$|\s+in\s+|\s+at\s+)/i);
    if (jobRoleMatch && !lower.includes('why') && !lower.includes('if')) {
      const role = jobRoleMatch[1].trim();
      candidates.push({
        userId: input.userId,
        category: 'USER_FACT',
        key: 'current_profession',
        value: `User works as ${role}`,
        sourceType: 'user_explicit',
        tags: ['career', 'profession', 'role'],
        confidence: 0.95,
      });
    }

    const isQuestion = rawMsg.includes('?') || /^(what|when|where|why|how|which|who|is|can|will|do|does|did)\b/i.test(rawMsg.trim());
    if (!isQuestion) {
      const targetGoalMatch = rawMsg.match(
        /\b(?:target|targeting|preparing for|aiming for|planning to switch to|switching to|focusing on)\s+([^.,;\n]{3,80})/i
      );
      if (targetGoalMatch) {
        const goal = targetGoalMatch[1].trim();
        candidates.push({
          userId: input.userId,
          category: 'USER_FACT',
          key: 'career_goal',
          value: `Targeting ${goal}`,
          sourceType: 'user_explicit',
          tags: ['career', 'goal'],
          confidence: 0.95,
        });
      }
    }

    // Explicit name sharing: "My name is [Name]"
    const nameMatch = rawMsg.match(/\b(?:my name is|call me)\s+([a-zA-Z]{2,20})\b/i);
    if (nameMatch) {
      candidates.push({
        userId: input.userId,
        category: 'USER_FACT',
        key: 'preferred_name',
        value: nameMatch[1].trim(),
        sourceType: 'user_explicit',
        tags: ['identity', 'name'],
        confidence: 1.0,
      });
    }

    // 3. Explicit User Corrections ("Actually I am in consulting, not management")
    if (
      lower.startsWith('actually ') ||
      lower.includes('my appraisal is in ') ||
      lower.includes('not management') ||
      lower.includes('not master')
    ) {
      let key = 'user_clarification';
      if (lower.includes('phd') || lower.includes('degree') || lower.includes('master')) {
        key = 'education_background';
      } else if (lower.includes('relocat') || lower.includes('moving') || lower.includes('london') || lower.includes('tokyo')) {
        key = 'location_context';
      } else if (lower.includes('appraisal')) {
        key = 'user_clarification';
      } else if (lower.includes('consulting') || lower.includes('role')) {
        key = 'role_clarification';
      }
      candidates.push({
        userId: input.userId,
        category: 'USER_CORRECTION',
        key,
        value: rawMsg,
        sourceType: 'user_explicit',
        tags: ['correction', 'user_fact'],
        confidence: 1.0,
      });
    }

    // 4. Important Life Events ("I started my job in July 2026", "I got promoted", "I completed my degree")
    const eventMatch = rawMsg.match(/\b(?:i started|i joined|i got promoted|i resigned|i completed|i moved to)\s+([a-zA-Z0-9\s]{3,40}?)(?:\.|\,|$)/i);
    if (eventMatch && !lower.includes('will i')) {
      candidates.push({
        userId: input.userId,
        category: 'IMPORTANT_EVENT',
        key: 'life_milestone',
        value: eventMatch[0].trim(),
        sourceType: 'user_explicit',
        tags: ['event', 'milestone'],
        confidence: 0.9,
      });
    }

    // 5. Explicit "Remember that..." command
    if (lower.startsWith('remember that ') || lower.startsWith('remember: ') || lower.startsWith('remember i ')) {
      const statement = rawMsg.replace(/^(?:remember that|remember:|remember i)\s+/i, '').trim();
      candidates.push({
        userId: input.userId,
        category: 'USER_FACT',
        key: 'user_explicit_memo',
        value: statement,
        sourceType: 'user_explicit',
        tags: ['user_command', 'explicit'],
        confidence: 1.0,
      });
    }

    // 6. Long-term Consultation Thread / Topic
    if (input.conversationState && input.conversationState.currentDomain !== 'general') {
      const domain = input.conversationState.currentDomain;
      const topic = input.conversationState.currentTopic;
      if (
        domain === 'career' &&
        (lower.includes('promotion') ||
          lower.includes('job change') ||
          lower.includes('career') ||
          lower.includes('d10') ||
          lower.includes('timing') ||
          lower.includes('trajectory') ||
          lower.includes('period') ||
          lower.includes('work') ||
          lower.includes('dasha') ||
          lower.includes('jupiter') ||
          lower.includes('saturn'))
      ) {
        candidates.push({
          userId: input.userId,
          category: 'CONSULTATION_THREAD',
          key: 'career_promotion_timing_thread',
          value: `Ongoing consultation thread on career promotion and timing (${topic})`,
          sourceType: 'assistant_derived',
          tags: ['career', 'timing', 'thread'],
          confidence: 0.85,
        });
      } else if (domain === 'relationship' && lower.includes('marriage')) {
        candidates.push({
          userId: input.userId,
          category: 'CONSULTATION_THREAD',
          key: 'marriage_timing_thread',
          value: `Ongoing consultation thread on marriage timing (${topic})`,
          sourceType: 'assistant_derived',
          tags: ['relationship', 'marriage', 'thread'],
          confidence: 0.85,
        });
      }
    }

    return candidates;
  }
}
