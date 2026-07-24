# Technical Risk Register

## Purpose

This register tracks risks that can still break the current product or
invalidate a release claim. It is not an implementation backlog and must
not describe completed MVP foundations as future work.

Status vocabulary:

```text
CLOSED
  implementation and representative automated evidence exist

MITIGATED
  controls exist, but future changes can reopen the risk

OPEN
  executable work remains

BLOCKED_EVIDENCE
  product may work, but required target environment/evidence is unavailable

NOT_APPLICABLE_CURRENT_ARCHITECTURE
  no current subsystem exists for the risk; re-open if architecture changes
```

Release truth remains `docs/RELEASE-DEMO-GATES.md`. This document records
risk, mitigation, evidence, and reopen conditions.

## Current Verdict — 2026-07-24

```text
Gameplay/schema/engine/UI foundation risks: mostly CLOSED or MITIGATED
Storage recovery compound-failure risk: fixed, verification pending
Current exact-SHA CI-equivalent verification: OPEN
Batch 11 production Firefox/WebKit: OPEN
Physical-device / real-Safari / real-AT evidence: BLOCKED_EVIDENCE
Real deploy and deployed-artifact rollback: BLOCKED_EVIDENCE
Backend rate limit/distributed trace/server load: NOT_APPLICABLE_CURRENT_ARCHITECTURE
RC readiness: LIMITED READY
```

## R1 — Non-deterministic Engine Behavior

Status: **CLOSED / regression-sensitive**.

Controls:

```text
seedable RNG
seed stored in match state/session
stable CPU tie-breaking
no direct Math.random inside engine decisions
```

Reopen if shuffle, CPU, replay, or session-ID generation changes.

## R2 — Schema / Domain / Engine Drift

Status: **MITIGATED**.

Controls:

```text
strict Zod objects
shared typed domain contracts
animal-starter parse/validate/analyze golden coverage
newer schema reject
unknown fields reject
```

Reopen on any schema version, rule model, variant, or import change. Update
`MASTER-SPEC`, `MIGRATIONS`, fixtures, error codes, and compatibility tests
together.

## R3 — Unsafe Import / Prototype Pollution / Display Injection

Status: **MITIGATED**.

Controls:

```text
byte and depth limits before expensive analysis
recursive unsafe-key scan
strict schema parsing
image/URL/path/blob/html/style/script/code/function fields rejected
unknown fields rejected
```

Future URL/image sharing requires a schema version bump, security review,
explicit allowlist, migration policy, and new threat tests.

## R4 — Group/Wildcard Candidate Explosion

Status: **MITIGATED**.

Controls:

```text
candidate/partition/wildcard branch caps
natural groups prioritized
explicit capped warnings
adversarial fixtures
```

Open evidence: low-end physical-device timings remain unclaimed. Do not
replace structural caps with flaky CI wall-clock assertions.

## R5 — Result Score Cannot Be Reconstructed

Status: **CLOSED / regression-sensitive**.

Controls:

```text
selected role is explicit
ResultBreakdown is explicit
no hidden modifier
score tests reconstruct total from role + bonuses
```

Reopen on scoring or bonus changes.

## R6 — UI Reimplements Game Rules

Status: **MITIGATED**.

Boundary:

```text
UI renders engine outputs
engine owns canRon/canTsumo/waits/score/wildcard meaning
reducer owns gameplay mutation
preview remains pure
```

Reopen during review if rule logic appears under `src/ui` or React code.

## R7 — LocalStorage Corruption Breaks Boot

Status: **MITIGATED; fresh verification OPEN**.

The post-Batch-10 review found that normal writes were guarded but
corruption recovery used raw storage operations. Compound corruption plus
quota/storage denial could throw during recovery.

Current controls:

```text
all values strict-parse before use
deck partial salvage
known v0 -> v1 migration only
getItem denial -> L9005 + safe session fallback
backup creation and active-key removal guarded independently
records/settings corrupt raw backup attempted
AppRoot displays issues from all stores
six storage-operation failure-path unit tests
```

Open:

