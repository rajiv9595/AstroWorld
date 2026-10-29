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

// =========================================================================
// 6. DAGDHA RASHI / BURNT SIGNS BY TITHI (RULE 29 / 95)
// =========================================================================
export interface DagdhaRashiResult {
  tithi: number;
  dagdhaSigns: ZodiacSign[];
  isDagdha: (sign: ZodiacSign) => boolean;
  shastricSignificance: string;
}

const DAGDHA_MAP: Record<number, ZodiacSign[]> = {
  1: ['Libra', 'Capricorn'],
  2: ['Sagittarius', 'Pisces'],
  3: ['Leo', 'Capricorn'],
  4: ['Taurus', 'Aquarius'],
  5: ['Gemini', 'Virgo'],
  6: ['Aries', 'Leo'],
  7: ['Cancer', 'Sagittarius'],
  8: ['Gemini', 'Virgo'],
  9: ['Leo', 'Scorpio'],
  10: ['Leo', 'Scorpio'],
  11: ['Sagittarius', 'Pisces'],
  12: ['Libra', 'Capricorn'],
  13: ['Taurus', 'Leo'],
  14: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
  15: [], // Purnima
  30: [], // Amavasya
};

export function calculateDagdhaRashi(tithi: number): DagdhaRashiResult {
  const normTithi = tithi > 15 ? tithi - 15 : tithi;
  const signs = DAGDHA_MAP[normTithi] || DAGDHA_MAP[tithi] || [];
  return {
    tithi,
    dagdhaSigns: signs,
    isDagdha: (sign: ZodiacSign) => signs.includes(sign),
    shastricSignificance: signs.length > 0
      ? `Tithi ${tithi} renders ${signs.join(' & ')} Dagdha (Burnt). Any planet or house cusp posited here requires remediated effort (Rule 29).`
      : `Tithi ${tithi} (Full/New Moon) does not burn any zodiac sign.`
  };
}

// =========================================================================
// 7. BHAVAT BHAVAM PRINCIPLE (RULE 2)
// =========================================================================
export interface BhavatBhavamResult {
  primaryHouse: number;
  secondaryHouse: number;
  formula: string;
  significance: string;
}

export function calculateBhavatBhavam(house: number): BhavatBhavamResult {
  let sec = (2 * house - 1) % 12;
  if (sec === 0) sec = 12;
  const labels: Record<number, string> = {
    4: '7th house acts as secondary 4th (vehicles, properties, general happiness)',
    5: '9th house acts as secondary 5th (higher intelligence, children, past merits)',
    8: '3rd house acts as secondary 8th (longevity, hidden reserves, endurance)',
    9: '5th house acts as secondary 9th (dharma, spiritual counsel, divine grace)',
    10: '7th house acts as secondary 10th (public profession, client interaction, enterprise)',
    11: '9th house acts as secondary 11th (windfall gains, institutional benefactors)',
    12: '11th house acts as secondary 12th (expenses of gains, overseas investments)',
  };
  return {
    primaryHouse: house,
    secondaryHouse: sec,
    formula: `((2 * ${house} - 1) mod 12) = ${sec}`,
    significance: labels[house] || `House ${sec} acts as the secondary amplifier (Bhavat Bhavam) for House ${house}.`
  };
}

// =========================================================================
// 8. JAIMINI CHARA KARAKAS HIERARCHY (RULE 161)
// =========================================================================
export type CharaKarakaRole = 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';

export interface CharaKarakaItem {
  role: CharaKarakaRole;
  fullName: string;
  planet: PlanetName;
  degreeInSign: number;
  formattedDegree: string;
  sign: ZodiacSign;
  signification: string;
}

export interface CharaKarakasReport {
  atmakaraka: CharaKarakaItem;
  amatyakaraka: CharaKarakaItem;
  karakas: Record<CharaKarakaRole, CharaKarakaItem>;
  summary: string;
}

export function calculateJaiminiCharaKarakas(
  planets: Record<string, { longitude: number; degreeInSign?: number; sign?: ZodiacSign }>
): CharaKarakasReport {
  const eligibleGrahas: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const candidates: { planet: PlanetName; deg: number; lon: number }[] = [];

  for (const g of eligibleGrahas) {
    const p = planets[g];
    if (p) {
      const lon = normalize360(p.longitude);
      const deg = p.degreeInSign !== undefined ? p.degreeInSign : (lon % 30);
      candidates.push({ planet: g, deg, lon });
    }
  }

  // Sort strictly descending by degree within sign
  candidates.sort((a, b) => b.deg - a.deg);

  const roles: { role: CharaKarakaRole; fullName: string; signification: string }[] = [
    { role: 'AK', fullName: 'Atmakaraka', signification: 'Soul King: Ultimate life agenda, spiritual growth, self' },
    { role: 'AmK', fullName: 'Amatyakaraka', signification: 'Mind / Minister: Career trajectory, counsel, profession' },
    { role: 'BK', fullName: 'Bhratrikaraka', signification: 'Brother / Guru: Siblings, spiritual preceptors, courage' },
    { role: 'MK', fullName: 'Matrikaraka', signification: 'Mother: Emotional anchors, vehicles, home foundation' },
    { role: 'PK', fullName: 'Putrakaraka', signification: 'Progeny / Intellect: Creative legacy, disciples, investments' },
    { role: 'GK', fullName: 'Gnatikaraka', signification: 'Rivals / Disease: Obstacles, competitors, acute challenges' },
    { role: 'DK', fullName: 'Darakaraka', signification: 'Spouse / Partner: Marriage, key alliances, contracts' },
  ];

  const karakas: Partial<Record<CharaKarakaRole, CharaKarakaItem>> = {};

  candidates.slice(0, 7).forEach((cand, idx) => {
    const r = roles[idx];
    const sInfo = getSignInfo(cand.lon);
    const item: CharaKarakaItem = {
      role: r.role,
      fullName: r.fullName,
      planet: cand.planet,
      degreeInSign: cand.deg,
      formattedDegree: `${cand.deg.toFixed(2)}°`,
      sign: sInfo.sign,
      signification: r.signification
    };
    karakas[r.role] = item;
  });

  const ak = karakas.AK!;
  const amk = karakas.AmK!;

  return {
    atmakaraka: ak,
    amatyakaraka: amk,
    karakas: karakas as Record<CharaKarakaRole, CharaKarakaItem>,
    summary: `Atmakaraka is ${ak.planet} at ${ak.formattedDegree} ${ak.sign}; Amatyakaraka is ${amk.planet} at ${amk.formattedDegree} ${amk.sign}. Soul and career alignments governed by Jaimini Sutras (Rule 161).`
  };
}

