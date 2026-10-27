/**
 * ASTROWORLD — D60 Shashtiamsha Karmic Decoder Engine
 * The Supreme Determinant of Sanchita Karma & Soul Architecture (Parashara BPHS Ch. 6)
 * 
 * Decodes the 60 divine/karmic devatas governing the native's D60 placements.
 * Explains the esoteric root cause of why two nearly identical birth charts experience
 * radically different destinies, internal battles, and breakthroughs.
 */

import { D60_DEVATA_NAMES } from '../../../../shared/engine/vargas.ts';
import { PlanetName, ZodiacSign } from '../../../../shared/engine/types.ts';

export type D60KarmicCategory = 'DEVA_AMRITA' | 'YAKSHA_KUBERA' | 'GHORA_RAKSHASA';

export interface D60PlanetProfile {
  planet: PlanetName | 'Lagna';
  sign: ZodiacSign;
  degreeInSign: number;
  amshaIndex: number; // 0 to 59
  devataName: string;
  category: D60KarmicCategory;
  karmicEssence: string;
  soulDirective: string;
}

export interface D60KarmicAnalysis {
  lagnaD60?: D60PlanetProfile;
  atmakarakaD60?: D60PlanetProfile;
  tenthLordD60?: D60PlanetProfile;
  fifthLordD60?: D60PlanetProfile;
  dashaLordD60?: D60PlanetProfile;
  sanchitaKarmaSynthesis: string;
}

// Sattvic Devatas: Grace, Purva Punya, natural mastery, spiritual protection
const DEVA_AMRITA_SET = new Set([
  'Deva', 'Amrita', 'Indu', 'Mridu', 'Komala', 'Heramba', 'Brahma', 'Vishnu',
  'Maheshwara', 'Sudha', 'Poornachandra', 'Saumya', 'Sheetala', 'Candramukhi',
  'Nirmala', 'Shubha', 'Atishubha', 'Sudhasoona', 'Payodhara', 'Indurekha', 'Praveena'
]);

// Rajasic Devatas: Enterprise, wealth, social magnetism, statecraft, technical skill
const YAKSHA_KUBERA_SET = new Set([
  'Kubera', 'Yaksha', 'Kinnara', 'Maya', 'Apampathi', 'Marutwan', 'Kamalakara',
  'Dandadhara', 'Bhramana', 'Kshiteesa', 'Purishaka'
]);

// Tamasic / Ghora Devatas: The Crucible, debt purification, heavy trials, deep resilience
const GHORA_RAKSHASA_SET = new Set([
  'Ghora', 'Rakshasa', 'Bhrashta', 'Kulaghna', 'Garala', 'Vahni', 'Kala', 'Sarpa',
  'Ardra', 'Kalasamjnya', 'Gulika', 'Mrityu', 'Davagni', 'Adhama', 'Kantaka',
  'Vishadagdha', 'Kulanasha', 'Vamshakshaya', 'Utpata', 'Karaladamshtra', 'Kalapavaka',
  'Ashubha'
]);

/**
 * Classify a D60 devata name into its karmic archetype.
 */
export function classifyD60Devata(devataName: string): {
  category: D60KarmicCategory;
  karmicEssence: string;
  soulDirective: string;
} {
  if (DEVA_AMRITA_SET.has(devataName)) {
    return {
      category: 'DEVA_AMRITA',
      karmicEssence: 'Sattvic Punya (Auspicious Karmic Capital)',
      soulDirective:
        'Carries innate spiritual grace and intuitive brilliance. In this domain, you experience sudden strokes of divine providence, natural mentorship, and rapid intellectual crystallization.',
    };
  }

  if (YAKSHA_KUBERA_SET.has(devataName)) {
    return {
      category: 'YAKSHA_KUBERA',
      karmicEssence: 'Rajasic Enterprise & Worldly Manifestation',
      soulDirective:
        'Governed by creative ambition, resource multiplication, and social diplomacy. This domain demands worldly enterprise, strategic negotiation, and structured execution to achieve high material status.',
    };
  }

  // Fallback to Ghora / Rakshasa
  return {
    category: 'GHORA_RAKSHASA',
    karmicEssence: 'The Karmic Crucible (Rigorous Purification Through Fire)',
    soulDirective:
      'Governs deep Sanchita trials and unyielding character tests. Not a curse, but a sacred forge: you are meant to burn through illusions and achieve unassailable strength through discipline, ethical integrity, and endurance.',
  };
}

