# ASTROWORLD AI V2 — PHASE 10.3.6 FALLBACK CAUSALITY TELEMETRY AND FINAL OPERATIONAL EVIDENCE LOCK REPORT

**Release Candidate Identifier:** `v2.0.0-rc1`  
**Git Tag Status:** `NONE` (Candidate identifier; no tag created in repository)  
**Historical Evidence Source Commit:** `2e2563eedb421cd815001840c3c0f96c912a7b56`  
**Verified Engineering Baseline:** `b7ef4f8955455c99ea982c4a7577808c5bab5711`  
**Operational Percentile Policy:** `sorted[Math.floor(n * p)]` (Repository historical discrete estimator)  
**Engineering Gate:** `PASSED` (100% Suites Green, 32/32 checks verified)  
**Operational Latency SLO (Class B):** `BREACHED` ($p95 = 6325\text{ms} > 6000\text{ms}$)  
**Stage 1 Rollout Eligibility:** `NO / BLOCKED` ($p95 = 6325\text{ms} > 4000\text{ms}$)  
**Public Traffic State:** `CLOSED / 0%`  
**Final Operational Decision:** `NEEDS_OPERATIONAL_REVIEW`

---

## 1. Historical Telemetry Limitation (`LEGACY_PHASE_9_1_TELEMETRY`)

The historical Phase 9.1 live Gemini benchmark dataset (`backend/phase9_1_live_gemini_results.json`) records the following fields per query:
- `executionMode` (e.g., `LIVE_GEMINI`, `DETERMINISTIC_FALLBACK`)
- `actualModel` (e.g., `gemini-3.8-flash`, `gemini-3.1-flash-lite`, `AstroWorld Classical Narrator`)
- `fallbackUsed` (boolean)
- `providerLatencyMs` (milliseconds returned by Gemini SDK)
- `backendComputationalDurationMs` (non-narration astrological pipeline compute time)
- `totalDurationMs` (overall end-to-end request duration)

**Key Telemetry Boundary**: The legacy Phase 9.1 dataset does **not** preserve:
- Exact primary model failure reason (e.g., 429 quota exhaustion vs socket timeout vs 500 error)
- Exact secondary fallback model failure reason
- Which specific model attempt encountered a timeout
- Exact timeout stage or deadline timestamp
- Whether the primary or secondary model attempt consumed the latency tail

Therefore, all historical Phase 9.1 telemetry is classified as **`LEGACY_PHASE_9_1_TELEMETRY`**, and exact fallback causality cannot be retroactively reconstructed or fabricated.

---

## 2. Why 6325ms Cannot Be Causally Attributed

In `phase9_1_live_gemini_results.json`, two tail queries (Index 12: `6325ms` and Index 13: `6327ms`) are recorded with:
- `executionMode: "DETERMINISTIC_FALLBACK"`
- `fallbackUsed: true`
- `providerLatencyMs: 0`
- `totalDurationMs: 6325` / `6327`

**Authoritative Evidence Statement**:
> "The Phase 9.1 dataset records these requests as deterministic fallback paths with approximately 6325–6327ms total duration and zero providerLatencyMs, but it does not preserve sufficient causal telemetry to determine which upstream model attempt or failure mode consumed the latency tail."

We do not infer:
- That the primary model had a ~6000ms timeout budget at the time of the historical run.
- That the primary model timed out.
- That the fallback model timed out.
- That deterministic synthesis itself consumed 6325ms.

Only what the telemetry explicitly proves is claimed.

---

## 3. Current Production Timeout Configuration

The current production runtime configuration in `environmentConfig.ts` and `productionConsultationService.ts` is:
- **`totalConsultationMs`**: `15000ms` (Global user-facing request deadline enforced by `ProductionConsultationService`)
- **`geminiRequestMs` (Primary)**: `8000ms` (Primary model `gemini-3.8-flash` per-call timeout budget)
- **`geminiFallbackRequestMs` (Fallback)**: `6000ms` (Secondary model `gemini-3.1-flash-lite` per-call timeout budget)
- **`geminiRepairRequestMs` (JSON Schema Repair)**: `4000ms` (Post-processing repair budget)

---

## 4. Enhanced Runtime Telemetry Fields

To guarantee unambiguous causality for all future runtime measurements, attempt-level audit telemetry has been added to `ConsultationTrace`, `GeminiNarrator`, and `ConsultationOrchestrator` without changing model selection or fallback behavior:

```typescript
// Telemetry & Audit Only (Not exposed in user-facing consultation prose)
export interface AttemptLevelTelemetry {
  primaryAttempted: boolean;
  primarySucceeded: boolean;
  primaryFailureReason?: string;
  primaryDurationMs?: number;
  primaryTimeoutTriggered: boolean;
  fallbackAttempted: boolean;
  fallbackSucceeded: boolean;
  fallbackFailureReason?: string;
  fallbackDurationMs?: number;
  fallbackTimeoutTriggered: boolean;
  deterministicFallbackUsed: boolean;
  deterministicFallbackDurationMs?: number;
  finalExecutionPath: 'primary_model' | 'fallback_model' | 'deterministic_failsafe';
}
```

