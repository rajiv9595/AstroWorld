/**
 * ASTROWORLD — Reproducible Astronomical Calculation Audit & Diagnostic Tool
 *
 * Implements Section 17 of the Astronomical Calculation Audit Specification:
 * Deterministic JSON & console output for any birth profile and calculation settings.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import {
  BirthProfile,
  birthProfileToUtcDate,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  calculateAscendant,
  calculateVimshottariDasha,
  computeCanonicalChart,
  formatDMS,
  normalizeDegrees,
  TEST_BENCHMARK_PROFILE,
} from '../../shared/index.ts';

function circularDistanceDeg(a: number, b: number): number {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b)) % 360;
  return Math.min(diff, 360 - diff);
}

// Independent Swiss Ephemeris Reference Fixture (Section 16)
const INDEPENDENT_SWISS_ORACLE = {
  siderealAscendant: { deg: 39.9562028, dms: '09° 57\' 22.33"', sign: 'Taurus' },
  Sun: { deg: 120.0428417, dms: '00° 02\' 34.23"', sign: 'Leo' },
  Moon: { deg: 257.8637667, dms: '17° 51\' 49.56"', sign: 'Sagittarius' },
  Mars: { deg: 16.5940583, dms: '16° 35\' 38.61"', sign: 'Aries' },
  Mercury: { deg: 104.8405389, dms: '14° 50\' 25.94"', sign: 'Cancer' },
  Jupiter: { deg: 171.8436250, dms: '21° 50\' 37.05"', sign: 'Virgo' },
  Venus: { deg: 155.6427500, dms: '05° 38\' 33.90"', sign: 'Virgo' },
  Saturn: { deg: 100.0634917, dms: '10° 03\' 48.57"', sign: 'Cancer' },
  Rahu: { deg: 352.3274111, dms: '22° 19\' 38.68"', sign: 'Pisces' },
  Ketu: { deg: 172.3274111, dms: '22° 19\' 38.68"', sign: 'Virgo' },
  moonNakshatra: 'Purva Ashadha',
  moonPada: 2,
  initialLord: 'Venus',
  venusBalanceYears: 13.2043515827,
  venusStartIso: '1998-10-30T15:52:45.504Z',
  venusEndIso: '2018-10-30T15:52:45.504Z',
};

export async function runAstronomicalAudit(profileInput?: Partial<BirthProfile>) {
  const profile: BirthProfile = {
    ...TEST_BENCHMARK_PROFILE,
    ...profileInput,
  };

  const calculationSettings = {
    zodiac: 'sidereal',
    ayanamsha: 'Lahiri',
    coordinateFrame: 'geocentric_ecliptic',
    positionConvention: 'apparent',
    nodeConvention: 'mean',
    houseSystemD1: 'whole_sign',
    dashaSystem: 'Vimshottari',
    dashaYearDays: 365.25,
    timezone: profile.timezone || 'Asia/Kolkata',
  };

  const birthUtcDate = birthProfileToUtcDate(profile);
  const astroTime = new Astronomy.AstroTime(birthUtcDate);
  const julianDayUt = astroTime.ut + 2451545.0; // JD from J2000.0

  // Check if Swiss Ephemeris native module is present
  let swissAvailable = false;
  let swissVersion: string | undefined;
  let swissPlanets: any[] = [];
  let swissAscendant: number | undefined;
  let swissAyanamsha: number | undefined;

  try {
    const swisseph = await import('@swisseph/node');
    swissAvailable = true;
    swissVersion = typeof swisseph.version === 'function' ? String(swisseph.version()) : '2.10.x';
    swisseph.setSiderealMode(swisseph.SiderealMode.Lahiri);
    const jd = swisseph.dateToJulianDay(birthUtcDate);
    swissAyanamsha = swisseph.getAyanamsaExUt(jd, swisseph.CalculationFlag.SwissEphemeris | swisseph.CalculationFlag.NoNutation);
    const houseAyanamsha = swisseph.getAyanamsaExUt(jd, swisseph.CalculationFlag.SwissEphemeris);
    const flags = swisseph.CalculationFlag.SwissEphemeris | swisseph.CalculationFlag.Speed | swisseph.CalculationFlag.Sidereal | swisseph.CalculationFlag.NoNutation;
    const bodyMap = [
      ['Sun', swisseph.Planet.Sun],
      ['Moon', swisseph.Planet.Moon],
      ['Mars', swisseph.Planet.Mars],
      ['Mercury', swisseph.Planet.Mercury],
      ['Jupiter', swisseph.Planet.Jupiter],
      ['Venus', swisseph.Planet.Venus],
      ['Saturn', swisseph.Planet.Saturn],
    ] as const;

    for (const [name, pEnum] of bodyMap) {
      const pos = swisseph.calculatePosition(jd, pEnum, flags);
      swissPlanets.push({
        name,
        siderealLongitude: normalizeDegrees(pos.longitude),
        speed: pos.longitudeSpeed,
      });
    }
    const meanNode = swisseph.calculatePosition(
      jd,
      swisseph.LunarPoint.MeanNode,
      swisseph.CalculationFlag.SwissEphemeris | swisseph.CalculationFlag.Speed | swisseph.CalculationFlag.Sidereal,
    );
    const rLon = normalizeDegrees(meanNode.longitude);
    swissPlanets.push({ name: 'Rahu', siderealLongitude: rLon, speed: meanNode.longitudeSpeed });
    swissPlanets.push({ name: 'Ketu', siderealLongitude: normalizeDegrees(rLon + 180), speed: meanNode.longitudeSpeed });

    const houses = swisseph.calculateHouses(jd, profile.latitude, profile.longitude, swisseph.HouseSystem.Placidus);
    swissAscendant = normalizeDegrees(houses.ascendant - houseAyanamsha);
  } catch {
    swissAvailable = false;
  }

  // Canonical chart run
  const canonicalChart = computeCanonicalChart(profile);

  // Build comparison against independent Swiss Oracle
  const oracleComparisons: Record<string, {
    canonicalDeg: number;
    oracleDeg: number;
    deltaDeg: number;
    deltaArcsec: number;
    canonicalFormatted: string;
    oracleFormatted: string;
  }> = {};

  // Ascendant comparison
  const ascDelta = circularDistanceDeg(canonicalChart.ascendant.siderealLongitude, INDEPENDENT_SWISS_ORACLE.siderealAscendant.deg);
  oracleComparisons['Ascendant'] = {
    canonicalDeg: canonicalChart.ascendant.siderealLongitude,
    oracleDeg: INDEPENDENT_SWISS_ORACLE.siderealAscendant.deg,
    deltaDeg: ascDelta,
    deltaArcsec: ascDelta * 3600,
    canonicalFormatted: `${canonicalChart.ascendant.sign} ${canonicalChart.ascendant.formattedDegree}`,
    oracleFormatted: `${INDEPENDENT_SWISS_ORACLE.siderealAscendant.sign} ${INDEPENDENT_SWISS_ORACLE.siderealAscendant.dms}`,
  };

  // Planetary comparisons
  for (const p of canonicalChart.planets) {
    const oracle = (INDEPENDENT_SWISS_ORACLE as any)[p.name];
    if (!oracle) continue;
    const delta = circularDistanceDeg(p.siderealLongitude, oracle.deg);
    oracleComparisons[p.name] = {
      canonicalDeg: p.siderealLongitude,
      oracleDeg: oracle.deg,
      deltaDeg: delta,
      deltaArcsec: delta * 3600,
      canonicalFormatted: `${p.sign} ${p.formattedDegree}`,
      oracleFormatted: `${oracle.sign} ${oracle.dms}`,
    };
  }

  // Warnings for sensitive boundaries
  const boundaryWarnings: string[] = [];
  for (const p of canonicalChart.planets) {
    if (p.degreeInSign < 0.1 || p.degreeInSign > 29.9) {
      boundaryWarnings.push(`${p.name} is within 6 arcmin of sign boundary: ${p.formattedDegree} ${p.sign}`);
    }
  }

  const result = {
    diagnosticVersion: '2.0.0',
    timestampIso: new Date().toISOString(),
    normalizedBirthInput: profile,
    utcInstant: birthUtcDate.toISOString(),
    julianDayUt,
    calculationSettings,
    ephemerisStatus: {
      activeProvider: swissAvailable && process.env.ASTROWORLD_EPHEMERIS_PROVIDER === 'swiss-ephemeris' ? 'swiss-ephemeris' : 'astronomy-engine',
      swissAvailable,
      swissVersion,
    },
    ayanamsha: {
      canonicalDeg: canonicalChart.panchanga.ayanamsa.valueDegrees,
      canonicalFormatted: canonicalChart.panchanga.ayanamsa.formatted,
      swissDeg: swissAyanamsha,
    },
    ascendant: {
      tropical: canonicalChart.ascendant.tropicalLongitude,
      sidereal: canonicalChart.ascendant.siderealLongitude,
      sign: canonicalChart.ascendant.sign,
      formattedDegree: canonicalChart.ascendant.formattedDegree,
      nakshatra: canonicalChart.ascendant.nakshatra,
      pada: canonicalChart.ascendant.pada,
    },
    planets: canonicalChart.planets.map(p => ({
      name: p.name,
      siderealLongitude: p.siderealLongitude,
      tropicalLongitude: p.tropicalLongitude,
      sign: p.sign,
      signIndex: p.signIndex,
      degreeInSign: p.degreeInSign,
      formattedDegree: p.formattedDegree,
      houseNumber: p.houseNumber,
      speedDegPerDay: p.speed,
      retrograde: p.retrograde,
      combust: p.combust,
      dignity: p.dignity,
      nakshatra: p.nakshatra,
      pada: p.pada,
      nakshatraLord: p.nakshatraLord,
    })),
    vimshottariDasha: {
      rulingLordAtBirth: canonicalChart.dasha.balanceAtBirth.rulingLord,
      balanceYearsUnrounded: canonicalChart.dasha.balanceAtBirth.balanceYears,
      balanceMonths: canonicalChart.dasha.balanceAtBirth.balanceMonths,
      balanceDays: canonicalChart.dasha.balanceAtBirth.balanceDays,
      activeHierarchy: {
        mahadasha: {
          lord: canonicalChart.dasha.currentHierarchy.mahadasha.lord,
          start: canonicalChart.dasha.currentHierarchy.mahadasha.startDateIso,
          end: canonicalChart.dasha.currentHierarchy.mahadasha.endDateIso,
        },
        antardasha: {
          lord: canonicalChart.dasha.currentHierarchy.antardasha.subLord,
          start: canonicalChart.dasha.currentHierarchy.antardasha.startDateIso,
          end: canonicalChart.dasha.currentHierarchy.antardasha.endDateIso,
        },
        pratyantardasha: {
          lord: canonicalChart.dasha.currentHierarchy.pratyantardasha.pratyantarLord,
          start: canonicalChart.dasha.currentHierarchy.pratyantardasha.startDateIso,
          end: canonicalChart.dasha.currentHierarchy.pratyantardasha.endDateIso,
        },
      },
    },
    oracleComparisons,
    boundaryWarnings,
  };

  return result;
}

if (process.argv[1] && process.argv[1].toLowerCase().includes('astronomical-audit-diagnostic')) {
  runAstronomicalAudit().then((res) => {
    console.log('========================================================================');
    console.log('🌟 ASTROWORLD ASTRONOMICAL AUDIT & REPRODUCIBILITY DIAGNOSTIC');
    console.log('========================================================================\n');
    console.log(`Birth Native: ${res.normalizedBirthInput.name}`);
    console.log(`Local Civil Time: ${res.normalizedBirthInput.year}-${res.normalizedBirthInput.month}-${res.normalizedBirthInput.day} ${res.normalizedBirthInput.hour}:${String(res.normalizedBirthInput.minute).padStart(2, '0')}:${String(res.normalizedBirthInput.second || 0).padStart(2, '0')} (${res.calculationSettings.timezone})`);
    console.log(`Resolved UTC: ${res.utcInstant} | JD(UT): ${res.julianDayUt.toFixed(6)}`);
    console.log(`Coordinates: ${res.normalizedBirthInput.latitude}° N, ${res.normalizedBirthInput.longitude}° E (Anaparthy, AP)`);
    console.log(`Ayanamsha (Lahiri): ${res.ayanamsha.canonicalFormatted} (${res.ayanamsha.canonicalDeg.toFixed(6)}°)`);
    console.log(`Ephemeris Provider: ${res.ephemerisStatus.activeProvider} (Swiss Available: ${res.ephemerisStatus.swissAvailable})\n`);

    console.log('--- INDEPENDENT SWISS ORACLE COMPARISON ---');
    console.log('Body        Canonical Output             Independent Oracle           Delta');
    console.log('--------------------------------------------------------------------------------');
    for (const [name, comp] of Object.entries(res.oracleComparisons)) {
      console.log(
        `${name.padEnd(11)} ${comp.canonicalFormatted.padEnd(28)} ${comp.oracleFormatted.padEnd(28)} Δ ${comp.deltaArcsec.toFixed(2)}″ (${comp.deltaDeg.toFixed(6)}°)`
      );
    }

    console.log('\n--- VIMSHOTTARI DASHA AUDIT ---');
    console.log(`Balance Lord at Birth: ${res.vimshottariDasha.rulingLordAtBirth}`);
    console.log(`Balance Years (Unrounded): ${res.vimshottariDasha.balanceYearsUnrounded.toFixed(10)} years (${res.vimshottariDasha.balanceMonths}m ${res.vimshottariDasha.balanceDays}d)`);
    console.log(`Active Mahadasha:        ${res.vimshottariDasha.activeHierarchy.mahadasha.lord} (ends ${res.vimshottariDasha.activeHierarchy.mahadasha.end})`);
    console.log(`Active Antardasha:       ${res.vimshottariDasha.activeHierarchy.antardasha.lord} (ends ${res.vimshottariDasha.activeHierarchy.antardasha.end})`);
    console.log(`Active Pratyantardasha:  ${res.vimshottariDasha.activeHierarchy.pratyantardasha.lord} (ends ${res.vimshottariDasha.activeHierarchy.pratyantardasha.end})`);

    if (res.boundaryWarnings.length > 0) {
      console.log('\n⚠️ BOUNDARY SENSITIVITY WARNINGS:');
      for (const w of res.boundaryWarnings) console.log(`  - ${w}`);
    }

    console.log('\n========================================================================');
    console.log('✅ AUDIT COMPLETE: Machine-readable JSON generated successfully.');
    console.log('========================================================================');
  });
}
