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
import type { SiderealEphemerisSnapshot } from './ephemeris.ts';
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
/**
 * Backward-compatible alias for callers that previously imported this symbol.
 * This is demo data, NOT an astronomical golden/reference vector.
 */
export const GOLDEN_BENCHMARK_PROFILE = DEFAULT_BIRTH_PROFILE;

/** Explicit name for the built-in demo chart. */
export const DEFAULT_DEMO_PROFILE = DEFAULT_BIRTH_PROFILE;

/** Stable non-production profile used by engine integrity tests. */
export const TEST_BENCHMARK_PROFILE: BirthProfile = {
  name: 'Canonical Test Native',
  year: 2005,
  month: 8,
  day: 17,
  hour: 0,
  minute: 2,
  second: 0,
  latitude: 16.93407,
  longitude: 81.95522,
  timezone: 'Asia/Kolkata',
  cityName: 'Anaparthy, Andhra Pradesh, India',
  gender: 'male',
};

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
 * Convert a runtime ephemeris snapshot into the canonical Ascendant shape.
 */
function ascendantFromEphemerisSnapshot(snapshot: SiderealEphemerisSnapshot): ReturnType<typeof calculateAscendant> {
  const siderealLongitude = normalizeDegrees(snapshot.ascendantSiderealLongitude);
  const signIndex = Math.floor(siderealLongitude / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = siderealLongitude % 30;
  const nakInfo = getNakshatraAndPada(siderealLongitude);

  return {
    tropicalLongitude: normalizeDegrees(siderealLongitude + snapshot.ayanamsha.degrees),
    siderealLongitude,
    sign,
    signIndex,
    degreeInSign,
    formattedDegree: formatDMS(degreeInSign),
    nakshatra: nakInfo.nakshatra,
    nakshatraNumber: nakInfo.nakshatraNumber,
    nakshatraLord: nakInfo.nakshatraLord,
    pada: nakInfo.pada,
  };
}

/**
 * Convert a runtime ephemeris snapshot into canonical D1 PlanetPosition facts.
 * Dignity is deliberately left to the existing canonical dignity engine.
 */
function planetsFromEphemerisSnapshot(
  snapshot: SiderealEphemerisSnapshot,
  ascendantSignIndex: number,
): PlanetPosition[] {
  const sun = snapshot.planets.find((p) => p.name === 'Sun');
  const sunSiderealLongitude = sun
    ? normalizeDegrees(sun.siderealLongitude)
    : undefined;

  return snapshot.planets.map((planet) => {
    const siderealLongitude = normalizeDegrees(planet.siderealLongitude);
    const signIndex = Math.floor(siderealLongitude / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = siderealLongitude % 30;
    const speed = planet.longitudeSpeed ?? 0;
    const nakInfo = getNakshatraAndPada(siderealLongitude);

    let combust = false;
    if (sunSiderealLongitude !== undefined && planet.name !== 'Sun' && planet.name !== 'Rahu' && planet.name !== 'Ketu') {
      const diff = Math.min(
        Math.abs(siderealLongitude - sunSiderealLongitude),
        360 - Math.abs(siderealLongitude - sunSiderealLongitude),
      );
      const combustionOrbs: Record<string, number> = {
        Moon: 12.0,
        Mars: 17.0,
        Mercury: speed < 0 ? 12.0 : 14.0,
        Jupiter: 11.0,
        Venus: speed < 0 ? 8.0 : 10.0,
        Saturn: 15.0,
      };
      combust = diff <= (combustionOrbs[planet.name] || 10.0);
    }

    return {
      name: planet.name,
      sanskritName: SANSKRIT_PLANET_NAMES[planet.name],
      tropicalLongitude: normalizeDegrees(siderealLongitude + snapshot.ayanamsha.degrees),
      siderealLongitude,
      sign,
      signIndex,
      degreeInSign,
      formattedDegree: formatDMS(degreeInSign),
      houseNumber: ((signIndex - ascendantSignIndex + 12) % 12) + 1,
      nakshatra: nakInfo.nakshatra,
      nakshatraNumber: nakInfo.nakshatraNumber,
      nakshatraLord: nakInfo.nakshatraLord,
      pada: nakInfo.pada,
      speed,
      retrograde: speed < 0,
      combust,
      dignity: 'NEUTRAL',
      dignityScore: 0,
      signLord: SIGN_LORDS[sign],
      naturalRelationshipToLord: 'NEUTRAL',
    };
  });
}

/**
 * Compute the complete canonical astrological dataset for a birth profile.
 * An optional precomputed ephemeris snapshot can be injected by a runtime
 * provider; when absent, the validated Astronomy Engine path is unchanged.
 */
export function computeCanonicalChart(
  profile: BirthProfile = GOLDEN_BENCHMARK_PROFILE,
  evaluationDateUtc: Date = new Date(),
  ephemerisSnapshot?: SiderealEphemerisSnapshot,
): AIInterpretationContext {
  // 1. Precise astronomical time conversion
  const birthUtcDate = birthProfileToUtcDate(profile);
  const astroTime = new Astronomy.AstroTime(birthUtcDate);

  // 2. Lahiri Ayanamsha (Chitra Paksha)
  const ayanamsha = ephemerisSnapshot?.ayanamsha.degrees ?? calculateLahiriAyanamsha(astroTime);

  // 3. Ascendant (Lagna)
  const ascendant = ephemerisSnapshot
    ? ascendantFromEphemerisSnapshot(ephemerisSnapshot)
    : calculateAscendant(
        astroTime,
        profile.latitude,
        profile.longitude,
        ayanamsha,
      );

  // 4. D1 Planetary Positions
  const rawPlanets = ephemerisSnapshot
    ? planetsFromEphemerisSnapshot(ephemerisSnapshot, ascendant.signIndex)
    : calculatePlanetaryPositions(
        astroTime,
        ayanamsha,
        ascendant.signIndex,
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
  const strength = calculateStrengthFacts(
    planets,
    ascendant.signIndex,
    profile.hour + profile.minute / 60 + (profile.second || 0) / 3600,
  );

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
    timingSignals,
    ephemerisSnapshot,
  );

  return {
    schemaVersion: '1.0',
    generatedAtIso: new Date().toISOString(),
    ephemeris: ephemerisSnapshot,
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
  const tz = timezone || 'Asia/Kolkata';
  const localParts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const local: Record<string, number> = {};
  for (const part of localParts) {
    if (part.type !== 'literal') local[part.type] = parseInt(part.value, 10);
  }

  const profile: BirthProfile = {
    name: 'Today Live Transit',
    year: local.year,
    month: local.month,
    day: local.day,
    hour: local.hour === 24 ? 0 : local.hour,
    minute: local.minute,
    second: local.second,
    latitude,
    longitude,
    timezone: tz,
  };

  const chart = computeCanonicalChart(profile, date);
  return chart.panchanga;
}
