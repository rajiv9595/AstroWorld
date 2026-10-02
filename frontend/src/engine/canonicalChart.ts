/**
 * ASTROWORLD — Canonical Chart Orchestrator
 * Pipeline: Astronomical Calculation -> Canonical Astrological Facts -> Classical Rule Engine -> Evidence/Provenance -> Interpretation Context.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import {
  birthProfileToUtcDate,
  calculateAscendant,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
} from './astronomy.ts';
import { calculateAshtakavarga } from './ashtakavarga.ts';
import { SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import { calculateVimshottariDasha } from './dasha.ts';
import { enrichPlanetaryDignity } from './dignity.ts';
import { calculateJaiminiFacts } from './jaimini.ts';
import { calculatePanchanga } from './panchanga.ts';
import { calculateTimingSignals } from './predictions.ts';
import { buildEvidencePool } from './provenance.ts';
import { calculateStrengthFacts } from './shadbala.ts';
import { calculateTransits } from './transits.ts';
import {
  AIInterpretationContext,
  BirthProfile,
  HouseInfo,
  PanchangaFacts,
  PlanetName,
} from './types.ts';
import { generateAllShodashavargas } from './vargas.ts';
import { calculateYogasAndDoshas } from './yogas.ts';

export const DEFAULT_BIRTH_PROFILE: BirthProfile = {
  name: 'Swami Vivekananda',
  year: 1863,
  month: 1,
  day: 12,
  hour: 6,
  minute: 33,
  second: 0,
  latitude: 22.5726,
  longitude: 88.3639,
  timezone: 'Asia/Kolkata',
  cityName: 'Kolkata, West Bengal, India',
};

// Aliased for canonical engine references
export const GOLDEN_BENCHMARK_PROFILE = DEFAULT_BIRTH_PROFILE;

/**
 * Intelligently detect whether the birthplace belongs to South India
 * (Andhra Pradesh, Telangana, Tamil Nadu, Karnataka, Kerala, Puducherry, Sri Lanka,
 * or geographic coordinates South of ~20.2°N in South Asia) or North India / Global.
 */
export function detectRegionalChartStyle(profile: BirthProfile): 'NORTH_INDIAN' | 'SOUTH_INDIAN' {
  const city = (profile.cityName || '').toLowerCase();
  const lat = Number(profile.latitude);
  const lon = Number(profile.longitude);

  // 1. Check for prominent South Indian keywords in city / state / region name
  const southKeywords = [
    'andhra', 'telangana', 'tamil', 'karnataka', 'kerala', 'puducherry', 'pondicherry',
    'hyderabad', 'secunderabad', 'chennai', 'madras', 'bengaluru', 'bangalore', 'visakhapatnam', 'vizag',
    'vijayawada', 'anaparthy', 'anaparthi', 'rajahmundry', 'rajamahendravaram', 'guntur', 'tirupati',
    'coimbatore', 'madurai', 'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram', 'mysore', 'mysuru',
    'mangalore', 'mangaluru', 'calicut', 'kozhikode', 'amaravati', 'kakinada', 'warangal', 'nellore',
    'salem', 'trichy', 'tiruchirappalli', 'thrissur', 'kollam', 'palakkad', 'hubli', 'belgaum', 'belagavi',
    'kottayam', 'alappuzha', 'alleppey', 'bellary', 'ballari', 'davanagere', 'shivamogga', 'shimoga',
    'kurnool', 'kadapa', 'anantapur', 'chittoor', 'eluru', 'ongole', 'machilipatnam', 'srikakulam',
    'vizianagaram', 'nizamabad', 'khammam', 'karimnagar', 'ramagundam', 'mahabubnagar', 'nalgonda',
    'suryapet', 'mancherial', 'adoni', 'nandyal', 'proddatur', 'hindupur', 'bhimavaram', 'madanapalle',
    'tadepalligudem', 'dharmavaram', 'guntakal', 'srikalahasti', 'tenali', 'narasaraopet', 'chilakaluripet',
    'vellore', 'erode', 'tiruppur', 'thoothukudi', 'tuticorin', 'dindigul', 'thanjavur', 'ranipet',
    'sivakasi', 'karur', 'ooty', 'udhagamandalam', 'hosur', 'nagercoil', 'kanchipuram', 'kumarakom',
    'kannur', 'kasaragod', 'malappuram', 'wayanad', 'idukki', 'pathanamthitta', 'gulbarga', 'kalaburagi',
    'bijapur', 'vijayapura', 'udupi', 'hassan', 'bidar', 'raichur', 'gadag', 'bagalkot', 'tumkur',
    'tumakuru', 'kolar', 'mandya', 'chikmagalur', 'sri lanka', 'colombo', 'jaffna', 'kandy'
  ];

  if (southKeywords.some((kw) => city.includes(kw))) {
    return 'SOUTH_INDIAN';
  }

  // 2. Geographic latitude & longitude coordinate check for Peninsular / South India
  // Indian subcontinent longitudes are ~68°E to ~92°E
  // South India lies between Latitude 6.0°N and 20.2°N
  if (!isNaN(lat) && lat > 6.0 && lat <= 20.2) {
    if (isNaN(lon) || (lon >= 68.0 && lon <= 92.0)) {
      return 'SOUTH_INDIAN';
    }
  }

  return 'NORTH_INDIAN';
}

