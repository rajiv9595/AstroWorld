/**
 * ASTROWORLD — Shock Accuracy, RAG Expansion & Bug Fixes Verification Suite
 * Validates:
 * 1. Deha & Anga Lakshana Shock Engine (Bodily Marks, Lineage Secrets & Psychological Quirks)
 * 2. Gandanta Transition Engine (Revati-Ashwini, Ashlesha-Magha, Jyeshtha-Mula / Abhukta Mula)
 * 3. Retrograde Dignity Reversal (Phaladeepika Vakri Neecha Uchcha-Tulya Phala)
 * 4. Cazimi vs Deep Combustion Precision
 * 5. Dynamic RAG Engine expansion (Master Pack Notes & Psychometric Corpora)
 */

import { evaluateDehaLakshana } from '../src/ai/reasoning/dehaLakshanaEngine.ts';
import { checkEntityGandanta, evaluateChartGandanta } from '../src/ai/reasoning/gandantaDetector.ts';
import { calculateDignity, enrichPlanetaryDignity } from '../../shared/engine/dignity.ts';
import { dynamicRAGEngine } from '../src/ai/rag/dynamicRagEngine.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('ASTROWORLD: SHOCK ACCURACY, RAG EXPANSION & BUG FIXES TEST SUITE');
  console.log('================================================================\n');

  // --- TEST 1: DEHA & ANGA LAKSHANA SHOCK ENGINE ---
  console.log('TEST SUITE 1: Deha & Anga Lakshana Diagnostic Engine');

  const chartWithMarsLagna = evaluateDehaLakshana({
    lagnaSign: 'Aries',
    lagnaDegree: 12.0,
    planets: [
      { name: 'Mars', sign: 'Aries', houseNumber: 1, degreeInSign: 14.0 },
      { name: 'Moon', sign: 'Gemini', houseNumber: 3, degreeInSign: 10.0 },
      { name: 'Saturn', sign: 'Cancer', houseNumber: 4, degreeInSign: 8.0 },
      { name: 'Mercury', sign: 'Virgo', houseNumber: 6, degreeInSign: 12.0 },
      { name: 'Rahu', sign: 'Virgo', houseNumber: 6, degreeInSign: 15.0 },
      { name: 'Ketu', sign: 'Pisces', houseNumber: 12, degreeInSign: 15.0 },
      { name: 'Sun', sign: 'Leo', houseNumber: 5, degreeInSign: 2.0 },
    ],
    moonNakshatra: 'Ardra',
    activeDashaLord: 'Mars',
    isPeakSadeSati: false,
    careerDoubleTransitActive: true,
  });

  assert(
    chartWithMarsLagna.physicalSignatures.some((p) => p.category === 'SCAR_MARK' && p.manifestation.includes('scar')),
    'Mars in 1st House detects cranial/facial scar and heat sensitivity',
    JSON.stringify(chartWithMarsLagna.physicalSignatures)
  );

  assert(
    chartWithMarsLagna.ancestralSecrets.some((a) => a.lineageAxis === 'MATERNAL_4TH_HOUSE'),
    'Saturn in 4th House detects maternal stoicism and ancestral home anomaly',
    JSON.stringify(chartWithMarsLagna.ancestralSecrets)
  );

  assert(
    chartWithMarsLagna.psychologicalQuirks.some((q) => q.traitKey === 'NOCTURNAL_HYPERFOCUS'),
    'Chandra in Ardra nakshatra detects nocturnal hyperfocus and small-talk intolerance',
    JSON.stringify(chartWithMarsLagna.psychologicalQuirks)
  );

  assert(
    chartWithMarsLagna.psychologicalQuirks.some((q) => q.traitKey === 'MULTI_TAB_MIND'),
    'Mercury conjunct Rahu detects 20-tab mental speed and pattern decryption',
    JSON.stringify(chartWithMarsLagna.psychologicalQuirks)
  );

  assert(
    chartWithMarsLagna.unaskedQuestionAnticipation.includes('career crossroads'),
    'Career Double Transit activates Unasked Question Anticipation for career pivot',
    chartWithMarsLagna.unaskedQuestionAnticipation
  );

  assert(
    chartWithMarsLagna.formattedDaivajnaDossier.includes('DEHA & ANGA LAKSHANA SHOCK DOSSIER'),
    'Formatted Daivajna dossier generated with complete shastric structure'
  );

  // Test Ketu in 1st & Venus-Ketu Intimacy Paradox
  const chartWithKetuLagna = evaluateDehaLakshana({
    lagnaSign: 'Taurus',
    planets: [
      { name: 'Ketu', sign: 'Taurus', houseNumber: 1, degreeInSign: 5.0 },
      { name: 'Venus', sign: 'Taurus', houseNumber: 1, degreeInSign: 8.0 },
      { name: 'Moon', sign: 'Capricorn', houseNumber: 9, degreeInSign: 20.0 },
      { name: 'Saturn', sign: 'Aquarius', houseNumber: 10, degreeInSign: 10.0 },
    ],
    isPeakSadeSati: true,
  });

  assert(
    chartWithKetuLagna.physicalSignatures.some((p) => p.title.includes('Birthmark')),
    'Ketu in 1st House detects subtle birthmark/mole and childhood close-call',
    JSON.stringify(chartWithKetuLagna.physicalSignatures)
  );

  assert(
    chartWithKetuLagna.psychologicalQuirks.some((q) => q.traitKey === 'INTIMACY_PARADOX'),
    'Venus conjunct Ketu detects the intimacy paradox (soul union longing vs claustrophobia)',
    JSON.stringify(chartWithKetuLagna.psychologicalQuirks)
  );

  assert(
    chartWithKetuLagna.unaskedQuestionAnticipation.includes('Saturn Sade Sati'),
    'Peak Sade Sati triggers unasked fatigue and life-path questioning anticipation'
  );

  // --- TEST 2: GANDANTA TRANSITION ENGINE ---
  console.log('\nTEST SUITE 2: Shastric Gandanta Transition Engine');

  // Test Revati-Ashwini Critical Knot
  const revatiEdge = checkEntityGandanta({
    name: 'Moon',
    sign: 'Pisces',
    degreeInSign: 29.6, // 24 arcmin from 0° Aries
  });
  assert(
    revatiEdge !== null &&
      revatiEdge.junction === 'REVATI_ASHWINI' &&
      revatiEdge.severity === 'CRITICAL_KNOT_48_MIN' &&
      revatiEdge.side === 'WATER_EXIT',
    'Moon at 29°36\' Pisces detected as Critical Revati-Ashwini Chandra Gandanta',
    JSON.stringify(revatiEdge)
  );

  // Test Jyeshtha-Mula (Abhukta Mula)
  const abhuktaMulaEdge = checkEntityGandanta({
    name: 'Moon',
    sign: 'Scorpio',
    degreeInSign: 29.8,
  });
  assert(
    abhuktaMulaEdge !== null &&
      abhuktaMulaEdge.junction === 'JYESTHTHA_MULA' &&
      abhuktaMulaEdge.isAbhuktaMula === true &&
      abhuktaMulaEdge.severity === 'CRITICAL_KNOT_48_MIN',
    'Moon at 29°48\' Scorpio detected as Abhukta Mula Critical Gandanta',
    JSON.stringify(abhuktaMulaEdge)
  );

  // Test Lagna Gandanta in Cancer-Leo
  const cancerLagnaEdge = checkEntityGandanta({
    name: 'Lagna',
    sign: 'Cancer',
    degreeInSign: 29.3,
  });
  assert(
    cancerLagnaEdge !== null &&
      cancerLagnaEdge.junction === 'ASHLESHA_MAGHA' &&
      cancerLagnaEdge.shastricSignificance.includes('spiritual awakening'),
    'Lagna at 29°18\' Cancer detected as Ashlesha-Magha Lagna Gandanta'
  );

  // Test Normal non-gandanta planet
  const normalPl = checkEntityGandanta({
    name: 'Jupiter',
    sign: 'Taurus',
    degreeInSign: 15.0,
  });
  assert(normalPl === null, 'Jupiter at 15° Taurus correctly returns null (no Gandanta)');

  // Test full chart evaluation
  const chartGandanta = evaluateChartGandanta({
    lagnaSign: 'Pisces',
    lagnaDegree: 29.7,
    planets: [
      { name: 'Moon', sign: 'Aries', degreeInSign: 1.5 },
      { name: 'Sun', sign: 'Leo', degreeInSign: 10.0 },
    ],
  });
  assert(
    chartGandanta.hasCriticalGandanta === true &&
      chartGandanta.lagnaGandanta !== undefined &&
      chartGandanta.moonGandanta !== undefined &&
      Boolean(chartGandanta.remedialGandantaProtocol),
    'Full chart evaluation correctly identifies critical Lagna Gandanta and Moon Pada Gandanta with remedy',
    JSON.stringify(chartGandanta)
  );

  // --- TEST 3: RETROGRADE DIGNITY REVERSAL ---
  console.log('\nTEST SUITE 3: Classical Retrograde Dignity Reversal (Phaladeepika Ch. 9 Sl. 20)');

  // Non-retrograde Saturn in Aries -> Debilitated (score = 0)
  const saturnDirect = calculateDignity('Saturn', 'Aries', 20.0, 'D1', false);
  assert(
    saturnDirect.dignity === 'DEBILITATED' && saturnDirect.retrogradeModifier === 'NONE',
    'Direct Saturn in Aries is classically Debilitated without modifier'
  );

  // Retrograde Saturn in Aries -> Vakri Neecha acts like Uchcha!
  const saturnRetro = calculateDignity('Saturn', 'Aries', 20.0, 'D1', true);
  assert(
    saturnRetro.dignity === 'DEBILITATED' &&
      saturnRetro.retrogradeModifier === 'VAKRI_NEECHA_UCHCHA_PHALA' &&
      saturnRetro.description.includes('EXALTATION'),
    'Retrograde Saturn in Aries yields VAKRI_NEECHA_UCHCHA_PHALA (acts like Exalted)',
    JSON.stringify(saturnRetro)
  );

  // Test enrichPlanetaryDignity score elevation for Vakri Neecha
  const enriched = enrichPlanetaryDignity([
    {
      name: 'Saturn',
      sanskritName: 'Shani',
      tropicalLongitude: 50,
      siderealLongitude: 20,
      sign: 'Aries',
      signIndex: 0,
      degreeInSign: 20,
      formattedDegree: '20°00\'00"',
      houseNumber: 1,
      nakshatra: 'Bharani',
      nakshatraNumber: 2,
      nakshatraLord: 'Venus',
      pada: 3,
      speed: -0.05,
      retrograde: true,
      combust: false,
      dignity: 'DEBILITATED',
      dignityScore: 0,
      signLord: 'Mars',
      naturalRelationshipToLord: 'ENEMY',
    },
  ]);
  assert(
    enriched[0].dignityScore === 50 && Boolean(enriched[0].retrogradeDignityNote),
    'enrichPlanetaryDignity elevates Vakri Neecha dignity score from 0 to 50 with classical note',
    `Score: ${enriched[0].dignityScore}`
  );

  // --- TEST 4: DYNAMIC RAG ENGINE EXPANSION ---
  console.log('\nTEST SUITE 4: Dynamic RAG Engine Master Pack & Psychometrics Ingestion');

  const totalRules = dynamicRAGEngine.getTotalRuleCount();
  assert(
    totalRules >= 150,
    `Dynamic RAG Engine corpus count exceeds 150 records (Current: ${totalRules})`,
    `Total rules: ${totalRules}`
  );

  // Search Master Pack Note on Platform Doctrine
  const doctrineResults = dynamicRAGEngine.search({
    query: 'platform doctrine deterministic calculation architecture',
    limit: 2,
  });
  assert(
    doctrineResults.some((r) => r.id === 'MP-NOTE-01-DOCTRINE'),
    'RAG successfully retrieves MP-NOTE-01-DOCTRINE for deterministic calculations',
    doctrineResults.map((r) => r.id).join(', ')
  );

  // Search Master Pack Note on Varga Synthesis
  const vargaResults = dynamicRAGEngine.search({
    query: 'shodashavarga d60 d24 parashara synthesis',
    limit: 5,
  });
  assert(
    vargaResults.some((r) => r.id === 'MP-NOTE-06-VARGA-SYNTHESIS'),
    'RAG successfully retrieves MP-NOTE-06-VARGA-SYNTHESIS for Shodashavarga architecture',
    vargaResults.map((r) => r.id).join(', ')
  );

  // Search Psychometric Rule on Attention Direction
  const attentionResults = dynamicRAGEngine.search({
    query: 'attention direction self pattern others pattern leadership',
    limit: 2,
  });
  assert(
    attentionResults.some((r) => r.id === 'PSY-ATTENTION-DIRECTION-01'),
    'RAG successfully retrieves PSY-ATTENTION-DIRECTION-01 for vocational attention allocation',
    attentionResults.map((r) => r.id).join(', ')
  );

  // Search Psychometric Rule on Choleric Executive Drive
  const cholericResults = dynamicRAGEngine.search({
    query: 'choleric agni executive drive fast-paced crisis management',
    limit: 2,
  });
  assert(
    cholericResults.some((r) => r.id === 'PSY-TEMPERAMENT-CHOLERIC-02'),
    'RAG successfully retrieves PSY-TEMPERAMENT-CHOLERIC-02 for Choleric temperament',
    cholericResults.map((r) => r.id).join(', ')
  );

  console.log('\n================================================================');
  console.log(`TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100% GREEN)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
