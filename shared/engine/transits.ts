/**
 * ASTROWORLD — Gochara (Transit) Engine
 * Real-time or arbitrary date transit calculations, Parashari aspects, and labeled Western overlays.
 */

import {
  formatDMS,
  normalizeDegrees,
} from './astronomy.ts';
import { ZODIAC_SIGNS } from './constants.ts';
import {
  AshtakavargaFacts,
  PlanetName,
  PlanetPosition,
  TransitFacts,
  TransitPlanet,
  ZodiacSign,
} from './types.ts';
import { astronomyEngineEphemerisProvider, SiderealEphemerisProvider } from './ephemeris.ts';
import { getParashariHouseDistance, getParashariAspectHouses } from './aspects.ts';

/**
 * Determine Parashari aspects cast by a transiting planet onto a natal planet.
 */
function getParashariAspects(
  transitPlanet: PlanetName,
  transitHouse: number,
  transitLongitude: number,
  natalPlanets: PlanetPosition[],
): TransitPlanet['aspectsToNatal'] {
  const aspects: TransitPlanet['aspectsToNatal'] = [];
  const transitAspectHouses = new Set(
    getParashariAspectHouses(transitHouse, transitPlanet),
  );

  for (const np of natalPlanets) {
    const distance = getParashariHouseDistance(transitHouse, np.houseNumber);

    if (distance === 1) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Conjunction (Yuti) with natal ${np.name} in ${np.sign}`,
      });
    } else if (transitAspectHouses.has(np.houseNumber)) {
      const aspectLabel =
        transitPlanet === 'Mars' && (distance === 4 || distance === 8)
          ? `Special Mars ${distance}th House Drishti`
          : transitPlanet === 'Jupiter' && (distance === 5 || distance === 9)
            ? `Special Jupiter ${distance}th House Benefic Drishti`
            : transitPlanet === 'Saturn' && (distance === 3 || distance === 10)
              ? `Special Saturn ${distance}th House Drishti`
              : 'Full 7th House Aspect (Drishti)';

      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `${aspectLabel} on natal ${np.name}`,
      });
    }

    // Western overlay remains opt-in as a descriptive, degree-based layer.
    const degDiff = Math.abs(transitLongitude - np.siderealLongitude);
    const circularDegDiff = Math.min(degDiff, 360 - degDiff);
    const westernConfigs = [
      { name: 'Trine (120°)', angle: 120, orb: 5.0 },
      { name: 'Square (90°)', angle: 90, orb: 4.5 },
      { name: 'Sextile (60°)', angle: 60, orb: 4.0 },
      { name: 'Opposition (180°)', angle: 180, orb: 5.0 },
    ];

    for (const w of westernConfigs) {
      const orb = Math.abs(circularDegDiff - w.angle);
      if (orb <= w.orb) {
        aspects.push({
          natalPlanet: np.name,
          type: 'WESTERN_OPTIONAL',
          aspectDescription: `[Western Overlay] ${w.name} aspect (orb ${orb.toFixed(1)}°)`,
          orbDegrees: Math.round(orb * 10) / 10,
        });
      }
    }
  }

  return aspects;
}

export function classifySadeSati(
  transitSaturnSignIndex: number,
  natalMoonSignIndex: number
): { active: boolean; phase: 'RISING' | 'PEAK' | 'SETTING' | 'NONE' } {
  const diffFromMoon = (transitSaturnSignIndex - natalMoonSignIndex + 12) % 12;
  if (diffFromMoon === 11) return { active: true, phase: 'RISING' };
  if (diffFromMoon === 0) return { active: true, phase: 'PEAK' };
  if (diffFromMoon === 1) return { active: true, phase: 'SETTING' };
  return { active: false, phase: 'NONE' };
}

function validateTemporalSearchDate(dateUtc: Date, label: string): void {
  if (!(dateUtc instanceof Date) || Number.isNaN(dateUtc.getTime())) {
    throw new Error(`${label} requires a valid UTC Date.`);
  }
}

function calculateSiderealSunLongitude(
  date: Date,
  provider: SiderealEphemerisProvider,
): number {
  validateTemporalSearchDate(date, 'Sidereal solar ingress search');
  const sun = provider.getPlanetaryPositions(date).find((p) => p.name === 'Sun');
  if (!sun || !Number.isFinite(sun.siderealLongitude)) {
    throw new Error('Ephemeris provider returned no finite Sun position.');
  }
  return normalizeDegrees(sun.siderealLongitude);
}

/**
 * Find the next sidereal solar ingress after the evaluated instant.
 * The search uses a forward bracket followed by bisection on the exact
 * 30-degree zodiac boundary in sidereal longitude.
 */
export function findNextSiderealSolarIngress(
  startDateUtc: Date,
  provider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): {
  timestampUtc: Date;
  targetSignIndex: number;
} {
  validateTemporalSearchDate(startDateUtc, 'Sidereal solar ingress search');

  const startLon = calculateSiderealSunLongitude(startDateUtc, provider);
  const currentSign = Math.floor(startLon / 30);
  const targetSignIndex = (currentSign + 1) % 12;
  const targetLon = targetSignIndex * 30;
  const targetDelta = (targetLon - startLon + 360) % 360;

  if (!(targetDelta > 0 && targetDelta <= 30)) {
    throw new Error(
      `Unable to determine the next sidereal solar ingress from longitude ${startLon}°.`,
    );
  }

  const forwardDelta = (lon: number) => {
    if (!Number.isFinite(lon)) {
      throw new Error('Ephemeris provider returned a non-finite Sun longitude during ingress search.');
    }
    return (normalizeDegrees(lon) - startLon + 360) % 360;
  };

  let hi = new Date(
    startDateUtc.getTime() + Math.max(2, targetDelta / 0.75) * 86400000,
  );
  let bracketed = false;

  for (let guard = 0; guard < 12; guard++) {
    if (forwardDelta(calculateSiderealSunLongitude(hi, provider)) >= targetDelta) {
      bracketed = true;
      break;
    }
    hi = new Date(hi.getTime() + 7 * 86400000);
  }

  if (!bracketed) {
    throw new Error(
      `Unable to bracket sidereal solar ingress within ${12 * 7} additional days.`,
    );
  }

  let lo = startDateUtc;
  for (let i = 0; i < 55; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const midDelta = forwardDelta(calculateSiderealSunLongitude(mid, provider));
    if (midDelta >= targetDelta) hi = mid;
    else lo = mid;
  }

  const timestampUtc = new Date((lo.getTime() + hi.getTime()) / 2);
  if (timestampUtc.getTime() <= startDateUtc.getTime()) {
    throw new Error('Sidereal solar ingress search did not return a strictly future event.');
  }

  return {
    timestampUtc,
    targetSignIndex,
  };
}

/**
 * Calculate Gochara (Transit) facts for an arbitrary date.
 */
export function calculateTransits(
  natalPlanets: PlanetPosition[],
  natalAscendantSignIndex: number,
  ashtakavarga: AshtakavargaFacts,
  targetDateUtc: Date = new Date(),
  ephemerisProvider: SiderealEphemerisProvider = astronomyEngineEphemerisProvider,
): TransitFacts {
  // Compute transit positions from the selected provider. The default path
  // remains the validated Astronomy Engine calculation.
  const transitPlanetsRaw = ephemerisProvider.getPlanetaryPositions(targetDateUtc);

  const natalMoon = natalPlanets.find((p) => p.name === 'Moon')!;
  const natalMoonSignIndex = natalMoon.signIndex;

  const transitPlanets: TransitPlanet[] = transitPlanetsRaw.map((tp) => {
    const siderealLongitude = normalizeDegrees(tp.siderealLongitude);
    const signIndex = Math.floor(siderealLongitude / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = siderealLongitude % 30;
    const retrograde = (tp.longitudeSpeed ?? 0) < 0;
    // Natal-relative house from Lagna (1-12)
    const natalLagnaHouse = ((signIndex - natalAscendantSignIndex + 12) % 12) + 1;
    // Chandra-relative house from Moon (1-12)
    const chandraLagnaHouse = ((signIndex - natalMoonSignIndex + 12) % 12) + 1;

    // Ashtakavarga bindus in the transit sign
    const bindus = ashtakavarga.sav[signIndex];

    const aspectsToNatal = getParashariAspects(tp.name, natalLagnaHouse, siderealLongitude, natalPlanets);

    return {
      planet: tp.name,
      siderealLongitude,
      sign,
      degreeInSign,
      formattedDegree: formatDMS(degreeInSign),
      retrograde,
      natalLagnaHouse,
      chandraLagnaHouse,
      ashtakavargaBindus: bindus,
      aspectsToNatal,
    };
  });

  const solarIngress = findNextSiderealSolarIngress(targetDateUtc, ephemerisProvider);

  // Sade Sati Analysis
  const transitSaturn = transitPlanets.find((p) => p.planet === 'Saturn')!;
  const saturnSignIdx = ZODIAC_SIGNS.indexOf(transitSaturn.sign);
  const sadeSatiState = classifySadeSati(saturnSignIdx, natalMoonSignIndex);

  let isSadeSati = sadeSatiState.active;
  let phase: TransitFacts['sadeSati']['phase'] = sadeSatiState.phase;
  let desc = 'Saturn is outside the Sade Sati zone from natal Moon.';

  if (phase === 'RISING') {
    desc = `Rising phase of Sade Sati: Saturn in ${transitSaturn.sign} (12th from natal Moon in ${natalMoon.sign}). Brings introspection, structural re-evaluation, and mental preparation.`;
  } else if (phase === 'PEAK') {
    desc = `Peak (Janma Shani) phase of Sade Sati: Saturn conjunct natal Moon in ${natalMoon.sign}. A time of deep maturity, disciplined focus, emotional endurance, and karmic consolidation.`;
  } else if (phase === 'SETTING') {
    desc = `Setting phase of Sade Sati: Saturn in ${transitSaturn.sign} (2nd from natal Moon). Rebuilding financial foundations, family responsibilities, and reaping lessons of resilience.`;
  }

  return {
    queryDateIso: targetDateUtc.toISOString(),
    planets: transitPlanets,
    solarIngress: {
      timestampUtc: solarIngress.timestampUtc.toISOString(),
      targetSign: ZODIAC_SIGNS[solarIngress.targetSignIndex],
    },
    sadeSati: {
      active: isSadeSati,
      phase,
      saturnSign: transitSaturn.sign,
      moonSign: natalMoon.sign,
      description: desc,
    },
  };
}
