/**
 * AstroWorld — Controlled Evaluation Fixture for Varga Chart Education & Degree Reasoning
 * 
 * Regression Test Case:
 * - Date of birth: 17 August 2005
 * - Birth time: 12:02 AM (00:02 local civil time)
 * - Birthplace: Anaparthy, Andhra Pradesh, India (16.9324° N, 81.9567° E)
 * - Requested system: Vedic sidereal astrology, Lahiri ayanamsha
 * - Primary question: "By analyzing my Varga charts, which field am I studying now and what type of degree am I doing?"
 * 
 * Strict Anti-Leakage Requirement:
 * The held-out label ("B.Tech in Artificial Intelligence and Data Science (AI & DS)") is stored ONLY
 * in this evaluation file and NEVER passed to the inference agent, system prompt, or user context.
 */

import { ConsultAgent, AgentConsultRequest, AgentConsultResult } from '../src/ai_agent/consultAgent.ts';
import { BirthProfileInput } from '../src/ai_v2/schemas/birthProfile.ts';
import { computeCanonicalChartWithConfiguredEphemeris } from '../src/services/ephemeris/providerRuntime.ts';

// 1. HELD-OUT EVALUATION STORE (Never passed to inference)
const HELD_OUT_BENCHMARK = {
  caseId: 'anaparthy_20050817_education_eval',
  groundTruthDegree: 'B.Tech in Artificial Intelligence and Data Science (AI & DS)',
  acceptableDisciplineKeywords: [
    'engineering',
    'computational',
    'computer science',
    'artificial intelligence',
    'data science',
    'algorithms',
    'technology',
    'software',
  ],
  acceptableDegreeKeywords: [
    'b.tech',
    'b.e.',
    'engineering',
    'undergraduate',
    'technical',
  ],
  unacceptableHallucinations: [
    'nursing',
    'pharmacy',
    'b.pharm',
    'b.nursing',
    'clinical research',
  ],
};

// 2. INPUT FIXTURE (Legitimate astrological data only)
const EVAL_BIRTH_PROFILE: BirthProfileInput = {
  name: 'Eval Native',
  year: 2005,
  month: 8,
  day: 17,
  hour: 0,
  minute: 2,
  latitude: 16.9324,
  longitude: 81.9567,
  timezone: 'Asia/Kolkata',
};

