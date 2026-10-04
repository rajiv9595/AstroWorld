# ASTROWORLD AI V2 — ROLLBACK RUNBOOK

## 1. Application Rollback
1. Re-route ingress traffic to previous container revision.
2. Verify liveness (/api/health/live) and readiness (/api/health/ready).

## 2. Database Migration Rollback Strategy
1. All migrations must be forward-compatible.
2. For reversible schema changes: execute `MigrationRunner.rollbackLast()`.
3. For destructive column drops: use expand-and-contract release patterns.
