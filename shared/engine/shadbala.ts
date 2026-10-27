/**
 * ASTROWORLD — Shadbala, Bhava Bala, and Avastha Engine
 * Classical Parashari strength calculations (Virupas & Rupas).
 */

import {
  MOOLATRIKONA_MAP,
  NAISARGIKA_RELATIONSHIPS,
  OWN_SIGNS_MAP,
  SIGN_LORDS,
  ZODIAC_SIGNS,
} from './constants.ts';
import { calculateVargaSignIndex } from './vargas.ts';
import { hasParashariFullAspect } from './aspects.ts';
import {
  BhavaBalaItem,
  PlanetName,
  PlanetaryAvasthas,
  PlanetPosition,
  ShadbalaCalculationOptions,
  ShadbalaFactor,
  ShadbalaSubBreakdown,
  StrengthFacts,
  ZodiacSign,
} from './types.ts';

// Classical minimum required Virupas for 7 bodies
const MIN_REQUIRED_VIRUPAS: Record<PlanetName, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
  Rahu: 300,
  Ketu: 300,
};

// Fixed natural strength (Naisargika Bala) in Virupas.
const NAISARGIKA_BALA: Record<PlanetName, number> = {
  Sun: 60.0, Moon: 51.43, Venus: 42.86, Jupiter: 34.29,
  Mercury: 25.71, Mars: 17.14, Saturn: 8.57,
  Rahu: 15.0, Ketu: 15.0,
};

const CLASSICAL_SHADBALA_BODIES: PlanetName[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
];

const SAPTAVARGA_CODES = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'] as const;

function circularDistanceDegrees(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return Math.min(raw, 360 - raw);
}

function calculateUcchaBala(planet: PlanetPosition): number {
  const ex: Partial<Record<PlanetName, { sign: ZodiacSign; deepDegree: number }>> = {
    Sun: { sign: 'Aries', deepDegree: 10 },
    Moon: { sign: 'Taurus', deepDegree: 3 },
    Mars: { sign: 'Capricorn', deepDegree: 28 },
    Mercury: { sign: 'Virgo', deepDegree: 15 },
    Jupiter: { sign: 'Cancer', deepDegree: 5 },
    Venus: { sign: 'Pisces', deepDegree: 27 },
    Saturn: { sign: 'Libra', deepDegree: 20 },
  };
  const point = ex[planet.name];
  if (!point) return 0;
  const exaltationLongitude = ZODIAC_SIGNS.indexOf(point.sign) * 30 + point.deepDegree;
  return Math.max(0, Math.round((60 - circularDistanceDegrees(planet.siderealLongitude, exaltationLongitude) / 3) * 100) / 100);
}

function calculateSaptavargajaBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const score = { greatFriend: 22.5, friend: 15, neutral: 7.5, enemy: 3.75, greatEnemy: 1.875 };
  const permanent = NAISARGIKA_RELATIONSHIPS[planet.name];
  const temporaryFriendHouses = new Set([2, 3, 4, 10, 11, 12]);

  const total = SAPTAVARGA_CODES.reduce((sum, code) => {
    const placement = calculateVargaSignIndex(code, planet.siderealLongitude);
    const sign = ZODIAC_SIGNS[placement.signIndex];
    const owner = SIGN_LORDS[sign];

    if ((code === 'D1') && MOOLATRIKONA_MAP[planet.name]?.sign === sign &&
        placement.degreeInVargaSign >= MOOLATRIKONA_MAP[planet.name]!.startDegree &&
        placement.degreeInVargaSign < MOOLATRIKONA_MAP[planet.name]!.endDegree) {
      return sum + 45;
    }
    if ((OWN_SIGNS_MAP[planet.name] || []).includes(sign)) return sum + 30;
    if (!permanent) return sum + score.neutral;

    const natural =
      permanent.friends.includes(owner) ? 1 :
      permanent.enemies.includes(owner) ? -1 : 0;

    const ownerPlanet = planets.find(p => p.name === owner);
    const temporary = ownerPlanet
      ? (temporaryFriendHouses.has(((ownerPlanet.houseNumber - planet.houseNumber + 12) % 12) + 1) ? 1 : -1)
      : 0;

    const compound = natural + temporary;
    if (compound >= 2) return sum + score.greatFriend;
    if (compound === 1) return sum + score.friend;
    if (compound === 0) return sum + score.neutral;
    if (compound === -1) return sum + score.enemy;
    return sum + score.greatEnemy;
  }, 0);

  return Math.round(total * 100) / 100;
}