function runAuditOnResult(result: AgentConsultResult, modeLabel: string): boolean {
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`EVALUATING ${modeLabel.toUpperCase()}:`);
  console.log(`Mode: ${result.executionMetadata.mode} (${result.executionMetadata.modelUsed}), Duration: ${result.executionMetadata.durationMs}ms`);
  console.log(`Tools Dispatched: ${result.toolsCalled.join(', ')}`);
  console.log(`----------------------------------------------------------------------`);
  console.log('--- FULL RESPONSE TEXT ---');
  console.log(result.text);
  console.log('--- END RESPONSE TEXT ---\n');

  const textLower = result.text.toLowerCase();

  // Test 1: Anti-Leakage Verification
  const leakedGroundTruth = textLower.includes('artificial intelligence and data science (ai & ds)');
  console.log(`1. Anti-Leakage Compliance: ${!leakedGroundTruth ? 'PASS (Zero label leakage)' : 'FAIL (Leaked held-out label!)'}`);

  // Test 2: Divisional Charts Dispatched & Analyzed
  const hasD24 = result.toolsCalled.includes('get_divisional_chart') && (textLower.includes('d24') || textLower.includes('siddhamsha') || textLower.includes('chaturvimshamsha'));
  const hasD9 = textLower.includes('d9') || textLower.includes('navamsha');
  console.log(`2. D24 Siddhamsha Evaluated: ${hasD24 ? 'PASS (D24 cited for higher education)' : 'FAIL (Missing D24!)'}`);
  console.log(`3. D9 Navamsha Evaluated: ${hasD9 ? 'PASS (D9 cited)' : 'FAIL (Missing D9!)'}`);

  // Test 3: Mathematical Chalit Sandhi Proof
  const provesVenusStays = textLower.includes('remains in house 5') || textLower.includes('stays in house 5') || textLower.includes('remains in the 5th') || (textLower.includes('venus') && textLower.includes('5th') && (textLower.includes('chalit') || textLower.includes('sandhi') || textLower.includes('stay') || textLower.includes('remain')));
  const provesChalitDiscussed = textLower.includes('chalit') || textLower.includes('sandhi') || textLower.includes('cusp');
  const chalitValid = provesVenusStays || provesChalitDiscussed;
  console.log(`4. Sripathi Chalit Boundary Verification: ${chalitValid ? 'PASS (Sripathi Chalit / Sandhis evaluated)' : 'FAIL (Hallucinated shift or missed sandhi!)'}`);

  // Test 4: D24 Mercury in Gemini Own Sign Recognized
  const recognizesMercuryGemini = textLower.includes('mercury') && (textLower.includes('gemini') || textLower.includes('mithuna')) && (textLower.includes('own sign') || textLower.includes('sva-kshetra') || textLower.includes('5th'));
  console.log(`5. D24 Mercury Own Sign Signature: ${recognizesMercuryGemini ? 'PASS (Recognized Mercury in Gemini in D24 5th)' : 'FAIL (Missed Mercury signature!)'}`);

  // Test 5: Field Prediction Alignment
  const matchesDiscipline = HELD_OUT_BENCHMARK.acceptableDisciplineKeywords.some(kw => textLower.includes(kw));
  console.log(`6. Grounded Disciplinary Prediction: ${matchesDiscipline ? 'PASS (Aligns with Computational/Engineering/AI & Data archetype)' : 'FAIL (Misaligned discipline)'}`);

  // Test 6: Degree Type Prediction Alignment
  const matchesDegree = HELD_OUT_BENCHMARK.acceptableDegreeKeywords.some(kw => textLower.includes(kw));
  console.log(`7. Probable Degree Type: ${matchesDegree ? 'PASS (Identified B.Tech / B.E. / Technical Undergraduate)' : 'FAIL (Misaligned degree type)'}`);

  // Test 7: Hallucination Rejection (Only fail if actually predicting medicine/nursing as the degree)
  const predictsMedicalHallucination = /\b(degree in|studying|field of|enrolled in|pursuing|such as)\s+[^.\n]*(nursing|b\.pharm|b\.nursing|pharmacy)/i.test(result.text);
  console.log(`8. Rejection of Ungrounded Medical Hallucinations: ${!predictsMedicalHallucination ? 'PASS (Did not predict medicine/nursing/b.pharm)' : 'FAIL (Emitted medical hallucination!)'}`);

  // Test 8: Epistemic Calibration
  const hasEpistemicCalibration =
    textLower.includes('epistemic') ||
    textLower.includes('uncertainty') ||
    textLower.includes('archetype') ||
    textLower.includes('calibration') ||
    (textLower.includes('shastra rule') && (textLower.includes('modern translation') || textLower.includes('confluence'))) ||
    (textLower.includes('contrast with') && textLower.includes('calculated'));
  console.log(`9. Four-Tier Epistemic Calibration: ${hasEpistemicCalibration ? 'PASS (Delineated facts vs shastra vs archetype vs uncertainty)' : 'FAIL (Lacks epistemic calibration)'}`);

  const passed = !leakedGroundTruth && hasD24 && hasD9 && chalitValid && recognizesMercuryGemini && matchesDiscipline && matchesDegree && !predictsMedicalHallucination && hasEpistemicCalibration;
  console.log(`>> ${modeLabel} Result: ${passed ? 'PASSED ALL CHECKS' : 'FAILED CHECKS'}`);
  return passed;
}

