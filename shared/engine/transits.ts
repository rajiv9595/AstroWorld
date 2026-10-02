/**
 * ASTROWORLD — Gochara (Transit) Engine
 * Real-time or arbitrary date transit calculations, Parashari aspects, and labeled Western overlays.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import {
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
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

/**
 * Determine Parashari aspects cast by a transiting planet onto a natal planet.
 */
function getParashariAspects(
  transitPlanet: PlanetName,
  transitSignIdx: number,
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
    const degDiff = Math.abs(transitSignIdx * 30 - np.siderealLongitude);
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

/**
 * Calculate Gochara (Transit) facts for an arbitrary date.
 */
export function calculateTransits(
  natalPlanets: PlanetPosition[],
  natalAscendantSignIndex: number,
  ashtakavarga: AshtakavargaFacts,
  targetDateUtc: Date = new Date()
): TransitFacts {
  const time = new Astronomy.AstroTime(targetDateUtc);
  const ayanamsha = calculateLahiriAyanamsha(time);

  // Compute transit positions
  const transitPlanetsRaw = calculatePlanetaryPositions(time, ayanamsha, natalAscendantSignIndex);

  const natalMoon = natalPlanets.find((p) => p.name === 'Moon')!;
  const natalMoonSignIndex = natalMoon.signIndex;

  const transitPlanets: TransitPlanet[] = transitPlanetsRaw.map((tp) => {
    // Natal-relative house from Lagna (1-12)
    const natalLagnaHouse = ((tp.signIndex - natalAscendantSignIndex + 12) % 12) + 1;
    // Chandra-relative house from Moon (1-12)
    const chandraLagnaHouse = ((tp.signIndex - natalMoonSignIndex + 12) % 12) + 1;

    // Ashtakavarga bindus in the transit sign
    const bindus = ashtakavarga.sav[tp.signIndex];

    const aspectsToNatal = getParashariAspects(tp.name, tp.signIndex, natalPlanets);

    return {
      planet: tp.name,
      siderealLongitude: tp.siderealLongitude,
      sign: tp.sign,
      degreeInSign: tp.degreeInSign,
      formattedDegree: formatDMS(tp.degreeInSign),
      retrograde: tp.retrograde,
      natalLagnaHouse,
      chandraLagnaHouse,
      ashtakavargaBindus: bindus,
      aspectsToNatal,
    };
  });

  // Sade Sati Analysis
  const transitSaturn = transitPlanets.find((p) => p.planet === 'Saturn')!;
  const saturnSignIdx = ZODIAC_SIGNS.indexOf(transitSaturn.sign);
  const diffFromMoon = (saturnSignIdx - natalMoonSignIndex + 12) % 12;

  let isSadeSati = false;
  let phase: TransitFacts['sadeSati']['phase'] = 'NONE';
  let desc = 'Saturn is outside the Sade Sati zone from natal Moon.';

  if (diffFromMoon === 11) {
    isSadeSati = true;
    phase = 'RISING';
    desc = `Rising phase of Sade Sati: Saturn in ${transitSaturn.sign} (12th from natal Moon in ${natalMoon.sign}). Brings introspection, structural re-evaluation, and mental preparation.`;
  } else if (diffFromMoon === 0) {
    isSadeSati = true;
    phase = 'PEAK';
    desc = `Peak (Janma Shani) phase of Sade Sati: Saturn conjunct natal Moon in ${natalMoon.sign}. A time of deep maturity, disciplined focus, emotional endurance, and karmic consolidation.`;
  } else if (diffFromMoon === 1) {
    isSadeSati = true;
    phase = 'SETTING';
    desc = `Setting phase of Sade Sati: Saturn in ${transitSaturn.sign} (2nd from natal Moon). Rebuilding financial foundations, family responsibilities, and reaping lessons of resilience.`;
  }

  return {
    queryDateIso: targetDateUtc.toISOString(),
    planets: transitPlanets,
    sadeSati: {
      active: isSadeSati,
      phase,
      saturnSign: transitSaturn.sign,
      moonSign: natalMoon.sign,
      description: desc,
    },
  };
}
