# ASTROWORLD AI V2 — PRODUCTION OPERATIONAL RUNBOOK

- **Release Candidate Identifier**: `v2.0.0-rc1`
- **Git Tag Status**: `NONE` (Release candidate identifier; no Git tag created in repository)
- **Historical Evidence Source**: `backend/phase9_1_live_gemini_results.json`
- **Verified Engineering Baseline**: `b7ef4f8955455c99ea982c4a7577808c5bab5711`
- **Current Public Traffic State**: **`CLOSED / 0%`**
- **Current Operational Status**: **`NEEDS_OPERATIONAL_REVIEW`**
- **Stage 1 Rollout Eligibility**: **`BLOCKED`** (Class B historical $p95 = 6325\text{ms} > 4000\text{ms}$)

---

## 1. Release Status & Staged Rollout Policy

> [!IMPORTANT]
> **CURRENT OPERATIONAL ENFORCEMENT**:
> - Public traffic is strictly **`CLOSED / 0%`**.
> - Stage 1 rollout is **`BLOCKED`** because the historical Class B $p95$ of $6325\text{ms}$ breaches the Stage 1 threshold of $4000\text{ms}$ and the production SLO of $6000\text{ms}$.
> - No public traffic may be routed until human operational sign-off on a latency waiver or paid Gemini tier quota upgrade.

### Future Canary Rollout Procedure (Post-Waiver / Post-Optimization Only)
Once operational sign-off is granted, the following canary deployment procedure must be followed:
1. **Pre-Deployment Verification**:
   - Ensure the full CI regression test suite passes (`npm test` with 100% success).
   - Verify that no staging or localhost endpoints are bundled in the frontend.
   - Confirm current git commit matches the verified engineering baseline in `release_manifest.md` (Release Candidate `v2.0.0-rc1`).
2. **Database Migration**:
   - Execute forward-compatible migrations: `npm run db:migrate:up` (`MigrationRunner.migrateUp()`).
   - Validate schema integrity via the health check probe.
3. **Staged Canary Increments**:
   - **Stage 1 (5% Traffic)**: Deploy new container revision with 5% traffic weight. Monitor for 15 minutes. (BLOCKED under current 6325ms p95).
   - **Stage 2 (25% Traffic)**: If error rate remains < 0.1% and p95 latency < 4000ms, increase weight to 25%.
   - **Stage 3 (50% Traffic)**: Step up traffic to 50%, then 100% after 30 minutes of stable metrics.
4. **Post-Deployment Verification**:
   - Query `/api/health/live` and `/api/health/ready`.
   - Perform live synthetic consultation check.

---

## 2. Approved Production AI Model & Timeout Architecture

- **Primary AI Model**: `gemini-3.8-flash`
- **Secondary Live Fallback Model**: `gemini-3.1-flash-lite` (Active failover for 429 quota exhaustion, provider timeouts, or 5xx errors)
- **Deterministic Classical Failsafe**: `AstroWorld Classical Deterministic Narrator` (Zero-cold-start air-gapped synthesis engine)

### Authoritative Timeout Hierarchy
- **Parent Consultation Deadline**: `15000ms` (Enforced by `ProductionConsultationService` wrapping the entire consultation lifecycle).
- **Primary Model Budget**: Up to `8000ms`, dynamically clamped by remaining parent deadline (`min(8000ms, remainingParentBudget)`).
- **Secondary Fallback Budget**: Up to `6000ms`, dynamically clamped by remaining parent deadline (`min(6000ms, remainingParentBudget)`).
- **JSON Schema Repair Budget**: Up to `4000ms`, dynamically clamped by remaining parent deadline.
- **Hierarchical Invariant**: Total elapsed wall-clock time never exceeds the 15,000ms parent consultation deadline.

---

## 3. Operational Thresholds & Latency Controls

