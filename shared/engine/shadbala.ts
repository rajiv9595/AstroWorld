/**
 * ASTROWORLD — Shadbala, Bhava Bala, and Avastha Engine
 * Classical Parashari strength calculations (Virupas & Rupas).
 */

import {
  MOOLATRIKONA_MAP,
  NAISARGIKA_RELATIONSHIPS,
  OWN_SIGNS_MAP,
  SIGN_LORDS,
  ZODIAC_SIGNS,
} from './constants.ts';
import { calculateVargaSignIndex } from './vargas.ts';
import {
  BhavaBalaItem,
  PlanetName,
  PlanetaryAvasthas,
  PlanetPosition,
  ShadbalaFactor,
  StrengthFacts,
  ZodiacSign,
} from './types.ts';

// Classical minimum required Virupas for 7 bodies
const MIN_REQUIRED_VIRUPAS: Record<PlanetName, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
  Rahu: 300,
  Ketu: 300,
};

// Fixed natural strength (Naisargika Bala) in Virupas.
const NAISARGIKA_BALA: Record<PlanetName, number> = {
  Sun: 60.0, Moon: 51.43, Venus: 42.86, Jupiter: 34.29,
  Mercury: 25.71, Mars: 17.14, Saturn: 8.57,
  Rahu: 15.0, Ketu: 15.0,
};

const CLASSICAL_SHADBALA_BODIES: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
];

const SAPTAVARGA_CODES = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'] as const;

function circularDistanceDegrees(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return Math.min(raw, 360 - raw);
}

function calculateUcchaBala(planet: PlanetPosition): number {
  const ex: Partial<Record<PlanetName, { sign: ZodiacSign; deepDegree: number }>> = {
    Sun: { sign: 'Aries', deepDegree: 10 },
    Moon: { sign: 'Taurus', deepDegree: 3 },
    Mars: { sign: 'Capricorn', deepDegree: 28 },
    Mercury: { sign: 'Virgo', deepDegree: 15 },
    Jupiter: { sign: 'Cancer', deepDegree: 5 },
    Venus: { sign: 'Pisces', deepDegree: 27 },
    Saturn: { sign: 'Libra', deepDegree: 20 },
  };
  const point = ex[planet.name];
  if (!point) return 0;
  const exaltationLongitude = ZODIAC_SIGNS.indexOf(point.sign) * 30 + point.deepDegree;
  return Math.max(0, Math.round((60 - circularDistanceDegrees(planet.siderealLongitude, exaltationLongitude) / 3) * 100) / 100);
}

function calculateSaptavargajaBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const score = { greatFriend: 22.5, friend: 15, neutral: 7.5, enemy: 3.75, greatEnemy: 1.875 };
  const permanent = NAISARGIKA_RELATIONSHIPS[planet.name];
  const temporaryFriendHouses = new Set([2, 3, 4, 10, 11, 12]);

  const total = SAPTAVARGA_CODES.reduce((sum, code) => {
    const placement = calculateVargaSignIndex(code, planet.siderealLongitude);
    const sign = ZODIAC_SIGNS[placement.signIndex];
    const owner = SIGN_LORDS[sign];

    if ((code === 'D1') && MOOLATRIKONA_MAP[planet.name]?.sign === sign &&
        placement.degreeInVargaSign >= MOOLATRIKONA_MAP[planet.name]!.startDegree &&
        placement.degreeInVargaSign < MOOLATRIKONA_MAP[planet.name]!.endDegree) {
      return sum + 45;
    }
    if ((OWN_SIGNS_MAP[planet.name] || []).includes(sign)) return sum + 30;
    if (!permanent) return sum + score.neutral;

    const natural =
      permanent.friends.includes(owner) ? 1 :
      permanent.enemies.includes(owner) ? -1 : 0;

    const ownerPlanet = planets.find(p => p.name === owner);
    const temporary = ownerPlanet
      ? (temporaryFriendHouses.has(((ownerPlanet.houseNumber - planet.houseNumber + 12) % 12) + 1) ? 1 : -1)
      : 0;

    const compound = natural + temporary;
    if (compound >= 2) return sum + score.greatFriend;
    if (compound === 1) return sum + score.friend;
    if (compound === 0) return sum + score.neutral;
    if (compound === -1) return sum + score.enemy;
    return sum + score.greatEnemy;
  }, 0);

  return Math.round(total * 100) / 100;
}

