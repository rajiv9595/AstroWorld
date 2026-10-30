/**
 * ASTROWORLD — Special Sensitive Points & Diagnostics Engine
 * 
 * Implements canonical classical algorithms from BPHS, Jataka Parijata,
 * Bhavartha Ratnakara, and Bhrigu Nadi:
 * 1. Indu Lagna (Billionaire Wealth Seat & Kala Matrix - Rule 67)
 * 2. Yogi, Sahayogi & Avayogi Points (Prosperity & Obstruction Keys - Rule 5, 68-70)
 * 3. Bhrigu Bindu (Destiny Seed Point - Rule 4)
 * 4. Beeja & Kshetra Sphutas (Male/Female Biological Fertility Matrices - Rules 320-321)
 * 5. Planetary Latta (Nakshatra Thrust Matrix - Rules 331-332)
 * 6. Pushkara Dignities (Pushkara Bhaga & Pushkara Navamsha - Rules 13, 339)
 * 7. Special Karmic Nakshatras (The 27 Nakshatra Karmic Mandala - Rule 337)
 * 8. Tripushkara & Dwipushkara Yogas (Action Multiplier Matrix - Rule 343)
 * 9. Vaisheshikamsha Multi-Varga Dignity Ladder (Rule 314)
 * 10. Ayurvedic Tridosha Constitutional Balance & Health Diagnostics
 */

import { formatDMS, getNakshatraAndPada, normalizeDegrees } from './astronomy.ts';
import { NAKSHATRAS, SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import {
  AscendantInfo,
  HouseInfo,
  PlanetName,
  PlanetPosition,
  VargaChart,
  VargaCode,
  ZodiacSign,
} from './types.ts';

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// =========================================================================
// 1. INDU LAGNA (WEALTH ASCENDANT - RULE 67)
// =========================================================================

export interface InduLagnaFacts {
  induSign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  formattedDegree: string;
  houseFromLagna: number;
  ninthFromLagnaLord: PlanetName;
  ninthFromLagnaKalas: number;
  ninthFromMoonLord: PlanetName;
  ninthFromMoonKalas: number;
  totalKalas: number;
  wealthTier: string;
  planetsInInduLagna: PlanetName[];
  shastricSignificance: string;
}

const KALA_VALUES: Record<PlanetName, number> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1,
  Rahu: 0,
  Ketu: 0,
};

export function calculateInduLagnaFacts(
  ascendantSignIndex: number,
  moonPlanet: PlanetPosition,
  allPlanets: PlanetPosition[]
): InduLagnaFacts {
  // 9th house from Lagna
  const ninthFromLagnaSignIdx = (ascendantSignIndex + 8) % 12;
  const ninthFromLagnaLord = SIGN_LORDS[ZODIAC_SIGNS[ninthFromLagnaSignIdx]];
  const kala1 = KALA_VALUES[ninthFromLagnaLord] || 0;

  // 9th house from Moon
  const ninthFromMoonSignIdx = (moonPlanet.signIndex + 8) % 12;
  const ninthFromMoonLord = SIGN_LORDS[ZODIAC_SIGNS[ninthFromMoonSignIdx]];
  const kala2 = KALA_VALUES[ninthFromMoonLord] || 0;

  const totalKalas = kala1 + kala2;
  const remainder = totalKalas % 12 === 0 ? 12 : totalKalas % 12;

  // Count remainder signs from Moon's Janma Rashi (1-based: Moon sign is 1)
  const induSignIdx = (moonPlanet.signIndex + remainder - 1) % 12;
  const induSign = ZODIAC_SIGNS[induSignIdx];
  const houseFromLagna = ((induSignIdx - ascendantSignIndex + 12) % 12) + 1;

  const planetsHere = allPlanets
    .filter((p) => p.signIndex === induSignIdx)
    .map((p) => p.name);

  let wealthTier = 'Disciplined Capital Growth';
  if (totalKalas >= 30) {
    wealthTier = 'Supreme Billionaire Tier (Lakshmi Samriddhi)';
  } else if (totalKalas >= 20) {
    wealthTier = 'High Multi-Millionaire Tier (Dhana Vridhi)';
  } else if (totalKalas >= 10) {
    wealthTier = 'Stable Affluence & Asset Retention (Sampatti)';
  }

  const degInSign = moonPlanet.degreeInSign;

  return {
    induSign,
    signIndex: induSignIdx,
    degreeInSign: degInSign,
    formattedDegree: formatDMS(degInSign),
    houseFromLagna,
    ninthFromLagnaLord,
    ninthFromLagnaKalas: kala1,
    ninthFromMoonLord,
    ninthFromMoonKalas: kala2,
    totalKalas,
    wealthTier,
    planetsInInduLagna: planetsHere,
    shastricSignificance: `Indu Lagna sits in ${induSign} (House ${houseFromLagna} from Lagna) with ${totalKalas} Kalas (9th from Lagna: ${ninthFromLagnaLord} [${kala1}], 9th from Moon: ${ninthFromMoonLord} [${kala2}]). Evaluated Wealth Tier: ${wealthTier}${planetsHere.length > 0 ? `, occupied by ${planetsHere.join(', ')}` : ''}.`,
  };
}

