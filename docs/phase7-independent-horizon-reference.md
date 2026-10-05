# Phase 7 — Independent Horizon Reference

## Purpose

Phase 5D established a strict Swiss Ephemeris execution-path oracle for Sun and
Moon rise/set and protected local civil-day assignment. Phase 7 adds a second,
genuinely separate solar calculation model so horizon validation is no longer
entirely dependent on a single ephemeris computational core.

The new reference is based on the NOAA Global Monitoring Laboratory's published
sunrise/sunset equations, which are based on Jean Meeus' *Astronomical
Algorithms*.

Source:
https://gml.noaa.gov/grad/solcalc/solareqns.PDF

NOAA describes the method as approximately one-minute accurate for latitudes
between ±72°, while also noting that atmospheric conditions can move observed
times away from calculated values.

## Scope

Phase 7 is verification-only. It does not change AstroWorld's production
horizon-event provider.

The new contract covers ten Sun events:

- Anaparthy, 2005-08-17: rise and set.
- New Delhi, 2024-03-10: rise and set.
- New York, 2024-03-10 DST start: rise and set.
- New York, 2024-11-03 DST end: rise and set.
- Sydney, 2024-12-21 DST: rise and set.

Each case validates:

1. NOAA reference calculation returns a finite event.
2. Swiss Ephemeris provider stays within the explicit NOAA model envelope.
3. Astronomy Engine stays within the same explicit NOAA model envelope.
4. Both provider results map to the expected local civil date.
5. The existing Phase 5D strict Swiss ≤2-second frozen-vector contract remains
   separate and unchanged.

## Reference convention

The NOAA equations use:

- longitude positive east of Greenwich;
- the published fractional-year equation of time and solar declination;
- a 90.833° solar zenith for apparent sunrise/sunset, representing the solar
  disk plus nominal atmospheric refraction;
- sea-level, flat-horizon geometry.

This convention is not claimed to be observationally exact. Phase 5D's Swiss
contract continues to own the repository's stricter frozen execution-path
precision gate.

## Model envelope

The independent-model gate uses a 180-second envelope for Swiss/NOAA and
Astronomy Engine/NOAA comparisons.

This is intentionally a separate model-validation envelope, not a replacement
for any existing precision tolerance. NOAA's published approximation is about
one minute below ±72° latitude, while the explicit envelope accommodates
rounding and differences between the NOAA approximation and the ephemeris
providers without asserting a tighter accuracy than the reference warrants.

## Moon horizon events

Phase 7 does not introduce a Moon rise/set independent model. Moon horizon
events therefore remain covered by the Phase 5D Swiss execution-path vectors
and Astronomy Engine comparison. A later phase may add an independent lunar
horizon reference if a reproducible reference model with controlled assumptions
is selected.

## Regression integration

The Phase 7 gate is appended to:

`npm run test:precision:all`

The existing Phase 1–6 gates remain unchanged. No tolerances in those suites
are loosened.
