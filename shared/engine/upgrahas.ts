/**
 * ASTROWORLD — Upgrahas (Tertiary Planets & Sensitive Amshas) Engine
 * Implements Chapter 13 of Deepak Kapoor's authoritative treatise "Astronomy and Mathematical Astrology".
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import { calculateAscendant, formatDMS, getNakshatraAndPada, normalizeDegrees } from './astronomy.ts';
import { ZODIAC_SIGNS } from './constants.ts';
import { PlanetName, UpgrahaInfo, UpgrahasFacts } from './types.ts';

function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function makeUpgrahaInfo(
  name: string,
  sanskritName: string,
  associatedPlanet: PlanetName,
  calculationType: 'SUN_DERIVED' | 'TIME_DERIVED',
  siderealLongitude: number,
  ascendantSignIndex: number,
  significance: string
): UpgrahaInfo {
  const normLon = normDeg(siderealLongitude);
  const signIndex = Math.floor(normLon / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = normLon % 30;
  const nak = getNakshatraAndPada(normLon);
  const houseNumber = ((signIndex - ascendantSignIndex + 12) % 12) + 1;

  return {
    name,
    sanskritName,
    associatedPlanet,
    calculationType,
    siderealLongitude: normLon,
    sign,
    signIndex,
    degreeInSign,
    formattedDegree: formatDMS(degreeInSign),
    houseNumber,
    nakshatra: nak.nakshatra,
    pada: nak.pada,
    significance,
  };
}

/**
 * Calculates all 5 Sun-derived Upgrahas strictly according to Chapter 13.2:
 * 1. Dhuma = Sun + 133°20'
 * 2. Vyatipata / Pata = 360° - Dhuma
 * 3. Parivesha / Paridhi = 180° + Vyatipata
 * 4. Indrachapa / Kodanda = 360° - Parivesha
 * 5. Upaketu / Sikhi = Indrachapa + 16°40' (equivalently Sun + 330°)
 */
export function calculateSunDerivedUpgrahas(
  sunSiderealLongitude: number,
  ascendantSignIndex: number
): {
  dhuma: UpgrahaInfo;
  vyatipata: UpgrahaInfo;
  parivesha: UpgrahaInfo;
  indrachapa: UpgrahaInfo;
  upaketu: UpgrahaInfo;
} {
  const sunLon = normDeg(sunSiderealLongitude);

  // 1. Dhuma (Mars's secondary sensitive point)
  const dhumaLon = normDeg(sunLon + 133.0 + 20.0 / 60.0);
  const dhuma = makeUpgrahaInfo(
    'Dhuma',
    'धूम',
    'Mars',
    'SUN_DERIVED',
    dhumaLon,
    ascendantSignIndex,
    'Smoky malefic point; indicates sudden obstacles, heat, disputes, and friction'
  );

  // 2. Vyatipata / Pata (Rahu's secondary point)
  const vyatipataLon = normDeg(360.0 - dhumaLon);
  const vyatipata = makeUpgrahaInfo(
    'Vyatipata',
    'व्यतीपात (पात)',
    'Rahu',
    'SUN_DERIVED',
    vyatipataLon,
    ascendantSignIndex,
    'Calamitous node of misfortune; represents reversals, sudden shocks, and vulnerability'
  );

  // 3. Parivesha / Paridhi (Moon's secondary point)
  const pariveshaLon = normDeg(180.0 + vyatipataLon);
  const parivesha = makeUpgrahaInfo(
    'Parivesha',
    'परिवेष (परिधि)',
    'Moon',
    'SUN_DERIVED',
    pariveshaLon,
    ascendantSignIndex,
    'Halo/containment point; indicates psychological stress, confinement, or water hazards'
  );

  // 4. Indrachapa / Kodanda (Venus's secondary point)
  const indrachapaLon = normDeg(360.0 - pariveshaLon);
  const indrachapa = makeUpgrahaInfo(
    'Indrachapa',
    'इन्द्रचाप (कोदण्ड)',
    'Venus',
    'SUN_DERIVED',
    indrachapaLon,
    ascendantSignIndex,
    'Rainbow/bow point; influences sensory delusions, financial volatility, and emotional storms'
  );

  // 5. Upaketu / Sikhi (Ketu's secondary point)
  const upaketuLon = normDeg(indrachapaLon + 16.0 + 40.0 / 60.0);
  const upaketu = makeUpgrahaInfo(
    'Upaketu',
    'उपकेतु (शिखी)',
    'Ketu',
    'SUN_DERIVED',
    upaketuLon,
    ascendantSignIndex,
    'Comet/flag point; brings sudden spiritual awakenings, fires, or detachment'
  );

  return { dhuma, vyatipata, parivesha, indrachapa, upaketu };
}

