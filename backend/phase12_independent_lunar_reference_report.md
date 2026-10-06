# AstroWorld Phase 12 — Independent Lunar Horizon Reference

## Objective

Validate Moonrise and Moonset independently of both:

- Swiss Ephemeris;
- Astronomy Engine.

The contract is an astronomical model cross-check. It is not an observed-weather or local-horizon guarantee.

## Independent model

The reference implementation is a separately coded reduced Meeus lunar model:

- Meeus, *Astronomical Algorithms*, Chapter 47 lunar longitude/latitude series;
- the 13 largest longitude terms and 10 largest latitude terms are retained;
- Chapter 40 topocentric parallax;
- apparent near-horizon refraction;
- lunar upper-limb semidiameter;
- 5-minute crossing scan followed by bisection refinement.

The provider implementations are not called by the reference calculation itself.

## Frozen coverage

The vector matrix covers:

- Anaparthy, India — 2005;
- New Delhi, India — 2024;
- New York — 2024 DST start and DST end;
- Sydney — 2024 DST and a next-local-day lunar event.

The matrix therefore covers both hemispheres, negative longitude, DST transitions, and event assignment across local civil-day boundaries.

## Contract

1. The independent implementation must reproduce its frozen vectors within 2 seconds.
2. Swiss Ephemeris must remain within 120 seconds of the independent model.
3. Astronomy Engine must remain within 120 seconds of the independent model.
4. Local civil-date/time mapping must match the frozen expected values to the second.
5. The test must remain provider-independent: the independent reference must not call Swiss Ephemeris or Astronomy Engine.

## Interpretation

A passing result means AstroWorld's two production providers agree with a genuinely separate lunar model to the declared model envelope.

It does not establish observational accuracy to the second because atmospheric refraction, terrain, observer elevation, and event-definition conventions affect practical moonrise/moonset observations.

## Release policy

This contract is part of the production-certification branch. A final merge to `main` must not happen while this gate is failing or while the lunar event convention is undocumented.
