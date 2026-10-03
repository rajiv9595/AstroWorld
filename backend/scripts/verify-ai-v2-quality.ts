/**
 * ASTROWORLD AI V2 — Phase 4D Narrator Quality & Evidence Selection Verification Suite
 * 
 * Verifies:
 * 1. Transit-First & Focused Answer Strategy (No evidence dumping)
 * 2. Raw Engine Metadata Leakage Defense (Zero internal strings)
 * 3. Semantic Claim Budgeting & Evidence Selection
 * 4. Temporal Sanity Validation & Human Date Formatting (Zero zero-length windows, clean month/year dates)
 * 5. Complete 32-Scenario Narrator Quality Benchmark
 */

import {
  ConsultationOrchestrator,
  ResponseEvidenceSelector,
  TemporalSanityValidator,
  NARRATOR_QUALITY_BENCHMARK,
  BirthProfile,
  validateConsultationResult,
  validateFinalResponse,
} from '../src/ai_v2/index.ts';

const SAMPLE_PROFILE: BirthProfile = {
  name: 'Arjuna Dev',
  year: 1990,
  month: 10,
  day: 24,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 13.0827,
  longitude: 80.2707,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASSED] ${testName}${details ? `: ${details}` : ''}`);
    passedCount++;
  } else {
    console.error(`❌ [FAILED] ${testName}${details ? `: ${details}` : ''}`);
    failedCount++;
  }
}

async function runPhase4DSuite() {
  console.log('\n🌟 Starting AstroWorld AI V2 Phase 4D Narrator Quality Verification Suite...\n');

  const orchestrator = new ConsultationOrchestrator();
  const evidenceSelector = new ResponseEvidenceSelector();
  const temporalValidator = new TemporalSanityValidator();

  // =========================================================================
  // 1. CANONICAL JUPITER TRANSIT QUALITY & FOCUS TEST
  // =========================================================================
  console.log('--- 1. CANONICAL JUPITER TRANSIT FOCUSED ANSWER TEST ---');

  const canonicalQuery = 'How does the upcoming transit of Jupiter support my promotion timing?';
  const result = await orchestrator.consult(canonicalQuery, SAMPLE_PROFILE);

  const text = result.finalResponse.text;
  const textLower = text.toLowerCase();

  console.log('\n[Canonical Final Generated Response]:');
  console.log('--------------------------------------------------');
  console.log(text);
  console.log('--------------------------------------------------\n');

  // A. Transit-First & Answer-First Verification
  const isTransitFirst =
    textLower.startsWith('the upcoming transit of jupiter') ||
    textLower.startsWith('yes — the upcoming transit of jupiter') ||
    textLower.startsWith('jupiter');

  assert(
    isTransitFirst,
    'Step 1 & 6: Transit-First & Answer-First Delivery',
    'Response immediately leads with Jupiter transit activation and promotion momentum'
  );

  // B. Raw Engine Metadata Leakage Defense
  const forbiddenMetadataPhrases = [
    'verified chart placement',
    'primary astrological driver',
    'supporting astrological background',
    'varga_sign',
    'active_periods',
    'evidence_id',
    'rule_id',
    'source_id',
    '2026-07-22t',
    '2027-01-01 to 2027-01-01',
  ];

  const leakedPhrases = forbiddenMetadataPhrases.filter(p => textLower.includes(p));

  assert(
    leakedPhrases.length === 0,
    'Step 5 & 7: Raw Engine Metadata Leakage Defense',
    `Zero internal engine metadata strings or ISO timestamps leaked (leaked: ${leakedPhrases.join(', ') || 'none'})`
  );

  // C. Unrelated D10 Inventory Dumping Defense
  const unrelatedPlanetsInD10 = ['mars in d10', 'venus in d10', 'mercury in d10', 'rahu in d10', 'ketu in d10'];
  const hasInventoryDump = unrelatedPlanetsInD10.some(p => textLower.includes(p));

  assert(
    !hasInventoryDump,
    'Step 1 & 9: Unrelated Planetary Inventory Dumping Defense',
    'Does not enumerate entire inventory of unrelated divisional planets'
  );

  // D. Human Date Formatting & Window Sanity
  const hasHumanDates = textLower.includes('july 2026') || textLower.includes('2028') || textLower.includes('2027');

  assert(
    hasHumanDates && !textLower.includes('2027-01-01 to 2027-01-01'),
    'Step 5 & 7: Human Date Formatting & Zero-Length Window Suppression',
    'Formatted timing in natural months/years and suppressed zero-length placeholder dates'
  );

  // E. Word Count Concision (Not an essay/evidence dump)
  const wordCount = text.trim().split(/\s+/).length;
  assert(
    wordCount >= 60 && wordCount <= 300,
    'Step 3 & 9: Conversational Concision & Claim Budgeting',
    `Delivered focused response of ${wordCount} words (within 60-300 word budget, down from 730+ raw dump)`
  );

  // =========================================================================
  // 2. TEMPORAL SANITY VALIDATOR UNIT TESTS
  // =========================================================================
  console.log('\n--- 2. TEMPORAL SANITY VALIDATOR TESTS ---');

  const testWindows: any[] = [
    {
      id: 'w_valid',
      label: 'Vimshottari Dasha Window',
      startDateIso: '2026-07-22T12:00:00.000Z',
      endDateIso: '2028-03-22T06:00:00.000Z',
      type: 'supportive_window',
    },
    {
      id: 'w_zero_len',
      label: 'Zero Length Placeholder',
      startDateIso: '2027-01-01T00:00:00.000Z',
      endDateIso: '2027-01-01T00:00:00.000Z',
      type: 'peak_confluence_window',
    },
    {
      id: 'w_full_year',
      label: 'Annual Window',
      startDateIso: '2027-01-01T00:00:00.000Z',
      endDateIso: '2027-12-31T23:59:59.000Z',
      type: 'supportive_window',
    },
  ];

  const sanitized = temporalValidator.sanitizeWindows(testWindows);

  assert(
    sanitized.length === 2 && !sanitized.some(w => w.id === 'w_zero_len'),
    'Step 7: Temporal Window Zero-Length Suppression',
    'Suppressed zero-length placeholder window where start === end'
  );

  assert(
    sanitized[0].periodText === 'July 2026 to March 2028' && sanitized[1].periodText === 'throughout 2027',
    'Step 7: Human Date Range Natural Formatting',
    `Formatted cross-year span ("${sanitized[0].periodText}") and full year span ("${sanitized[1].periodText}")`
  );

  // =========================================================================
  // 3. RESPONSE EVIDENCE SELECTOR UNIT TESTS
  // =========================================================================
  console.log('\n--- 3. RESPONSE EVIDENCE SELECTOR TESTS ---');

  const rawString = 'The verified chart placement of Jupiter (position: Cancer 17° 45\' 14") acts as a primary astrological driver.';
  const normalizedString = evidenceSelector.normalizeClaimText(rawString);

  assert(
    (normalizedString === 'Jupiter in Cancer 17° 45\' 14".' || normalizedString === 'Jupiter (position: Cancer 17° 45\' 14").') &&
      !normalizedString.includes('verified chart placement') &&
      !normalizedString.includes('primary astrological driver'),
    'Step 5: Natural Language Claim Normalization',
    `Normalized text: "${normalizedString}"`
  );

  // =========================================================================
  // 4. NARRATOR QUALITY BENCHMARK (32 SCENARIOS)
  // =========================================================================
  console.log('\n--- 4. NARRATOR QUALITY BENCHMARK (32 SCENARIOS) ---');

  let benchmarkPassed = 0;

  for (let i = 0; i < NARRATOR_QUALITY_BENCHMARK.length; i++) {
    const testCase = NARRATOR_QUALITY_BENCHMARK[i];
    const caseResult = await orchestrator.consult(testCase.query, SAMPLE_PROFILE);

    const caseText = caseResult.finalResponse.text;
    const caseTextLower = caseText.toLowerCase();

    const hasExpectedKeywords = testCase.expectedKeywords.some(kw =>
      caseTextLower.includes(kw.toLowerCase())
    );

    const hasForbiddenPhrases = testCase.forbiddenPhrases.some(fp =>
      caseTextLower.includes(fp.toLowerCase())
    );

    const paragraphCount = caseText.split(/\n\n+/).length;
    const withinMaxParagraphs = testCase.maxParagraphs ? paragraphCount <= testCase.maxParagraphs : true;

    const caseValid =
      validateConsultationResult(caseResult).valid &&
      validateFinalResponse(caseResult.finalResponse).valid &&
      hasExpectedKeywords &&
      !hasForbiddenPhrases &&
      withinMaxParagraphs;

    if (caseValid) {
      benchmarkPassed++;
    } else {
      console.warn(
        `⚠️ Quality Case ${testCase.id} failed: hasExpectedKeywords=${hasExpectedKeywords}, hasForbiddenPhrases=${hasForbiddenPhrases}, withinMaxParagraphs=${withinMaxParagraphs} (${paragraphCount}/${testCase.maxParagraphs || 'N/A'})\nText: "${caseText.slice(0, 100)}..."`
      );
    }
  }

  assert(
    benchmarkPassed === NARRATOR_QUALITY_BENCHMARK.length,
    `Step 12 & 13: Narrator Quality Benchmark (${NARRATOR_QUALITY_BENCHMARK.length}/${NARRATOR_QUALITY_BENCHMARK.length})`,
    `All ${NARRATOR_QUALITY_BENCHMARK.length} quality benchmark scenarios passed concision, metadata defense, and grounding criteria (100% accuracy)`
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n==================================================');
  console.log(`PHASE 4D QUALITY SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase4DSuite().catch(err => {
  console.error('Fatal error in Phase 4D Quality test suite:', err);
  process.exit(1);
});