The system distinguishes three separate operational controls:
1. **Stage 1 Canary Eligibility Threshold**: $p95 < 4000\text{ms}$ (Currently **BLOCKED** at $6325\text{ms}$).
2. **Operational Latency Alert**: Triggered when rolling 5-minute $p95 > 5000\text{ms}$ (`GEMINI_LATENCY_SPIKE`).
3. **Class B Release SLO**: $p95 \le 6000\text{ms}$ (Currently **BREACHED** on historical fallback tail).

---

## 4. Gemini Outage Incident Response
- **Trigger**: Alert `GEMINI_FAILURE_SPIKE` (fallback rate > 5.0%) or `GEMINI_LATENCY_SPIKE` (p95 > 5000ms).
- **Automated Mitigation**:
  - `GeminiNarrator` automatically activates `gemini-3.1-flash-lite`.
  - If secondary fallback is also exhausted or timed out, `GeminiNarrator` activates `AstroWorld Classical Deterministic Narrator`.
  - Zero user-facing 500 errors are returned; users receive mathematically verified, grounded responses.
- **Operator Actions**:
  1. Verify Google Cloud Status Dashboard and Gemini API quota metrics in GCP Console.
  2. If rate-limited (HTTP 429), verify secondary fallback `gemini-3.1-flash-lite` and deterministic failsafe engagement.
  3. Confirm structured logs record explicit attempt-level telemetry (`primaryAttempted`, `primaryFailureReason`, `fallbackAttempted`, `deterministicFallbackUsed`).

---

## 5. Database Outage Incident Response
- **Trigger**: Alert `DATABASE_CONNECTIVITY_FAILURE` (P0) or `DATABASE_LATENCY_SPIKE` (p95 > 500ms).
- **Operator Actions**:
  1. Inspect Cloud SQL / RDS PostgreSQL instance metrics (CPU, IOPS, connection count).
  2. If connection pool is exhausted, adjust pool limits in `EnvironmentConfig` or restart idle connections.
  3. If database instance is down, trigger automated failover to high-availability hot standby replica.
  4. Once standby is promoted, verify readiness probe `/api/health/ready` reports `"ready"`.

---

## 6. Memory Subsystem Failure
- **Trigger**: Alert `MEMORY_SUBSYSTEM_FAILURE` (P1) triggered by write gate or retrieval exceptions.
- **Operator Actions**:
  1. Check PostgreSQL `persistent_memories` table locks and index health.
  2. Verify that consultations safely proceed with in-session context when persistent memory is degraded.
  3. Re-index `idx_memories_user_status` and `idx_memories_user_cat_key` if query latency exceeds 100ms.

---

## 7. Authentication Failure Spike / IDOR Detection
- **Trigger**: Alert `AUTH_FAILURE_SPIKE` (401 > 10/min) or `CROSS_USER_IDOR_SPIKE` (P0).
- **Operator Actions**:
  1. If `CROSS_USER_IDOR_SPIKE` triggers, identify offending IP / API client from request logs.
  2. Verify all attempts were blocked with HTTP 403 Forbidden and zero conversation data was leaked.
  3. Apply temporary IP rate limit or token revocation via auth provider if abusive scraping is detected.

---

## 8. Backup & Disaster Recovery Procedure
- **Trigger**: Data corruption incident or recovery audit.
- **Measured Metrics**: RTO $= 0.28\text{s}$, RPO configured as $5\text{ minutes}$.
- **Operator Actions**:
  1. Identify latest verified snapshot ID from backup catalog.
  2. Restore snapshot into an isolated DR staging database.
  3. Execute automated schema and data integrity verification script before routing traffic.

---

## 9. Emergency Shutdown & Traffic Drain Procedure
- **Trigger**: Critical vulnerability, catastrophic provider breach, or security incident.
- **Operator Actions**:
  1. Set application environment state: `MAINTENANCE_MODE=true`.
  2. Update ingress routing to display static maintenance response.
  3. Drain active HTTP connections with 30-second graceful timeout.
  4. Revoke active JWT signing keys and rotate all downstream API credentials.
