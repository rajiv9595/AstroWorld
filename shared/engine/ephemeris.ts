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

export interface SiderealEphemerisProvider {
  readonly source: EphemerisSource;
  readonly model: string;
  getSnapshot(
    dateUtc: Date,
    location: { latitude: number; longitude: number },
  ): SiderealEphemerisSnapshot | Promise<SiderealEphemerisSnapshot>;
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
  if (!(dateUtc instanceof Date) || Number.isNaN(dateUtc.getTime())) {
    throw new Error('Astronomy Engine requires a valid UTC Date.');
  }

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
  getSnapshot(dateUtc, location) {
    return createAstronomyEngineSnapshot(dateUtc, location);
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
