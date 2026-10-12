/**
 * AI V3 production memory wiring regression.
 *
 * Simulates a configured server environment before dynamically importing the service.
 * No Supabase query is issued: this only validates which repository implementation is
 * selected and that the same repository is injected into the consultation orchestrator.
 */

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    process.env.SUPABASE_URL = 'https://astroworld-memory-regression.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'regression-service-role-key-not-used-for-network';

    // Import after setting configuration because the Supabase service snapshots config
    // during module initialization.
    const { ProductionConsultationService } = await import('../src/ai_v2/production/productionConsultationService.ts');
    const service = new ProductionConsultationService();

    assert(
      service.getMemoryRepository().constructor.name === 'SupabasePersistentMemoryRepository',
      'A configured production service must select SupabasePersistentMemoryRepository, not process-local memory.',
    );
    assert(
      service.getOrchestrator().getMemoryRepository() === service.getMemoryRepository(),
      'The production consultation orchestrator must receive the exact configured memory repository instance.',
    );

    console.log('AI V3 PRODUCTION MEMORY REPOSITORY: PASS (2 contracts; no network calls)');
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;

    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
}

try {
  await main();
} catch (error) {
  console.error('AI V3 PRODUCTION MEMORY REPOSITORY: FAIL');
  console.error(error);
  process.exitCode = 1;
}
