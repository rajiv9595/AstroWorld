# ASTROWORLD AI V2 — DISASTER RECOVERY RUNBOOK

## 1. Recovery Objectives & SLA Parameters
- **RPO (Recovery Point Objective)**: **5 Minutes** (Achieved via continuous PostgreSQL WAL archiving to isolated replica storage).
- **RTO (Recovery Time Objective)**: **1 Seconds (Target: $le 5$ Minutes)**.
- **Backup Frequency**: Automated full daily snapshots + continuous WAL archiving.
- **Retention Policy**: 30 days rolling snapshots with multi-region replication.

---

## 2. Full Disaster Recovery Process

### Step 1: Declare Incident & Activate DR Team
- Identify primary infrastructure outage (e.g. primary region failure, catastrophic storage loss).
- Notify engineering leads and declare DR state.

### Step 2: Provision Target Recovery Infrastructure
- In the disaster recovery region / environment, verify compute and database cluster readiness.
- Ensure network VPC peering and firewall security groups are active.

### Step 3: Database Point-in-Time Restoration
- Execute automated restore service:
  ```bash
  npm run db:restore -- --snapshot=<SNAPSHOT_ID> --target=production-dr
  ```
- `BackupRestoreService.restoreSnapshot()` reconstructs all relational tables:
  - `users`
  - `birth_profiles`
  - `conversations`
  - `conversation_messages` (restored in strict turn sequence)
  - `persistent_memories`
  - `idempotency_cache`

### Step 4: Data Fidelity & Integrity Audit
- Verify conversation count, message turn counts, and persistent memory record parity against pre-incident telemetry.
- Ensure 0 orphaned messages and 0 memory corruption.

### Step 5: Credential & Secret Verification
- Inject production secrets via secret manager (Gemini API keys, DB connection strings, JWT signing keys).
- Confirm zero secrets are hardcoded or written to disk.

### Step 6: Application Deployment & Traffic Cutover
- Deploy production release candidate container to recovery cluster.
- Execute health probes: `/api/health/live` and `/api/health/ready`.
- Update DNS / CDN origin routing to point to the restored production cluster.
- Monitor error rate and latency for 1 hour.