function calculateOjaYugmaBala(planet: PlanetPosition): number {
  const female = planet.name === 'Moon' || planet.name === 'Venus';
  const d1Matches = female ? planet.signIndex % 2 === 1 : planet.signIndex % 2 === 0;
  const d9 = calculateVargaSignIndex('D9', planet.siderealLongitude);
  const d9Matches = female ? d9.signIndex % 2 === 1 : d9.signIndex % 2 === 0;
  return (d1Matches ? 15 : 0) + (d9Matches ? 15 : 0);
}

function calculateKendradiBala(house: number): number {
  if ([1, 4, 7, 10].includes(house)) return 60;
  if ([2, 5, 8, 11].includes(house)) return 30;
  return 15;
}

function calculateDrekkanaBala(planet: PlanetPosition): number {
  const deg = planet.degreeInSign;
  if (['Sun', 'Mars', 'Jupiter'].includes(planet.name)) return deg < 10 ? 15 : 0;
  if (['Mercury', 'Saturn'].includes(planet.name)) return deg >= 10 && deg < 20 ? 15 : 0;
  if (['Moon', 'Venus'].includes(planet.name)) return deg >= 20 ? 15 : 0;
  return 0;
}

// House where each planet gets maximum Dig Bala (Directional Strength - 60 Virupas)
const DIG_BALA_OPTIMAL_HOUSES: Record<PlanetName, number> = {
  Jupiter: 1, // East / Lagna
  Mercury: 1,
  Moon: 4, // North / Nadir
  Venus: 4,
  Saturn: 7, // West / Descendant
  Sun: 10, // South / Midheaven
  Mars: 10,
  Rahu: 10,
  Ketu: 4,
};

/**
 * Compute Dig Bala (0 to 60 Virupas) based on distance from optimal house (classical_partial contract).
 */
function calculateDigBala(planet: PlanetName, house: number): number {
  const optHouse = DIG_BALA_OPTIMAL_HOUSES[planet];
  if (!optHouse) return 0;
  const houseDiff = Math.min(
    Math.abs(house - optHouse),
    12 - Math.abs(house - optHouse),
  );
  return Math.round(Math.max(0, 60 - houseDiff * 10) * 100) / 100;
}

/**
 * Classical continuous Dig Bala (Kapoor Table IX & BPHS):
 * Distance from powerless (weakest) point divided by 3.
 */
function calculateContinuousDigBala(
  planet: PlanetName,
  siderealLongitude: number,
  ascendantLongitude: number,
  mcLongitude?: number
): { digBala: number; weakPoint: number; distance: number } {
  let weakPoint = 0;
  const ic = mcLongitude !== undefined ? (mcLongitude + 180) % 360 : (ascendantLongitude + 90) % 360;
  const mc = mcLongitude !== undefined ? mcLongitude : (ascendantLongitude + 270) % 360;
  const desc = (ascendantLongitude + 180) % 360;

  if (planet === 'Jupiter' || planet === 'Mercury') {
    weakPoint = desc; // 7th cusp
  } else if (planet === 'Moon' || planet === 'Venus' || planet === 'Ketu') {
    weakPoint = mc; // 10th cusp
  } else if (planet === 'Sun' || planet === 'Mars' || planet === 'Rahu') {
    weakPoint = ic; // 4th cusp
  } else if (planet === 'Saturn') {
    weakPoint = ascendantLongitude; // 1st cusp
  }

  const distance = circularDistanceDegrees(siderealLongitude, weakPoint);
  const digBala = Math.max(0, Math.min(60, Math.round((distance / 3.0) * 100) / 100));
  return { digBala, weakPoint, distance };
}

/**
 * Compute Sthana Bala (Positional Strength) in Virupas.
 */
function calculateSthanaBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const uccha = calculateUcchaBala(planet);
  const saptavargaja = calculateSaptavargajaBala(planet, planets);
  const ojayugma = calculateOjaYugmaBala(planet);
  const kendradi = calculateKendradiBala(planet.houseNumber);
  const drekkana = calculateDrekkanaBala(planet);
  return Math.round((uccha + saptavargaja + ojayugma + kendradi + drekkana) * 100) / 100;
}

/**
 * Compute Kala Bala (Temporal Strength) in Virupas (classical_partial contract).
 */
