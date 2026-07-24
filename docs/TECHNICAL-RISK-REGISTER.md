# Technical Risk Register

## Purpose

Track current product/release risks after the gameplay/skin implementation,
Batches 5-10, and all three post-Batch-10 integrity reviews plus the
supply-chain review.

Status:

```text
CLOSED             implemented and verified in a recorded historical scope
MITIGATED          implementation/tests exist; exact-current-SHA evidence open
OPEN               product/architecture work remains
BLOCKED_EVIDENCE   required environment/owner/evidence unavailable
NOT_APPLICABLE     no current architecture surface; reopen when scope changes
```

## Current Verdict — 2026-07-25

```text
Architecture: mature local-first MVP
RC: LIMITED READY
Post-Batch-10 fixes: committed
Targeted integrity definitions: 79 committed, unexecuted on final SHA
Integrity workflow: defined for 23 files, result unobserved
Python asset CI: defined, result unobserved
Batch 11: contract defined, not executed
```

## Risk Table

| ID | Risk | Status | Current control / remaining action |
|---|---|---|---|
| R1 | RNG/CPU behavior not reproducible | CLOSED | seeded RNG and deterministic tests |
| R2 | unstable tile-instance IDs | CLOSED | centralized deterministic generation |
| R3 | import over-rejects future fields | MITIGATED | strict MVP policy; future fields require version/security review |
| R4 | deep/adversarial unsafe import passes or exhausts diagnostics | MITIGATED | recursive scan, depth/byte limits, 49-detail diagnostic cap |
| R5 | schema/domain drift | MITIGATED | golden fixtures, final write schemas, integrity validators |
| R6 | group/wildcard candidate explosion | CLOSED | structural caps and warnings |
| R7 | candidate ordering instability | CLOSED | deterministic ranking/tie-break |
| R8 | draw/discard/ron wait context mix-up | CLOSED | explicit contexts/tests |
| R9 | score cannot be reconstructed | CLOSED | role + breakdown contract/tests |
| R10 | corrupt storage breaks boot | MITIGATED | guarded cleanup, metadata/entry/records partial salvage |
| R11 | quota/write failure silently loses draft | MITIGATED | translated typed errors; success side effects skipped |
| R12 | export object URL leak/browser fragility | MITIGATED | attached anchor + deferred revoke; Batch 11 open |
| R13 | UI reimplements rules | CLOSED | architecture boundary/tests |
| R14 | preview selection mutates match state | CLOSED | pure preview/reducer mutation |
| R15 | CPU cheats or is nondeterministic | CLOSED | shared facts/seeded tie-break |
| R16 | technically valid custom deck is impossible/trivial/noisy | MITIGATED | feasibility/balance/adversarial checks |
| R17 | localized message drift breaks support/tests | MITIGATED | stable codes/state assertions |
| R18 | docs diverge from code/evidence | MITIGATED | canonical hierarchy and three review reports |
| R19 | no CI gate | MITIGATED | main CI + Integrity Contracts + Python asset job; results unobserved |
| R20 | browser/landscape divergence | BLOCKED_EVIDENCE | Batch 11 and physical devices open |
| R21 | accessibility retrofit gaps | MITIGATED | shared semantics, danger focus, descriptions, partial VoiceOver evidence |
| R22 | full localization layer absent | OPEN | code-based messages remain Japanese; non-MVP |
| R23 | undo/replay impossible later | MITIGATED | action/idempotency groundwork; feature absent |
| R24 | extended mode half-works | CLOSED | pending variant blocked |
| R25 | dependency creep/supply-chain drift | MITIGATED | lockfile, exact Python top-level pins, Dependabot, policy |
| R26 | read denial interpreted as empty Store during mutation | MITIGATED | all mutations/exports fail closed |
| R27 | match record/rewards partially persist | MITIGATED | atomic validated `commitMatch()` |
| R28 | app writes beyond its own persisted schema | MITIGATED | shared limits + final parse |
| R29 | old/partial payload is fully wiped | MITIGATED | deck metadata/body salvage and current-records partial salvage |
| R30 | same-ID import silently destroys a deck | MITIGATED | explicit unchanged-state overwrite review |
| R31 | stale UI overwrites/deletes another tab’s newer deck | MITIGATED | Store fingerprint guard + UI conflict checks |
| R32 | same-ms/multi-tab new-deck ID collision | MITIGATED | UUID/collision suffix |
| R33 | duplicate nested IDs/memberships create ambiguity | MITIGATED | V3010/V3013 multi-layer enforcement |
| R34 | engine-ignored group fields or contradictory bonus cap persist | MITIGATED | R4011/B6010 |
| R35 | reset leaves forensic data or claims false success | MITIGATED | all keys, failure list, no reload on partial failure |
| R36 | true simultaneous multi-tab writes race after preflight | OPEN | localStorage has no atomic CAS; revision/transaction model required if advertised |
| R37 | Editor live panel may omit some cross-variant integrity issues | OPEN | save/play/import reject; integrate unified validation into live UX |
| R38 | forensic backup has no user restore | OPEN | strict restore/merge/conflict design required |
| R39 | current product SHA lacks authoritative command/CI evidence | OPEN | freeze SHA and run all Node/Python/integrity/build checks |
| R40 | production Firefox/WebKit after integrity changes | OPEN | execute Batch 11 on same artifact |
| R41 | real devices/real AT combinations | BLOCKED_EVIDENCE | physical iOS/Android, Safari+VO, NVDA/JAWS |
| R42 | real deployment/immutable rollback | BLOCKED_EVIDENCE | no provider/credentials/history |
| R43 | server abuse/rate controls absent | NOT_APPLICABLE | reopen for API/login/sync/upload/telemetry/marketplace |
| R44 | distributed tracing/server metrics absent | NOT_APPLICABLE | no distributed request path |
| R45 | Python dependency environment not hash-locked | OPEN | exact top-level pins + CI; transitive wheels/hashes remain open |
| R46 | GitHub Actions use mutable major tags | OPEN | read-only permissions; verify/pin immutable SHAs before broader trust exposure |
| R47 | external skin can self-declare `origin: official` if a future installer trusts manifest text | OPEN | installer-owned trust/signature binding required; Gate 7 remains open |
| R48 | MatchSession React remount key uses bounded numeric seed | OPEN | replace component key with collision-resistant `matchSessionId` on a frozen AppRoot baseline |
| R49 | over-limit set-like records arrays are trimmed before dedupe | OPEN | minor legacy-salvage edge: dedupe before cap to preserve later unique entries |
| R50 | CSP/security headers depend on unknown hosting target | BLOCKED_EVIDENCE | define at provider/deploy stage; current HTML has no intentional remote runtime resources |