// =========================================================================
// 9. JAIMINI ARUDHA PADA WITH 1ST/7TH SHIFT EXCEPTION (RULE 163)
// =========================================================================
export interface ArudhaPadaResult {
  house: number;
  houseName: string;
  originalSign: ZodiacSign;
  lordSign: ZodiacSign;
  unadjustedPadaSign: ZodiacSign;
  shifted: boolean;
  finalArudhaSign: ZodiacSign;
  signIndex: number;
}

export function calculateJaiminiArudhaPada(
  house: number,
  lagnaSignIndex: number,
  houseLordSignIndices: number[] // 12-element array: signIndex of the lord of each house (0-11)
): ArudhaPadaResult {
  const houseSignIdx = (lagnaSignIndex + (house - 1)) % 12;
  const lordSignIdx = houseLordSignIndices[house - 1] ?? houseSignIdx;

  // Count from House to Lord
  let distToLord = (lordSignIdx - houseSignIdx) % 12;
  if (distToLord < 0) distToLord += 12;

  // Unadjusted Arudha sign = Lord + distToLord
  let unadjustedIdx = (lordSignIdx + distToLord) % 12;
  if (unadjustedIdx < 0) unadjustedIdx += 12;

  // Exception (Swastha Daridra): If Arudha falls in 1st (same sign) or 7th from house, shift 10 signs forward!
  const diffFromHouse = (unadjustedIdx - houseSignIdx + 12) % 12;
  let finalIdx = unadjustedIdx;
  let shifted = false;

  if (diffFromHouse === 0 || diffFromHouse === 6) {
    finalIdx = (unadjustedIdx + 9) % 12; // 10 signs forward counting inclusively (+9 steps)
    shifted = true;
  }

  const houseNames: Record<number, string> = {
    1: 'Arudha Lagna (AL)',
    2: 'Dhana Pada (A2)',
    3: 'Bhratri Pada (A3)',
    4: 'Sukha Pada (A4)',
    5: 'Mantra Pada (A5)',
    6: 'Roga Pada (A6)',
    7: 'Dara Pada (A7)',
    8: 'Mrityu Pada (A8)',
    9: 'Bhagya Pada (A9)',
    10: 'Rajya Pada (A10)',
    11: 'Labha Pada (A11)',
    12: 'Upapada Lagna (UL)',
  };

  return {
    house,
    houseName: houseNames[house] || `A${house}`,
    originalSign: ZODIAC_SIGNS[houseSignIdx],
    lordSign: ZODIAC_SIGNS[lordSignIdx],
    unadjustedPadaSign: ZODIAC_SIGNS[unadjustedIdx],
    shifted,
    finalArudhaSign: ZODIAC_SIGNS[finalIdx],
    signIndex: finalIdx,
  };
}

// =========================================================================
// 10. TAJIKA ASPECTS & ITHASALA / DEEPTAMSHA (RULES 283–289)
// =========================================================================
export const DEEPTAMSHA_ORBS: Record<string, number> = {
  Sun: 15,
  Moon: 12,
  Mars: 8,
  Mercury: 7,
  Jupiter: 9,
  Venus: 7,
  Saturn: 9,
};

// Planetary speed hierarchy from fastest to slowest
export const PLANET_SPEED_RANK: Record<string, number> = {
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Sun: 4,
  Mars: 5,
  Jupiter: 6,
  Saturn: 7,
};

export interface TajikaAspectResult {
  fasterPlanet: PlanetName;
  slowerPlanet: PlanetName;
  allowedOrb: number;
  actualSeparation: number;
  aspectType: 'conjunction' | 'trine' | 'sextile' | 'square' | 'opposition' | 'none';
  isFriendly: boolean;
  ithasalaYoga: boolean;
  ishrafaYoga: boolean;
  notes: string;
}