function calculateKalaBala(
  planet: PlanetPosition,
  birthHourFraction: number,
  moonSunElongation: number,
): number {
  if (planet.name === 'Mercury') {
    const nathonnatha = 60;
    const half = moonSunElongation <= 180 ? moonSunElongation : 360 - moonSunElongation;
    const paksha = Math.max(0, Math.min(60, half / 3));
    return Math.round((nathonnatha + paksha) * 100) / 100;
  }

  const hour = ((birthHourFraction % 24) + 24) % 24;
  const distanceFromMidnight = Math.min(hour, 24 - hour);
  const unna = (distanceFromMidnight / 12) * 60;
  const nata = 60 - unna;
  const nathonnatha = ['Sun', 'Jupiter', 'Venus'].includes(planet.name) ? unna : nata;

  const half = moonSunElongation <= 180 ? moonSunElongation : 360 - moonSunElongation;
  const beneficPaksha = Math.max(0, Math.min(60, half / 3));
  const paksha = ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planet.name)
    ? beneficPaksha
    : 60 - beneficPaksha;

  return Math.round((nathonnatha + paksha) * 100) / 100;
}

/**
 * Full Classical Kala Bala (Kapoor Chapter 16.3 & BPHS):
 * Natonnatha + Paksha + Tribhaga + Varadhipati + Horadhipati + Ayana Bala
 */
function calculateFullClassicalKalaBala(
  planet: PlanetPosition,
  birthHourFraction: number,
  moonSunElongation: number,
  options?: ShadbalaCalculationOptions
): {
  total: number;
  breakdown: {
    natonnatha: number;
    paksha: number;
    tribhaga: number;
    varadhipati: number;
    horadhipati: number;
    ayana: number;
  };
} {
  // 1. Nat-Unnat Bala
  let natonnatha = 0;
  if (planet.name === 'Mercury') {
    natonnatha = 60;
  } else {
    const hour = ((birthHourFraction % 24) + 24) % 24;
    const distanceFromMidnight = Math.min(hour, 24 - hour);
    const unna = (distanceFromMidnight / 12) * 60;
    const nata = 60 - unna;
    natonnatha = ['Sun', 'Jupiter', 'Venus'].includes(planet.name) ? unna : nata;
  }
  natonnatha = Math.round(natonnatha * 100) / 100;

  // 2. Paksha Bala
  const half = moonSunElongation <= 180 ? moonSunElongation : 360 - moonSunElongation;
  const beneficPaksha = Math.max(0, Math.min(60, half / 3));
  let paksha = ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planet.name)
    ? beneficPaksha
    : 60 - beneficPaksha;
  if (planet.name === 'Moon') {
    paksha = Math.min(60, paksha * 2);
  }
  paksha = Math.round(paksha * 100) / 100;

  // 3. Tribhaga Bala
  let tribhaga = planet.name === 'Jupiter' ? 60 : 0;
  const isDay = birthHourFraction >= 6 && birthHourFraction < 18;
  if (isDay) {
    const part = Math.floor((birthHourFraction - 6) / 4);
    if (part === 0 && planet.name === 'Mercury') tribhaga = 60;
    else if (part === 1 && planet.name === 'Sun') tribhaga = 60;
    else if (part >= 2 && planet.name === 'Saturn') tribhaga = 60;
  } else {
    const nightHour = birthHourFraction >= 18 ? birthHourFraction - 18 : birthHourFraction + 6;
    const part = Math.floor(nightHour / 4);
    if (part === 0 && planet.name === 'Moon') tribhaga = 60;
    else if (part === 1 && planet.name === 'Venus') tribhaga = 60;
    else if (part >= 2 && planet.name === 'Mars') tribhaga = 60;
  }

  // 4. Varadhipati Bala (45 Virupas)
  let varadhipati = 0;
  const WEEKDAY_LORDS: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  if (options?.birthDateUtc) {
    const dayOfWeek = options.birthDateUtc.getUTCDay();
    if (WEEKDAY_LORDS[dayOfWeek] === planet.name) {
      varadhipati = 45;
    }
  }

  // 5. Horadhipati Bala (60 Virupas)
  let horadhipati = 0;
  if (options?.birthDateUtc) {
    const dayOfWeek = options.birthDateUtc.getUTCDay();
    const hoursSinceSunrise = ((birthHourFraction - 6 + 24) % 24);
    const horaIndex = Math.floor(hoursSinceSunrise);
    const horaLordIdx = (dayOfWeek + horaIndex * 5) % 7;
    if (WEEKDAY_LORDS[horaLordIdx] === planet.name) {
      horadhipati = 60;
    }
  }

  // 6. Ayana Bala
  const ayanamsha = options?.ayanamsha || 24.0;
  const sayanaLon = (planet.siderealLongitude + ayanamsha) % 360;
  const epsRad = (23.44 * Math.PI) / 180;
  const sayanaRad = (sayanaLon * Math.PI) / 180;
  const sinDelta = Math.sin(epsRad) * Math.sin(sayanaRad);
  const deltaDeg = (Math.asin(sinDelta) * 180) / Math.PI;

  let ayana = 0;
  if (['Sun', 'Mars', 'Jupiter', 'Venus'].includes(planet.name)) {
    ayana = ((24 + deltaDeg) / 48) * 60;
  } else if (['Moon', 'Saturn'].includes(planet.name)) {
    ayana = ((24 - deltaDeg) / 48) * 60;
  } else if (planet.name === 'Mercury') {
    ayana = ((24 + Math.abs(deltaDeg)) / 48) * 60;
  }
  if (planet.name === 'Sun') {
    ayana = Math.min(60, ayana * 2);
  }
  ayana = Math.max(0, Math.min(60, Math.round(ayana * 100) / 100));

  const total = Math.round((natonnatha + paksha + tribhaga + varadhipati + horadhipati + ayana) * 100) / 100;
  return {
    total,
    breakdown: {
      natonnatha,
      paksha,
      tribhaga,
      varadhipati,
      horadhipati,
      ayana,
    },
  };
}

