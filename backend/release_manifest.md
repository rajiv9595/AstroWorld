# ASTROWORLD AI V2 — PRODUCTION RELEASE MANIFEST
**Release Candidate Identifier**: `v2.0.0-rc1`  
**Git Tag Status**: `NONE` (Candidate identifier; no tag created in repository)  
**Evidence Source Commit**: `2e2563eedb421cd815001840c3c0f96c912a7b56`  
**Verified Engineering Baseline**: `b7ef4f8955455c99ea982c4a7577808c5bab5711`  
**Operational Percentile Policy**: `sorted[Math.floor(n * p)]` (Repository historical estimator)  
**Status**: `NEEDS_OPERATIONAL_REVIEW`  
**Engineering Gate**: `PASSED` (100% Suites Green)  
**Operational SLO Gate**: `NEEDS_OPERATIONAL_REVIEW` (Overall End-to-End Latency SLO Tail Breach)  
**Build Target**: `production`  
**Release Date**: `2026-10-04`  
**General Public Access**: `DISABLED` (0% Traffic / Stage 1 Rollout Blocked)

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

## 3. Operational Performance & Evidence Statistics

### A. Class A (Computational / Non-Provider Latency)
- **Target Budget**: $p50 \le 30\text{ms}$, $p95 \le 80\text{ms}$
- **Measured (Operational Estimator)**: $p50 = 6\text{ms}$, $p95 = 10\text{ms}$, $\max = 25\text{ms}$
- **Classification**: `REAL_RUNTIME_EVIDENCE`
- **Status**: **MET**

### B. Class B (Overall AI End-to-End Request Latency — All 30 Production Queries)
- **Target Budget**: $p50 \le 3000\text{ms}$, $p95 \le 6000\text{ms}$
- **Measured (Operational Estimator `sorted[Math.floor(n * p)]`)**: $p50 = 1888\text{ms}$, $p75 = 2528\text{ms}$, $p90 = 3815\text{ms}$, $p95 = 6325\text{ms}$, $\max = 6327\text{ms}$
- **Secondary Statistical View (Linear Interpolation)**: $p50 = 1328\text{ms}$, $p75 = 2504\text{ms}$, $p90 = 3174\text{ms}$, $p95 = 5195\text{ms}$, $\max = 6327\text{ms}$
- **Classification**: `REAL_RUNTIME_EVIDENCE`
- **Status**: **BREACHED** on fallback timeout tail path ($6325\text{ms} > 6000\text{ms}$)
- **Telemetry Note**: Observed latency includes fallback/model-attempt paths; the available Phase 9.1 dataset does not isolate provider-side latency sufficiently to attribute the full tail to quota.

### C. Successful Live Model Provider Latency ($n = 13$)
- **Measured (Operational Estimator)**: $p50 = 2404\text{ms}$, $p75 = 2706\text{ms}$, $p90 = 3068\text{ms}$, $p95 = 3371\text{ms}$, $\max = 3807\text{ms}$
- **Classification**: `REAL_RUNTIME_EVIDENCE` (Isolates successful provider-only response time)

### D. End-to-End Latency of Requests in Fallback/Failsafe ($n = 17$)
- **Measured (Operational Estimator)**: $p50 = 672\text{ms}$, $p75 = 750\text{ms}$, $p90 = 2991\text{ms}$, $p95 = 6325\text{ms}$, $\max = 6327\text{ms}$
- **Classification**: `REAL_RUNTIME_EVIDENCE` (Includes direct deterministic calls and timeout fallback attempts)
- **Note**: The Phase 9.1 dataset does not provide a dedicated stopwatch measurement for deterministic narrator synthesis itself.

### E. Disaster Recovery & Security
- **Disaster Recovery RTO**: $\le 300\text{s}$ (Measured: $0.26\text{s}$)
- **Disaster Recovery RPO**: $\le 15\text{ min}$ (Configured: $5\text{ min}$)
- **Cross-User Data Isolation**: $100\%$ (Zero IDOR leakage)

---

## 4. Operational Sign-Off & Rollout Readiness
- **Engineering Architecture Integrity**: Feature-frozen & verified across 23 monorepo suites (100% Passed)
- **Security Posture**: 0 P0/P1 defects, 0 exposed secrets, 0 IDOR vulnerabilities
- **Operational SLO Gate**: `NEEDS_OPERATIONAL_REVIEW` (Overall End-to-End $p95 = 6325\text{ms} > 6000\text{ms}$)
- **Stage 1 Rollout Eligibility**: `BLOCKED` ($p95 = 6325\text{ms}$ is $+2325\text{ms}$ above $4000\text{ms}$ Stage 1 threshold)
- **Public Traffic Policy**: Strictly `CLOSED / 0%` until human operational sign-off on latency waiver or quota tier upgrade.