```text
run current exact-SHA test suite
real-browser storage-disabled scenario when target matrix is known
```

## R8 — False Success After Persistence Failure

Status: **MITIGATED; fresh verification OPEN**.

Previously possible:

```text
achievement write fails but Result reports it as newly unlocked
records/settings recover but warning is discarded
a missing route entity renders null indefinitely
```

Current controls:

```text
tryWrite returns false and blocks success-only follow-up
unpersisted achievements return [] to Result
all boot store issues reach warning Toast
missing deck/variant redirects to safe screen
starter boot write failure uses L9006
```

Reopen on any new persistence call site. Every write must define what UI
is allowed to claim after failure.

## R9 — Error-Code Collision / Semantic Drift

Status: **MITIGATED**.

The review caught an attempted collision: `L9004` already means local
image fallback and could not also mean storage read denial.

Controls:

```text
docs/ERROR-CODES.md is canonical
L9005 = storage read unavailable
L9006 = bootstrap/default persistence failure
tests assert codes for storage faults
```

Reopen whenever a new issue code is introduced. Search implementation,
tests, and docs before assignment.

## R10 — Object URL / Export Lifecycle

Status: **MITIGATED; Batch 11 evidence OPEN**.

Controls:

```text
Blob URL is temporary and never persisted
export anchor is attached before click
anchor is removed after click
URL revocation is deferred
```

Batch 11 Firefox/WebKit production flow must verify actual export behavior.
Future local-image previews need dedicated lifecycle tests.

## R11 — Skin Package Can Blank, Mix, or Execute Unsafe Content

Status: **MITIGATED**.

Controls:

```text
typed token allowlist
filesystem/package validation
no arbitrary CSS/JS/HTML/external URLs/fonts
external SVG blocked by default
versioned asset URLs
required-asset preload
atomic apply or previous skin retained
stale request cannot replace newer selection
base/bundled fallback
```

Reopen for external package installation, marketplace delivery, or new
render modes/file types.

## R12 — Cross-Browser Landscape / Download / Storage Differences

Status: **OPEN**.

Historical evidence exists, but current product code changed after Batch
10. Batch 11 must validate production Firefox and Playwright WebKit at one
exact current SHA.

Limits:

```text
Playwright WebKit is not Safari
no result generalizes to physical mobile devices
no memory comparison across engines without equivalent authority
```

## R13 — Accessibility Evidence Is Overgeneralized

Status: **BLOCKED_EVIDENCE / partially mitigated**.

Established:

```text
DOM semantics/component tests
keyboard/focus behavior
real VoiceOver + Chrome within Batch 8 recorded scope
```

Open:

```text
Safari + VoiceOver
NVDA / JAWS
Batch 8 Result static-text spoken capture
Cute Pop Result under real VoiceOver
physical mobile assistive-technology behavior
```

Do not call automated AX inspection a real screen-reader pass.

## R14 — Memory / Timer / Listener Leak

Status: **MITIGATED for recorded Chromium scopes; future changes reopen**.

Historical controls/evidence:

```text
Batch 9 extended Chromium soak
Batch 10 production-preview Chromium soak
error/timer/listener/DOM/heap evidence with authority labels
```

Rules:

```text
unavailable metric = null/not_available, never 0
Firefox/WebKit stability runs make no memory claim
new long-lived timers/listeners/effects require cleanup review
```

## R15 — Performance Targets Exist Without Target-Device Proof

Status: **OPEN / scope-limited**.

Structural caps and desktop automation exist. Physical low-end/common
phone performance remains unverified. Keep RC LIMITED READY and avoid
“60fps supported” claims until device evidence exists.

## R16 — CI Evidence Missing or Detached From Current SHA

Status: **OPEN**.

Current connector-visible HEAD has no workflow run/status available.
A push is not CI success.

Required closure:

```text
freeze clean HEAD == origin/main
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
record GitHub Actions run or explicitly unavailable
```

Any code change invalidates previous exact-SHA verification.

## R17 — Direct Main Commit Series Is Hard to Review/Roll Back

Status: **OPEN governance risk**.

