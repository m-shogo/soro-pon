# Operations Readiness

## Purpose

This document answers a common release-review question: which production
operations controls apply to the current local-first frontend, which are
implemented, which remain unverified, and which are not applicable until
the architecture changes.

It prevents two opposite failures:

```text
overclaiming enterprise/backend readiness for systems that do not exist
adding invasive infrastructure or telemetry merely to satisfy a checklist
```

Current architecture:

```text
static React/Vite frontend
localStorage persistence
no backend/API
auth/accounts absent
online multiplayer absent
cloud sync absent
remote telemetry absent
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

## Summary Matrix — 2026-07-24

| Area | Current status | Current control | Release implication |
|---|---|---|---|
| Schema migration | IMPLEMENTED / rerun open | strict versions, deterministic v0→v1, newer reject | verify on exact current SHA |
| Migration rollback | PARTIAL | old/new local-data compatibility rehearsal; no generic down migration | test against real release artifacts when format changes |
| Corruption recovery | IMPLEMENTED / rerun open | salvage, backup attempt, safe fallback, translated issues | fresh tests required |
| Backup | PARTIAL | best-effort local forensic backup keys | not cross-device or guaranteed |
| Restore | OPEN LIMITATION | manual developer inspection only | no user-facing restore claim |
| Deploy | BLOCKED_ENVIRONMENT | runbook only | local preview is not deploy |
| Artifact rollback | BLOCKED_ENVIRONMENT | runbook + historical local compatibility rehearsal | cannot claim production rollback |
| Observability | PARTIAL / local only | harness logs, page/console/rejection capture, redacted evidence | no remote production telemetry claim |
| Metrics | PARTIAL | test/build/error/cycle/memory metrics where authoritative | unavailable values remain null |
| Distributed trace | NOT_APPLICABLE_CURRENT_ARCHITECTURE | no service graph | reopen with backend/API |
| Rate limiting | NOT_APPLICABLE_CURRENT_ARCHITECTURE | local byte/depth/branch/package caps instead | reopen with any network endpoint |
| Server load test | NOT_APPLICABLE_CURRENT_ARCHITECTURE | no server/concurrency target | reopen with backend/API |
| Client stress/soak | IMPLEMENTED for recorded scopes | adversarial fixtures, Batch 9/10 soak | current SHA rerun where code changed |
| Chaos testing | PARTIAL / local faults | corrupt storage, quota/read/remove faults, skin failure | expand with network architecture |
| Incident response | PARTIAL | rollback/storage/soak runbooks | production ownership/escalation absent until deploy exists |
| Version compatibility | IMPLEMENTED / rerun open | deck/storage/skin version contracts | exact artifact matrix required |
| Secrets management | NOT_APPLICABLE now | no deploy/API secrets in repo | provider secret store required before deploy |
| Privacy/telemetry | DESIGN GUARD | local-first; no remote collection | review before adding telemetry |

## Migration

### Shared deck JSON

```text
current version: strict parse and validation
known old version: deterministic migration with notice
missing/invalid/newer version: reject
unsafe or ambiguous fields: do not preserve silently
```

Canonical policy: `docs/MIGRATIONS.md`.

### Local storage

```text
soro-pon.decks.v1
soro-pon.records.v1
soro-pon.settings.v1
soro-pon.skin.v1
```

Current migration is intentionally narrow. Do not add a generic runner
until another real version exists.

### Rollback compatibility

A down-migration framework is not currently justified. Instead, before a
release that changes persisted output:

```text
1. build old release artifact
2. seed old-format data
3. open with new artifact and perform representative writes
4. open the resulting storage with the intended rollback artifact
5. verify readable behavior or explicitly block rollback
6. record fixture/hash/artifact SHA
```

A source-code checkout is not a deployed-artifact rollback.

## Corruption Recovery / Backup / Restore

Current recovery is documented in
`docs/release/STORAGE-RECOVERY-POLICY.md`.

Implemented:

```text
strict parsing before use
per-deck salvage
best-effort raw corrupt backup
best-effort active-key cleanup
safe empty/default state if read access is denied
user-visible boot/write warnings
no false saved-achievement claim
```

Not implemented:

```text
in-app backup browser
restore button
backup merge
cloud backup
cross-device restore
guaranteed backup creation under quota/policy denial
```

The word “backup” must be qualified as best-effort local forensic
preservation. It is not a user backup product.

## Deploy / Rollback

Current status: **BLOCKED_ENVIRONMENT**.

Missing:

```text
hosting provider
target URL
staging/production separation
deploy job/script
provider credentials/secret store
immutable artifact retention
health endpoint/contract
actual rollback target
incident owner/on-call expectation
```

Canonical procedure:
`docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md`.

Until executed:

```text
vite preview != deploy
git checkout != artifact rollback
git revert != immediate production rollback
local cache rehearsal != CDN/browser cache proof
```

## Observability

### Current local evidence

```text
build/typecheck/test command logs
Playwright step/result JSON
pageerror capture
console error capture
unhandled rejection capture
failed request/asset checks
cycle/dead-end/corruption counters
Chromium memory/timer/listener/DOM metrics where authoritative
screenshots and redacted summaries
```

This is test observability, not always-on production telemetry.

### Current production telemetry

```text
remote error collection: none
remote analytics: none
session replay: none
distributed tracing: none
central log service: none
```

This is consistent with current local-first/no-account scope. Do not add
remote collection without product and privacy decisions.

### Telemetry future trigger

Any remote telemetry proposal requires:

```text
explicit purpose and owner
minimal event schema
no deck JSON/content or personal data
consent and disclosure
retention/deletion policy
sampling and cost caps
offline/failure behavior
security review
```

## Metrics Authority

Every metric records its authority and scope.

Allowed examples:

```text
unit test count and result
build exit/artifact hash
flow completion count
page/console/rejection error count
soak cycles and duration
Chromium CDP memory metrics
```

Rules:

```text
not measured = null/not_available
never convert missing values to 0
never rank browsers using incomparable metrics
state dev server vs production preview vs deployed artifact
state commit SHA and browser/device version
```

## Tracing

Distributed tracing is not applicable because there is no service graph.
Current equivalent for debugging is deterministic action/state evidence:

```text
seed
matchSessionId
flow step sequence
browser/version/SHA
error sample and timestamp
artifact/evidence hash where relevant
```

If backend/API features appear, introduce trace IDs across client and
service boundaries before production release, with privacy-safe fields.

## Rate Limits / Abuse Controls

No server endpoint exists, so HTTP/user/account rate limiting is not
applicable.

Current local resource controls:

```text
import byte limit
JSON depth limit
strict unsafe-key scan
candidate/partition/wildcard branch caps
skin byte/dimension/file-type limits
record history caps
recent match key cap
```

Future trigger: uploads, sync, multiplayer, login, telemetry, marketplace,
or any API. Then define:

```text
rate-limit identity/IP/device key
burst and sustained limits
per-operation cost weights
retry-after behavior
abuse and enumeration controls
storage/bandwidth quotas
alert thresholds
```

## Load / Stress / Soak

### Current applicable tests

```text
adversarial custom deck fixtures
candidate explosion caps
large unsafe import rejection before deep analysis
visual matrix across five sizes
Batch 9 long Chromium dev-server soak
Batch 10 production-preview Chromium soak
Batch 11 planned production Firefox/WebKit stability rotation
```

### Not applicable yet

```text
requests per second
concurrent users
DB connection pools
queue depth
API latency percentiles
server autoscaling
```

Physical-device performance remains open evidence.

## Chaos / Fault Injection

Current deterministic fault injection:

```text
corrupt JSON
invalid outer/inner storage shape
unknown/newer schema
quota/write failure
storage read denial
backup write failure
active-key removal failure
skin manifest/token/asset load failure
stale skin request race
```

Do not label these as full production chaos engineering. Future
network/backend architecture must add controlled tests for timeout,
partial response, offline, retry storm, stale cache, dependency outage,
restore failure, and degraded mode.

## Version Compatibility

Current compatibility dimensions:

```text
shared deck schema version
localStorage payload version
skin contract version
skin package version
content/versioned asset URL
application commit/artifact SHA
```

Before any version change:

```text
update schema and migration docs
add old/new/newer fixtures
verify forward read/migration
verify intended rollback artifact against newly written data
verify export/import round trip
verify both official skins and fallback
record exact SHA and artifact hashes
```

Unknown newer versions fail closed; do not “best effort” parse them.

## Incident Response

Current runbooks:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/release/SOAK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
```

Before real deploy, add environment-specific ownership:

```text
release operator
rollback decision owner
credential owner
incident severity definitions
communication channel
artifact retention duration
post-incident evidence and review
```

## Current Closure Order

```text
1. exact-current-SHA install/typecheck/test/skin validation/build
2. resolve any code/test/harness failures
3. Batch 11 production Firefox/WebKit execution
4. evidence/report/document synchronization
5. owner selects hosting/provider and staging/production model
6. staging deploy + rollback rehearsal
7. production deploy + rollback verification
8. physical-device and real-AT evidence when environments exist
```

Do not add backend-grade systems before their trigger, and do not claim
production operations readiness before actual deployment evidence exists.
