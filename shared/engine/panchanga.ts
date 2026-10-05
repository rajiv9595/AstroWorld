/**
 * ASTROWORLD — Panchanga (Five Limbs of Vedic Time) & Muhurat Engine
 * Classical calculations for Tithi, Vara, Nakshatra, Yoga, Karana,
 * Solar/Lunar Ephemeris, Auspicious/Inauspicious Muhurats, and Choghadiya.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import { formatDMS, normalizeDegrees, localDateTimeToUtcDate } from './astronomy.ts';
import { NAKSHATRAS, ZODIAC_SIGNS, SANSKRIT_SIGNS } from './constants.ts';
import { PanchangaFacts, PlanetName, PlanetPosition } from './types.ts';
import { astronomyEngineEphemerisProvider, SiderealEphemerisProvider } from './ephemeris.ts';

export const TITHI_NAMES: string[] = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima (Full Moon)', // 15
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Amavasya (New Moon)', // 30
];

export const TITHI_DEITIES: string[] = [
  'Agni (Fire)', 'Brahma (Creator)', 'Gauri / Shiva', 'Ganesha (Remover of Obstacles)',
  'Nagas (Serpents)', 'Kartikeya (Commander)', 'Surya (Sun God)', 'Shiva (Rudra)',
  'Durga (Supreme Shakti)', 'Yama (Dharma)', 'Vishnu (Preserver)', 'Vishnu / Hari',
  'Kamadeva (Desire & Love)', 'Shiva (Rudra)', 'Moon / Satyanarayana',
  'Agni (Fire)', 'Brahma (Creator)', 'Gauri / Shiva', 'Ganesha (Remover of Obstacles)',
  'Nagas (Serpents)', 'Kartikeya (Commander)', 'Surya (Sun God)', 'Shiva (Rudra)',
  'Durga (Supreme Shakti)', 'Yama (Dharma)', 'Vishnu (Preserver)', 'Vishnu / Hari',
  'Kamadeva (Desire & Love)', 'Shiva (Rudra)', 'Pitris (Ancestral Deities)'
];

export const TITHI_NATURES: string[] = [
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
  'Nanda (Joy & Delight)', 'Bhadra (Auspicious & Fortunate)', 'Jaya (Victory & Triumph)', 'Rikta (Void & Inauspicious for ventures)', 'Poorna (Complete & Fulfilling)',
];

export const NITHYA_YOGAS: { name: string; quality: 'Auspicious' | 'Inauspicious' | 'Neutral'; meaning: string }[] = [
  { name: 'Vishkambha', quality: 'Inauspicious', meaning: 'Obstacle or hindrance in initial phase' },
  { name: 'Priti', quality: 'Auspicious', meaning: 'Love, affection, mutual harmony' },
  { name: 'Ayushman', quality: 'Auspicious', meaning: 'Long life, vitality, good health' },
  { name: 'Saubhagya', quality: 'Auspicious', meaning: 'Good fortune, prosperity, marital bliss' },
  { name: 'Shobhana', quality: 'Auspicious', meaning: 'Splendid, elegant, auspicious undertakings' },
  { name: 'Atiganda', quality: 'Inauspicious', meaning: 'Severe obstacles and discord' },
  { name: 'Sukarma', quality: 'Auspicious', meaning: 'Virtuous deeds, righteous success' },
  { name: 'Dhriti', quality: 'Auspicious', meaning: 'Patience, endurance, mental stability' },
  { name: 'Shula', quality: 'Inauspicious', meaning: 'Pain, sharp challenges, avoidance advised' },
  { name: 'Ganda', quality: 'Inauspicious', meaning: 'Knotty hurdles, vulnerability' },
  { name: 'Vriddhi', quality: 'Auspicious', meaning: 'Growth, expansion, business progress' },
  { name: 'Dhruva', quality: 'Auspicious', meaning: 'Fixed, permanence, long-term foundations' },
  { name: 'Vyaghata', quality: 'Inauspicious', meaning: 'Aggressive impact, fierce energy' },
  { name: 'Harshana', quality: 'Auspicious', meaning: 'Joy, celebration, delightful occurrences' },
  { name: 'Vajra', quality: 'Inauspicious', meaning: 'Thunderbolt, diamond hardness, sudden shocks' },
  { name: 'Siddhi', quality: 'Auspicious', meaning: 'Attainment of goals, mastery, success' },
  { name: 'Vyatipata', quality: 'Inauspicious', meaning: 'Calamitous influence, avoid major transactions' },
  { name: 'Variyan', quality: 'Auspicious', meaning: 'Comfort, wealth, ease of life' },
  { name: 'Parigha', quality: 'Inauspicious', meaning: 'Iron bar, confinement, initial blockage' },
  { name: 'Shiva', quality: 'Auspicious', meaning: 'Pure, auspicious, supreme benevolence' },
  { name: 'Siddha', quality: 'Auspicious', meaning: 'Accomplished, spiritual perfection' },
  { name: 'Sadhya', quality: 'Auspicious', meaning: 'Feasible, achievable, fulfillment' },
  { name: 'Shubha', quality: 'Auspicious', meaning: 'Pure good, fortunate outcomes' },
  { name: 'Shukla', quality: 'Auspicious', meaning: 'Bright, radiant, intellectual clarity' },
  { name: 'Brahma', quality: 'Auspicious', meaning: 'Divine knowledge, supreme wisdom' },
  { name: 'Indra', quality: 'Auspicious', meaning: 'Leadership, authority, high status' },
  { name: 'Vaidhriti', quality: 'Inauspicious', meaning: 'Divisive energy, avoid auspicious events' },
];

export const VARA_NAMES: { name: string; english: string; lord: PlanetName; deity: string }[] = [
  { name: 'Ravivara', english: 'Sunday', lord: 'Sun', deity: 'Surya Narayana' },
  { name: 'Somavara', english: 'Monday', lord: 'Moon', deity: 'Lord Shiva' },
  { name: 'Mangalavara', english: 'Tuesday', lord: 'Mars', deity: 'Lord Kartikeya / Hanuman' },
  { name: 'Budhavara', english: 'Wednesday', lord: 'Mercury', deity: 'Lord Maha Vishnu' },
  { name: 'Guruvara', english: 'Thursday', lord: 'Jupiter', deity: 'Lord Brahma / Brihaspati' },
  { name: 'Shukravara', english: 'Friday', lord: 'Venus', deity: 'Goddess Mahalakshmi' },
  { name: 'Shanivara', english: 'Saturday', lord: 'Saturn', deity: 'Lord Shani / Yama' },
];

export const MOVABLE_KARANAS = [
  { name: 'Bava', deity: 'Indra', nature: 'Auspicious for ceremonies and undertakings' },
  { name: 'Balava', deity: 'Brahma', nature: 'Auspicious for spiritual rituals and learning' },
  { name: 'Kaulava', deity: 'Mitra', nature: 'Auspicious for friendships and relationships' },
  { name: 'Taitila', deity: 'Aryaman', nature: 'Auspicious for building wealth and honor' },
  { name: 'Garija', deity: 'Bhumi (Earth)', nature: 'Auspicious for farming, foundation, and planting' },
  { name: 'Vanija', deity: 'Manibhadra', nature: 'Auspicious for trade, commerce, and sales' },
  { name: 'Vishti (Bhadra)', deity: 'Yama', nature: 'Inauspicious for auspicious starts, suitable for destructive/defensive work' },
];

export const FIXED_KARANAS: Record<number, { name: string; deity: string; nature: string }> = {
  1: { name: 'Kimstughna', deity: 'Maruts', nature: 'Auspicious for starting benevolent ventures' },
  58: { name: 'Shakuni', deity: 'Kratu', nature: 'Auspicious for medicine, arbitration, and legal work' },
  59: { name: 'Chatushpada', deity: 'Ishana', nature: 'Auspicious for cattle, estate, and government affairs' },
  60: { name: 'Naga', deity: 'Nagas', nature: 'Suitable for aggressive, underground, or secret operations' },
};

export interface ComprehensiveDailyPanchanga {
  date: Date;
  formattedDate: string;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  panchanga: PanchangaFacts;
  tithiDetail: {
    number: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    completedPercent: number;
    deity: string;
    nature: string;
  };
  nakshatraDetail: {
    number: number;
    name: string;
    lord: PlanetName;
    pada: number;
    completedPercent: number;
    deity: string;
    symbol: string;
  };
  yogaDetail: {
    number: number;
    name: string;
    quality: 'Auspicious' | 'Inauspicious' | 'Neutral';
    meaning: string;
  };
  karanaDetail: {
    number: number;
    name: string;
    type: 'Chara' | 'Sthira';
    deity: string;
    nature: string;
  };
  varaDetail: {
    name: string;
    english: string;
    lord: PlanetName;
    deity: string;
  };
  solarLunar: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    dayDuration: string;
    nightDuration: string;
    sunSign: string;
    sunDegree: string;
    moonSign: string;
    moonDegree: string;
    ayanamsa: string;
  };
  muhurats: {
    amritKaalWindows: Array<{ start: string; end: string }>;
    abhijit: { start: string; end: string; status: 'Highly Auspicious' | 'Avoid'; description: string };
    brahma: { start: string; end: string; status: 'Highly Auspicious'; description: string };
    amritKaal: { start: string; end: string; status: 'Auspicious'; description: string };
    vijaya: { start: string; end: string; status: 'Auspicious'; description: string };
    rahuKaal: { start: string; end: string; status: 'Inauspicious'; description: string };
    yamaganda: { start: string; end: string; status: 'Inauspicious'; description: string };
    gulika: { start: string; end: string; status: 'Inauspicious'; description: string };
    durMuhurat: { start: string; end: string; status: 'Inauspicious'; description: string };
  };
  choghadiyaDay: Array<{
    period: number;
    name: string;
    type: 'Auspicious' | 'Inauspicious' | 'Neutral';
    start: string;
    end: string;
    ruler: string;
    meaning: string;
    isActive: boolean;
  }>;
  choghadiyaNight: Array<{
    period: number;
    name: string;
    type: 'Auspicious' | 'Inauspicious' | 'Neutral';
    start: string;
    end: string;
    ruler: string;
    meaning: string;
    isActive: boolean;
  }>;
}

/**
 * Format Date to Local Time String with HH:MM AM/PM
 */