export function evaluateTajikaIthasala(
  p1: { name: PlanetName; longitude: number },
  p2: { name: PlanetName; longitude: number }
): TajikaAspectResult {
  const speed1 = PLANET_SPEED_RANK[p1.name] || 5;
  const speed2 = PLANET_SPEED_RANK[p2.name] || 5;

  const faster = speed1 < speed2 ? p1 : p2;
  const slower = speed1 < speed2 ? p2 : p1;

  const orb1 = DEEPTAMSHA_ORBS[p1.name] || 8;
  const orb2 = DEEPTAMSHA_ORBS[p2.name] || 8;
  const allowedOrb = (orb1 + orb2) / 2;

  const fastLon = normalize360(faster.longitude);
  const slowLon = normalize360(slower.longitude);

  const fastDeg = fastLon % 30;
  const slowDeg = slowLon % 30;

  // Sign distance
  const fastSign = Math.floor(fastLon / 30);
  const slowSign = Math.floor(slowLon / 30);
  const signDiff = (slowSign - fastSign + 12) % 12;

  let aspectType: TajikaAspectResult['aspectType'] = 'none';
  let isFriendly = false;

  if (signDiff === 0) {
    aspectType = 'conjunction';
    isFriendly = false;
  } else if (signDiff === 4 || signDiff === 8) {
    aspectType = 'trine';
    isFriendly = true;
  } else if (signDiff === 2 || signDiff === 10) {
    aspectType = 'sextile';
    isFriendly = true;
  } else if (signDiff === 3 || signDiff === 9) {
    aspectType = 'square';
    isFriendly = false;
  } else if (signDiff === 6) {
    aspectType = 'opposition';
    isFriendly = false;
  }

  const degDiff = Math.abs(fastDeg - slowDeg);
  const inOrb = aspectType !== 'none' && degDiff <= allowedOrb;

  // Faster at lower degree applying to slower at higher degree = Ithasala
  const ithasalaYoga = inOrb && fastDeg < slowDeg;
  // Faster passed slower = Ishrafa
  const ishrafaYoga = inOrb && fastDeg > slowDeg;

  let notes = 'No Tajika mutual aspect';
  if (ithasalaYoga) {
    notes = `Ithasala Yoga active: Faster ${faster.name} (${fastDeg.toFixed(2)}°) is applying to ${slower.name} (${slowDeg.toFixed(2)}°) within allowed orb ${allowedOrb.toFixed(1)}° (Rule 284). Event is promised.`;
  } else if (ishrafaYoga) {
    notes = `Ishrafa Yoga active: Faster ${faster.name} (${fastDeg.toFixed(2)}°) has separated from ${slower.name} (${slowDeg.toFixed(2)}°) (Rule 285). Opportunity slipping or requiring re-initiation.`;
  } else if (inOrb) {
    notes = `In contact within orb ${allowedOrb.toFixed(1)}°.`;
  }

  return {
    fasterPlanet: faster.name,
    slowerPlanet: slower.name,
    allowedOrb,
    actualSeparation: degDiff,
    aspectType,
    isFriendly,
    ithasalaYoga,
    ishrafaYoga,
    notes,
  };
}

// =========================================================================
// 11. BHRIGU 12-YEAR JUPITER AGE CLOCK (RULE 151 / 153)
// =========================================================================
export interface BhriguAgeClockResult {
  currentAge: number;
  cycleNumber: number;
  activeSign: ZodiacSign;
  signIndex: number;
  activeSignFromNatalJupiter: number;
  lifePhaseSignificance: string;
}

export function calculateBhriguAgeClock(natalJupiterLon: number, age: number): BhriguAgeClockResult {
  const natalJupSignIdx = Math.floor(normalize360(natalJupiterLon) / 30);
  const cycleNumber = Math.floor((Math.max(1, age) - 1) / 12) + 1;
  const signOffset = (Math.max(1, age) - 1) % 12;
  const activeSignIdx = (natalJupSignIdx + signOffset) % 12;

  const themes: Record<number, string> = {
    1: 'Self-Identity, Vitality, and Life Orientation (Natal Jupiter seat)',
    2: 'Wealth Accumulation, Family Assets, and Voice Expansion',
    3: 'Courage, Self-Effort, Communication, and Skill Mastery',
    4: 'Domestic Foundations, Property, Inner Peace, and Mother',
    5: 'Intellectual Creation, Speculative Foresight, and Progeny',
    6: 'Workplace Competition, Daily Routines, Service, and Healing Challenges',
    7: 'Key Partnerships, Matrimony, Public Recognition, and Commercial Deals',
    8: 'Deep Transformation, Hidden Reserves, Sudden Realignment, and Inheritance',
    9: 'Higher Wisdom, Mentorship, Dharma, and Transcendent Travel',
    10: 'Professional Stature, Public Duty, Executive Authority, and Status',
    11: 'Cash-Flow Realization, Network Community, and Major Ambition Fulfillment',
    12: 'Spiritual Solitude, Overseas Expansion, Investment Liquidation, and Rest',
  };

  const houseFromJup = signOffset + 1;

  return {
    currentAge: age,
    cycleNumber,
    activeSign: ZODIAC_SIGNS[activeSignIdx],
    signIndex: activeSignIdx,
    activeSignFromNatalJupiter: houseFromJup,
    lifePhaseSignificance: `Age ${age} falls into Bhrigu Cycle ${cycleNumber}, activating ${ZODIAC_SIGNS[activeSignIdx]} (${houseFromJup}th from natal Jupiter): ${themes[houseFromJup] || 'Active Karmic Progression'}.`,
  };
}