/**
 * Compute Chesta Bala (Motional Strength) in Virupas (classical_partial contract).
 */
function calculateChestaBala(planet: PlanetPosition): number {
  if (planet.name === 'Sun' || planet.name === 'Moon') return 30;
  if (planet.retrograde) return 60;
  return 30;
}

/**
 * Classical continuous Chesta Bala (Kapoor Chapter 17 & BPHS).
 */
function calculateFullClassicalChestaBala(
  planet: PlanetPosition,
  sunLon: number,
  ayanaBala: number,
  pakshaBala: number
): { chestaBala: number; chestaKendraDegrees?: number; isRetrograde: boolean } {
  if (planet.name === 'Sun') {
    return { chestaBala: ayanaBala, isRetrograde: false };
  }
  if (planet.name === 'Moon') {
    return { chestaBala: pakshaBala, isRetrograde: false };
  }
  if (planet.retrograde) {
    return { chestaBala: 60, isRetrograde: true };
  }

  const seeghrochha = sunLon;
  const ck = ((seeghrochha - planet.siderealLongitude + 360) % 360);
  const rck = ck > 180 ? 360 - ck : ck;
  const chestaBala = Math.max(0, Math.min(60, Math.round((rck / 3.0) * 100) / 100));

  return { chestaBala, chestaKendraDegrees: Math.round(rck * 100) / 100, isRetrograde: false };
}

/**
 * Classical Shashtiamsha aspect strength of a planet onto any target longitude.
 * Implements Deepak Kapoor Chapter 17.3 & BPHS Ch. 27 aspect rules.
 */
function calculateDrishtiOnLongitude(
  planet: PlanetPosition,
  targetLongitude: number
): number {
  const normTarget = ((targetLongitude % 360) + 360) % 360;
  const normPlanet = ((planet.siderealLongitude % 360) + 360) % 360;
  const dk = ((normTarget - normPlanet + 360) % 360); // Drishti Kendra

  let baseAspect = 0;
  if (dk >= 30 && dk < 60) {
    baseAspect = (dk - 30) * 0.5;
  } else if (dk >= 60 && dk < 90) {
    baseAspect = 15.0 + (dk - 60) * 1.0;
  } else if (dk >= 90 && dk < 120) {
    baseAspect = 45.0 - (dk - 90) * 0.5;
  } else if (dk >= 120 && dk < 150) {
    baseAspect = 30.0 - (dk - 120) * 1.0;
  } else if (dk >= 150 && dk < 180) {
    baseAspect = (dk - 150) * 2.0;
  } else if (dk >= 180 && dk < 300) {
    baseAspect = (300 - dk) * 0.5;
  }

  // Special aspects (Mars 4/8, Jupiter 5/9, Saturn 3/10)
  let special = 0;
  if (planet.name === 'Mars' && ((dk >= 80 && dk <= 100) || (dk >= 200 && dk <= 220))) {
    special = 15;
  } else if (planet.name === 'Jupiter' && ((dk >= 110 && dk <= 130) || (dk >= 230 && dk <= 250))) {
    special = 30;
  } else if (planet.name === 'Saturn' && ((dk >= 50 && dk <= 70) || (dk >= 260 && dk <= 280))) {
    special = 45;
  }

  return Math.min(60, baseAspect + special);
}

/**
 * Compute Drik Bala (Aspect Strength) in Virupas (classical_partial contract).
 */