export function formatLocalTime(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

/**
 * Calculate Panchanga facts from planetary positions and birth date.
 */
export function calculatePanchanga(
  planets: PlanetPosition[],
  birthDateUtc: Date,
  ayanamsaDeg: number,
  observer?: { latitude: number; longitude: number; timezone?: string },
  ephemerisProvider?: SiderealEphemerisProvider,
): PanchangaFacts {
  const sun = planets.find((p) => p.name === 'Sun') || planets[0];
  const moon = planets.find((p) => p.name === 'Moon') || planets[1];
  const timezone = observer?.timezone || 'Asia/Kolkata';

  // 1. Tithi: Moon-Sun elongation, 12° per tithi.
  const elongation = normalizeDegrees(moon.siderealLongitude - sun.siderealLongitude);
  const tithiIndex = Math.min(29, Math.floor(elongation / 12.0));
  const tithiNum = tithiIndex + 1;
  const tithiName = TITHI_NAMES[tithiIndex];
  const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';
  const tithiCompletedPercent = ((elongation % 12.0) / 12.0) * 100;

  // 2. Vara: use the civil weekday in the requested timezone, not UTC.
  const weekdayName = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
  }).format(birthDateUtc);
  const weekdayIndexByName: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const dayOfWeek = weekdayIndexByName[weekdayName] ?? birthDateUtc.getUTCDay();
  const varaInfo = VARA_NAMES[dayOfWeek];

  // 3. Nakshatra: use exact 360/27 boundaries rather than rounded table starts.
  const moonNakSpan = 360.0 / 27.0;
  const nakIndex = Math.min(26, Math.floor(moon.siderealLongitude / moonNakSpan));
  const nak = NAKSHATRAS[nakIndex];
  const exactNakStart = nakIndex * moonNakSpan;
  const nakElapsed = moon.siderealLongitude - exactNakStart;
  const pada = Math.min(4, Math.floor(nakElapsed / (moonNakSpan / 4)) + 1);
  const nakCompletedPercent = (nakElapsed / moonNakSpan) * 100;

  // 4. Nithya Yoga: (Sun + Moon) % 360 / 13°20'.
  const sumDegrees = normalizeDegrees(sun.siderealLongitude + moon.siderealLongitude);
  const yogaIndex = Math.min(26, Math.floor(sumDegrees / moonNakSpan));
  const yogaObj = NITHYA_YOGAS[yogaIndex];

  // 5. Karana: each 6° half-tithi maps to the fixed/movable 60-slot sequence.
  const karanaIndex = Math.min(59, Math.floor(elongation / 6.0));
  const karanaNum = karanaIndex + 1;
  let karanaName = '';
  let karanaType: 'Chara' | 'Sthira' = 'Chara';

  if (karanaNum === 1) {
    karanaName = FIXED_KARANAS[1].name;
    karanaType = 'Sthira';
  } else if (karanaNum >= 58) {
    karanaName = FIXED_KARANAS[karanaNum]?.name || 'Naga';
    karanaType = 'Sthira';
  } else {
    karanaName = MOVABLE_KARANAS[(karanaNum - 2) % 7].name;
    karanaType = 'Chara';
  }

  let sunriseUtc = '';
  let sunsetUtc = '';
  if (observer) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(birthDateUtc);
    const local: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') local[part.type] = parseInt(part.value, 10);
    }
    const localMidnightUtc = localDateTimeToUtcDate(
      local.year, local.month, local.day, 0, 0, 0, timezone,
    );
    const localMiddayUtc = new Date(localMidnightUtc.getTime() + 12 * 3600 * 1000);
    const rise = ephemerisProvider
      ? ephemerisProvider.getHorizonEvent(
          localMidnightUtc,
          'Sun',
          'RISE',
          { latitude: observer.latitude, longitude: observer.longitude },
        )
      : (() => {
          const observerSite = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
          const result = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observerSite, +1, localMidnightUtc, 1);
          return result ? result.date : null;
        })();
    const set = ephemerisProvider
      ? ephemerisProvider.getHorizonEvent(
          localMiddayUtc,
          'Sun',
          'SET',
          { latitude: observer.latitude, longitude: observer.longitude },
        )
      : (() => {
          const observerSite = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
          const result = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observerSite, -1, localMiddayUtc, 1);
          return result ? result.date : null;
        })();
    sunriseUtc = rise ? rise.toISOString() : '';
    sunsetUtc = set ? set.toISOString() : '';
  }

  return {
    tithi: {
      number: tithiNum,
      name: tithiName,
      paksha,
      completedPercent: Math.round(tithiCompletedPercent * 10) / 10,
    },
    vara: {
      number: dayOfWeek,
      name: varaInfo.name,
      rulingPlanet: varaInfo.lord,
    },
    nakshatra: {
      number: nak.number,
      name: nak.name,
      lord: nak.ruler,
      pada,
      completedPercent: Math.round(nakCompletedPercent * 10) / 10,
    },
    yoga: {
      number: yogaIndex + 1,
      name: yogaObj.name,
    },
    karana: {
      number: karanaNum,
      name: karanaName,
      type: karanaType,
    },
    sunriseUtc,
    sunsetUtc,
    ayanamsa: {
      type: 'lahiri',
      valueDegrees: ayanamsaDeg,
      formatted: formatDMS(ayanamsaDeg),
    },
  };
}
/**
 * Choghadiya Sequence definitions
 */