// =========================================================================
// 2. YOGI, SAHAYOGI & AVAYOGI (PROSPERITY & OBSTRUCTION - RULES 5, 68-70)
// =========================================================================

export interface YogiAvayogiFacts {
  yogiLongitude: number;
  yogiSign: ZodiacSign;
  yogiDegreeInSign: number;
  yogiFormattedDegree: string;
  yogiNakshatra: string;
  yogiPlanet: PlanetName;
  sahayogiPlanet: PlanetName;
  avayogiLongitude: number;
  avayogiSign: ZodiacSign;
  avayogiDegreeInSign: number;
  avayogiFormattedDegree: string;
  avayogiNakshatra: string;
  avayogiPlanet: PlanetName;
  shastricSignificance: string;
}

export function calculateYogiAvayogiFacts(
  sunLongitude: number,
  moonLongitude: number
): YogiAvayogiFacts {
  // Pushya constant offset: 3 signs 3°20' = 93°20' = 93.333333°
  const PUSHYA_OFFSET = 93 + 20 / 60;
  const yogiLon = norm360(sunLongitude + moonLongitude + PUSHYA_OFFSET);

  const yogiSignIdx = Math.floor(yogiLon / 30);
  const yogiSign = ZODIAC_SIGNS[yogiSignIdx];
  const yogiDeg = yogiLon % 30;

  const yogiNakIdx = Math.floor(yogiLon / (360 / 27));
  const yogiNakDef = NAKSHATRAS[yogiNakIdx];
  const yogiPlanet = yogiNakDef.ruler;
  const sahayogiPlanet = SIGN_LORDS[yogiSign];

  // Avayogi is 6th Nakshatra from Yogi Nakshatra: (yogiNakIdx + 5) % 27
  const avayogiNakIdx = (yogiNakIdx + 5) % 27;
  const avayogiNakDef = NAKSHATRAS[avayogiNakIdx];
  const avayogiPlanet = avayogiNakDef.ruler;
  const avayogiLon = norm360(yogiLon + (5 * (360 / 27)));
  const avayogiSignIdx = Math.floor(avayogiLon / 30);
  const avayogiSign = ZODIAC_SIGNS[avayogiSignIdx];
  const avayogiDeg = avayogiLon % 30;

  return {
    yogiLongitude: yogiLon,
    yogiSign,
    yogiDegreeInSign: yogiDeg,
    yogiFormattedDegree: formatDMS(yogiDeg),
    yogiNakshatra: yogiNakDef.name,
    yogiPlanet,
    sahayogiPlanet,
    avayogiLongitude: avayogiLon,
    avayogiSign,
    avayogiDegreeInSign: avayogiDeg,
    avayogiFormattedDegree: formatDMS(avayogiDeg),
    avayogiNakshatra: avayogiNakDef.name,
    avayogiPlanet,
    shastricSignificance: `Yogi Planet: ${yogiPlanet} (${yogiNakDef.name}) grants effortless catalyst of luck & prosperity; Sahayogi: ${sahayogiPlanet} provides institutional support. Avayogi Planet: ${avayogiPlanet} (${avayogiNakDef.name}) governs obstruction & friction requiring mindfulness.`,
  };
}

// =========================================================================
// 3. BHRIGU BINDU (DESTINY SEED POINT - RULE 4)
// =========================================================================

export interface BhriguBinduFacts {
  siderealLongitude: number;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  formattedDegree: string;
  houseNumber: number;
  nakshatra: string;
  pada: number;
  nakshatraLord: PlanetName;
  shastricSignificance: string;
}

