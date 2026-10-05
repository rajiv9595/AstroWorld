# Phase 5B — Runtime Ephemeris Provider Injection

Phase 5B establishes the backend runtime boundary for choosing the astronomical
provider used by the canonical **natal** chart calculation.

## Runtime selection

Set:

`ASTROWORLD_EPHEMERIS_PROVIDER=astronomy-engine`

or, when the optional native dependency and its deployment license are approved:

`ASTROWORLD_EPHEMERIS_PROVIDER=swiss-ephemeris`

The default is `astronomy-engine`.

Unknown provider names fail closed with a configuration error. Provider
selection is server configuration, not a client-controlled chart parameter.

## Canonical injection

`computeCanonicalChartWithConfiguredEphemeris()`:

1. Converts the validated birth profile to UTC.
2. Resolves the configured provider.
3. Requests one sidereal Lahiri snapshot for the birth instant/location.
4. Injects that snapshot into `computeCanonicalChart()`.
5. Lets the existing canonical rule engines consume the resulting D1 facts.
6. Records the selected provider in `AIInterpretationContext.ephemeris` and
   the evidence pool as `EVID_EPHEMERIS_PROVIDER`.

When Astronomy Engine is selected, the injected snapshot is produced by the
same validated astronomical functions used by the legacy canonical path, so
the runtime contract requires unchanged natal longitudes.

## Scope boundary

Phase 5B intentionally injects the provider only at the **natal astronomical
snapshot** boundary.

Panchanga sunrise/search and transit/event-time calculations still use their
existing Astronomy Engine internals. They are not silently switched to Swiss
because doing so requires explicit time-series/event provider contracts,
independent reference vectors, and additional boundary tests. That work is a
separate phase.

## Swiss deployment guardrail

The Swiss adapter remains optional and dynamically loaded. The repository does
not make Swiss the default and does not add a mandatory native dependency to
the browser/shared build.

Production activation of `@swisseph/node` requires an explicit AGPL-3.0
licensing/deployment decision.

## Validation

Run:

`npm run build`

`npm run test:ephemeris-runtime`

`npm run test:precision:all`

The runtime contract verifies default selection, fail-closed configuration,
lazy Swiss selection, unchanged Astronomy Engine natal facts, and explicit
provider provenance.
