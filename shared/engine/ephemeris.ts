/**
 * ASTROWORLD — Ephemeris Provider Contract
 *
 * Defines the minimum astronomical surface required by the Vedic chart engine.
 * The shared package stays browser-safe: concrete native ephemeris adapters
 * belong in the runtime that can legally and technically host them.
 */

// @ts-ignore astronomy-engine has cjs/esm export
import * as Astronomy from 'astronomy-engine';
import {
  calculateAscendant,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
} from './astronomy.ts';

export type EphemerisSource =
  | 'astronomy-engine'
  | 'swiss-ephemeris';

export interface SiderealPlanetaryPosition {
  name:
    | 'Sun'
    | 'Moon'
    | 'Mars'
    | 'Mercury'
    | 'Jupiter'
    | 'Venus'
    | 'Saturn'
    | 'Rahu'
    | 'Ketu';
  siderealLongitude: number;
  longitudeSpeed?: number;
}

export interface SiderealEphemerisSnapshot {
  source: EphemerisSource;
  model: string;
  ephemerisVersion?: string;
  ayanamsha: {
    name: 'Lahiri';
    degrees: number;
  };
  ascendantSiderealLongitude: number;
  planets: SiderealPlanetaryPosition[];
  calculationDateUtc: string;
}

function validateEphemerisDate(dateUtc: Date, label: string): void {
  if (!(dateUtc instanceof Date) || Number.isNaN(dateUtc.getTime())) {
    throw new Error(`${label} requires a valid UTC Date.`);
  }
}

export function validateHorizonLocation(
  location: { latitude: number; longitude: number },
  label: string,
): void {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new Error(`${label} requires finite latitude and longitude.`);
  }
  if (location.latitude < -90 || location.latitude > 90) {
    throw new Error(`${label} latitude must be between -90 and 90 degrees.`);
  }
  if (location.longitude < -180 || location.longitude > 180) {
    throw new Error(`${label} longitude must be between -180 and 180 degrees.`);
  }
}

export type EphemerisHorizonBody = 'Sun' | 'Moon';
export type EphemerisHorizonEvent = 'RISE' | 'SET';

export interface SiderealEphemerisProvider {
  readonly source: EphemerisSource;
  readonly model: string;
  initialize?: () => Promise<void>;
  getAyanamsa(dateUtc: Date): number;
  getPlanetaryPositions(dateUtc: Date): SiderealPlanetaryPosition[];
  getSnapshot(
    dateUtc: Date,
    location: { latitude: number; longitude: number },
  ): SiderealEphemerisSnapshot;
  getHorizonEvent(
    startDateUtc: Date,
    body: EphemerisHorizonBody,
    event: EphemerisHorizonEvent,
    location: { latitude: number; longitude: number },
  ): Date | null;
}


/**
 * Browser-safe fallback provider backed by the existing Astronomy Engine path.
 * This is the default runtime provider and must remain numerically identical
 * to the legacy canonical chart calculation when selected.
 */
export function createAstronomyEngineSnapshot(
  dateUtc: Date,
  location: { latitude: number; longitude: number },
): SiderealEphemerisSnapshot {
  validateEphemerisDate(dateUtc, 'Astronomy Engine');

  const astroTime = new Astronomy.AstroTime(dateUtc);
  const ayanamsha = calculateLahiriAyanamsha(astroTime);
  const ascendant = calculateAscendant(
    astroTime,
    location.latitude,
    location.longitude,
    ayanamsha,
  );
  const planets = calculatePlanetaryPositions(
    astroTime,
    ayanamsha,
    ascendant.signIndex,
  );

  return {
    source: 'astronomy-engine',
    model: 'Astronomy Engine + Analytical Lahiri Ayanamsha',
    ayanamsha: { name: 'Lahiri', degrees: ayanamsha },
    ascendantSiderealLongitude: ascendant.siderealLongitude,
    planets: planets.map((planet) => ({
      name: planet.name,
      siderealLongitude: planet.siderealLongitude,
      longitudeSpeed: planet.speed,
    })),
    calculationDateUtc: dateUtc.toISOString(),
  };
}

export const astronomyEngineEphemerisProvider: SiderealEphemerisProvider = {
  source: 'astronomy-engine',
  model: 'Astronomy Engine + Analytical Lahiri Ayanamsha',
  getAyanamsa(dateUtc) {
    validateEphemerisDate(dateUtc, 'Astronomy Engine ayanamsa calculation');
    return calculateLahiriAyanamsha(new Astronomy.AstroTime(dateUtc));
  },
  getPlanetaryPositions(dateUtc) {
    return createAstronomyEngineSnapshot(dateUtc, { latitude: 0, longitude: 0 }).planets;
  },
  getSnapshot(dateUtc, location) {
    return createAstronomyEngineSnapshot(dateUtc, location);
  },
  getHorizonEvent(startDateUtc, body, event, location) {
    validateEphemerisDate(startDateUtc, 'Astronomy Engine horizon-event calculation');
    validateHorizonLocation(location, 'Astronomy Engine horizon-event calculation');
    const observer = new Astronomy.Observer(location.latitude, location.longitude, 0);
    const bodyMap = { Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon } as const;
    const direction = event === 'RISE' ? 1 : -1;
    const result = Astronomy.SearchRiseSet(
      bodyMap[body],
      observer,
      direction,
      startDateUtc,
      1,
    );
    return result ? result.date : null;
  },
};


/**
 * Resolve a validated ephemeris source name without loading any optional native
 * dependency. Runtime adapters can use this contract for explicit selection.
 */
export function parseEphemerisSource(
  value: string | undefined,
): EphemerisSource {
  const normalized = (value || 'astronomy-engine').trim().toLowerCase();
  if (normalized === 'astronomy-engine' || normalized === 'swiss-ephemeris') {
    return normalized;
  }
  throw new Error(
    `Unsupported ASTROWORLD_EPHEMERIS_PROVIDER: "${value}". Expected "astronomy-engine" or "swiss-ephemeris".`,
  );
}