/**
 * Planetary ruler cycle for the 8-fold division of day/night (Kapoor Chapter 13.3).
 */
const DAY_ORDER: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const WEEKDAY_ORDER_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Calculates Time-based Upgrahas (Gulika, Mandi, Kala, Mrityu, Ardhaprahara, Yamaghantaka)
 * by computing the exact Ascendant at the proportional diurnal/nocturnal sub-period.
 */
export function calculateTimeDerivedUpgrahas(
  birthDateUtc: Date,
  latitude: number,
  longitude: number,
  ayanamsha: number,
  ascendantSignIndex: number,
  sunriseUtcDate?: Date,
  sunsetUtcDate?: Date
): {
  mandi: UpgrahaInfo;
  gulika: UpgrahaInfo;
  kala: UpgrahaInfo;
  mrityu: UpgrahaInfo;
  ardhaprahara: UpgrahaInfo;
  yamaghantaka: UpgrahaInfo;
} {
  // If sunrise/sunset are not supplied, compute via astronomy-engine
  let rise = sunriseUtcDate;
  let set = sunsetUtcDate;

  if (!rise || !set) {
    try {
      const observer = new Astronomy.Observer(latitude, longitude, 0);
      const searchTime = Astronomy.MakeTime(birthDateUtc);
      const riseResult = Astronomy.SearchRiseSet('Sun' as any, observer, 1, searchTime, 1);
      const setResult = Astronomy.SearchRiseSet('Sun' as any, observer, -1, searchTime, 1);
      rise = riseResult ? riseResult.date : new Date(birthDateUtc.getTime() - 6 * 3600000);
      set = setResult ? setResult.date : new Date(birthDateUtc.getTime() + 6 * 3600000);
    } catch {
      rise = new Date(birthDateUtc.getTime() - 6 * 3600000);
      set = new Date(birthDateUtc.getTime() + 6 * 3600000);
    }
  }

  const birthMs = birthDateUtc.getTime();
  const riseMs = rise.getTime();
  const setMs = set.getTime();
  const isDay = birthMs >= riseMs && birthMs < setMs;

  const durationMs = isDay ? setMs - riseMs : 86400000 - (setMs - riseMs);
  const partDurationMs = durationMs / 8.0;
  const baseStartMs = isDay ? riseMs : setMs;

  // Determine weekday at sunrise
  const dayOfWeekIndex = rise.getUTCDay(); // 0=Sun .. 6=Sat

  // Sequence of 7 segment rulers (8th part is lordless)
  const segmentLords: PlanetName[] = [];
  const startLordIndex = isDay
    ? dayOfWeekIndex
    : (dayOfWeekIndex + 4) % 7; // Nighttime starts from 5th weekday from day lord (Kapoor 13.3)

  for (let i = 0; i < 7; i++) {
    segmentLords.push(DAY_ORDER[(startLordIndex + i) % 7]);
  }

  // Helper to compute Ascendant for a target planet's segment
  const getSegmentAscendant = (targetPlanet: PlanetName, segmentOffsetFraction: number = 0.5): number => {
    const idx = segmentLords.indexOf(targetPlanet);
    const partIndex = idx >= 0 ? idx : 6;
    const targetMs = baseStartMs + (partIndex + segmentOffsetFraction) * partDurationMs;
    const targetAstroTime = Astronomy.MakeTime(new Date(targetMs));
    const ascInfo = calculateAscendant(targetAstroTime, latitude, longitude, ayanamsha);
    return ascInfo.siderealLongitude;
  };

  // 1. Gulika (Saturn's segment midpoint)
  const gulikaLon = getSegmentAscendant('Saturn', 0.5);
  const gulika = makeUpgrahaInfo(
    'Gulika',
    'गुलिक',
    'Saturn',
    'TIME_DERIVED',
    gulikaLon,
    ascendantSignIndex,
    'Son of Saturn; indicates deep karmic burdens, poison/toxins, and points of testing'
  );

  // 2. Mandi (Beginning of Saturn's segment in standard Parashari tradition)
  const mandiLon = getSegmentAscendant('Saturn', 0.0);
  const mandi = makeUpgrahaInfo(
    'Mandi',
    'मान्दि',
    'Saturn',
    'TIME_DERIVED',
    mandiLon,
    ascendantSignIndex,
    'Fatalistic marker of delays, physical frailty, obstacles, and sudden karmic shifts'
  );

  // 3. Kala (Sun's segment)
  const kalaLon = getSegmentAscendant('Sun', 0.5);
  const kala = makeUpgrahaInfo(
    'Kala',
    'काल',
    'Sun',
    'TIME_DERIVED',
    kalaLon,
    ascendantSignIndex,
    'Time-factor indicator; relates to life transitions, fatherly karma, and health'
  );

  // 4. Mrityu (Mars's segment)
  const mrityuLon = getSegmentAscendant('Mars', 0.5);
  const mrityu = makeUpgrahaInfo(
    'Mrityu',
    'मृत्यु',
    'Mars',
    'TIME_DERIVED',
    mrityuLon,
    ascendantSignIndex,
    'Indicator of physical vulnerability, accidents, acute fevers, and martial disputes'
  );

  // 5. Ardhaprahara (Mercury's segment)
  const ardhapraharaLon = getSegmentAscendant('Mercury', 0.5);
  const ardhaprahara = makeUpgrahaInfo(
    'Ardhaprahara',
    'अर्धप्रहर',
    'Mercury',
    'TIME_DERIVED',
    ardhapraharaLon,
    ascendantSignIndex,
    'Commercial setbacks, nervous restlessness, and communication misfires'
  );

  // 6. Yamaghantaka (Jupiter's segment)
  const yamaghantakaLon = getSegmentAscendant('Jupiter', 0.5);
  const yamaghantaka = makeUpgrahaInfo(
    'Yamaghantaka',
    'यमघण्टक',
    'Jupiter',
    'TIME_DERIVED',
    yamaghantakaLon,
    ascendantSignIndex,
    'Bell of Yama; though from Jupiter, marks periods of sudden reckoning and expenditure'
  );

  return { mandi, gulika, kala, mrityu, ardhaprahara, yamaghantaka };
}