function calculateDrikBala(planet: PlanetPosition, planets: PlanetPosition[]): number {
  const moon = planets.find(p => p.name === 'Moon');
  const sun = planets.find(p => p.name === 'Sun');
  const elongation = moon && sun
    ? ((moon.siderealLongitude - sun.siderealLongitude) % 360 + 360) % 360
    : 90;
  let score = 0;

  for (const source of planets) {
    if (source.name === planet.name || !CLASSICAL_SHADBALA_BODIES.includes(source.name)) continue;
    if (!hasParashariFullAspect(source, planet)) continue;

    const benefic =
      ['Jupiter', 'Venus', 'Mercury'].includes(source.name) ||
      (source.name === 'Moon' && elongation < 180);
    score += benefic ? 15 : -15;
  }

  return Math.max(-60, Math.min(60, score));
}

/**
 * Classical continuous Drik Bala (Kapoor Table XXII & BPHS Ch. 27):
 * Net Drishti Pinda divided by 4.
 */
function calculateContinuousDrikBala(
  planet: PlanetPosition,
  planets: PlanetPosition[]
): { drikBala: number; shubhaDrishti: number; papaDrishti: number; drishtiPinda: number } {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const elongation = sun && moon
    ? ((moon.siderealLongitude - sun.siderealLongitude) % 360 + 360) % 360
    : 90;
  const isWaxing = elongation <= 180;

  let shubhaDrishti = 0;
  let papaDrishti = 0;

  for (const source of planets) {
    if (source.name === planet.name || !CLASSICAL_SHADBALA_BODIES.includes(source.name)) continue;

    const rawAspect = calculateDrishtiOnLongitude(source, planet.siderealLongitude);
    if (rawAspect <= 0) continue;

    const isBenefic =
      source.name === 'Jupiter' ||
      source.name === 'Venus' ||
      (source.name === 'Mercury' && !source.combust) ||
      (source.name === 'Moon' && isWaxing);

    if (isBenefic) {
      shubhaDrishti += rawAspect;
    } else {
      papaDrishti += rawAspect;
    }
  }

  const drishtiPinda = Math.round((shubhaDrishti - papaDrishti) * 100) / 100;
  const drikBala = Math.max(-60, Math.min(60, Math.round((drishtiPinda / 4.0) * 100) / 100));
  return { drikBala, shubhaDrishti, papaDrishti, drishtiPinda };
}

/**
 * Compute complete Shadbala breakdown for all 7 classical planets (+ nodes).
 */
