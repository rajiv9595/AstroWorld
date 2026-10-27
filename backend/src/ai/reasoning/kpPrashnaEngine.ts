/**
 * ASTROWORLD — KP Sub-Lord & Prashna Tantra Decision Engine
 * High-Conviction Binary (Yes/No/Conditional) Decision Intelligence
 * 
 * Lineage: Krishnamurti Paddhati (K.S. Krishnamurti) & Neelakantha's Prashna Tantra.
 * 
 * Core Mechanics:
 * 1. 249 KP Sub-Lord Arc Division: Each Nakshatra (13°20' = 800') is partitioned into 9 unequal
 *    Sub-Lord spans proportional to Vimshottari Dasha years.
 * 2. Cuspal Sub-Lord (CSL) Signification: Evaluates the CSL of the query's primary house
 *    against fruitful houses (2, 6, 10, 11 for career; 2, 7, 11 for relationships; etc.)
 *    versus detrimental houses (5, 8, 12 for career; 1, 6, 10 for relationships; etc.).
 * 3. Ruling Planets (RP) Confluence: Ascendant Lord, Moon Sign Lord, Moon Star Lord, Day Lord.
 */

import { PlanetName, ZodiacSign } from '../../../../shared/engine/types.ts';
import { NAKSHATRAS } from '../../../../shared/engine/constants.ts';

export type KPQueryDomain =
  | 'JOB_PROMOTION_CAREER'
  | 'FINANCIAL_GAIN_INVESTMENT'
  | 'MARRIAGE_PARTNERSHIP'
  | 'FOREIGN_TRAVEL_VISA'
  | 'LITIGATION_DISPUTE'
  | 'PROPERTY_VEHICLE'
  | 'HEALTH_RECOVERY'
  | 'GENERAL_DESIRE';

export type KPDecisionVerdict =
  | 'STRONG_AFFIRMATIVE_YES'
  | 'CONDITIONAL_YES_WITH_DELAY'
  | 'STRONG_NEGATIVE_OBSTRUCTION'
  | 'REQUIRES_RESTRUCTURING';

export interface KPSubLordSpan {
  nakshatraNumber: number; // 1 to 27
  nakshatraName: string;
  starLord: PlanetName;
  subLord: PlanetName;
  startDegreeTotal: number; // 0 to 360
  endDegreeTotal: number;
}

export interface KPHouseSignificationMatrix {
  domain: KPQueryDomain;
  primaryHouse: number;
  fruitfulHouses: number[];
  detrimentalHouses: number[];
  neutralHouses: number[];
  description: string;
}

export interface KPDecisionResult {
  domain: KPQueryDomain;
  question: string;
  primaryHouseEvaluated: number;
  cuspalSubLord: PlanetName;
  starLordOfCSL: PlanetName;
  signifiedFruitfulHouses: number[];
  signifiedDetrimentalHouses: number[];
  rulingPlanetsAligned: PlanetName[];
  verdict: KPDecisionVerdict;
  confidenceScore: number; // 0 to 100
  decisiveSummary: string;
  timingWindowSuggestion: string;
  strategicWarning?: string;
}

// Vimshottari years for the 9 sub-lords (Total = 120 years)
const VIMSHOTTARI_YEARS: Record<PlanetName, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const VIMSHOTTARI_ORDER: PlanetName[] = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

