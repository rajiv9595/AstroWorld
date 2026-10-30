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
 * 11. Kota Chakra 4-Concentric-Ring Fortress Grid & Siege Diagnostics (Rules 626–627)
 * 12. Lajjitadi Avasthas 6 Psychological States (Rule 404)
 * 13. Lal Kitab Special Tevas & 9 Pitri Rina Ancestral Debts (Rules 830–833)
 * 14. Nabhasa Yogas 32 Geometric Configurations (Rules 501–505)
 */

import { formatDMS, getNakshatraAndPada, normalizeDegrees } from './astronomy.ts';
import {
  EXALTATION_MAP,
  MOOLATRIKONA_MAP,
  NAISARGIKA_RELATIONSHIPS,
  NAKSHATRAS,
  SIGN_LORDS,
  ZODIAC_SIGNS,
} from './constants.ts';
import { getParashariAspectHouses } from './aspects.ts';
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
// 11. KOTA CHAKRA FORTRESS ENGINE (RULES 626–627)
// =========================================================================

export const KOTA_28_NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Abhijit', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

export interface KotaStarInfo {
  index28: number;
  name: string;
  distanceFromJanma: number; // 1 to 28
  ring: 'Stambha' | 'Madhya' | 'Prakara' | 'Bahya_Entry' | 'Bahya_Exit';
  occupants: PlanetName[];
}

export interface KotaChakraFacts {
  janmaNakshatraName: string;
  janmaNakshatra28Index: number;
  kotaSwami: PlanetName; // Moon sign lord
  kotaPaala: PlanetName; // Sun nakshatra lord
  stambhaStars: KotaStarInfo[];
  madhyaStars: KotaStarInfo[];
  prakaraStars: KotaStarInfo[];
  bahyaEntryStars: KotaStarInfo[];
  bahyaExitStars: KotaStarInfo[];
  stambhaOccupants: PlanetName[];
  madhyaOccupants: PlanetName[];
  prakaraOccupants: PlanetName[];
  bahyaEntryOccupants: PlanetName[];
  bahyaExitOccupants: PlanetName[];
  siegeState: 'FORTIFIED' | 'VULNERABLE' | 'SIEGE_ACTIVE' | 'RELIEVED';
  shastricSignificance: string;
}

export function get28NakshatraFromLongitude(deg: number): { index: number; name: string } {
  const norm = ((deg % 360) + 360) % 360;
  // Abhijit occupies 276°40' to 280°53'20" (276.66667° to 280.88889°)
  if (norm >= 276.666667 && norm < 280.888889) {
    return { index: 21, name: 'Abhijit' };
  }
  const idx27 = Math.floor(norm / (360 / 27));
  if (norm < 276.666667) {
    return { index: idx27, name: KOTA_28_NAKSHATRAS[idx27] };
  }
  const idx28 = Math.min(27, idx27 + 1);
  return { index: idx28, name: KOTA_28_NAKSHATRAS[idx28] };
}

