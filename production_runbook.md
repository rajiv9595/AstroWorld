# ASTROWORLD AI V2 — PRODUCTION OPERATIONAL RUNBOOK

## 1. Routine Deployment Procedure
1. Verify CI test suite passes (`npm test`).
2. Run database migration runner (`MigrationRunner.migrateUp()`).
3. Deploy canary container with 5% traffic weight.
4. Monitor `AlertManager` metrics for 15 minutes.
5. Scale traffic: 25% -> 50% -> 100%.

## 2. Gemini Outage Incident Response
1. Alert `GEMINI_FAILURE_SPIKE` triggers when fallback rate > 5%.
2. Confirm deterministic narrator failsafe is actively responding to users.
3. Check Google Cloud status page and Gemini API quota metrics.
4. If rate limit exceeded, increase quota or switch model alias via environment config.

## 3. Database Incident Response
1. Alert `DATABASE_CONNECTIVITY_FAILURE` triggers.
2. Check Cloud SQL instance health.
3. Verify connection pool saturation in `EnvironmentConfig`.
4. Trigger failover replica if primary is unresponsive.
