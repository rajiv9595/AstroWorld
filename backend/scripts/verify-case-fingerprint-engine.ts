/**
 * ASTROWORLD — Verification Test Suite: Astronomical Fingerprint & Case Twin Engine
 */

import { computeCanonicalChartWithConfiguredEphemeris } from '../src/services/ephemeris/providerRuntime.ts';
import { generateChartFingerprintVector, calculateCosineSimilarity, FINGERPRINT_VECTOR_DIMENSIONS } from '../src/ai/cases/chartFingerprint.ts';
import { globalCaseStudyRepository } from '../src/ai/cases/caseStudyRepository.ts';

const GOLDEN_PROFILE = {
  name: 'Canonical Test Native',
  year: 2005,
  month: 8,
  day: 17,
  hour: 0,
  minute: 2,
  latitude: 16.9037,
  longitude: 81.9961,
  timezone: 'Asia/Kolkata',
  cityName: 'Anaparthy, Andhra Pradesh, India',
};

async function main() {
  console.log('🌌 Starting AstroWorld Astronomical Fingerprint & Case Twin Engine Verification...\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string) {
    if (condition) {
      passed++;
      console.log(`✅ [PASSED] ${name}: ${detail}`);
    } else {
      failed++;
      console.error(`❌ [FAILED] ${name}: ${detail}`);
    }
  }

  // 1. Generate Canonical Chart from Ephemeris
  const chart = await computeCanonicalChartWithConfiguredEphemeris(GOLDEN_PROFILE as any, new Date('2026-10-29T00:00:00Z'));
  assert('Ephemeris Chart Generation', Boolean(chart && chart.ascendant), `Lagna: ${chart.ascendant.sign} (${chart.ascendant.formattedDegree})`);

  // 2. Generate 65-dimensional Mathematical Chart Fingerprint Vector
  const fp = generateChartFingerprintVector(chart, {
    mahadasha: 'Moon',
    antardasha: 'Rahu',
    elapsedFraction: 0.39,
  }, {
    saturnSignIndex: 11, // Pisces (11th house from Taurus)
    jupiterSignIndex: 3,  // Cancer (3rd house from Taurus)
    rahuSignIndex: 10,    // Aquarius (10th house from Taurus)
  });

  assert(
    'Fingerprint Vector Dimensions',
    fp.embeddingVector.length === FINGERPRINT_VECTOR_DIMENSIONS,
    `Generated vector length: ${fp.embeddingVector.length} (expected ${FINGERPRINT_VECTOR_DIMENSIONS})`
  );

  assert(
    'Lagna & Moon Sign Integrity',
    fp.lagnaSign === 'Taurus' && fp.moonSign === 'Sagittarius',
    `Lagna: ${fp.lagnaSign}, Janma Rashi: ${fp.moonSign}`
  );

  assert(
    'Double-Transit Activation Detection',
    Array.isArray(fp.transitsAtEvent?.doubleTransitHouses),
    `Double transit houses: [${fp.transitsAtEvent?.doubleTransitHouses.join(', ')}]`
  );

  // 3. Test Cosine Similarity Self-Check (Identity Test)
  const selfSim = calculateCosineSimilarity(fp.embeddingVector, fp.embeddingVector);
  assert(
    'Vector Identity Cosine Similarity',
    Math.abs(selfSim - 1.0) < 0.0001,
    `Self-similarity: ${selfSim.toFixed(4)} (pure 1.0)`
  );

  // 4. Test Top-K Case Twin Analogs Matching
  const matches = await globalCaseStudyRepository.findTwinAnalogs(fp, {
    domain: 'career',
    limit: 3,
  });

  assert(
    'Top-K Career Twin Matching',
    matches.length > 0,
    `Retrieved ${matches.length} matching career case twins`
  );

  const topMatch = matches[0];
  console.log(`\n🏆 Top Case Twin: "${topMatch.caseStudy.title}"`);
  console.log(`   - Combined Match Index: ${topMatch.combinedMatchIndex}/100`);
  console.log(`   - Cosine Similarity: ${(topMatch.cosineSimilarity * 100).toFixed(1)}%`);
  console.log(`   - Shastric Congruence: ${(topMatch.shastricCongruenceScore * 100).toFixed(1)}%`);
  console.log(`   - Matching Signatures: ${topMatch.matchingSignatures.join('; ')}`);
  console.log(`   - Historical Outcome: ${topMatch.caseStudy.historicalOutcome}\n`);

  assert(
    'Taurus Lagna Career Twin Found',
    topMatch.caseStudy.chartFingerprint.lagnaSign === 'Taurus',
    `Matched case has same Lagna: ${topMatch.caseStudy.chartFingerprint.lagnaSign}`
  );

  // 5. Test Batch Ingestion API
  const newCase = {
    id: 'case_test_batch_0099',
    slug: 'gemini-lagna-venture-funding',
    title: 'Gemini Lagna DeepTech Series-A Venture Funding Round',
    domain: 'wealth' as const,
    birthYear: 1994,
    birthMonth: 3,
    birthDay: 12,
    birthHour: 11,
    birthMinute: 30,
    birthLatitude: 17.3850,
    birthLongitude: 78.4867,
    birthTimezone: 'Asia/Kolkata',
    eventTitle: 'Series-A Close of $12M',
    eventDateIso: '2023-09-15',
    eventAge: 29.5,
    historicalOutcome: 'Founder closed $12M Series-A round led by tier-1 global venture fund.',
    shastricRootCause: 'Jupiter transit over 11th house in Aries with 32 SAV bindus.',
    provenanceReference: 'AstroWorld Venture Archives #99',
    authenticityGrade: 'A' as const,
    chartFingerprint: fp,
    embeddingVector: fp.embeddingVector,
    verificationStatus: 'verified' as const,
  };

  const ingestRes = await globalCaseStudyRepository.ingestBatch([newCase]);
  assert(
    'Batch Case Ingestion',
    ingestRes.ingested === 1 && ingestRes.errors.length === 0,
    `Successfully ingested ${ingestRes.ingested} new case study (errors: ${ingestRes.errors.length})`
  );

  console.log('\n==================================================');
  console.log(`FINGERPRINT & CASE TWIN ENGINE: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
