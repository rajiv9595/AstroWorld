import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(scriptDir, '../../.env') });
dotenv.config({ path: path.resolve(scriptDir, '../.env') });

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a finite number.`);
  return parsed;
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required. This audit never falls back to mock mode.');
  }

  const samplesCount = numberFromEnv('ASTROWORLD_LIVE_SLO_SAMPLES', 10);
  if (!Number.isInteger(samplesCount) || samplesCount < 5 || samplesCount > 25) {
    throw new Error('ASTROWORLD_LIVE_SLO_SAMPLES must be an integer from 5 through 25.');
  }

  const thresholds = {
    minSamples: samplesCount,
    minLiveSuccessRate: numberFromEnv('ASTROWORLD_LIVE_SLO_MIN_SUCCESS_RATE', 1),
    maxFallbackRate: numberFromEnv('ASTROWORLD_LIVE_SLO_MAX_FALLBACK_RATE', 0.2),
    maxP95TotalLatencyMs: numberFromEnv('ASTROWORLD_LIVE_SLO_MAX_P95_TOTAL_MS', 25000),
    maxP95ProviderLatencyMs: numberFromEnv('ASTROWORLD_LIVE_SLO_MAX_P95_PROVIDER_MS', 8000),
  };

  const [
    { ConsultationOrchestrator, validateConsultationResult },
    { InMemoryPersistentMemoryRepository },
    { ConversationPersistenceRepository },
    { evaluateLiveSlo },
  ] = await Promise.all([
    import('../src/ai_v2/index.ts'),
    import('../src/ai_v2/memory/persistentMemoryRepository.ts'),
    import('../src/ai_v2/conversation_state/conversationPersistenceRepository.ts'),
    import('../src/ai_v2/production/releaseGateMetrics.ts'),
  ]);

  const profile = {
    name: 'AstroWorld Synthetic SLO Profile',
    year: 1990,
    month: 10,
    day: 24,
    hour: 14,
    minute: 30,
    second: 0,
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata',
    gender: 'male' as const,
  };

  // The live audit must not write to the configured persistent stores. It uses an
  // in-memory memory repository and disables conversation persistence explicitly.
  const orchestrator = new ConsultationOrchestrator({
    apiKey,
    forceMockMode: false,
    memoryRepository: new InMemoryPersistentMemoryRepository(),
    conversationPersistence: new ConversationPersistenceRepository({ configured: false }),
  });

  const scenarios = [
    {
      id: 'career_transit',
      question: 'How does the upcoming transit of Jupiter support my promotion timing?',
    },
    {
      id: 'career_finance_compound',
      question: 'How will my career progress and income/savings look between 2027 and 2029, including both supportive and limiting indications?',
    },
    {
      id: 'career_dasha',
      question: 'What does my D10 and current dasha indicate for career stability, and what qualifications should I keep in mind?',
    },
    {
      id: 'career_relocation',
      question: 'Will my career take me abroad in 2027, and which verified factors support or limit that interpretation?',
    },
    {
      id: 'non_fatalistic_comparison',
      question: 'Compare career development and financial stability over the next two years without treating any chart indication as a guarantee.',
    },
  ];

  console.log('ASTROWORLD AI V3 LIVE GEMINI SLO AUDIT');
  console.log(`Samples=${samplesCount}; primary model and fallback configured in the application`);
  console.log('Persistence is explicitly disabled for this run; sample birth data is synthetic.');
  console.log(`Thresholds: ${JSON.stringify(thresholds)}\n`);

  const rows: any[] = [];
  for (let i = 0; i < samplesCount; i++) {
    const scenario = scenarios[i % scenarios.length];
    const sampleId = `live-${String(i + 1).padStart(2, '0')}`;
    const started = Date.now();

    try {
      const result = await orchestrator.consult(scenario.question, profile, {
        userId: `ai_v3_live_slo_audit_${sampleId}`,
        conversationId: `ai_v3_live_slo_audit_${sampleId}`,
        forceMockMode: false,
        memoryEnabled: false,
      });
      const validated = validateConsultationResult(result);
      const trace = result.trace;
      const liveModelSucceeded =
        trace.executionMode === 'live_gemini' &&
        (trace.primarySucceeded === true || trace.fallbackSucceeded === true);
      const row = {
        sampleId,
        scenario: scenario.id,
        question: scenario.question,
        totalLatencyMs: trace.latencyMs?.total ?? Date.now() - started,
        providerLatencyMs: trace.providerLatencyMs || 0,
        executionMode: trace.executionMode,
        liveModelSucceeded,
        fallbackTriggered: trace.fallbackTriggered === true,
        responseValid: validated.valid && result.finalResponse.verified === true,
        validatorStatus: result.finalResponse.validatorStatus,
        referencedEvidenceCount: result.finalResponse.referencedEvidenceIds?.length || 0,
        effectiveModel: trace.effectiveModel,
        requestedModel: trace.requestedModel,
        primarySucceeded: trace.primarySucceeded,
        fallbackSucceeded: trace.fallbackSucceeded,
        repairAttempts: trace.metrics?.repairAttempts ?? 0,
        responsePreview: result.finalResponse.text.slice(0, 1200),
        validationErrors: validated.errors,
      };
      rows.push(row);
      console.log(
        `[${sampleId}] ${scenario.id}: live=${liveModelSucceeded}, total=${row.totalLatencyMs}ms, provider=${row.providerLatencyMs}ms, fallback=${row.fallbackTriggered}, status=${row.validatorStatus}, model=${row.effectiveModel}`,
      );
      console.log(`ANSWER REVIEW SAMPLE: ${row.responsePreview.replace(/\s+/g, ' ')}\n`);
    } catch (error: any) {
      rows.push({
        sampleId,
        scenario: scenario.id,
        question: scenario.question,
        totalLatencyMs: Date.now() - started,
        providerLatencyMs: 0,
        executionMode: 'error',
        liveModelSucceeded: false,
        fallbackTriggered: false,
        responseValid: false,
        validatorStatus: 'error',
        referencedEvidenceCount: 0,
        error: error?.message || String(error),
      });
      console.error(`[${sampleId}] ERROR: ${error?.message || String(error)}`);
    }
  }

  const evaluation = evaluateLiveSlo(rows, thresholds);
  const report = {
    audit: 'AstroWorld AI V3 live Gemini SLO',
    completedAt: new Date().toISOString(),
    liveApiUsed: true,
    persistenceWritesEnabled: false,
    sampleBirthProfile: 'synthetic fixture profile; no user data',
    thresholds: evaluation.thresholds,
    metrics: evaluation.metrics,
    passed: evaluation.passed,
    failures: evaluation.failures,
    sampleFailures: evaluation.sampleFailures,
    samples: rows,
    note: 'This report measures live provider behavior and deterministic validation. It does not replace independent human review of answer quality.',
  };

  const outputPath = process.env.ASTROWORLD_LIVE_SLO_REPORT_PATH ||
    path.join(process.env.RUNNER_TEMP || os.tmpdir(), `astroworld-ai-v3-live-slo-${Date.now()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });

  console.log('\n--- SLO EVALUATION ---');
  console.log(JSON.stringify({ passed: evaluation.passed, metrics: evaluation.metrics, failures: evaluation.failures, sampleFailures: evaluation.sampleFailures }, null, 2));
  console.log(`Machine-readable report written: ${outputPath}`);
  console.log(`AI V3 LIVE GEMINI SLO: ${evaluation.passed ? 'PASS' : 'FAIL'}`);

  if (!evaluation.passed) process.exitCode = 1;
}

main().catch(error => {
  console.error('AI V3 LIVE GEMINI SLO: FAIL');
  console.error(error);
  process.exitCode = 1;
});