const CHOGHADIYA_PROPERTIES: Record<string, { type: 'Auspicious' | 'Inauspicious' | 'Neutral'; ruler: string; meaning: string }> = {
  Amrit: { type: 'Auspicious', ruler: 'Moon', meaning: 'Nectar — Supreme auspiciousness, ideal for all ventures' },
  Shubh: { type: 'Auspicious', ruler: 'Jupiter', meaning: 'Good — Ideal for sacred ceremonies, celebrations, and beginnings' },
  Labh: { type: 'Auspicious', ruler: 'Mercury', meaning: 'Gain — Excellent for commerce, financial transactions, and education' },
  Char: { type: 'Neutral', ruler: 'Venus', meaning: 'Movable — Favorable for travel, dynamic tasks, and machinery' },
  Rog: { type: 'Inauspicious', ruler: 'Mars', meaning: 'Disease — Avoid initiating medical treatments or starting ventures' },
  Kaal: { type: 'Inauspicious', ruler: 'Saturn', meaning: 'Loss & Danger — Avoid major activities and new contracts' },
  Udveg: { type: 'Inauspicious', ruler: 'Sun', meaning: 'Anxiety — Avoid government interactions, disputes, and investments' },
};

const DAY_CHOGHADIYA_ORDER = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sunday (0)
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Monday (1)
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tuesday (2)
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wednesday (3)
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thursday (4)
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Friday (5)
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Saturday (6)
];