export function calculateBhriguBinduFacts(
  moonLongitude: number,
  rahuLongitude: number,
  ascendantSignIndex: number
): BhriguBinduFacts {
  const mLon = norm360(moonLongitude);
  const rLon = norm360(rahuLongitude);

  // Shortest arc midpoint between Moon and Rahu
  let diff = (rLon - mLon + 360) % 360;
  let binduLon: number;

  if (diff <= 180) {
    binduLon = (mLon + diff / 2) % 360;
  } else {
    diff = 360 - diff;
    binduLon = (mLon - diff / 2 + 360) % 360;
  }

  const signIdx = Math.floor(binduLon / 30);
  const sign = ZODIAC_SIGNS[signIdx];
  const deg = binduLon % 30;
  const nak = getNakshatraAndPada(binduLon);
  const nakDef = NAKSHATRAS[Math.floor(binduLon / (360 / 27))];
  const houseNumber = ((signIdx - ascendantSignIndex + 12) % 12) + 1;

  return {
    siderealLongitude: binduLon,
    sign,
    signIndex: signIdx,
    degreeInSign: deg,
    formattedDegree: formatDMS(deg),
    houseNumber,
    nakshatra: nak.nakshatra,
    pada: nak.pada,
    nakshatraLord: nakDef.ruler,
    shastricSignificance: `Bhrigu Bindu (Destiny Seed Point) falls at ${formatDMS(deg)} ${sign} in House ${houseNumber} (${nak.nakshatra} Pada ${nak.pada}, Lord: ${nakDef.ruler}). Transits over this point trigger fateful life milestones.`,
  };
}

// =========================================================================
// 4. BEEJA & KSHETRA SPHUTAS (FERTILITY MATRICES - RULES 320-321)
// =========================================================================

export interface SphutaMetric {
  siderealLongitude: number;
  sign: ZodiacSign;
  signIndex: number;
  degreeInSign: number;
  formattedDegree: string;
  houseNumber: number;
  isOddRashi: boolean;
  navamshaSign: ZodiacSign;
  isOddNavamsha: boolean;
  isAuspicious: boolean;
  analysis: string;
}

export interface FertilitySphutasFacts {
  beejaSphuta: SphutaMetric;
  kshetraSphuta: SphutaMetric;
  summary: string;
}

export function calculateFertilitySphutasFacts(
  sunLon: number,
  venusLon: number,
  jupiterLon: number,
  moonLon: number,
  marsLon: number,
  ascendantSignIndex: number
): FertilitySphutasFacts {
  // Helper for Navamsha sign calculation
  const getNavamsha = (lon: number): { sign: ZodiacSign; isOdd: boolean } => {
    const norm = norm360(lon);
    const sIdx = Math.floor(norm / 30);
    const degInSign = norm % 30;
    const navDeg = degInSign / (30 / 9);
    const navSignIdx = (Math.floor(navDeg) + (sIdx % 4) * 3) % 12;
    return {
      sign: ZODIAC_SIGNS[navSignIdx],
      isOdd: navSignIdx % 2 === 0, // 0=Aries (Odd), 1=Taurus (Even)
    };
  };

  // Beeja Sphuta (Male virility) = Sun + Venus + Jupiter
  const bLon = norm360(sunLon + venusLon + jupiterLon);
  const bSignIdx = Math.floor(bLon / 30);
  const bSign = ZODIAC_SIGNS[bSignIdx];
  const bDeg = bLon % 30;
  const bHouse = ((bSignIdx - ascendantSignIndex + 12) % 12) + 1;
  const bIsOddRashi = bSignIdx % 2 === 0; // 0=Aries (Odd)
  const bNav = getNavamsha(bLon);
  const bAuspicious = bIsOddRashi && bNav.isOdd;

  const beejaSphuta: SphutaMetric = {
    siderealLongitude: bLon,
    sign: bSign,
    signIndex: bSignIdx,
    degreeInSign: bDeg,
    formattedDegree: formatDMS(bDeg),
    houseNumber: bHouse,
    isOddRashi: bIsOddRashi,
    navamshaSign: bNav.sign,
    isOddNavamsha: bNav.isOdd,
    isAuspicious: bAuspicious,
    analysis: bAuspicious
      ? `Beeja Sphuta lands in Odd Rashi (${bSign}) & Odd Navamsha (${bNav.sign}), confirming strong male generative potency (Rule 320).`
      : `Beeja Sphuta lands in Even sign/navamsha (${bSign}/${bNav.sign}), suggesting potential cellular vitality friction requiring medical or dietary support.`,
  };

  // Kshetra Sphuta (Female receptivity) = Moon + Mars + Jupiter
  const kLon = norm360(moonLon + marsLon + jupiterLon);
  const kSignIdx = Math.floor(kLon / 30);
  const kSign = ZODIAC_SIGNS[kSignIdx];
  const kDeg = kLon % 30;
  const kHouse = ((kSignIdx - ascendantSignIndex + 12) % 12) + 1;
  const kIsEvenRashi = kSignIdx % 2 !== 0; // 1=Taurus (Even), 3=Cancer (Even)
  const kNav = getNavamsha(kLon);
  const kIsEvenNav = !kNav.isOdd;
  const kAuspicious = kIsEvenRashi && kIsEvenNav;

  const kshetraSphuta: SphutaMetric = {
    siderealLongitude: kLon,
    sign: kSign,
    signIndex: kSignIdx,
    degreeInSign: kDeg,
    formattedDegree: formatDMS(kDeg),
    houseNumber: kHouse,
    isOddRashi: !kIsEvenRashi,
    navamshaSign: kNav.sign,
    isOddNavamsha: kNav.isOdd,
    isAuspicious: kAuspicious,
    analysis: kAuspicious
      ? `Kshetra Sphuta lands in Even Rashi (${kSign}) & Even Navamsha (${kNav.sign}), confirming fertile uterine & ovulatory receptivity (Rule 321).`
      : `Kshetra Sphuta lands in Odd sign/navamsha (${kSign}/${kNav.sign}), suggesting reproductive sensitivity benefiting from holistic care.`,
  };

  return {
    beejaSphuta,
    kshetraSphuta,
    summary: `Beeja: ${bSign} ${formatDMS(bDeg)} (${bAuspicious ? 'Auspicious' : 'Needs Support'}) | Kshetra: ${kSign} ${formatDMS(kDeg)} (${kAuspicious ? 'Auspicious' : 'Needs Support'})`,
  };
}

