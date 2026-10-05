# Phase 8 — Horizon Edge-State Contract

## Purpose

Phase 8 is the final precision-hardening boundary for horizon API semantics.

Phase 5D established strict horizon-event precision and civil-day mapping.
Phase 7 added a separate solar reference model. Phase 8 hardens the remaining
provider-interface edge cases where a result must be represented explicitly as
either a valid event or a deterministic no-event state.

## Changes

The shared ephemeris contract now validates horizon coordinates before an
Astronomy Engine or Swiss calculation is invoked:

- latitude must be finite and within -90° to +90°;
- longitude must be finite and within -180° to +180°;
- invalid coordinates fail closed with an explicit validation error.

The Phase 8 verification contract covers:

- Tromsø summer solar-set no-event state;
- Tromsø winter solar-rise no-event state;
- Longyearbyen summer solar-set no-event state;
- Longyearbyen winter solar-rise no-event state;
- invalid NaN latitude;
- invalid latitude above +90°;
- invalid longitude above +180°;
- ordinary Anaparthy sunrise and sunset anchors;
- exact local civil-day/time mapping;
- rise-before-set ordering.

Both Astronomy Engine and Swiss providers are exercised.

## No model changes

Phase 8 does not change:

- ephemeris models;
- Lahiri ayanamsa;
- horizon/refraction convention;
- Phase 5D tolerances;
- Phase 6 temporal-event tolerances;
- Phase 7 independent solar reference envelope.

It only makes provider boundary behavior explicit and deterministic.

## Regression integration

The contract is appended to:

`npm run test:precision:all`

No prior tolerance is loosened.
