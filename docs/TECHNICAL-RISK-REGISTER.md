# Technical Risk Register

## Purpose

Track current product/release risks after the gameplay/skin implementation,
Batches 5-10, the post-Batch-10 integrity reviews, the supply-chain review,
and the residual-closure pass.

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
Post-Batch-10 fixes and residual code closures: committed
Targeted integrity definitions: 92 committed, unexecuted on final SHA
Integrity workflow: defined for 28 files, result unobserved
Python asset CI: defined with exact top-level pins + pip check, result unobserved
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
| R12 | export object URL leak/browser fragility | MITIGATED | attached anchor + finally cleanup + deferred revoke; Batch 11 open |
| R13 | UI reimplements rules | CLOSED | architecture boundary/tests |
| R14 | preview selection mutates match state | CLOSED | pure preview/reducer mutation |
| R15 | CPU cheats or is nondeterministic | CLOSED | shared facts/seeded tie-break |
| R16 | technically valid custom deck is impossible/trivial/noisy | MITIGATED | feasibility/balance/adversarial checks |
| R17 | localized message drift breaks support/tests | MITIGATED | stable codes/state assertions |
| R18 | docs diverge from code/evidence | MITIGATED | canonical hierarchy and successor review reports |
| R19 | no CI gate | MITIGATED | main CI + Integrity Contracts + Python asset job; results unobserved |
| R20 | browser/landscape divergence | BLOCKED_EVIDENCE | Batch 11 and physical devices open |
| R21 | accessibility retrofit gaps | MITIGATED | shared semantics, danger focus, descriptions, partial VoiceOver evidence |
| R22 | full localization layer absent | OPEN | code-based messages remain Japanese; non-MVP |
| R23 | undo/replay impossible later | MITIGATED | action/idempotency groundwork; feature absent |
| R24 | extended mode half-works | CLOSED | pending variant blocked |
| R25 | dependency creep/supply-chain drift | MITIGATED | lockfile, exact Python top-level pins, immutable CI action refs, Dependabot, policy |
| R26 | read denial interpreted as empty Store during mutation | MITIGATED | all mutations/exports fail closed |
| R27 | match record/rewards partially persist | MITIGATED | atomic validated `commitMatch()` |
| R28 | app writes beyond its own persisted schema | MITIGATED | shared limits + final parse |
| R29 | old/partial payload is fully wiped | MITIGATED | deck metadata/body salvage and current-records partial salvage |
| R30 | same-ID import silently destroys a deck | MITIGATED | explicit unchanged-state overwrite review |
| R31 | stale UI overwrites/deletes another tab’s newer deck | MITIGATED | Store fingerprint guard + UI conflict checks |
| R32 | same-ms/multi-tab new-deck ID collision | MITIGATED | UUID/collision suffix |
| R33 | duplicate nested IDs/memberships create ambiguity | MITIGATED | V3010/V3013 multi-layer enforcement |
| R34 | engine-ignored group fields or contradictory bonus cap persist | MITIGATED | R4011/B6010 |
| R35 | reset leaves forensic data or claims false success | MITIGATED | all keys, failure list, no reload on partial failure, export-before-reset guidance |
| R36 | true simultaneous multi-tab writes race after preflight | OPEN | localStorage has no atomic CAS; revision/transaction model required if advertised |
| R37 | Editor live panel omits production-boundary integrity issues | MITIGATED | live panel now uses `validateDeckForUse`; save/play/import remain independent gates |
| R38 | forensic backup has no safe user recovery path | MITIGATED | raw, versioned backup bundle export exists; automatic restore/merge intentionally absent |
| R39 | current product SHA lacks authoritative command/CI evidence | OPEN | freeze SHA and run all Node/Python/integrity/typecheck/test/skin/build checks |
| R40 | production Firefox/WebKit after integrity changes | OPEN | execute Batch 11 on same artifact |
| R41 | real devices/real AT combinations | BLOCKED_EVIDENCE | physical iOS/Android, Safari+VO, NVDA/JAWS |
| R42 | real deployment/immutable rollback | BLOCKED_EVIDENCE | no provider/credentials/history |
| R43 | server abuse/rate controls absent | NOT_APPLICABLE | reopen for API/login/sync/upload/telemetry/marketplace |
| R44 | distributed tracing/server metrics absent | NOT_APPLICABLE | no distributed request path |
| R45 | Python dependency environment not hash-locked | OPEN | exact top-level pins + `pip check`; transitive wheels/hashes remain open |
| R46 | GitHub Actions execute mutable action tags | MITIGATED | current CI/Integrity actions pinned to verified 40-character release commit SHAs |
| R47 | external skin elevates trust by self-declaring `origin: official` | MITIGATED | loader-owned expected origin is mandatory at runtime; signature/entitlement installer remains future Gate 7 work |
| R48 | MatchSession remount identity collides through bounded numeric seed | MITIGATED | React key now uses collision-resistant `matchSessionId`; seed remains gameplay input only |
| R49 | over-limit set-like records arrays lose later unique values | MITIGATED | role/achievement/recent-key arrays dedupe before retention caps |
| R50 | CSP/security headers depend on unknown hosting target | BLOCKED_EVIDENCE | define at provider/deploy stage; current HTML has no intentional remote runtime resources |
| R51 | recovery export claims success after browser download failure | MITIGATED | file creation is guarded; failure is reported and source backup remains untouched |

## Highest Current Priorities

```text
P1 evidence closure:
  R39 exact-current-SHA Node/Python/integrity/typecheck/test/skin/build
  R40 Batch 11 production Firefox/WebKit

P2 product/architecture follow-up only when scope requires it:
  R36 transactional persistence if concurrent editing is advertised
  R38 strict restore/merge only after a conflict-safe design
  R47 signatures/entitlements only with an external installer/marketplace
  R45 generated Python hash constraints during an active asset-production phase

Owner/environment dependent:
  R41 real devices/AT
  R42 deploy/rollback
  R50 hosting security headers
```

## Exact-SHA Acceptance

One frozen SHA must demonstrate:

```text
frozen pnpm install
pinned Python 3.13 asset install + pip check + fixture job
all 92 review-added definitions collected and passing
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
raw forensic export != validated automatic restore
exact Python pin + pip check != hash-locked supply chain
manifest origin string != trusted installer identity
loader-owned origin classification != package signature/entitlement
```

## Final Decision

The codebase is materially safer than the Batch 10 artifact, and the known
code-side residuals that could be closed without inventing deployment or
transaction infrastructure have been addressed. The newest HEAD is still not a
verified release artifact. Keep RC `LIMITED READY`, run the exact-SHA
Node/Python/integrity sequence, then Batch 11 before feature or asset work
resumes.