function calculateOjaYugmaBala(planet: PlanetPosition): number {
  const female = planet.name === 'Moon' || planet.name === 'Venus';
  const d1Matches = female ? planet.signIndex % 2 === 1 : planet.signIndex % 2 === 0;
  const d9 = calculateVargaSignIndex('D9', planet.siderealLongitude);
  const d9Matches = female ? d9.signIndex % 2 === 1 : d9.signIndex % 2 === 0;
  return (d1Matches ? 15 : 0) + (d9Matches ? 15 : 0);
}

function calculateKendradiBala(house: number): number {
  if ([1, 4, 7, 10].includes(house)) return 60;
  if ([2, 5, 8, 11].includes(house)) return 30;
  return 15;
}

function calculateDrekkanaBala(planet: PlanetPosition): number {
  const deg = planet.degreeInSign;
  if (['Sun', 'Mars', 'Jupiter'].includes(planet.name)) return deg < 10 ? 15 : 0;
  if (['Mercury', 'Saturn'].includes(planet.name)) return deg >= 10 && deg < 20 ? 15 : 0;
  if (['Moon', 'Venus'].includes(planet.name)) return deg >= 20 ? 15 : 0;
  return 0;
}

// House where each planet gets maximum Dig Bala (Directional Strength - 60 Virupas)
const DIG_BALA_OPTIMAL_HOUSES: Record<PlanetName, number> = {
  Jupiter: 1, // East / Lagna
  Mercury: 1,
  Moon: 4, // North / Nadir
  Venus: 4,
  Saturn: 7, // West / Descendant
  Sun: 10, // South / Midheaven
  Mars: 10,
  Rahu: 10,
  Ketu: 4,
};

/**
 * Compute Dig Bala (0 to 60 Virupas) based on distance from optimal house.
 */
function calculateDigBala(planet: PlanetName, house: number): number {
  const optHouse = DIG_BALA_OPTIMAL_HOUSES[planet];
  if (!optHouse) return 0;
  const houseDiff = Math.min(
    Math.abs(house - optHouse),
    12 - Math.abs(house - optHouse),
  );
  return Math.round(Math.max(0, 60 - houseDiff * 10) * 100) / 100;
}

/**
 * Compute Sthana Bala (Positional Strength) approx in Virupas.
 */
function calculateSthanaBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const uccha = calculateUcchaBala(planet);
  const saptavargaja = calculateSaptavargajaBala(planet, planets);
  const ojayugma = calculateOjaYugmaBala(planet);
  const kendradi = calculateKendradiBala(planet.houseNumber);
  const drekkana = calculateDrekkanaBala(planet);
  return Math.round((uccha + saptavargaja + ojayugma + kendradi + drekkana) * 100) / 100;
}

/**
 * Compute Kala Bala (Temporal Strength) in Virupas.
 */
function calculateKalaBala(
  planet: PlanetPosition,
  birthHourFraction: number,
  moonSunElongation: number,
): number {
  // Classical sub-components available from the current input contract:
  // Nathonnatha + Paksha. Tribhaga, Vara/Hora, Ayana and Yuddha need richer
  // birth-context inputs and are deliberately not fabricated here.
  if (planet.name === 'Mercury') {
    const nathonnatha = 60;
    const half = moonSunElongation <= 180 ? moonSunElongation : 360 - moonSunElongation;
    const paksha = Math.max(0, Math.min(60, half / 3));
    return Math.round((nathonnatha + paksha) * 100) / 100;
  }

  const hour = ((birthHourFraction % 24) + 24) % 24;
  const distanceFromMidnight = Math.min(hour, 24 - hour);
  const unna = (distanceFromMidnight / 12) * 60;
  const nata = 60 - unna;
  const nathonnatha = ['Sun', 'Jupiter', 'Venus'].includes(planet.name) ? unna : nata;

  const half = moonSunElongation <= 180 ? moonSunElongation : 360 - moonSunElongation;
  const beneficPaksha = Math.max(0, Math.min(60, half / 3));
  const paksha = ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planet.name)
    ? beneficPaksha
    : 60 - beneficPaksha;

  return Math.round((nathonnatha + paksha) * 100) / 100;
}

/**
 * Compute Chesta Bala (Motional Strength) in Virupas.
 */
function calculateChestaBala(planet: PlanetPosition): number {
  if (planet.name === 'Sun' || planet.name === 'Moon') return 30;
  if (planet.retrograde) return 60;
  // Without mean-vs-true longitude inputs we cannot distinguish the remaining
  // classical motion states without guessing; use the neutral partial value.
  return 30;
}

/**
 * Compute Drik Bala (Aspect Strength) in Virupas.
 */
function calculateDrikBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const moon = planets.find(p => p.name === 'Moon');
  const sun = planets.find(p => p.name === 'Sun');
  const elongation = moon && sun
    ? ((moon.siderealLongitude - sun.siderealLongitude) % 360 + 360) % 360
    : 90;
  let score = 0;

  for (const source of planets) {
    if (source.name === planet.name || !CLASSICAL_SHADBALA_BODIES.includes(source.name)) continue;
    const diff = (planet.houseNumber - source.houseNumber + 12) % 12;
    const aspects =
      diff === 6 ||
      (source.name === 'Mars' && (diff === 3 || diff === 7)) ||
      (source.name === 'Jupiter' && (diff === 4 || diff === 8)) ||
      (source.name === 'Saturn' && (diff === 2 || diff === 9));
    if (!aspects) continue;

    const benefic =
      ['Jupiter', 'Venus', 'Mercury'].includes(source.name) ||
      (source.name === 'Moon' && elongation < 180);
    score += benefic ? 15 : -15;
  }

  return Math.max(-60, Math.min(60, score));
}

/**
 * Compute complete Shadbala breakdown for all 7 classical planets (+ nodes).
 */
export function calculateShadbala(
  planets: PlanetPosition[],
  birthHour: number = 0
): ShadbalaFactor[] {
  const classicalBodies: PlanetName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];

  const factors: ShadbalaFactor[] = classicalBodies.map((name) => {
    const p = planets.find((x) => x.name === name)!;
    const sthanaBala = calculateSthanaBala(p, planets);
    const digBala = calculateDigBala(name, p.houseNumber);
    const moon = planets.find(x => x.name === 'Moon');
    const sun = planets.find(x => x.name === 'Sun');
    const moonSunElongation = moon && sun
      ? ((moon.siderealLongitude - sun.siderealLongitude) % 360 + 360) % 360
      : 90;
    const kalaBala = calculateKalaBala(p, birthHour, moonSunElongation);
    const chestaBala = calculateChestaBala(p);
    const naisargikaBala = NAISARGIKA_BALA[name];
    const drikBala = calculateDrikBala(p, planets);

    const totalVirupas = Math.round(
      (sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala) * 10
    ) / 10;
    const totalRupas = Math.round((totalVirupas / 60.0) * 100) / 100;
    const required = MIN_REQUIRED_VIRUPAS[name];
    const strengthRatio = Math.round((totalVirupas / required) * 100) / 100;

    let verdict: 'STRONG' | 'ADEQUATE' | 'WEAK' = 'ADEQUATE';
    if (strengthRatio >= 1.15) verdict = 'STRONG';
    else if (strengthRatio < 0.95) verdict = 'WEAK';

    return {
      planet: name,
      sthanaBala,
      digBala,
      kalaBala,
      chestaBala,
      naisargikaBala,
      drikBala,
      totalVirupas,
      totalRupas,
      requiredVirupas: required,
      strengthRatio,
      rank: 1, // calculated after sorting
      verdict,
    };
  });

  // Sort by strengthRatio descending to assign ranks
  const sorted = [...factors].sort((a, b) => b.strengthRatio - a.strengthRatio);
  sorted.forEach((f, idx) => {
    const match = factors.find((x) => x.planet === f.planet)!;
    match.rank = idx + 1;
  });

  return factors;
}

/**
 * Compute Bhava Bala (Strength of 12 Houses).
 */
export function calculateBhavaBala(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  shadbala: ShadbalaFactor[]
): BhavaBalaItem[] {
  const items: BhavaBalaItem[] = [];

  for (let house = 1; house <= 12; house++) {
    const signIndex = (ascendantSignIndex + (house - 1)) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const lord = SIGN_LORDS[sign];
    const lordShadbala = shadbala.find((s) => s.planet === lord);
    const lordVirupas = lordShadbala ? lordShadbala.totalVirupas : 350;

    // Dig Bala of Bhava (Kendras have higher natural strength)
    let bhavaDigBala = 30;
    if ([1, 4, 7, 10].includes(house)) bhavaDigBala = 60;
    else if ([5, 9].includes(house)) bhavaDigBala = 45;

    // Aspect bonus
    const bhavaDrishtiBala = 25;

    const totalVirupas = Math.round((lordVirupas * 0.7 + bhavaDigBala + bhavaDrishtiBala) * 10) / 10;
    const totalRupas = Math.round((totalVirupas / 60.0) * 100) / 100;

    items.push({
      houseNumber: house,
      sign,
      lord,
      bhavadhipatiBala: Math.round(lordVirupas * 0.7 * 10) / 10,
      bhavaDigBala,
      bhavaDrishtiBala,
      totalVirupas,
      totalRupas,
      rank: 1,
    });
  }

  const sorted = [...items].sort((a, b) => b.totalVirupas - a.totalVirupas);
  sorted.forEach((item, idx) => {
    const match = items.find((x) => x.houseNumber === item.houseNumber)!;
    match.rank = idx + 1;
  });

  return items;
}

