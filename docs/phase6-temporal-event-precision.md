# Phase 6 — Temporal/Event Precision

## Evidence for the phase

Phase 5C/5D providerized time-dependent astronomy and hardened horizon-event
semantics. The remaining event surface had two gaps:

1. Solar ingress was searched by a forward bracket and bisection, but the
   implementation did not fail explicitly when the bracket could not be
   established and did not validate provider longitude values during the
   search.
2. Moon Nakshatra transition search existed only as a private Panchanga helper.
   It had no frozen event-time contract, no explicit previous/next public
   event API, and no wrap-around oracle coverage at the 0° boundary.

These are event-search reliability/precision gaps, not changes to the existing
astrological interpretation rules.

## Phase 6 scope

### Solar ingress

`findNextSiderealSolarIngress()` now:

- validates the start UTC date;
- validates finite provider Sun longitudes;
- preserves the exact 30° sidereal boundary search;
- fails closed when the forward bracket cannot be established;
- verifies that the returned event is strictly after the requested instant.

### Moon Nakshatra transitions

`findSiderealMoonNakshatraTransition()` now:

- is exported as a reusable temporal-event primitive;
- supports previous (`-1`) and next (`+1`) transitions;
- uses the selected ephemeris provider throughout;
- verifies strict event ordering;
- preserves the existing bisection/search semantics used by Amrita Kaal.

### Frozen event oracle

The Phase 6 contract uses vectors generated independently with Python
`pyswisseph` against Swiss Ephemeris 2.10.03.

Coverage includes:

- solar ingress to 0° Aries wrap;
- solar ingress immediately after the Aries boundary;
- a later 180° solar ingress;
- Moon Nakshatra transition across 0°;
- Moon transitions in 2005, 2024, and 2026;
- previous and next Moon transitions;
- strict future/previous event ordering.

The Swiss provider is required to reproduce the frozen execution-path vectors
within 2 seconds. Astronomy Engine is required to remain within 60 seconds of
the same controlled event reference.

This is an independent execution path, not an independent ephemeris-model
claim, because both Swiss checks use the same Swiss Ephemeris computational
core.

## Regression policy

No existing planetary, Panchanga, transit, horizon, or tolerance contract is
loosened. The Phase 6 event contract is appended to `test:precision:all`.

The default Astronomy Engine temporal behavior remains protected by the
existing Phase 5C contract, while Phase 5D continues to own horizon-event
precision and civil-day semantics.