/**
 * Generate 12 whole sign houses and identify occupants and aspects.
 */
function buildHouses(
  ascendantSignIndex: number,
  planets: ReturnType<typeof enrichPlanetaryDignity>
): HouseInfo[] {
  const houseSignifications: string[] = [
    'Self, Physical Vitality, Appearance, Longevity, General Character (Tanu Bhava)',
    'Wealth, Family Assets, Speech, Food, Material Resources (Dhana Bhava)',
    'Siblings, Valour, Communication, Hands, Short Travel (Sahaja Bhava)',
    'Mother, Domestic Life, Real Estate, Vehicles, Inner Peace (Sukha Bhava)',
    'Children, Intellect, Speculative Wisdom, Purva Punya, Mantras (Putra Bhava)',
    'Enemies, Obstacles, Debts, Disease, Competitive Service (Ari Bhava)',
    'Spouse, Marriage, Long-term Partnerships, Public Relations (Yuvati Bhava)',
    'Longevity, Transformation, Mysteries, Sudden Events, Inheritance (Randhra Bhava)',
    'Father, Higher Dharma, Gurus, Fortune, Pilgrimage, Ethics (Dharma Bhava)',
    'Career, Profession, Social Status, Actions, Public Glory (Karma Bhava)',
    'Gains, Aspirations, Eldest Sibling, Social Networks, Profits (Labha Bhava)',
    'Losses, Liberation, Foreign Lands, Expenditure, Subconscious (Vyaya Bhava)',
  ];

  const houses: HouseInfo[] = [];

  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascendantSignIndex + (h - 1)) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const lord = SIGN_LORDS[sign];

    const occupants = planets
      .filter((p) => p.houseNumber === h)
      .map((p) => p.name);

    // Aspecting planets (Classical full aspects)
    const aspectingPlanets: PlanetName[] = [];
    for (const p of planets) {
      if (p.houseNumber === h) continue;
      const diff = (h - p.houseNumber + 12) % 12;
      // 7th house aspect (diff = 6)
      if (diff === 6) aspectingPlanets.push(p.name);
      // Mars 4th and 8th (diff = 3 or 7)
      if (p.name === 'Mars' && (diff === 3 || diff === 7)) aspectingPlanets.push('Mars');
      // Jupiter 5th and 9th (diff = 4 or 8)
      if (p.name === 'Jupiter' && (diff === 4 || diff === 8)) aspectingPlanets.push('Jupiter');
      // Saturn 3rd and 10th (diff = 2 or 9)
      if (p.name === 'Saturn' && (diff === 2 || diff === 9)) aspectingPlanets.push('Saturn');
      // Nodes 5th and 9th
      if ((p.name === 'Rahu' || p.name === 'Ketu') && (diff === 4 || diff === 8)) {
        aspectingPlanets.push(p.name);
      }
    }

    houses.push({
      houseNumber: h,
      sign,
      signIndex,
      lord,
      occupants,
      aspectingPlanets: Array.from(new Set(aspectingPlanets)),
      significance: houseSignifications[h - 1],
    });
  }

  return houses;
}