// =========================================================================
// 5. PLANETARY LATTA (NAKSHATRA THRUST MATRIX - RULES 331-332)
// =========================================================================

export interface LattaKickItem {
  planet: PlanetName;
  planetNakshatra: string;
  kickNakshatraIndex: number;
  kickNakshatraName: string;
  direction: 'forward' | 'backward';
  offset: number;
  strikesTarget: boolean;
  effect: string;
}

export interface PlanetaryLattaFacts {
  targetNakshatra: string;
  targetNakshatraIndex: number;
  kicks: LattaKickItem[];
  isAfflicted: boolean;
  afflictingPlanets: PlanetName[];
  shastricVerdict: string;
}

export function calculatePlanetaryLattaFacts(
  planets: PlanetPosition[],
  targetNakshatraIndex: number
): PlanetaryLattaFacts {
  const LATTA_RULES: { planet: PlanetName; offset: number; direction: 'forward' | 'backward'; effect: string }[] = [
    { planet: 'Sun', offset: 12, direction: 'forward', effect: 'Authority friction, fever, or career strain' },
    { planet: 'Mars', offset: 3, direction: 'forward', effect: 'Sudden cuts, inflammatory conflict, or accidents' },
    { planet: 'Jupiter', offset: 6, direction: 'forward', effect: 'Financial misjudgment or disruption with elders' },
    { planet: 'Saturn', offset: 8, direction: 'forward', effect: 'Acute delay, bereavement, or resource stagnation' },
    { planet: 'Moon', offset: 22, direction: 'backward', effect: 'Emotional turbulence, insomnia, or loss of tranquility' },
    { planet: 'Mercury', offset: 7, direction: 'backward', effect: 'Commercial dispute, intellectual anxiety, or contract error' },
    { planet: 'Venus', offset: 5, direction: 'backward', effect: 'Marital friction, financial drain, or sensual distress' },
    { planet: 'Rahu', offset: 9, direction: 'backward', effect: 'Sudden betrayal, toxicity, or covert deception' },
  ];

  const kicks: LattaKickItem[] = [];
  const afflicting: PlanetName[] = [];

  for (const r of LATTA_RULES) {
    const pl = planets.find((p) => p.name === r.planet);
    if (pl) {
      const pNakIdx = Math.floor(pl.siderealLongitude / (360 / 27));
      let kickIdx: number;
      if (r.direction === 'forward') {
        kickIdx = (pNakIdx + r.offset - 1) % 27;
      } else {
        kickIdx = (pNakIdx - (r.offset - 1) + 27) % 27;
      }

      const strikes = kickIdx === targetNakshatraIndex;
      if (strikes) afflicting.push(r.planet);

      kicks.push({
        planet: r.planet,
        planetNakshatra: NAKSHATRAS[pNakIdx].name,
        kickNakshatraIndex: kickIdx,
        kickNakshatraName: NAKSHATRAS[kickIdx].name,
        direction: r.direction,
        offset: r.offset,
        strikesTarget: strikes,
        effect: r.effect,
      });
    }
  }

  const targetName = NAKSHATRAS[targetNakshatraIndex]?.name || 'Target Star';
  const isAfflicted = afflicting.length > 0;

  return {
    targetNakshatra: targetName,
    targetNakshatraIndex,
    kicks,
    isAfflicted,
    afflictingPlanets: afflicting,
    shastricVerdict: isAfflicted
      ? `Target Star ${targetName} is pierced by Latta kick from: ${afflicting.join(', ')} (Rules 331–332).`
      : `Target Star ${targetName} is free from direct planetary Latta kicks.`,
  };
}