export function calculateShadbala(
  planets: PlanetPosition[],
  birthHour: number = 0,
  options?: ShadbalaCalculationOptions
): ShadbalaFactor[] {
  const isFull = options?.methodology === 'classical_full';
  const ascendantLon = options?.cusps?.ascendant ?? 0;
  const mcLon = options?.cusps?.mc;

  const classicalBodies: PlanetName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];

  const moon = planets.find(x => x.name === 'Moon');
  const sun = planets.find(x => x.name === 'Sun');
  const moonSunElongation = moon && sun
    ? ((moon.siderealLongitude - sun.siderealLongitude) % 360 + 360) % 360
    : 90;

  const factors: ShadbalaFactor[] = classicalBodies.map((name) => {
    const p = planets.find((x) => x.name === name)!;
    const sthanaBala = calculateSthanaBala(p, planets);

    let digBala = 0;
    let kalaBala = 0;
    let chestaBala = 0;
    let drikBala = 0;
    let subBreakdown: ShadbalaSubBreakdown | undefined;

    if (isFull) {
      const digCalc = calculateContinuousDigBala(name, p.siderealLongitude, ascendantLon, mcLon);
      digBala = digCalc.digBala;

      const kalaCalc = calculateFullClassicalKalaBala(p, birthHour, moonSunElongation, options);
      kalaBala = kalaCalc.total;

      const chestaCalc = calculateFullClassicalChestaBala(
        p,
        sun ? sun.siderealLongitude : 0,
        kalaCalc.breakdown.ayana,
        kalaCalc.breakdown.paksha
      );
      chestaBala = chestaCalc.chestaBala;

      const drikCalc = calculateContinuousDrikBala(p, planets);
      drikBala = drikCalc.drikBala;

      subBreakdown = {
        sthana: {
          uccha: calculateUcchaBala(p),
          saptavargaja: calculateSaptavargajaBala(p, planets),
          ojayugma: calculateOjaYugmaBala(p),
          kendradi: calculateKendradiBala(p.houseNumber),
          drekkana: calculateDrekkanaBala(p),
        },
        dig: {
          weakPointLongitude: digCalc.weakPoint,
          distanceDegrees: digCalc.distance,
        },
        kala: {
          natonnatha: kalaCalc.breakdown.natonnatha,
          paksha: kalaCalc.breakdown.paksha,
          tribhaga: kalaCalc.breakdown.tribhaga,
          varadhipati: kalaCalc.breakdown.varadhipati,
          horadhipati: kalaCalc.breakdown.horadhipati,
          ayana: kalaCalc.breakdown.ayana,
        },
        chesta: {
          chestaKendraDegrees: chestaCalc.chestaKendraDegrees,
          isRetrograde: chestaCalc.isRetrograde,
        },
        drik: {
          shubhaDrishti: drikCalc.shubhaDrishti,
          papaDrishti: drikCalc.papaDrishti,
          drishtiPinda: drikCalc.drishtiPinda,
        },
      };
    } else {
      digBala = calculateDigBala(name, p.houseNumber);
      kalaBala = calculateKalaBala(p, birthHour, moonSunElongation);
      chestaBala = calculateChestaBala(p);
      drikBala = calculateDrikBala(p, planets);
    }

    const naisargikaBala = NAISARGIKA_BALA[name];
    const totalVirupas = Math.round(
      (sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala) * 10
    ) / 10;
    const totalRupas = Math.round((totalVirupas / 60.0) * 100) / 100;
    const required = MIN_REQUIRED_VIRUPAS[name];
    const strengthRatio = Math.round((totalVirupas / required) * 100) / 100;

    let verdict: 'STRONG' | 'ADEQUATE' | 'WEAK' = 'ADEQUATE';
    if (strengthRatio >= 1.15) verdict = 'STRONG';
    else if (strengthRatio < 0.95) verdict = 'WEAK';

    const uccha = calculateUcchaBala(p);
    const ishtaPhala = Math.round(Math.sqrt(Math.max(0, uccha * chestaBala)) * 100) / 100;
    const kashtaPhala = Math.round(Math.max(0, 60 - ishtaPhala) * 100) / 100;

    return {
      planet: name,
      sthanaBala,
      digBala,
      kalaBala,
      chestaBala,
      naisargikaBala,
      drikBala,
      totalVirupas,
      totalRupas,
      requiredVirupas: required,
      strengthRatio,
      rank: 1, // calculated after sorting
      verdict,
      ishtaPhala,
      kashtaPhala,
      subBreakdown,
    };
  });

  // Sort by strengthRatio descending to assign ranks
  const sorted = [...factors].sort((a, b) => b.strengthRatio - a.strengthRatio);
  sorted.forEach((f, idx) => {
    const match = factors.find((x) => x.planet === f.planet)!;
    match.rank = idx + 1;
  });

  return factors;
}

/**
 * Computes complete high-precision classical Shadbala with all 6 categories & sub-breakdowns.
 */
export function calculateCompleteShadbala(
  planets: PlanetPosition[],
  birthHour: number = 0,
  options?: ShadbalaCalculationOptions
): ShadbalaFactor[] {
  return calculateShadbala(planets, birthHour, { ...options, methodology: 'classical_full' });
}

/**
 * Sign classification for Bhava Dig Bala (Kapoor Chapter 18.3):
 * - Nara (Human): Gemini, Virgo, Libra, Aquarius, first half of Sagittarius (0°-15°). Strongest: House 1, Weakest: House 7.
 * - Jalachara (Aquatic): Cancer, Pisces, second half of Capricorn (15°-30°). Strongest: House 4, Weakest: House 10.
 * - Chatushpada (Quadruped): Aries, Taurus, Leo, 2nd half Sag (15°-30°), 1st half Cap (0°-15°). Strongest: House 10, Weakest: House 4.
 * - Keeta (Insect): Scorpio. Strongest: House 7, Weakest: House 1.
 */
function getBhavaWeakHouse(sign: ZodiacSign, degreeInSign: number): number {
  if (['Gemini', 'Virgo', 'Libra', 'Aquarius'].includes(sign)) return 7; // Nara
  if (sign === 'Sagittarius' && degreeInSign < 15) return 7; // Nara 1st half
  if (['Cancer', 'Pisces'].includes(sign)) return 10; // Jalachara
  if (sign === 'Capricorn' && degreeInSign >= 15) return 10; // Jalachara 2nd half
  if (['Aries', 'Taurus', 'Leo'].includes(sign)) return 4; // Chatushpada
  if (sign === 'Sagittarius' && degreeInSign >= 15) return 4; // Chatushpada 2nd half
  if (sign === 'Capricorn' && degreeInSign < 15) return 4; // Chatushpada 1st half
  if (sign === 'Scorpio') return 1; // Keeta
  return 7;
}

