# AstroWorld Phase 5D — Horizon Event Precision

## Scope

Phase 5D hardens and validates horizon-event handling for:

- Sunrise
- Sunset
- Moonrise
- Moonset
- Swiss Ephemeris horizon primitives
- Astronomy Engine comparison
- local civil-day and DST behavior

## Existing production convention

The Phase 5C provider boundary exposes a generic `getHorizonEvent()` primitive.

The Swiss adapter calls `calculateRiseTransitSet()` at sea level with the default Swiss rise/set mode and explicitly fixes atmospheric inputs at **1013.25 hPa pressure and 15 C temperature**. The Phase 5D contract therefore treats the calculation as an **apparent upper-limb event with standard atmospheric refraction**, not a disc-center/no-refraction Hindu sunrise convention.

Astronomy Engine is compared through `SearchRiseSet()` using its observer model and documented visible-top/refraction behavior.

This distinction is intentional: changing to a different altitude/refraction convention would change event times and would be a semantic change, not a precision fix.

## Reference/oracle layers

### Primary frozen numerical reference

The benchmark vectors were generated independently of the TypeScript adapter using the Python `pyswisseph` binding against Swiss Ephemeris 2.10.03.

Reference inputs:

- pressure: 1013.25 hPa
- temperature: 15 C
- observer altitude: 0 m

The Node adapter now passes these atmospheric inputs explicitly so the production calculation does not depend on the binding's zero/default atmospheric parameters.
- geographic horizon
- default Swiss rise/set convention

This is an **independent execution path but the same Swiss Ephemeris core**, so it is not claimed as an independent ephemeris-model oracle.

### External sanity cross-check

Public Panchanga sources were used only as coarse external checks. For example, New Delhi on 2024-03-10 is reported around 06:36 sunrise, 18:26 sunset, 06:37 moonrise, and 18:32 moonset, consistent with the frozen reference to the displayed minute.

These public values are not used as sub-second oracle vectors because their conventions and rounding are not fully controlled.

## Precision contract

1. Swiss Node adapter vs frozen Swiss 2.10.03 vectors: **≤ 2 seconds**.
2. Astronomy Engine vs Swiss event result under the same apparent/refraction convention: **≤ 60 seconds**.
3. Local civil-day mapping must preserve the requested timezone date across DST transitions.
4. No arcsecond-level observational accuracy is claimed.
5. The contract does not loosen existing astronomy/planetary tolerances.

## Benchmark coverage

- Anaparthy / Andhra Pradesh — 2005-08-17
- New Delhi — 2024-03-10
- New York — DST start 2024-03-10
- New York — DST end 2024-11-03
- Sydney — 2024-12-21

Coverage includes all four event types and both positive/negative longitudes, northern/southern hemisphere, India/America/Australia timezones, and DST transitions.

## Production correction

Phase 5D found one real semantic issue in the existing Panchanga consumer:

A provider horizon primitive returns the next event after its start instant. For Moonrise/Moonset, that next event can fall on the following local civil day. The consumer previously formatted that event without checking the requested local date.

Phase 5D now filters Sun/Moon rise/set candidates so that a daily Panchanga only labels events belonging to the requested local calendar date. The next Sun rise used for night-duration calculation remains separately requested from the next local day.

## Files changed

- `backend/scripts/verify-horizon-precision.ts`
- `backend/package.json`
- `shared/engine/panchanga.ts`
- `backend/src/services/ephemeris/swissEphemerisAdapter.ts`
- `backend/phase5d_horizon_precision_report.md`

The Swiss horizon algorithm is unchanged; only its atmospheric inputs are now explicit and aligned with the frozen reference convention.

## Validation status

The Phase 5D branch was created from Phase 5C commit `16cf18893756051c1628cb2951519d3fd706151a`.

The repository-side diff contains only the three files above.

The execution environment used for this implementation cannot access the user's Windows checkout or clone GitHub over the network, so the TypeScript/npm suite has **not** been falsely reported as executed here. The required local commands are:

```powershell
cd C:\Users\RAJIV MEDAPATI\Documents\astroworld\backend
git fetch origin astroworld/precision-hardening-phase5d-horizon-reference
git checkout astroworld/precision-hardening-phase5d-horizon-reference
npm run build
npm run test:horizon-precision
npm run test:precision:all
```

## Remaining precision boundary

The remaining unresolved boundary is a truly independent horizon-event oracle at controlled atmospheric/refraction convention, ideally an authoritative reference whose event definition and atmospheric assumptions are explicitly fixed. Until that is added, AstroWorld should not claim arcsecond-level horizon-event accuracy.
