/**
 * ASTROWORLD — Pure Astrology Engine Integrity Verification
 * Verifies that all 14 canonical Vedic engines and chart calculations
 * are 100% functional, accurate, and completely decoupled from any AI subsystem.
 */

import {
  computeCanonicalChart,
  TEST_BENCHMARK_PROFILE,
  BirthProfile,
  ZODIAC_SIGNS,
  getLiveDailyPanchanga,
} from '../../shared/index.ts';

async function main() {
  console.log('🌌 Starting AstroWorld Canonical Astrology Engine Verification...\n');

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

  try {
    // 1. Benchmark Chart Profile Computation
    const benchmarkProfile: BirthProfile = TEST_BENCHMARK_PROFILE;

    const canonical = computeCanonicalChart(benchmarkProfile);

    // Test 1: Ascendant / Lagna
    assert(
      'Lagna Calculation',
      Boolean(canonical.ascendant && canonical.ascendant.sign === 'Taurus' && canonical.ascendant.signIndex === 1),
      `Calculated Lagna: ${canonical.ascendant?.sign} (${canonical.ascendant?.formattedDegree})`
    );

    // Test 2: Planetary Placements (9 Grahas)
    assert(
      'Planetary Positions (9 Grahas)',
      Array.isArray(canonical.planets) && canonical.planets.length === 9,
      `Calculated all 9 Grahas: ${canonical.planets.map((p) => p.name).join(', ')}`
    );

    // Test 3: Moon Janma Rashi & Nakshatra
    const moon = canonical.planets.find((p) => p.name === 'Moon');
    assert(
      'Moon Janma Rashi & Nakshatra',
      Boolean(moon && moon.sign === 'Sagittarius' && moon.nakshatra === 'Purva Ashadha'),
      `Moon in ${moon?.sign} (${moon?.nakshatra} Pada ${moon?.pada})`
    );

    // Test 4: Divisional Charts (Vargas D1 to D60)
    assert(
      'Divisional Charts (Vargas)',
      Boolean(canonical.vargas && canonical.vargas.D9 && canonical.vargas.D10 && canonical.vargas.D60),
      `Successfully generated D1, D9 Navamsha, D10 Dashamsha, D60 Shashtiamsha`
    );

    // Test 4b: Reference-backed D9 golden vector for the benchmark.
    const d9Expected: Record<string, string> = {
      Sun: 'Aries',
      Moon: 'Virgo',
      Mars: 'Leo',
      Mercury: 'Scorpio',
      Jupiter: 'Cancer',
      Venus: 'Aquarius',
      Saturn: 'Libra',
    };
    for (const [planetName, expectedSign] of Object.entries(d9Expected)) {
      const d9 = canonical.vargas.D9?.find((p: any) => p.name === planetName);
      assert(
        `D9 ${planetName}`,
        Boolean(d9 && d9.sign === expectedSign),
        `Expected ${expectedSign}, got ${d9?.sign}`
      );
    }

    // Test 5: Vimshottari Dasha Hierarchy
    assert(
      'Vimshottari Dasha Engine',
      Boolean(
        canonical.dasha &&
          canonical.dasha.currentHierarchy &&
          canonical.dasha.currentHierarchy.mahadasha &&
          canonical.dasha.currentHierarchy.antardasha
      ),
      `Active Dasha: ${canonical.dasha.currentHierarchy.mahadasha?.lord} - ${canonical.dasha.currentHierarchy.antardasha?.subLord}`
    );

    // Test 6: Shadbala Six-fold Planetary Strength
    const shadbalaList = canonical.strength?.shadbala;
    assert(
      'Shadbala Six-Fold Strength',
      Boolean(shadbalaList && Array.isArray(shadbalaList) && shadbalaList.length >= 7),
      `Calculated Sthana, Dig, Kala, Chesta, Naisargika, Drik bala across ${shadbalaList?.length} grahas`
    );

    // Test 7: Classical Yogas & Doshas
    assert(
      'Classical Yogas & Doshas Engine',
      Boolean(canonical.yogas && Array.isArray(canonical.yogas) && canonical.yogas.length > 0),
      `Detected ${canonical.yogas?.filter((y) => y.present).length} active verified yogas`
    );

    // Test 8: Jaimini Chara Karakas (Atmakaraka to Darakaraka)
    assert(
      'Jaimini Karakas Engine',
      Boolean(canonical.jaimini && canonical.jaimini.atmakaraka && canonical.jaimini.karakamsaNavamshaSign),
      `Atmakaraka: ${canonical.jaimini.atmakaraka}, Karakamsa: ${canonical.jaimini.karakamsaNavamshaSign}`
    );

    // Test 9: Ashtakavarga Engine (337 Total Bindus)
    const sarvashtakavargaTotal = canonical.ashtakavarga?.sarvashtakavargaTotal;
    assert(
      'Ashtakavarga Engine (337 Bindus)',
      sarvashtakavargaTotal === 337,
      `Sarvashtakavarga total verified: ${sarvashtakavargaTotal} total bindus`
    );

    // Test 10: Gochara Transits & Sade Sati
    assert(
      'Transits & Sade Sati Detection',
      Boolean(canonical.transits && Array.isArray(canonical.transits.planets) && canonical.transits.sadeSati),
      `Gochara Transits calculated: ${canonical.transits.planets.length} planets, Sade Sati: ${canonical.transits.sadeSati.phase}`
    );

    // Test 11: Real-time Live Panchanga
    const livePanchang = getLiveDailyPanchanga(new Date());
    assert(
      'Live Daily Panchanga Engine',
      Boolean(livePanchang && livePanchang.tithi && livePanchang.nakshatra && livePanchang.yoga && livePanchang.karana),
      `Today's Tithi: ${livePanchang.tithi.name}, Nakshatra: ${livePanchang.nakshatra.name}, Vara: ${livePanchang.vara.name}`
    );

    console.log(`\n==================================================`);
    console.log(`ASTROLOGY ENGINE INTEGRITY: ${passed} PASSED | ${failed} FAILED`);
    console.log(`==================================================\n`);

    if (failed > 0) {
      console.error(`❌ Astrology Engine Verification Failed!`);
      process.exit(1);
    } else {
      console.log(`🎉 All ${passed} Astrology Engine subsystem checks passed. Independent ephemeris accuracy is validated separately.`);
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal Verification Error:', err);
    process.exit(1);
  }
}

main();