/**
 * Compute Bhava Bala (Strength of 12 Houses) strictly adhering to Deepak Kapoor Chapter 18.
 * Total Bhava Bala = Bhavadhipati Bala + Bhava Dig Bala + Bhava Drishti Bala.
 */
export function calculateBhavaBala(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  shadbala: ShadbalaFactor[],
  bhavaMadhyas?: number[] // Optional 1-indexed array of actual Sripathi Bhava Madhyas
): BhavaBalaItem[] {
  const items: BhavaBalaItem[] = [];

  const sun = planets.find((p) => p.name === 'Sun');
  const moon = planets.find((p) => p.name === 'Moon');
  const elongation = sun && moon
    ? ((moon.siderealLongitude - sun.siderealLongitude + 360) % 360)
    : 90;
  const isMoonWaxing = elongation <= 180;

  for (let house = 1; house <= 12; house++) {
    const signIndex = (ascendantSignIndex + (house - 1)) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const lord = SIGN_LORDS[sign];
    const lordShadbala = shadbala.find((s) => s.planet === lord);

    // 1. Bhavadhipati Bala: Full Shadbala Pinda of the Bhava lord (Kapoor 18.2)
    const bhavadhipatiBala = lordShadbala ? Math.round(lordShadbala.totalVirupas * 10) / 10 : 350.0;

    // 2. Bhava Dig Bala (Kapoor 18.3)
    const degreeInSign = 15.0; // Midpoint of sign if not given
    const weakHouse = getBhavaWeakHouse(sign, degreeInSign);
    const circularDistance = Math.abs(house - weakHouse);
    const adjustedDistance = circularDistance > 6 ? 12 - circularDistance : circularDistance;
    const bhavaDigBala = Math.round(adjustedDistance * 10.0 * 10) / 10; // 0 to 60 Shashtiamshas

    // 3. Bhava Drishti Bala: Aspectual strength on Bhava Madhya (Kapoor 18.4)
    // If exact Sripathi madhya is provided, use it; otherwise use the sign midpoint.
    const madhyaLon = bhavaMadhyas && bhavaMadhyas[house] !== undefined
      ? bhavaMadhyas[house]
      : signIndex * 30.0 + 15.0;

    let netDrishti = 0;
    for (const p of planets) {
      if (!CLASSICAL_SHADBALA_BODIES.includes(p.name)) continue;

      const rawAspect = calculateDrishtiOnLongitude(p, madhyaLon);
      if (rawAspect <= 0) continue;

      // Classify benefic vs malefic
      const isBenefic =
        p.name === 'Jupiter' ||
        p.name === 'Venus' ||
        (p.name === 'Mercury' && !p.combust) ||
        (p.name === 'Moon' && isMoonWaxing);

      // Per Kapoor 18.4: Apply 1/4 factor for non-Jupiter/Mercury, full for Jupiter/Mercury
      const weight = p.name === 'Jupiter' || p.name === 'Mercury' ? 1.0 : 0.25;
      const contribution = rawAspect * weight;

      if (isBenefic) {
        netDrishti += contribution;
      } else {
        netDrishti -= contribution;
      }
    }
    const bhavaDrishtiBala = Math.round(netDrishti * 10) / 10;

    // Total Bhava Bala in Virupas and Rupas (Kapoor 18.5)
    const totalVirupas = Math.round((bhavadhipatiBala + bhavaDigBala + bhavaDrishtiBala) * 10) / 10;
    const totalRupas = Math.round((totalVirupas / 60.0) * 100) / 100;

    items.push({
      houseNumber: house,
      sign,
      lord,
      bhavadhipatiBala,
      bhavaDigBala,
      bhavaDrishtiBala,
      totalVirupas,
      totalRupas,
      rank: 1,
    });
  }

  const sorted = [...items].sort((a, b) => b.totalVirupas - a.totalVirupas);
  sorted.forEach((item, idx) => {
    const match = items.find((x) => x.houseNumber === item.houseNumber)!;
    match.rank = idx + 1;
  });

  return items;
}

/**
 * Calculate Baladi, Jagradadi, Deeptadi Avasthas & Functional Nature for all planets.
 */
