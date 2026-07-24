# Soro-pon Implementation Workflow

## Purpose

Compact operational view of completed foundations, current release state,
and the next executable work. Detailed history lives in evidence-backed
Batch/review reports, not duplicated here.

```text
Product/rule truth:          docs/MASTER-SPEC.md
Release/readiness truth:     docs/RELEASE-DEMO-GATES.md
Integrity review:            docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
Current executable QA:       docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
Storage contract:            docs/release/STORAGE-RECOVERY-POLICY.md
Migration contract:          docs/MIGRATIONS.md
Operations applicability:    docs/OPERATIONS-READINESS.md
Risk status:                 docs/TECHNICAL-RISK-REGISTER.md
```

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official finals: 18 total
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Asset Batches 1-4: closed
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, not executed
Post-Batch-10 integrity fixes: committed; exact-SHA verification pending
```

Current phase: **RC integrity/evidence closure**. Do not restart MVP,
H1-H11, or asset Batch 5 from obsolete instructions.

## Completed Foundations

```text
strict deck schemas/import/validation
role/wait/scoring/wildcard engine
seeded reducer/CPU/playable 3p+4p flow
Deck Editor / Collection / achievements / records
multi-skin shared UI and H1-H11 hardening
candidate -> review -> final asset pipeline
18 official final assets
```

Restore/replay and marketplace/payment are future products, not implied by
foundation work.

## Integrity Review Result

Fixed code/contract defects:

```text
recovery cleanup could throw after corrupt storage
records/settings corrupt raw backup absent
records/settings recovery warnings discarded
unpersisted achievement shown as unlocked
missing deck/variant blank route
silent legacy v0 migration persistence
browser-fragile export Blob URL lifecycle
storage error-code collision risk
reset omitted records/settings corrupt backups
partial reset failure presented as success
stale Batch 11 baseline and entry/risk/performance docs
```

Current behavior:

```text
read denial -> L9005 + safe session fallback
starter bootstrap persistence failure -> L9006
backup/cleanup independently best-effort
all store boot issues visible
false saved reward/achievement claims blocked
missing route entity returns to safe screen
legacy migration needs visible review + unchanged second action
export anchor attached; URL revoke deferred
reset covers active/backup/skin keys and reports partial failure
```

New tests committed: **12**.

```text
6 storage operation-failure tests
3 AppRoot persistence/migration tests
3 reset completeness/result tests
```

They are not yet authoritative evidence until executed on the exact final
SHA.

## Next Executable Work

```text
1. Confirm clean worktree and HEAD == origin/main.
2. Record exact SHA and Node/pnpm/Playwright/browser versions.
3. pnpm install --frozen-lockfile
4. pnpm exec vitest run src/storage/storageRecoveryFailurePaths.test.ts
5. pnpm typecheck
6. pnpm test
7. Confirm all 12 review-added tests are collected and pass.
8. pnpm skin:validate
9. pnpm build and record artifact inventory/hash.
10. Fix any failure; if code changes, restart from step 1.
11. Execute all Batch 11 production Firefox/WebKit items on the same SHA.
12. Commit evidence/report and only then update Batch 11 status.
```

Batch 11 cannot itself promote RC to READY. Real devices, real Safari,
remaining real AT, and real deploy/rollback remain separate evidence.

## CI / Browser Boundaries

Default GitHub CI runs:

```text
frozen install
named storage recovery regression
strict typecheck
full unit suite
skin validation
production build
```

Visual, cross-browser, soak, physical-device, real-AT, and deploy checks
are separate release gates. A successful push is not a CI PASS.

## UI / Skin Rules

```text
one shared screen/component/layout system
no skin-specific screen copies
layout/hit areas/focus/z-index/game meaning are skin-invariant
skins change typed allowlisted presentation values only
generic controls and render/slice behavior stay centralized
both official skins and fallback remain usable
```

Read the mandatory UI documents in `AGENTS.md` before UI work.

## Asset Rule

Batches 1-4 are closed. Start another asset batch only from an explicit
current task.

```text
generate -> generated/candidates -> review -> human approval
-> generated/final -> skin version bump -> verification
```

Never write generated output directly to final.

## Architecture / Operations Boundaries

```text
UI does not implement role/scoring/wildcard rules
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON contains no executable/image/URL injection fields
persisted values are parsed before use
recovery does not fail merely because cleanup failed
```

No backend/API exists. HTTP rate limiting, distributed tracing, and server
load tests are not applicable until login, sync, multiplayer, uploads,
telemetry, marketplace, or another network API is introduced.

## Release Claim Boundaries

```text
local production preview != deploy
Playwright WebKit != Safari
emulation/simulator != physical device
AX-tree automation != real screen reader
unavailable metric = null/not_available, never 0
old artifact PASS != current HEAD verification
best-effort corrupt backup != user-facing restore
```

## Known Open Scope

```text
exact-current-SHA verification
Batch 11 production Firefox/WebKit execution
physical iPhone Safari / iPad / Android
real hosting target and deployed-artifact rollback
Safari + VoiceOver
NVDA / JAWS
remaining Batch 8 Result/Cute Pop real-VoiceOver evidence
user-facing backup restore
match restore/replay/resend (non-MVP)
marketplace/payment/entitlement product (future)
```

## Work Rule

```text
small testable changes
one purpose per commit where tooling permits
implementation and contract docs together
never broaden historical evidence
report local verification separately from GitHub Actions
```
