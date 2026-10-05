/**
 * ASTROWORLD — Complete Shodashavarga (16 Divisional Charts) Engine
 * Classical Parashari algorithms adhering strictly to Brihat Parashara Hora Shastra (BPHS).
 */

import { SIGN_MODALITIES, ZODIAC_SIGNS } from './constants.ts';
import { calculateDignity } from './dignity.ts';
import {
  PlanetName,
  PlanetPosition,
  VargaChart,
  VargaCode,
  VargaPlanetPlacement,
  ZodiacSign,
} from './types.ts';

// 60 classical Shashtiamsha Devata Names according to BPHS (Santhanam tradition)
/** Explicit D60 convention used by AstroWorld.
 * This is a sign-based Parashari/PVR-style occupied-sign mapping: each 0°30'
 * amsha advances one sign from the source Rashi. D60 traditions differ, so
 * callers must not present this convention as universally canonical.
 */
export const D60_CONVENTION = {
  name: 'Parashari PVR occupied-sign method',
  intervalDegrees: 0.5,
  mapping: 'source-sign-plus-amsha-index',
  boundaryRule: '[start, end)',
} as const;

export const D60_DEVATA_NAMES: string[] = [
  'Ghora', 'Rakshasa', 'Deva', 'Kubera', 'Yaksha', 'Kinnara', 'Bhrashta', 'Kulaghna',
  'Garala', 'Vahni', 'Maya', 'Purishaka', 'Apampathi', 'Marutwan', 'Kala', 'Sarpa',
  'Amrita', 'Indu', 'Mridu', 'Komala', 'Heramba', 'Brahma', 'Vishnu', 'Maheshwara',
  'Deva', 'Ardra', 'Kalasamjnya', 'Kshiteesa', 'Kamalakara', 'Gulika', 'Mrityu', 'Kala',
  'Davagni', 'Ghora', 'Adhama', 'Kantaka', 'Sudha', 'Amrita', 'Poornachandra', 'Vishadagdha',
  'Kulanasha', 'Vamshakshaya', 'Utpata', 'Kala', 'Saumya', 'Komala', 'Sheetala', 'Karaladamshtra',
  'Candramukhi', 'Praveena', 'Kalapavaka', 'Dandadhara', 'Nirmala', 'Shubha', 'Ashubha', 'Atishubha',
  'Sudhasoona', 'Payodhara', 'Bhramana', 'Indurekha'
];

export interface VargaMetadata {
  code: VargaCode;
  name: string;
  sanskritName: string;
  divisionNumber: number;
  purpose: string;
}

export const VARGA_METADATA_LIST: VargaMetadata[] = [
  { code: 'D1', name: 'Rashi', sanskritName: 'राशि (D1)', divisionNumber: 1, purpose: 'Physical body, general destiny, overall life path' },
  { code: 'D2', name: 'Hora', sanskritName: 'होरा (D2)', divisionNumber: 2, purpose: 'Wealth, financial assets, treasury, speech, prosperity' },
  { code: 'D3', name: 'Drekkana', sanskritName: 'द्रेष्काण (D3)', divisionNumber: 3, purpose: 'Siblings, courage, vitality, third house matters' },
  { code: 'D4', name: 'Chaturthamsha', sanskritName: 'चतुर्थांश (D4)', divisionNumber: 4, purpose: 'Fixed assets, fortune, real estate, vehicles, happiness' },
  { code: 'D7', name: 'Saptamsha', sanskritName: 'सप्तांश (D7)', divisionNumber: 7, purpose: 'Children, progeny, lineage, creative output' },
  { code: 'D9', name: 'Navamsha', sanskritName: 'नवांश (D9)', divisionNumber: 9, purpose: 'Spouse, marriage, dharma, inner spiritual potential' },
  { code: 'D10', name: 'Dashamsha', sanskritName: 'दशांश (D10)', divisionNumber: 10, purpose: 'Career, profession, social status, fame, achievements' },
  { code: 'D12', name: 'Dwadashamsha', sanskritName: 'द्वादशांश (D12)', divisionNumber: 12, purpose: 'Parents, ancestors, ancestral heritage and karma' },
  { code: 'D16', name: 'Shodashamsha', sanskritName: 'षोडशांश (D16)', divisionNumber: 16, purpose: 'Vehicles, conveyances, comforts, pleasures and mental happiness' },
  { code: 'D20', name: 'Vimshamsha', sanskritName: 'विंशांश (D20)', divisionNumber: 20, purpose: 'Spiritual inclination, upasana, religious pursuits' },
  { code: 'D24', name: 'Chaturvimshamsha', sanskritName: 'चतुर्विंशांश (D24)', divisionNumber: 24, purpose: 'Education, academic learning, higher knowledge and intellect' },
  { code: 'D27', name: 'Saptavimshamsha', sanskritName: 'सप्तविंशांश / भांश (D27)', divisionNumber: 27, purpose: 'Physical strength, stamina, weaknesses, vulnerability' },
  { code: 'D30', name: 'Trimshamsha', sanskritName: 'त्रिंशांश (D30)', divisionNumber: 30, purpose: 'Misfortunes, evils, diseases, arishta, moral character' },
  { code: 'D40', name: 'Khavedamsha', sanskritName: 'खवेदांश (D40)', divisionNumber: 40, purpose: 'Auspicious and inauspicious general results, maternal side' },
  { code: 'D45', name: 'Akshavedamsha', sanskritName: 'अक्षवेदांश (D45)', divisionNumber: 45, purpose: 'All areas of character, moral integrity and purity' },
  { code: 'D60', name: 'Shashtiamsha', sanskritName: 'षष्ट्यंश (D60)', divisionNumber: 60, purpose: 'All matters, past life karma, ultimate root cause of events' },
];