Backward compatibility is 100% preserved: `requestedModel`, `selectedModel`, `effectiveModel`, `fallbackTriggered`, `fallbackReason`, `executionMode`, `providerLatencyMs`, `modelTimeoutBudgetMs`, and `timeoutTriggered` remain active and unchanged.

---

## 5. Controlled Failure Matrix Results

A deterministic test suite (`backend/test/phase10_3_6_fallback_telemetry.test.ts`) verifies the attempt-level telemetry across the full failure matrix:

| Scenario | Condition | `primaryAttempted` / `primarySucceeded` | `fallbackAttempted` / `fallbackSucceeded` | `deterministicFallbackUsed` | `finalExecutionPath` | Verification Status |
|---|---|---|---|---|---|---|
| **A** | Primary succeeds | `true` / `true` | `false` / `false` | `false` | `primary_model` | ✅ **PASSED** |
| **B** | Primary controlled failure (429) -> fallback succeeds | `true` / `false` | `true` / `true` | `false` | `fallback_model` | ✅ **PASSED** |
| **C** | Primary timeout -> fallback succeeds | `true` / `false` (`primaryTimeoutTriggered: true`) | `true` / `true` | `false` | `fallback_model` | ✅ **PASSED** |
| **D** | Primary fails -> fallback timeout -> deterministic failsafe | `true` / `false` | `true` / `false` (`fallbackTimeoutTriggered: true`) | `true` | `deterministic_failsafe` | ✅ **PASSED** |
| **E** | Primary forced failure -> fallback quota fails -> deterministic failsafe | `true` / `false` | `true` / `false` | `true` | `deterministic_failsafe` | ✅ **PASSED** |
| **F** | Parent deadline exhausted -> deterministic failsafe | `true` / `false` (`PARENT_DEADLINE_EXHAUSTED`) | `false` / `false` | `true` | `deterministic_failsafe` | ✅ **PASSED** |

---

## 6. Production Service vs. Direct Orchestrator Timing Distinction

1. **`ProductionConsultationService`**:
   - Enforces the authoritative 15,000ms global parent deadline.
   - Verified by the Phase 10.2.1 Hierarchical Timeout Suite (25/25 passed). All consultations complete within budget or safely return deterministic fallback without hanging.
2. **Direct `ConsultationOrchestrator` Harness**:
   - A direct component-level harness for isolated step verification without the production service wrapper.
   - The historical 15174ms sample observed in direct harness testing reflects harness unconstrained timing, not a production-service deadline violation.

---

## 7. Historical Phase 9.1 Latency Policy & Statistics

- **Locked Estimator Definition:** `sorted[Math.floor(length * percentile)]`
- **Class A (Computational Latency):** $p50 = 6\text{ms}$, $p95 = 10\text{ms}$, $\max = 25\text{ms}$ (Budget: $p95 \le 80\text{ms}$ — **MET**)
- **Class B Overall End-to-End Latency ($n = 30$):**
  - Operational Estimator ($p95 = \text{sample}[28]$): **$6325\text{ms}$**
  - Linear Interpolation ($p95 = 0.55 \times 3815 + 0.45 \times 6325$): **$5195\text{ms}$**
  - Peak Maximum: **$6327\text{ms}$**
- **Successful Live Model Provider Latency ($n = 13$):**
  - $p50 = 2404\text{ms}$, $p95 = 3371\text{ms}$, $\max = 3807\text{ms}$
- **Fallback / Failsafe Path End-to-End Latency ($n = 17$):**
  - $p50 = 672\text{ms}$, $p95 = 6325\text{ms}$, $\max = 6327\text{ms}$

---

## 8. Class B SLO Result

- **Target:** $p95 \le 6000\text{ms}$
- **Measured Operational $p95$:** **$6325\text{ms}$**
- **Verdict:** **`BREACHED`** ($+325\text{ms}$ beyond the $6000\text{ms}$ production budget)

---

## 9. Stage 1 Rollout Eligibility

- **Requirement:** Class B $p95 < 4000\text{ms}$
- **Measured Operational $p95$:** **$6325\text{ms}$** ($+2325\text{ms}$ over threshold)
- **Verdict:** **`NO / BLOCKED`**

---

## 10. Public Traffic Status

- **Status:** **`CLOSED / 0%`**
- **Policy:** Zero public traffic until human operational sign-off on latency waiver or Gemini paid quota upgrade.

---

## 11. Final Operational Decision

```
================================================================================
FINAL OPERATIONAL EVIDENCE LOCK SUMMARY
================================================================================
ENGINEERING_TEST_GATE:      PASSED (100% Suites Green, 32/32 Phase 10 Checks)
OPERATIONAL_SLO_GATE:       NEEDS_OPERATIONAL_REVIEW (Class B p95 = 6325ms > 6000ms)
CLASS_B_OPERATIONAL_P95:    6325ms
PROVIDER_P95:               3371ms
STAGE1_ELIGIBLE:            NO
PUBLIC_TRAFFIC:             CLOSED / 0%
FINAL_STATUS:               NEEDS_OPERATIONAL_REVIEW
================================================================================
```
