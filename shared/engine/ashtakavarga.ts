/**
 * ASTROWORLD — Parashari Ashtakavarga Engine
 * Canonical Bhinnashtakavarga (BAV) and 337-Bindu Samudayashtakavarga (SAV).
 */

import { ZODIAC_SIGNS } from './constants.ts';
import { AshtakavargaFacts, PlanetName, PlanetPosition, ZodiacSign } from './types.ts';

// Classical Parashari Bindu benefic points contributed by each body (from BPHS Ch. 66-72)
// For each target planet, lists the benefic house offsets (1-12) from:
// [Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna]
type BeneficOffsets = Record<PlanetName, number[]>;

const ASHTAKAVARGA_RULES: Record<
  PlanetName,
  {
    fromSun: number[];
    fromMoon: number[];
    fromMars: number[];
    fromMercury: number[];
    fromJupiter: number[];
    fromVenus: number[];
    fromSaturn: number[];
    fromLagna: number[];
  }
> = {
  Sun: {
    fromSun: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMoon: [3, 6, 10, 11],
    fromMars: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMercury: [3, 5, 6, 9, 10, 11, 12],
    fromJupiter: [5, 6, 9, 11],
    fromVenus: [6, 7, 12],
    fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11],
    fromLagna: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    fromSun: [3, 6, 7, 8, 10, 11],
    fromMoon: [1, 3, 6, 7, 10, 11],
    fromMars: [2, 3, 5, 6, 9, 10, 11],
    fromMercury: [1, 3, 4, 5, 7, 8, 10, 11],
    fromJupiter: [1, 4, 7, 8, 10, 11, 12],
    fromVenus: [3, 4, 5, 7, 9, 10, 11],
    fromSaturn: [3, 5, 6, 11],
    fromLagna: [3, 6, 10, 11],
  },
  Mars: {
    fromSun: [3, 5, 6, 10, 11],
    fromMoon: [3, 6, 11],
    fromMars: [1, 2, 4, 7, 8, 10, 11],
    fromMercury: [3, 5, 6, 11],
    fromJupiter: [6, 10, 11, 12],
    fromVenus: [6, 8, 11, 12],
    fromSaturn: [1, 4, 7, 8, 9, 10, 11],
    fromLagna: [1, 3, 6, 10, 11],
  },
  Mercury: {
    fromSun: [5, 6, 9, 11, 12],
    fromMoon: [2, 4, 6, 8, 10, 11],
    fromMars: [1, 2, 4, 7, 8, 9, 10, 11],
    fromMercury: [1, 3, 5, 6, 9, 10, 11, 12],
    fromJupiter: [6, 8, 11, 12],
    fromVenus: [1, 2, 3, 4, 5, 8, 9, 11],
    fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11],
    fromLagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    fromSun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    fromMoon: [2, 5, 7, 9, 11],
    fromMars: [1, 2, 4, 7, 8, 10, 11],
    fromMercury: [1, 2, 4, 5, 6, 9, 10, 11],
    fromJupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    fromVenus: [2, 5, 6, 9, 10, 11],
    fromSaturn: [3, 5, 6, 12],
    fromLagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    fromSun: [8, 11, 12],
    fromMoon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    fromMars: [3, 5, 6, 9, 11, 12],
    fromMercury: [3, 5, 6, 9, 11],
    fromJupiter: [5, 8, 9, 10, 11],
    fromVenus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    fromSaturn: [3, 4, 5, 8, 9, 10, 11],
    fromLagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    fromSun: [1, 2, 4, 7, 8, 10, 11],
    fromMoon: [3, 6, 11],
    fromMars: [3, 5, 6, 10, 11, 12],
    fromMercury: [6, 8, 9, 10, 11, 12],
    fromJupiter: [5, 6, 11, 12],
    fromVenus: [6, 11, 12],
    fromSaturn: [3, 5, 6, 11],
    fromLagna: [1, 3, 4, 6, 10, 11],
  },
  Rahu: {
    fromSun: [], fromMoon: [], fromMars: [], fromMercury: [], fromJupiter: [], fromVenus: [], fromSaturn: [], fromLagna: [],
  },
  Ketu: {
    fromSun: [], fromMoon: [], fromMars: [], fromMercury: [], fromJupiter: [], fromVenus: [], fromSaturn: [], fromLagna: [],
  },
};

/**
 * Calculate complete 7-planet Bhinnashtakavarga (BAV) and 337-bindu Samudayashtakavarga (SAV).
 */
export function calculateAshtakavarga(
  planets: PlanetPosition[],
  ascendantSignIndex: number
): AshtakavargaFacts {
  const classicalBodies: PlanetName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];

  // Sign indices of contributors
  const contributorIndices: Record<string, number> = {
    Lagna: ascendantSignIndex,
  };
  for (const p of planets) {
    contributorIndices[p.name] = p.signIndex;
  }

  const bav: Record<PlanetName, number[]> = {
    Sun: new Array(12).fill(0),
    Moon: new Array(12).fill(0),
    Mars: new Array(12).fill(0),
    Mercury: new Array(12).fill(0),
    Jupiter: new Array(12).fill(0),
    Venus: new Array(12).fill(0),
    Saturn: new Array(12).fill(0),
    Rahu: new Array(12).fill(0),
    Ketu: new Array(12).fill(0),
  };

  const sav = new Array(12).fill(0);

  // Compute for each of the 7 classical planets
  for (const planet of classicalBodies) {
    const rules = ASHTAKAVARGA_RULES[planet];
    const planetBav = new Array(12).fill(0);

    const contributors: { name: string; offsets: number[] }[] = [
      { name: 'Sun', offsets: rules.fromSun },
      { name: 'Moon', offsets: rules.fromMoon },
      { name: 'Mars', offsets: rules.fromMars },
      { name: 'Mercury', offsets: rules.fromMercury },
      { name: 'Jupiter', offsets: rules.fromJupiter },
      { name: 'Venus', offsets: rules.fromVenus },
      { name: 'Saturn', offsets: rules.fromSaturn },
      { name: 'Lagna', offsets: rules.fromLagna },
    ];

    for (const c of contributors) {
      const sourceSignIdx = contributorIndices[c.name];
      for (const offset of c.offsets) {
        // offset 1 = source sign itself (0 shift)
        const targetSignIdx = (sourceSignIdx + (offset - 1)) % 12;
        planetBav[targetSignIdx] += 1;
      }
    }

    bav[planet] = planetBav;

    // Accumulate into SAV
    for (let s = 0; s < 12; s++) {
      sav[s] += planetBav[s];
    }
  }

  const strongSigns: ZodiacSign[] = [];
  const averageSigns: ZodiacSign[] = [];
  const weakSigns: ZodiacSign[] = [];

  sav.forEach((bindus, signIdx) => {
    const sign = ZODIAC_SIGNS[signIdx];
    if (bindus > 28) strongSigns.push(sign);
    else if (bindus === 28) averageSigns.push(sign);
    else weakSigns.push(sign);
  });

  const totalBindus = sav.reduce((a, b) => a + b, 0);

  return {
    bav,
    sav,
    sarvashtakavargaTotal: totalBindus, // Exactly 337
    strongSigns,
    averageSigns,
    weakSigns,
  };
}
