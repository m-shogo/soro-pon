# Operations Readiness

## Purpose

State which operational controls apply to the current local-first static
frontend, which are implemented, which remain evidence-open, and which do not
apply until the architecture changes.

Current architecture:

```text
static React/Vite frontend
localStorage persistence
no backend/API/auth/accounts/cloud sync/online multiplayer
no remote telemetry
hosting provider not selected
```

Status vocabulary:

```text
IMPLEMENTED
PARTIAL / EVIDENCE OPEN
BLOCKED_ENVIRONMENT
NOT_APPLICABLE_CURRENT_ARCHITECTURE
FUTURE_TRIGGER
```

## Summary — 2026-07-25

| Area | Status | Current control | Open evidence / limitation |
|---|---|---|---|
| Schema migration | IMPLEMENTED / rerun open | strict versions, visible deterministic v0→v1, newer reject | exact-final-SHA rerun |
| Corruption recovery | IMPLEMENTED / rerun open | deck metadata/body salvage, partial records salvage, raw backup attempt | final-SHA execution |
| Mutation conflict | PARTIAL | stale observed deck save/delete rejection | no true atomic CAS |
| Backup | PARTIAL | local forensic `*.corrupt-backup` | not guaranteed/user-facing/cross-device |
| Restore | OPEN | developer inspection only | no restore UI/merge |
| Deploy | BLOCKED_ENVIRONMENT | runbook only | no provider/URL/secrets/job |
| Artifact rollback | BLOCKED_ENVIRONMENT | historical local compatibility rehearsal + runbook | no deployed immutable artifact |
| Observability | PARTIAL / local | command logs, browser errors, flow/soak evidence | no remote production telemetry |
| Metrics | PARTIAL | test/build/flow/soak/authoritative Chromium memory | missing values remain null |
| Distributed trace | NOT APPLICABLE | no service graph | reopen with API/backend |
| Rate limiting | NOT APPLICABLE | local byte/depth/branch/package/storage caps | reopen with network endpoint |
| Server load | NOT APPLICABLE | no server target | reopen with API/backend |
| Client stress/soak | IMPLEMENTED for recorded historical scopes | adversarial fixtures + Batch 9/10 | current artifact rerun/Batch 11 |
| Chaos/fault injection | PARTIAL | storage, schema, cleanup, skin, stale-state failures | network chaos awaits network architecture |
| Dependency reproducibility | PARTIAL | pnpm lock; exact top-level Python pins | Python transitive hash lock open |
| Dependency monitoring | IMPLEMENTED | Dependabot npm/pip/Actions | proposed updates still need review |
| Workflow supply chain | PARTIAL | read-only permissions/timeouts/concurrency | immutable action SHA pinning open |
| Version compatibility | IMPLEMENTED / rerun open | deck/storage/skin contracts | exact artifact matrix |
| Secrets | NOT APPLICABLE NOW | none required in repo | provider secret store before deploy |
| Privacy/telemetry | DESIGN GUARD | no remote collection | consent/retention review before telemetry |

## Persistence / Recovery

Canonical policy: `docs/release/STORAGE-RECOVERY-POLICY.md`.

Implemented:

```text
strict final read/write schemas
read-denial display fallback with fail-closed mutation/export
per-deck salvage
valid deck-body preservation when wrapper metadata is damaged
deterministic duplicate deck-ID consolidation
current-version partial records salvage
ordered-set normalization and totalMatches lower bound
raw backup and active cleanup attempted independently
atomic match record/coins/roles/achievements write
stale observed update/delete rejection
truthful full-reset result in TOP and ErrorBoundary
```

Not implemented:

```text
transactional multi-tab compare-and-swap
in-app backup browser/restore/merge
cloud or cross-device backup
guaranteed backup under quota/policy denial
```

## Migration / Version Compatibility

```text
current shared deck: strict parse + integrity validation
known v0 deck: visible deterministic migration review
missing/invalid/newer deck version: reject
current local records with partial damage: safe field/row salvage
unknown local records version: backup/reset, no guessing
skin registry/package newer contract: reject
```

Before a persisted-format release:

```text
build exact old/new artifacts
seed representative old data
perform new writes
open with intended rollback artifact
record compatibility or explicitly block rollback
record SHA and artifact hashes
```

A source checkout is not deployed-artifact rollback.

## Deploy / Rollback

Status: **BLOCKED_ENVIRONMENT**.

Missing:

