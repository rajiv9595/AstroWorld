# ASTROWORLD AI V2 — ROLLBACK RUNBOOK

## 1. Quick-Rollback Criteria
Initiate immediate rollback if any of the following occur during or after deployment:
- Error rate $ge 1.0%$ across rolling 5-minute window.
- p95 latency $ge 8000	ext{ms}$.
- Alert `DATABASE_CONNECTIVITY_FAILURE` or `READINESS_PROBE_FAILURE` triggers.
- Critical security defect or data integrity mismatch identified.

---

## 2. Application Container Rollback
1. **Re-route Ingress Traffic**:
   - Immediately switch canary / blue-green traffic weight to 100% on previous stable container revision (e.g., `v2.0.0-rc0` or last stable build).
2. **Verify Health Probes**:
   - Check `/api/health/live` -> HTTP 200 `{"status": "ok"}`.
   - Check `/api/health/ready` -> HTTP 200 `{"status": "ready"}`.
3. **Drain Faulty Pods**:
   - Terminate canary revision instances after inflight requests complete.

---

## 3. Database Schema Rollback Strategy
1. **Forward-Compatible Migrations**:
   - All AstroWorld database migrations are designed with expand-and-contract patterns so that old application code continues to function with new database schemas.
2. **Reversible Migrations**:
   - For non-destructive changes, execute: `npm run db:rollback` (`MigrationRunner.rollbackLast()`).
3. **Irreversible / Complex Schema Changes**:
   - If a migration contains irreversible changes, DO NOT drop columns immediately. Use column deprecation and restore previous version compatibility views.

---

## 4. Frontend Client Rollback
1. Invalidate CDN cache for `index.html` and asset bundles.
2. Re-publish previous release asset directory on CDN.
3. Confirm frontend client binds cleanly to relative proxy route `/api/ai-v2`.

---

## 5. Post-Rollback Validation Checklist
- [ ] Liveness and readiness endpoints return 200 OK.
- [ ] End-to-end consultation test passes on test user account.
- [ ] Zero unhandled 5xx errors in structured logs.
- [ ] Persistent memories and active conversations intact without data corruption.
