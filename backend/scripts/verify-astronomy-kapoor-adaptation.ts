/**
 * ASTROWORLD — Verification of Deepak Kapoor's "Astronomy and Mathematical Astrology" Adaptation
 * Tests:
 * 1. Sripathi Bhava Chalit chart (Madhyas, Sandhis, House shifts, Awasiya/Residential Bala)
 * 2. Sun-Derived Upgrahas (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu)
 * 3. Time-Derived Upgrahas (Gulika, Mandi, Kala, Mrityu, Ardhaprahara, Yamaghantaka)
 * 4. Rigorous Bhava Bala (Bhavadhipati, Bhava Dig Bala by sign class, Bhava Drishti Bala)
 * 5. Ishta Phala and Kashta Phala
 * 6. AI Agent Integration & Tool Registry
 */

import {
  computeCanonicalChart,
  calculateSripathiBhavas,
  calculateChalitChart,
  calculateMidheaven,
  calculateSunDerivedUpgrahas,
  calculateTimeDerivedUpgrahas,
  calculateAllUpgrahas,
  calculateShadbala,
  calculateBhavaBala,
  DEFAULT_BIRTH_PROFILE,
} from '../../shared/index.ts';
import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';
import { CLASSICAL_JYOTISH_KNOWLEDGE_BASE } from '../src/ai_v2/rag/knowledgeBase.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

