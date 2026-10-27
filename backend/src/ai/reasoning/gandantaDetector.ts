/**
 * ASTROWORLD — Shastric Gandanta Transition Engine
 * Evaluates the subtle, intense "Jala-Agni" (Water-Fire) junction knots in Vedic astrology:
 * - Revati (Meena / Pisces) to Ashwini (Mesha / Aries)
 * - Ashlesha (Karka / Cancer) to Magha (Simha / Leo)
 * - Jyeshtha (Vrischika / Scorpio) to Mula (Dhanu / Sagittarius) — Abhukta Mula
 * 
 * Classically detailed in:
 * - Brihat Parashara Hora Shastra (Gandanta Phala & Shanti Adhyaya)
 * - Atharva Veda Parishishta (Faravichar & Mula Dosha)
 * - Jataka Parijata & Phaladeepika
 */

import { PlanetName, ZodiacSign } from '../../../../shared/engine/types.ts';

export type GandantaJunctionType =
  | 'REVATI_ASHWINI' // Pisces to Aries (Meena-Mesha)
  | 'ASHLESHA_MAGHA' // Cancer to Leo (Karka-Simha)
  | 'JYESTHTHA_MULA'; // Scorpio to Sagittarius (Vrischika-Dhanu / Abhukta Mula)

export type GandantaSeverity = 'CRITICAL_KNOT_48_MIN' | 'PADA_GANDANTA_3DEG20' | 'NONE';

export interface GandantaEntityAnalysis {
  name: string; // e.g. "Lagna", "Moon", "Sun", "Mars", etc.
  sign: ZodiacSign;
  degreeInSign: number;
  junction: GandantaJunctionType;
  severity: GandantaSeverity;
  distanceToJunctionDegrees: number; // Arc distance to 0° of the fire sign
  side: 'WATER_EXIT' | 'FIRE_ENTRY';
  shastricSignificance: string;
  isAbhuktaMula: boolean;
}

export interface GandantaDiagnosticReport {
  hasCriticalGandanta: boolean;
  hasAnyGandanta: boolean;
  lagnaGandanta?: GandantaEntityAnalysis;
  moonGandanta?: GandantaEntityAnalysis;
  otherPlanetGandantas: GandantaEntityAnalysis[];
  abhuktaMulaActive: boolean;
  summaryVerdict: string;
  remedialGandantaProtocol?: string;
}

interface EntityInput {
  name: string;
  sign: ZodiacSign;
  degreeInSign: number;
}

/**
 * Check if a single entity (Lagna or Planet) is in Gandanta.
 */
export function checkEntityGandanta(entity: EntityInput): GandantaEntityAnalysis | null {
  const { name, sign, degreeInSign } = entity;

  let junction: GandantaJunctionType | null = null;
  let side: 'WATER_EXIT' | 'FIRE_ENTRY' | null = null;
  let distance = 999;

  // 1. Pisces - Aries (Meena - Mesha)
  if (sign === 'Pisces' && degreeInSign >= 26.6666) {
    junction = 'REVATI_ASHWINI';
    side = 'WATER_EXIT';
    distance = 30.0 - degreeInSign;
  } else if (sign === 'Aries' && degreeInSign <= 3.3333) {
    junction = 'REVATI_ASHWINI';
    side = 'FIRE_ENTRY';
    distance = degreeInSign;
  }

  // 2. Cancer - Leo (Karka - Simha)
  else if (sign === 'Cancer' && degreeInSign >= 26.6666) {
    junction = 'ASHLESHA_MAGHA';
    side = 'WATER_EXIT';
    distance = 30.0 - degreeInSign;
  } else if (sign === 'Leo' && degreeInSign <= 3.3333) {
    junction = 'ASHLESHA_MAGHA';
    side = 'FIRE_ENTRY';
    distance = degreeInSign;
  }

  // 3. Scorpio - Sagittarius (Vrischika - Dhanu / Abhukta Mula)
  else if (sign === 'Scorpio' && degreeInSign >= 26.6666) {
    junction = 'JYESTHTHA_MULA';
    side = 'WATER_EXIT';
    distance = 30.0 - degreeInSign;
  } else if (sign === 'Sagittarius' && degreeInSign <= 3.3333) {
    junction = 'JYESTHTHA_MULA';
    side = 'FIRE_ENTRY';
    distance = degreeInSign;
  }

  if (!junction || !side) return null;

  // 48 arcminutes = 0.8 degrees (Exact classical 2-Ghatika boundary)
  const severity: GandantaSeverity = distance <= 0.8 ? 'CRITICAL_KNOT_48_MIN' : 'PADA_GANDANTA_3DEG20';
  const isAbhuktaMula = junction === 'JYESTHTHA_MULA';

  let shastricSignificance = '';
  if (name === 'Lagna') {
    shastricSignificance =
      severity === 'CRITICAL_KNOT_48_MIN'
        ? `Lagna is in the deep Gandanta knot (${distance.toFixed(2)}° from the 0° Water-Fire divide). Classical Shastras state this gives exceptional resilience born of early childhood trials, a profound spiritual awakening, and an unshakeable sense of cosmic purpose.`
        : `Lagna is in the Gandanta Pada zone. Native experiences major cyclic transformations in physical identity and life direction at pivotal junctures.`;
  } else if (name === 'Moon') {
    shastricSignificance =
      severity === 'CRITICAL_KNOT_48_MIN'
        ? `Janma Chandra is in the deep Gandanta core (Chandra Gandanta, ${distance.toFixed(2)}° from junction). This produces intense psychic and emotional depth, an intuitive ability to perceive hidden undercurrents, and early-life emotional detachment from conventional family norms.`
        : `Moon occupies the Gandanta arc. Endows acute sensitivities and philosophical maturity far beyond chronological age.`;
  } else {
    shastricSignificance = `${name} is in Gandanta (${distance.toFixed(2)}° from ${junction}). Significator undergoes intense catalytic evolution in native's life.`;
  }

  return {
    name,
    sign,
    degreeInSign,
    junction,
    severity,
    distanceToJunctionDegrees: Math.round(distance * 100) / 100,
    side,
    shastricSignificance,
    isAbhuktaMula,
  };
}

