# ASTROWORLD AI V2 — PHASE 10.3.5 FINAL PERCENTILE POLICY, EVIDENCE SOURCE IDENTITY, AND METRIC SEMANTICS LOCK REPORT

**Generated:** 2026-10-04T14:25:00Z  
**Release Candidate Identifier:** `v2.0.0-rc1`  
**Git Tag Status:** `NONE` (Candidate identifier; no tag created in repository)  
**Evidence Source Commit:** `2e2563eedb421cd815001840c3c0f96c912a7b56`  
**Verified Engineering Baseline:** `b7ef4f8955455c99ea982c4a7577808c5bab5711`  
**Operational Percentile Policy:** `sorted[Math.floor(n * p)]` (Repository historical estimator)  
**Engineering Test Gate:** **`PASSED`** (100% Suites & Gates Green)  
**Operational SLO Gate:** **`NEEDS_OPERATIONAL_REVIEW`** (Overall End-to-End Latency SLO Tail Breach)  
**Stage 1 Rollout Eligibility:** **`BLOCKED / NOT_SATISFIED`** ($p95 = 6325\text{ms} > 4000\text{ms}$)  
**Public Traffic State:** **`CLOSED / 0%`**  
**Final Release Decision:** **`NEEDS_OPERATIONAL_REVIEW`**  

---

## 1. Operational Percentile Estimator Definition

The repository locks the historical Phase 9.1 operational percentile formula:
$$\text{OPERATIONAL\_PERCENTILE\_METHOD} = \text{sorted}[\lfloor n \times p \rfloor]$$

This discrete rank estimator was used in historical Phase 9.1 deliverables and remains the authoritative formula governing all operational SLO gates.

---

## 2. Recomputed Historical Phase 9.1 Operational Metrics ($n = 30$)

Computed using the locked operational estimator on all 30 request records in `backend/phase9_1_live_gemini_results.json`:
- **Operational $p50$ (index $\lfloor 30 \times 0.50 \rfloor = 15$):** **$1888\text{ms}$**
- **Operational $p75$ (index $\lfloor 30 \times 0.75 \rfloor = 22$):** **$2528\text{ms}$**
- **Operational $p90$ (index $\lfloor 30 \times 0.90 \rfloor = 27$):** **$3815\text{ms}$**
- **Operational $p95$ (index $\lfloor 30 \times 0.95 \rfloor = 28$):** **$6325\text{ms}$**
- **Maximum Duration (index $29$):** **$6327\text{ms}$**

---

## 3. Secondary Analytical View — Linear-Interpolated Statistics ($n = 30$)

For statistical completeness, linear interpolation across discrete points yields:
- **Interpolated $p50$:** **$1328\text{ms}$**
- **Interpolated $p75$:** **$2504\text{ms}$**
- **Interpolated $p90$:** **$3174\text{ms}$**
- **Interpolated $p95$:** **$5195\text{ms}$**
- **Maximum Duration:** **$6327\text{ms}$**

### Explanation of Variance:
The discrete estimator index $28$ directly samples the 29th ordered value ($6325\text{ms}$), which represents a timeout-fallback request. Linear interpolation smooths the transition between sample 27 ($3815\text{ms}$) and sample 28 ($6325\text{ms}$).

---

## 4. Authoritative Metric Governing Operational SLO

The **Operational Estimator ($6325\text{ms}$)** strictly controls the release gate decision to preserve continuity with Phase 9 release criteria. The secondary interpolated value ($5195\text{ms}$) is retained solely for analytical visibility and does NOT alter the SLO determination.

---

## 5. Deconstruction of Metric Semantics

### A. Overall AI End-to-End Request Latency ($n = 30$)
- **Measured (Operational):** $p50 = 1888\text{ms}$, $p95 = 6325\text{ms}$, $\max = 6327\text{ms}$
- **Definition:** Total wall-clock time from user message submission to complete final response delivery across all execution paths.

### B. Successful Live Model Provider Latency ($n = 13$)
- **Measured (Operational):** $p50 = 2404\text{ms}$, $p75 = 2706\text{ms}$, $p90 = 3068\text{ms}$, $p95 = 3371\text{ms}$, $\max = 3807\text{ms}$
- **Definition:** Network round-trip and generation latency exclusively for queries where Google GenAI returned a successful synthesis response ($< 4\text{s}$).

### C. Fallback / Failsafe Path End-to-End Latency ($n = 17$)
- **Measured (Operational):** $p50 = 672\text{ms}$, $p75 = 750\text{ms}$, $p90 = 2991\text{ms}$, $p95 = 6325\text{ms}$, $\max = 6327\text{ms}$
- **Definition:** Total elapsed time for requests resolved via deterministic fallback. The tail latency ($6325\text{ms}$ / $6327\text{ms}$) reflects the preceding primary model call attempt (~6000ms timeout budget) before falling back to the deterministic engine.

### D. Non-Narration / Backend Computational Duration
- **Measured:** $p50 = 8\text{ms}$, $p95 = 22\text{ms}$, $\max = 25\text{ms}$
- **Limitation Note:** The Phase 9.1 dataset measures non-narration computation (ephemeris, planning, claim generation, firewall) and does not contain an isolated stopwatch timer for deterministic narrator string synthesis itself.

---

## 6. Consultation Deadline Evidence & Path Distinction

- **Production Service Contract:** `ProductionConsultationService` enforces a strict 15,000ms parent consultation ceiling (`parentDeadlineTimestampMs = Date.now() + 15000ms`), which dynamically bounds all child model timers (`min(configuredBudget, remainingParentBudget)`). Verified by Phase 10.2.1 suite (25/25 passed).
- **Direct Orchestrator Golden Harness:** The 15174ms golden-harness sample was recorded by an external test stopwatch around direct `orchestrator.consult()` without parent deadline clipping. It includes pre-consultation ephemeris computation and post-narration firewall verification.

---

## 7. Operational SLO & Staged Rollout Summary

| Metric / Gate | Operational Target | Authoritative Measured Value | Status |
|---|---|---|---|
| **Class A (Computational Latency)** | $p95 \le 80\text{ms}$ | $p95 = 10\text{ms}$ | **`MET`** |
| **Class B (Overall End-to-End Latency)** | $p95 \le 6000\text{ms}$ | $p95 = 6325\text{ms}$ | **`BREACHED`** ($+325\text{ms}$ on timeout tail) |
| **Successful Provider Latency** | $p95 \le 6000\text{ms}$ | $p95 = 3371\text{ms}$ | **`MET`** |
| **Stage 1 Entry Threshold (5% Traffic)** | $p95 < 4000\text{ms}$ | $p95 = 6325\text{ms}$ | **`BLOCKED`** ($+2325\text{ms}$ above threshold) |

---

## 8. Final Release Decision

- **ENGINEERING_TEST_GATE:** **`PASSED`** (23/23 Backend Suites, 25/25 Remediation Tests, 32/32 Release Gate Checks).
- **OPERATIONAL_SLO_GATE:** **`NEEDS_OPERATIONAL_REVIEW`** (Overall End-to-End $p95 = 6325\text{ms} > 6000\text{ms}$).
- **STAGE1_ELIGIBLE:** **`NO`**.
- **PUBLIC_TRAFFIC:** **`CLOSED / 0%`**.
- **CANONICAL_FINAL_STATUS:** **`NEEDS_OPERATIONAL_REVIEW`**.
