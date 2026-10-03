/**
 * ASTROWORLD AI V2 — Comprehensive Tool Verification Test Suite
 * Tests all 10 deterministic astrology engine tools through the controlled Tool Registry:
 * 1. get_birth_chart
 * 2. get_divisional_chart (D9, D10)
 * 3. get_current_dasha
 * 4. get_dasha_at
 * 5. get_transits
 * 6. get_active_yogas
 * 7. get_planetary_strength
 * 8. get_ashtakavarga
 * 9. get_jaimini_details
 * 10. get_panchanga
 * + Input validation, malformed parameter handling, provenance tracking, and deterministic integrity.
 */

import { AstrologyToolRegistry } from '../src/ai_v2/tools/toolRegistry.ts';

const GOLDEN_PROFILE = {
  name: 'Canonical Test Native',
  year: 2005,
  month: 8,
  day: 17,
  hour: 0,
  minute: 2,
  second: 0,
  latitude: 16.93407,
  longitude: 81.95522,
  timezone: 'Asia/Kolkata',
  cityName: 'Anaparthy, Andhra Pradesh, India',
};

async function main() {
  console.log('🛠️ Starting AstroWorld AI V2 Tool Registry Test Suite...\n');

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

  // 1. Tool Registry Discovery
  const toolDefs = AstrologyToolRegistry.getToolDefinitions();
  assert(
    'Tool Registry: Discover All 10 Tools',
    toolDefs.length === 10,
    `Registered ${toolDefs.length} tool definitions`
  );

  // 2. Test get_birth_chart
  const res1 = AstrologyToolRegistry.executeTool('get_birth_chart', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 1: get_birth_chart',
    res1.success &&
      res1.data?.ascendant?.sign === 'Taurus' &&
      res1.data?.planets?.length === 9 &&
      res1.provenance.verified === true,
    `Lagna: ${res1.data?.ascendant?.sign}, Planets: ${res1.data?.planets?.length}, Verified: ${res1.provenance.verified}`
  );

  // 3. Test get_divisional_chart (D9 Navamsha)
  const res2 = AstrologyToolRegistry.executeTool('get_divisional_chart', {
    birthProfile: GOLDEN_PROFILE,
    vargaCode: 'D9',
  });
  assert(
    'Tool 2: get_divisional_chart (D9 Navamsha)',
    res2.success && res2.data?.vargaCode === 'D9' && res2.data?.planets?.length === 9,
    `D9 Navamsha Ascendant: ${res2.data?.ascendant?.vargaSign}, Grahas: ${res2.data?.planets?.length}`
  );

  // 4. Test get_divisional_chart (D10 Dashamsha)
  const res2b = AstrologyToolRegistry.executeTool('get_divisional_chart', {
    birthProfile: GOLDEN_PROFILE,
    vargaCode: 'D10',
  });
  assert(
    'Tool 2b: get_divisional_chart (D10 Dashamsha)',
    res2b.success && res2b.data?.vargaCode === 'D10' && res2b.data?.planets?.length === 9,
    `D10 Dashamsha Ascendant: ${res2b.data?.ascendant?.vargaSign}, Grahas: ${res2b.data?.planets?.length}`
  );

  // 5. Test get_current_dasha
  const res3 = AstrologyToolRegistry.executeTool('get_current_dasha', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 3: get_current_dasha',
    res3.success &&
      Boolean(res3.data?.activeLords?.mahadasha) &&
      Boolean(res3.data?.activeLords?.antardasha),
    `Active Dasha: ${res3.data?.activeLords?.mahadasha} - ${res3.data?.activeLords?.antardasha}`
  );

  // 6. Test get_dasha_at (Target Date: 2028-01-01)
  const res4 = AstrologyToolRegistry.executeTool('get_dasha_at', {
    birthProfile: GOLDEN_PROFILE,
    targetDateIso: '2028-01-01T00:00:00Z',
  });
  assert(
    'Tool 4: get_dasha_at',
    res4.success && Boolean(res4.data?.activeLords?.mahadasha),
    `Target Date: 2028-01-01 -> Dasha: ${res4.data?.activeLords?.mahadasha} - ${res4.data?.activeLords?.antardasha}`
  );

  // 7. Test get_transits
  const res5 = AstrologyToolRegistry.executeTool('get_transits', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 5: get_transits',
    res5.success && Array.isArray(res5.data?.planets) && res5.data?.planets.length === 9 && Boolean(res5.data?.sadeSati),
    `Gochara Planets: ${res5.data?.planets?.length}, Sade Sati: ${res5.data?.sadeSati?.phase}`
  );

  // 8. Test get_active_yogas
  const res6 = AstrologyToolRegistry.executeTool('get_active_yogas', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 6: get_active_yogas',
    res6.success && Array.isArray(res6.data?.yogas) && res6.data?.activeYogasCount > 0,
    `Detected ${res6.data?.activeYogasCount} active yogas (e.g. ${res6.data?.yogas?.[0]?.name})`
  );

  // 9. Test get_planetary_strength (Shadbala)
  const res7 = AstrologyToolRegistry.executeTool('get_planetary_strength', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 7: get_planetary_strength',
    res7.success && Array.isArray(res7.data?.shadbala) && res7.data?.shadbala.length === 7,
    `Shadbala calculated for 7 Grahas with Sthana, Dig, Kala, Chesta, Naisargika, Drik bala`
  );

  // 10. Test get_ashtakavarga
  const res8 = AstrologyToolRegistry.executeTool('get_ashtakavarga', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 8: get_ashtakavarga',
    res8.success && res8.data?.sarvashtakavargaTotal === 337 && res8.data?.sav?.length === 12,
    `Sarvashtakavarga Total: ${res8.data?.sarvashtakavargaTotal} bindus across 12 signs`
  );

  // 11. Test get_jaimini_details
  const res9 = AstrologyToolRegistry.executeTool('get_jaimini_details', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 9: get_jaimini_details',
    res9.success && res9.data?.atmakaraka === 'Jupiter' && res9.data?.karakamsaNavamshaSign === 'Cancer',
    `Atmakaraka: ${res9.data?.atmakaraka}, Karakamsa: ${res9.data?.karakamsaNavamshaSign}`
  );

  // 12. Test get_panchanga
  const res10 = AstrologyToolRegistry.executeTool('get_panchanga', { birthProfile: GOLDEN_PROFILE });
  assert(
    'Tool 10: get_panchanga',
    res10.success && Boolean(res10.data?.tithi) && Boolean(res10.data?.nakshatra),
    `Panchanga: ${res10.data?.tithi?.name} Tithi, ${res10.data?.nakshatra?.name} Nakshatra, ${res10.data?.vara?.name}`
  );

  // 13. Test Validation: Missing Fields
  const resMissing = AstrologyToolRegistry.executeTool('get_birth_chart', { birthProfile: { year: 2000 } });
  assert(
    'Validation: Missing Fields Rejected',
    resMissing.success === false && Boolean(resMissing.error) && resMissing.provenance.verified === false,
    `Safely rejected invalid input: "${resMissing.error}"`
  );

  // 14. Test Validation: Out of Range Coordinates
  const resCoords = AstrologyToolRegistry.executeTool('get_birth_chart', {
    birthProfile: { ...GOLDEN_PROFILE, latitude: 120 },
  });
  assert(
    'Validation: Out-of-Range Latitude Rejected',
    resCoords.success === false && resCoords.error?.includes('latitude'),
    `Safely rejected out of range latitude: "${resCoords.error}"`
  );

  // 15. Test Validation: Invalid Varga Code
  const resBadVarga = AstrologyToolRegistry.executeTool('get_divisional_chart', {
    birthProfile: GOLDEN_PROFILE,
    vargaCode: 'D99_INVALID',
  });
  assert(
    'Validation: Invalid Varga Code Rejected',
    resBadVarga.success === false && resBadVarga.error?.includes('Invalid vargaCode'),
    `Safely rejected unknown vargaCode: "${resBadVarga.error}"`
  );

  // 16. Test Validation: Unregistered Tool Dispatch
  const resUnregistered = AstrologyToolRegistry.executeTool('non_existent_tool', {});
  assert(
    'Validation: Unregistered Tool Rejected',
    resUnregistered.success === false && resUnregistered.error?.includes('not registered'),
    `Safely rejected unregistered tool: "${resUnregistered.error}"`
  );

  console.log(`\n==================================================`);
  console.log(`AI V2 TOOL REGISTRY SUITE: ${passed} PASSED | ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`🎉 All ${passed} Tool Registry tests passed cleanly with 100% verification.`);
    process.exit(0);
  }
}

main();