The current solo workflow permits small direct commits, but a long chain
of code + docs commits increases partial-state and rollback complexity.

Mitigation for future deep batches:

```text
use one dedicated branch
one commit per coherent purpose
run verification before merge
open a draft PR for consolidated review where connector/tooling allows
avoid interleaving unrelated product and documentation changes
```

Do not rewrite current history merely to make it prettier; verify and
record the exact final SHA instead.

## R18 — Migration / Backward Compatibility Drift

Status: **MITIGATED; current rerun OPEN**.

Controls:

```text
shared deck current strict parse
known v0 -> v1 deterministic migration
missing/newer/ambiguous version reject
localStorage v1 payload schemas
skin contract and versioned assets
rollback compatibility rehearsal exists historically
```

Reopen on any write-format change. New builds must read old data, and a
rollback target must be tested against data written by the newer build.

## R19 — Backup Exists but Restore Does Not

Status: **OPEN product limitation**.

Current `*.corrupt-backup` keys preserve raw forensic payload only when
storage permits. There is no in-app restore, merge, cloud backup, or
cross-device recovery.

This is acceptable for current scope only if copy and release docs remain
truthful. A restore UI must strict-parse/migrate and never blindly replace
active storage.

## R20 — Real Deployment / Artifact Rollback Is Undefined in Practice

Status: **BLOCKED_EVIDENCE**.

The repository has no selected hosting provider, deployment target,
deploy job, immutable artifact retention contract, or production URL.
Local `vite preview` is not deployment, and git checkout is not artifact
rollback.

Closure requires owner-selected infrastructure and execution of
`docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md` on staging and production.

## R21 — Remote Observability Could Violate Local-First Scope

Status: **NOT_APPLICABLE_CURRENT_ARCHITECTURE / design guard**.

No backend, accounts, or production telemetry pipeline exists. Do not add
remote user tracking merely to satisfy an “observability” checklist.
Current evidence uses local harness logs, error/page/rejection capture,
and manually committed redacted summaries.

If remote telemetry is introduced, require:

```text
explicit product decision and privacy review
minimal event schema
no deck content or personal data
consent/retention/deletion rules
sampling and failure behavior
security and cost limits
```

## R22 — Server Rate Limit / Distributed Trace / Concurrent Load

Status: **NOT_APPLICABLE_CURRENT_ARCHITECTURE**.

There is no server/API. Current analogues are local resource guardrails:
import byte/depth limits, engine branch caps, skin byte/dimension budgets,
and soak testing.

Reopen immediately if accounts, sync, multiplayer, uploads, telemetry, or
any network API is added. Then define authentication, authorization,
rate-limit keys, abuse controls, distributed tracing, capacity/load tests,
and incident response before release.

## R23 — Chaos / Fault Injection Coverage Is Too Narrow

Status: **MITIGATED locally; OPEN for future architecture**.

Current fault injection covers storage quota/read/remove failures, corrupt
payloads, migration cases, and skin load/preload failure. This is
appropriate for a local frontend.

Future network/backend features require separate timeout, retry,
partial-response, offline, stale-cache, dependency outage, and restore
tests. Do not run uncontrolled chaos against production.

## R24 — Documentation Becomes a Second, Contradictory Product

Status: **MITIGATED; continuously open**.

The review found stale entry docs that still instructed agents to start
H1 or asset Batch 5. Entry docs were rewritten around canonical roles.

Controls:

```text
MASTER-SPEC = product/rule truth
RELEASE-DEMO-GATES = readiness truth
latest Batch matrix/report = exact evidence scope
IMPLEMENTATION-WORKFLOW = next executable sequence
historical docs cannot override current truth
```

Every release batch includes a contradiction search and updates all entry
documents only after evidence exists.

## Final Priority

Current order:

```text
1. exact-current-SHA typecheck/test/skin validation/build
2. resolve any product or harness failure
3. Batch 11 production Firefox/WebKit execution
4. evidence/report and documentation synchronization
5. owner decision on hosting before deploy/rollback work
6. physical-device and real-AT evidence when environments are available
```

Do not start new features or asset generation to avoid these closure tasks.
