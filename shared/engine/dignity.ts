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

function relationshipToSignLord(
  planet: PlanetName,
  signLord: PlanetName,
): 'FRIEND' | 'NEUTRAL' | 'ENEMY' | 'SELF' {
  if (planet === signLord) return 'SELF';
  const rels = NAISARGIKA_RELATIONSHIPS[planet];
  if (!rels) return 'NEUTRAL';
  if (rels.friends.includes(signLord)) return 'FRIEND';
  if (rels.enemies.includes(signLord)) return 'ENEMY';
  return 'NEUTRAL';
}

export interface DignityFact {
  chartContext: string; // e.g. "D1", "D9", "D10"
  planet: PlanetName;
  occupiedSign: ZodiacSign;
  degreeInSign: number;
  signLord: PlanetName;
  naturalRelationshipToLord: 'FRIEND' | 'NEUTRAL' | 'ENEMY' | 'SELF';
  dignity: DignityType;
  deepestPointDistance?: number;
  retrogradeModifier?: 'VAKRI_NEECHA_UCHCHA_PHALA' | 'VAKRI_UCHCHA_NEECHA_PHALA' | 'NONE';
  retrogradeNote?: string;
  description: string;
}

/**
 * Calculate canonical dignity for any planet in any chart or varga.
 * Retains strict independence between charts.
 * Adheres to classical Phaladeepika Ch. 9 Sloka 20:
 * - A retrograde debilitated planet (Vakri Neecha) yields results akin to exaltation.
 * - A retrograde exalted planet (Vakri Uchcha) loses its pure ease.
 */
export function calculateDignity(
  planet: PlanetName,
  occupiedSign: ZodiacSign,
  degreeInSign: number = 0,
  chartContext: string = 'D1',
  isRetrograde: boolean = false
): DignityFact {
  const signLord = SIGN_LORDS[occupiedSign];

  // 1. Debilitation check
  const deb = DEBILITATION_MAP[planet];
  if (deb && deb.sign === occupiedSign) {
    const isVakriNeecha = isRetrograde;
    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: relationshipToSignLord(planet, signLord),
      dignity: 'DEBILITATED',
      deepestPointDistance: Math.abs(degreeInSign - deb.deepDegree),
      retrogradeModifier: isVakriNeecha ? 'VAKRI_NEECHA_UCHCHA_PHALA' : 'NONE',
      retrogradeNote: isVakriNeecha
        ? 'Classical Law (Phaladeepika Ch. 9 Sl. 20): Retrograde Debilitated planet acts like an Exalted planet (Vakri Neecha Uchcha-Tulya Phala).'
        : undefined,
      description: `${chartContext} ${planet} in ${occupiedSign} is DEBILITATED (Neecha). Deep debilitation point: ${deb.deepDegree}°.${
        isVakriNeecha ? ' However, being RETROGRADE, classical Phaladeepika Ch. 9 Sl. 20 states it produces effects akin to EXALTATION.' : ''
      }`,
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

    const isVakriUchcha = isRetrograde;
    return {
      chartContext,
      planet,
      occupiedSign,
      degreeInSign,
      signLord,
      naturalRelationshipToLord: relationshipToSignLord(planet, signLord),
      dignity: 'EXALTED',
      deepestPointDistance: Math.abs(degreeInSign - ex.deepDegree),
      retrogradeModifier: isVakriUchcha ? 'VAKRI_UCHCHA_NEECHA_PHALA' : 'NONE',
      retrogradeNote: isVakriUchcha
        ? 'Classical Law: Retrograde Exalted planet loses its smooth ease and requires intense conscious effort to manifest.'
        : undefined,
      description: `${chartContext} ${planet} in ${occupiedSign} is EXALTED (Uchcha). Deep exaltation point: ${ex.deepDegree}°.${
        isVakriUchcha ? ' Being RETROGRADE, its exaltation energy is introverted and requires intense conscious navigation.' : ''
      }`,
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
    const fact = calculateDignity(p.name, p.sign, p.degreeInSign, 'D1', p.retrograde);
    const scoreMap: Record<DignityType, number> = {
      EXALTED: 60,
      MOOLATRIKONA: 45,
      OWN_SIGN: 30,
      FRIEND: 22.5,
      NEUTRAL: 15,
      ENEMY: 7.5,
      DEBILITATED: 0,
    };
    let score = scoreMap[fact.dignity] ?? 15;
    if (fact.retrogradeModifier === 'VAKRI_NEECHA_UCHCHA_PHALA') {
      score = 50; // Elevated score reflecting Vakri Neecha Uchcha-Tulya Phala
    }
    return {
      ...p,
      dignity: fact.dignity,
      dignityScore: score,
      retrogradeDignityNote: fact.retrogradeNote,
      naturalRelationshipToLord: fact.naturalRelationshipToLord === 'SELF' ? 'FRIEND' : fact.naturalRelationshipToLord,
    };
  });
}
