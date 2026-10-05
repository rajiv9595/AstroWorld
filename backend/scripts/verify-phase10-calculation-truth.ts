/**
 * ASTROWORLD — Phase 10 Calculation Truth Contract
 *
 * Adversarial, deterministic tests for classical aspect semantics and
 * prerequisite-driven yoga/dosha detection. These are intentionally synthetic
 * placements so a regression cannot be hidden by a single natal golden chart.
 */

import { getParashariAspectHouses, hasParashariAspect } from '../../shared/engine/aspects.ts';
import { calculateYogasAndDoshas } from '../../shared/engine/yogas.ts';
import type { PlanetName, PlanetPosition, ZodiacSign } from '../../shared/engine/types.ts';

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function expect(name: string, actual: unknown, expected: unknown) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  checks.push({
    name,
    pass,
    detail: pass ? '' : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  });
}

function syntheticPlanet(
  name: PlanetName,
  houseNumber: number,
  signIndex: number,
): PlanetPosition {
  const signs: ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  return {
    name,
    sanskritName: name,
    tropicalLongitude: signIndex * 30 + 10,
    siderealLongitude: signIndex * 30 + 10,
    sign: signs[signIndex],
    signIndex,
    degreeInSign: 10,
    formattedDegree: '10° 00\' 00"',
    houseNumber,
    nakshatra: 'Ashwini',
    nakshatraNumber: 1,
    nakshatraLord: 'Ketu',
    pada: 1,
    speed: 1,
    retrograde: false,
    combust: false,
    dignity: 'NEUTRAL',
    dignityScore: 15,
    signLord: 'Sun',
    naturalRelationshipToLord: 'NEUTRAL',
  };
}

const marsTargets = getParashariAspectHouses(1, 'Mars');
const jupiterTargets = getParashariAspectHouses(5, 'Jupiter');
const saturnTargets = getParashariAspectHouses(10, 'Saturn');
const venusTargets = getParashariAspectHouses(2, 'Venus');
expect('Mars casts 4th, 7th and 8th aspects', marsTargets, [4, 7, 8]);
expect('Jupiter casts 5th, 7th and 9th aspects', jupiterTargets, [9, 11, 1]);
expect('Saturn casts 3rd, 7th and 10th aspects', saturnTargets, [12, 4, 7]);
expect('Ordinary planets cast 7th aspect only', venusTargets, [8]);
expect(
  'Node special aspects are excluded by default',
  getParashariAspectHouses(1, 'Rahu'),
  [7],
);
expect(
  'Node special aspects can be explicitly opted in',
  getParashariAspectHouses(1, 'Rahu', true),
  [5, 7, 9],
);
expect(
  'Mars 4th aspect is recognized as sambandha',
  hasParashariAspect(
    syntheticPlanet('Mars', 4, 0),
    syntheticPlanet('Mercury', 7, 6),
  ),
  true,
);

// Capricorn ascendant: 4th lord Mars + 9th lord Mercury.
// Their only relationship below is Mars' special 4th aspect, which the
// previous house-difference implementation could not recognize.
const capricornPlanets: PlanetPosition[] = [
  syntheticPlanet('Mars', 4, 0),
  syntheticPlanet('Mercury', 7, 6),
  syntheticPlanet('Sun', 2, 10),
  syntheticPlanet('Moon', 3, 11),
  syntheticPlanet('Jupiter', 5, 4),
  syntheticPlanet('Venus', 6, 5),
  syntheticPlanet('Saturn', 1, 9),
  syntheticPlanet('Rahu', 8, 7),
  syntheticPlanet('Ketu', 2, 1),
];
const capricornYogas = calculateYogasAndDoshas(capricornPlanets, 'Capricorn');
expect(
  'Raja Yoga recognizes Kendra-Trikona lord sambandha through Mars special aspect',
  capricornYogas.yogas.find(y => y.id === 'raja_yoga')?.present,
  true,
);

// Kala Sarpa: validate both orientations of the Rahu-Ketu half-axis.
const firstHalfPlanets = [
  syntheticPlanet('Rahu', 1, 0),
  syntheticPlanet('Ketu', 7, 6),
  syntheticPlanet('Sun', 2, 1),
  syntheticPlanet('Moon', 3, 2),
  syntheticPlanet('Mars', 4, 3),
  syntheticPlanet('Mercury', 5, 4),
  syntheticPlanet('Jupiter', 6, 5),
  syntheticPlanet('Venus', 11, 4),
  syntheticPlanet('Saturn', 12, 5),
];
const secondHalfPlanets = firstHalfPlanets.map((p) => ({
  ...p,
  signIndex: p.name === 'Rahu' ? 0 : p.name === 'Ketu' ? 6 : (p.signIndex + 6) % 12,
  sign: (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as ZodiacSign[])[p.name === 'Rahu' ? 0 : p.name === 'Ketu' ? 6 : (p.signIndex + 6) % 12],
}));
expect(
  'Kala Sarpa detects the Rahu-to-Ketu half-axis',
  calculateYogasAndDoshas(firstHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  true,
);
expect(
  'Kala Sarpa detects the opposite half-axis',
  calculateYogasAndDoshas(secondHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  true,
);

const mixedHalfPlanets = secondHalfPlanets.map(p => p.name === 'Jupiter'
  ? { ...p, signIndex: 2, sign: 'Gemini' as ZodiacSign }
  : p
);
expect(
  'Kala Sarpa rejects a split-axis chart',
  calculateYogasAndDoshas(mixedHalfPlanets, 'Aries').doshas.find(d => d.id === 'kala_sarpa')?.present,
  false,
);

let passed = 0;
for (const c of checks) {
  if (c.pass) {
    passed++;
    console.log('✅ ' + c.name);
  } else {
    console.error('❌ ' + c.name + ' — ' + c.detail);
  }
}

console.log('\n==================================================');
console.log(`PHASE 10 CALCULATION TRUTH CONTRACT: ${passed} PASSED | ${checks.length - passed} FAILED`);
console.log('==================================================');

if (passed !== checks.length) process.exitCode = 1;