// =========================================================================
// 12. PUSHKARA NAVAMSHA DETECTION (RULE 13)
// =========================================================================
export interface PushkaraNavamshaResult {
  isPushkara: boolean;
  pushkaraNavamshaSign?: ZodiacSign;
  description: string;
}

export function calculatePushkaraNavamsha(longitude: number): PushkaraNavamshaResult {
  const norm = normalize360(longitude);
  const signIdx = Math.floor(norm / 30);
  const deg = norm % 30;
  const modality = signIdx % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

  let isPushkara = false;
  let pushkaraSign: ZodiacSign | undefined;

  if (modality === 0) {
    // Fire: Aries (0), Leo (4), Sag (8)
    if (deg >= 20.0 && deg < 23.333333) {
      isPushkara = true;
      pushkaraSign = 'Libra';
    } else if (deg >= 26.666667 && deg <= 30.0) {
      isPushkara = true;
      pushkaraSign = 'Sagittarius';
    }
  } else if (modality === 1) {
    // Earth: Taurus (1), Virgo (5), Cap (9)
    if (deg >= 6.666667 && deg < 10.0) {
      isPushkara = true;
      pushkaraSign = 'Pisces';
    } else if (deg >= 13.333333 && deg < 16.666667) {
      isPushkara = true;
      pushkaraSign = 'Taurus';
    }
  } else if (modality === 2) {
    // Air: Gemini (2), Libra (6), Aqua (10)
    if (deg >= 16.666667 && deg < 20.0) {
      isPushkara = true;
      pushkaraSign = 'Pisces';
    } else if (deg >= 23.333333 && deg < 26.666667) {
      isPushkara = true;
      pushkaraSign = 'Taurus';
    }
  } else if (modality === 3) {
    // Water: Cancer (3), Scorpio (7), Pisces (11)
    if (deg >= 0.0 && deg < 3.333333) {
      isPushkara = true;
      pushkaraSign = 'Cancer';
    } else if (deg >= 6.666667 && deg < 10.0) {
      isPushkara = true;
      pushkaraSign = 'Virgo';
    }
  }

  return {
    isPushkara,
    pushkaraNavamshaSign: pushkaraSign,
    description: isPushkara
      ? `Occupies sacred Pushkara Navamsha in ${pushkaraSign} (Rule 13). Endows the planet with extraordinary resilience, regenerative fortune, and auspicious fruitfulness.`
      : 'Standard Navamsha zone.'
  };
}

// =========================================================================
// 13. GANDANTA KNOT DETECTION (RULE 14)
// =========================================================================
export interface GandantaResult {
  isGandanta: boolean;
  isCriticalCore: boolean;
  junctionName?: string;
  distanceToKnotDegrees?: number;
  description: string;
}

export function calculateGandanta(longitude: number): GandantaResult {
  const norm = normalize360(longitude);
  const span = 3.333333; // 3°20'
  const coreSpan = 0.8; // 48 arcminutes = 0.8 degrees

  let isGandanta = false;
  let isCriticalCore = false;
  let jName: string | undefined;
  let dist = 999;

  // Pisces-Aries (Revati - Ashwini)
  if (norm >= 360 - span || norm <= span) {
    isGandanta = true;
    jName = 'Revati-Ashwini Gandanta (Water-Fire Karmic Knot)';
    dist = norm >= 360 - span ? 360 - norm : norm;
    if (dist <= coreSpan) isCriticalCore = true;
  }
  // Cancer-Leo (Ashlesha - Magha)
  else if (norm >= 120 - span && norm <= 120 + span) {
    isGandanta = true;
    jName = 'Ashlesha-Magha Gandanta (Water-Fire Karmic Knot)';
    dist = Math.abs(norm - 120);
    if (dist <= coreSpan) isCriticalCore = true;
  }
  // Scorpio-Sagittarius (Jyeshtha - Mula)
  else if (norm >= 240 - span && norm <= 240 + span) {
    isGandanta = true;
    jName = 'Jyeshtha-Mula Gandanta (Water-Fire Karmic Knot)';
    dist = Math.abs(norm - 240);
    if (dist <= coreSpan) isCriticalCore = true;
  }

  return {
    isGandanta,
    isCriticalCore,
    junctionName: jName,
    distanceToKnotDegrees: isGandanta ? dist : undefined,
    description: isGandanta
      ? `${jName}: distance ${dist.toFixed(2)}° from border (${isCriticalCore ? 'CRITICAL CORE <= 48\'' : 'Outer Sandhi'}). Karmic knot requiring transformative psychological or remedial alignment (Rule 14).`
      : 'Safe from Gandanta sandhi.'
  };
}

// =========================================================================
// 14. FIVE SOLAR UPAGRAHAS (RULE 325)
// =========================================================================
export interface SolarUpagrahaItem {
  name: 'Dhuma' | 'Vyatipata' | 'Parivesha' | 'Indrachapa' | 'Upaketu';
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  formattedDegree: string;
  nakshatra: string;
  shastricSignificance: string;
}