// =========================================================================
// 6. PUSHKARA DIGNITIES (PUSHKARA BHAGA & NAVAMSHA - RULES 13, 339)
// =========================================================================

export interface PlanetPushkaraAnalysis {
  planet: PlanetName;
  isPushkaraNavamsha: boolean;
  pushkaraNavamshaSign?: ZodiacSign;
  isPushkaraBhaga: boolean;
  exactPushkaraDegree?: number;
  isGandanta: boolean;
  gandantaJunction?: string;
}

export function evaluatePushkaraAndGandanta(
  longitude: number
): {
  isPushkaraNavamsha: boolean;
  pushkaraNavamshaSign?: ZodiacSign;
  isPushkaraBhaga: boolean;
  exactPushkaraDegree?: number;
  isGandanta: boolean;
  gandantaJunction?: string;
} {
  const norm = norm360(longitude);
  const signIdx = Math.floor(norm / 30);
  const deg = norm % 30;
  const navIdx = Math.floor(deg / (30 / 9));
  const navSignIdx = (navIdx + (signIdx % 4) * 3) % 12;
  const navSign = ZODIAC_SIGNS[navSignIdx];
  const modality = signIdx % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

  // Pushkara Navamsha check
  let isPushkaraNav = false;
  if (modality === 0 && (navIdx === 6 || navIdx === 8)) isPushkaraNav = true; // 7th, 9th
  else if (modality === 1 && (navIdx === 2 || navIdx === 4)) isPushkaraNav = true; // 3rd, 5th
  else if (modality === 2 && (navIdx === 5 || navIdx === 7)) isPushkaraNav = true; // 6th, 8th
  else if (modality === 3 && (navIdx === 0 || navIdx === 2)) isPushkaraNav = true; // 1st, 3rd

  // Pushkara Bhaga check (within 1° of exact degrees)
  let pushkaraDegrees: number[] = [];
  if (modality === 0) pushkaraDegrees = [21, 24];
  else if (modality === 1) pushkaraDegrees = [9, 14];
  else if (modality === 2) pushkaraDegrees = [18, 24];
  else if (modality === 3) pushkaraDegrees = [2, 7];

  let isPushkaraBhaga = false;
  let exactTarget: number | undefined;
  for (const pd of pushkaraDegrees) {
    if (Math.abs(deg - pd) <= 1.0) {
      isPushkaraBhaga = true;
      exactTarget = pd;
      break;
    }
  }

  // Gandanta check: Water-Fire junctions (last 0°48' of Water, first 0°48' of Fire)
  let isGandanta = false;
  let gandantaJunction: string | undefined;
  const GANDANTA_JUNCTIONS = [
    { waterSign: 3, fireSign: 4, name: 'Ashlesha-Magha Junction (Cancer-Leo)' },
    { waterSign: 7, fireSign: 8, name: 'Jyeshtha-Mula Junction (Scorpio-Sagittarius)' },
    { waterSign: 11, fireSign: 0, name: 'Revati-Ashwini Junction (Pisces-Aries)' },
  ];

  for (const j of GANDANTA_JUNCTIONS) {
    if (signIdx === j.waterSign && deg >= 29.2) {
      isGandanta = true;
      gandantaJunction = `${j.name} (Water End)`;
      break;
    }
    if (signIdx === j.fireSign && deg <= 0.8) {
      isGandanta = true;
      gandantaJunction = `${j.name} (Fire Beginning)`;
      break;
    }
  }

  return {
    isPushkaraNavamsha: isPushkaraNav,
    pushkaraNavamshaSign: isPushkaraNav ? navSign : undefined,
    isPushkaraBhaga,
    exactPushkaraDegree: exactTarget,
    isGandanta,
    gandantaJunction,
  };
}

// =========================================================================
// 7. SPECIAL KARMIC NAKSHATRAS (THE 27 STAR MANDALA - RULE 337)
// =========================================================================

export interface KarmicStarItem {
  role: string;
  offset: number;
  nakshatraIndex: number;
  nakshatraName: string;
  governingDomain: string;
}

