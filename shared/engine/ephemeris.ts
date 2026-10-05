/**
 * ASTROWORLD — Ephemeris Provider Contract
 *
 * Defines the minimum astronomical surface required by the Vedic chart engine.
 * The shared package stays browser-safe: concrete native ephemeris adapters
 * belong in the runtime that can legally and technically host them.
 */

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
