/**
 * ASTROWORLD — Future Timing Scan Engine
 * Compact gochara sampling, ingress search, dasha window listing, and domain confluence ranking.
 * All dates are engine-computed; precision is EVENT_WINDOW unless an ingress is EXACT.
 */

import { normalizeDegrees } from './astronomy.ts';
import { SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import { calculateVimshottariDasha } from './dasha.ts';
import {
  astronomyEngineEphemerisProvider,
  SiderealEphemerisProvider,
} from './ephemeris.ts';
import { classifySadeSati } from './transits.ts';
import {
  AshtakavargaFacts,
  DashaPeriod,
  PlanetName,
  PlanetPosition,
  TimingPrecision,
  ZodiacSign,
} from './types.ts';

const MS_PER_DAY = 86400000;
const MAX_SCAN_DAYS = 365 * 5; // 5 years hard cap
const MAX_SAMPLES = 120;

export type TimingDomain =
  | 'marriage'
  | 'relationship'
  | 'career'
  | 'finance'
  | 'wealth'
  | 'health'
  | 'education'
  | 'general';

export interface CompactTransitSample {
  dateIso: string;
  planets: Array<{
    planet: PlanetName;
    sign: ZodiacSign;
    natalLagnaHouse: number;
    chandraLagnaHouse: number;
    ashtakavargaBindus: number;
    retrograde: boolean;
  }>;
  sadeSati: {
    active: boolean;
    phase: 'RISING' | 'PEAK' | 'SETTING' | 'NONE';
  };
}

export interface TransitScanResult {
  fromIso: string;
  toIso: string;
  stepDays: number;
  sampleCount: number;
  samples: CompactTransitSample[];
  precision: TimingPrecision;
}

export interface PlanetIngressEvent {
  planet: PlanetName;
  timestampUtc: string;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
  toSignIndex: number;
  natalLagnaHouse?: number;
  precision: 'EXACT';
}

export interface HouseIngressWindow {
  planet: PlanetName;
  house: number;
  enterIso: string;
  exitIso: string | null;
  sign: ZodiacSign;
  precision: TimingPrecision;
}

export interface DashaWindowSlice {
  level: 'MAHADASHA' | 'ANTARDASHA' | 'PRATYANTARDASHA';
  path: string;
  lord: PlanetName;
  subLord?: PlanetName;
  pratyantarLord?: PlanetName;
  startDateIso: string;
  endDateIso: string;
  durationYears: number;
}

export interface RankedTimingWindow {
  id: string;
  domain: TimingDomain;
  title: string;
  precision: TimingPrecision;
  windowStartIso: string;
  windowEndIso: string;
  score: number;
  confluenceBasis: 'DIRECT' | 'SUPPORTED' | 'CONVERGENT' | 'CONTEXTUAL';
  activeFactors: string[];
  summary: string;
}

function clampDateRange(fromUtc: Date, toUtc: Date): { from: Date; to: Date } {
  if (!(fromUtc instanceof Date) || Number.isNaN(fromUtc.getTime())) {
    throw new Error('scanTransits requires a valid fromUtc Date.');
  }
  if (!(toUtc instanceof Date) || Number.isNaN(toUtc.getTime())) {
    throw new Error('scanTransits requires a valid toUtc Date.');
  }
  if (toUtc.getTime() <= fromUtc.getTime()) {
    throw new Error('toUtc must be strictly after fromUtc.');
  }
  const maxTo = new Date(fromUtc.getTime() + MAX_SCAN_DAYS * MS_PER_DAY);
  const to = toUtc.getTime() > maxTo.getTime() ? maxTo : toUtc;
  return { from: fromUtc, to };
}

function natalHouseFromSign(signIndex: number, natalLagnaSignIndex: number): number {
  return ((signIndex - natalLagnaSignIndex + 12) % 12) + 1;
}

function planetLongitude(
  planet: PlanetName,
  dateUtc: Date,
  provider: SiderealEphemerisProvider,
): number {
  const pos = provider.getPlanetaryPositions(dateUtc).find((p) => p.name === planet);
  if (!pos || !Number.isFinite(pos.siderealLongitude)) {
    throw new Error(`Ephemeris returned no position for ${planet}.`);
  }
  return normalizeDegrees(pos.siderealLongitude);
}

/**
 * Sample gochara at regular intervals across a date range.
 */
export function scanTransits(
  natalPlanets: PlanetPosition[],
  natalAscendantSignIndex: number,
  ashtakavarga: AshtakavargaFacts,
  fromUtc: Date,
  toUtc: Date,
  stepDays: number = 30,
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): TransitScanResult {
  const { from, to } = clampDateRange(fromUtc, toUtc);
  const step = Math.max(1, Math.min(90, Math.floor(stepDays || 30)));
  const natalMoon = natalPlanets.find((p) => p.name === 'Moon');
  if (!natalMoon) {
    throw new Error('scanTransits requires natal Moon.');
  }

  const samples: CompactTransitSample[] = [];
  let cursor = from.getTime();
  const endMs = to.getTime();

  while (cursor <= endMs && samples.length < MAX_SAMPLES) {
    const date = new Date(cursor);
    const raw = ephemerisProvider.getPlanetaryPositions(date);
    const planets = raw.map((tp) => {
      const lon = normalizeDegrees(tp.siderealLongitude);
      const signIndex = Math.floor(lon / 30);
      return {
        planet: tp.name as PlanetName,
        sign: ZODIAC_SIGNS[signIndex],
        natalLagnaHouse: natalHouseFromSign(signIndex, natalAscendantSignIndex),
        chandraLagnaHouse: natalHouseFromSign(signIndex, natalMoon.signIndex),
        ashtakavargaBindus: ashtakavarga.sav[signIndex] ?? 0,
        retrograde: (tp.longitudeSpeed ?? 0) < 0,
      };
    });

    const saturn = planets.find((p) => p.planet === 'Saturn');
    const saturnSignIdx = saturn ? ZODIAC_SIGNS.indexOf(saturn.sign) : -1;
    const sade = classifySadeSati(saturnSignIdx, natalMoon.signIndex);

    samples.push({
      dateIso: date.toISOString(),
      planets,
      sadeSati: { active: sade.active, phase: sade.phase },
    });

    cursor += step * MS_PER_DAY;
  }

  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    stepDays: step,
    sampleCount: samples.length,
    samples,
    precision: 'EVENT_WINDOW',
  };
}