/**
 * Compute the complete canonical astrological dataset for a birth profile.
 */
export function computeCanonicalChart(
  profile: BirthProfile = GOLDEN_BENCHMARK_PROFILE,
  evaluationDateUtc: Date = new Date()
): AIInterpretationContext {
  // 1. Precise astronomical time conversion
  const birthUtcDate = birthProfileToUtcDate(profile);
  const astroTime = new Astronomy.AstroTime(birthUtcDate);

  // 2. Lahiri Ayanamsha (Chitra Paksha)
  const ayanamsha = calculateLahiriAyanamsha(astroTime);

  // 3. Ascendant (Lagna)
  const ascendant = calculateAscendant(
    astroTime,
    profile.latitude,
    profile.longitude,
    ayanamsha
  );

  // 4. D1 Planetary Positions
  const rawPlanets = calculatePlanetaryPositions(
    astroTime,
    ayanamsha,
    ascendant.signIndex
  );

  // 5. Canonical Dignities
  const planets = enrichPlanetaryDignity(rawPlanets);

  // 6. 12 Houses
  const houses = buildHouses(ascendant.signIndex, planets);

  // 7. Shodashavargas (All 16 Divisional Charts)
  const vargas = generateAllShodashavargas(ascendant.siderealLongitude, planets);

  // 8. Panchanga
  const panchanga = calculatePanchanga(planets, birthUtcDate, ayanamsha);

  // 9. Vimshottari Dasha
  const moon = planets.find((p) => p.name === 'Moon')!;
  const dasha = calculateVimshottariDasha(
    moon.siderealLongitude,
    birthUtcDate,
    evaluationDateUtc
  );

  // 10. Strength (Shadbala, Bhava Bala, Avasthas)
  const strength = calculateStrengthFacts(planets, ascendant.signIndex, profile.hour);

  // 11. Yogas and Doshas
  const { yogas, doshas } = calculateYogasAndDoshas(planets, ascendant.sign);

  // 12. Jaimini Astrology
  const jaimini = calculateJaiminiFacts(planets, ascendant.signIndex, vargas['D9']);

  // 13. Ashtakavarga (337 Bindus)
  const ashtakavarga = calculateAshtakavarga(planets, ascendant.signIndex);

  // 14. Transits (Gochara)
  const transits = calculateTransits(
    planets,
    ascendant.signIndex,
    ashtakavarga,
    evaluationDateUtc
  );

  // 15. Timing and Predictions
  const timingSignals = calculateTimingSignals(
    dasha,
    transits,
    ashtakavarga,
    yogas,
    planets
  );

  // 16. Evidence and Provenance Pool
  const evidencePool = buildEvidencePool(
    ascendant,
    planets,
    houses,
    vargas,
    panchanga,
    dasha,
    strength,
    yogas,
    doshas,
    jaimini,
    ashtakavarga,
    transits,
    timingSignals
  );

  return {
    schemaVersion: '1.0',
    generatedAtIso: new Date().toISOString(),
    birthProfile: profile,
    ascendant,
    planets,
    houses,
    vargas,
    panchanga,
    dasha,
    strength,
    yogas,
    doshas,
    jaimini,
    ashtakavarga,
    transits,
    timingSignals,
    evidencePool,
  };
}

/**
 * Real-Time Daily Live Panchang Calculator.
 * Dynamically computes Tithi, Nakshatra, Yoga, Karana, and Vara
 * for the exact current moment (Today, Tomorrow, or any target date).
 */
export function getLiveDailyPanchanga(
  date: Date = new Date(),
  latitude: number = 28.6139,
  longitude: number = 77.2090,
  timezone: string = 'Asia/Kolkata'
): PanchangaFacts {
  const profile: BirthProfile = {
    name: 'Today Live Transit',
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    latitude,
    longitude,
    timezone: timezone || 'Asia/Kolkata',
  };

  const chart = computeCanonicalChart(profile, date);
  return chart.panchanga;
}
