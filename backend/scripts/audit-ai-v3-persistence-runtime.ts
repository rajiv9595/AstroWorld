import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main(): Promise<void> {
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    throw new Error('This read-only runtime audit requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const [{ supabase, isSupabaseConfigured }, { createDefaultMemoryRepository, SupabasePersistentMemoryRepository }, { ConversationPersistenceRepository }] =
    await Promise.all([
      import('../src/services/supabaseService.ts'),
      import('../src/ai_v2/memory/supabasePersistentMemoryRepository.ts'),
      import('../src/ai_v2/conversation_state/conversationPersistenceRepository.ts'),
    ]);

  if (!isSupabaseConfigured) {
    throw new Error('The Supabase service module did not resolve a configured privileged backend client.');
  }

  const memoryRepository = createDefaultMemoryRepository();
  if (!(memoryRepository instanceof SupabasePersistentMemoryRepository)) {
    throw new Error(
      `Configured runtime selected ${memoryRepository.constructor.name}; expected SupabasePersistentMemoryRepository.`,
    );
  }

  const conversationRepository = new ConversationPersistenceRepository();
  if (!conversationRepository.isEnabled()) {
    throw new Error('ConversationPersistenceRepository reports disabled despite configured Supabase credentials.');
  }

  const probes: Array<{ table: string; column: string }> = [
    { table: 'persistent_memories', column: 'memory_id' },
    { table: 'conversations', column: 'id' },
    { table: 'conversation_messages', column: 'id' },
  ];
  const results: Array<{ table: string; ok: boolean; durationMs: number }> = [];

  for (const probe of probes) {
    const started = Date.now();
    // Read only: schema/access check via LIMIT 1, and do not print returned rows.
    const { error } = await supabase.from(probe.table).select(probe.column).limit(1);
    const durationMs = Date.now() - started;
    if (error) {
      results.push({ table: probe.table, ok: false, durationMs });
      throw new Error(
        `Read-only persistence probe failed for table "${probe.table}" (${error.code || 'unknown'}): ${error.message}`,
      );
    }
    results.push({ table: probe.table, ok: true, durationMs });
    console.log(`PASS: table "${probe.table}" is queryable (read-only, ${durationMs}ms)`);
  }

  console.log('Runtime adapters: Supabase persistent memory + enabled conversation persistence.');
  console.log('No writes were performed; no row contents or credentials were printed.');
  console.log(JSON.stringify({ configured: isSupabaseConfigured, adapters: {
    memory: memoryRepository.constructor.name,
    conversationPersistenceEnabled: conversationRepository.isEnabled(),
  }, probes: results }, null, 2));
  console.log('AI V3 CONFIGURED PERSISTENCE RUNTIME: PASS (3 read-only probes)');
}

main().catch(error => {
  console.error('AI V3 CONFIGURED PERSISTENCE RUNTIME: FAIL');
  console.error(error);
  process.exitCode = 1;
});
