/**
 * ASTROWORLD — Research Mathematical Calculators & Classical Diagnostic Engine
 * 
 * Implements deterministic astronomical calculations from the Research Corpus:
 * 1. Bhrigu Bindu (Rule 4)
 * 2. Yogi & Avayogi Points of Fortune & Obstruction (Rule 5)
 * 3. Indu Lagna Kalas Wealth Matrix (Rule 67)
 * 4. Bhrigu Nadi Directional Trines & Degree Ordering (Rules 101–104, 161, 162)
 * 5. Medical Tridosha & Health Diagnostics (Rules 46–54)
 */

import { ZodiacSign, PlanetName } from '../../../../shared/engine/types.ts';

const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_LORDS: Record<ZodiacSign, PlanetName> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const NAKSHATRA_LORDS: PlanetName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', // 1-9
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', // 10-18
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', // 19-27
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Kalas according to Brihat Jataka & Jataka Parijata for Indu Lagna
const PLANETARY_KALAS: Record<string, number> = {
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

function normalize360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function getNakshatraInfo(longitude: number) {
  const norm = normalize360(longitude);
  const nakIdx = Math.floor(norm / (360 / 27));
  const lord = NAKSHATRA_LORDS[nakIdx] || 'Mercury';
  const name = NAKSHATRA_NAMES[nakIdx] || 'Ashwini';
  const pada = Math.floor((norm % (360 / 27)) / (360 / 108)) + 1;
  return { nakshatraIndex: nakIdx, nakshatraName: name, nakshatraLord: lord, pada };
}

function getSignInfo(longitude: number) {
  const norm = normalize360(longitude);
  const signIdx = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[signIdx];
  const degreeInSign = norm % 30;
  return { sign, signIndex: signIdx, degreeInSign, signLord: SIGN_LORDS[sign] };
}

// =========================================================================
// 1. BHRIGU BINDU (RULE 4)
// =========================================================================
export interface BhriguBinduResult {
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  formattedDegree: string;
  nakshatra: string;
  nakshatraLord: PlanetName;
  houseFromLagna: number;
  shastricSignificance: string;
}

export function calculateBhriguBindu(moonLon: number, rahuLon: number, lagnaLon: number): BhriguBinduResult {
  // Measured forward from Rahu to Moon
  const arcRahuToMoon = normalize360(moonLon - rahuLon);
  const bbLon = normalize360(rahuLon + arcRahuToMoon / 2);

  const signInfo = getSignInfo(bbLon);
  const nakInfo = getNakshatraInfo(bbLon);
  const lagnaSignInfo = getSignInfo(lagnaLon);
  const houseFromLagna = ((signInfo.signIndex - lagnaSignInfo.signIndex + 12) % 12) + 1;

  const degInt = Math.floor(signInfo.degreeInSign);
  const minInt = Math.floor((signInfo.degreeInSign - degInt) * 60);

  return {
    longitude: bbLon,
    sign: signInfo.sign,
    degreeInSign: signInfo.degreeInSign,
    formattedDegree: `${degInt}° ${minInt.toString().padStart(2, '0')}' ${signInfo.sign}`,
    nakshatra: nakInfo.nakshatraName,
    nakshatraLord: nakInfo.nakshatraLord,
    houseFromLagna,
    shastricSignificance: `Bhrigu Bindu sits in House ${houseFromLagna} (${signInfo.sign}, Nakshatra: ${nakInfo.nakshatraName} governed by ${nakInfo.nakshatraLord}). When slow-moving transits of Jupiter or Saturn cross this point, major fated milestones occur.`,
  };
}

// =========================================================================
// 2. YOGI & AVAYOGI POINTS (RULE 5)
// =========================================================================
export interface YogiAvayogiResult {
  yogiLongitude: number;
  yogiSign: ZodiacSign;
  yogiNakshatra: string;
  yogiPlanet: PlanetName;
  sahayogiPlanet: PlanetName;
  avayogiLongitude: number;
  avayogiSign: ZodiacSign;
  avayogiNakshatra: string;
  avayogiPlanet: PlanetName;
  shastricVerdict: string;
}

export function calculateYogiAvayogi(sunLon: number, moonLon: number): YogiAvayogiResult {
  // Yogi Point = Sun + Moon + 93°20' (93.333333°)
  const yogiLon = normalize360(sunLon + moonLon + 93.333333);
  const yogiSignInfo = getSignInfo(yogiLon);
  const yogiNakInfo = getNakshatraInfo(yogiLon);

  const yogiPlanet = yogiNakInfo.nakshatraLord;
  const sahayogiPlanet = yogiSignInfo.signLord;

  // Avayogi Point = Yogi Point + 186°40' (186.666667°)
  const avayogiLon = normalize360(yogiLon + 186.666667);
  const avayogiSignInfo = getSignInfo(avayogiLon);
  const avayogiNakInfo = getNakshatraInfo(avayogiLon);
  const avayogiPlanet = avayogiNakInfo.nakshatraLord;

  return {
    yogiLongitude: yogiLon,
    yogiSign: yogiSignInfo.sign,
    yogiNakshatra: yogiNakInfo.nakshatraName,
    yogiPlanet,
    sahayogiPlanet,
    avayogiLongitude: avayogiLon,
    avayogiSign: avayogiSignInfo.sign,
    avayogiNakshatra: avayogiNakInfo.nakshatraName,
    avayogiPlanet,
    shastricVerdict: `Yogi Planet is ${yogiPlanet} (Sahayogi: ${sahayogiPlanet}), acting as an effortless wealth and fortune magnet. Avayogi Planet is ${avayogiPlanet}, which can cause obstruction or financial leakages when operating without benefic aspect.`,
  };
}

// =========================================================================
// 3. INDU LAGNA WEALTH MATRIX (RULE 67)
// =========================================================================
export interface InduLagnaResult {
  induSign: ZodiacSign;
  induSignIndex: number;
  houseFromLagna: number;
  planetsInInduLagna: string[];
  wealthTier: 'Billionaire / Sovereign Abundance' | 'Multi-Millionaire Enterprise' | 'Disciplined High Net Worth' | 'Liquid Volatility';
  totalKalas: number;
  shastricVerdict: string;
}

export function calculateInduLagna(
  lagnaSign: ZodiacSign,
  moonSign: ZodiacSign,
  planets: Array<{ name: string; sign: ZodiacSign }>
): InduLagnaResult {
  const lagnaIdx = ZODIAC_SIGNS.indexOf(lagnaSign);
  const moonIdx = ZODIAC_SIGNS.indexOf(moonSign);

  // 9th house from Lagna
  const ninthFromLagnaSign = ZODIAC_SIGNS[(lagnaIdx + 8) % 12];
  const ninthFromLagnaLord = SIGN_LORDS[ninthFromLagnaSign];

  // 9th house from Moon
  const ninthFromMoonSign = ZODIAC_SIGNS[(moonIdx + 8) % 12];
  const ninthFromMoonLord = SIGN_LORDS[ninthFromMoonSign];

  const kala1 = PLANETARY_KALAS[ninthFromLagnaLord] || 1;
  const kala2 = PLANETARY_KALAS[ninthFromMoonLord] || 1;
  const totalKalas = kala1 + kala2;

  let remainder = totalKalas % 12;
  if (remainder === 0) remainder = 12;

  // Count remainder from Moon sign
  const induSignIdx = (moonIdx + remainder - 1) % 12;
  const induSign = ZODIAC_SIGNS[induSignIdx];
  const houseFromLagna = ((induSignIdx - lagnaIdx + 12) % 12) + 1;

  const planetsHere = planets.filter((p) => p.sign === induSign).map((p) => p.name);

  const hasExaltedOrBenefic = planetsHere.some((p) => ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(p));
  const hasStrongMalefic = planetsHere.some((p) => ['Mars', 'Saturn', 'Sun', 'Rahu'].includes(p));

  let wealthTier: InduLagnaResult['wealthTier'] = 'Disciplined High Net Worth';
  if (hasExaltedOrBenefic && planetsHere.length >= 2) {
    wealthTier = 'Billionaire / Sovereign Abundance';
  } else if (hasExaltedOrBenefic || (hasStrongMalefic && planetsHere.includes('Saturn'))) {
    wealthTier = 'Multi-Millionaire Enterprise';
  } else if (planetsHere.length === 0) {
    wealthTier = 'Disciplined High Net Worth';
  }

  return {
    induSign,
    induSignIndex: induSignIdx,
    houseFromLagna,
    planetsInInduLagna: planetsHere,
    wealthTier,
    totalKalas,
    shastricVerdict: `Indu Lagna falls in ${induSign} (House ${houseFromLagna} from Lagna) with total Kalas of ${totalKalas} (9th lord ${ninthFromLagnaLord}: ${kala1} Kalas + 9th from Moon ${ninthFromMoonLord}: ${kala2} Kalas). Wealth Tier: ${wealthTier}${planetsHere.length > 0 ? ` with ${planetsHere.join(', ')} occupying the wealth seat.` : '.'}`,
  };
}

// =========================================================================
// 4. BHRIGU NADI DIRECTIONAL TRINES & DEGREE ORDERING (RULES 101–104, 161)
// =========================================================================
export type DirectionalElement = 'East_Fire' | 'South_Earth' | 'West_Air' | 'North_Water';

export interface NadiTrineAlignment {
  element: DirectionalElement;
  signs: ZodiacSign[];
  planets: Array<{
    name: string;
    sign: ZodiacSign;
    degreeInSign: number;
    formattedDegree: string;
  }>;
  detectedCombinations: string[];
}

export function calculateBhriguNadiTrines(
  planets: Array<{ name: string; sign: ZodiacSign; degreeInSign: number }>
): Record<DirectionalElement, NadiTrineAlignment> {
  const TRINES: Record<DirectionalElement, ZodiacSign[]> = {
    East_Fire: ['Aries', 'Leo', 'Sagittarius'],
    South_Earth: ['Taurus', 'Virgo', 'Capricorn'],
    West_Air: ['Gemini', 'Libra', 'Aquarius'],
    North_Water: ['Cancer', 'Scorpio', 'Pisces'],
  };

  const results: Record<DirectionalElement, NadiTrineAlignment> = {
    East_Fire: { element: 'East_Fire', signs: TRINES.East_Fire, planets: [], detectedCombinations: [] },
    South_Earth: { element: 'South_Earth', signs: TRINES.South_Earth, planets: [], detectedCombinations: [] },
    West_Air: { element: 'West_Air', signs: TRINES.West_Air, planets: [], detectedCombinations: [] },
    North_Water: { element: 'North_Water', signs: TRINES.North_Water, planets: [], detectedCombinations: [] },
  };

  for (const p of planets) {
    for (const [elem, signs] of Object.entries(TRINES) as Array<[DirectionalElement, ZodiacSign[]]>) {
      if (signs.includes(p.sign)) {
        const degInt = Math.floor(p.degreeInSign);
        const minInt = Math.floor((p.degreeInSign - degInt) * 60);
        results[elem].planets.push({
          name: p.name,
          sign: p.sign,
          degreeInSign: p.degreeInSign,
          formattedDegree: `${degInt}° ${minInt.toString().padStart(2, '0')}' ${p.sign}`,
        });
        break;
      }
    }
  }

  // Sort each trine by intra-sign degree ascending (Purva-Pashchima ordering, Rule 103)
  for (const elem of Object.keys(results) as DirectionalElement[]) {
    results[elem].planets.sort((a, b) => a.degreeInSign - b.degreeInSign);
    const pNames = results[elem].planets.map((p) => p.name);

    // Combination Checks
    if (pNames.includes('Saturn') && pNames.includes('Venus') && pNames.includes('Mercury')) {
      results[elem].detectedCombinations.push('Supreme Commercial Triad (Rule 161: Saturn + Venus + Mercury)');
    } else if (pNames.includes('Saturn') && pNames.includes('Venus')) {
      results[elem].detectedCombinations.push('Kamdhenu Wealth Confluence (Rule 82/155: Saturn + Venus)');
    }
    if (pNames.includes('Saturn') && pNames.includes('Jupiter') && pNames.includes('Ketu')) {
      results[elem].detectedCombinations.push('Dharmic Judge & Spiritual Monk Triad (Rule 162: Saturn + Jupiter + Ketu)');
    } else if (pNames.includes('Jupiter') && pNames.includes('Saturn')) {
      results[elem].detectedCombinations.push('Dharma-Karma Adhipati in Nadi (Rule 152: Jupiter + Saturn)');
    }
    if (pNames.includes('Jupiter') && pNames.includes('Moon')) {
      results[elem].detectedCombinations.push('Gajakesari in Nadi (Rule 135: Moon + Jupiter)');
    }
    if (pNames.includes('Sun') && pNames.includes('Mercury')) {
      results[elem].detectedCombinations.push('Budhaditya in Nadi (Rule 126: Sun + Mercury)');
    }
    if (pNames.includes('Saturn') && pNames.includes('Ketu')) {
      results[elem].detectedCombinations.push('Career Detachment & Reinvention (Rule 83/159: Saturn + Ketu)');
    }
    if (pNames.includes('Mars') && pNames.includes('Venus')) {
      results[elem].detectedCombinations.push('Passion & Luxury Asset Confluence (Rule 142: Mars + Venus)');
    }
  }

  return results;
}

// =========================================================================
// 5. MEDICAL TRIDOSHA & ORGAN VULNERABILITIES (RULES 46–54)
// =========================================================================
export interface MedicalDiagnosticReport {
  dominantDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Tridosha Balanced';
  doshaScores: { vata: number; pitta: number; kapha: number };
  cardiacVulnerability: boolean;
  diabetesVulnerability: boolean;
  autoimmuneVulnerability: boolean;
  mentalHealthStress: boolean;
  diagnosticNotes: string[];
}

export function evaluateMedicalVulnerabilities(chart: {
  ascendant: { sign: ZodiacSign };
  planets: Array<{ name: string; sign: ZodiacSign; houseNumber: number }>;
  houses?: Array<{ houseNumber: number; sign: ZodiacSign }>;
}): MedicalDiagnosticReport {
  const pMap = new Map<string, { sign: ZodiacSign; houseNumber: number }>();
  for (const p of chart.planets) {
    pMap.set(p.name, { sign: p.sign, houseNumber: p.houseNumber });
  }

  const sun = pMap.get('Sun');
  const moon = pMap.get('Moon');
  const mars = pMap.get('Mars');
  const merc = pMap.get('Mercury');
  const jup = pMap.get('Jupiter');
  const ven = pMap.get('Venus');
  const sat = pMap.get('Saturn');
  const rahu = pMap.get('Rahu');
  const ketu = pMap.get('Ketu');

  // Tridosha scoring
  let vata = 0;
  let pitta = 0;
  let kapha = 0;

  if (sat) vata += 3;
  if (rahu) vata += 2;
  if (merc) vata += 2;

  if (sun) pitta += 3;
  if (mars) pitta += 3;
  if (ketu) pitta += 2;

  if (moon) kapha += 3;
  if (ven) kapha += 3;
  if (jup) kapha += 3;

  const dominantDosha: MedicalDiagnosticReport['dominantDosha'] =
    vata > pitta && vata > kapha ? 'Vata' : pitta > vata && pitta > kapha ? 'Pitta' : 'Kapha';

  const notes: string[] = [];

  // Cardiac check: Sun, Leo, 4th/5th house afflicted by Saturn/Rahu
  const cardiacVulnerability = Boolean(
    sun &&
      (sun.houseNumber === 6 || sun.houseNumber === 8 || sun.houseNumber === 12 || sun.sign === 'Libra') &&
    (sat?.houseNumber === 4 || sat?.houseNumber === 5 || rahu?.houseNumber === 4 || rahu?.houseNumber === 5)
  );
  if (cardiacVulnerability) {
    notes.push('Cardiac/Vascular: Sun or 4th/5th house under malefic influence (Rule 49). Recommend cardiovascular fitness and monitoring blood pressure.');
  }

  // Diabetes / Pancreatic check: Venus and Jupiter afflicted in 6th/8th or watery signs
  const waterySigns: ZodiacSign[] = ['Cancer', 'Scorpio', 'Pisces'];
  const diabetesVulnerability = Boolean(
    (ven && (ven.houseNumber === 6 || ven.houseNumber === 8 || waterySigns.includes(ven.sign))) &&
    (jup && (jup.houseNumber === 6 || jup.houseNumber === 8 || waterySigns.includes(jup.sign)))
  );
  if (diabetesVulnerability) {
    notes.push('Metabolic/Endocrine: Venus and Jupiter both connected to watery signs or 6th/8th axis (Rule 50). Maintain disciplined glycemic and dietary routine.');
  }

  // Autoimmune check: Ketu in 6th or 8th house
  const autoimmuneVulnerability = Boolean(ketu && (ketu.houseNumber === 6 || ketu.houseNumber === 8));
  if (autoimmuneVulnerability) {
    notes.push('Autoimmune / Mystery Resilience: Ketu in 6th/8th house (Rule 52). Guard against chronic inflammatory reactions; prioritize holistic, anti-inflammatory nutrition.');
  }

  // Mental health stress: Moon in Papakartari or conjunct Saturn/Rahu in 4th/8th/12th
  const mentalHealthStress = Boolean(
    moon &&
    (moon.houseNumber === 8 || moon.houseNumber === 12) &&
    (sat?.houseNumber === moon.houseNumber || rahu?.houseNumber === moon.houseNumber)
  );
  if (mentalHealthStress) {
    notes.push('Mental Fortitude: Moon in Dusthana requires active mindfulness, routine sleep, and grounding practices (Rule 53).');
  }

  return {
    dominantDosha,
    doshaScores: { vata, pitta, kapha },
    cardiacVulnerability,
    diabetesVulnerability,
    autoimmuneVulnerability,
    mentalHealthStress,
    diagnosticNotes: notes,
  };
}
