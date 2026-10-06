/**
 * ASTROWORLD — Swiss Ephemeris Node Adapter
 *
 * Optional high-precision server-side provider for Phase 5A/5C.
 *
 * IMPORTANT:
 * - The dependency is loaded dynamically so the browser/shared bundle does
 *   not pull in the native Node addon.
 * - @swisseph/node is an AGPL-3.0 package. Production activation requires
 *   an explicit licensing/deployment decision for the AstroWorld deployment.
 */

import type {
  EphemerisHorizonBody,
  EphemerisHorizonEvent,
  SiderealEphemerisSnapshot,
  SiderealEphemerisProvider,
  SiderealPlanetaryPosition,
} from '../../../../shared/engine/ephemeris.ts';

const SWISS_PACKAGE = '@swisseph/node';

type SwissModule = any;

let swissModulePromise: Promise<SwissModule> | null = null;
let swissModule: SwissModule | null = null;

async function loadSwissModule(): Promise<SwissModule> {
  if (!swissModulePromise) {
    // @ts-ignore Optional runtime dependency; keep shared/browser builds free of native imports.
    swissModulePromise = import(SWISS_PACKAGE).then((loaded) => {
      swissModule = loaded;
      return loaded;
    });
  }
  return swissModulePromise;
}

function getLoadedSwissModule(): SwissModule {
  if (!swissModule) {
    throw new Error(
      'Swiss Ephemeris is not initialized. Await the provider initialize() method before temporal calculations.',
    );
  }
  return swissModule;
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

function validateDate(dateUtc: Date, label: string): void {
  if (!(dateUtc instanceof Date) || Number.isNaN(dateUtc.getTime())) {
    throw new Error(`${label} requires a valid UTC Date.`);
  }
}

function buildPlanetFlags(swiss: SwissModule): number {
  return (
    swiss.CalculationFlag.SwissEphemeris |
    swiss.CalculationFlag.Speed |
    swiss.CalculationFlag.Sidereal |
    swiss.CalculationFlag.NoNutation
  );
}

function buildNodeFlags(swiss: SwissModule): number {
  return (
    swiss.CalculationFlag.SwissEphemeris |
    swiss.CalculationFlag.Speed |
    swiss.CalculationFlag.Sidereal
  );
}

function getSwissAyanamsa(jd: number, swiss: SwissModule): number {
  return swiss.getAyanamsaExUt(
    jd,
    swiss.CalculationFlag.SwissEphemeris |
      swiss.CalculationFlag.NoNutation,
  );
}

function getSwissHouseAyanamsa(jd: number, swiss: SwissModule): number {
  return swiss.getAyanamsaExUt(
    jd,
    swiss.CalculationFlag.SwissEphemeris,
  );
}

function calculateSwissPlanetaryPositions(
  dateUtc: Date,
  swiss: SwissModule,
): SiderealPlanetaryPosition[] {
  validateDate(dateUtc, 'Swiss Ephemeris planetary position calculation');
  swiss.setSiderealMode(swiss.SiderealMode.Lahiri);

  const jd = swiss.dateToJulianDay(dateUtc);
  const flags = buildPlanetFlags(swiss);
  const planets: SiderealPlanetaryPosition[] = [];

  for (const [name, enumName] of BODY_MAP) {
    const position = swiss.calculatePosition(
      jd,
      swiss.Planet[enumName],
      flags,
    );
    planets.push({
      name,
      siderealLongitude: normalizeDegrees(position.longitude),
      longitudeSpeed: position.longitudeSpeed,
    });
  }

  const meanNode = swiss.calculatePosition(
    jd,
    swiss.LunarPoint.MeanNode,
    buildNodeFlags(swiss),
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

  return planets;
}

function createSwissEphemerisSnapshotSync(
  dateUtc: Date,
  location: { latitude: number; longitude: number },
): SiderealEphemerisSnapshot {
  validateDate(dateUtc, 'Swiss Ephemeris');
  const swiss = getLoadedSwissModule();
  swiss.setSiderealMode(swiss.SiderealMode.Lahiri);

  const jd = swiss.dateToJulianDay(dateUtc);
  const ayanamsha = getSwissAyanamsa(jd, swiss);
  const houseAyanamsha = getSwissHouseAyanamsa(jd, swiss);
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
      typeof swiss.version === 'function'
        ? String(swiss.version())
        : undefined,
    ayanamsha: {
      name: 'Lahiri',
      degrees: ayanamsha,
    },
    ascendantSiderealLongitude: normalizeDegrees(
      houses.ascendant - houseAyanamsha,
    ),
    planets: calculateSwissPlanetaryPositions(dateUtc, swiss),
    calculationDateUtc: dateUtc.toISOString(),
  };
}

function swissDateTimeToDate(value: any): Date {
  const base = Date.UTC(value.year, value.month - 1, value.day);
  return new Date(base + value.hour * 3600 * 1000);
}

function calculateSwissHorizonEvent(
  startDateUtc: Date,
  body: EphemerisHorizonBody,
  event: EphemerisHorizonEvent,
  location: { latitude: number; longitude: number },
): Date | null {
  validateDate(startDateUtc, 'Swiss Ephemeris horizon-event calculation');
  const swiss = getLoadedSwissModule();
  swiss.setSiderealMode(swiss.SiderealMode.Lahiri);

  const bodyId = swiss.Planet[body];
  const eventType =
    event === 'RISE'
      ? swiss.RiseTransitFlag.Rise
      : swiss.RiseTransitFlag.Set;
  const jd = swiss.dateToJulianDay(startDateUtc);

  try {
    const result = swiss.calculateRiseTransitSet(
      jd,
      bodyId,
      eventType,
      location.longitude,
      location.latitude,
      0,
      swiss.CalculationFlag.SwissEphemeris,
      1013.25,
      15,
    );
    return swissDateTimeToDate(swiss.julianDayToDate(result.time));
  } catch {
    return null;
  }
}

/**
 * Async Phase 5A compatibility helper.
 * Loads the optional module, then executes the same synchronous provider
 * snapshot path used by Phase 5C.
 */
export async function createSwissEphemerisSnapshot(
  dateUtc: Date,
  location: { latitude: number; longitude: number },
): Promise<SiderealEphemerisSnapshot> {
  await loadSwissModule();
  return createSwissEphemerisSnapshotSync(dateUtc, location);
}

export async function createSwissEphemerisProvider(): Promise<SiderealEphemerisProvider> {
  await loadSwissModule();

  return {
    source: 'swiss-ephemeris',
    model: 'Swiss Ephemeris / Lahiri sidereal / apparent geocentric ecliptic longitude',
    getAyanamsa(dateUtc) {
      validateDate(dateUtc, 'Swiss Ephemeris ayanamsa calculation');
      const swiss = getLoadedSwissModule();
      swiss.setSiderealMode(swiss.SiderealMode.Lahiri);
      return getSwissAyanamsa(swiss.dateToJulianDay(dateUtc), swiss);
    },
    getPlanetaryPositions(dateUtc) {
      return calculateSwissPlanetaryPositions(dateUtc, getLoadedSwissModule());
    },
    getSnapshot(dateUtc, location) {
      return createSwissEphemerisSnapshotSync(dateUtc, location);
    },
    getHorizonEvent(startDateUtc, body, event, location) {
      return calculateSwissHorizonEvent(startDateUtc, body, event, location);
    },
  };
}

export async function closeSwissEphemeris(): Promise<void> {
  if (!swissModulePromise) return;
  try {
    const swiss = await swissModulePromise;
    swiss.close();
  } catch {
    // Optional dependency may legitimately be absent during non-Swiss runs.
  } finally {
    swissModule = null;
    swissModulePromise = null;
  }
}