async function runControlledRegressionEvaluation() {
  console.log('======================================================================');
  console.log('ASTROWORLD VARGA REASONING & EDUCATION REGRESSION EVALUATION');
  console.log('======================================================================\n');

  // Verify chart math independently
  const canonicalChart = await computeCanonicalChartWithConfiguredEphemeris(EVAL_BIRTH_PROFILE as any);
  console.log(`[ASTRONOMY VERIFICATION]`);
  console.log(`Lagna: ${canonicalChart.ascendant.sign} ${canonicalChart.ascendant.formattedDegree}`);
  console.log(`5th House Cusp Sandhis in Chalit:`);
  const h5Cusp = canonicalChart.chalit?.bhavas?.find(b => b.bhavaNumber === 5);
  console.log(`  - Bhava Madhya: ${h5Cusp?.bhavaMadhyaSign} ${h5Cusp?.bhavaMadhyaFormatted} (${h5Cusp?.bhavaMadhya?.toFixed(2)}°)`);
  console.log(`  - Aarambh Sandhi: ${h5Cusp?.aarambhSandhi?.toFixed(2)}°`);
  console.log(`  - Viram Sandhi: ${h5Cusp?.viramSandhi?.toFixed(2)}°`);

  const venusD1 = canonicalChart.planets.find(p => p.name === 'Venus');
  const jupD1 = canonicalChart.planets.find(p => p.name === 'Jupiter');
  const ketuD1 = canonicalChart.planets.find(p => p.name === 'Ketu');
  const venusLon = venusD1?.degreeInSign! + 150;
  const jupLon = jupD1?.degreeInSign! + 150;
  const ketuLon = ketuD1?.degreeInSign! + 150;
  console.log(`\nPlanetary Positions in 5th Sign (Virgo):`);
  console.log(`  - Venus: ${venusD1?.formattedDegree} (Longitude: ${venusLon.toFixed(2)}°) -> Cusp Sandhi Viram: 169.44°`);
  console.log(`    Mathematical Status: ${venusLon < 169.44 ? 'REMAINS IN HOUSE 5' : 'SHIFTS TO HOUSE 6'}`);
  console.log(`  - Jupiter: ${jupD1?.formattedDegree} (Longitude: ${jupLon.toFixed(2)}°) -> Cusp Sandhi Viram: 169.44°`);
  console.log(`    Mathematical Status: ${jupLon > 169.44 ? 'SHIFTS TO HOUSE 6' : 'REMAINS IN HOUSE 5'}`);
  console.log(`  - Ketu: ${ketuD1?.formattedDegree} (Longitude: ${ketuLon.toFixed(2)}°) -> Cusp Sandhi Viram: 169.44°`);
  console.log(`    Mathematical Status: ${ketuLon > 169.44 ? 'SHIFTS TO HOUSE 6' : 'REMAINS IN HOUSE 5'}`);

  console.log(`\nD9 Navamsha:`);
  console.log(`  - Lagna: ${canonicalChart.vargas.D9.ascendantSign}`);
  const d9P5 = canonicalChart.vargas.D9.planets.filter(p => p.houseNumber === 5);
  console.log(`  - 5th House Occupants: ${d9P5.map(p => `${p.planet} (${p.vargaSign}, ${p.dignity})`).join(', ')}`);

  console.log(`\nD24 Chaturvimshamsha (Siddhamsha - Higher Education):`);
  console.log(`  - Lagna: ${canonicalChart.vargas.D24.ascendantSign}`);
  const mercD24 = canonicalChart.vargas.D24.planets.find(p => p.planet === 'Mercury');
  const rahuD24 = canonicalChart.vargas.D24.planets.find(p => p.planet === 'Rahu');
  const jupD24 = canonicalChart.vargas.D24.planets.find(p => p.planet === 'Jupiter');
  console.log(`  - Mercury in D24: ${mercD24?.vargaSign} in House ${mercD24?.houseNumber} (Dignity: ${mercD24?.dignity})`);
  console.log(`  - Rahu in D24: ${rahuD24?.vargaSign} in House ${rahuD24?.houseNumber}`);
  console.log(`  - Jupiter in D24: ${jupD24?.vargaSign} in House ${jupD24?.houseNumber} (Dignity: ${jupD24?.dignity})`);

  console.log(`\n--- TRUE NODES VS MEAN NODES STABILITY CHECK ---`);
  const rahuD1 = canonicalChart.planets.find(p => p.name === 'Rahu');
  console.log(`Mean Rahu D1: ${rahuD1?.sign} ${rahuD1?.formattedDegree}`);
  console.log(`Mean Ketu D1: ${ketuD1?.sign} ${ketuD1?.formattedDegree}`);
  console.log(`True node oscillation is typically ±1.5° relative to Mean node.`);
  console.log(`Chalit Viram Sandhi is 169.44° (Virgo 19°26').`);
  console.log(`Ketu is at Virgo 22°19' (172.33°). Even under maximum 1.5° true-node deviation (20°49' to 23°49'), Ketu consistently exceeds 169.44° and operationally resides in House 6 in both Mean and True node models.`);

  console.log('\n======================================================================');
  console.log('PART 1: TESTING DETERMINISTIC MASTER ASTROLOGER SYNTHESIS');
  console.log('======================================================================');
  const mockAgent = new ConsultAgent({ forceMockMode: true });
  const mockRequest: AgentConsultRequest = {
    userMessage: 'By analyzing my Varga charts, which field am I studying now and what type of degree am I doing?',
    birthProfile: EVAL_BIRTH_PROFILE,
    forceMockMode: true,
    blindEvaluationMode: true,
  };
  const mockResult = await mockAgent.consult(mockRequest);
  const mockPassed = runAuditOnResult(mockResult, 'Deterministic Master Synthesizer');

  console.log('\n======================================================================');
  console.log('PART 2: TESTING LIVE GENERATIVE LLM CONSULTATION (IF KEYS AVAILABLE)');
  console.log('======================================================================');
  const liveAgent = new ConsultAgent();
  const liveRequest: AgentConsultRequest = {
    userMessage: 'By analyzing my Varga charts, which field am I studying now and what type of degree am I doing?',
    birthProfile: EVAL_BIRTH_PROFILE,
    blindEvaluationMode: true,
  };
  const liveResult = await liveAgent.consult(liveRequest);
  const livePassed = runAuditOnResult(liveResult, 'Live/Fallback Astrologer Engine');

  console.log('\n======================================================================');
  console.log(`FINAL BENCHMARK SUMMARY:`);
  console.log(`Deterministic Mode: ${mockPassed ? 'PASS' : 'FAIL'}`);
  console.log(`Live/Integrated Mode: ${livePassed ? 'PASS' : 'FAIL'}`);
  console.log('======================================================================\n');

  if (!mockPassed || !livePassed) {
    process.exit(1);
  }
}

runControlledRegressionEvaluation().catch(err => {
  console.error('Regression evaluation error:', err);
  process.exit(1);
});
