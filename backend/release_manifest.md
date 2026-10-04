# ASTROWORLD AI V2 — PRODUCTION RELEASE MANIFEST
**Release Tag**: `v2.0.0-rc1`  
**Status**: `VALIDATED_RELEASE_CANDIDATE`  
**Build Target**: `production`  
**Release Date**: `2026-10-04`  
**Approved Commit**: `origin/main` (`01540c3`)  
**General Public Access**: `DISABLED` (Controlled Testing Only)

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

## 3. Operational Performance Budgets
- **Class A (Computational / Non-Provider Latency)**: $p50 \le 30\text{ms}$, $p95 \le 80\text{ms}$ (Measured: $p50 = 5\text{ms}$, $p95 = 7\text{ms}$)
- **Class B (Real Live Gemini End-to-End Latency)**: $p50 \le 3000\text{ms}$, $p95 \le 6000\text{ms}$ (Measured: $p50 = 2333\text{ms}$, $p95 = 3566\text{ms}$)
- **Disaster Recovery RTO**: $\le 300\text{s}$ (Measured: $0.26\text{s}$)
- **Disaster Recovery RPO**: $\le 15\text{ min}$ (Configured: $5\text{ min}$)
- **Cross-User Data Isolation**: $100\%$ (Zero IDOR leakage)

---

## 4. Operational Sign-Off
- **Architecture Integrity**: Feature-frozen & verified across 22 monorepo suites
- **Security Posture**: 0 P0/P1 defects, 0 exposed secrets, 0 IDOR vulnerabilities
- **Operational Gate**: `READY_FOR_PHASE_10`
