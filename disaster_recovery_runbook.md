# ASTROWORLD AI V2 — DISASTER RECOVERY RUNBOOK

## 1. DR Parameters
- **RPO (Recovery Point Objective)**: 5 Minutes (continuous WAL stream)
- **RTO (Recovery Time Objective)**: Measured 1 Seconds ($le 5$ Minutes)

## 2. Point-in-Time Restore Procedure
1. Identify target snapshot ID from backup metadata.
2. Provision target recovery database instance.
3. Execute `BackupRestoreService.restoreSnapshot(snapshotId, targetEnv)`.
4. Validate conversation turn counts and persistent memory records.
5. Re-point application connection strings.
