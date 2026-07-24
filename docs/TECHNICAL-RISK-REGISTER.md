# Technical Risk Register

## Purpose

Track the current product/release risks after implementation, skin
hardening, Batches 5-10, and the two post-Batch-10 integrity reviews.

Historical “ready to start domain/schema/engine implementation” language is
obsolete.

Status values:

```text
CLOSED             implemented and previously verified in its recorded scope
MITIGATED          implementation/tests exist; final exact-SHA verification pending
OPEN               real product/architecture work remains
BLOCKED_EVIDENCE   implementation may be adequate but required environment/evidence is unavailable
NOT_APPLICABLE     current architecture has no such surface; reopen if scope changes
```

## Current Verdict — 2026-07-24

```text
Product architecture: mature local-first MVP
RC status: LIMITED READY
Post-Batch-10 integrity fixes: committed
Review-added integrity tests: 38 committed, unexecuted on final SHA
Batch 11 production Firefox/WebKit: contract defined, not executed
```

## Risk Table

| ID | Risk | Status | Current control / remaining action |
|---|---|---|---|
| R1 | RNG/CPU behavior not reproducible | CLOSED | seeded RNG and deterministic tests |
| R2 | unstable runtime tile IDs | CLOSED | centralized deterministic tile-instance generation |
| R3 | import over-rejects future fields | MITIGATED | strict MVP policy; any future field needs version/security review |
| R4 | deeply nested unsafe import passes | CLOSED | recursive depth/unsafe-key scan before strict schema parse |
| R5 | schema and domain drift | MITIGATED | golden fixture tests plus final write-boundary runtime schemas; exact-SHA run pending |
| R6 | group/wildcard candidate explosion | CLOSED | structural caps and explicit warnings |
| R7 | candidate ranking instability | CLOSED | deterministic rank/tie-break tests |
| R8 | wait context mixed between draw/discard/ron | CLOSED | explicit context and tests |
| R9 | result score not reconstructable | CLOSED | selected role + breakdown contracts/tests |
| R10 | corrupt localStorage breaks boot | MITIGATED | guarded read/backup/remove/writeback and boot warnings; final exact-SHA run pending |
| R11 | storage quota/write failure loses draft silently | MITIGATED | translated `StorageWriteError`, success-side effects skipped, UI tests committed |
| R12 | object URL leak/browser-fragile export | MITIGATED | attached temporary anchor and deferred revoke; Firefox/WebKit Batch 11 pending |
| R13 | UI reimplements game rules | CLOSED | architecture boundaries and tests |
| R14 | preview/selection mutates match state | CLOSED | pure preview and reducer-owned mutation |
| R15 | CPU uses hidden information or nondeterminism | CLOSED | shared facts and seeded tie-break |
| R16 | valid custom deck is impossible/trivial/noisy | MITIGATED | feasibility/balance warnings and adversarial fixtures |
| R17 | error-message copy drift breaks tests | MITIGATED | stable codes, state assertions, no code reuse collisions |
| R18 | docs diverge from code/evidence | MITIGATED | entry docs/report hierarchy rebuilt; exact-SHA report still pending |
| R19 | no CI gate | MITIGATED | frozen install + named integrity suite + typecheck/unit/skin/build; current run unobserved |
| R20 | browser/landscape differences | BLOCKED_EVIDENCE | automated engine coverage exists; physical device evidence remains open |
| R21 | accessibility bolted on late | MITIGATED | shared semantics/DOM tests and partial real VoiceOver evidence; real AT gaps remain |
| R22 | localization coupled to copy | OPEN | codes exist, but full message localization layer is not built; non-MVP |
| R23 | undo/replay impossible later | MITIGATED | action/reducer/idempotency groundwork; restore/replay remains non-MVP |
| R24 | extended mode half-works | CLOSED | pending variant blocked from play |
| R25 | dependency creep | MITIGATED | fixed stack and ADR/dependency policy |
| R26 | read denial interpreted as empty Store during mutation | MITIGATED | deck/records/settings mutation and export fail closed; exact-SHA tests pending |
| R27 | match record and achievements partially persist | MITIGATED | one validated atomic `commitMatch()` write; exact-SHA tests pending |
| R28 | app writes more entries than its own schema accepts | MITIGATED | shared 200/100/500/100/20 limits and write-boundary parse |
| R29 | old over-limit payload is wiped during upgrade | MITIGATED | raw backup + deterministic `L9007` bounded salvage |
| R30 | same-ID import silently destroys a saved deck | MITIGATED | separate irreversible overwrite review; input + saved-entry fingerprint |
| R31 | stale Editor/import state overwrites another tab’s deck | MITIGATED | optimistic StoredDeck fingerprint and stale draft unmount |
| R32 | same-ms/multi-tab deck creation ID collision | MITIGATED | UUID-based ID + existing-ID collision suffix |
| R33 | duplicate variant/role/bonus IDs create ambiguous records | MITIGATED | import/UI/Store/start multi-layer `V3010` enforcement |
| R34 | internal runtime bug persists schema-invalid payload | MITIGATED | strict parse immediately before every Store write |
| R35 | local reset leaves forensic data or claims false success | MITIGATED | all known keys + returned failure list + no reload on partial failure |
| R36 | true simultaneous multi-tab writes race after preflight check | OPEN | localStorage has no synchronous CAS; requires persisted revision/transaction model if concurrency is advertised |
| R37 | Editor live validation panel omits cross-variant ID issue | OPEN | save/play boundaries reject it; integrate `validateDeckForUse` into Editor UX as a P3 refinement |
| R38 | corrupt-backup exists but user cannot restore it in-app | OPEN | forensic raw backup only; restore UI needs strict parse/migration/limits/conflict design |
| R39 | current product SHA lacks authoritative command/CI evidence | OPEN | freeze SHA and execute named integrity/typecheck/full tests/skin/build |
| R40 | production Firefox/WebKit behavior after integrity changes | OPEN | execute complete Batch 11 matrix on same artifact |
| R41 | real devices and real screen-reader combinations | BLOCKED_EVIDENCE | physical iPhone/iPad/Android, Safari+VoiceOver, NVDA/JAWS remain open |
| R42 | real deploy and immutable-artifact rollback | BLOCKED_EVIDENCE | no hosting target/credentials/deployment history |
| R43 | server abuse/traffic controls absent | NOT_APPLICABLE | no backend/API; reopen for login/sync/multiplayer/uploads/telemetry/marketplace |
| R44 | distributed tracing/server metrics absent | NOT_APPLICABLE | no backend or distributed request path |

