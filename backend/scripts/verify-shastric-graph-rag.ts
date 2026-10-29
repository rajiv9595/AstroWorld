/**
 * ASTROWORLD — Verification Test Suite: Classical Shastric Knowledge Graph (GraphRAG)
 */

import { computeCanonicalChartWithConfiguredEphemeris } from '../src/services/ephemeris/providerRuntime.ts';
import { globalShastricGraphEngine } from '../src/ai/shastras/shastricGraphEngine.ts';

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
  console.log('📜 Starting AstroWorld Classical Shastric GraphRAG Verification...\n');

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

  // 1. Calculate Astronomical Chart
  const chart = await computeCanonicalChartWithConfiguredEphemeris(GOLDEN_PROFILE as any, new Date('2026-10-29T00:00:00Z'));
  assert('Ephemeris Chart Calculation', Boolean(chart && chart.ascendant), `Lagna: ${chart.ascendant.sign}`);

  // 2. Query Career Domain Evidence (Taurus Lagna -> Bhavartha Ratnakara)
  const careerRules = globalShastricGraphEngine.queryShastricEvidence(chart, 'career');
  assert('Career Shastric Evidence Found', careerRules.length > 0, `Retrieved ${careerRules.length} career rules`);

  const taurusYogakaraka = careerRules.find(r => r.ruleId === 'bhavartha_taurus_saturn_yogakaraka');
  assert(
    'Bhavartha Ratnakara Taurus Rule Verification',
    Boolean(taurusYogakaraka && taurusYogakaraka.sanskritVerse?.includes('वृषभस्य शनिर्योगकारकः')),
    `Citation: ${taurusYogakaraka?.sourceCitation} | Sanskrit: ${taurusYogakaraka?.sanskritVerse}`
  );

  // 3. Query Wealth Domain Evidence (Rahu in 11th -> Jataka Parijata)
  const wealthRules = globalShastricGraphEngine.queryShastricEvidence(chart, 'wealth');
  assert('Wealth Shastric Evidence Found', wealthRules.length > 0, `Retrieved ${wealthRules.length} wealth rules`);

  const rahuEleventh = wealthRules.find(r => r.ruleId === 'jataka_parijata_rahu_eleventh_labha');
  assert(
    'Jataka Parijata Rahu 11th House Verification',
    Boolean(rahuEleventh && rahuEleventh.sanskritVerse?.includes('एकादशे यदा राहुः')),
    `Citation: ${rahuEleventh?.sourceCitation} | Sanskrit: ${rahuEleventh?.sanskritVerse}`
  );

  // 4. Query Education Domain Evidence (D24 Siddhamsha -> BPHS Ch. 7, Sl. 5)
  const educationRules = globalShastricGraphEngine.queryShastricEvidence(chart, 'education');
  assert('Education Shastric Evidence Found', educationRules.length > 0, `Retrieved ${educationRules.length} education rules`);

  const d24Rule = educationRules.find(r => r.ruleId === 'bphs_d24_higher_learning_vidya');
  assert(
    'BPHS Ch. 7 Sl. 5 D24 Verification',
    Boolean(d24Rule && d24Rule.sanskritVerse?.includes('विद्याया वेदबाह्वंशे भांशे चैव बलाऽबलम्')),
    `Citation: ${d24Rule?.sourceCitation} | Sanskrit: ${d24Rule?.sanskritVerse}`
  );

  // 5. Negative Test: Chart has Taurus Lagna, so Aries/Cancer/Leo specific Lagna rules MUST NOT match
  const cancerChart = { ...chart, ascendant: { ...chart.ascendant, sign: 'Cancer' } };
  const cancerCareerRules = globalShastricGraphEngine.queryShastricEvidence(cancerChart, 'career');
  const accidentalTaurusMatch = cancerCareerRules.find(r => r.ruleId === 'bhavartha_taurus_saturn_yogakaraka');
  assert(
    'Negative Test: Predicate Isolation',
    accidentalTaurusMatch === undefined,
    'Taurus Lagna Yogakaraka rule strictly did NOT activate for Cancer Lagna chart'
  );

  console.log('\n==================================================');
  console.log(`SHASTRIC GRAPHRAG INTEGRITY: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