export function calculateKotaChakraFacts(
  moonLong: number,
  moonSign: ZodiacSign,
  sunLong: number,
  planets: PlanetPosition[]
): KotaChakraFacts {
  const janmaStar = get28NakshatraFromLongitude(moonLong);
  const J = janmaStar.index;

  const kotaSwami = SIGN_LORDS[moonSign];
  const sun27Idx = Math.floor((((sunLong % 360) + 360) % 360) / (360 / 27));
  const KOTA_NAK_LORDS: PlanetName[] = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  ];
  const kotaPaala = KOTA_NAK_LORDS[sun27Idx] || 'Sun';

  const planetStarMap = new Map<number, PlanetName[]>();
  for (const pl of planets) {
    const s = get28NakshatraFromLongitude(pl.siderealLongitude);
    if (!planetStarMap.has(s.index)) planetStarMap.set(s.index, []);
    planetStarMap.get(s.index)!.push(pl.name);
  }

  const stambhaStars: KotaStarInfo[] = [];
  const madhyaStars: KotaStarInfo[] = [];
  const prakaraStars: KotaStarInfo[] = [];
  const bahyaEntryStars: KotaStarInfo[] = [];
  const bahyaExitStars: KotaStarInfo[] = [];

  const stambhaOccupants: PlanetName[] = [];
  const madhyaOccupants: PlanetName[] = [];
  const prakaraOccupants: PlanetName[] = [];
  const bahyaEntryOccupants: PlanetName[] = [];
  const bahyaExitOccupants: PlanetName[] = [];

  for (let sIdx = 0; sIdx < 28; sIdx++) {
    const dist = ((sIdx - J + 28) % 28) + 1;
    const occupants = planetStarMap.get(sIdx) || [];
    const starName = KOTA_28_NAKSHATRAS[sIdx];

    if (dist === 4 || dist === 11 || dist === 18 || dist === 25) {
      const item: KotaStarInfo = { index28: sIdx, name: starName, distanceFromJanma: dist, ring: 'Stambha', occupants };
      stambhaStars.push(item);
      stambhaOccupants.push(...occupants);
    } else if ([3, 5, 10, 12, 17, 19, 24, 26].includes(dist)) {
      const item: KotaStarInfo = { index28: sIdx, name: starName, distanceFromJanma: dist, ring: 'Madhya', occupants };
      madhyaStars.push(item);
      madhyaOccupants.push(...occupants);
    } else if ([2, 6, 9, 13, 16, 20, 23, 27].includes(dist)) {
      const item: KotaStarInfo = { index28: sIdx, name: starName, distanceFromJanma: dist, ring: 'Prakara', occupants };
      prakaraStars.push(item);
      prakaraOccupants.push(...occupants);
    } else if ([1, 8, 15, 22].includes(dist)) {
      const item: KotaStarInfo = { index28: sIdx, name: starName, distanceFromJanma: dist, ring: 'Bahya_Entry', occupants };
      bahyaEntryStars.push(item);
      bahyaEntryOccupants.push(...occupants);
    } else if ([7, 14, 21, 28].includes(dist)) {
      const item: KotaStarInfo = { index28: sIdx, name: starName, distanceFromJanma: dist, ring: 'Bahya_Exit', occupants };
      bahyaExitStars.push(item);
      bahyaExitOccupants.push(...occupants);
    }
  }

  const naturalMalefics: PlanetName[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const naturalBenefics: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

  const maleficsInStambha = stambhaOccupants.filter((p) => naturalMalefics.includes(p));
  const beneficsInStambha = stambhaOccupants.filter((p) => naturalBenefics.includes(p));
  const maleficsInEntry = bahyaEntryOccupants.filter((p) => naturalMalefics.includes(p));
  const maleficsInExit = bahyaExitOccupants.filter((p) => naturalMalefics.includes(p));
  const kotaSwamiInStambha = stambhaOccupants.includes(kotaSwami);

  let siegeState: 'FORTIFIED' | 'VULNERABLE' | 'SIEGE_ACTIVE' | 'RELIEVED' = 'FORTIFIED';
  let shastricSignificance = '';

  if (kotaSwamiInStambha || beneficsInStambha.includes('Jupiter')) {
    siegeState = 'FORTIFIED';
    shastricSignificance = `Citadel is sovereignly fortified: Kota Swami (${kotaSwami}) or Jupiter occupies Stambha (Central Pillar), granting supreme protection against siege (Rule 627).`;
  } else if (maleficsInStambha.length > 0 && beneficsInStambha.length === 0) {
    siegeState = 'SIEGE_ACTIVE';
    shastricSignificance = `Acute Citadel Siege: Malefics (${maleficsInStambha.join(', ')}) have breached into Stambha while benefics are absent from the citadel, triggering vulnerability to distress or sudden reversals (Rule 627).`;
  } else if (maleficsInEntry.length > 0) {
    siegeState = 'VULNERABLE';
    shastricSignificance = `Fortress Perimeter Vulnerable: Malefics (${maleficsInEntry.join(', ')}) occupy Bahya Corner Entry Stars (Kona), attempting to advance inward toward the Citadel (Rule 626).`;
  } else if (maleficsInExit.length > 0) {
    siegeState = 'RELIEVED';
    shastricSignificance = `Siege Relieved: Malefics (${maleficsInExit.join(', ')}) occupy Bahya Cardinal Exit Stars (Dwara), transiting outward away from the Fortress (Rule 627).`;
  } else {
    siegeState = 'FORTIFIED';
    shastricSignificance = `Defensive perimeter stable: Kota Swami is ${kotaSwami}, Kota Paala is ${kotaPaala}. No malefic breach detected in Stambha.`;
  }

  return {
    janmaNakshatraName: janmaStar.name,
    janmaNakshatra28Index: janmaStar.index,
    kotaSwami,
    kotaPaala,
    stambhaStars,
    madhyaStars,
    prakaraStars,
    bahyaEntryStars,
    bahyaExitStars,
    stambhaOccupants,
    madhyaOccupants,
    prakaraOccupants,
    bahyaEntryOccupants,
    bahyaExitOccupants,
    siegeState,
    shastricSignificance,
  };
}

// =========================================================================
// 12. LAJJITADI AVASTHAS ENGINE (RULE 404)
// =========================================================================