/**
 * Computes D60 profile for a specific planetary longitude in a sign.
 */
export function computeD60PlanetProfile(params: {
  planet: PlanetName | 'Lagna';
  sign: ZodiacSign;
  degreeInSign: number; // 0 to 30
}): D60PlanetProfile {
  const { planet, sign, degreeInSign } = params;
  const clampedDeg = Math.max(0, Math.min(29.9999, degreeInSign));
  // Each D60 amsha is 0.5 degrees (30 minutes)
  const amshaIndex = Math.min(59, Math.floor(clampedDeg / 0.5));
  const devataName = D60_DEVATA_NAMES[amshaIndex] || 'Deva';
  const classification = classifyD60Devata(devataName);

  return {
    planet,
    sign,
    degreeInSign,
    amshaIndex,
    devataName,
    category: classification.category,
    karmicEssence: classification.karmicEssence,
    soulDirective: classification.soulDirective,
  };
}

/**
 * Synthesizes key D60 chart placements to reveal the core karmic engine of the native.
 */
export function synthesizeD60Chart(params: {
  lagnaDegree: number;
  lagnaSign: ZodiacSign;
  atmakarakaPlanet: PlanetName;
  atmakarakaDegree: number;
  atmakarakaSign: ZodiacSign;
  tenthLordPlanet?: PlanetName;
  tenthLordDegree?: number;
  tenthLordSign?: ZodiacSign;
  fifthLordPlanet?: PlanetName;
  fifthLordDegree?: number;
  fifthLordSign?: ZodiacSign;
  currentDashaLordPlanet?: PlanetName;
  currentDashaLordDegree?: number;
  currentDashaLordSign?: ZodiacSign;
}): D60KarmicAnalysis {
  const lagnaD60 = computeD60PlanetProfile({
    planet: 'Lagna',
    sign: params.lagnaSign,
    degreeInSign: params.lagnaDegree,
  });

  const atmakarakaD60 = computeD60PlanetProfile({
    planet: params.atmakarakaPlanet,
    sign: params.atmakarakaSign,
    degreeInSign: params.atmakarakaDegree,
  });

  const tenthLordD60 =
    params.tenthLordPlanet && params.tenthLordDegree !== undefined && params.tenthLordSign
      ? computeD60PlanetProfile({
          planet: params.tenthLordPlanet,
          sign: params.tenthLordSign,
          degreeInSign: params.tenthLordDegree,
        })
      : undefined;

  const fifthLordD60 =
    params.fifthLordPlanet && params.fifthLordDegree !== undefined && params.fifthLordSign
      ? computeD60PlanetProfile({
          planet: params.fifthLordPlanet,
          sign: params.fifthLordSign,
          degreeInSign: params.fifthLordDegree,
        })
      : undefined;

  const dashaLordD60 =
    params.currentDashaLordPlanet &&
    params.currentDashaLordDegree !== undefined &&
    params.currentDashaLordSign
      ? computeD60PlanetProfile({
          planet: params.currentDashaLordPlanet,
          sign: params.currentDashaLordSign,
          degreeInSign: params.currentDashaLordDegree,
        })
      : undefined;

  // Build high-level synthesis
  const parts: string[] = [];
  parts.push(
    `Lagna D60 Devata is ${lagnaD60.devataName} (${lagnaD60.category}): ${lagnaD60.karmicEssence}. Indicates your overall incarnational posture.`
  );
  parts.push(
    `Atmakaraka ${params.atmakarakaPlanet} occupies D60 Devata ${atmakarakaD60.devataName} (${atmakarakaD60.category}): ${atmakarakaD60.soulDirective}`
  );

  if (tenthLordD60) {
    parts.push(
      `10th Lord ${params.tenthLordPlanet} in D60 Devata ${tenthLordD60.devataName} (${tenthLordD60.category}): Career accomplishments require aligning with ${tenthLordD60.karmicEssence}.`
    );
  }

  if (dashaLordD60) {
    parts.push(
      `Current Dasha Lord ${params.currentDashaLordPlanet} sits in D60 Devata ${dashaLordD60.devataName} (${dashaLordD60.category}): The current chapter is governed by ${dashaLordD60.soulDirective}`
    );
  }

  return {
    lagnaD60,
    atmakarakaD60,
    tenthLordD60,
    fifthLordD60,
    dashaLordD60,
    sanchitaKarmaSynthesis: parts.join(' '),
  };
}
