/**
 * ASTROWORLD — Astronomical Calculation Engine
 * High-precision planetary ephemeris, Lahiri ayanamsha, and house calculations.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, SANSKRIT_PLANET_NAMES, SIGN_LORDS, ZODIAC_SIGNS } from './constants.ts';
import { AscendantInfo, BirthProfile, PlanetName, PlanetPosition, ZodiacSign } from './types.ts';

export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  if (d >= 360 || Math.abs(d - 360) < 1e-12) return 0;
  return d;
}

export function formatDMS(deg: number): string {
  const norm = normalizeDegrees(deg);
  const d = Math.floor(norm);
  const remMinutes = (norm - d) * 60;
  const m = Math.floor(remMinutes);
  const s = Math.floor((remMinutes - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/**
 * Calculate standard Lahiri (Chitra Paksha) Ayanamsha in degrees for a given AstroTime.
 * Base value at J2000.0 (JD 2451545.0) = 23° 51' 25.532" = 23.8570922°
 * Precession rate: 5029.0966 arcseconds per Julian century (IAU standard).
 * High-precision planetary ephemeris computed using astronomy-engine (Don Cross mechanics).
 */
export function calculateLahiriAyanamsha(time: any): number {
  const t = time.ut / 36525.0; // Julian centuries from J2000.0
  const ayanamsha = 23.8570922 + (5029.0966 * t + 1.1116 * t * t) / 3600.0;
  return ayanamsha;
}

/**
 * Parse local birth profile into UTC Date object safely.
 */
export function localDateTimeToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
  timezone = 'Asia/Kolkata',
): Date {
  const targetWallMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Iteratively solve UTC -> requested timezone wall time. A single probe can
  // cross a DST transition and select the wrong offset; iteration converges
  // on the offset that actually applies to the target wall-clock instant.
  let candidateMs = targetWallMs;
  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(new Date(candidateMs));
    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10);
    }

    const formattedWallMs = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour === 24 ? 0 : p.hour,
      p.minute,
      p.second,
    );
    const correctionMs = targetWallMs - formattedWallMs;
    if (correctionMs === 0) return new Date(candidateMs);
    candidateMs += correctionMs;
  }

  return new Date(candidateMs);
}
export function birthProfileToUtcDate(profile: BirthProfile): Date {
  return localDateTimeToUtcDate(
    profile.year,
    profile.month,
    profile.day,
    profile.hour,
    profile.minute,
    profile.second || 0,
    profile.timezone || 'Asia/Kolkata',
  );
}

/**
 * Resolve an equal-width angular partition using half-open [start, end)
 * semantics while compensating for tiny floating-point errors at exact
 * mathematical boundaries.
 */
function calculateEqualAngularPart(
  value: number,
  span: number,
  count: number,
): { part: number; offset: number } {
  const quotient = value / span;
  const nearestInteger = Math.round(quotient);
  const boundaryTolerance = 1e-10;
  const isExactBoundary = Math.abs(quotient - nearestInteger) < boundaryTolerance;

  const part = Math.min(
    count - 1,
    isExactBoundary ? nearestInteger : Math.floor(quotient),
  );

  return {
    part,
    offset: isExactBoundary ? 0 : value - part * span,
  };
}

export function getNakshatraAndPada(siderealLongitude: number): {
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraLord: PlanetName;
  pada: number;
  completedPercent: number;
} {
  const norm = normalizeDegrees(siderealLongitude);
  const nakSpan = 360 / 27; // 13.333333°
  const {
    part: index,
    offset: degInNak,
  } = calculateEqualAngularPart(norm, nakSpan, 27);
  const nak = NAKSHATRAS[index];

  const padaSpan = nakSpan / 4; // 3.333333°
  const {
    part: padaPart,
    offset: degInPada,
  } = calculateEqualAngularPart(degInNak, padaSpan, 4);
  const pada = padaPart + 1;
  const completedPercent = Math.min(
    100,
    Math.max(0, (degInNak / nakSpan) * 100),
  );

  // Keep the local pada offset explicit so exact pada boundaries remain
  // deterministic even when JavaScript cannot represent the decimal span
  // exactly. It is intentionally not used to alter the percentage, which is
  // defined from the exact nakshatra position.
  void degInPada;

  return {
    nakshatra: nak.name,
    nakshatraNumber: nak.number,
    nakshatraLord: nak.ruler,
    pada,
    completedPercent,
  };
}

/**
 * Calculate Vedic Ascendant (Lagna) for a given time and geographic location.
 */