/**
 * Equal-width Varga boundary helper.
 *
 * Treats boundaries as half-open [start, end) while compensating
 * for tiny floating-point representation errors at exact boundaries.
 */
function calculateEqualVargaPart(
  degreeInSign: number,
  span: number,
  divisions: number,
): { part: number; degreeInVargaSign: number } {
  const quotient = degreeInSign / span;
  const nearestInteger = Math.round(quotient);
  const boundaryTolerance = 1e-10;

  const isExactBoundary =
    Math.abs(quotient - nearestInteger) < boundaryTolerance;

  const part = Math.min(
    divisions - 1,
    isExactBoundary ? nearestInteger : Math.floor(quotient),
  );

  const degreeInVargaSign = isExactBoundary
    ? 0
    : (degreeInSign - part * span) * divisions;

  return { part, degreeInVargaSign };
}

/**
 * Compute the resulting Zodiac sign index (0-11) for any varga from sidereal longitude.
 */
export function calculateVargaSignIndex(vargaCode: VargaCode, siderealLongitude: number): {
  signIndex: number;
  degreeInVargaSign: number;
  specialAmsha?: string;
} {
  const normLon = ((siderealLongitude % 360) + 360) % 360;
  const sourceSignIndex = Math.floor(normLon / 30);
  const degInSign = normLon % 30;
  const isOddSign = sourceSignIndex % 2 === 0; // 0=Aries (odd), 1=Taurus (even), etc.
  const modality = SIGN_MODALITIES[ZODIAC_SIGNS[sourceSignIndex]]; // Movable, Fixed, Dual

  switch (vargaCode) {
    case 'D1': {
      return { signIndex: sourceSignIndex, degreeInVargaSign: degInSign };
    }

    case 'D2': {
      // Hora (15°):
      // Odd signs: 0-15° Leo (Sun, 4), 15-30° Cancer (Moon, 3)
      // Even signs: 0-15° Cancer (Moon, 3), 15-30° Leo (Sun, 4)
      const isFirstHalf = degInSign < 15.0;
      let targetSignIndex: number;
      if (isOddSign) {
        targetSignIndex = isFirstHalf ? 4 : 3;
      } else {
        targetSignIndex = isFirstHalf ? 3 : 4;
      }
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % 15) * 2 };
    }

    case 'D3': {
      // Drekkana (10°):
      // 1st 10°: Same sign (source)
      // 2nd 10°: 5th from source
      // 3rd 10°: 9th from source
      const part = Math.min(2, Math.floor(degInSign / 10.0));
      const targetSignIndex = (sourceSignIndex + part * 4) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % 10) * 3 };
    }

    case 'D4': {
      // Chaturthamsha (7°30' = 7.5°):
      // 1st part: Same sign
      // 2nd part: 4th from source
      // 3rd part: 7th from source
      // 4th part: 10th from source
      const part = Math.min(3, Math.floor(degInSign / 7.5));
      const targetSignIndex = (sourceSignIndex + part * 3) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % 7.5) * 4 };
    }

    case 'D7': {
      // Saptamsha (4°17'08.57" = 30° / 7):
      // Odd signs: Start from source sign
      // Even signs: Start from 7th from source sign
      const span = 30.0 / 7.0;
      const { part, degreeInVargaSign } = calculateEqualVargaPart(
        degInSign,
        span,
        7,
      );
      const startSign = isOddSign
        ? sourceSignIndex
        : (sourceSignIndex + 6) % 12;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign };
    }

    case 'D9': {
      // Navamsha (3°20' = 3.333333°):
      // Fire signs (Aries 0, Leo 4, Sag 8): Start Aries (0)
      // Earth signs (Taurus 1, Virgo 5, Cap 9): Start Capricorn (9)
      // Air signs (Gemini 2, Libra 6, Aqu 10): Start Libra (6)
      // Water signs (Cancer 3, Scorpio 7, Pis 11): Start Cancer (3)
      const span = 30.0 / 9.0;
      const { part, degreeInVargaSign } = calculateEqualVargaPart(
        degInSign,
        span,
        9,
      );
      const elementStarts = [0, 9, 6, 3];
      const startSign = elementStarts[sourceSignIndex % 4];
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign };
    }

    case 'D10': {
      // Dashamsha (3° = 30° / 10):
      // Odd signs: Start from source sign
      // Even signs: Start from 9th from source sign
      const span = 3.0;
      const part = Math.min(9, Math.floor(degInSign / span));
      const startSign = isOddSign ? sourceSignIndex : (sourceSignIndex + 8) % 12;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 10 };
    }

    case 'D12': {
      // Dwadashamsha (2°30' = 2.5°):
      // Starts from source sign and advances 1 sign per 2.5°
      const span = 2.5;
      const part = Math.min(11, Math.floor(degInSign / span));
      const targetSignIndex = (sourceSignIndex + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 12 };
    }

    case 'D16': {
      // Shodashamsha (1°52'30" = 1.875°):
      // Movable signs: Start Aries (0)
      // Fixed signs: Start Leo (4)
      // Dual signs: Start Sagittarius (8)
      const span = 30.0 / 16.0;
      const part = Math.min(15, Math.floor(degInSign / span));
      let startSign = 0;
      if (modality === 'Fixed') startSign = 4;
      else if (modality === 'Dual') startSign = 8;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 16 };
    }

    case 'D20': {
      // Vimshamsha (1°30' = 1.5°):
      // Movable signs: Start Aries (0)
      // Fixed signs: Start Sagittarius (8)
      // Dual signs: Start Leo (4)
      const span = 1.5;
      const part = Math.min(19, Math.floor(degInSign / span));
      let startSign = 0;
      if (modality === 'Fixed') startSign = 8;
      else if (modality === 'Dual') startSign = 4;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 20 };
    }

    case 'D24': {
      // Chaturvimshamsha / Siddhamsa (1°15' = 1.25°):
      // Odd signs: Start Leo (4)
      // Even signs: Start Cancer (3)
      const span = 1.25;
      const part = Math.min(23, Math.floor(degInSign / span));
      const startSign = isOddSign ? 4 : 3;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 24 };
    }

    case 'D27': {
      // Saptavimshamsha / Bhamsha (1°06'40" = 30 / 27°):
      // Fire: Start Aries (0)
      // Earth: Start Cancer (3)
      // Air: Start Libra (6)
      // Water: Start Capricorn (9)
      const span = 30.0 / 27.0;
      const { part, degreeInVargaSign } = calculateEqualVargaPart(
        degInSign,
        span,
        27,
      );
      const elementStarts = [0, 3, 6, 9];
      const startSign = elementStarts[sourceSignIndex % 4];
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign };
    }

    case 'D30': {
      // Trimshamsha (Unequal bands according to BPHS):
      // Odd signs:
      // 0-5°: Mars (Aries, 0)
      // 5-10°: Saturn (Aquarius, 10)
      // 10-18°: Jupiter (Sagittarius, 8)
      // 18-25°: Mercury (Gemini, 2)
      // 25-30°: Venus (Libra, 6)
      // Even signs:
      // 0-5°: Venus (Taurus, 1)
      // 5-12°: Mercury (Virgo, 5)
      // 12-20°: Jupiter (Pisces, 11)
      // 20-25°: Saturn (Capricorn, 9)
      // 25-30°: Mars (Scorpio, 7)
      let targetSignIndex = 0;
      let bandStart = 0;
      let bandEnd = 30;
      if (isOddSign) {
        if (degInSign < 5.0) { targetSignIndex = 0; bandStart = 0; bandEnd = 5; } // Aries
        else if (degInSign < 10.0) { targetSignIndex = 10; bandStart = 5; bandEnd = 10; } // Aquarius
        else if (degInSign < 18.0) { targetSignIndex = 8; bandStart = 10; bandEnd = 18; } // Sagittarius
        else if (degInSign < 25.0) { targetSignIndex = 2; bandStart = 18; bandEnd = 25; } // Gemini
        else { targetSignIndex = 6; bandStart = 25; bandEnd = 30; } // Libra
      } else {
        if (degInSign < 5.0) { targetSignIndex = 1; bandStart = 0; bandEnd = 5; } // Taurus
        else if (degInSign < 12.0) { targetSignIndex = 5; bandStart = 5; bandEnd = 12; } // Virgo
        else if (degInSign < 20.0) { targetSignIndex = 11; bandStart = 12; bandEnd = 20; } // Pisces
        else if (degInSign < 25.0) { targetSignIndex = 9; bandStart = 20; bandEnd = 25; } // Capricorn
        else { targetSignIndex = 7; bandStart = 25; bandEnd = 30; } // Scorpio
      }
      const degreeInVargaSign = ((degInSign - bandStart) / (bandEnd - bandStart)) * 30;
      return { signIndex: targetSignIndex, degreeInVargaSign };
    }

    case 'D40': {
      // Khavedamsha (0°45' = 0.75°):
      // Odd signs: Start Aries (0)
      // Even signs: Start Libra (6)
      const span = 0.75;
      const part = Math.min(39, Math.floor(degInSign / span));
      const startSign = isOddSign ? 0 : 6;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 40 };
    }

    case 'D45': {
      // Akshavedamsha (0°40' = 2/3°):
      // Movable signs: Start Aries (0)
      // Fixed signs: Start Leo (4)
      // Dual signs: Start Sagittarius (8)
      const span = 30.0 / 45.0;
      const part = Math.min(44, Math.floor(degInSign / span));
      let startSign = 0;
      if (modality === 'Fixed') startSign = 4;
      else if (modality === 'Dual') startSign = 8;
      const targetSignIndex = (startSign + part) % 12;
      return { signIndex: targetSignIndex, degreeInVargaSign: (degInSign % span) * 45 };
    }

    case 'D60': {
      // Shashtiamsha (0°30' = 0.5°):
      // Standard Parashari PVR occupied-sign method:
      // Start from source sign, advances 1 sign per 0.5°
      const span = 0.5;
      const part = Math.min(59, Math.floor(degInSign / span));
      const targetSignIndex = (sourceSignIndex + part) % 12;
      // BPHS reverses the named Shashtiamsha sequence for even signs.
      // The occupied-sign calculation remains the source-sign-plus-amsha
      // mapping; the reversal applies to the named amsha sequence.
      const devataIndex = isOddSign ? part : (59 - part);
      const devataName = D60_DEVATA_NAMES[devataIndex];
      return {
        signIndex: targetSignIndex,
        degreeInVargaSign: (degInSign % span) * 60,
        specialAmsha: devataName,
      };
    }
  }
}

