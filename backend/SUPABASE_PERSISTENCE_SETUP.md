# Supabase Runtime Persistence Setup

This guide is for an AstroWorld project that already uses Supabase Auth and has the existing public tables `profiles`, `kundli_charts`, and `saved_consultations`.

## Important compatibility note

The historical migrations `001_initial_schema.sql` through `004_persistent_memory_metadata.sql` describe an older schema with an app-owned `users` table and string user IDs. The current application derives identity from a verified Supabase Auth token, so the runtime persistence schema must use `auth.users.id` UUID values instead.

For an existing deployment with the table inventory described above, **do not run migrations 001–004 against production as a batch**. Apply only `src/db/migrations/005_supabase_runtime_persistence.sql` after reviewing it. It creates the AI conversation, message, memory, and idempotency tables; it does not alter the existing astrology tables.

## Safe apply sequence

1. Confirm the Supabase dashboard is open to the intended AstroWorld project.
2. Take a current database backup or snapshot before making schema changes.
3. Open **SQL Editor** and paste the complete contents of `backend/src/db/migrations/005_supabase_runtime_persistence.sql`.
4. Review the SQL. It must create only `conversations`, `conversation_messages`, `persistent_memories`, `idempotency_cache` and their indexes/security settings. It must not contain `DROP`, `TRUNCATE`, or data-copy operations.
5. Run it once. It is written to be repeatable for these newly introduced objects, but do not use repeatability as a substitute for reviewing the target project.
6. Confirm that the four tables exist in the `public` schema and that RLS is enabled.
7. From the project root, run the read-only runtime audit:
   ```powershell
   npm --workspace=@astroworld/backend run audit:ai-v3:persistence-runtime
   ```
8. Then run the automated backend certification:
   ```powershell
   npm --workspace=@astroworld/backend run test:production:certification
   ```
9. For a real persistence round-trip, run the opt-in smoke test against one of your own Auth user IDs. Find the UUID in **Authentication → Users** and keep it local; do not paste it into chat or commit it. This test writes temporary uniquely named conversation/message/memory rows, verifies reads, and deletes those rows by exact unique IDs:
   ```powershell
   $env:ASTROWORLD_PERSISTENCE_SMOKE_USER_ID = "YOUR-OWN-SUPABASE-AUTH-UUID"
   $env:ASTROWORLD_CONFIRM_WRITES = "true"
   npm --workspace=@astroworld/backend run audit:ai-v3:persistence-roundtrip
   Remove-Item Env:ASTROWORLD_PERSISTENCE_SMOKE_USER_ID
   Remove-Item Env:ASTROWORLD_CONFIRM_WRITES
   ```
   *(Note: In PowerShell, if passing flags directly via npm, use `npm --workspace=@astroworld/backend run audit:ai-v3:persistence-roundtrip -- -- --confirm-writes` because PowerShell treats the first `--` as a parameter stop-parsing token).*
   Review the script before opting in. Run it only against the intended project after taking a backup. The script requires explicit write confirmation, prints no user ID/row contents/credentials, and fails if it cannot clean up the temporary records.

## Read-only verification query

After applying migration 005, this query should return four rows with `rowsecurity = true`:

```sql
SELECT
    n.nspname AS table_schema,
    c.relname AS table_name,
    c.relrowsecurity AS row_security_enabled
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
      'conversations',
      'conversation_messages',
      'persistent_memories',
      'idempotency_cache'
  )
ORDER BY c.relname;
```

The runtime audit performs only `SELECT ... LIMIT 1` schema/access probes. It does not insert, update, delete, or print row contents.

## Credential and access requirements

- The backend environment needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- The service-role key is server-only. Never place it in a `VITE_*` variable, commit it, or paste it into a chat or issue.
- The new tables enable row-level security and revoke direct table privileges from `anon` and `authenticated`. The trusted backend service-role client performs persistence operations.
- Do not share real consultation text, memory rows, access tokens, or secret values when reporting results.

## What success looks like

The audit should finish with:

```text
AI V3 CONFIGURED PERSISTENCE RUNTIME: PASS (3 read-only probes)
```

If it fails, share the table name, error code, and error message only. Do not share credentials.

This setup validates schema availability and server access. It does not by itself certify live Gemini latency/SLOs or perform an independent AI answer-quality review.
