import dotenv from 'dotenv';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ConversationState, ConversationTurn } from '../src/ai_v2/conversation_state/conversationStateTypes.ts';
import type { PersistentMemory } from '../src/ai_v2/memory/persistentMemoryTypes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const confirmedWrites =
    process.argv.includes('--confirm-writes') ||
    process.argv.includes('confirm-writes') ||
    process.env.ASTROWORLD_CONFIRM_WRITES === 'true' ||
    process.env.CONFIRM_WRITES === 'true';

  if (!confirmedWrites) {
    throw new Error(
      'This smoke test writes and deletes temporary records. Re-run with -- --confirm-writes (or $env:ASTROWORLD_CONFIRM_WRITES = "true") only after reviewing the script.',
    );
  }

  const userId = process.env.ASTROWORLD_PERSISTENCE_SMOKE_USER_ID?.trim();
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error(
      'Set ASTROWORLD_PERSISTENCE_SMOKE_USER_ID to your own Supabase Auth user UUID in the local environment. Do not share it in chat.',
    );
  }
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. No writes were performed.');
  }

  const [
    { supabase, isSupabaseConfigured },
    { ConversationPersistenceRepository },
    { SupabasePersistentMemoryRepository, createDefaultMemoryRepository },
  ] = await Promise.all([
    import('../src/services/supabaseService.ts'),
    import('../src/ai_v2/conversation_state/conversationPersistenceRepository.ts'),
    import('../src/ai_v2/memory/supabasePersistentMemoryRepository.ts'),
  ]);

  assert(isSupabaseConfigured, 'Backend Supabase service is not configured.');
  const { data: authUserResult, error: authUserError } = await supabase.auth.admin.getUserById(userId);
  if (authUserError || !authUserResult.user) {
    throw new Error('The supplied smoke-test UUID did not resolve to an existing Supabase Auth user. No writes were performed.');
  }

  const memoryRepository = createDefaultMemoryRepository();
  assert(
    memoryRepository instanceof SupabasePersistentMemoryRepository,
    'Configured runtime did not select SupabasePersistentMemoryRepository.',
  );
  const conversationRepository = new ConversationPersistenceRepository();
  assert(conversationRepository.isEnabled(), 'Conversation persistence is disabled.');

  const suffix = crypto.randomUUID().replace(/-/g, '');
  const conversationId = `awsmoke_${suffix}`;
  const memoryId = `awsmoke_${suffix}`;
  const now = new Date().toISOString();

  const state: ConversationState = {
    conversationId,
    turnIndex: 1,
    currentTopic: 'Temporary persistence smoke test',
    currentIntent: 'persistence_smoke_test',
    currentDomain: 'general',
    activePlanetFocus: [],
    activeHouseFocus: [],
    activeVargas: [],
    activeTimePeriods: [],
    activeDates: [],
    lastQuestion: 'Temporary round-trip probe',
    activeClaims: [],
    relevantPreviousClaims: [],
    userCorrections: [],
    unresolvedThreads: [],
    recentlyDiscussedFactors: [],
    recentQuestions: ['Temporary round-trip probe'],
    recentAnswers: ['Temporary round-trip answer'],
    referencedTurnIds: [],
    clarificationNeeded: false,
    contextConfidence: 1,
    stateVersion: 1,
    createdAtIso: now,
    updatedAtIso: now,
  };

  const turn: ConversationTurn = {
    turnId: `turn_${suffix}`,
    turnIndex: 1,
    userMessage: 'Temporary round-trip probe',
    answerSummary: {
      mainConclusion: 'Temporary persistence round-trip succeeded.',
      supportingFactors: [],
    },
    approvedClaimIds: [],
    dominantFactors: [],
    domain: 'general',
    intent: 'persistence_smoke_test',
    referencedFactors: [],
    createdAt: now,
    executionMode: 'persistence_smoke_test',
  };

  const memory: PersistentMemory = {
    memoryId,
    userId,
    category: 'USER_FACT',
    key: `__astroworld_smoke_${suffix}__`,
    value: 'Temporary persistence smoke record; safe to remove.',
    normalizedValue: 'temporary persistence smoke record',
    sourceType: 'system_import',
    sourceTrust: 'ENGINE_CANONICAL',
    sourceTurnId: turn.turnId,
    conversationId,
    confidence: 1,
    status: 'active',
    sensitivity: 'normal',
    createdAt: now,
    updatedAt: now,
    validationStatus: 'not_applicable',
    evidenceRefs: [],
    tags: ['temporary', 'persistence-smoke-test'],
    version: 1,
    metadata: { purpose: 'temporary round-trip verification' },
  };

  let mainError: unknown;
  try {
    await conversationRepository.save(userId, state, turn);
    const loaded = await conversationRepository.load(userId, conversationId);
    assert(Boolean(loaded), 'Conversation round-trip failed: load returned no state.');
    assert(loaded!.state.conversationId === conversationId, 'Conversation round-trip returned a mismatched ID.');
    assert(loaded!.state.stateVersion === 1, 'Conversation round-trip returned a mismatched state version.');
    assert(loaded!.turns.length === 1 && loaded!.turns[0].turnId === turn.turnId,
      'Conversation message round-trip failed.');
    assert(await conversationRepository.owns(userId, conversationId),
      'Conversation ownership check failed for the authenticated test user.');
    console.log('PASS: conversation state and turn round-trip');

    const savedMemory = await memoryRepository.save(memory);
    assert(savedMemory.memoryId === memoryId, 'Memory write returned a mismatched ID.');
    const loadedMemory = await memoryRepository.getById(userId, memoryId);
    assert(Boolean(loadedMemory), 'Memory round-trip failed: lookup returned no record.');
    assert(loadedMemory!.value === memory.value, 'Memory round-trip returned a mismatched value.');
    assert(loadedMemory!.conversationId === conversationId, 'Memory round-trip returned a mismatched conversation ID.');
    console.log('PASS: persistent memory write/read round-trip');

    assert(await memoryRepository.delete(userId, memoryId), 'Temporary memory cleanup through repository failed.');
    console.log('PASS: memory delete operation');
  } catch (error) {
    mainError = error;
  } finally {
    // Cleanup is narrowly scoped to unique IDs created above. Never print row
    // contents or credentials. Attempt every cleanup even if one step fails.
    const cleanupErrors: string[] = [];
    const cleanupTasks: Array<[string, () => Promise<{ error: { message: string } | null }>]> = [
      ['messages', async () => supabase.from('conversation_messages').delete().eq('conversation_id', conversationId).eq('user_id', userId)],
      ['conversation', async () => supabase.from('conversations').delete().eq('id', conversationId).eq('user_id', userId)],
      ['memory', async () => supabase.from('persistent_memories').delete().eq('memory_id', memoryId).eq('user_id', userId)],
    ];
    for (const [label, cleanup] of cleanupTasks) {
      try {
        const { error } = await cleanup();
        if (error) cleanupErrors.push(`${label}: ${error.message}`);
      } catch (error) {
        cleanupErrors.push(`${label}: ${error instanceof Error ? error.message : 'unknown cleanup error'}`);
      }
    }
    if (cleanupErrors.length) {
      throw new Error(
        `Smoke test cleanup needs attention for temporary IDs created by this run (${cleanupErrors.join('; ')}). Check only the awsmoke_ records for the configured user.`,
        { cause: mainError },
      );
    }
  }

  if (mainError) throw mainError;
  console.log('Temporary records cleaned up by unique IDs.');
  console.log('AI V3 PERSISTENCE ROUND-TRIP: PASS');
  console.log('This test does not certify live Gemini SLO or independent answer quality.');
}

main().catch((error) => {
  console.error('AI V3 PERSISTENCE ROUND-TRIP: FAIL');
  console.error(error instanceof Error ? error.message : 'Unknown failure');
  process.exitCode = 1;
});