/**
 * Generate complete VargaChart for any divisional chart code.
 */
export function generateVargaChart(
  vargaCode: VargaCode,
  ascendantSiderealLon: number,
  planets: PlanetPosition[]
): VargaChart {
  const meta = VARGA_METADATA_LIST.find((m) => m.code === vargaCode)!;
  const ascRes = calculateVargaSignIndex(vargaCode, ascendantSiderealLon);
  const ascendantSign = ZODIAC_SIGNS[ascRes.signIndex];

  const specialAmshaNames: Record<string, string> = {};
  if (ascRes.specialAmsha) {
    specialAmshaNames['Ascendant'] = ascRes.specialAmsha;
  }

  const planetPlacements: VargaPlanetPlacement[] = planets.map((p) => {
    const vRes = calculateVargaSignIndex(vargaCode, p.siderealLongitude);
    const vargaSign = ZODIAC_SIGNS[vRes.signIndex];
    if (vRes.specialAmsha) {
      specialAmshaNames[p.name] = vRes.specialAmsha;
    }

    // Whole sign house relative to Varga Ascendant
    const houseNumber = ((vRes.signIndex - ascRes.signIndex + 12) % 12) + 1;

    // Canonical independent dignity in this Varga
    const digFact = calculateDignity(p.name, vargaSign, vRes.degreeInVargaSign, vargaCode);

    return {
      planet: p.name,
      sourceSign: p.sign,
      vargaSign,
      vargaSignIndex: vRes.signIndex,
      degreeInVargaSign: vRes.degreeInVargaSign,
      houseNumber,
      dignity: digFact.dignity,
    };
  });

  return {
    code: vargaCode,
    name: meta.name,
    sanskritName: meta.sanskritName,
    divisionNumber: meta.divisionNumber,
    purpose: meta.purpose,
    ascendantSign,
    ascendantSignIndex: ascRes.signIndex,
    planets: planetPlacements,
    specialAmshaNames,
  };
}

/**
 * Generate all 16 Shodashavargas at once for a chart.
 */
export function generateAllShodashavargas(
  ascendantSiderealLon: number,
  planets: PlanetPosition[]
): Record<VargaCode, VargaChart> {
  const result = {} as Record<VargaCode, VargaChart>;
  for (const meta of VARGA_METADATA_LIST) {
    result[meta.code] = generateVargaChart(meta.code, ascendantSiderealLon, planets);
  }
  return result;
}