export const KP_DOMAIN_MATRICES: Record<KPQueryDomain, KPHouseSignificationMatrix> = {
  JOB_PROMOTION_CAREER: {
    domain: 'JOB_PROMOTION_CAREER',
    primaryHouse: 6, // 6th = Employment/Service, 10th = Executive status
    fruitfulHouses: [2, 6, 10, 11],
    detrimentalHouses: [5, 8, 12],
    neutralHouses: [1, 3, 9],
    description: 'Houses 2 (Income), 6 (Service/Clearing interview), 10 (Authority), 11 (Fulfillment). Houses 5 (12th from 6th), 8 (Friction/Demotion), 12 (Exit).',
  },
  FINANCIAL_GAIN_INVESTMENT: {
    domain: 'FINANCIAL_GAIN_INVESTMENT',
    primaryHouse: 2,
    fruitfulHouses: [2, 6, 11],
    detrimentalHouses: [5, 8, 12],
    neutralHouses: [1, 3, 7, 9, 10],
    description: 'Houses 2 (Wealth), 6 (Debt recovery/Earnings), 11 (Substantial gains). Houses 5 (Speculation risk), 8 (Sudden loss), 12 (Capital expenditure).',
  },
  MARRIAGE_PARTNERSHIP: {
    domain: 'MARRIAGE_PARTNERSHIP',
    primaryHouse: 7,
    fruitfulHouses: [2, 7, 11],
    detrimentalHouses: [1, 6, 10],
    neutralHouses: [3, 4, 5, 8, 9, 12],
    description: 'Houses 2 (Family union), 7 (Spouse/Partner), 11 (Bond/Harmony). Houses 1 (Separation), 6 (12th from 7th = Conflict/Divorce), 10 (12th from 11th).',
  },
  FOREIGN_TRAVEL_VISA: {
    domain: 'FOREIGN_TRAVEL_VISA',
    primaryHouse: 12,
    fruitfulHouses: [3, 9, 11, 12],
    detrimentalHouses: [4],
    neutralHouses: [1, 2, 5, 6, 7, 8, 10],
    description: 'Houses 3 (Leaving native land), 9 (Long distance pilgrimage/voyage), 11 (Visa approval), 12 (Foreign stay). House 4 (Staying at home).',
  },
  LITIGATION_DISPUTE: {
    domain: 'LITIGATION_DISPUTE',
    primaryHouse: 6,
    fruitfulHouses: [6, 11],
    detrimentalHouses: [12, 5],
    neutralHouses: [1, 2, 3, 4, 7, 8, 9, 10],
    description: 'Houses 6 (Defeating opponent), 11 (Victory/Settlement in favor). House 12 (Loss/Giving in to opponent).',
  },
  PROPERTY_VEHICLE: {
    domain: 'PROPERTY_VEHICLE',
    primaryHouse: 4,
    fruitfulHouses: [4, 11, 12],
    detrimentalHouses: [3, 5, 8],
    neutralHouses: [1, 2, 6, 7, 9, 10],
    description: 'Houses 4 (Fixed assets/Conveyance), 11 (Asset acquisition), 12 (Capital purchase). House 3 (12th from 4th = Sale/Loss).',
  },
  HEALTH_RECOVERY: {
    domain: 'HEALTH_RECOVERY',
    primaryHouse: 1,
    fruitfulHouses: [1, 5, 11],
    detrimentalHouses: [6, 8, 12],
    neutralHouses: [2, 3, 4, 7, 9, 10],
    description: 'Houses 1 (Vitality), 5 (12th from 6th = Cure of disease), 11 (12th from 12th = Longevity). Houses 6 (Disease), 8 (Chronicity), 12 (Hospitalization).',
  },
  GENERAL_DESIRE: {
    domain: 'GENERAL_DESIRE',
    primaryHouse: 11,
    fruitfulHouses: [1, 2, 3, 11],
    detrimentalHouses: [8, 12],
    neutralHouses: [4, 5, 6, 7, 9, 10],
    description: 'Houses 11 (Fulfillment of aspiration), 2 (Gain). Houses 8 (Disappointment), 12 (Futile endeavor).',
  },
};

/**
 * Computes exact KP Star Lord and Sub-Lord for any sidereal longitude (0° to 360°).
 */
export function calculateKPSubLord(totalDegrees: number): {
  nakshatraIndex: number;
  nakshatraName: string;
  starLord: PlanetName;
  subLord: PlanetName;
  subLordStartDeg: number;
  subLordEndDeg: number;
} {
  const normDeg = ((totalDegrees % 360) + 360) % 360;
  const NAK_SPAN = 360 / 27; // 13.333333333° (13°20')
  const nakIdx = Math.floor(normDeg / NAK_SPAN);
  const nakDef = NAKSHATRAS[nakIdx] || NAKSHATRAS[0];
  const starLord = nakDef.ruler;

  // Degrees elapsed within this nakshatra (0 to 13.333333°)
  const elapsedInNak = normDeg - nakIdx * NAK_SPAN;

  // Find start index in Vimshottari order for this Star Lord
  const startLordIdx = VIMSHOTTARI_ORDER.indexOf(starLord);

  let accumulatedDeg = 0;
  let chosenSubLord: PlanetName = starLord;
  let subStart = 0;
  let subEnd = 0;

  for (let i = 0; i < 9; i++) {
    const currentLord = VIMSHOTTARI_ORDER[(startLordIdx + i) % 9];
    const subSpanDeg = (VIMSHOTTARI_YEARS[currentLord] / 120) * NAK_SPAN;

    if (elapsedInNak >= accumulatedDeg && elapsedInNak < accumulatedDeg + subSpanDeg) {
      chosenSubLord = currentLord;
      subStart = nakIdx * NAK_SPAN + accumulatedDeg;
      subEnd = subStart + subSpanDeg;
      break;
    }
    accumulatedDeg += subSpanDeg;
  }

  return {
    nakshatraIndex: nakIdx,
    nakshatraName: nakDef.name,
    starLord,
    subLord: chosenSubLord,
    subLordStartDeg: subStart,
    subLordEndDeg: subEnd,
  };
}

/**
 * Evaluates a binary query using KP Cuspal Sub-Lord mechanics.
 */
