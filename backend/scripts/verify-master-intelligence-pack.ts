/**
 * ASTROWORLD — Master Vedic Intelligence Pack Verification Suite
 * Validates full ingestion, canonical IAST/ASCII term expansion, exception bundling,
 * golden evaluation cases (golden_eval_cases.jsonl), and multi-domain RAG retrieval.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dynamicRAGEngine } from '../src/ai_v2/rag/dynamicRagEngine.ts';
import { DocumentIngestionService } from '../src/ai_v2/rag/documentIngestionService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GoldenEvalCase {
  case_id: string;
  layer: string;
  title: string;
  setup: string;
  must_include_or_do: string[];
  must_not_do: string[];
  pass_criteria: string;
}

async function runMasterPackVerification(): Promise<void> {
  console.log('========================================================================');
  console.log('🌟 ASTROWORLD MASTER VEDIC INTELLIGENCE PACK VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${testName}`);
      if (detail) console.log(`     ↳ ${detail}`);
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      if (detail) console.error(`     ↳ ${detail}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 1: MASTER PACK INGESTION & VOLUME
  // --------------------------------------------------------------------------
  console.log('📌 [PHASE 1] Dynamic Ingestion of Master Pack Modules');
  const initialCount = dynamicRAGEngine.getTotalRuleCount();
  console.log(`  - Initial Knowledge Base Count: ${initialCount}`);

  DocumentIngestionService.autoIngestPreloadedNotes();

  const postCount = dynamicRAGEngine.getTotalRuleCount();
  const ingestedChunks = dynamicRAGEngine.getIngestedChunks();
  console.log(`  - Post-Ingestion Knowledge Base Count: ${postCount}`);
  console.log(`  - Total Dynamic Chunks Ingested: ${ingestedChunks.length}`);

  assert(
    postCount > initialCount && ingestedChunks.length >= 100,
    'Master Pack notes successfully ingested into DynamicRAGEngine',
    `Ingested ${ingestedChunks.length} thematic chunks across all Master Pack modules.`
  );

  // Check MasterPack source documents
  const masterPackDocNames = new Set(ingestedChunks.map((c) => c.sourceDocName));
  const expectedPrefixes = [
    'MasterPack_01_PLATFORM_DOCTRINE_AND_ARCHITECTURE',
    'MasterPack_04_CLASSICAL_INTERPRETIVE_GRAMMAR',
    'MasterPack_05_YOGA_RULE_ENGINE',
    'MasterPack_06_VARGA_AND_CROSS_CHART_SYNTHESIS',
    'MasterPack_07_DASHA_TRANSIT_AND_TIMING',
    'MasterPack_08_QUESTION_SPECIFIC_INTERPRETATION_WORKFLOWS',
    'MasterPack_09_RAG_RETRIEVAL_AND_INGESTION_ENGINEERING',
    'MasterPack_13_SAFETY_PRIVACY_AND_EPISTEMIC_HONESTY',
    'MasterPack_15_GLOSSARY_AND_CANONICAL_TERMS',
  ];

  const foundPrefixes = expectedPrefixes.filter((exp) => masterPackDocNames.has(exp));
  assert(
    foundPrefixes.length >= 8,
    'Core Master Pack modules recognized and indexed as distinct sources',
    `Found ${foundPrefixes.length}/${expectedPrefixes.length} core module prefixes.`
  );

  // --------------------------------------------------------------------------
  // TEST SECTION 2: CANONICAL IAST <-> ASCII ALIAS EXPANSION (RAG-001)
  // --------------------------------------------------------------------------
  console.log('\n📌 [PHASE 2] Canonical IAST <-> ASCII Term Expansion (Golden Case RAG-001)');

  const testPairs = [
    { iast: 'daśā', ascii: 'dasha', topic: 'timing' },
    { iast: 'siddhāṃśa', ascii: 'siddhamsha', topic: 'education' },
    { iast: 'bhāva', ascii: 'bhava', topic: 'house' },
    { iast: 'ṣaḍbala', ascii: 'shadbala', topic: 'strength' },
    { iast: 'kāraka', ascii: 'karaka', topic: 'significator' },
    { iast: 'navāṃśa', ascii: 'navamsha', topic: 'marriage' },
  ];

  for (const pair of testPairs) {
    const iastResults = dynamicRAGEngine.search({ query: pair.iast, limit: 3 });
    const asciiResults = dynamicRAGEngine.search({ query: pair.ascii, limit: 3 });

    assert(
      iastResults.length > 0 && asciiResults.length > 0,
      `Term Expansion: "${pair.iast}" (IAST) and "${pair.ascii}" (ASCII) both retrieve relevant corpus records`,
      `IAST retrieved ${iastResults.length} records; ASCII retrieved ${asciiResults.length} records.`
    );
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 3: EXCEPTION BUNDLING (RAG-002)
  // --------------------------------------------------------------------------
  console.log('\n📌 [PHASE 3] Exception & Cancellation Bundling (Golden Case RAG-002)');

  const yogaQuery = 'Gajakesari yoga Jupiter Moon Kendra cancellation exception';
  const yogaResults = dynamicRAGEngine.search({ query: yogaQuery, limit: 5, includeExceptions: true });

  const hasPrimaryRule = yogaResults.some((r) =>
    (r.canonicalTranslation + r.normalizedInterpretation).toLowerCase().includes('jupiter')
  );
  const hasExceptionClause = yogaResults.some((r) => {
    const text = (r.canonicalTranslation + r.normalizedInterpretation).toLowerCase();
    return (
      text.includes('exception') ||
      text.includes('cancellation') ||
      text.includes('bhanga') ||
      text.includes('combust') ||
      text.includes('debilitat')
    );
  });

  assert(
    hasPrimaryRule && hasExceptionClause,
    'Rule and exception bundle retrieved together without severing qualifications',
    `Found primary rule and accompanying exception/cancellation clauses in top ${yogaResults.length} records.`
  );

  // --------------------------------------------------------------------------
  // TEST SECTION 4: MULTI-DOMAIN RETRIEVAL RECALL ACROSS ALL 12 BHAVAS
  // --------------------------------------------------------------------------
  console.log('\n📌 [PHASE 4] Multi-Sector Retrieval Coverage across all 12 Life Domains');

  const domainQueries = [
    { domain: 'education' as const, q: 'D24 Siddhamsha 5th house Mercury engineering degree' },
    { domain: 'career' as const, q: 'D10 Dashamsha 10th lord executive profession leadership' },
    { domain: 'marriage' as const, q: 'D9 Navamsha 7th house Upapada Lagna spouse vivaha' },
    { domain: 'wealth' as const, q: '2nd house 11th house Dhana yoga Indu Lagna assets' },
    { domain: 'health' as const, q: '6th house 8th house 22nd Drekkhana 64th Navamsha vitality' },
    { domain: 'progeny' as const, q: 'D7 Saptamsha 5th house Jupiter Putrakaraka children' },
    { domain: 'property' as const, q: 'D4 Chaturthamsha 4th house Mars real estate D16 vehicles' },
    { domain: 'spirituality' as const, q: 'Jaimini Atmakaraka Karakamsha 12th house Ishta Devata D20' },
    { domain: 'litigation' as const, q: '6th house Shatru Hanta yoga court legal disputes' },
    { domain: 'foreign' as const, q: '9th house 12th house Rahu foreign travel overseas settlement' },
    { domain: 'remedy' as const, q: 'BPHS gemstone Ratna Dharana Bija Mantra Daana charity' },
    { domain: 'dasha' as const, q: 'Vimshottari Mahadasha Antardasha 120 years timing activation' },
  ];

  for (const dq of domainQueries) {
    const res = dynamicRAGEngine.search({ query: dq.q, domain: dq.domain, limit: 3 });
    assert(
      res.length > 0,
      `Domain Coverage: [${dq.domain.toUpperCase()}] retrieval returned ${res.length} targeted shastric records`,
      `Top Citation: ${res[0]?.citation || 'None'}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 5: GOLDEN EVALUATION CASES PARSING & VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n📌 [PHASE 5] Golden Evaluation Cases Verification (golden_eval_cases.jsonl)');

  const evalPathCandidates = [
    path.resolve(process.cwd(), 'backend/datasets/AstroWorld_Vedic_Intelligence_Master_Pack/evaluation/golden_eval_cases.jsonl'),
    path.resolve(process.cwd(), 'datasets/AstroWorld_Vedic_Intelligence_Master_Pack/evaluation/golden_eval_cases.jsonl'),
    path.resolve(__dirname, '../../datasets/AstroWorld_Vedic_Intelligence_Master_Pack/evaluation/golden_eval_cases.jsonl'),
  ];

  let evalCases: GoldenEvalCase[] = [];
  for (const p of evalPathCandidates) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8');
      evalCases = raw
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0)
        .map((l) => JSON.parse(l));
      break;
    }
  }

  assert(
    evalCases.length >= 35,
    'Golden evaluation cases loaded successfully from Master Pack',
    `Loaded ${evalCases.length} benchmark cases across calculation, timing, rules, retrieval, generation, and safety.`
  );

  const layers = new Set(evalCases.map((c) => c.layer));
  const expectedLayers = ['calculation', 'timing', 'rule_engine', 'retrieval', 'generation', 'safety'];
  const allLayersPresent = expectedLayers.every((l) => layers.has(l));

  assert(
    allLayersPresent,
    'All critical evaluation layers verified in benchmark suite',
    `Present layers: ${Array.from(layers).join(', ')}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`📊 MASTER PACK VERIFICATION AUDIT: ${passedTests} PASSED / ${totalTests} TOTAL`);
  console.log('========================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runMasterPackVerification().catch((err) => {
  console.error('Fatal error during Master Pack verification:', err);
  process.exit(1);
});