export type LajjitadiState =
  | 'Lajjita'     // Ashamed (in 5th house with malefic)
  | 'Garvita'     // Proud (Exalted or Moolatrikona)
  | 'Kshudhita'   // Starved (in enemy sign, conjoined/aspected by enemy or with Saturn)
  | 'Trushita'    // Thirsty (Watery sign, aspected by malefic, unaspected by benefic)
  | 'Mudita'      // Joyful (in friend sign, conjoined/aspected by friend, or with Jupiter)
  | 'Kshobhita';  // Agitated (Combust by Sun AND conjoined/aspected by malefic)

export interface LajjitadiAnalysis {
  planet: PlanetName;
  house: number;
  sign: ZodiacSign;
  activeStates: LajjitadiState[];
  isLajjita: boolean;
  isGarvita: boolean;
  isKshudhita: boolean;
  isTrushita: boolean;
  isMudita: boolean;
  isKshobhita: boolean;
  dominantState: LajjitadiState | 'Shanta';
  chittaImpact: string;
  shastricSignificance: string;
}

export function calculateLajjitadiFacts(
  planets: PlanetPosition[],
  houses: HouseInfo[],
  ascendantSignIndex: number
): Record<PlanetName, LajjitadiAnalysis> {
  const result: Partial<Record<PlanetName, LajjitadiAnalysis>> = {};
  const naturalMalefics: PlanetName[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const naturalBenefics: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

  const planetHouseMap = new Map<PlanetName, number>();
  const houseOccupantsMap = new Map<number, PlanetName[]>();
  for (let h = 1; h <= 12; h++) houseOccupantsMap.set(h, []);

  for (const pl of planets) {
    const h = ((pl.signIndex - ascendantSignIndex + 12) % 12) + 1;
    planetHouseMap.set(pl.name, h);
    houseOccupantsMap.get(h)!.push(pl.name);
  }

  const houseAspectsMap = new Map<number, PlanetName[]>();
  for (let h = 1; h <= 12; h++) houseAspectsMap.set(h, []);

  for (const pl of planets) {
    const fromHouse = planetHouseMap.get(pl.name) || 1;
    const aspectedHouses = getParashariAspectHouses(fromHouse, pl.name);
    for (const ah of aspectedHouses) {
      houseAspectsMap.get(ah)!.push(pl.name);
    }
  }

  const sun = planets.find((p) => p.name === 'Sun');

  for (const pl of planets) {
    const h = planetHouseMap.get(pl.name) || 1;
    const conjoined = (houseOccupantsMap.get(h) || []).filter((p) => p !== pl.name);
    const aspecting = houseAspectsMap.get(h) || [];

    const rels = NAISARGIKA_RELATIONSHIPS[pl.name] || { friends: [], enemies: [], neutrals: [] };
    const signLord = SIGN_LORDS[pl.sign];

    const activeStates: LajjitadiState[] = [];

    // 1. Lajjita (Ashamed): in 5th house conjoined with Rahu, Ketu, Sun, Saturn, Mars
    const hasMaleficConjunctOrAspectIn5th =
      h === 5 &&
      (conjoined.some((p) => naturalMalefics.includes(p)) ||
        aspecting.some((p) => p === 'Saturn' || p === 'Mars'));
    const isLajjita = hasMaleficConjunctOrAspectIn5th;
    if (isLajjita) activeStates.push('Lajjita');

    // 2. Garvita (Proud): Exaltation or Moolatrikona
    const isExalted = EXALTATION_MAP[pl.name]?.sign === pl.sign;
    const isMoola = MOOLATRIKONA_MAP[pl.name]?.sign === pl.sign;
    const isGarvita = isExalted || isMoola;
    if (isGarvita) activeStates.push('Garvita');

    // 3. Kshudhita (Starved): Enemy sign, conjoined with enemy, aspected by enemy, or conjoined with Saturn
    const inEnemySign = rels.enemies.includes(signLord);
    const conjoinedEnemy = conjoined.some((p) => rels.enemies.includes(p));
    const aspectedByEnemy = aspecting.some((p) => rels.enemies.includes(p));
    const conjoinedSaturn = pl.name !== 'Saturn' && conjoined.includes('Saturn');
    const isKshudhita = inEnemySign || conjoinedEnemy || aspectedByEnemy || conjoinedSaturn;
    if (isKshudhita) activeStates.push('Kshudhita');

    // 4. Trushita (Thirsty): In Watery sign (Cancer 3, Scorpio 7, Pisces 11), aspected by malefic/enemy, unaspected by benefic
    const isWaterySign = pl.signIndex === 3 || pl.signIndex === 7 || pl.signIndex === 11;
    const aspectedByMalefic = aspecting.some((p) => naturalMalefics.includes(p) || rels.enemies.includes(p));
    const aspectedByBenefic = aspecting.some((p) => naturalBenefics.includes(p));
    const isTrushita = isWaterySign && aspectedByMalefic && !aspectedByBenefic;
    if (isTrushita) activeStates.push('Trushita');

    // 5. Mudita (Joyful): Friend's sign, conjoined/aspected by Friend, or conjoined with Jupiter
    const inFriendSign = rels.friends.includes(signLord);
    const conjoinedFriend = conjoined.some((p) => rels.friends.includes(p));
    const aspectedByFriend = aspecting.some((p) => rels.friends.includes(p));
    const conjoinedJupiter = pl.name !== 'Jupiter' && conjoined.includes('Jupiter');
    const isMudita = inFriendSign || conjoinedFriend || aspectedByFriend || conjoinedJupiter;
    if (isMudita) activeStates.push('Mudita');

    // 6. Kshobhita (Agitated): Conjoined with Sun (within 8°) AND simultaneously aspected by or conjoined with a malefic/enemy
    let isCombustSun = false;
    if (sun && pl.name !== 'Sun') {
      const distToSun = Math.abs(pl.siderealLongitude - sun.siderealLongitude);
      const shortestDist = Math.min(distToSun, 360 - distToSun);
      isCombustSun = shortestDist <= 8.0;
    }
    const isKshobhita = isCombustSun && (conjoined.some((p) => naturalMalefics.includes(p) && p !== 'Sun') || aspectedByMalefic);
    if (isKshobhita) activeStates.push('Kshobhita');

    let dominantState: LajjitadiState | 'Shanta' = 'Shanta';
    if (activeStates.includes('Garvita')) dominantState = 'Garvita';
    else if (activeStates.includes('Mudita')) dominantState = 'Mudita';
    else if (activeStates.includes('Lajjita')) dominantState = 'Lajjita';
    else if (activeStates.includes('Kshobhita')) dominantState = 'Kshobhita';
    else if (activeStates.includes('Kshudhita')) dominantState = 'Kshudhita';
    else if (activeStates.includes('Trushita')) dominantState = 'Trushita';

    let chittaImpact = '';
    if (isLajjita) chittaImpact = 'Impostor syndrome and acute self-criticism in intellectual/creative pursuits (Rule 404).';
    else if (isGarvita) chittaImpact = 'Radiant creative confidence, regal dignity, and administrative authority.';
    else if (isMudita) chittaImpact = 'Joyful mental equilibrium, effortless social protection, and intellectual grace.';
    else if (isKshudhita) chittaImpact = 'Yearning hunger for unfulfilled house significations; perceived deficiency.';
    else if (isTrushita) chittaImpact = 'Restless emotional thirst, addictive inclinations, or unquenchable attachments.';
    else if (isKshobhita) chittaImpact = 'Nervous agitation, sudden volatility, or acute crisis during Antardasha.';
    else chittaImpact = 'Balanced, steady psychological state (Shanta).';

    result[pl.name] = {
      planet: pl.name,
      house: h,
      sign: pl.sign,
      activeStates,
      isLajjita,
      isGarvita,
      isKshudhita,
      isTrushita,
      isMudita,
      isKshobhita,
      dominantState,
      chittaImpact,
      shastricSignificance: `${pl.name} displays ${activeStates.join(', ') || 'Shanta'} Avastha in House ${h} (${pl.sign}). ${chittaImpact}`,
    };
  }

  return result as Record<PlanetName, LajjitadiAnalysis>;
}

// =========================================================================
// 13. LAL KITAB SPECIAL TEVAS & ANCESTRAL DEBTS (RULES 830–833)
// =========================================================================

export interface LalKitabDebtItem {
  debtType: string;
  deityPlanet: PlanetName;
  conditionDescription: string;
  isActive: boolean;
  symptoms: string;
  classicalRemedy: string;
}

export interface LalKitabTevaFacts {
  isAndhaTeva: boolean;
  andhaTevaReasons: string[];
  isAdhAndhaTeva: boolean;
  adhAndhaTevaReasons: string[];
  isNabaligTeva: boolean;
  nabaligTevaReasons: string[];
  ancestralDebts: LalKitabDebtItem[];
  activeDebtsCount: number;
  overallClassification: string;
  remedialDirectives: string[];
}

export function calculateLalKitabTevasFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number
): LalKitabTevaFacts {
  const housePlanets = new Map<number, PlanetName[]>();
  for (let h = 1; h <= 12; h++) housePlanets.set(h, []);

  for (const pl of planets) {
    const h = ((pl.signIndex - ascendantSignIndex + 12) % 12) + 1;
    housePlanets.get(h)!.push(pl.name);
  }

  const p10 = housePlanets.get(10) || [];
  const p4 = housePlanets.get(4) || [];
  const p7 = housePlanets.get(7) || [];
  const p1 = housePlanets.get(1) || [];
  const p8 = housePlanets.get(8) || [];

  // 1. Andha Teva (Rule 830)
  const andhaTevaReasons: string[] = [];
  const mutualEnemiesIn10: [PlanetName, PlanetName][] = [
    ['Sun', 'Saturn'], ['Sun', 'Venus'], ['Sun', 'Rahu'], ['Sun', 'Ketu'],
    ['Mars', 'Mercury'], ['Moon', 'Rahu'], ['Moon', 'Ketu'], ['Saturn', 'Mars']
  ];
  for (const [pA, pB] of mutualEnemiesIn10) {
    if (p10.includes(pA) && p10.includes(pB)) {
      andhaTevaReasons.push(`Mutual enemies ${pA} and ${pB} occupy 10th House simultaneously`);
    }
  }
  if (p4.includes('Saturn') && p10.length > 0) {
    andhaTevaReasons.push(`Saturn occupies 4th House while 10th House is populated (${p10.join(', ')})`);
  }
  const isAndhaTeva = andhaTevaReasons.length > 0;

  // 2. Adh-Andha Teva (Rule 831)
  const adhAndhaTevaReasons: string[] = [];
  if (p4.includes('Sun') && p7.includes('Saturn')) {
    adhAndhaTevaReasons.push('Sun occupies 4th House and Saturn occupies 7th House simultaneously (Rule 831)');
  }
  const isAdhAndhaTeva = adhAndhaTevaReasons.length > 0;

  // 3. Nabalig Teva (Rule 832)
  const nabaligTevaReasons: string[] = [];
  const p1or8HasHazard = p1.some((p) => ['Mars', 'Mercury', 'Rahu', 'Ketu'].includes(p)) ||
                         p8.some((p) => ['Mars', 'Mercury', 'Rahu', 'Ketu'].includes(p));
  const kendras = [1, 4, 7, 10];
  const kendraOccupants = kendras.flatMap((h) => housePlanets.get(h) || []);
  const jupiterOrMoonInKendra = kendraOccupants.includes('Jupiter') || kendraOccupants.includes('Moon');

  if (p1or8HasHazard && !jupiterOrMoonInKendra) {
    nabaligTevaReasons.push('Mars/Mercury/Rahu/Ketu occupies 1st or 8th House while Jupiter and Moon are absent from all Kendras (Rule 832)');
  }
  const isNabaligTeva = nabaligTevaReasons.length > 0;

  // 4. Nine Ancestral Debts (Pitri Rinas - Rule 833)
  const ancestralDebts: LalKitabDebtItem[] = [];

  const checkPlacement = (houses: number[], validPlanets: PlanetName[]): boolean => {
    return houses.some((h) => (housePlanets.get(h) || []).some((p) => validPlanets.includes(p)));
  };

  // 1. Pitri Rina (Forefathers - Jupiter)
  const d1 = checkPlacement([2, 5, 9, 12], ['Venus', 'Saturn', 'Rahu', 'Ketu']);
  ancestralDebts.push({
    debtType: 'Pitri Rina (Forefathers\' Debt)',
    deityPlanet: 'Jupiter',
    conditionDescription: 'Venus, Saturn, Rahu, or Ketu in 2nd, 5th, 9th, or 12th House',
    isActive: d1,
    symptoms: 'Loss of ancestral reputation, unprovoked defamation in elderhood, peepal tree destruction.',
    classicalRemedy: 'Collect equal amounts of yellow coins/gold from all family members and donate to a shrine or school.',
  });

  // 2. Swa Rina (Self Debt - Sun)
  const d2 = checkPlacement([5], ['Venus', 'Saturn', 'Rahu', 'Ketu']);
  ancestralDebts.push({
    debtType: 'Swa Rina (Self Debt)',
    deityPlanet: 'Sun',
    conditionDescription: 'Venus, Saturn, Rahu, or Ketu in 5th House',
    isActive: d2,
    symptoms: 'Government/tax harassment, chronic cardiac/ocular strain, roof damage in ancestral house.',
    classicalRemedy: 'Perform Sun Yajna with family contribution; provide pure copper donations to artisans.',
  });

  // 3. Matri Rina (Mother's Debt - Moon)
  const d3 = checkPlacement([4], ['Ketu']);
  ancestralDebts.push({
    debtType: 'Matri Rina (Mother\'s Debt)',
    deityPlanet: 'Moon',
    conditionDescription: 'Ketu in 4th House',
    isActive: d3,
    symptoms: 'Restless mental anguish, loss of domestic real estate, contaminated water nearby.',
    classicalRemedy: 'Collect pure silver from all family bloodlines and immerse in running river water.',
  });

  // 4. Stri / Kanya Rina (Sister / Daughter Debt - Mercury)
  const d4 = checkPlacement([3, 6], ['Moon']);
  ancestralDebts.push({
    debtType: 'Stri / Kanya Rina (Sister & Daughter Debt)',
    deityPlanet: 'Mercury',
    conditionDescription: 'Moon in 3rd or 6th House',
    isActive: d4,
    symptoms: 'Commercial litigation, nervous anxiety, speech impediments in family lineage.',
    classicalRemedy: 'Collect yellow cowrie shells from all family members and burn to ash in river water.',
  });

  // 5. Jati Rina (Father / Clan Debt - Mars)
  const d5 = checkPlacement([1, 8], ['Mercury', 'Ketu']);
  ancestralDebts.push({
    debtType: 'Jati Rina (Clan / Brother Debt)',
    deityPlanet: 'Mars',
    conditionDescription: 'Mercury or Ketu in 1st or 8th House',
    isActive: d5,
    symptoms: 'Blood disorders, fraternal betrayal, unexpected disputes over ancestral patrimony.',
    classicalRemedy: 'Feed pure sweetened bread (sweet rotis) baked on charcoal to street dogs or crows.',
  });

  // 6. Aurat Rina (Female / Spouse Debt - Venus)
  const d6 = checkPlacement([2, 7], ['Sun', 'Moon', 'Rahu']);
  ancestralDebts.push({
    debtType: 'Aurat Rina (Wife / Partner Debt)',
    deityPlanet: 'Venus',
    conditionDescription: 'Sun, Moon, or Rahu in 2nd or 7th House',
    isActive: d6,
    symptoms: 'Marital friction, sudden financial drain through partnerships, reproductive strain.',
    classicalRemedy: 'Feed 100 cows with green fodder or donate silk fabrics collectively from family.',
  });

  // 7. Zalim Rina (Cruelty Debt - Saturn)
  const d7 = checkPlacement([10, 11], ['Sun', 'Moon', 'Mars']);
  ancestralDebts.push({
    debtType: 'Zalim Rina (Cruelty / Worker Debt)',
    deityPlanet: 'Saturn',
    conditionDescription: 'Sun, Moon, or Mars in 10th or 11th House',
    isActive: d7,
    symptoms: 'Chronic spine/joint pain, labor strikes, factory equipment fires, structural building flaws.',
    classicalRemedy: 'Feed 10 visually impaired persons; provide mustard oil and footwear to laborers.',
  });

  // 8. Ajat Rina (In-Laws Debt - Rahu)
  const d8 = checkPlacement([12], ['Sun', 'Mars', 'Moon']);
  ancestralDebts.push({
    debtType: 'Ajat Rina (In-Laws & Unborn Debt)',
    deityPlanet: 'Rahu',
    conditionDescription: 'Sun, Mars, or Moon in 12th House',
    isActive: d8,
    symptoms: 'Insomnia, sudden audit surprises, strain with in-laws, subterranean water leaks.',
    classicalRemedy: 'Collect coconuts from all family members and float into flowing natural water.',
  });

  // 9. Daivi Rina (Divine Debt - Ketu)
  const d9 = checkPlacement([6], ['Moon', 'Mars']);
  ancestralDebts.push({
    debtType: 'Daivi Rina (Divine & Offspring Debt)',
    deityPlanet: 'Ketu',
    conditionDescription: 'Moon or Mars in 6th House',
    isActive: d9,
    symptoms: 'Disruption in family lineage, distress to sons, urinary or spinal complaints.',
    classicalRemedy: 'Provide bananas to street dogs and assist orphan boys with educational supplies.',
  });

  const activeDebtsCount = ancestralDebts.filter((d) => d.isActive).length;
  const remedialDirectives: string[] = [];

  if (isAndhaTeva) {
    remedialDirectives.push('Lal Kitab Andha Teva active: Never hold business assets exclusively in personal name. Feed visually challenged individuals.');
  }
  if (isAdhAndhaTeva) {
    remedialDirectives.push('Lal Kitab Adh-Andha Teva active: Exercise rigorous transparency in spousal finance and domestic real estate after age 36.');
  }
  if (isNabaligTeva) {
    remedialDirectives.push('Lal Kitab Nabalig Teva active: Avoid speculative high-stakes commitments until maturity age of the 1st-house occupant.');
  }

  let overallClassification = 'Normal Functional Horoscope';
  if (isAndhaTeva && isAdhAndhaTeva) overallClassification = 'Compound Blind / Half-Blind Horoscope';
  else if (isAndhaTeva) overallClassification = 'Andha Teva (Blind Horoscope - Rule 830)';
  else if (isAdhAndhaTeva) overallClassification = 'Adh-Andha Teva (Half-Blind Horoscope - Rule 831)';
  else if (isNabaligTeva) overallClassification = 'Nabalig Teva (Minor/Immature Horoscope - Rule 832)';

  return {
    isAndhaTeva,
    andhaTevaReasons,
    isAdhAndhaTeva,
    adhAndhaTevaReasons,
    isNabaligTeva,
    nabaligTevaReasons,
    ancestralDebts,
    activeDebtsCount,
    overallClassification,
    remedialDirectives,
  };
}