/**
 * Find sign ingresses for a planet within [from, to] via forward sampling + bisection.
 */
export function findPlanetSignIngresses(
  planet: PlanetName,
  fromUtc: Date,
  toUtc: Date,
  natalLagnaSignIndex?: number,
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): PlanetIngressEvent[] {
  const { from, to } = clampDateRange(fromUtc, toUtc);
  const events: PlanetIngressEvent[] = [];
  const sampleStepMs = planet === 'Moon' ? MS_PER_DAY : planet === 'Sun' || planet === 'Mercury' || planet === 'Venus' || planet === 'Mars'
    ? 2 * MS_PER_DAY
    : 7 * MS_PER_DAY;

  let prevDate = from;
  let prevLon = planetLongitude(planet, prevDate, ephemerisProvider);
  let prevSign = Math.floor(prevLon / 30);

  for (let t = from.getTime() + sampleStepMs; t <= to.getTime(); t += sampleStepMs) {
    const date = new Date(Math.min(t, to.getTime()));
    const lon = planetLongitude(planet, date, ephemerisProvider);
    let sign = Math.floor(lon / 30);

    // Handle retrograde wrap: detect any sign change vs previous sample
    if (sign !== prevSign) {
      // Bisection for exact boundary crossing
      let lo = prevDate;
      let hi = date;
      const targetSign = sign;
      for (let i = 0; i < 40; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midLon = planetLongitude(planet, mid, ephemerisProvider);
        const midSign = Math.floor(midLon / 30);
        if (midSign === prevSign) lo = mid;
        else hi = mid;
      }
      const cross = hi;
      if (cross.getTime() > from.getTime() && cross.getTime() <= to.getTime()) {
        events.push({
          planet,
          timestampUtc: cross.toISOString(),
          fromSign: ZODIAC_SIGNS[prevSign],
          toSign: ZODIAC_SIGNS[targetSign],
          toSignIndex: targetSign,
          natalLagnaHouse:
            typeof natalLagnaSignIndex === 'number'
              ? natalHouseFromSign(targetSign, natalLagnaSignIndex)
              : undefined,
          precision: 'EXACT',
        });
      }
      prevSign = targetSign;
    }

    prevDate = date;
    prevLon = lon;
    prevSign = sign;
  }

  return events;
}

/**
 * Find windows when a planet occupies a specific natal house (whole-sign from Lagna).
 */