export interface SolarUpagrahasReport {
  sunLongitude: number;
  dhuma: SolarUpagrahaItem;
  vyatipata: SolarUpagrahaItem;
  parivesha: SolarUpagrahaItem;
  indrachapa: SolarUpagrahaItem;
  upaketu: SolarUpagrahaItem;
  mathematicalProof: string;
}

export function calculateFiveSolarUpagrahas(sunLongitude: number): SolarUpagrahasReport {
  const sunLon = normalize360(sunLongitude);

  // 1. Dhuma = Sun + 133° 20'
  const dhumaLon = normalize360(sunLon + 133 + 20 / 60);

  // 2. Vyatipata = 360° - Dhuma
  const vyatipataLon = normalize360(360 - dhumaLon);

  // 3. Parivesha = Vyatipata + 180°
  const pariveshaLon = normalize360(vyatipataLon + 180);

  // 4. Indrachapa = 360° - Parivesha
  const indrachapaLon = normalize360(360 - pariveshaLon);

  // 5. Upaketu = Indrachapa + 16° 40'
  const upaketuLon = normalize360(indrachapaLon + 16 + 40 / 60);

  const makeItem = (
    name: SolarUpagrahaItem['name'],
    lon: number,
    sig: string
  ): SolarUpagrahaItem => {
    const sInfo = getSignInfo(lon);
    const nInfo = getNakshatraInfo(lon);
    return {
      name,
      longitude: lon,
      sign: sInfo.sign,
      degreeInSign: sInfo.degreeInSign,
      formattedDegree: `${sInfo.degreeInSign.toFixed(2)}°`,
      nakshatra: nInfo.nakshatraName,
      shastricSignificance: sig,
    };
  };

  const dhuma = makeItem('Dhuma', dhumaLon, 'Intense heat, obstruction, and combustion risk to conjoined points.');
  const vyatipata = makeItem('Vyatipata', vyatipataLon, 'Sudden reversal, upheaval, and dramatic calamity if afflicted.');
  const parivesha = makeItem('Parivesha', pariveshaLon, 'Protective enclosure, investigative insight, and institutional defense.');
  const indrachapa = makeItem('Indrachapa', indrachapaLon, 'Creative intellect, aesthetic elevation, and divine grace with benefics.');
  const upaketu = makeItem('Upaketu', upaketuLon, 'Karmic short-circuit, acute detachment, and sudden breakthroughs.');

  const proofDiff = Math.abs(normalize360(upaketuLon + 30) - sunLon);
  const mathematicalProof = proofDiff < 0.001 || Math.abs(proofDiff - 360) < 0.001
    ? `Parashari Invariant Verified: (Upaketu + 30° = Sun: ${sunLon.toFixed(2)}°)`
    : `Verification deviation: ${proofDiff.toFixed(4)}°`;

  return {
    sunLongitude: sunLon,
    dhuma,
    vyatipata,
    parivesha,
    indrachapa,
    upaketu,
    mathematicalProof,
  };
}

// =========================================================================
// 15. BEEJA & KSHETRA SPHUTA (RULES 320 & 321)
// =========================================================================
export interface FertilitySphutaResult {
  sphutaLongitude: number;
  longitude: number;
  sign: ZodiacSign;
  degreeInSign: number;
  formattedDegree: string;
  modality: 'Odd' | 'Even';
  navamshaSign: ZodiacSign;
  navamshaModality: 'Odd' | 'Even';
  isFavorable: boolean;
  isOddRashi: boolean;
  isEvenRashi: boolean;
  isOddNavamsha: boolean;
  isEvenNavamsha: boolean;
  analysis: string;
}

export interface BiologicalFertilityReport {
  beejaSphuta: FertilitySphutaResult;
  kshetraSphuta: FertilitySphutaResult;
  summary: string;
}

