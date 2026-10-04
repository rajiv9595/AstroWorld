# ASTROWORLD AI V2 — PRODUCTION OPERATIONAL RUNBOOK

## 1. Routine Deployment Procedure (Canary Strategy)
1. **Pre-Deployment Verification**:
   - Ensure the full CI regression test suite passes (`npm test` with 100% success across 21 suites).
   - Validate that no staging or localhost endpoints are bundled in the frontend.
   - Confirm current git commit matches release tag in `release_manifest.md`.
2. **Database Migration**:
   - Execute forward-compatible migrations: `npm run db:migrate:up` (`MigrationRunner.migrateUp()`).
   - Validate schema integrity via health check probe.
3. **Canary Rollout Stages**:
   - Stage 1: Deploy new container revision with **5% traffic weight**. Monitor for 15 minutes.
   - Stage 2: If error rate remains < 0.1% and p95 latency < 4000ms, increase weight to **25%**.
   - Stage 3: Step up traffic to **50%**, then **100%** after 30 minutes of stable metrics.
4. **Post-Deployment Verification**:
   - Query `/api/health/live` and `/api/health/ready`.
   - Perform live synthetic consultation check.

---

## 2. Gemini Outage Incident Response
- **Trigger**: Alert `GEMINI_FAILURE_SPIKE` (fallback rate > 5.0%) or `GEMINI_LATENCY_SPIKE` (p95 > 5000ms).
- **Automated Mitigation**:
  - The `ProductionConsultationService` automatically fails over to the classical deterministic narrative synthesizer.
  - Zero user-facing 500 errors are returned; users receive mathematically verified, grounded responses.
- **Operator Actions**:
  1. Verify Google Cloud Status Dashboard and Gemini API quota metrics in GCP Console.
  2. If rate-limited (HTTP 429), scale out API quotas or rotate through configured model aliases (`gemini-3.8-flash`, `gemini-2.5-pro`).
  3. If complete upstream outage occurs, confirm narrator fallback logs are clean and status is monitored.

---

## 3. Database Outage Incident Response
- **Trigger**: Alert `DATABASE_CONNECTIVITY_FAILURE` (P0) or `DATABASE_LATENCY_SPIKE` (p95 > 500ms).
- **Operator Actions**:
  1. Inspect Cloud SQL / RDS PostgreSQL instance metrics (CPU, IOPS, connection count).
  2. If connection pool is exhausted, adjust pool limits in `EnvironmentConfig` or restart idle connections.
  3. If database instance is down, trigger automated failover to high-availability hot standby replica.
  4. Once standby is promoted, verify readiness probe `/api/health/ready` reports `"ready"`.

---

## 4. Memory Subsystem Failure
- **Trigger**: Alert `MEMORY_SUBSYSTEM_FAILURE` (P1) triggered by write gate or retrieval exceptions.
- **Operator Actions**:
  1. Check PostgreSQL `persistent_memories` table locks and index health.
  2. Verify that consultations safely proceed with in-session context when persistent memory is degraded.
  3. Re-index `idx_memories_user_status` and `idx_memories_user_cat_key` if query latency exceeds 100ms.

---

## 5. Authentication Failure Spike / IDOR Detection
- **Trigger**: Alert `AUTH_FAILURE_SPIKE` (401 > 10/min) or `CROSS_USER_IDOR_SPIKE` (P0).
- **Operator Actions**:
  1. If `CROSS_USER_IDOR_SPIKE` triggers, identify offending IP / API client from request logs.
  2. Verify all attempts were blocked with HTTP 403 Forbidden and zero conversation data was leaked.
  3. Apply temporary IP rate limit or token revocation via auth provider if abusive scraping is detected.

---

## 6. Elevated Latency Incident Response
- **Trigger**: p95 total latency exceeds 5000ms over a 5-minute rolling window.
- **Operator Actions**:
  1. Check `ProductionMetrics` breakdown to isolate latency source:
     - If Ephemeris/Vedic calculations: check server CPU load and scale container pods.
     - If Gemini provider: verify retry counts and adjust upstream timeout window.
     - If DB query latency: analyze slow query logs on `conversation_messages`.

---

## 7. Elevated 5xx Rate Incident Response
- **Trigger**: Alert `ELEVATED_5XX_RATE` (5xx error rate > 1.0%).
- **Operator Actions**:
  1. Filter structured error logs by `errorCode` and `requestId`.
  2. If errors stem from unhandled exception in recent release, initiate immediate rollback (see `rollback_runbook.md`).
  3. If external network partition, verify graceful degradation flags.

---

## 8. Backup Restore Procedure
- **Trigger**: Data corruption incident or recovery audit.
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