export function calculateAvasthas(
  planets: PlanetPosition[],
  ascendantSign: ZodiacSign
): PlanetaryAvasthas[] {
  return planets.map((p) => {
    const deg = p.degreeInSign;
    const isOddSign = p.signIndex % 2 === 0;

    // 1. Baladi Avasthas
    let baladi: PlanetaryAvasthas['baladi'] = 'Yuva';
    if (isOddSign) {
      if (deg < 6) baladi = 'Bala';
      else if (deg < 12) baladi = 'Kumara';
      else if (deg < 18) baladi = 'Yuva';
      else if (deg < 24) baladi = 'Vriddha';
      else baladi = 'Mrita';
    } else {
      if (deg < 6) baladi = 'Mrita';
      else if (deg < 12) baladi = 'Vriddha';
      else if (deg < 18) baladi = 'Yuva';
      else if (deg < 24) baladi = 'Kumara';
      else baladi = 'Bala';
    }

    // 2. Deeptadi Avasthas
    let deeptadi: PlanetaryAvasthas['deeptadi'] = 'Shanta';
    if (p.combust) deeptadi = 'Vikala';
    else if (p.dignity === 'EXALTED') deeptadi = 'Deepta';
    else if (p.dignity === 'OWN_SIGN' || p.dignity === 'MOOLATRIKONA') deeptadi = 'Swastha';
    else if (p.dignity === 'FRIEND') deeptadi = 'Mudita';
    else if (p.dignity === 'NEUTRAL') deeptadi = 'Shanta';
    else if (p.dignity === 'ENEMY') deeptadi = 'Deena';
    else if (p.dignity === 'DEBILITATED') deeptadi = 'Dukhita';

    // 3. Jagradadi Avasthas
    let jagradadi: PlanetaryAvasthas['jagradadi'] = 'Swapna';
    if (['Deepta', 'Swastha'].includes(deeptadi)) jagradadi = 'Jagrata';
    else if (['Deena', 'Dukhita', 'Vikala'].includes(deeptadi)) jagradadi = 'Sushupti';

    // 4. Functional Nature according to Lagna
    let functionalNature: PlanetaryAvasthas['functionalNature'] = 'Benefic';

    // Special Yogakaraka determination:
    if (ascendantSign === 'Taurus' && p.name === 'Saturn') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Libra' && p.name === 'Saturn') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Cancer' && p.name === 'Mars') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Leo' && p.name === 'Mars') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Capricorn' && p.name === 'Venus') functionalNature = 'Yogakaraka';
    else if (ascendantSign === 'Aquarius' && p.name === 'Venus') functionalNature = 'Yogakaraka';
    else if ([2, 7].includes(p.houseNumber)) functionalNature = 'Maraka';
    else if ([6, 8, 12].includes(p.houseNumber)) functionalNature = 'Malefic';
    else if ([1, 5, 9].includes(p.houseNumber)) functionalNature = 'Benefic';
    else functionalNature = 'Neutral';

    return {
      planet: p.name,
      baladi,
      jagradadi,
      deeptadi,
      functionalNature,
    };
  });
}

/**
 * Complete strength suite.
 */
export function calculateStrengthFacts(
  planets: PlanetPosition[],
  ascendantSignIndex: number,
  birthHour: number = 0,
  bhavaMadhyas?: number[],
  options?: ShadbalaCalculationOptions
): StrengthFacts {
  const method = options?.methodology || 'classical_partial';
  const shadbala = calculateShadbala(planets, birthHour, { ...options, methodology: method });
  const bhavaBala = calculateBhavaBala(planets, ascendantSignIndex, shadbala, bhavaMadhyas);
  const avasthas = calculateAvasthas(planets, ZODIAC_SIGNS[ascendantSignIndex]);

  // Compute full classical 6-fold breakdown for rich intelligence
  const completeShadbala = calculateShadbala(planets, birthHour, {
    ...options,
    methodology: 'classical_full',
  });

  return {
    shadbala,
    bhavaBala,
    avasthas,
    methodology: {
      shadbala: method,
      notes: [
        'Sthana Bala uses Uchcha, Saptavargaja, Oja-Yugma, Kendradi and Drekkana sub-components.',
        'Kala Bala provides both classical_partial benchmark and complete multi-tier temporal evaluation (Tribhaga, Vara, Hora, Ayana).',
        'Cheshta Bala provides continuous Seeghrochha motion analysis and retrograde amplification.',
        'Drik Bala computes continuous Parashari Shashtiamsha aspectual rays (Kapoor Table XXII / BPHS).',
        'Bhava Bala integrates Sripathi Bhava Madhyas, Bhavadhipati, Bhava Dig and Bhava Drishti.',
      ],
    },
    completeShadbala,
  };
}