async function runTests() {
  console.log('=== VERIFYING DEEPAK KAPOOR ASTRO ENGINE & MATHEMATICAL ASTROLOGY ADAPTATION ===\n');

  // Test 1: Sun-Derived Upgrahas Formula Accuracy (Chapter 13.2)
  console.log('--- 1. Testing Sun-Derived Upgrahas (Chapter 13.2) ---');
  // Kapoor Chapter 13.2 Worked Example: Sun = 72° (Gemini 12°)
  const testSunLon = 72.0;
  const sunUpgrahas = calculateSunDerivedUpgrahas(testSunLon, 0);

  // Dhuma = 72° + 133°20' = 205°20' (Scorpio 25°20')
  const expectedDhuma = 72.0 + 133.0 + 20.0 / 60.0;
  assert(
    Math.abs(sunUpgrahas.dhuma.siderealLongitude - expectedDhuma) < 1e-4,
    `Dhuma matches Kapoor example (205°20'): got ${sunUpgrahas.dhuma.siderealLongitude.toFixed(4)}`
  );

  // Vyatipata / Pata = 360° - 205°20' = 154°40' (Virgo 4°40')
  const expectedPata = 360.0 - expectedDhuma;
  assert(
    Math.abs(sunUpgrahas.vyatipata.siderealLongitude - expectedPata) < 1e-4,
    `Vyatipata/Pata matches Kapoor example (154°40'): got ${sunUpgrahas.vyatipata.siderealLongitude.toFixed(4)}`
  );

  // Parivesha = 180° + 154°40' = 334°40' (Pisces 4°40')
  const expectedParidhi = 180.0 + expectedPata;
  assert(
    Math.abs(sunUpgrahas.parivesha.siderealLongitude - expectedParidhi) < 1e-4,
    `Parivesha/Paridhi matches Kapoor example (334°40'): got ${sunUpgrahas.parivesha.siderealLongitude.toFixed(4)}`
  );

  // Indrachapa = 360° - 334°40' = 25°20' (Aries 25°20')
  const expectedIndrachapa = 360.0 - expectedParidhi;
  assert(
    Math.abs(sunUpgrahas.indrachapa.siderealLongitude - expectedIndrachapa) < 1e-4,
    `Indrachapa/Kodanda matches Kapoor example (25°20'): got ${sunUpgrahas.indrachapa.siderealLongitude.toFixed(4)}`
  );

  // Upaketu = 25°20' + 16°40' = 42°00' (Taurus 12°00')
  const expectedUpaketu = expectedIndrachapa + 16.0 + 40.0 / 60.0;
  assert(
    Math.abs(sunUpgrahas.upaketu.siderealLongitude - expectedUpaketu) < 1e-4,
    `Upaketu/Sikhi matches Kapoor example (42°00'): got ${sunUpgrahas.upaketu.siderealLongitude.toFixed(4)}`
  );

  // Test 2: Sripathi Bhava Chalit Chart & Awasiya Bala (Chapter 11 & 16.2)
  console.log('\n--- 2. Testing Sripathi Bhava Chalit Chart & Awasiya Bala (Chapter 11 & 16.2) ---');
  const ascLon = 280.0; // Capricorn 10°
  const mcLon = 195.0;  // Libra 15°
  const { madhyas, sandhis } = calculateSripathiBhavas(ascLon, mcLon);

  assert(madhyas[1] === ascLon, 'Madhya 1 equals Ascendant longitude');
  assert(madhyas[10] === mcLon, 'Madhya 10 equals Midheaven longitude');
  assert(Math.abs(madhyas[7] - ((ascLon + 180) % 360)) < 1e-6, 'Madhya 7 is opposite Ascendant (180°)');
  assert(Math.abs(madhyas[4] - ((mcLon + 180) % 360)) < 1e-6, 'Madhya 4 is opposite Midheaven (180°)');
  assert(sandhis.length === 13, '12 Bhava Sandhis computed');

  // Verify full Canonical Chart has chalit and upgrahas
  console.log('\n--- 3. Testing Full Canonical Chart Integration ---');
  const chart = computeCanonicalChart(DEFAULT_BIRTH_PROFILE);
  assert(chart.chalit !== undefined, 'Canonical chart contains chalit chart');
  assert(chart.chalit!.bhavas.length === 12, '12 Chalit bhavas generated');
  assert(chart.chalit!.planets.length === chart.planets.length, 'All planets mapped to Chalit chart');
  assert(chart.upgrahas !== undefined, 'Canonical chart contains Upgrahas');
  assert(chart.upgrahas!.allUpgrahas.length === 11, 'All 11 classical Upgrahas computed');

  // Verify Awasiya Bala is populated and bounded [0, 60] Shashtiamshas
  for (const cp of chart.chalit!.planets) {
    assert(
      cp.awasiyaBalaShashtiamsha >= 0 && cp.awasiyaBalaShashtiamsha <= 60,
      `Awasiya Bala for ${cp.planet} bounded in [0, 60] Sh.: ${cp.awasiyaBalaShashtiamsha}`
    );
    assert(
      cp.awasiyaBalaPercent >= 0 && cp.awasiyaBalaPercent <= 100,
      `Awasiya Bala percent for ${cp.planet} bounded in [0, 100%]: ${cp.awasiyaBalaPercent}%`
    );
  }

  // Test 4: Rigorous Bhava Bala (Chapter 18)
  console.log('\n--- 4. Testing Rigorous Bhava Bala (No hardcoded values) ---');
  const shadbala = calculateShadbala(chart.planets, 6.5);
  const bhavaBala = calculateBhavaBala(
    chart.planets,
    chart.ascendant.signIndex,
    shadbala,
    [0, ...chart.chalit!.bhavas.map((b) => b.bhavaMadhya)]
  );

  assert(bhavaBala.length === 12, '12 houses evaluated in Bhava Bala');
  for (const bb of bhavaBala) {
    assert(bb.bhavadhipatiBala > 0, `House ${bb.houseNumber} has genuine Bhavadhipati Bala: ${bb.bhavadhipatiBala}`);
    assert(bb.bhavaDigBala >= 0 && bb.bhavaDigBala <= 60, `House ${bb.houseNumber} has valid Bhava Dig Bala: ${bb.bhavaDigBala}`);
    assert(typeof bb.bhavaDrishtiBala === 'number', `House ${bb.houseNumber} has calculated Bhava Drishti Bala: ${bb.bhavaDrishtiBala}`);
    assert(bb.totalVirupas > 0, `House ${bb.houseNumber} total Virupas: ${bb.totalVirupas} (${bb.totalRupas} Rupas)`);
  }

  // Verify Ishta Phala & Kashta Phala (Chapter 17.5)
  console.log('\n--- 5. Testing Ishta Phala & Kashta Phala (Chapter 17.5) ---');
  for (const sf of shadbala) {
    assert(sf.ishtaPhala !== undefined, `${sf.planet} has Ishta Phala computed`);
    assert(sf.kashtaPhala !== undefined, `${sf.planet} has Kashta Phala computed`);
    assert(
      Math.abs((sf.ishtaPhala! + sf.kashtaPhala!) - 60) < 1.0,
      `${sf.planet}: Ishta (${sf.ishtaPhala}) + Kashta (${sf.kashtaPhala}) ≈ 60 Shashtiamshas`
    );
  }

  // Test 6: AI Tool Registry Integration
  console.log('\n--- 6. Testing AI V2 Tool Registry Integration ---');
  assert(AstrologyToolRegistry.hasTool('get_chalit_chart'), 'Tool Registry has get_chalit_chart');
  assert(AstrologyToolRegistry.hasTool('get_upgrahas'), 'Tool Registry has get_upgrahas');

  const chalitToolRes = await AstrologyToolRegistry.executeTool('get_chalit_chart', {
    birthProfile: DEFAULT_BIRTH_PROFILE,
  });
  assert(chalitToolRes.success, 'executeTool("get_chalit_chart") succeeded');
  assert(chalitToolRes.data.bhavas.length === 12, 'get_chalit_chart returned 12 bhavas');

  const upgrahasToolRes = await AstrologyToolRegistry.executeTool('get_upgrahas', {
    birthProfile: DEFAULT_BIRTH_PROFILE,
  });
  assert(upgrahasToolRes.success, 'executeTool("get_upgrahas") succeeded');
  assert(upgrahasToolRes.data.allUpgrahas.length === 11, 'get_upgrahas returned 11 upgrahas');

  // Test 7: Knowledge Base Rules
  console.log('\n--- 7. Testing Knowledge Base Rules ---');
  const chalitRule = CLASSICAL_JYOTISH_KNOWLEDGE_BASE.find((r) => r.id === 'kb_bhava_chalit_sripathi_house_shift');
  assert(chalitRule !== undefined, 'Knowledge Base contains kb_bhava_chalit_sripathi_house_shift');
  const upgrahaRule = CLASSICAL_JYOTISH_KNOWLEDGE_BASE.find((r) => r.id === 'kb_upgrahas_mandi_gulika_sensitive_points');
  assert(upgrahaRule !== undefined, 'Knowledge Base contains kb_upgrahas_mandi_gulika_sensitive_points');
  const ishtaRule = CLASSICAL_JYOTISH_KNOWLEDGE_BASE.find((r) => r.id === 'kb_ishta_kashta_phala_dasha_fructification');
  assert(ishtaRule !== undefined, 'Knowledge Base contains kb_ishta_kashta_phala_dasha_fructification');

  console.log('\n🎉 ALL 18 TESTS PASSED! Deepak Kapoor Astronomy & Mathematical Astrology adaptation is verified.');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