/**
 * Calculate Baladi, Jagradadi, Deeptadi Avasthas & Functional Nature for all planets.
 */
export function calculateAvasthas(
  planets: PlanetPosition[],
  ascendantSign: ZodiacSign
): PlanetaryAvasthas[] {
  return planets.map((p) => {
    const deg = p.degreeInSign;
    const isOddSign = p.signIndex % 2 === 0;

    // 1. Baladi Avasthas
    let baladi: PlanetaryAvasthas['baladi'] = 'Yuva';
    if (isOddSign) {
      if (deg < 6) baladi = 'Bala';
      else if (deg < 12) baladi = 'Kumara';
      else if (deg < 18) baladi = 'Yuva';
      else if (deg < 24) baladi = 'Vriddha';
      else baladi = 'Mrita';
    } else {
      if (deg < 6) baladi = 'Mrita';
      else if (deg < 12) baladi = 'Vriddha';
      else if (deg < 18) baladi = 'Yuva';
      else if (deg < 24) baladi = 'Kumara';
      else baladi = 'Bala';
    }

    // 2. Deeptadi Avasthas
    let deeptadi: PlanetaryAvasthas['deeptadi'] = 'Shanta';
    if (p.combust) deeptadi = 'Vikala';
    else if (p.dignity === 'EXALTED') deeptadi = 'Deepta';
    else if (p.dignity === 'OWN_SIGN' || p.dignity === 'MOOLATRIKONA') deeptadi = 'Swastha';
    else if (p.dignity === 'FRIEND') deeptadi = 'Mudita';
    else if (p.dignity === 'NEUTRAL') deeptadi = 'Shanta';
    else if (p.dignity === 'ENEMY') deeptadi = 'Deena';
    else if (p.dignity === 'DEBILITATED') deeptadi = 'Dukhita';

    // 3. Jagradadi Avasthas
    let jagradadi: PlanetaryAvasthas['jagradadi'] = 'Swapna';
    if (['Deepta', 'Swastha'].includes(deeptadi)) jagradadi = 'Jagrata';
    else if (['Deena', 'Dukhita', 'Vikala'].includes(deeptadi)) jagradadi = 'Sushupti';

    // 4. Functional Nature according to Lagna
    let functionalNature: PlanetaryAvasthas['functionalNature'] = 'Benefic';

    // Special Yogakaraka determination:
    if (ascendantSign === 'Taurus' && p.name === 'Saturn') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Libra' && p.name === 'Saturn') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Cancer' && p.name === 'Mars') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Leo' && p.name === 'Mars') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Capricorn' && p.name === 'Venus') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Aquarius' && p.name === 'Venus') functionalNature = 'Yogakaraka';
    else if ([2, 7].includes(p.houseNumber)) functionalNature = 'Maraka';
    else if ([6, 8, 12].includes(p.houseNumber)) functionalNature = 'Malefic';
    else if ([1, 5, 9].includes(p.houseNumber)) functionalNature = 'Benefic';
    else functionalNature = 'Neutral';

    return {
      planet: p.name,
      baladi,
      jagradadi,
      deeptadi,
      functionalNature,
    };
  });
}

/**
 * Complete strength suite.
 */
export function calculateStrengthFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  birthHour: number = 0
): StrengthFacts {
  const shadbala = calculateShadbala(planets, birthHour);
  const bhavaBala = calculateBhavaBala(planets, ascendantSignIndex, shadbala);
  const avasthas = calculateAvasthas(planets, ZODIAC_SIGNS[ascendantSignIndex]);

  return {
    shadbala,
    bhavaBala,
    avasthas,
    methodology: {
      shadbala: 'classical_partial',
      notes: [
        'Sthana Bala uses Uchcha, Saptavargaja, Oja-Yugma, Kendradi and Drekkana sub-components.',
        'Kala Bala currently includes Nathonnatha and Paksha only; Tribhaga, Varsha/Masa/Vara/Hora, Ayana and Yuddha require richer birth-context inputs.',
        'Cheshta Bala uses exact retrograde=60 treatment for classical planets; the remaining direct-motion states are intentionally not guessed.',
        'Drik Bala uses discrete Parashari graha-drishṭi contributions (+15 benefic / -15 malefic) and is sign/house based.',
        'Bhava Bala remains an approximate house-strength layer and should not be represented as a full BPHS Bhava Bala computation.',
      ],
    },
  };
}