const NIGHT_CHOGHADIYA_ORDER = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sunday (0)
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'], // Monday (1)
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'], // Tuesday (2)
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wednesday (3)
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thursday (4)
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'], // Friday (5)
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'], // Saturday (6)
];

const AMRITA_GHATIKA_TABLE: Array<[number, number]> = [
  [42, 46], [48, 52], [54, 58], [52, 56], [38, 42], [35, 39],
  [54, 58], [44, 48], [56, 60], [54, 58], [44, 48], [42, 46],
  [45, 49], [44, 48], [38, 42], [38, 42], [28, 34], [38, 42],
  [44, 48], [48, 52], [44, 48], [34, 38], [34, 38], [42, 46],
  [40, 44], [48, 52], [54, 58],
];

/**
 * Prasna Marga Amrita-ghatika table.
 * Values are fractions of the actual Moon nakshatra transit duration:
 * 60 nominal ghatikas span one nominal nakshatra; each listed B/E value
 * is scaled against the observed star duration for the day.
 */
export const AMRITA_KAAL_CONVENTION = {
  source: 'Prasna Marga, chapter/table on Vishaghatika-Ushna-Amrita-Mrityubhaga',
  tableUnit: 'ghatika',
  nominalNakshatraGhatikas: 60,
  note: 'Anuradha is retained as printed at 28–34 ghatikas; printed traditions differ on this row.',
} as const;

function moonSiderealLongitudeAt(
  date: Date,
  provider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): number {
  const moon = provider.getPlanetaryPositions(date).find((p) => p.name === 'Moon');
  if (!moon) throw new Error('Ephemeris provider returned no Moon position.');
  return normalizeDegrees(moon.siderealLongitude);
}

function findNakshatraTransition(
  date: Date,
  direction: -1 | 1,
  provider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): Date {
  const span = 360 / 27;
  const currentIndex = Math.min(26, Math.floor(moonSiderealLongitudeAt(date, provider) / span));
  let edge = date;
  let sample = date;
  for (let i = 0; i < 16; i++) {
    sample = new Date(sample.getTime() + direction * 6 * 3600 * 1000);
    const idx = Math.min(26, Math.floor(moonSiderealLongitudeAt(sample, provider) / span));
    if (idx !== currentIndex) {
      let lo = direction < 0 ? sample : edge;
      let hi = direction < 0 ? edge : sample;
      for (let j = 0; j < 45; j++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const idxMid = Math.min(26, Math.floor(moonSiderealLongitudeAt(mid, provider) / span));
        if (idxMid === currentIndex) {
          if (direction < 0) hi = mid;
          else lo = mid;
        } else {
          if (direction < 0) lo = mid;
          else hi = mid;
        }
      }
      return new Date((lo.getTime() + hi.getTime()) / 2);
    }
    edge = sample;
  }
  throw new Error('Unable to bracket Moon nakshatra transition within 4 days');
}

