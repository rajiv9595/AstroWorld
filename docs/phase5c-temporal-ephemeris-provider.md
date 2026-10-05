# Phase 5C — Temporal Ephemeris Provider

Phase 5C extends the Phase 5B runtime provider boundary beyond the natal
snapshot into time-dependent astronomical calculations.

## Provider surface

Each selected `SiderealEphemerisProvider` now supplies:

- Lahiri ayanamsa at an arbitrary UTC instant.
- Sidereal positions and longitude speeds for Sun, Moon, the seven visible
  planets, Rahu, and Ketu.
- A complete canonical snapshot for a date/location.
- Rise/set events for the Sun and Moon.

The Astronomy Engine implementation is the default and remains browser-safe.
The Swiss implementation is initialized once per runtime provider and then
serves synchronous temporal calculations.

Swiss's Node API directly exposes planetary positions and native rise/transit/set
calculations, which are used by the Phase 5C adapter.

## Panchanga

The comprehensive daily Panchanga accepts an explicit provider. With a Swiss
provider it uses Swiss for:

- Sun and Moon sidereal longitudes.
- Lahiri ayanamsa.
- Sunrise and sunset.
- Moonrise and moonset.
- Moon Nakshatra transition searches used for Amrita-kaal windows.

With no provider argument, the existing Astronomy Engine behavior is preserved.

The canonical birth-chart Panchanga still has the existing chart-level scope:
it calculates the five limbs from the already computed natal D1 positions. The
observer-dependent sunrise/sunset surface is exercised by the comprehensive
daily Panchanga path.

## Transits

The transit engine accepts an explicit provider for:

- Transit planet/node positions and longitude speeds.
- Sade Sati sign classification.
- Parashari natal aspects.
- Solar ingress search and bisection.

The solar ingress search remains an exact 30-degree sidereal boundary search,
but the Sun longitude samples now come from the selected provider.

## Validation policy

The Phase 5C contract verifies:

1. The default Astronomy Engine temporal path is byte-identical to its previous
   behavior.
2. Swiss returns all nine sidereal positions.
3. Swiss supplies Panchanga horizon events.
4. The canonical D1 + Panchanga limbs + transit path can consume a Swiss provider.
5. Swiss solar ingress returns a future event.

The default precision regression suite remains part of `test:precision:all`.

Swiss temporal horizon timestamps are provider-native and are not presented as
an independently cross-validated arcsecond oracle in this phase. A later
precision phase should establish independent horizon-event reference vectors
and explicit atmospheric/refraction conventions before claiming such accuracy.

## Runtime and licensing

Set:

`ASTROWORLD_EPHEMERIS_PROVIDER=astronomy-engine`

or:

`ASTROWORLD_EPHEMERIS_PROVIDER=swiss-ephemeris`

Swiss remains opt-in because `@swisseph/node` is an AGPL-3.0 native package
and production activation requires an explicit licensing/deployment decision.