export function calculateBeejaAndKshetraSphuta(
  sunLon: number,
  venusLon: number,
  jupiterLon: number,
  moonLon: number,
  marsLon: number
): BiologicalFertilityReport {
  // Beeja Sphuta (Male) = Sun + Venus + Jupiter
  const beejaLon = normalize360(sunLon + venusLon + jupiterLon);
  const beejaSignInfo = getSignInfo(beejaLon);
  const beejaIsOdd = beejaSignInfo.signIndex % 2 === 0; // 0=Aries (Odd), 1=Taurus (Even)
  const beejaNavDeg = (beejaLon % 30) / (30 / 9);
  const beejaNavSignIdx = (Math.floor(beejaNavDeg) + (beejaSignInfo.signIndex % 4) * 3) % 12;
  const beejaNavSign = ZODIAC_SIGNS[beejaNavSignIdx];
  const beejaNavIsOdd = beejaNavSignIdx % 2 === 0;
  const beejaFavorable = beejaIsOdd && beejaNavIsOdd;

  const beejaSphuta: FertilitySphutaResult = {
    sphutaLongitude: beejaLon,
    longitude: beejaLon,
    sign: beejaSignInfo.sign,
    degreeInSign: beejaSignInfo.degreeInSign,
    formattedDegree: `${beejaSignInfo.degreeInSign.toFixed(2)}°`,
    modality: beejaIsOdd ? 'Odd' : 'Even',
    navamshaSign: beejaNavSign,
    navamshaModality: beejaNavIsOdd ? 'Odd' : 'Even',
    isFavorable: beejaFavorable,
    isOddRashi: beejaIsOdd,
    isEvenRashi: !beejaIsOdd,
    isOddNavamsha: beejaNavIsOdd,
    isEvenNavamsha: !beejaNavIsOdd,
    analysis: beejaFavorable
      ? `Beeja Sphuta falls in Odd Rashi (${beejaSignInfo.sign}) & Odd Navamsha (${beejaNavSign}), indicating robust male virility and biological vitality (Rule 320).`
      : `Beeja Sphuta falls in Even sign/Navamsa (${beejaSignInfo.sign}/${beejaNavSign}), suggesting potential reproductive or vitality friction requiring medical and lifestyle support.`
  };

  // Kshetra Sphuta (Female) = Moon + Mars + Jupiter
  const kshetraLon = normalize360(moonLon + marsLon + jupiterLon);
  const kshetraSignInfo = getSignInfo(kshetraLon);
  const kshetraIsEven = kshetraSignInfo.signIndex % 2 !== 0; // 1=Taurus (Even), 3=Cancer (Even)
  const kshetraNavDeg = (kshetraLon % 30) / (30 / 9);
  const kshetraNavSignIdx = (Math.floor(kshetraNavDeg) + (kshetraSignInfo.signIndex % 4) * 3) % 12;
  const kshetraNavSign = ZODIAC_SIGNS[kshetraNavSignIdx];
  const kshetraNavIsEven = kshetraNavSignIdx % 2 !== 0;
  const kshetraFavorable = kshetraIsEven && kshetraNavIsEven;

  const kshetraSphuta: FertilitySphutaResult = {
    sphutaLongitude: kshetraLon,
    longitude: kshetraLon,
    sign: kshetraSignInfo.sign,
    degreeInSign: kshetraSignInfo.degreeInSign,
    formattedDegree: `${kshetraSignInfo.degreeInSign.toFixed(2)}°`,
    modality: kshetraIsEven ? 'Even' : 'Odd',
    navamshaSign: kshetraNavSign,
    navamshaModality: kshetraNavIsEven ? 'Even' : 'Odd',
    isFavorable: kshetraFavorable,
    isOddRashi: !kshetraIsEven,
    isEvenRashi: kshetraIsEven,
    isOddNavamsha: !kshetraNavIsEven,
    isEvenNavamsha: kshetraNavIsEven,
    analysis: kshetraFavorable
      ? `Kshetra Sphuta falls in Even Rashi (${kshetraSignInfo.sign}) & Even Navamsha (${kshetraNavSign}), indicating fertile hormonal and uterine receptivity (Rule 321).`
      : `Kshetra Sphuta falls in Odd sign/Navamsa (${kshetraSignInfo.sign}/${kshetraNavSign}), indicating hormonal or ovulatory sensitivity requiring clinical monitoring.`
  };

  return {
    beejaSphuta,
    kshetraSphuta,
    summary: `Beeja Sphuta: ${beejaSphuta.formattedDegree} ${beejaSphuta.sign} (${beejaSphuta.isFavorable ? 'Auspicious' : 'Needs Support'}); Kshetra Sphuta: ${kshetraSphuta.formattedDegree} ${kshetraSphuta.sign} (${kshetraSphuta.isFavorable ? 'Auspicious' : 'Needs Support'}).`
  };
}

// =========================================================================
// 16. PLANETARY LATTA (NAKSHATRA KICK) (RULES 331 & 332)
// =========================================================================
export interface LattaImpact {
  planet: string;
  planetNakshatra: string;
  lattaNakshatraIndex: number;
  lattaNakshatraName: string;
  isKickingTarget: boolean;
  piercesTargetNakshatra: boolean;
  lattaType: 'forward' | 'backward';
  kickSteps: number;
  effect: string;
}

export interface PlanetaryLattaReport {
  targetNakshatra: string;
  targetNakshatraName: string;
  targetNakshatraIndex: number;
  directKicks: LattaImpact[];
  planetaryKicks: LattaImpact[];
  afflicted: boolean;
  isLattaAfflicted: boolean;
  shastricVerdict: string;
}