function getAmritaWindowForNakshatra(nakIndex: number, start: Date, end: Date): { start: Date; end: Date } {
  const [beginGhati, endGhati] = AMRITA_GHATIKA_TABLE[nakIndex];
  const durationMs = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() + (beginGhati / 60) * durationMs),
    end: new Date(start.getTime() + (endGhati / 60) * durationMs),
  };
}

/**
 * Real-time Comprehensive Daily Panchanga and Muhurat Calculator
 */
export function calculateComprehensiveDailyPanchanga(
  date: Date = new Date(),
  latitude: number = 28.6139,
  longitude: number = 77.2090,
  timezone: string = 'Asia/Kolkata',
  cityName: string = 'New Delhi, India',
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): ComprehensiveDailyPanchanga {
  // Provider-native astronomical calculations.
  const ayanamsaDeg = ephemerisProvider.getAyanamsa(date);

  // Sun and Moon positions
  const providerPositions = ephemerisProvider.getPlanetaryPositions(date);
  const sunPosition = providerPositions.find((p) => p.name === 'Sun');
  const moonPosition = providerPositions.find((p) => p.name === 'Moon');
  if (!sunPosition || !moonPosition) {
    throw new Error('Ephemeris provider returned incomplete Sun/Moon positions for Panchanga.');
  }

  const sunSidLon = normalizeDegrees(sunPosition.siderealLongitude);
  const moonSidLon = normalizeDegrees(moonPosition.siderealLongitude);
  const sunTropLon = normalizeDegrees(sunSidLon + ayanamsaDeg);
  const moonTropLon = normalizeDegrees(moonSidLon + ayanamsaDeg);


  const sunSignIdx = Math.floor(sunSidLon / 30);
  const moonSignIdx = Math.floor(moonSidLon / 30);

  const sunSign = ZODIAC_SIGNS[sunSignIdx];
  const moonSign = ZODIAC_SIGNS[moonSignIdx];

  const dummyPlanets: PlanetPosition[] = [
    {
      name: 'Sun',
      sanskritName: 'Surya',
      tropicalLongitude: sunTropLon,
      siderealLongitude: sunSidLon,
      sign: sunSign,
      signIndex: sunSignIdx,
      degreeInSign: sunSidLon % 30,
      formattedDegree: formatDMS(sunSidLon % 30),
      houseNumber: 1,
      nakshatra: '',
      nakshatraNumber: 1,
      nakshatraLord: 'Ketu',
      pada: 1,
      speed: 1,
      retrograde: false,
      combust: false,
      dignity: 'OWN_SIGN',
      dignityScore: 100,
      signLord: 'Sun',
      naturalRelationshipToLord: 'FRIEND',
    },
    {
      name: 'Moon',
      sanskritName: 'Chandra',
      tropicalLongitude: moonTropLon,
      siderealLongitude: moonSidLon,
      sign: moonSign,
      signIndex: moonSignIdx,
      degreeInSign: moonSidLon % 30,
      formattedDegree: formatDMS(moonSidLon % 30),
      houseNumber: 1,
      nakshatra: '',
      nakshatraNumber: 1,
      nakshatraLord: 'Ketu',
      pada: 1,
      speed: 13,
      retrograde: false,
      combust: false,
      dignity: 'OWN_SIGN',
      dignityScore: 100,
      signLord: 'Moon',
      naturalRelationshipToLord: 'FRIEND',
    },
  ];

  const basePanchanga = calculatePanchanga(
    dummyPlanets,
    date,
    ayanamsaDeg,
    { latitude, longitude, timezone },
    ephemerisProvider,
  );

  // Precise Sunrise & Sunset calculations
  const localDateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const localDay: Record<string, number> = {};
  for (const part of localDateParts) {
    if (part.type !== 'literal') localDay[part.type] = parseInt(part.value, 10);
  }

  // Horizon providers return the next event after the supplied UTC instant.
  // For a civil-day Panchanga, rise/set labels must belong to the requested
  // local calendar date. This matters especially for Moon events and across
  // DST boundaries, where the next event can legitimately fall on the next
  // local day.
  const isSameLocalCalendarDay = (candidate: Date | null): candidate is Date => {
    if (!candidate) return false;
    const candidateParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(candidate);
    const candidateDay: Record<string, number> = {};
    for (const part of candidateParts) {
      if (part.type !== 'literal') candidateDay[part.type] = parseInt(part.value, 10);
    }
    return (
      candidateDay.year === localDay.year &&
      candidateDay.month === localDay.month &&
      candidateDay.day === localDay.day
    );
  }
  const startOfDayUtc = localDateTimeToUtcDate(
    localDay.year,
    localDay.month,
    localDay.day,
    0,
    0,
    0,
    timezone,
  );
  const localMiddayUtc = localDateTimeToUtcDate(
    localDay.year,
    localDay.month,
    localDay.day,
    12,
    0,
    0,
    timezone,
  );
  const nextLocalDayDate = new Date(Date.UTC(localDay.year, localDay.month - 1, localDay.day + 1));
  const nextDayUtc = localDateTimeToUtcDate(
    nextLocalDayDate.getUTCFullYear(),
    nextLocalDayDate.getUTCMonth() + 1,
    nextLocalDayDate.getUTCDate(),
    0,
    0,
    0,
    timezone,
  );

  const sunRiseCandidate = ephemerisProvider.getHorizonEvent(
    startOfDayUtc,
    'Sun',
    'RISE',
    { latitude, longitude },
  );
  const sunSetCandidate = ephemerisProvider.getHorizonEvent(
    localMiddayUtc,
    'Sun',
    'SET',
    { latitude, longitude },
  );
  const nextSunRiseDate = ephemerisProvider.getHorizonEvent(
    nextDayUtc,
    'Sun',
    'RISE',
    { latitude, longitude },
  );

  const sunRiseDate = isSameLocalCalendarDay(sunRiseCandidate) ? sunRiseCandidate : null;
  const sunSetDate = isSameLocalCalendarDay(sunSetCandidate) ? sunSetCandidate : null;

  const sunriseDate = sunRiseDate || new Date(startOfDayUtc.getTime() + 6 * 3600 * 1000);
  const sunsetDate = sunSetDate || new Date(startOfDayUtc.getTime() + 18 * 3600 * 1000);
  const nextSunriseDate = nextSunRiseDate || new Date(sunriseDate.getTime() + 24 * 3600 * 1000);

  // Moonrise & Moonset
  const moonRiseCandidate = ephemerisProvider.getHorizonEvent(
    startOfDayUtc,
    'Moon',
    'RISE',
    { latitude, longitude },
  );
  const moonSetCandidate = ephemerisProvider.getHorizonEvent(
    localMiddayUtc,
    'Moon',
    'SET',
    { latitude, longitude },
  );
  const moonRiseDate = isSameLocalCalendarDay(moonRiseCandidate) ? moonRiseCandidate : null;
  const moonSetDate = isSameLocalCalendarDay(moonSetCandidate) ? moonSetCandidate : null;
  const moonriseStr = moonRiseDate ? formatLocalTime(moonRiseDate, timezone) : 'No Moonrise';
  const moonsetStr = moonSetDate ? formatLocalTime(moonSetDate, timezone) : 'No Moonset';

  // Durations
  const dayMs = Math.max(1000, sunsetDate.getTime() - sunriseDate.getTime());
  const nightMs = Math.max(1000, nextSunriseDate.getTime() - sunsetDate.getTime());

  const dayHrs = Math.floor(dayMs / (3600 * 1000));
  const dayMins = Math.floor((dayMs % (3600 * 1000)) / (60 * 1000));
  const nightHrs = Math.floor(nightMs / (3600 * 1000));
  const nightMins = Math.floor((nightMs % (3600 * 1000)) / (60 * 1000));

  const dayPartMs = dayMs / 8;
  const nightPartMs = nightMs / 8;
  const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(date);
  const dayOfWeek = ({
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  } as Record<string, number>)[weekdayName] ?? date.getUTCDay();

  // Rahu Kaal, Yamaganda, Gulika Kaal portions (1-indexed 1..8)
  const rahuPortions = [8, 2, 7, 5, 6, 4, 3]; // Sun=8th, Mon=2nd, Tue=7th, Wed=5th, Thu=6th, Fri=4th, Sat=3rd
  const yamaPortions = [5, 4, 3, 2, 1, 7, 6];
  const guliPortions = [7, 6, 5, 4, 3, 2, 1];

  const getWindow = (portionIdx: number) => {
    const start = new Date(sunriseDate.getTime() + (portionIdx - 1) * dayPartMs);
    const end = new Date(sunriseDate.getTime() + portionIdx * dayPartMs);
    return {
      start: formatLocalTime(start, timezone),
      end: formatLocalTime(end, timezone),
    };
  };

  const rahuWindow = getWindow(rahuPortions[dayOfWeek]);
  const yamaWindow = getWindow(yamaPortions[dayOfWeek]);
  const guliWindow = getWindow(guliPortions[dayOfWeek]);

  // Abhijit Muhurat: 8th Muhurat of the day (daytime / 15 * 7 to 8)
  const muhurat15Ms = dayMs / 15;
  const abhijitStart = new Date(sunriseDate.getTime() + 7 * muhurat15Ms);
  const abhijitEnd = new Date(sunriseDate.getTime() + 8 * muhurat15Ms);
  const isAbhijitAuspicious = dayOfWeek !== 3; // Common panchanga convention: avoided on Wednesday

  // Brahma Muhurat: 2 Muhurats before sunrise (96 min to 48 min before sunrise)
  const brahmaStart = new Date(sunriseDate.getTime() - 96 * 60 * 1000);
  const brahmaEnd = new Date(sunriseDate.getTime() - 48 * 60 * 1000);

  // Vijaya Muhurat: 11th Muhurat of the day (10 to 11 of 15)
  const vijayaStart = new Date(sunriseDate.getTime() + 10 * muhurat15Ms);
  const vijayaEnd = new Date(sunriseDate.getTime() + 11 * muhurat15Ms);

  // Amrit Kaal is nakshatra-based, not a fixed daytime muhurta.
  // Collect every Amrita window whose actual Moon-star interval touches this
  // local Panchanga day; a date can therefore contain 0, 1, or 2 windows.
  const amritaWindows: Array<{ start: Date; end: Date }> = [];
  let cursor = startOfDayUtc;
  for (let i = 0; i < 4 && cursor.getTime() < nextDayUtc.getTime(); i++) {
    const span = 360 / 27;
    const nakIndex = Math.min(26, Math.floor(moonSiderealLongitudeAt(cursor, ephemerisProvider) / span));
    const starStart = findNakshatraTransition(cursor, -1, ephemerisProvider);
    const starEnd = findNakshatraTransition(cursor, 1, ephemerisProvider);
    const amrita = getAmritaWindowForNakshatra(nakIndex, starStart, starEnd);
    if (amrita.end.getTime() > startOfDayUtc.getTime() && amrita.start.getTime() < nextDayUtc.getTime()) {
      amritaWindows.push({
        start: amrita.start,
        end: amrita.end,
      });
    }
    cursor = new Date(starEnd.getTime() + 1000);
  }

  // Dur Muhurtam: weekday-specific daytime muhurta slots.
  // This follows the common Drik-Ganita / Muhurta Chintamani table.
  // Some regional panchangams use two slots on certain weekdays; keep the
  // engine's legacy single-window API by selecting the first published slot.
  const durMuhuratSlots: Record<number, number[]> = {
    0: [14],      // Sunday
    1: [9, 12],   // Monday
    2: [4],       // Tuesday
    3: [8],       // Wednesday
    4: [6, 12],   // Thursday
    5: [4, 12],   // Friday
    6: [1, 2],    // Saturday
  };
  const durSlot = durMuhuratSlots[dayOfWeek][0];
  const durMuhuratStart = new Date(sunriseDate.getTime() + (durSlot - 1) * muhurat15Ms);
  const durMuhuratEnd = new Date(durMuhuratStart.getTime() + muhurat15Ms);

  // Choghadiya Day & Night
  const nowMs = date.getTime();

  const dayChoghadiyaNames = DAY_CHOGHADIYA_ORDER[dayOfWeek];
  const choghadiyaDay = dayChoghadiyaNames.map((name, idx) => {
    const sDate = new Date(sunriseDate.getTime() + idx * dayPartMs);
    const eDate = new Date(sunriseDate.getTime() + (idx + 1) * dayPartMs);
    const props = CHOGHADIYA_PROPERTIES[name];
    const isActive = nowMs >= sDate.getTime() && nowMs < eDate.getTime();
    return {
      period: idx + 1,
      name,
      type: props.type,
      start: formatLocalTime(sDate, timezone),
      end: formatLocalTime(eDate, timezone),
      ruler: props.ruler,
      meaning: props.meaning,
      isActive,
    };
  });

  const nightChoghadiyaNames = NIGHT_CHOGHADIYA_ORDER[dayOfWeek];
  const choghadiyaNight = nightChoghadiyaNames.map((name, idx) => {
    const sDate = new Date(sunsetDate.getTime() + idx * nightPartMs);
    const eDate = new Date(sunsetDate.getTime() + (idx + 1) * nightPartMs);
    const props = CHOGHADIYA_PROPERTIES[name];
    const isActive = nowMs >= sDate.getTime() && nowMs < eDate.getTime();
    return {
      period: idx + 1,
      name,
      type: props.type,
      start: formatLocalTime(sDate, timezone),
      end: formatLocalTime(eDate, timezone),
      ruler: props.ruler,
      meaning: props.meaning,
      isActive,
    };
  });

  // Tithi Details
  const tithiIdx = basePanchanga.tithi.number - 1;
  const tithiDetail = {
    number: basePanchanga.tithi.number,
    name: basePanchanga.tithi.name,
    paksha: basePanchanga.tithi.paksha,
    completedPercent: basePanchanga.tithi.completedPercent,
    deity: TITHI_DEITIES[tithiIdx] || 'Supreme Divinity',
    nature: TITHI_NATURES[tithiIdx] || 'Neutral',
  };

  // Nakshatra Details
  const nakIdx = basePanchanga.nakshatra.number - 1;
  const nakObj = NAKSHATRAS[nakIdx] || NAKSHATRAS[0];
  const nakshatraDetail = {
    number: basePanchanga.nakshatra.number,
    name: basePanchanga.nakshatra.name,
    lord: basePanchanga.nakshatra.lord,
    pada: basePanchanga.nakshatra.pada,
    completedPercent: basePanchanga.nakshatra.completedPercent,
    deity: nakObj.deity,
    symbol: nakObj.sanskritName,
  };

  // Yoga Details
  const yogaIdx = basePanchanga.yoga.number - 1;
  const yogaObj = NITHYA_YOGAS[yogaIdx] || NITHYA_YOGAS[0];
  const yogaDetail = {
    number: basePanchanga.yoga.number,
    name: yogaObj.name,
    quality: yogaObj.quality,
    meaning: yogaObj.meaning,
  };

  // Karana Details
  const karanaNum = basePanchanga.karana.number;
  let karanaDeity = 'Universal Energy';
  let karanaNature = 'Regular worldly actions';

  if (FIXED_KARANAS[karanaNum]) {
    karanaDeity = FIXED_KARANAS[karanaNum].deity;
    karanaNature = FIXED_KARANAS[karanaNum].nature;
  } else {
    const movObj = MOVABLE_KARANAS[(karanaNum - 2) % 7];
    if (movObj) {
      karanaDeity = movObj.deity;
      karanaNature = movObj.nature;
    }
  }

  const karanaDetail = {
    number: karanaNum,
    name: basePanchanga.karana.name,
    type: basePanchanga.karana.type,
    deity: karanaDeity,
    nature: karanaNature,
  };

  const varaDetail = {
    name: VARA_NAMES[dayOfWeek].name,
    english: VARA_NAMES[dayOfWeek].english,
    lord: VARA_NAMES[dayOfWeek].lord,
    deity: VARA_NAMES[dayOfWeek].deity,
  };

  const formattedDateStr = date.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    date,
    formattedDate: formattedDateStr,
    cityName,
    latitude,
    longitude,
    timezone,
    panchanga: basePanchanga,
    tithiDetail,
    nakshatraDetail,
    yogaDetail,
    karanaDetail,
    varaDetail,
    solarLunar: {
      sunrise: formatLocalTime(sunriseDate, timezone),
      sunset: formatLocalTime(sunsetDate, timezone),
      moonrise: moonriseStr,
      moonset: moonsetStr,
      dayDuration: `${dayHrs}h ${dayMins}m`,
      nightDuration: `${nightHrs}h ${nightMins}m`,
      sunSign: `${sunSign} (${SANSKRIT_SIGNS[sunSign]})`,
      sunDegree: formatDMS(sunSidLon % 30),
      moonSign: `${moonSign} (${SANSKRIT_SIGNS[moonSign]})`,
      moonDegree: formatDMS(moonSidLon % 30),
      ayanamsa: formatDMS(ayanamsaDeg),
    },
    muhurats: {
      amritKaalWindows: amritaWindows.map((w) => ({
        start: formatLocalTime(w.start, timezone),
        end: formatLocalTime(w.end, timezone),
      })),
      abhijit: {
        start: formatLocalTime(abhijitStart, timezone),
        end: formatLocalTime(abhijitEnd, timezone),
        status: isAbhijitAuspicious ? 'Highly Auspicious' : 'Avoid',
        description: isAbhijitAuspicious
          ? 'Midday golden window, removes obstacles and brings victory for major deeds.'
          : 'Avoided on Wednesday (Budhavara) as per classical Muhurat rules.',
      },
      brahma: {
        start: formatLocalTime(brahmaStart, timezone),
        end: formatLocalTime(brahmaEnd, timezone),
        status: 'Highly Auspicious',
        description: 'Pre-dawn divine hour, optimal for meditation, study, yoga, and spiritual prayer.',
      },
      amritKaal: {
        start: amritaWindows.length > 0 ? formatLocalTime(amritaWindows[0].start, timezone) : '',
        end: amritaWindows.length > 0 ? formatLocalTime(amritaWindows[0].end, timezone) : '',
        status: 'Auspicious',
        description: 'Nakshatra-specific Amrita Kaal from the Prasna Marga Amrita-ghatika table, scaled to the Moon’s actual star transit. Multiple windows may occur in one civil day.',
      },
      vijaya: {
        start: formatLocalTime(vijayaStart, timezone),
        end: formatLocalTime(vijayaEnd, timezone),
        status: 'Auspicious',
        description: 'Victorious hour, ideal for launching lawsuits, debates, exams, and competitions.',
      },
      rahuKaal: {
        start: rahuWindow.start,
        end: rahuWindow.end,
        status: 'Inauspicious',
        description: 'Rahu-governed period. Avoid beginning travel, signing agreements, or buying assets.',
      },
      yamaganda: {
        start: yamaWindow.start,
        end: yamaWindow.end,
        status: 'Inauspicious',
        description: 'Yamaganda period. Highly discouraged for vital celebrations and financial investments.',
      },
      gulika: {
        start: guliWindow.start,
        end: guliWindow.end,
        status: 'Inauspicious',
        description: 'Saturnian Gulika window. Avoid starting new partnerships or auspicious undertakings.',
      },
      durMuhurat: {
        start: formatLocalTime(durMuhuratStart, timezone),
        end: formatLocalTime(durMuhuratEnd, timezone),
        status: 'Inauspicious',
        description: 'Weekday-selected Dur Muhurtam slot from the daytime fifteen-muhurta division. Regional panchangams may publish a second slot on some weekdays.',
      },
    },
    choghadiyaDay,
    choghadiyaNight,
  };
}