```text
hosting provider and target URL
staging/production separation
deploy job/script and provider credentials
immutable artifact retention
health contract
actual rollback target and decision owner
incident communication/on-call model
```

Canonical runbook: `docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md`.

```text
vite preview != deploy
git checkout/revert != immediate artifact rollback
local cache rehearsal != CDN/browser cache proof
```

## Observability / Metrics

Current test evidence:

```text
install/typecheck/test/build logs
Integrity Contracts results
Python asset fixture result
Playwright step/result JSON
pageerror / console / rejection / failed request capture
cycle/dead-end/corruption counters
Chromium memory/timer/listener/DOM metrics where authoritative
screenshots and redacted summaries
```

This is test observability, not production telemetry.

Current remote telemetry:

```text
error collection: none
analytics: none
session replay: none
distributed trace: none
central logs: none
```

Rules:

```text
not measured = null/not_available, never 0
state dev server vs production preview vs deployed artifact
state exact SHA/browser/device/tool version
never compare non-equivalent memory authorities
```

Any future telemetry requires purpose/owner, minimal privacy-safe schema,
consent/disclosure, retention/deletion, sampling/cost, offline behavior, and
security review. Deck JSON/content must not be collected.

## Resource / Abuse Controls

No HTTP rate limit applies because no endpoint exists.

Current local controls:

```text
import byte and JSON-depth limits
bounded unsafe diagnostic generation
strict unsafe/unknown-field rejection
candidate/partition/wildcard caps
persisted collection limits
skin file/type/byte/dimension/geometry limits
request-sequence cancellation for skin transitions
```

Future trigger: upload, sync, multiplayer, login, telemetry, marketplace, or
any API. Then add identity/IP/device keys, burst/sustained limits, cost weights,
Retry-After, enumeration controls, storage/bandwidth quota, and alert thresholds.

## Load / Stress / Fault Injection

Applicable current evidence:

```text
adversarial custom-deck/import fixtures
candidate explosion and diagnostic caps
five-size visual matrix
Batch 9 Chromium dev-server soak
Batch 10 Chromium production-preview soak
Batch 11 planned Firefox/WebKit production rotation
```

Current deterministic faults:

```text
corrupt JSON and invalid outer/inner shapes
unknown/newer schema
storage read/write/quota/backup/remove failure
metadata-only deck damage
isolated malformed match rows
duplicate persisted IDs and stale observed mutation
skin manifest/token/asset/preload failure
skin race/unmount/inheritance/registry/trust failures
partial reset failure
```

Do not call this full production chaos engineering. Network timeout, retry
storm, dependency outage, stale CDN/cache, and restore failure become applicable
only when those systems exist.

## Dependency / Workflow Supply Chain

Canonical documents:

```text
docs/DEPENDENCY-POLICY.md
docs/CI-GATES.md
docs/qa/POST-BATCH-10-SUPPLY-CHAIN-REVIEW.md
```

Current controls:

```text
pnpm lockfile + frozen install + integrity metadata
Python 3.13 CI with exact Pillow/NumPy/pytest top-level pins
Python asset fixture job
weekly Dependabot for npm, pip, and Actions
read-only workflow permissions, timeouts, concurrency cancellation
```

Open limits:

```text
Python transitive packages/wheels not hash-locked
GitHub Actions use major tags rather than verified immutable commit SHAs
final-SHA Node/Python workflow results not observed
```

Dependency monitoring is not automatic approval and does not prove an update is
compatible or safe.

## Incident / Ownership

Current runbooks:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/release/SOAK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
```

Before real deploy define:

```text
release operator and rollback owner
credential owner
severity/abort criteria
communication channel
artifact retention duration
post-incident evidence/review
```

## Closure Order

```text
1. Stop concurrent writers and freeze clean HEAD == origin/main.
2. Frozen Node install and pinned Python install.
3. Observe Integrity Contracts and Python asset fixture jobs.
4. pnpm typecheck / test / skin:validate / build.
5. Resolve any failure; restart exact-SHA evidence after every change.
6. Execute Batch 11 on the same production artifact.
7. Synchronize evidence/report/readiness.
8. Select hosting and staging/production model.
9. Staging deploy + immutable rollback rehearsal.
10. Production deploy/rollback verification.
11. Physical-device and real-AT evidence when environments exist.
```

Do not add backend-grade systems before their trigger, and do not claim
production operations readiness before actual deployment evidence exists.
