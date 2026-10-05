/**
 * ASTROWORLD — Runtime Ephemeris Provider Selection
 *
 * Phase 5B makes ephemeris selection explicit at the backend canonical-chart
 * boundary. The browser/shared engine remains on its validated Astronomy
 * Engine fallback unless a backend provider snapshot is injected.
 *
 * Configure with:
 *   ASTROWORLD_EPHEMERIS_PROVIDER=astronomy-engine
 *   ASTROWORLD_EPHEMERIS_PROVIDER=swiss-ephemeris
 *
 * The default is astronomy-engine. Swiss remains opt-in because its native
 * dependency is optional and carries a separate AGPL-3.0 deployment decision.
 */

import {
  astronomyEngineEphemerisProvider,
  birthProfileToUtcDate,
  computeCanonicalChart,
  parseEphemerisSource,
} from '../../../../shared/index.ts';
import type {
  BirthProfile,
  SiderealEphemerisProvider,
  EphemerisSource,
} from '../../../../shared/index.ts';
import { createSwissEphemerisSnapshot } from './swissEphemerisAdapter.ts';

function swissEphemerisProvider(): SiderealEphemerisProvider {
  return {
    source: 'swiss-ephemeris',
    model: 'Swiss Ephemeris / Lahiri sidereal / apparent geocentric ecliptic longitude',
    getSnapshot(dateUtc, location) {
      return createSwissEphemerisSnapshot(dateUtc, location);
    },
  };
}

export function getConfiguredEphemerisSource(
  value: string | undefined = process.env.ASTROWORLD_EPHEMERIS_PROVIDER,
): EphemerisSource {
  return parseEphemerisSource(value);
}

export function getConfiguredEphemerisProvider(): SiderealEphemerisProvider {
  const source = getConfiguredEphemerisSource();

  if (source === 'swiss-ephemeris') {
    return swissEphemerisProvider();
  }

  return astronomyEngineEphemerisProvider;
}

/**
 * Canonical backend chart path with an explicit runtime astronomical source.
 *
 * Only the natal astronomical snapshot is provider-injected in Phase 5B.
 * Downstream rule engines continue to consume the canonical D1 facts. Existing
 * Panchanga sunrise/search and transit-event internals are intentionally not
 * silently re-pointed here; those require their own provider contracts.
 */
export async function computeCanonicalChartWithConfiguredEphemeris(
  profile: BirthProfile,
  evaluationDateUtc: Date = new Date(),
) {
  const provider = getConfiguredEphemerisProvider();
  const birthUtcDate = birthProfileToUtcDate(profile);
  const snapshot = await provider.getSnapshot(birthUtcDate, {
    latitude: profile.latitude,
    longitude: profile.longitude,
  });

  return computeCanonicalChart(profile, evaluationDateUtc, snapshot);
}
