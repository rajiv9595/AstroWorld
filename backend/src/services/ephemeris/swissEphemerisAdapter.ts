/**
 * ASTROWORLD — Swiss Ephemeris Node Adapter
 *
 * Optional high-precision server-side provider for Phase 5A.
 *
 * IMPORTANT:
 * - The dependency is intentionally loaded dynamically so the browser/shared
 *   bundle does not pull in a native Node addon.
 * - @swisseph/node is an AGPL-3.0 package. Production activation requires
 *   an explicit licensing decision for the AstroWorld deployment.
 */

import type {
  SiderealEphemerisSnapshot,
  SiderealPlanetaryPosition,
} from '../../../../shared/engine/ephemeris.ts';

const SWISS_PACKAGE = '@swisseph/node';

type SwissModule = typeof import('@swisseph/node');

let swissModulePromise: Promise<SwissModule> | null = null;

async function loadSwissModule(): Promise<SwissModule> {
  if (!swissModulePromise) {
    // @ts-ignore Optional runtime dependency; keep shared/browser builds free of native imports.
    swissModulePromise = import(SWISS_PACKAGE);
  }
  return swissModulePromise;
}

const BODY_MAP = [
  ['Sun', 'Sun'],
  ['Moon', 'Moon'],
  ['Mercury', 'Mercury'],
  ['Venus', 'Venus'],
  ['Mars', 'Mars'],
  ['Jupiter', 'Jupiter'],
  ['Saturn', 'Saturn'],
] as const;

function normalizeDegrees(value: number): number {
  let result = value % 360;
  if (result < 0) result += 360;
  return result;
}

function buildFlags(swiss: SwissModule): number {
  return (
    swiss.CalculationFlag.SwissEphemeris |
    swiss.CalculationFlag.Speed |
    swiss.CalculationFlag.Sidereal
  );
}

export async function createSwissEphemerisSnapshot(
  dateUtc: Date,
  location: { latitude: number; longitude: number },
): Promise<SiderealEphemerisSnapshot> {
  if (!(dateUtc instanceof Date) || Number.isNaN(dateUtc.getTime())) {
    throw new Error('Swiss Ephemeris requires a valid UTC Date.');
  }

  const swiss = await loadSwissModule();
  swiss.setSiderealMode(swiss.SiderealMode.Lahiri);

  const jd = swiss.dateToJulianDay(dateUtc);
  const flags = buildFlags(swiss);
  const ayanamsha = swiss.getAyanamsaExUt(
    jd,
    swiss.CalculationFlag.SwissEphemeris,
  );

  const planets: SiderealPlanetaryPosition[] = [];

  for (const [name, enumName] of BODY_MAP) {
    const body = swiss.Planet[enumName];
    const position = swiss.calculatePosition(jd, body, flags);
    planets.push({
      name,
      siderealLongitude: normalizeDegrees(position.longitude),
      longitudeSpeed: position.longitudeSpeed,
    });
  }

  const meanNode = swiss.calculatePosition(
    jd,
    swiss.LunarPoint.MeanNode,
    flags,
  );
  const rahuLongitude = normalizeDegrees(meanNode.longitude);

  planets.push({
    name: 'Rahu',
    siderealLongitude: rahuLongitude,
    longitudeSpeed: meanNode.longitudeSpeed,
  });
  planets.push({
    name: 'Ketu',
    siderealLongitude: normalizeDegrees(rahuLongitude + 180),
    longitudeSpeed: meanNode.longitudeSpeed,
  });

  const houses = swiss.calculateHouses(
    jd,
    location.latitude,
    location.longitude,
    swiss.HouseSystem.Placidus,
  );

  return {
    source: 'swiss-ephemeris',
    model: 'Swiss Ephemeris / Lahiri sidereal / apparent geocentric ecliptic longitude',
    ephemerisVersion:
      typeof (swiss as any).version === 'function'
        ? String((swiss as any).version())
        : undefined,
    ayanamsha: {
      name: 'Lahiri',
      degrees: ayanamsha,
    },
    ascendantSiderealLongitude: normalizeDegrees(houses.ascendant - ayanamsha),
    planets,
    calculationDateUtc: dateUtc.toISOString(),
  };
}

export async function closeSwissEphemeris(): Promise<void> {
  if (!swissModulePromise) return;
  const swiss = await swissModulePromise;
  swiss.close();
}
