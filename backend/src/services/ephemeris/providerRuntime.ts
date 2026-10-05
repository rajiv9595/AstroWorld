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
import { createSwissEphemerisProvider } from './swissEphemerisAdapter.ts';

function swissEphemerisProvider(): SiderealEphemerisProvider {
  let delegate: SiderealEphemerisProvider | null = null;

  return {
    source: 'swiss-ephemeris',
    model: 'Swiss Ephemeris / Lahiri sidereal / apparent geocentric ecliptic longitude',
    async initialize() {
      delegate ??= await createSwissEphemerisProvider();
    },
    getAyanamsa(dateUtc) {
      if (!delegate) throw new Error('Swiss Ephemeris provider is not initialized.');
      return delegate.getAyanamsa(dateUtc);
    },
    getPlanetaryPositions(dateUtc) {
      if (!delegate) throw new Error('Swiss Ephemeris provider is not initialized.');
      return delegate.getPlanetaryPositions(dateUtc);
    },
    getSnapshot(dateUtc, location) {
      if (!delegate) throw new Error('Swiss Ephemeris provider is not initialized.');
      return delegate.getSnapshot(dateUtc, location);
    },
    getHorizonEvent(startDateUtc, body, event, location) {
      if (!delegate) throw new Error('Swiss Ephemeris provider is not initialized.');
      return delegate.getHorizonEvent(startDateUtc, body, event, location);
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
  if (provider.initialize) await provider.initialize();
  const birthUtcDate = birthProfileToUtcDate(profile);
  let snapshot;
  try {
    snapshot = await provider.getSnapshot(birthUtcDate, {
      latitude: profile.latitude,
      longitude: profile.longitude,
    });
  } catch (error: any) {
    throw new Error(
      `Ephemeris provider "${provider.source}" failed: ${error?.message || String(error)}`,
    );
  }

  if (snapshot.source !== provider.source) {
    throw new Error(
      `Ephemeris provider mismatch: selected "${provider.source}" but received "${snapshot.source}".`,
    );
  }
  if (snapshot.planets.length !== 9) {
    throw new Error(
      `Ephemeris provider "${provider.source}" returned ${snapshot.planets.length} planetary entries; expected 9.`,
    );
  }
  if (snapshot.calculationDateUtc !== birthUtcDate.toISOString()) {
    throw new Error(
      `Ephemeris provider "${provider.source}" returned a snapshot for ${snapshot.calculationDateUtc} instead of ${birthUtcDate.toISOString()}.`,
    );
  }
  return computeCanonicalChart(profile, evaluationDateUtc, snapshot);
}
