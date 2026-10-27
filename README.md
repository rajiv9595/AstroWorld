# 🪐 AstroWorld — Neuro-Symbolic Vedic Intelligence Engine
### High-Precision Ephemeric Computation • Multi-Perspective Jyotish Council • Dynamic Shastric RAG • Grounded Predictive Telemetry

[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.0+-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Frontend-React_19_SPA-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Ephemeris](https://img.shields.io/badge/Astronomical_Engine-Swiss_Ephemeris_%2F_Lahiri-orange.svg?style=flat-square)](https://www.astro.com/swisseph/)
[![Architecture](https://img.shields.io/badge/System-Neuro--Symbolic_Council-purple.svg?style=flat-square)](#system-architecture)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)](#)

---

## 🏛️ Executive Summary & Scientific Paradigm

**AstroWorld** is an enterprise-grade, publication-caliber **Neuro-Symbolic Vedic Astrology Platform**. It resolves the foundational flaw of contemporary AI astrology applications: **Large Language Models cannot perform spherical trigonometry or planetary orbital mathematics within neural weights**. 

When general-purpose LLMs attempt to calculate planetary longitudes, divisional chart divisions (*vargas*), or Vimshottari Dasha balances, they hallucinate degrees, misplace ascendants, and fabricate nonexistent transits.

AstroWorld solves this through a rigorous **Neuro-Symbolic Architecture**:
1. **The Symbolic Mathematical Kernel**: Pure, deterministic astronomical computation based on the Swiss Ephemeris and Chitrapaksha (Lahiri) Ayanamsha. Computes ascendant cusps, Sripathi Bhava Chalit boundaries, complete Shodashavarga harmonics (D1–D60), Shadbala potencies, and Sarvashtakavarga (SAV) bindus down to arc-second precision.
2. **The Neural Daivajna Reasoning Council**: An agentic multi-perspective council that analyzes chart mechanics across 7 orthogonal classical and empirical dimensions before generating humanistic, empathetic, and structurally honest predictive guidance.
3. **The Epistemic Grounding Firewall**: A zero-hallucination verification layer that enforces mathematical consistency between the generated prose and the deterministic ephemeris calculations.

---

## 📐 System Architecture

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │            Client Layer (React 19 SPA)                 │
                                  │  - Interactive Kundli Canvas (North / South / East)    │
                                  │  - Jyotish Council Multi-Agent Deliberation Widget     │
                                  │  - Real-Time Dynamic Timeline & Visualizer Modules     │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ JSON-RPC / HTTPS
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │        API Gateway & Temporal Router (Express)         │
                                  │  - Continuous Multi-Phase Temporal Scope Normalizer   │
                                  │  - Domain Playbook Intent Classifier & Context Buffer  │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                      ┌───────────────────────┴───────────────────────┐
                                      ▼                                               ▼
     ┌─────────────────────────────────────────────────────────┐  ┌─────────────────────────────────────────────────────────┐
     │         SYMBOLIC ASTRONOMICAL KERNEL (Deterministic)     │  │          DYNAMIC SHASTRIC RAG KNOWLEDGE CORPUS         │
     │  - Swiss Ephemeris / Lahiri Ayanamsha (0.001° accuracy) │  │  - Classical Canonical Shastras (BPHS, Phaladeepika) │
     │  - Sripathi Bhava Chalit Sandhi Longitudinal Math       │  │  - Modern Psychometric & Cognitive Communication     │
     │  - Complete Shodashavarga Harmonics (D1 through D60)    │  │  - Emerging Technology & Specialization Taxonomy     │
     │  - Vimshottari Progression (Maha/Antar/Pratyantar)      │  │  - Curated Longitudinal Real-World Case Studies      │
     │  - 6-Fold Shadbala & Sarvashtakavarga (SAV) Matrix      │  │  - Jaimini Upadesha Sutras & Karakamsha Registers    │
     │  - Real-time Gochara & Kakshya Transit Engine           │  └───────────────────────────┬─────────────────────────┘
     └────────────────────────────┬────────────────────────────┘                              │
                                  │                                                           │
                                  └───────────────────────────┬───────────────────────────────┘
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │      MULTI-PERSPECTIVE JYOTISH COUNCIL SYNTHESIS       │
                                  │  1. Parashari Foundational & Chalit Sandhi Dynamics    │
                                  │  2. Jaimini Karakas (AK, AmK) & Pada Analysis          │
                                  │  3. Shodashavarga Harmonics (D9, D10, D24, D60)        │
                                  │  4. Vimshottari Progression & Planetary Maturity       │
                                  │  5. AIFAS Double Transit & Ashtakavarga Kakshya Triggers│
                                  │  6. Empirical Precedent Verification (Case Studies)   │
                                  │  7. Sarvatobhadra Nakshatra Vedha & Upaya Shastra      │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │           EPISTEMIC GROUNDING FIREWALL                 │
                                  │  - Mathematical Fact Verification against Ephemeris    │
                                  │  - Anti-Hallucination Guardrails & Epistemic Bounds     │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ Verified Astrological Dossier
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │           NEURAL DAIVAJNA NARRATOR (Gemini 2.0)        │
                                  │  - Publication-Grade Classical Consultation Prose     │
                                  │  - Chronological Milestone Roadmap (Quarter-by-Quarter)│
                                  │  - Empathetic Mentorship & Purushartha Orientation     │
                                  └────────────────────────────────────────────────────────┘
```

---

## 🔬 The Seven Pillars of the Jyotish Council

The core innovation of AstroWorld's AI agent is the **Multi-Perspective Jyotish Council** (`backend/src/ai/agent/consultAgent.ts`). Rather than relying on a single, monolithic prompt, every consultation query is independently evaluated across seven classical analytical perspectives:

### 1. Parashari Classical Foundation & Chalit Sandhi Mechanics
* **Rashi vs. Bhava Chalit Differentiation**: Calculates the precise midpoint (*Bhava Madhya*), initial junction (*Aarambh Sandhi*), and concluding junction (*Viram Sandhi*) for all 12 houses according to the classical Sripathi method. Accurately determines when a planet resides in one zodiac sign but operates physically in an adjacent house.
* **Functional Nature & Dignities**: Classifies planets dynamically by Lagna into Functional Benefics, Functional Malefics, Yogakarakas, Badhakas, and Marakas based on *Brihat Parashara Hora Shastra*.
* **6-Fold Shadbala**: Evaluates *Sthana Bala* (positional), *Dig Bala* (directional), *Kala Bala* (temporal), *Chesta Bala* (motional), *Naisargika Bala* (natural), and *Drik Bala* (aspectual) to quantify objective planetary strength.

### 2. Maharishi Jaimini Upadesha Architecture
* **Chara Karaka Hierarchy**: Calculates the 8 classical dynamic indicators based on longitude degrees: Atmakaraka (AK - Soul), Amatyakaraka (AmK - Career & Intellect), Bhratrikaraka (BK), Matrikaraka (MK), Pitrikaraka (PK), Putrakaraka (PK), Gnatikaraka (GK), and Darakaraka (DK - Partnerships).
* **Karakamsha & Arudha Padas**: Maps the Navamsha sign of the Atmakaraka (Karakamsha Lagna) and projects its manifestations onto the D1 chart (Swamsha). Computes all 12 Arudha Padas including *Arudha Lagna (AL)*, *Rajya Pada (A10)*, and *Dara Pada (A7)*.

### 3. Complete Shodashavarga Harmonic Mechanics
* **D9 Navamsha (Dharma & Marital Longevity)**: Evaluates the internal strength (*Paka Bala*) of planets and their evolutionary trajectory in the soul's second half of life.
* **D10 Dashamsha (Career Leadership & Authority)**: Scans vocational leadership, institutional impact, and executive elevation.
* **D24 Siddhamsa (Higher Academic Research & Vidya)**: Disentangles raw vocational entry from higher specialization degrees, research capabilities, and technical mastery.
* **D60 Shashtiamsha (Esoteric Karmic Architecture)**: Examines the 1/60th micro-harmonic and its classical presiding devatas (*Deva/Amrita* vs. *Ghora/Rakshasa*) to resolve deep karmic roots.

### 4. Multi-Layered Vimshottari Progression & Planetary Maturity
* **Continuous Dasha Trajectory**: Calculates exact dates for Mahadasha, Antardasha, Pratyantardasha, and Sookshma Dasha balance using precise Moon longitude at birth.
* **Dasha-Sandhi Transition Protocols**: Identifies the volatile junction periods when a major 6-to-20 year planetary era closes and another opens.
* **Chronological Planetary Maturity**: Tracks the classical awakening ages of grahas (Jupiter at 16, Sun at 21, Moon at 24, Venus at 25, Mars at 28, Mercury at 32, Saturn at 36, Rahu at 42, Ketu at 48) to contextualize life breakthroughs.

### 5. AIFAS Double Transit & Ashtakavarga Kakshya Triggers
* **Double Transit Confluence (DTC)**: Implements the empirical law established by the All India Federation of Astrologers' Societies (AIFAS): No major life event manifests unless both transiting **Saturn** and **Jupiter** simultaneously aspect or occupy the house or house lord in question.
* **Ashtakavarga Kakshya Micro-Timing**: Divides each 30° zodiac sign into eight 3°45' segments (*Kakshyas*) governed by Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, and Lagna. Pinpoints whether an active transit window is *Phalaprada* (Fruitful - possessing a bindu) or *Rodha* (Obstructed - zero bindu).

### 6. Longitudinal Real-World Case Studies & Precedents
* **Empirical Analogy Engine**: Curates hundreds of anonymized historical cases sharing the native's Lagna, running Dasha, and transit alignments.
* **Cross-Disciplinary Technology Mappings**: Links classical graha significations with modern emerging fields (Distributed Systems, Autonomous AI, Computational Biology, Quantitative Finance).

### 7. Sarvatobhadra Chakra & Classical Remedial Shastra (Upayas)
* **Sarvatobhadra 81-Square Nakshatra Vedhas**: Calculates spatial cross-aspects (*Vedhas*) from transiting planets onto the native's sensitive astronomical stars: *Janma Nakshatra* (Identity), *Karma Nakshatra* (10th star - Career), *Samudayika* (18th star - Collective fortune), and *Vainashika* (23rd star - Destruction/Stress).
* **Classical Upaya Shastra**: Prescribes approved functional benefic gemstones strictly prohibiting stones of Functional Malefics; specifies authentic Vedic Beeja Mantras with exact classical recitation counts and charitable donations (*Daana*).

---

## 📂 Repository Workspace Structure

The project is structured as a high-performance modular monorepo:

```plaintext
astroworld/
├── frontend/                   # 🚀 React 19 Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # Jyotish Council Reasoning & Visualization Widgets
│   │   │   └── kundli/         # North Indian, South Indian & East Indian SVG Charts
│   │   ├── views/              # AIAstrologerView, Dashboard, Panchanga, Charts
│   │   ├── services/           # aiV2ApiClient, chartService, geoService
│   │   └── lib/                # Supabase Authentication & Realtime Client
│   └── vite.config.ts          # Vite build pipeline with backend proxy
│
├── backend/                    # ⚙️ High-Throughput Node.js / Express API Server
│   ├── src/
│   │   ├── ai/                 # 🧠 Unified Vedic Intelligence Core
│   │   │   ├── agent/          # Multi-Perspective Council (consultAgent.ts)
│   │   │   ├── reasoning/      # Deha Lakshana, Sarvatobhadra, Kakshya, Chalit Engines
│   │   │   ├── rag/            # Dynamic RAG, Case Studies, Shastric Knowledge Bases
│   │   │   ├── tools/          # Autonomous Computational Tool Registry
│   │   │   └── schemas/        # Structured Claim, Evidence & Visualization Schemas
│   │   ├── routes/             # REST endpoints (/api/ai/consult, /api/charts, /api/auth)
│   │   ├── services/           # Ephemeris Provider Runtimes & Multi-Provider LLM Clients
│   │   └── server.ts           # Express HTTP Engine
│   └── package.json
│
├── shared/                     # 🌌 Deterministic Astrological Mathematics
│   ├── engine/
│   │   ├── astronomy.ts        # Swiss Ephemeris / Spherical Trigonometry
│   │   ├── chalit.ts           # Sripathi Bhava Chalit Cusp & Sandhi Algorithms
│   │   ├── shodashavarga.ts    # D1 through D60 Division Equations
│   │   ├── dasha.ts            # High-Precision Vimshottari Dasha Engine
│   │   ├── shadbala.ts         # 6-Fold Shadbala Quantitative Algorithms
│   │   └── timingScan.ts       # Precision Predictive Timing Window Scanners
│   └── index.ts
│
└── docs/                       # 📚 Scholarly Research & Architectural Specifications
    └── PROPRIETARY_ASTROLOGY_MODEL_PLAYBOOK.md
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **API Keys**: Gemini API Key (`GEMINI_API_KEY`) and Supabase credentials.

### 1. Installation
Clone the repository and install dependencies in all workspaces:
```bash
git clone https://github.com/rajiv9595/AstroWorld.git
cd astroworld
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in `backend/` and `frontend/` based on `.env.example`:
```env
# backend/.env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# frontend/.env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Launch Development Server
Launch the unified full-stack application:
```bash
npm run dev
```
* **Web Client**: `http://localhost:5173` (or port 3000 in unified mode)
* **Backend API**: `http://localhost:3000/api`

---

## 🧪 Scientific Validation & Testing

AstroWorld enforces rigorous static typing and validation suites across astronomical calculations and AI grounding:

```bash
# Verify backend type safety and engine contracts
cd backend
npx tsc --noEmit

# Verify frontend type safety and component contracts
cd ../frontend
npx tsc --noEmit

# Run astronomical audit diagnostics
cd ../backend
npx tsx scripts/astronomical-audit-diagnostic.ts
```

---

## 📖 Primary Classical & Academic References

The algorithmic foundations of AstroWorld are directly anchored in foundational Vedic literature:
1. **Sage Parashara**: *Brihat Parashara Hora Shastra* (BPHS) — Foundations of planetary nature, Shadbala, and Shodashavarga.
2. **Maharishi Jaimini**: *Jaimini Upadesha Sutras* — Chara Karakas, Karakamsha, and Arudha Pada dynamics.
3. **Mantreswara**: *Phaladeepika* — Dasha-Antardasha mutual dispositions and Gochara transit rules.
4. **Kalyana Varma**: *Saravali* — Raja Yogas, Nabhasa Yogas, and planetary combinations.
5. **Vaidyanatha Dikshita**: *Jataka Parijata* — Rashi and Bhava evaluations.
6. **All India Federation of Astrologers' Societies (AIFAS)**: *Timing of Events Through Transits* — Double Transit Confluence methodology.

---

## 🛡️ Data Privacy & Epistemic Ethics

* **Zero Fatalism**: Planetary transits reflect *Karmic Weather*; the human spirit exercises conscious *Purushartha* (free will and ethical agency).
* **Multi-Tenant Security**: Birth charts and consultation telemetry are isolated with Row-Level Security (RLS) on Supabase.
* **Dataset Isolation**: Raw research manuscripts and source PDF datasets are stored locally in isolated research repositories and excluded from public version control.

---

**AstroWorld** — *Bridging Ancient Astronomical Wisdom with State-of-the-Art Neuro-Symbolic Intelligence.*