export function findHouseIngressWindows(
  planet: PlanetName,
  natalLagnaSignIndex: number,
  house: number,
  fromUtc: Date,
  toUtc: Date,
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): HouseIngressWindow[] {
  if (house < 1 || house > 12) {
    throw new Error('house must be 1-12.');
  }
  const ingresses = findPlanetSignIngresses(
    planet,
    fromUtc,
    toUtc,
    natalLagnaSignIndex,
    ephemerisProvider,
  );

  const { from, to } = clampDateRange(fromUtc, toUtc);
  const startLon = planetLongitude(planet, from, ephemerisProvider);
  const startSign = Math.floor(startLon / 30);
  const startHouse = natalHouseFromSign(startSign, natalLagnaSignIndex);

  const windows: HouseIngressWindow[] = [];
  let open: HouseIngressWindow | null = null;

  if (startHouse === house) {
    open = {
      planet,
      house,
      enterIso: from.toISOString(),
      exitIso: null,
      sign: ZODIAC_SIGNS[startSign],
      precision: 'EVENT_WINDOW',
    };
  }

  for (const ing of ingresses) {
    const h = ing.natalLagnaHouse!;
    if (open && h !== house) {
      open.exitIso = ing.timestampUtc;
      windows.push(open);
      open = null;
    } else if (!open && h === house) {
      open = {
        planet,
        house,
        enterIso: ing.timestampUtc,
        exitIso: null,
        sign: ing.toSign,
        precision: 'EVENT_WINDOW',
      };
    } else if (open && h === house) {
      // Still in house (sign change within same house shouldn't happen for whole-sign)
      open.sign = ing.toSign;
    }
  }

  if (open) {
    open.exitIso = to.toISOString();
    windows.push(open);
  }

  return windows;
}

function periodsOverlap(
  startIso: string,
  endIso: string,
  fromMs: number,
  toMs: number,
): boolean {
  const s = Date.parse(startIso);
  const e = Date.parse(endIso);
  return e > fromMs && s < toMs;
}

/**
 * Slice Vimshottari hierarchy into windows overlapping [from, to].
 */
export function listDashaWindows(
  moonSiderealLon: number,
  birthDateUtc: Date,
  fromUtc: Date,
  toUtc: Date,
  level: 'MAHADASHA' | 'ANTARDASHA' | 'PRATYANTARDASHA' = 'ANTARDASHA',
): DashaWindowSlice[] {
  const { from, to } = clampDateRange(fromUtc, toUtc);
  const fromMs = from.getTime();
  const toMs = to.getTime();

  // Evaluate at end of range so mahadasha tree covers the full window
  const dasha = calculateVimshottariDasha(moonSiderealLon, birthDateUtc, to);
  const slices: DashaWindowSlice[] = [];

  for (const md of dasha.mahadashas) {
    if (level === 'MAHADASHA') {
      if (periodsOverlap(md.period.startDateIso, md.period.endDateIso, fromMs, toMs)) {
        slices.push(periodToSlice(md.period));
      }
      continue;
    }
    for (const ad of md.antardashas) {
      if (level === 'ANTARDASHA') {
        if (periodsOverlap(ad.period.startDateIso, ad.period.endDateIso, fromMs, toMs)) {
          slices.push(periodToSlice(ad.period));
        }
        continue;
      }
      for (const pd of ad.pratyantardashas) {
        if (periodsOverlap(pd.startDateIso, pd.endDateIso, fromMs, toMs)) {
          slices.push(periodToSlice(pd));
        }
      }
    }
  }

  return slices;
}

function periodToSlice(p: DashaPeriod): DashaWindowSlice {
  return {
    level: p.level,
    path: p.path,
    lord: p.lord,
    subLord: p.subLord,
    pratyantarLord: p.pratyantarLord,
    startDateIso: p.startDateIso,
    endDateIso: p.endDateIso,
    durationYears: p.durationYears,
  };
}

const DOMAIN_HOUSES: Record<TimingDomain, number[]> = {
  marriage: [7],
  relationship: [5, 7],
  career: [10, 6],
  finance: [2, 11],
  wealth: [2, 11],
  health: [6, 8, 1],
  education: [4, 5, 9],
  general: [1],
};

const DOMAIN_LORDS: Record<TimingDomain, PlanetName[]> = {
  marriage: ['Venus', 'Jupiter'],
  relationship: ['Venus', 'Jupiter', 'Moon'],
  career: ['Sun', 'Saturn', 'Mercury', 'Jupiter'],
  finance: ['Jupiter', 'Venus', 'Mercury'],
  wealth: ['Jupiter', 'Venus'],
  health: ['Sun', 'Moon', 'Mars', 'Saturn'],
  education: ['Mercury', 'Jupiter', 'Moon'],
  general: ['Jupiter', 'Saturn'],
};

