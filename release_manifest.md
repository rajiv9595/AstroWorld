# ASTROWORLD AI V2 — PRODUCTION RELEASE MANIFEST
**Release Tag**: `v2.0.0-rc1`  
**Status**: `READY_FOR_HUMAN_SIGN_OFF`  
**Operational Status**: `NEEDS_OPERATIONAL_REVIEW` (Latency SLO Breach)  
**Build Target**: `production`  
**Release Date**: `2026-10-04`  
**Release Identity Policy**: Release tag `v2.0.0-rc1` anchored to verified baseline commit `b7ef4f8955455c99ea982c4a7577808c5bab5711` on branch `main`  
**General Public Access**: `DISABLED` (0% Traffic / Staged Rollout Blocked)

---

## 1. Approved Runtime Model Specifications
- **Primary AI Model**: `gemini-3.8-flash` (Primary LLM configured in `environmentConfig.ts`)
- **Secondary Live Fallback Model**: `gemini-3.1-flash-lite` (Active rate-limit / latency failover LLM)
- **Deterministic Classical Failsafe**: `AstroWorld Classical Deterministic Narrator` (Zero-cold-start air-gapped synthesis engine)
- **Execution Mode**: `production`

---

## 2. Infrastructure & Environment Specifications
- **Environment**: `production`
- **Database Schema**: `astroworld_production`
- **Database Connection Pool**: `maxConnections: 100`, `ssl: true`
- **Storage Bucket**: `astroworld-production-artifacts`
- **HTTPS Enforcement**: `true` (HSTS: `31536000` seconds)
- **Cookie Security**: `cookieSecure: true`, `cookieSameSite: strict`
- **Rate Limiting**: `120 req/min`, burst capacity `20`
- **Migration Level**: `002_add_indexes_and_constraints`

---

## 3. Operational Performance Budgets & Real Evidence
- **Class A (Computational / Non-Provider Latency)**: $p50 \le 30\text{ms}$, $p95 \le 80\text{ms}$  
  - *Measured*: $p50 = 6\text{ms}$, $p95 = 10\text{ms}$ [Status: **MET** / `REAL_RUNTIME_EVIDENCE`]
- **Class B (Real Live Gemini End-to-End Latency)**: $p50 \le 3000\text{ms}$, $p95 \le 6000\text{ms}$  
  - *Measured*: $p50 = 1888\text{ms}$, $p95 = 6325\text{ms}$ [Status: **BREACHED** (+325ms above SLO) / `REAL_RUNTIME_EVIDENCE`]
- **Disaster Recovery RTO**: $\le 300\text{s}$ (Measured: $0.26\text{s}$)
- **Disaster Recovery RPO**: $\le 15\text{ min}$ (Configured: $5\text{ min}$)
- **Cross-User Data Isolation**: $100\%$ (Zero IDOR leakage)

---

## 4. Operational Sign-Off & Rollout Readiness
- **Engineering Architecture Integrity**: Feature-frozen & verified across 23 monorepo suites (100% Passed)
- **Security Posture**: 0 P0/P1 defects, 0 exposed secrets, 0 IDOR vulnerabilities
- **Operational SLO Gate**: `NEEDS_OPERATIONAL_REVIEW` (Due to Class B $p95 = 6325\text{ms} > 6000\text{ms}$)
- **Stage 1 Rollout Eligibility**: `BLOCKED` ($p95 < 4000\text{ms}$ threshold not met)
- **Public Traffic Policy**: Strictly `CLOSED / 0%` until human operational sign-off on latency waiver or quota tier upgrade.
