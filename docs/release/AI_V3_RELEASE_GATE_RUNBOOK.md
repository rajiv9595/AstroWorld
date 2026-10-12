# AstroWorld AI V3 — Release Gate Runbook

## Scope and safety

The release-gate audit is opt-in and staging-only. It does not deploy, publish, merge, or mutate conversation/memory records. The persistence check performs `SELECT ... LIMIT 1` probes only. The Gemini audit uses a synthetic fixture birth profile and explicitly disables persistent memory and conversation persistence.

Do not put production credentials in the `astroworld-staging` GitHub Environment.

## One-time GitHub configuration

Create/configure the GitHub Environment named `astroworld-staging`. Add these environment secrets:

- `GEMINI_API_KEY` — a valid Gemini API key with access to the configured primary and fallback models.
- `SUPABASE_URL` — the staging Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — the staging server-only service-role key. Never use a browser key or commit this secret.

The backend persistence schema must have these tables/columns accessible to the service role:

- `persistent_memories.memory_id`
- `conversations.id`
- `conversation_messages.id`

If the runtime audit fails, inspect staging environment configuration and migration state. The gate intentionally fails closed; it does not silently accept an in-memory fallback when Supabase was expected.

## Execute the live gate

After this workflow is available on the repository's default branch, select **Actions → AstroWorld AI V3 Release Gates (Manual) → Run workflow**. Select this feature branch/revision when validating this PR.

Default thresholds are proposed release guardrails, not measurements of current live service behavior:

| Metric | Default gate |
|---|---:|
| Live consultations | 10 samples (select 5–25) |
| End-to-end total latency p95 | ≤ 25,000 ms |
| Successful provider-call latency p95 | ≤ 8,000 ms |
| Samples that trigger fallback | ≤ 20% |
| Live-model success rate | 100% |
| Final validator status | `approved` or `repaired` for every sample |
| Grounding | Each sample references at least one verified evidence ID |

Only use relaxed thresholds when there is a documented, approved quota or rollout adjustment. Change the workflow input to the approved threshold; record the rationale and the approving owner in the PR. A green SLO run is evidence for the selected revision and selected thresholds, not proof of global availability.

The workflow first checks whether the configured Supabase repository adapters are enabled and can query the required tables. It then sends actual requests to Gemini, measuring both total consultation latency and successful provider latency. It fails if the provider is unavailable and the system silently returns a deterministic-only answer. It produces a JSON artifact named `astroworld-ai-v3-live-slo-report` with latency/fallback metrics and answer samples. The fixture chart uses synthetic data; the report must not be treated as a reading for a real person.

## Independent answer review — required before release

Automated grounding/validator checks are necessary but do not establish the usefulness or clarity of the answer. A reviewer who did not implement this change must inspect the report's sample answers and complete this section in the PR.

Reviewer: `TBD`  
Reviewed commit SHA: `TBD`  
SLO report artifact/run: `TBD`  
Decision: `Not reviewed` — Pass / Fail / Needs changes

For each reviewed answer, assess:

| Criterion | Pass condition |
|---|---|
| Evidence lineage | Astrological specifics correspond to approved facts/claims; no fabricated placement or event |
| Compound coverage | Every requested life domain is answered when evidence exists, or its evidence gap is plainly disclosed |
| Mixed indications | Supporting and restricting indications both remain visible |
| Uncertainty | Transits/dashas are presented as interpretive factors, not guarantees |
| Timing | Dates/windows are supported by computed evidence; no invented exact event dates |
| User-facing clarity | Natural, direct language; no unexplained engine jargon or raw schema properties |
| Concision and duplication | No repeated facts that add no value; facet-specific evidence is easy to identify |
| Safety and boundaries | No fatalistic guarantees, unsupported medical/legal/financial directives, or commercial remedy prescriptions |

The reviewer must record concrete examples of any failures and the action taken. The implementer cannot mark the independent-review gate as passed on their own. If no independent reviewer or live SLO report is available, keep the PR in draft and do not interpret CI green as release approval.

## Gate status checklist

- [ ] Full production certification passed on the same commit.
- [ ] Phase 15 operational closure passed on the same commit.
- [ ] Staging persistence/runtime audit passed.
- [ ] Live Gemini SLO audit passed at approved thresholds.
- [ ] Independent answer-quality review passed and documented.
- [ ] Release owner approved rollout and rollback plan.

No live gate is considered complete solely because its workflow or script has been committed.