export function calculateAscendant(time: any, lat: number, lon: number, ayanamsha: number): AscendantInfo {
  const gmst = Astronomy.SiderealTime(time);
  const lstHours = (gmst + lon / 15.0 + 24.0) % 24.0;
  const ramcRad = (lstHours * 15.0 * Math.PI) / 180.0;
  const latRad = (lat * Math.PI) / 180.0;

  // True obliquity of ecliptic
  const t = time.ut / 36525.0;
  const epsDeg = 23.4392911 - (46.815 * t) / 3600.0;
  const epsRad = (epsDeg * Math.PI) / 180.0;

  // Ascendant formula (Meeus)
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  let ascTropDeg = (Math.atan2(y, x) * 180.0) / Math.PI;
  if (ascTropDeg < 0) ascTropDeg += 360.0;

  const ascSidDeg = normalizeDegrees(ascTropDeg - ayanamsha);
  const signIndex = Math.floor(ascSidDeg / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = ascSidDeg % 30;

  const nakInfo = getNakshatraAndPada(ascSidDeg);

  return {
    tropicalLongitude: ascTropDeg,
    siderealLongitude: ascSidDeg,
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
 * Calculate all 9 Vedic planetary positions for a birth profile.
 */
export function calculatePlanetaryPositions(
  time: any,
  ayanamsha: number,
  ascendantSignIndex: number
): PlanetPosition[] {
  const t = time.ut / 36525.0;

  // Tropical ecliptic positions. Retrograde status is derived from the actual
  // apparent geocentric longitude trend, not from a fixed mean-speed constant.
  const tropicalLongitude = (body: any, atTime: any): number =>
    Astronomy.Ecliptic(Astronomy.GeoVector(body, atTime, true)).elon;

  const sunPos = Astronomy.SunPosition(time);
  const bodies: { name: PlanetName; tropLon: number; body?: any }[] = [
    { name: 'Sun', tropLon: sunPos.elon },
    { name: 'Moon', tropLon: tropicalLongitude('Moon' as any, time), body: 'Moon' as any },
    { name: 'Mars', tropLon: tropicalLongitude('Mars' as any, time), body: 'Mars' as any },
    { name: 'Mercury', tropLon: tropicalLongitude('Mercury' as any, time), body: 'Mercury' as any },
    { name: 'Jupiter', tropLon: tropicalLongitude('Jupiter' as any, time), body: 'Jupiter' as any },
    { name: 'Venus', tropLon: tropicalLongitude('Venus' as any, time), body: 'Venus' as any },
    { name: 'Saturn', tropLon: tropicalLongitude('Saturn' as any, time), body: 'Saturn' as any },
  ];

  // Analytical mean lunar node (Rahu). This is a compact polynomial model,
  // not a direct Swiss-Ephemeris node call; reference suites therefore use
  // an independent Swiss mean-node oracle with an explicit wider tolerance.
  const omegaTrop = normalizeDegrees(125.04452 - 1934.136261 * t + 0.0020708 * t * t);
  bodies.push({ name: 'Rahu', tropLon: omegaTrop });
  bodies.push({ name: 'Ketu', tropLon: normalizeDegrees(omegaTrop + 180.0) });

  const sunSidLon = normalizeDegrees(sunPos.elon - ayanamsha);
  const dayStep = 0.01; // ~14.4 minutes; sufficient to identify apparent retrograde direction.
  const angularDelta = (a: number, b: number): number => {
    const raw = normalizeDegrees(a - b);
    return raw > 180 ? raw - 360 : raw;
  };

  return bodies.map((b) => {
    const sidLon = normalizeDegrees(b.tropLon - ayanamsha);
    const signIndex = Math.floor(sidLon / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = sidLon % 30;

    let speed: number;
    if (b.body) {
      const prevLon = tropicalLongitude(b.body, time.AddDays(-dayStep));
      const nextLon = tropicalLongitude(b.body, time.AddDays(dayStep));
      speed = angularDelta(nextLon, prevLon) / (2 * dayStep);
    } else if (b.name === 'Rahu' || b.name === 'Ketu') {
      speed = -0.05295;
    } else {
      speed = 0.9856;
    }

    let combust = false;
    if (b.name !== 'Sun' && b.name !== 'Rahu' && b.name !== 'Ketu') {
      const diff = Math.min(
        Math.abs(sidLon - sunSidLon),
        360 - Math.abs(sidLon - sunSidLon)
      );
      const combustionOrbs: Record<string, number> = {
        Moon: 12.0,
        Mars: 17.0,
        Mercury: (speed < 0 ? 12.0 : 14.0),
        Jupiter: 11.0,
        Venus: (speed < 0 ? 8.0 : 10.0),
        Saturn: 15.0,
      };
      if (diff <= (combustionOrbs[b.name] || 10.0)) combust = true;
    }

    const nakInfo = getNakshatraAndPada(sidLon);
    const signLord = SIGN_LORDS[sign];

    return {
      name: b.name,
      sanskritName: SANSKRIT_PLANET_NAMES[b.name],
      tropicalLongitude: b.tropLon,
      siderealLongitude: sidLon,
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
      signLord,
      naturalRelationshipToLord: 'NEUTRAL',
    };
  });
}