export function calculatePlanetaryLatta(
  planets: Record<string, number>, // planet name -> longitude
  targetNakshatraIndex: number // usually Janma Nakshatra (0-26)
): PlanetaryLattaReport {
  const rules: { planet: string; offset: number; direction: 'forward' | 'backward'; effect: string }[] = [
    { planet: 'Sun', offset: 12, direction: 'forward', effect: 'Career conflict, friction with authority, or fever.' },
    { planet: 'Mars', offset: 3, direction: 'forward', effect: 'Surgical cut, sudden injury, or conflict.' },
    { planet: 'Jupiter', offset: 6, direction: 'forward', effect: 'Disruption of financial planning or preceptor relations.' },
    { planet: 'Saturn', offset: 8, direction: 'forward', effect: 'Bereavement, acute delay, or financial freeze.' },
    { planet: 'Moon', offset: 22, direction: 'backward', effect: 'Mental anxiety, domestic restlessness, or loss of peace.' },
    { planet: 'Mercury', offset: 7, direction: 'backward', effect: 'Contract breakdown, miscommunication, or commercial loss.' },
    { planet: 'Venus', offset: 5, direction: 'backward', effect: 'Relationship strain, financial blockage, or luxury loss.' },
    { planet: 'Rahu', offset: 9, direction: 'backward', effect: 'Sudden betrayal, scandal, or toxic infection.' },
  ];

  const directKicks: LattaImpact[] = [];

  for (const r of rules) {
    const lon = planets[r.planet];
    if (typeof lon === 'number') {
      const pNak = getNakshatraInfo(lon);
      let lattaIdx = 0;
      if (r.direction === 'forward') {
        lattaIdx = (pNak.nakshatraIndex + r.offset - 1) % 27;
      } else {
        lattaIdx = (pNak.nakshatraIndex - (r.offset - 1) + 27) % 27;
      }

      const isKicking = lattaIdx === targetNakshatraIndex;
      const kickItem: LattaImpact = {
        planet: r.planet,
        planetNakshatra: pNak.nakshatraName,
        lattaNakshatraIndex: lattaIdx,
        lattaNakshatraName: NAKSHATRA_NAMES[lattaIdx],
        isKickingTarget: isKicking,
        piercesTargetNakshatra: isKicking,
        lattaType: r.direction,
        kickSteps: r.offset,
        effect: r.effect,
      };

      if (isKicking) {
        directKicks.push(kickItem);
      }
    }
  }

  const afflicted = directKicks.length > 0;
  const targetName = NAKSHATRA_NAMES[targetNakshatraIndex] || 'Target Star';

  return {
    targetNakshatra: targetName,
    targetNakshatraName: targetName,
    targetNakshatraIndex,
    directKicks,
    planetaryKicks: directKicks,
    afflicted,
    isLattaAfflicted: afflicted,
    shastricVerdict: afflicted
      ? `Target Star ${targetName} receives direct Latta kick from: ${directKicks.map((k) => `${k.planet} (${k.effect})`).join('; ')} (Rules 331–332).`
      : `Target Star ${targetName} is free from planetary Latta kicks.`,
  };
}

// =========================================================================
// 17. PUSHKARA BHAGA (24 EXACT DEGREES OF FORTUNE) (RULE 339)
// =========================================================================
export interface PushkaraBhagaResult {
  isPushkaraBhaga: boolean;
  degreeWithinSign: number;
  exactPushkaraDegree?: number;
  distanceFromPushkara: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  shastricSignificance: string;
}

export function calculatePushkaraBhaga(longitude: number): PushkaraBhagaResult {
  const norm = normalize360(longitude);
  const signIdx = Math.floor(norm / 30);
  const deg = norm % 30;
  const modality = signIdx % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
  const ELEMENTS: Array<'Fire' | 'Earth' | 'Air' | 'Water'> = ['Fire', 'Earth', 'Air', 'Water'];

  let pushkaraDegrees: number[] = [];
  if (modality === 0) pushkaraDegrees = [21, 24];
  else if (modality === 1) pushkaraDegrees = [9, 14];
  else if (modality === 2) pushkaraDegrees = [18, 24];
  else if (modality === 3) pushkaraDegrees = [2, 7];

  let isHit = false;
  let exactTarget = pushkaraDegrees[0];
  let minDiff = 999;

  for (const pd of pushkaraDegrees) {
    const diff = Math.abs(deg - pd);
    if (diff < minDiff) {
      minDiff = diff;
      exactTarget = pd;
    }
    if (diff <= 1.0) {
      isHit = true;
    }
  }

  return {
    isPushkaraBhaga: isHit,
    degreeWithinSign: deg,
    exactPushkaraDegree: exactTarget,
    distanceFromPushkara: minDiff,
    element: ELEMENTS[modality],
    shastricSignificance: isHit
      ? `Occupies Pushkara Bhaga within 1° of ${exactTarget}° ${ZODIAC_SIGNS[signIdx]} (Rule 339). Endows the point with extraordinary capacity for wealth, protection, and miraculous recovery.`
      : `Standard planetary degree (${minDiff.toFixed(2)}° from nearest Pushkara Bhaga).`,
  };
}

// =========================================================================
// 18. SPECIAL KARMIC NAKSHATRAS (RULE 337)
// =========================================================================
export interface SpecialKarmicStar {
  role: string;
  offset: number;
  nakshatraIndex: number;
  nakshatraName: string;
  name: string;
  governingDomain: string;
}

export function calculateSpecialKarmicNakshatras(janmaNakshatraIdx: number): Record<string, SpecialKarmicStar> {
  const definitions: { role: string; offset: number; domain: string }[] = [
    { role: 'Janma', offset: 1, domain: 'Physical vitality, life purpose, and self' },
    { role: 'Jati', offset: 4, domain: 'Community roots, clan relations, and domestic environment' },
    { role: 'Karma', offset: 10, domain: 'Professional seat, executive authority, and career actions' },
    { role: 'Desha', offset: 12, domain: 'Homeland versus foreign settlement and relocation' },
    { role: 'Sanghatika', offset: 16, domain: 'Group alliances, partnerships, and collective karma' },
    { role: 'Samudayika', offset: 18, domain: 'Mass influence, crowd events, and broad social standing' },
    { role: 'Adhana', offset: 19, domain: 'Conception point and deep subconscious reprogramming' },
    { role: 'Vainashika', offset: 22, domain: 'Destruction, surgical intervention, and sudden cut' },
    { role: 'Abhisheka', offset: 27, domain: 'Coronation, spiritual crowning, and peak honors' },
  ];

  const result: Record<string, SpecialKarmicStar> = {};

  for (const d of definitions) {
    const starIdx = (janmaNakshatraIdx + d.offset - 1) % 27;
    const starName = NAKSHATRA_NAMES[starIdx];
    const starObj: SpecialKarmicStar = {
      role: d.role,
      offset: d.offset,
      nakshatraIndex: starIdx,
      nakshatraName: starName,
      name: starName,
      governingDomain: d.domain,
    };
    result[d.role] = starObj;
    result[d.role.toLowerCase()] = starObj;
  }

  return result;
}

