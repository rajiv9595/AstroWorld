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

/**
 * Determine Parashari aspects cast by a transiting planet onto a natal planet.
 */
function getParashariAspects(
  transitPlanet: PlanetName,
  transitSignIdx: number,
  transitLongitude: number,
  natalPlanets: PlanetPosition[]
): TransitPlanet['aspectsToNatal'] {
  const aspects: TransitPlanet['aspectsToNatal'] = [];

  for (const np of natalPlanets) {
    const diff = (np.signIndex - transitSignIdx + 12) % 12;

    // Conjunction (diff === 0)
    if (diff === 0) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Conjunction (Yuti) with natal ${np.name} in ${np.sign}`,
      });
    }

    // 7th full aspect (all planets cast 7th aspect)
    if (diff === 6) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Full 7th House Aspect (Drishti) on natal ${np.name}`,
      });
    }

    // Mars special aspects (4th and 8th)
    if (transitPlanet === 'Mars' && (diff === 3 || diff === 7)) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Special Mars ${diff === 3 ? '4th' : '8th'} House Drishti on natal ${np.name}`,
      });
    }

    // Jupiter special aspects (5th and 9th)
    if (transitPlanet === 'Jupiter' && (diff === 4 || diff === 8)) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Special Jupiter ${diff === 4 ? '5th' : '9th'} House Benefic Drishti on natal ${np.name}`,
      });
    }

    // Saturn special aspects (3rd and 10th)
    if (transitPlanet === 'Saturn' && (diff === 2 || diff === 9)) {
      aspects.push({
        natalPlanet: np.name,
        type: 'PARASHARI',
        aspectDescription: `Special Saturn ${diff === 2 ? '3rd' : '10th'} House Drishti on natal ${np.name}`,
      });
    }

    // Optional Western aspects with strict degree orb labeling
    const degDiff = Math.abs(
      // Western overlay uses the actual transit longitude, not the start of its sign.
      // The previous implementation compared sign boundaries (e.g. 90°) against the
      // natal longitude, which could mislabel aspects by the transit planet's degree.
      transitLongitude - np.siderealLongitude
    );
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

function calculateSiderealSunLongitude(
  date: Date,
  provider: SiderealEphemerisProvider,
): number {
  const sun = provider.getPlanetaryPositions(date).find((p) => p.name === 'Sun');
  if (!sun) throw new Error('Ephemeris provider returned no Sun position.');
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
  const startLon = calculateSiderealSunLongitude(startDateUtc, provider);
  const currentSign = Math.floor(startLon / 30);
  const targetSignIndex = (currentSign + 1) % 12;
  const targetLon = (targetSignIndex * 30);
  const targetDelta = (targetLon - startLon + 360) % 360;

  const forwardDelta = (lon: number) => (lon - startLon + 360) % 360;
  let hi = new Date(startDateUtc.getTime() + Math.max(2, targetDelta / 0.75) * 86400000);
  let guard = 0;
  while (forwardDelta(calculateSiderealSunLongitude(hi, provider)) < targetDelta && guard++ < 12) {
    hi = new Date(hi.getTime() + 7 * 86400000);
  }

  let lo = startDateUtc;
  for (let i = 0; i < 55; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const midDelta = forwardDelta(calculateSiderealSunLongitude(mid, provider));
    if (midDelta >= targetDelta) hi = mid;
    else lo = mid;
  }

  return {
    timestampUtc: new Date((lo.getTime() + hi.getTime()) / 2),
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

    const aspectsToNatal = getParashariAspects(tp.name, signIndex, siderealLongitude, natalPlanets);

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