/**
 * Rank EVENT_WINDOW periods by dasha + transit + SAV confluence for a life domain.
 */
export function rankDomainWindows(
  domain: TimingDomain,
  natalPlanets: PlanetPosition[],
  natalAscendantSignIndex: number,
  ashtakavarga: AshtakavargaFacts,
  moonSiderealLon: number,
  birthDateUtc: Date,
  fromUtc: Date,
  toUtc: Date,
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): RankedTimingWindow[] {
  const { from, to } = clampDateRange(fromUtc, toUtc);
  const houses = DOMAIN_HOUSES[domain] || DOMAIN_HOUSES.general;
  const keyPlanets = DOMAIN_LORDS[domain] || DOMAIN_LORDS.general;

  // House lords from natal chart
  const houseLords: PlanetName[] = houses.map((h) => {
    const signIdx = (natalAscendantSignIndex + h - 1) % 12;
    return SIGN_LORDS[ZODIAC_SIGNS[signIdx]];
  });
  const relevantLords = Array.from(new Set([...keyPlanets, ...houseLords]));

  const dashaWindows = listDashaWindows(moonSiderealLon, birthDateUtc, from, to, 'ANTARDASHA');
  const transitScan = scanTransits(
    natalPlanets,
    natalAscendantSignIndex,
    ashtakavarga,
    from,
    to,
    30,
    ephemerisProvider,
  );

  const ranked: RankedTimingWindow[] = [];

  for (const dw of dashaWindows) {
    let score = 0;
    const factors: string[] = [];

    const mdRelevant = relevantLords.includes(dw.lord);
    const adRelevant = dw.subLord ? relevantLords.includes(dw.subLord) : false;
    if (mdRelevant) {
      score += 3;
      factors.push(`Mahadasha lord ${dw.lord} rules/supports ${domain}`);
    }
    if (adRelevant) {
      score += 4;
      factors.push(`Antardasha lord ${dw.subLord} activates ${domain}`);
    }
    if (mdRelevant && adRelevant) {
      score += 2;
    }

    // Average SAV / house activation during this antardasha from transit samples
    const dwStart = Date.parse(dw.startDateIso);
    const dwEnd = Date.parse(dw.endDateIso);
    const midSamples = transitScan.samples.filter((s) => {
      const t = Date.parse(s.dateIso);
      return t >= dwStart && t <= dwEnd;
    });

    let houseHits = 0;
    let savSum = 0;
    let savCount = 0;
    for (const sample of midSamples) {
      for (const tp of sample.planets) {
        if ((tp.planet === 'Jupiter' || tp.planet === 'Saturn' || tp.planet === 'Venus') &&
            houses.includes(tp.natalLagnaHouse)) {
          houseHits += 1;
          savSum += tp.ashtakavargaBindus;
          savCount += 1;
          if (tp.ashtakavargaBindus >= 28) score += 0.5;
        }
      }
    }
    if (houseHits > 0) {
      score += Math.min(3, houseHits);
      factors.push(`Transit activation of house(s) ${houses.join(',')} during window (${houseHits} hits)`);
    }
    if (savCount > 0) {
      const avgSav = savSum / savCount;
      if (avgSav >= 28) {
        score += 1.5;
        factors.push(`Average SAV in activated signs ${avgSav.toFixed(1)} (≥28)`);
      }
    }

    if (score < 2) continue;

    const confluence: RankedTimingWindow['confluenceBasis'] =
      score >= 8 ? 'CONVERGENT' : score >= 5 ? 'SUPPORTED' : 'CONTEXTUAL';

    ranked.push({
      id: `WIN_${domain}_${dw.path}_${dw.startDateIso.slice(0, 10)}`,
      domain,
      title: `${domain} window: ${dw.path}`,
      precision: 'EVENT_WINDOW',
      windowStartIso: dw.startDateIso,
      windowEndIso: dw.endDateIso,
      score: Math.round(score * 10) / 10,
      confluenceBasis: confluence,
      activeFactors: factors,
      summary: `EVENT_WINDOW for ${domain} during ${dw.path} (${dw.startDateIso.slice(0, 10)} to ${dw.endDateIso.slice(0, 10)}). Confluence: ${confluence}.`,
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, 8);
}