// =========================================================================
// 19. TRIPUSHKARA & DWIPUSHKARA YOGAS (RULE 343)
// =========================================================================
export interface PushkaraYogaResult {
  hasTripushkara: boolean;
  isTripushkara: boolean;
  hasDwipushkara: boolean;
  isDwipushkara: boolean;
  multiplier: 1 | 2 | 3;
  tithi: number;
  isBhadraTithi: boolean;
  weekday: number;
  isEligibleVara: boolean;
  nakshatra: string;
  notes: string;
}

export function calculateTripushkaraYoga(
  tithi: number,
  weekday: number,
  nakshatraIdx: number
): PushkaraYogaResult {
  const normTithi = tithi > 15 ? tithi - 15 : tithi;
  const isBhadraTithi = normTithi === 2 || normTithi === 7 || normTithi === 12;
  const isEligibleVara = weekday === 0 || weekday === 2 || weekday === 6;

  const tripStars = [2, 6, 11, 15, 20, 24];
  const dwipStars = [4, 13, 22];

  const hasTripushkara = isBhadraTithi && isEligibleVara && tripStars.includes(nakshatraIdx);
  const hasDwipushkara = isBhadraTithi && isEligibleVara && dwipStars.includes(nakshatraIdx);

  const multiplier: 1 | 2 | 3 = hasTripushkara ? 3 : hasDwipushkara ? 2 : 1;
  const starName = NAKSHATRA_NAMES[nakshatraIdx] || 'Nakshatra';

  let notes = 'Standard timing conditions.';
  if (hasTripushkara) {
    notes = `Tripushkara Yoga ACTIVE: Bhadra Tithi ${tithi} on eligible Vara and 3-Pada star ${starName}. Any event initiated now repeats THREE times (Rule 343).`;
  } else if (hasDwipushkara) {
    notes = `Dwipushkara Yoga ACTIVE: Bhadra Tithi ${tithi} on eligible Vara and 2-Pada star ${starName}. Any event initiated now repeats TWICE (Rule 343).`;
  }

  return {
    hasTripushkara,
    isTripushkara: hasTripushkara,
    hasDwipushkara,
    isDwipushkara: hasDwipushkara,
    multiplier,
    tithi,
    isBhadraTithi,
    weekday,
    isEligibleVara,
    nakshatra: starName,
    notes,
  };
}

// =========================================================================
// 20. VAISHESHIKAMSHA MULTI-DIVISIONAL DIGNITY (RULE 314)
// =========================================================================
export interface VaisheshikamshaResult {
  dignityCount: number;
  tierName: string;
  name: string;
  statusLevel: string;
  shastricSignificance: string;
}

export function calculateVaisheshikamsha(dignityCount: number): VaisheshikamshaResult {
  const tiers: Record<number, { tierName: string; status: string; sig: string }> = {
    2: { tierName: 'Parijata', status: 'Respectable', sig: 'General prosperity, comfort, and good standing.' },
    3: { tierName: 'Uttama', status: 'Executive', sig: 'High leadership, wealth accumulation, and administrative honor.' },
    4: { tierName: 'Gopura', status: 'Governor / Landed', sig: 'Commands institutions, land portfolios, and deep respect.' },
    5: { tierName: 'Simhasana', status: 'Ministerial / CEO', sig: 'Equivalent to sitting upon a royal throne; supreme executive authority.' },
    6: { tierName: 'Paravata', status: 'Global Renown', sig: 'Historic career achievements, lasting legacy, and international acclaim.' },
    7: { tierName: 'Devaloka', status: 'Extraordinary Sovereign', sig: 'Opulence of the gods, vast institutional backing, and sovereign fortune.' },
    8: { tierName: 'Brahmaloka', status: 'Epochal Figure', sig: 'Transformative historical, intellectual, or spiritual magnitude.' },
    9: { tierName: 'Sakravahana', status: 'Imperial Billionaire', sig: 'Rides with the splendor of Indra; boundless enterprise and wealth.' },
    10: { tierName: 'Shridhama', status: 'Avatar / Sovereign Giant', sig: 'Supreme dignity across all vargas; alters national or world history.' },
  };

  const c = Math.max(0, Math.min(16, dignityCount));
  const matched = tiers[c] || (c > 10 ? tiers[10] : { tierName: 'Samanya', status: 'Ordinary', sig: 'Standard divisional dignity.' });

  return {
    dignityCount: c,
    tierName: matched.tierName,
    name: matched.tierName,
    statusLevel: matched.status,
    shastricSignificance: `${matched.tierName} Vaisheshikamsha (${c} Varga Dignities): ${matched.sig} (Rule 314).`,
  };
}
