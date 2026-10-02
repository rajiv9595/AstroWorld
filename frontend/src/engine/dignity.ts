/**
 * ASTROWORLD — Canonical Dignity & Relationship Engine
 * Independent structured dignity evaluation per Chart/Varga.
 */

import {
  DEBILITATION_MAP,
  EXALTATION_MAP,
  MOOLATRIKONA_MAP,
  NAISARGIKA_RELATIONSHIPS,
  OWN_SIGNS_MAP,
  SIGN_LORDS,
} from './constants.ts';
import { DignityType, PlanetName, PlanetPosition, ZodiacSign } from './types.ts';

export interface DignityFact {
  chartContext: string; // e.g. "D1", "D9", "D10"
  planet: PlanetName;
  occupiedSign: ZodiacSign;
  degreeInSign: number;
  signLord: PlanetName;
  naturalRelationshipToLord: 'FRIEND' | 'NEUTRAL' | 'ENEMY' | 'SELF';
  dignity: DignityType;
  deepestPointDistance?: number;
  description: string;
}

/**
 * Calculate canonical dignity for any planet in any chart or varga.
 * Retains strict independence between charts.
 */
export function calculateDignity(
  planet: PlanetName,
  occupiedSign: ZodiacSign,
  degreeInSign: number = 0,
  chartContext: string = 'D1'
): DignityFact {
  const signLord = SIGN_LORDS[occupiedSign];

  // 1. Debilitation check
  const deb = DEBILITATION_MAP[planet];
  if (deb && deb.sign === occupiedSign) {
    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: 'ENEMY',
      dignity: 'DEBILITATED',
      deepestPointDistance: Math.abs(degreeInSign - deb.deepDegree),
      description: `${chartContext} ${planet} in ${occupiedSign} is DEBILITATED (Neecha). Deep debilitation point: ${deb.deepDegree}°.`,
    };
  }

  // 2. Exaltation check (takes precedence in all divisional and sign-level assessments)
  const ex = EXALTATION_MAP[planet];
  if (ex && ex.sign === occupiedSign) {
    // Special classical case for Mercury: Exalted 0-15° in Virgo, Moolatrikona 15-20° in Virgo
    if (planet === 'Mercury' && chartContext === 'D1' && degreeInSign > 15.0 && degreeInSign <= 20.0) {
      return {
        chartContext,
        planet,
        occupiedSign,
        degreeInSign,
        signLord,
        naturalRelationshipToLord: 'SELF',
        dignity: 'MOOLATRIKONA',
        description: `${chartContext} ${planet} in ${occupiedSign} (${degreeInSign.toFixed(2)}°) is in its MOOLATRIKONA zone [15° - 20°].`,
      };
    }

    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: 'FRIEND',
      dignity: 'EXALTED',
      deepestPointDistance: Math.abs(degreeInSign - ex.deepDegree),
      description: `${chartContext} ${planet} in ${occupiedSign} is EXALTED (Uchcha). Deep exaltation point: ${ex.deepDegree}°.`,
    };
  }

  // 3. Moolatrikona check
  const mt = MOOLATRIKONA_MAP[planet];
  if (mt && mt.sign === occupiedSign && (chartContext !== 'D1' || (degreeInSign >= mt.startDegree && degreeInSign < mt.endDegree))) {
    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: 'SELF',
      dignity: 'MOOLATRIKONA',
      description: `${chartContext} ${planet} in ${occupiedSign} (${degreeInSign.toFixed(2)}°) is in its MOOLATRIKONA zone [${mt.startDegree}° - ${mt.endDegree}°).`,
    };
  }

  // 4. Own Sign check
  const ownSigns = OWN_SIGNS_MAP[planet] || [];
  if (ownSigns.includes(occupiedSign)) {
    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: 'SELF',
      dignity: 'OWN_SIGN',
      description: `${chartContext} ${planet} in ${occupiedSign} is in its OWN SIGN (Swakshetra).`,
    };
  }

  // 5. Natural friendship to sign lord
  const rels = NAISARGIKA_RELATIONSHIPS[planet];
  let naturalRel: 'FRIEND' | 'NEUTRAL' | 'ENEMY' = 'NEUTRAL';
  let dignity: DignityType = 'NEUTRAL';

  if (rels) {
    if (rels.friends.includes(signLord)) {
      naturalRel = 'FRIEND';
      dignity = 'FRIEND';
    } else if (rels.enemies.includes(signLord)) {
      naturalRel = 'ENEMY';
      dignity = 'ENEMY';
    } else {
      naturalRel = 'NEUTRAL';
      dignity = 'NEUTRAL';
    }
  }

  return {
    chartContext,
    planet,
    occupiedSign,
    degreeInSign,
    signLord,
    naturalRelationshipToLord: naturalRel,
    dignity,
    description: `${chartContext} ${planet} in ${occupiedSign} is in ${dignity} sign of lord ${signLord}.`,
  };
}

/**
 * Enrich D1 planetary positions with complete canonical dignity facts.
 */
export function enrichPlanetaryDignity(planets: PlanetPosition[]): PlanetPosition[] {
  return planets.map((p) => {
    const fact = calculateDignity(p.name, p.sign, p.degreeInSign, 'D1');
    const scoreMap: Record<DignityType, number> = {
      EXALTED: 60,
      MOOLATRIKONA: 45,
      OWN_SIGN: 30,
      FRIEND: 22.5,
      NEUTRAL: 15,
      ENEMY: 7.5,
      DEBILITATED: 0,
    };
    return {
      ...p,
      dignity: fact.dignity,
      dignityScore: scoreMap[fact.dignity] ?? 15,
      naturalRelationshipToLord: fact.naturalRelationshipToLord === 'SELF' ? 'FRIEND' : fact.naturalRelationshipToLord,
    };
  });
}
