# AstroWorld AI V2 Architecture & Contract

## System Overview

AstroWorld AI V2 is the next-generation, high-fidelity conversational interpretation and reasoning layer for AstroWorld. It connects users with deep, authenticated Vedic astrological insights without hallucinating mathematical facts or planetary placements.

---

## Architectural Flow & Lifecycle Contract

```
USER
  ↓
AI V2 ORCHESTRATOR
  ↓
QUESTION UNDERSTANDING / INTENT ROUTER
  ↓
ASTROLOGY TOOL REGISTRY (Controlled Boundary)
  ↓
ASTROWORLD DETERMINISTIC ASTROLOGY ENGINE (shared/engine/)
  ↓
VERIFIED ASTROLOGY EVIDENCE (Structured Facts + Provenance)
  ↓
CLASSICAL RULE / KNOWLEDGE RETRIEVAL (Future Phase 2B/3)
  ↓
GEMINI INTERPRETATION / REASONING (Future Phase 3/4)
  ↓
CLAIM VALIDATION FIREWALL
  ↓
USER
```

---

## Foundational Principles

1. **Deterministic Authority**: Gemini must never calculate astronomical or planetary mathematics.
2. **Zero Chart Hallucination**: All planetary positions, house lords, aspects, and nakshatras are computed exclusively by `shared/engine/` and supplied via Tool Registry.
3. **No Invented Dashas**: Vimshottari dasha hierarchy (Mahadasha, Antardasha, Pratyantardasha) is strictly deterministic.
4. **No Invented Yogas**: 30+ classical Raja, Dhana, and Mahapurusha yogas are computed using classical rule definitions (*BPHS*, *Phaladeepika*).
5. **No Invented Transits**: Gochara planetary positions, house offsets from natal Moon/Ascendant, and aspectual hits are computed mathematically for any specified target date.
6. **Immutable Source of Truth**: The deterministic astrology engine (`shared/engine/`) is the sole ground truth.
7. **Structured Tool Boundary**: Every tool returns verified JSON payloads with provenance metadata (`sourceEngine`, `ruleStandard`, `verified: true`, `calculatedAtIso`) and zero subjective prose.

---

## AI V2 Tool Registry (`backend/src/ai_v2/tools/`)

The `AstrologyToolRegistry` exposes 10 deterministic tools to the upcoming AI orchestrator:

| Tool Name | Purpose | Input Schema | Output Schema | Classical Standard / Authority |
| :--- | :--- | :--- | :--- | :--- |
| `get_birth_chart` | Compute D1 Rasi chart, houses, planets, lords, aspects | `BirthProfile` | Structured D1 Chart, Planets, House Lords, Aspects, Nakshatra | *BPHS Ch. 3, 6, 27* |
| `get_divisional_chart` | Compute specific varga chart (D9, D10, D2, D3, D7, D12, etc.) | `BirthProfile`, `vargaCode` | Divisional chart planetary signs, degrees, dignities | *BPHS Ch. 6 (Shodashavarga)* |
| `get_current_dasha` | Compute active Vimshottari Mahadasha, Antardasha, Pratyantardasha | `BirthProfile`, `targetDate?` | Active Dasha periods, date ranges, planetary lords | *BPHS Ch. 46 (Vimshottari)* |
| `get_dasha_at` | Compute Vimshottari Dasha periods active on a specific historical/future date | `BirthProfile`, `date` | Mahadasha, Antardasha, Pratyantardasha active at date | *BPHS Ch. 46* |
| `get_transits` | Compute Gochara planetary positions & house offsets from Natal Ascendant & Moon | `BirthProfile`, `transitDate?` | Transit planetary positions, house offsets, active aspects | *Phaladeepika Ch. 26* |
| `get_active_yogas` | Detect classical Raja, Dhana, and Mahapurusha Yogas present in chart | `BirthProfile` | Detected yogas, rule names, classical citations, participating planets | *BPHS Ch. 34–45, 66–72* |
| `get_planetary_strength` | Compute Shadbala (6-fold strength) and Ishta/Kashta Phala | `BirthProfile` | Shadbala rupas/percentages, rank, positional/directional/temporal scores | *BPHS Ch. 27–29* |
| `get_ashtakavarga` | Compute Sarvashtakavarga and Bhinna Ashtakavarga bindus (0–8 points per sign) | `BirthProfile` | SAV points per sign, BAV points per planet | *BPHS Ch. 66–72* |
| `get_jaimini_details` | Compute Jaimini 7-Karaka system and Arudha Padas (AL, UL, A10) | `BirthProfile` | Chara Karakas (AK, AmK, BK, MK, PK, GK, DK), Arudha Padas | *Jaimini Upadesha Sutras 1.1* |
| `get_panchanga` | Compute Tithi, Vara, Nakshatra, Yoga, and Karana at birth moment | `BirthProfile` | Complete 5-fold Vedic calendar attributes | Classical Siddhantic Panchanga |

---

## Provenance Standard

Every tool response includes an immutable `provenance` block:

```json
{
  "provenance": {
    "sourceEngine": "AstroWorld Deterministic Engine v2.0 (shared/engine)",
    "ruleStandard": "Brihat Parashara Hora Shastra / Classical Jyotish Siddhanta",
    "calculatedAtIso": "2026-10-03T14:45:00.000Z",
    "verified": true,
    "inputHash": "a1b2c3d4e5f6..."
  }
}
```

---

## Phase Status

- **Phase 1**: Old AI Elimination & Clean AI V2 Foundation (**COMPLETE**)
- **Phase 2A**: Astrology Engine Tool Discovery, Schema Definition & Tool Registry (**COMPLETE**)
- **Phase 2B**: AI V2 Tool Calling & Question Planner Orchestration (**Next**)
- **Phase 3**: Classical RAG & Knowledge Retrieval
- **Phase 4**: Context Caching & Stateful Multi-Turn Session Memory
- **Phase 5**: Persona Calibration & Ethical Safety Firewalls
- **Phase 6**: Real-Time Streaming UX & Verification Claim Firewall