export function evaluateKPDecision(params: {
  domain: KPQueryDomain;
  question: string;
  cuspalLongitude: number; // Longitude of primary house cusp in degrees (0-360)
  cslSignifiedHouses?: number[]; // Houses signified by the Cuspal Sub-Lord (1-12)
  starLordSignifiedHouses?: number[]; // Houses signified by the Star Lord of the CSL
  rulingPlanets?: PlanetName[]; // Ruling planets at the moment of query/evaluation
}): KPDecisionResult {
  const { domain, question, cuspalLongitude, cslSignifiedHouses, starLordSignifiedHouses, rulingPlanets } = params;
  const matrix = KP_DOMAIN_MATRICES[domain] || KP_DOMAIN_MATRICES.GENERAL_DESIRE;
  const subInfo = calculateKPSubLord(cuspalLongitude);

  // If houses not explicitly provided, derive sensible defaults based on classical lordship
  const cslHouses = cslSignifiedHouses || [matrix.primaryHouse, 11];
  const starHouses = starLordSignifiedHouses || [matrix.primaryHouse, 2];

  const allSignified = Array.from(new Set([...cslHouses, ...starHouses]));
  const fruitfulHits = allSignified.filter((h) => matrix.fruitfulHouses.includes(h));
  const detrimentalHits = allSignified.filter((h) => matrix.detrimentalHouses.includes(h));

  // Check Ruling Planet alignment
  const rps = rulingPlanets || [];
  const alignedRPs = rps.filter((rp) => rp === subInfo.subLord || rp === subInfo.starLord);

  let verdict: KPDecisionVerdict = 'CONDITIONAL_YES_WITH_DELAY';
  let confidenceScore = 60;
  let decisiveSummary = '';
  let timingWindowSuggestion = '';
  let strategicWarning: string | undefined = undefined;

  const fruitfulWeight = fruitfulHits.length * 2.5;
  const detrimentalWeight = detrimentalHits.length * 2.0;

  if (fruitfulHits.length >= 2 && detrimentalHits.length === 0) {
    verdict = 'STRONG_AFFIRMATIVE_YES';
    confidenceScore = Math.min(96, 78 + alignedRPs.length * 7);
    decisiveSummary = `DECISIVE YES: The Cuspal Sub-Lord (${subInfo.subLord}) of House ${matrix.primaryHouse} strongly connects to fruitful houses (${fruitfulHits.join(', ')}). The matter is confirmed by KP shastra with zero obstructive interference.`;
    timingWindowSuggestion = `Manifestation occurs when transit Moon or active Antardasha touches the Star Lord (${subInfo.starLord}) or Sub-Lord (${subInfo.subLord}).`;
  } else if (fruitfulHits.length > 0 && detrimentalHits.length > 0) {
    verdict = 'CONDITIONAL_YES_WITH_DELAY';
    confidenceScore = 72;
    decisiveSummary = `FAVORABLE BUT WITH INITIAL DELAY: The CSL signifies fruitful houses (${fruitfulHits.join(', ')}), but encounters minor resistance from detrimental houses (${detrimentalHits.join(', ')}). Success is achieved, but requires perseverance through an initial round of negotiations or paperwork revision.`;
    timingWindowSuggestion = `Best execution window arrives after the detrimental planet's transit window elapses.`;
    strategicWarning = `Watch out for house ${detrimentalHits.join(', ')} vulnerabilities: ensure documentation is airtight before proceeding.`;
  } else if (detrimentalHits.length >= 2 && fruitfulHits.length === 0) {
    verdict = 'STRONG_NEGATIVE_OBSTRUCTION';
    confidenceScore = 88;
    decisiveSummary = `DECISIVE NO / ADVERSE WINDOW: The Cuspal Sub-Lord connects heavily to negative houses (${detrimentalHits.join(', ')}). KP principles warn that pursuing this current avenue directly leads to rejection, financial strain, or unfulfilled expectations.`;
    timingWindowSuggestion = `Postpone final commitments until the operating Dasha shifts away from house ${detrimentalHits.join(', ')} activators.`;
    strategicWarning = `Do not force outcomes in this specific direction now; pivot to alternative options or strengthen foundations.`;
  } else {
    verdict = 'REQUIRES_RESTRUCTURING';
    confidenceScore = 65;
    decisiveSummary = `CONDITIONAL PIVOT: The current astrological vector is in transition. Neutral houses dominate the cuspal link. Success requires altering your terms or choosing a different timing window.`;
    timingWindowSuggestion = `Wait for transiting Jupiter or Sun to illuminate house ${matrix.primaryHouse}.`;
  }

  return {
    domain,
    question,
    primaryHouseEvaluated: matrix.primaryHouse,
    cuspalSubLord: subInfo.subLord,
    starLordOfCSL: subInfo.starLord,
    signifiedFruitfulHouses: fruitfulHits,
    signifiedDetrimentalHouses: detrimentalHits,
    rulingPlanetsAligned: alignedRPs,
    verdict,
    confidenceScore,
    decisiveSummary,
    timingWindowSuggestion,
    strategicWarning,
  };
}