/**
 * Comprehensive chart-wide Gandanta Evaluation.
 */
export function evaluateChartGandanta(params: {
  lagnaSign: ZodiacSign;
  lagnaDegree: number;
  planets: Array<{ name: PlanetName; sign: ZodiacSign; degreeInSign: number }>;
}): GandantaDiagnosticReport {
  const lagnaAnalysis = checkEntityGandanta({
    name: 'Lagna',
    sign: params.lagnaSign,
    degreeInSign: params.lagnaDegree,
  });

  const moonPl = params.planets.find((p) => p.name === 'Moon');
  const moonAnalysis = moonPl
    ? checkEntityGandanta({
        name: 'Moon',
        sign: moonPl.sign,
        degreeInSign: moonPl.degreeInSign,
      })
    : null;

  const otherPlanetGandantas: GandantaEntityAnalysis[] = [];
  for (const pl of params.planets) {
    if (pl.name === 'Moon') continue;
    const res = checkEntityGandanta({
      name: pl.name,
      sign: pl.sign,
      degreeInSign: pl.degreeInSign,
    });
    if (res) otherPlanetGandantas.push(res);
  }

  const allActive = [
    ...(lagnaAnalysis ? [lagnaAnalysis] : []),
    ...(moonAnalysis ? [moonAnalysis] : []),
    ...otherPlanetGandantas,
  ];

  const hasCriticalGandanta = allActive.some((a) => a.severity === 'CRITICAL_KNOT_48_MIN');
  const hasAnyGandanta = allActive.length > 0;
  const abhuktaMulaActive = allActive.some((a) => a.isAbhuktaMula);

  let summaryVerdict = 'No significant Gandanta (Jala-Agni knot) afflictions detected in this chart.';
  if (hasCriticalGandanta) {
    const criticalNames = allActive.filter((a) => a.severity === 'CRITICAL_KNOT_48_MIN').map((a) => a.name);
    summaryVerdict = `CRITICAL GANDANTA ACTIVE: ${criticalNames.join(', ')} positioned in the deep 48-arcminute karmic knot. Indicates profound soul-level restructuring and immense spiritual potential.`;
  } else if (hasAnyGandanta) {
    const names = allActive.map((a) => a.name);
    summaryVerdict = `PADA GANDANTA DETECTED: ${names.join(', ')} located in the 3°20' transition boundary. Denotes catalytic transformation and karmic initiation.`;
  }

  let remedialGandantaProtocol: string | undefined;
  if (hasAnyGandanta) {
    remedialGandantaProtocol =
      'Classical BPHS Gandanta Shanti: Shiva Panchakshari Japa ("Om Namah Shivaya") or Mahamrityunjaya Mantra, offering water to a Peepal tree on Saturdays, and feeding cows on Thursdays to harmonize the turbulent Water-Fire boundary.';
  }

  return {
    hasCriticalGandanta,
    hasAnyGandanta,
    lagnaGandanta: lagnaAnalysis || undefined,
    moonGandanta: moonAnalysis || undefined,
    otherPlanetGandantas,
    abhuktaMulaActive,
    summaryVerdict,
    remedialGandantaProtocol,
  };
}