export function calculateSpecialKarmicNakshatrasFacts(
  janmaNakshatraIdx: number
): Record<string, KarmicStarItem> {
  const definitions: { role: string; offset: number; domain: string }[] = [
    { role: 'Janma', offset: 1, domain: 'Physical vitality, life purpose, and self' },
    { role: 'Jati', offset: 4, domain: 'Community roots, clan relations, and domestic environment' },
    { role: 'Karma', offset: 10, domain: 'Professional seat, executive authority, and career actions' },
    { role: 'Desha', offset: 12, domain: 'Homeland versus foreign settlement and relocation' },
    { role: 'Sanghatika', offset: 16, domain: 'Group alliances, partnerships, and collective karma' },
    { role: 'Samudayika', offset: 18, domain: 'Mass influence, crowd events, and broad social standing' },
    { role: 'Adhana', offset: 19, domain: 'Conception point and deep subconscious reprogramming' },
    { role: 'Vainashika', offset: 22, domain: 'Destruction, surgical intervention, and critical caution' },
    { role: 'Abhisheka', offset: 27, domain: 'Coronation, spiritual crowning, and peak honors' },
  ];

  const result: Record<string, KarmicStarItem> = {};

  for (const d of definitions) {
    const starIdx = (janmaNakshatraIdx + d.offset - 1) % 27;
    result[d.role] = {
      role: d.role,
      offset: d.offset,
      nakshatraIndex: starIdx,
      nakshatraName: NAKSHATRAS[starIdx].name,
      governingDomain: d.domain,
    };
  }

  return result;
}

// =========================================================================
// 8. TRIPUSHKARA & DWIPUSHKARA YOGAS (RULE 343)
// =========================================================================

export interface TripushkaraFacts {
  hasTripushkara: boolean;
  hasDwipushkara: boolean;
  multiplier: 1 | 2 | 3;
  tithiNumber: number;
  isBhadraTithi: boolean;
  weekday: number;
  nakshatraName: string;
  shastricVerdict: string;
}

export function calculateTripushkaraFacts(
  tithiNumber: number,
  weekday: number,
  nakshatraIdx: number
): TripushkaraFacts {
  const normTithi = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;
  const isBhadraTithi = normTithi === 2 || normTithi === 7 || normTithi === 12;
  const isEligibleVara = weekday === 0 || weekday === 2 || weekday === 6; // Sun, Tue, Sat

  const tripStars = [2, 6, 11, 15, 20, 24]; // Krittika, Punarvasu, Uttara Phalguni, Vishakha, Uttara Ashadha, Purva Bhadrapada
  const dwipStars = [4, 13, 22]; // Mrigashira, Chitra, Dhanishta

  const hasTripushkara = isBhadraTithi && isEligibleVara && tripStars.includes(nakshatraIdx);
  const hasDwipushkara = isBhadraTithi && isEligibleVara && dwipStars.includes(nakshatraIdx);

  const multiplier: 1 | 2 | 3 = hasTripushkara ? 3 : hasDwipushkara ? 2 : 1;
  const starName = NAKSHATRAS[nakshatraIdx]?.name || 'Nakshatra';

  let shastricVerdict = 'Standard timing conditions.';
  if (hasTripushkara) {
    shastricVerdict = `Tripushkara Yoga ACTIVE (3x Multiplier): Bhadra Tithi on eligible Vara with 3-Pada star ${starName}. Significant occurrences tend to repeat thrice (Rule 343).`;
  } else if (hasDwipushkara) {
    shastricVerdict = `Dwipushkara Yoga ACTIVE (2x Multiplier): Bhadra Tithi on eligible Vara with 2-Pada star ${starName}. Significant occurrences tend to repeat twice (Rule 343).`;
  }

  return {
    hasTripushkara,
    hasDwipushkara,
    multiplier,
    tithiNumber,
    isBhadraTithi,
    weekday,
    nakshatraName: starName,
    shastricVerdict,
  };
}

// =========================================================================
// 9. VAISHESHIKAMSHA MULTI-VARGA DIGNITY LADDER (RULE 314)
// =========================================================================

export interface VaisheshikamshaRating {
  planet: PlanetName;
  dignityCount: number;
  tierName: string;
  statusLevel: string;
  shastricSignificance: string;
}

