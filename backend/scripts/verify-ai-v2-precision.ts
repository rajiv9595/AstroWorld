/**
 * ASTROWORLD AI V2 — Phase 4E Astrological Precision Verification Suite
 * Tests precision layer separation: Natal vs Transit vs Dasha vs D10 vs Confluence vs Interpretation,
 * zero-length window rejection, promotion event evidence grounding, and the 32-scenario precision benchmark.
 */

import {
  ConsultationOrchestrator,
  ASTROLOGICAL_PRECISION_BENCHMARK,
  TemporalSanityValidator,
  validateConsultationResult,
  validateFinalResponse,
  BirthProfile,
} from '../src/ai_v2/index.ts';

const SAMPLE_PROFILE: BirthProfile = {
  name: 'Canonical Test Native',
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  second: 0,
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 'Asia/Kolkata',
  gender: 'male',
};

async function runPhase4ESuite(): Promise<void> {
  console.log('🎯 Starting AstroWorld AI V2 Phase 4E Astrological Precision Verification Suite...\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, stepName: string, detail: string): void {
    if (condition) {
      passedCount++;
      console.log(`✅ [PASSED] ${stepName}: ${detail}`);
    } else {
      failedCount++;
      console.error(`❌ [FAILED] ${stepName}: ${detail}`);
    }
  }

  const orchestrator = new ConsultationOrchestrator();
  const temporalValidator = new TemporalSanityValidator();

  // =========================================================================
  // 1. CANONICAL JUPITER TRANSIT PRECISION TEST (STEPS 1–7 & 10)
  // =========================================================================
  console.log('--- 1. CANONICAL JUPITER TRANSIT PRECISION TEST ---');

  const canonicalQuery = 'How does the upcoming transit of Jupiter support my promotion timing?';
  const canonicalResult = await orchestrator.consult(canonicalQuery, SAMPLE_PROFILE);
  const responseText = canonicalResult.finalResponse.text;
  const contextPack = canonicalResult.responsePlan.contextPack;

  console.log('[Temporary transit diagnostics]', JSON.stringify({
    plan: {
      intent: canonicalResult.questionPlan.intent,
      domain: canonicalResult.questionPlan.domain,
      temporalScope: canonicalResult.questionPlan.temporalScope,
      targetDatesIso: canonicalResult.questionPlan.targetDatesIso,
      planetFocus: canonicalResult.questionPlan.planetFocus,
      houseFocus: canonicalResult.questionPlan.houseFocus,
    },
    tools: canonicalResult.evidencePacket.toolResults.map((tool: any) => ({
      toolName: tool.toolName,
      success: tool.success,
      dataKeys: Object.keys(tool.data || {}),
      error: tool.error,
    })),
    transitFacts: canonicalResult.evidencePacket.facts.filter((fact: any) => fact.category === 'transit'),
    transitClaims: canonicalResult.approvedClaimSet.claims.filter((claim: any) => claim.factorType === 'transit'),
    transitFocus: contextPack?.transitFocus,
  }, null, 2));

  console.log('\n[Canonical Final Generated Response]:');
  console.log('--------------------------------------------------');
  console.log(responseText);
  console.log('--------------------------------------------------\n');

  // Assert 1: Transit Fact is prioritized and not confused with natal Jupiter
  assert(
    responseText.toLowerCase().includes('transit of jupiter') &&
      !responseText.includes('natal Jupiter is transiting') &&
      !responseText.includes('verified chart placement'),
    'Step 1 & 2: Transit Fact Priority & Natal Separation',
    'Jupiter transit is clearly identified as the primary subject without natal confusion'
  );

  // Assert 2: House Activation relative to Moon/Lagna is grounded
  assert(
    responseText.includes('10th house') && responseText.includes('Moon'),
    'Step 1 & 3: Grounded House Activation',
    'Activates the 10th house authority sector from natal Moon based on verified transit evidence'
  );

  // Assert 3: D10 divisional capacity & Dasha context are distinctly linked
  assert(
    (responseText.includes('D10') || responseText.includes('Dashamsha')) &&
      (responseText.includes('Dasha') || responseText.includes('Vimshottari') || responseText.includes('dasha')),
    'Step 2, 3 & 4: Multi-Layer Confluence Integration',
    'Seamlessly synthesizes D10 executive capacity and active Vimshottari dasha context'
  );

  // Assert 4: Confluence Window vs Broad Dasha Window
  const timingMention = responseText.toLowerCase().includes('timing') &&
    (responseText.includes('July 2026') || responseText.includes('2027') || responseText.includes('March 2028'));
  assert(
    timingMention &&
      !responseText.includes('2027-01-01 to 2027-01-01') &&
      !responseText.includes('July 17, 2027'),
    'Step 4 & 5: Temporal Confluence & Zero-Length Suppression',
    'Grounded in verified multi-layer confluence window without zero-length placeholder dates'
  );

  // Assert 5: Restriction & Discipline Qualification
  assert(
    responseText.toLowerCase().includes('qualification') ||
      responseText.toLowerCase().includes('patience') ||
      responseText.toLowerCase().includes('discipline') ||
      responseText.toLowerCase().includes('responsibility') ||
      responseText.toLowerCase().includes('persistence'),
    'Step 7 & 10: Structural Qualification & Non-Fatalism',
    'Balances supportive momentum with conscious patience and structured discipline'
  );

  // =========================================================================
  // 2. TEMPORAL CONFLUENCE & INTERSECTION UNIT TESTS (STEP 4 & 5)
  // =========================================================================
  console.log('\n--- 2. TEMPORAL CONFLUENCE & INTERSECTION TESTS ---');

  const testWindows: any[] = [
    {
      id: 'win_dasha',
      label: 'Vimshottari Dasha (Moon - Venus)',
      startDateIso: '2026-07-22T12:15:53.902Z',
      endDateIso: '2028-03-22T06:15:53.902Z',
      type: 'supportive_window',
    },
    {
      id: 'win_transit_2027',
      label: 'Jupiter Transit Window (2027)',
      startDateIso: '2027-01-01T00:00:00.000Z',
      endDateIso: '2027-12-31T23:59:59.000Z',
      type: 'peak_confluence_window',
    },
  ];

  const sanitized = temporalValidator.sanitizeWindows(testWindows);
  const confluence = temporalValidator.computeConfluenceWindow(sanitized);

  assert(
    confluence !== undefined &&
      confluence.periodText === 'throughout 2027' &&
      confluence.windowCategory === 'confluence_window',
    'Step 4: True Mathematical Temporal Confluence Intersection',
    `Computed exact overlap: "${confluence?.periodText}" between Dasha (July 2026–March 2028) and Transit (2027)`
  );

  // Test non-overlapping windows
  const nonOverlappingWindows: any[] = [
    {
      id: 'win_past',
      label: 'Past Dasha',
      startDateIso: '2020-01-01T00:00:00.000Z',
      endDateIso: '2022-01-01T00:00:00.000Z',
      type: 'supportive_window',
    },
    {
      id: 'win_future',
      label: 'Future Transit',
      startDateIso: '2027-01-01T00:00:00.000Z',
      endDateIso: '2027-12-31T23:59:59.000Z',
      type: 'peak_confluence_window',
    },
  ];
  const sanitizedNonOverlap = temporalValidator.sanitizeWindows(nonOverlappingWindows);
  const noConfluence = temporalValidator.computeConfluenceWindow(sanitizedNonOverlap);

  assert(
    noConfluence === undefined,
    'Step 4: Non-Overlapping Windows Return Undefined',
    'Safely returns undefined when no mathematical temporal intersection exists'
  );

  // =========================================================================
  // 3. 32-SCENARIO ASTROLOGICAL PRECISION BENCHMARK (STEP 9)
  // =========================================================================
  console.log('\n--- 3. 32-SCENARIO ASTROLOGICAL PRECISION BENCHMARK ---');

  let benchmarkPassed = 0;

  for (let i = 0; i < ASTROLOGICAL_PRECISION_BENCHMARK.length; i++) {
    const testCase = ASTROLOGICAL_PRECISION_BENCHMARK[i];
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
        `⚠️ Precision Case ${testCase.id} failed: hasExpectedKeywords=${hasExpectedKeywords}, hasForbiddenPhrases=${hasForbiddenPhrases}, withinMaxParagraphs=${withinMaxParagraphs} (${paragraphCount}/${testCase.maxParagraphs || 'N/A'})\nText: "${caseText.slice(0, 100)}..."`
      );
    }
  }

  assert(
    benchmarkPassed === ASTROLOGICAL_PRECISION_BENCHMARK.length,
    `Step 9 & 10: Astrological Precision Benchmark (${ASTROLOGICAL_PRECISION_BENCHMARK.length}/${ASTROLOGICAL_PRECISION_BENCHMARK.length})`,
    `All ${ASTROLOGICAL_PRECISION_BENCHMARK.length} precision benchmark scenarios passed layer separation, grounding, and non-fatalism criteria (100% accuracy)`
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n==================================================');
  console.log(`PHASE 4E PRECISION SUITE: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase4ESuite().catch(err => {
  console.error('Fatal error in Phase 4E Precision test suite:', err);
  process.exit(1);
});
