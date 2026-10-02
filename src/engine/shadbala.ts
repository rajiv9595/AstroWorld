/**
 * ASTROWORLD — Shadbala, Bhava Bala, and Avastha Engine
 * Classical Parashari strength calculations (Virupas & Rupas).
 */

import { SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
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

// Fixed natural strength (Naisargika Bala) in Virupas
const NAISARGIKA_BALA: Record<PlanetName, number> = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
  Rahu: 15.0,
  Ketu: 15.0,
};

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
  const optHouse = DIG_BALA_OPTIMAL_HOUSES[planet] || 1;
  const houseDiff = Math.abs(house - optHouse);
  const circularDiff = Math.min(houseDiff, 12 - houseDiff);
  // Maximum at 0 diff (60 virupas), drops linearly to 0 at 6 houses away
  return Math.round((60.0 - (circularDiff / 6.0) * 60.0) * 10) / 10;
}

/**
 * Compute Sthana Bala (Positional Strength) approx in Virupas.
 */
function calculateSthanaBala(planet: PlanetPosition): number {
  let score = 60.0; // base

  // Uchcha Bala (Exaltation / Debilitation component)
  if (planet.dignity === 'EXALTED') score += 60.0;
  else if (planet.dignity === 'MOOLATRIKONA') score += 45.0;
  else if (planet.dignity === 'OWN_SIGN') score += 30.0;
  else if (planet.dignity === 'FRIEND') score += 15.0;
  else if (planet.dignity === 'ENEMY') score -= 15.0;
  else if (planet.dignity === 'DEBILITATED') score -= 30.0;

  // Kendra Bala (Angular house bonus)
  if ([1, 4, 7, 10].includes(planet.houseNumber)) score += 60.0;
  else if ([2, 5, 8, 11].includes(planet.houseNumber)) score += 30.0;
  else score += 15.0;

  return Math.max(20, Math.round(score * 10) / 10);
}

/**
 * Compute Kala Bala (Temporal Strength) in Virupas.
 */
function calculateKalaBala(planet: PlanetPosition, birthHour: number): number {
  let score = 90.0; // nominal base
  const isDay = birthHour >= 6 && birthHour < 18;

  // Day/Night strong planets
  if (isDay) {
    if (['Sun', 'Jupiter', 'Venus'].includes(planet.name)) score += 30.0;
  } else {
    if (['Moon', 'Mars', 'Saturn'].includes(planet.name)) score += 30.0;
  }
  if (planet.name === 'Mercury') score += 20.0; // Strong all times

  return Math.round(score * 10) / 10;
}

/**
 * Compute Chesta Bala (Motional Strength) in Virupas.
 */
function calculateChestaBala(planet: PlanetPosition): number {
  if (['Sun', 'Moon'].includes(planet.name)) return 45.0; // Based on Ayana for luminaries
  if (planet.retrograde) return 60.0; // Vakri planets have peak chesta bala
  if (planet.speed > 1.0) return 45.0;
  return 30.0;
}

/**
 * Compute Drik Bala (Aspect Strength) in Virupas.
 */
function calculateDrikBala(planet: PlanetPosition): number {
  // Benefic influence vs Malefic influence
  if (['Jupiter', 'Venus'].includes(planet.name)) return 25.0;
  if (['Mars', 'Saturn'].includes(planet.name)) return -10.0;
  return 10.0;
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
    const sthanaBala = calculateSthanaBala(p);
    const digBala = calculateDigBala(name, p.houseNumber);
    const kalaBala = calculateKalaBala(p, birthHour);
    const chestaBala = calculateChestaBala(p);
    const naisargikaBala = NAISARGIKA_BALA[name];
    const drikBala = calculateDrikBala(p);

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
  };
}