// =========================================================================
// 14. NABHASA YOGAS ENGINE (RULES 501–505)
// =========================================================================

export interface NabhasaYogaFacts {
  activeAshrayaYoga?: {
    name: 'Rajju Yoga' | 'Musala Yoga' | 'Nala Yoga';
    modality: 'Movable' | 'Fixed' | 'Dual';
    planetCount: number;
    shastricSignificance: string;
  };
  activeDalaYoga?: {
    name: 'Mala Yoga' | 'Bhujanga / Sarpa Yoga';
    type: 'Benefics in Kendras' | 'Malefics in Kendras';
    kendraPlanets: PlanetName[];
    shastricSignificance: string;
  };
  activeAkritiYogas: {
    name: string;
    housesInvolved: number[];
    shastricSignificance: string;
  }[];
  allYogasFound: string[];
}

export function calculateNabhasaYogasFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number
): NabhasaYogaFacts {
  const visiblePlanets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const visPls = planets.filter((p) => visiblePlanets.includes(p.name));

  let movableCount = 0;
  let fixedCount = 0;
  let dualCount = 0;

  const planetHouses: { planet: PlanetName; house: number }[] = [];
  const occupiedHousesSet = new Set<number>();

  for (const pl of visPls) {
    const s = pl.signIndex;
    if (s === 0 || s === 3 || s === 6 || s === 9) movableCount++;
    else if (s === 1 || s === 4 || s === 7 || s === 10) fixedCount++;
    else dualCount++;

    const h = ((pl.signIndex - ascendantSignIndex + 12) % 12) + 1;
    planetHouses.push({ planet: pl.name, house: h });
    occupiedHousesSet.add(h);
  }

  // 1. Ashraya Yogas (Rule 501)
  let activeAshrayaYoga: NabhasaYogaFacts['activeAshrayaYoga'];
  if (movableCount >= 5) {
    activeAshrayaYoga = {
      name: 'Rajju Yoga',
      modality: 'Movable',
      planetCount: movableCount,
      shastricSignificance: 'Rajju Ashraya Yoga: Vast foreign travel, ambitious enterprise, restless pursuit of new horizons away from birthplace (Rule 501).',
    };
  } else if (fixedCount >= 5) {
    activeAshrayaYoga = {
      name: 'Musala Yoga',
      modality: 'Fixed',
      planetCount: fixedCount,
      shastricSignificance: 'Musala Ashraya Yoga: Enduring institutional standing, resolute character, permanent real estate, and stable wealth (Rule 501).',
    };
  } else if (dualCount >= 5) {
    activeAshrayaYoga = {
      name: 'Nala Yoga',
      modality: 'Dual',
      planetCount: dualCount,
      shastricSignificance: 'Nala Ashraya Yoga: Dual income streams, diplomatic versatility, high analytical intellect, and adaptable fortune (Rule 501).',
    };
  }

  // 2. Dala Yogas (Rule 502)
  let activeDalaYoga: NabhasaYogaFacts['activeDalaYoga'];
  const kendraOccupants = planetHouses.filter((ph) => [1, 4, 7, 10].includes(ph.house)).map((ph) => ph.planet);
  const naturalBenefics: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const naturalMalefics: PlanetName[] = ['Sun', 'Mars', 'Saturn'];

  const beneficsInKendra = kendraOccupants.filter((p) => naturalBenefics.includes(p));
  const maleficsInKendra = kendraOccupants.filter((p) => naturalMalefics.includes(p));

  if (beneficsInKendra.length > 0 && maleficsInKendra.length === 0) {
    activeDalaYoga = {
      name: 'Mala Yoga',
      type: 'Benefics in Kendras',
      kendraPlanets: beneficsInKendra,
      shastricSignificance: 'Mala (Srik) Dala Yoga: Lifelong material abundance, vehicular comfort, high social standing, and immunity from catastrophic ruin (Rule 502).',
    };
  } else if (maleficsInKendra.length > 0 && beneficsInKendra.length === 0) {
    activeDalaYoga = {
      name: 'Bhujanga / Sarpa Yoga',
      type: 'Malefics in Kendras',
      kendraPlanets: maleficsInKendra,
      shastricSignificance: 'Bhujanga (Sarpa) Dala Yoga: Chronic karmic struggle, strenuous physical or financial burden; requires Viparita Raja Yoga mitigation (Rule 502).',
    };
  }

  // 3. Akriti Yogas (Rule 503)
  const activeAkritiYogas: NabhasaYogaFacts['activeAkritiYogas'] = [];
  const distinctHouses = Array.from(occupiedHousesSet);

  const gadaPairs = [[1, 4], [4, 7], [7, 10], [10, 1]];
  for (const pair of gadaPairs) {
    if (distinctHouses.length <= 2 && distinctHouses.every((h) => pair.includes(h))) {
      activeAkritiYogas.push({
        name: 'Gada Yoga',
        housesInvolved: pair,
        shastricSignificance: `Gada Akriti Yoga: All visible planets confined to adjacent Kendras ${pair.join('-')}, conferring ritual mastery, wealth accumulation, and deep single-pointed focus (Rule 503).`,
      });
    }
  }

  if (distinctHouses.length <= 2 && distinctHouses.every((h) => h === 1 || h === 7)) {
    activeAkritiYogas.push({
      name: 'Sakata Akriti Yoga',
      housesInvolved: [1, 7],
      shastricSignificance: 'Sakata Akriti Yoga: Planets restricted strictly to 1st and 7th houses, causing hard laboring life and heavy loads (Rule 503).',
    });
  }

  if (distinctHouses.length <= 2 && distinctHouses.every((h) => h === 4 || h === 10)) {
    activeAkritiYogas.push({
      name: 'Vihaga (Pakshi) Akriti Yoga',
      housesInvolved: [4, 10],
      shastricSignificance: 'Vihaga Akriti Yoga: Planets restricted strictly to 4th and 10th houses, producing a wanderer, courier, or restless professional (Rule 503).',
    });
  }

  if (distinctHouses.every((h) => h === 1 || h === 5 || h === 9)) {
    activeAkritiYogas.push({
      name: 'Shringataka Akriti Yoga',
      housesInvolved: [1, 5, 9],
      shastricSignificance: 'Shringataka Akriti Yoga: Planets exclusively in Dharma Trikona (1-5-9), granting supreme fortune in second half of life and executive command (Rule 503).',
    });
  }

  const trines = [
    { name: 'Artha Trine Hala Yoga', trine: [2, 6, 10] },
    { name: 'Kama Trine Hala Yoga', trine: [3, 7, 11] },
    { name: 'Moksha Trine Hala Yoga', trine: [4, 8, 12] },
  ];
  for (const t of trines) {
    if (distinctHouses.every((h) => t.trine.includes(h))) {
      activeAkritiYogas.push({
        name: t.name,
        housesInvolved: t.trine,
        shastricSignificance: `Hala Akriti Yoga: Confined to ${t.trine.join('-')} trine, creating agricultural, engineering, or service-sector wealth through sustained industry (Rule 503).`,
      });
    }
  }

  const allYogasFound: string[] = [];
  if (activeAshrayaYoga) allYogasFound.push(activeAshrayaYoga.name);
  if (activeDalaYoga) allYogasFound.push(activeDalaYoga.name);
  for (const ay of activeAkritiYogas) allYogasFound.push(ay.name);

  return {
    activeAshrayaYoga,
    activeDalaYoga,
    activeAkritiYogas,
    allYogasFound,
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
  kotaChakra: KotaChakraFacts;
  lajjitadiAvasthas: Record<PlanetName, LajjitadiAnalysis>;
  lalKitabTevas: LalKitabTevaFacts;
  nabhasaYogas: NabhasaYogaFacts;
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

  const kotaChakra = calculateKotaChakraFacts(moon.siderealLongitude, moon.sign, sun.siderealLongitude, planets);
  const lajjitadiAvasthas = calculateLajjitadiFacts(planets, houses, ascendant.signIndex);
  const lalKitabTevas = calculateLalKitabTevasFacts(planets, ascendant.signIndex);
  const nabhasaYogas = calculateNabhasaYogasFacts(planets, ascendant.signIndex);

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
    kotaChakra,
    lajjitadiAvasthas,
    lalKitabTevas,
    nabhasaYogas,
  };
}