## Highest Current Priorities

```text
P1 evidence closure:
  R39 exact-current-SHA Node/Python/integrity/typecheck/test/skin/build
  R40 Batch 11 production Firefox/WebKit

P2 product/architecture follow-up:
  R36 true transaction/revision only if concurrent editing is advertised
  R38 safe user restore
  R47 installer-owned external skin trust
  R48 MatchSession key -> matchSessionId

P3 hardening:
  R37 unified Editor live validation
  R45 Python hash lock
  R46 immutable action SHA pinning
  R49 dedupe-before-cap legacy normalization

Owner/environment dependent:
  R41 real devices/AT
  R42 deploy/rollback
  R50 hosting security headers
```

## Exact-SHA Acceptance

One frozen SHA must demonstrate:

```text
frozen pnpm install
pinned Python 3.13 asset install/fixture job
all 79 review-added definitions collected and passing
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build + artifact inventory/hash
no modified worktree after verification
Batch 11 on that same production artifact
```

Any code/test/dependency/workflow change invalidates partial evidence.

## Evidence Discipline

```text
committed test/workflow != passing test/workflow
successful push != Actions success
missing status != green
historical artifact PASS != current artifact PASS
local preview != deploy
Playwright WebKit != Safari
optimistic fingerprint != transaction
best-effort backup != restore
exact Python pin != hash-locked supply chain
manifest origin string != trusted installer identity
```

## Final Decision

The codebase is materially safer than the Batch 10 artifact, but the newest
HEAD is not a verified release artifact. Keep RC `LIMITED READY`, run the
exact-SHA Node/Python/integrity sequence, then Batch 11 before feature or asset
work resumes.