export function calculateVaisheshikamshaRatings(
  planets: PlanetPosition[],
  vargas: Record<VargaCode, VargaChart>
): Record<PlanetName, VaisheshikamshaRating> {
  const TIERS: Record<number, { tier: string; status: string }> = {
    2: { tier: 'Parijata', status: 'Respectable & Prosperous' },
    3: { tier: 'Uttama', status: 'Executive Leadership' },
    4: { tier: 'Gopura', status: 'Governor / Landed Authority' },
    5: { tier: 'Simhasana', status: 'Ministerial / Royal Stature' },
    6: { tier: 'Paravata', status: 'Global Renown & Legacy' },
    7: { tier: 'Devaloka', status: 'Extraordinary Sovereign' },
    8: { tier: 'Brahmaloka', status: 'Epochal Magnitude' },
    9: { tier: 'Sakravahana', status: 'Imperial Splendor' },
    10: { tier: 'Shridhama', status: 'Avatar / Sovereign Giant' },
  };

  const vargaCodes: VargaCode[] = ['D1', 'D2', 'D3', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

  const results: Partial<Record<PlanetName, VaisheshikamshaRating>> = {};

  for (const pl of planets) {
    let count = 0;
    for (const vc of vargaCodes) {
      const chart = vargas[vc];
      if (chart) {
        const vp = chart.planets.find((p) => p.planet === pl.name);
        if (vp && (vp.dignity === 'OWN_SIGN' || vp.dignity === 'EXALTED' || vp.dignity === 'MOOLATRIKONA')) {
          count++;
        }
      }
    }

    const c = Math.max(0, Math.min(16, count));
    const matched = TIERS[c] || (c > 10 ? TIERS[10] : { tier: 'Samanya', status: 'Standard Divisional Dignity' });

    results[pl.name] = {
      planet: pl.name,
      dignityCount: c,
      tierName: matched.tier,
      statusLevel: matched.status,
      shastricSignificance: `${matched.tier} Vaisheshikamsha (${c} Varga Dignities): ${matched.status} (Rule 314).`,
    };
  }

  return results as Record<PlanetName, VaisheshikamshaRating>;
}

// =========================================================================
// 10. AYURVEDIC TRIDOSHA & HEALTH DIAGNOSTICS
// =========================================================================

export interface AyurvedicTridoshaFacts {
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  dominantDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshic';
  vulnerabilities: string[];
  recommendation: string;
}

export function calculateAyurvedicTridoshaFacts(
  ascendant: AscendantInfo,
  planets: PlanetPosition[],
  houses: HouseInfo[]
): AyurvedicTridoshaFacts {
  let vata = 0;
  let pitta = 0;
  let kapha = 0;

  // Element scores for signs
  const DOSHA_ELEMENT: Record<number, 'fire' | 'earth' | 'air' | 'water'> = {
    0: 'fire', 1: 'earth', 2: 'air', 3: 'water',
    4: 'fire', 5: 'earth', 6: 'air', 7: 'water',
    8: 'fire', 9: 'earth', 10: 'air', 11: 'water',
  };

  // 1. Lagna sign contribution
  const lagnaElem = DOSHA_ELEMENT[ascendant.signIndex];
  if (lagnaElem === 'air') vata += 3;
  else if (lagnaElem === 'fire') pitta += 3;
  else if (lagnaElem === 'water') kapha += 3;
  else { vata += 1; kapha += 2; } // earth

  // 2. Planets nature: Sun/Mars/Ketu (Pitta), Moon/Venus/Jupiter (Kapha), Saturn/Rahu (Vata), Mercury (Tridoshic)
  for (const p of planets) {
    if (p.name === 'Sun' || p.name === 'Mars' || p.name === 'Ketu') pitta += 2;
    else if (p.name === 'Moon' || p.name === 'Venus' || p.name === 'Jupiter') kapha += 2;
    else if (p.name === 'Saturn' || p.name === 'Rahu') vata += 2;
    else if (p.name === 'Mercury') { vata += 1; pitta += 1; }
  }

  // 3. 6th house (Disease genesis)
  const h6 = houses.find((h) => h.houseNumber === 6);
  if (h6) {
    const h6Elem = DOSHA_ELEMENT[h6.signIndex];
    if (h6Elem === 'air') vata += 2;
    else if (h6Elem === 'fire') pitta += 2;
    else if (h6Elem === 'water') kapha += 2;
  }

  let dominant: AyurvedicTridoshaFacts['dominantDosha'] = 'Tridoshic';
  const max = Math.max(vata, pitta, kapha);
  if (vata === max && pitta < max && kapha < max) dominant = 'Vata';
  else if (pitta === max && vata < max && kapha < max) dominant = 'Pitta';
  else if (kapha === max && vata < max && pitta < max) dominant = 'Kapha';
  else if (vata === pitta && vata === max) dominant = 'Vata-Pitta';
  else if (pitta === kapha && pitta === max) dominant = 'Pitta-Kapha';
  else if (vata === kapha && vata === max) dominant = 'Vata-Kapha';

  const vulnerabilities: string[] = [];
  if (vata >= 8) vulnerabilities.push('Nervous system sensitivity, joints, and dry skin (Vata excess)');
  if (pitta >= 8) vulnerabilities.push('Digestive acid, inflammation, and heat sensitivity (Pitta excess)');
  if (kapha >= 8) vulnerabilities.push('Metabolic sluggishness, lymphatic retention, and congestion (Kapha excess)');

  return {
    vataScore: vata,
    pittaScore: pitta,
    kaphaScore: kapha,
    dominantDosha: dominant,
    vulnerabilities,
    recommendation: `Maintain a Dinacharya rhythm aligned to balance ${dominant}. Ensure mindful hydration and seasonal dietary pacing.`,
  };
}

// =========================================================================
// MASTER ORCHESTRATOR: SPECIAL POINTS FACTS
// =========================================================================

export interface SpecialPointsFacts {
  induLagna: InduLagnaFacts;
  yogiAvayogi: YogiAvayogiFacts;
  bhriguBindu: BhriguBinduFacts;
  fertilitySphutas: FertilitySphutasFacts;
  latta: PlanetaryLattaFacts;
  karmicNakshatras: Record<string, KarmicStarItem>;
  pushkaraSummary: {
    pushkaraNavamshaPlanets: string[];
    pushkaraBhagaPlanets: string[];
    gandantaPlanets: string[];
  };
  planetAnalyses: Record<PlanetName, PlanetPushkaraAnalysis>;
  tripushkaraYoga: TripushkaraFacts;
  vaisheshikamsha: Record<PlanetName, VaisheshikamshaRating>;
  ayurvedicTridosha: AyurvedicTridoshaFacts;
}

export function calculateAllSpecialPoints(
  ascendant: AscendantInfo,
  planets: PlanetPosition[],
  houses: HouseInfo[],
  vargas: Record<VargaCode, VargaChart>,
  tithiNumber: number = 1,
  weekdayNumber: number = 0
): SpecialPointsFacts {
  const sun = planets.find((p) => p.name === 'Sun')!;
  const moon = planets.find((p) => p.name === 'Moon')!;
  const mars = planets.find((p) => p.name === 'Mars')!;
  const venus = planets.find((p) => p.name === 'Venus')!;
  const jupiter = planets.find((p) => p.name === 'Jupiter')!;
  const rahu = planets.find((p) => p.name === 'Rahu')!;

  const induLagna = calculateInduLagnaFacts(ascendant.signIndex, moon, planets);
  const yogiAvayogi = calculateYogiAvayogiFacts(sun.siderealLongitude, moon.siderealLongitude);
  const bhriguBindu = calculateBhriguBinduFacts(moon.siderealLongitude, rahu.siderealLongitude, ascendant.signIndex);
  const fertilitySphutas = calculateFertilitySphutasFacts(
    sun.siderealLongitude,
    venus.siderealLongitude,
    jupiter.siderealLongitude,
    moon.siderealLongitude,
    mars.siderealLongitude,
    ascendant.signIndex
  );

  const moonNakIdx = Math.floor(moon.siderealLongitude / (360 / 27));
  const latta = calculatePlanetaryLattaFacts(planets, moonNakIdx);
  const karmicNakshatras = calculateSpecialKarmicNakshatrasFacts(moonNakIdx);

  const pushkaraNavamshaPlanets: string[] = [];
  const pushkaraBhagaPlanets: string[] = [];
  const gandantaPlanets: string[] = [];
  const planetAnalyses: Partial<Record<PlanetName, PlanetPushkaraAnalysis>> = {};

  for (const pl of planets) {
    const analysis = evaluatePushkaraAndGandanta(pl.siderealLongitude);
    planetAnalyses[pl.name] = {
      planet: pl.name,
      ...analysis,
    };
    if (analysis.isPushkaraNavamsha) pushkaraNavamshaPlanets.push(`${pl.name} (${analysis.pushkaraNavamshaSign} Navamsha)`);
    if (analysis.isPushkaraBhaga) pushkaraBhagaPlanets.push(`${pl.name} (Pushkara Bhaga ~${analysis.exactPushkaraDegree}°)`);
    if (analysis.isGandanta) gandantaPlanets.push(`${pl.name} in ${analysis.gandantaJunction}`);
  }

  const lagnaAnalysis = evaluatePushkaraAndGandanta(ascendant.siderealLongitude);
  if (lagnaAnalysis.isGandanta) gandantaPlanets.push(`Lagna in ${lagnaAnalysis.gandantaJunction}`);

  const tripushkaraYoga = calculateTripushkaraFacts(tithiNumber, weekdayNumber, moonNakIdx);
  const vaisheshikamsha = calculateVaisheshikamshaRatings(planets, vargas);
  const ayurvedicTridosha = calculateAyurvedicTridoshaFacts(ascendant, planets, houses);

  return {
    induLagna,
    yogiAvayogi,
    bhriguBindu,
    fertilitySphutas,
    latta,
    karmicNakshatras,
    pushkaraSummary: {
      pushkaraNavamshaPlanets,
      pushkaraBhagaPlanets,
      gandantaPlanets,
    },
    planetAnalyses: planetAnalyses as Record<PlanetName, PlanetPushkaraAnalysis>,
    tripushkaraYoga,
    vaisheshikamsha,
    ayurvedicTridosha,
  };
}