/**
 * Calculates the complete suite of classical Upgrahas for a horoscope.
 */
export function calculateAllUpgrahas(
  sunSiderealLongitude: number,
  ascendantSignIndex: number,
  birthDateUtc: Date,
  latitude: number,
  longitude: number,
  ayanamsha: number,
  sunriseUtcDate?: Date,
  sunsetUtcDate?: Date
): UpgrahasFacts {
  const sunDerived = calculateSunDerivedUpgrahas(sunSiderealLongitude, ascendantSignIndex);
  const timeDerived = calculateTimeDerivedUpgrahas(
    birthDateUtc,
    latitude,
    longitude,
    ayanamsha,
    ascendantSignIndex,
    sunriseUtcDate,
    sunsetUtcDate
  );

  const allUpgrahas: UpgrahaInfo[] = [
    sunDerived.dhuma,
    sunDerived.vyatipata,
    sunDerived.parivesha,
    sunDerived.indrachapa,
    sunDerived.upaketu,
    timeDerived.gulika,
    timeDerived.mandi,
    timeDerived.kala,
    timeDerived.mrityu,
    timeDerived.ardhaprahara,
    timeDerived.yamaghantaka,
  ];

  return {
    ...sunDerived,
    ...timeDerived,
    allUpgrahas,
  };
}
