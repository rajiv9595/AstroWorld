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
const KARAKA_ROLES_8: {
  role: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  roleName: string;
  signification: string;
}[] = [
  { role: 'AK', roleName: 'Atmakaraka (आत्मकारक)', signification: 'Soul signified, deepest spiritual purpose, self-realization, and life essence.' },
  { role: 'AmK', roleName: 'Amatyakaraka (अमात्यकारक)', signification: 'Career, ministership, intellect, professional achievements, and actions.' },
  { role: 'BK', roleName: 'Bhratrukaraka (भ्रातृकारक)', signification: 'Guru, mentors, spiritual guides, siblings, and moral courage.' },
  { role: 'MK', roleName: 'Matrukaraka (मातृकारक)', signification: 'Mother, emotional heart, nurturing shelter, formal schooling, and inner peace.' },
  { role: 'PK', roleName: 'Pitrukaraka (पितृकारक)', signification: 'Father, ancestry, lineage, higher principles, and purva punya.' },
  { role: 'PK', roleName: 'Putrakaraka (पुत्रकारक)', signification: 'Children, creative genius, speculative intellect, and disciples.' },
  { role: 'GK', roleName: 'Gnatikaraka (ज्ञातिकारक)', signification: 'Obstacles, competitive challenges, conflicts, diseases, and karmic tests.' },
  { role: 'DK', roleName: 'Darakaraka (दारकारक)', signification: 'Spouse, marriage, intimate life partners, business allies, and sensual bonding.' },
];

/**
 * Convention note:
 * AstroWorld supports both the classical 7-karaka scheme (Sun-Saturn, default)
 * and the 8-karaka scheme (including Rahu with reversed within-sign degree).
 * The selected scheme is made explicit in the returned metadata.
 */
export function calculateJaiminiFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  d9Chart?: VargaChart,
  d10Chart?: VargaChart,
  karakaScheme: 'seven_karaka' | 'eight_karaka' = 'seven_karaka'
): JaiminiFacts {
  const eligibleBodies: PlanetName[] =
    karakaScheme === 'eight_karaka'
      ? ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu']
      : ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  const candidates = planets
    .filter((p) => eligibleBodies.includes(p.name))
    .map((p) => {
      // In Jaimini 8-karaka scheme, Rahu moves retrograde through the zodiac;
      // classical convention calculates its advance within sign as (30° - longitude).
      const effectiveDegree =
        karakaScheme === 'eight_karaka' && p.name === 'Rahu'
          ? Math.max(0, 30 - p.degreeInSign)
          : p.degreeInSign;
      return {
        name: p.name,
        degreeInSign: effectiveDegree,
        sign: p.sign,
      };
    });

  // Break exact degree ties deterministically by canonical planet order.
  const canonicalOrder: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
  candidates.sort((a, b) =>
    b.degreeInSign - a.degreeInSign ||
    canonicalOrder.indexOf(a.name) - canonicalOrder.indexOf(b.name)
  );

  const rolesList = karakaScheme === 'eight_karaka' ? KARAKA_ROLES_8 : KARAKA_ROLES;

  const charaKarakas: CharaKaraka[] = candidates.map((c, idx) => {
    const meta = rolesList[idx] || KARAKA_ROLES[idx] || KARAKA_ROLES[KARAKA_ROLES.length - 1];
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
  const amatyakaraka = charaKarakas[1]?.planet;

  // Amatyakaraka detailed multi-layer placements (D1, D9, D10)
  let amatyakarakaDetails: import('./types.ts').AmatyakarakaDetails | undefined = undefined;
  if (charaKarakas.length > 1) {
    const amkCandidate = charaKarakas[1];
    const amkPlanet = planets.find((p) => p.name === amkCandidate.planet);
    if (amkPlanet) {
      const d1House = ((amkPlanet.signIndex - ascendantSignIndex + 12) % 12) + 1;
      let d9Sign: ZodiacSign | undefined;
      let d9House: number | undefined;
      if (d9Chart) {
        const d9p = d9Chart.planets.find((p) => p.planet === amkCandidate.planet);
        if (d9p) {
          d9Sign = d9p.vargaSign;
          d9House = d9p.houseNumber;
        }
      }
      let d10Sign: ZodiacSign | undefined;
      let d10House: number | undefined;
      if (d10Chart) {
        const d10p = d10Chart.planets.find((p) => p.planet === amkCandidate.planet);
        if (d10p) {
          d10Sign = d10p.vargaSign;
          d10House = d10p.houseNumber;
        }
      }
      amatyakarakaDetails = {
        planet: amkCandidate.planet,
        degreeInSign: amkCandidate.degreeInSign,
        formattedDegree: amkCandidate.formattedDegree,
        d1Sign: amkPlanet.sign,
        d1House,
        d9Sign,
        d9House,
        d10Sign,
        d10House,
      };
    }
  }

  // Karakamsa: Navamsha sign of Atmakaraka
  let karakamsaNavamshaSign: ZodiacSign = 'Aries';
  if (d9Chart) {
    const d9Placement = d9Chart.planets.find((p) => p.planet === atmakaraka);
    if (d9Placement) {
      karakamsaNavamshaSign = d9Placement.vargaSign;
    }
  }

  // 10th House from Karakamsa in D9 Navamsha (Jaimini Sutras 1.2 / 1.3 career factor)
  const karakamsaNavamshaSignIndex = ZODIAC_SIGNS.indexOf(karakamsaNavamshaSign);
  const tenthFromKLSignIndex = (karakamsaNavamshaSignIndex + 9) % 12; // 10th sign (9 steps forward)
  const tenthFromKLSign = ZODIAC_SIGNS[tenthFromKLSignIndex];
  let kl10Occupants: PlanetName[] = [];
  if (d9Chart) {
    kl10Occupants = d9Chart.planets
      .filter((p) => p.vargaSign === tenthFromKLSign)
      .map((p) => p.planet);
  }
  const tenthFromKarakamsaNavamsha = {
    sign: tenthFromKLSign,
    signIndex: tenthFromKLSignIndex,
    occupants: kl10Occupants,
  };

  // Arudha Lagna (AL = Pada of House 1)
  const al = calculateArudhaPada(1, ascendantSignIndex, planets);

  // Upapada Lagna (UL = Pada of House 12)
  const ul = calculateArudhaPada(12, ascendantSignIndex, planets);

  // Rajya Pada (A10 = Pada of House 10: public status, profession, worldly career manifestation)
  const a10 = calculateArudhaPada(10, ascendantSignIndex, planets);

  return {
    charaKarakas,
    atmakaraka,
    amatyakaraka,
    amatyakarakaDetails,
    karakaScheme,
    karakamsaSign: charaKarakas[0].sign,
    karakamsaNavamshaSign,
    tenthFromKarakamsaNavamsha,
    arudhaLagna: {
      sign: al.sign,
      houseNumber: al.houseNumber,
    },
    upapadaLagna: {
      sign: ul.sign,
      houseNumber: ul.houseNumber,
    },
    rajyaPadaA10: {
      sign: a10.sign,
      signIndex: a10.signIndex,
      houseNumber: a10.houseNumber,
    },
  };
}
