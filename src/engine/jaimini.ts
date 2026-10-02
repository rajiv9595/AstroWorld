/**
 * ASTROWORLD — Jaimini Sutras Engine
 * Chara Karakas (7-karaka scheme), Karakamsa, Arudha Lagna (AL), and Upapada Lagna (UL).
 */

import { formatDMS } from './astronomy.ts';
import { SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import {
  CharaKaraka,
  JaiminiFacts,
  PlanetName,
  PlanetPosition,
  VargaChart,
  ZodiacSign,
} from './types.ts';

const KARAKA_ROLES: {
  role: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  roleName: string;
  signification: string;
}[] = [
  { role: 'AK', roleName: 'Atmakaraka (आत्मकारक)', signification: 'Soul signified, deepest spiritual purpose, self-realization, and life essence.' },
  { role: 'AmK', roleName: 'Amatyakaraka (अमात्यकारक)', signification: 'Career, ministership, intellect, professional achievements, and actions.' },
  { role: 'BK', roleName: 'Bhratrukaraka (भ्रातृकारक)', signification: 'Guru, mentors, spiritual guides, siblings, and moral courage.' },
  { role: 'MK', roleName: 'Matrukaraka (मातृकारक)', signification: 'Mother, emotional heart, nurturing shelter, formal schooling, and inner peace.' },
  { role: 'PK', roleName: 'Putrakaraka (पुत्रकारक)', signification: 'Children, creative genius, speculative intellect, disciples, and purva punya.' },
  { role: 'GK', roleName: 'Gnatikaraka (ज्ञातिकारक)', signification: 'Obstacles, competitive challenges, conflicts, diseases, and karmic tests.' },
  { role: 'DK', roleName: 'Darakaraka (दारकारक)', signification: 'Spouse, marriage, intimate life partners, business allies, and sensual bonding.' },
];

/**
 * Compute Arudha Pada for a given house number (1 to 12).
 * Jaimini exception rule: If Pada falls in 1st or 7th from source, advance by 10 signs.
 */
export function calculateArudhaPada(
  houseNum: number,
  ascendantSignIndex: number,
  planets: PlanetPosition[]
): { sign: ZodiacSign; signIndex: number; houseNumber: number } {
  // Source house sign
  const sourceSignIndex = (ascendantSignIndex + (houseNum - 1)) % 12;
  const sourceSign = ZODIAC_SIGNS[sourceSignIndex];
  const lord = SIGN_LORDS[sourceSign];

  const lordPlanet = planets.find((p) => p.name === lord)!;
  const lordSignIndex = lordPlanet.signIndex;

  // Count from source sign to lord sign
  const distance = (lordSignIndex - sourceSignIndex + 12) % 12;

  // Count same distance from lord
  let padaSignIndex = (lordSignIndex + distance) % 12;

  // Exception check: if pada falls in same sign or 7th from source sign
  const relDiff = (padaSignIndex - sourceSignIndex + 12) % 12;
  if (relDiff === 0 || relDiff === 6) {
    padaSignIndex = (padaSignIndex + 9) % 12; // 10th sign forward (9 steps)
  }

  const houseNumber = ((padaSignIndex - ascendantSignIndex + 12) % 12) + 1;

  return {
    sign: ZODIAC_SIGNS[padaSignIndex],
    signIndex: padaSignIndex,
    houseNumber,
  };
}

/**
 * Calculate complete Jaimini facts suite.
 */
export function calculateJaiminiFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  d9Chart?: VargaChart
): JaiminiFacts {
  // 1. Eligible 7 classical bodies for Chara Karakas
  const eligibleBodies: PlanetName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];

  const candidates = planets
    .filter((p) => eligibleBodies.includes(p.name))
    .map((p) => ({
      name: p.name,
      degreeInSign: p.degreeInSign,
      sign: p.sign,
    }));

  // Sort descending by degree within sign
  candidates.sort((a, b) => b.degreeInSign - a.degreeInSign);

  const charaKarakas: CharaKaraka[] = candidates.map((c, idx) => {
    const meta = KARAKA_ROLES[idx];
    return {
      role: meta.role,
      roleName: meta.roleName,
      planet: c.name,
      degreeInSign: c.degreeInSign,
      formattedDegree: formatDMS(c.degreeInSign),
      sign: c.sign,
      signification: meta.signification,
    };
  });

  const atmakaraka = charaKarakas[0].planet;

  // Karakamsa: Navamsha sign of Atmakaraka
  let karakamsaNavamshaSign: ZodiacSign = 'Aries';
  if (d9Chart) {
    const d9Placement = d9Chart.planets.find((p) => p.planet === atmakaraka);
    if (d9Placement) {
      karakamsaNavamshaSign = d9Placement.vargaSign;
    }
  }

  // Arudha Lagna (AL = Pada of House 1)
  const al = calculateArudhaPada(1, ascendantSignIndex, planets);

  // Upapada Lagna (UL = Pada of House 12)
  const ul = calculateArudhaPada(12, ascendantSignIndex, planets);

  return {
    charaKarakas,
    atmakaraka,
    karakamsaSign: charaKarakas[0].sign,
    karakamsaNavamshaSign,
    arudhaLagna: {
      sign: al.sign,
      houseNumber: al.houseNumber,
    },
    upapadaLagna: {
      sign: ul.sign,
      houseNumber: ul.houseNumber,
    },
  };
}
