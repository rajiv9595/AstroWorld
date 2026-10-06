# AstroWorld — Production Certification Baseline

## Release branch

`astroworld/production-certification-v2`

This branch is the final convergence of the repository's precision hardening, ephemeris provider runtime, temporal-event, independent horizon, evidence lineage, security, and durable persistence work.

## Final architecture

```
Frontend
  ↓
Authenticated API
  ↓
AI V2 / Astrology Routes
  ↓
Configured Ephemeris Provider
  ├─ Astronomy Engine (default)
  └─ Swiss Ephemeris (explicit opt-in)
  ↓
Canonical Astrology Engine
  ├─ D1 / Vargas
  ├─ Vimshottari
  ├─ Transits / Sade Sati
  ├─ Panchanga / horizon events
  ├─ Yogas / Doshas
  ├─ Ashtakavarga
  ├─ Jaimini
  └─ Shadbala (explicitly classical_partial)
  ↓
Verified EvidencePacket
  ↓
Classical RAG + exact prerequisite matcher
  ↓
AstrologyReasoner + weighted confluence
  ↓
Grounding firewall + narration
  ↓
Durable conversation + user memory persistence
```

## Certification gates

The authoritative `.github/workflows/production-certification.yml` runs:

1. `npm ci`
2. production dependency audit (`npm audit --omit=dev --audit-level=high`)
3. frontend build
4. backend build
5. durable conversation persistence TDD
6. independent lunar horizon reference
7. evidence/source hardening
8. full inherited Phase 1–9 precision/security suite
9. AI V2 precision suite
10. Phase 10 calculation-truth suite
11. Phase 10 classical-source integrity
12. Phase 10 audit-repair regression

## Precision policy

AstroWorld does not claim that all astronomical quantities have the same numerical uncertainty.

- planetary and Ascendant validation uses explicit model-aware tolerances;
- Swiss Ephemeris is an optional high-precision runtime provider;
- sunrise/sunset uses explicit event/refraction conventions;
- Moonrise/Moonset has an independent reduced-Meeus cross-check;
- polar no-event states are represented explicitly;
- Shadbala remains marked `classical_partial` rather than overstating completeness.

## Production persistence policy

When Supabase backend credentials are configured:

- conversation state and turn history are durably stored;
- state updates use optimistic version checking;
- conversation ownership is user-scoped;
- persistent memories are stored in PostgreSQL/Supabase;
- the in-memory adapters remain available for offline tests and local development without persistence credentials.

## Release policy

`main` should only accept the final production-certification branch after the single authoritative certification workflow is green.

No phase branch should be merged independently into `main`.
