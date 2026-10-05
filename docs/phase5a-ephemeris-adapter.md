# AstroWorld Phase 5A — Ephemeris Adapter

## Goal

Introduce a runtime boundary for higher-precision astronomical calculations without coupling the browser-safe shared package to a native Node ephemeris.

## Current state

AstroWorld's default shared engine continues to use:

- Astronomy Engine for planetary and solar calculations.
- Analytical Lahiri ayanamsha in the current production path.
- The existing reference suites for independent Swiss-Ephemeris comparison.

Phase 5A adds an optional backend-only Swiss Ephemeris adapter. The adapter returns:

- Lahiri ayanamsha
- sidereal Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
- Swiss mean Rahu and derived Ketu
- sidereal Ascendant
- longitude speed where provided by the ephemeris

The adapter implements the shared `SiderealEphemerisProvider` contract and is loaded dynamically so the frontend never imports the native Node addon.

## Why it is opt-in

The current `@swisseph/node` package is an AGPL-3.0 native Node wrapper around Swiss Ephemeris. Production activation therefore requires an explicit licensing decision for the AstroWorld deployment.

No native Swiss dependency has been added to the shared browser-facing workspace.

## Validation

Run the existing precision suite first:

`npm run test:precision`

Then, after intentionally installing the optional Swiss adapter dependency:

`npm install @swisseph/node`

run:

`npm run test:swiss-adapter`

The Swiss adapter contract checks independently established Lahiri/Swiss vectors at:

- 17 Aug 2005, 00:02 IST, Anaparthy
- 1 Jul 2030, 12:00 UTC, Anaparthy

with sub-arcsecond comparison tolerances.

## Phase 5A exit criteria

1. The existing precision suite remains green.
2. The adapter returns all required Vedic bodies and the Ascendant.
3. Swiss Lahiri vectors match the independent oracle.
4. The runtime boundary keeps native ephemeris code out of the shared/browser bundle.
5. Production activation is controlled by an explicit licensing/deployment decision.

## Next step

After adapter validation, Phase 5B should route the backend production chart path through an injected ephemeris provider, then extend the same provider abstraction to Panchanga and event-time calculations. That integration should happen only after the Swiss adapter contract passes locally.