## Highest Current Priorities

```text
P0/P1 product bug known open: none claimed from static review
P1 evidence closure:
  R39 exact-current-SHA install/integrity/typecheck/test/skin/build
  R40 Batch 11 production Firefox/WebKit

P2/P3 product follow-up:
  R36 true versioned transaction model only if concurrent multi-tab editing is advertised
  R37 Editor live validation-panel integration
  R38 user-facing safe restore

Environment/owner dependent:
  R41 real devices/real AT
  R42 real deploy/rollback
```

## Integrity Acceptance Criteria

The following must be demonstrated on one exact SHA before the review is
closed:

```text
read-denied Stores do not mutate/export assumed empty state
match record/rewards use one all-or-nothing write
deck and records collection limits cannot self-corrupt the next boot
old over-limit payloads are backed up and partially salvaged
write-boundary schemas reject runtime-invalid values
nested variant/role/bonus ID ambiguity is rejected
same-ID overwrite and stale external changes require current confirmation
stale Editor drafts cannot be saved after detected conflict
reset covers all known active/forensic keys and reports partial failure
all 38 review-added tests are collected and pass
production build succeeds
Batch 11 runs against that exact artifact
```

## Evidence Discipline

```text
committed test != passing test
successful push != GitHub Actions success
no returned workflow status != green
local preview != deployment
Playwright WebKit != Safari
optimistic fingerprint != transaction
best-effort backup != restore feature
```

## Final Decision

The codebase is materially safer than the Batch 10 artifact, but the newer
HEAD is not a verified release artifact yet. Keep RC `LIMITED READY`, execute
the exact-SHA verification sequence, then run Batch 11 before resuming
feature or asset work.
