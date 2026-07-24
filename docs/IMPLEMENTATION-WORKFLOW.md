# Soro-pon Implementation Workflow

## Purpose

Compact operational view of completed foundations, current release state,
and the next executable work. Detailed history lives in evidence-backed
Batch/review reports, not duplicated here.

```text
Product/rule truth:          docs/MASTER-SPEC.md
Release/readiness truth:     docs/RELEASE-DEMO-GATES.md
Initial integrity review:    docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
Continuation review:         docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
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
Review-added integrity tests: 38 committed, unexecuted
```

Current phase: **RC integrity/evidence closure**. Do not restart MVP,
H1-H11, asset Batch 5, or any obsolete implementation sequence.

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

Fixed code/contract defects now include:

```text
recovery cleanup could throw after corrupt storage
read denial could be misused as an empty Store for mutation
records/settings corrupt raw backup or warning gaps
record/coin and match-achievement persistence was not atomic
app could write collections larger than its own read schema
old over-limit payloads lacked bounded upgrade recovery
same-ID import silently overwrote an existing deck
stale import/editor state could overwrite another tab's deck
new deck IDs could collide
variant/role/bonus duplicate-ID contract was incomplete
write paths lacked final runtime schema validation
unpersisted achievement could be shown as unlocked
missing deck/variant could leave a blank route
silent legacy v0 migration persistence
browser-fragile export Blob URL lifecycle
reset omitted backup keys or hid partial failure
stale Batch 11 baseline and entry/risk/performance docs
```

Current integrity behavior:

```text
read denial:
  L9005 session fallback for display
  every mutation/export fails closed

write boundary:
  strict payload parse immediately before setItem
  nested deck IDs checked before final persistence

match result:
  record + coins + role collection + match achievements in one write

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20
  legacy over-limit payload -> backup + bounded L9007 normalization

import:
  visible legacy migration review
  explicit same-ID overwrite review
  input and existing-entry fingerprint must remain unchanged

Editor:
  stale external update/delete rejects save and unmounts old draft

reset:
  active + forensic + skin keys covered
  partial failure stops reload and is shown
```

Targeted tests committed across both reviews: **38**. They are not
release evidence until executed on the exact final SHA.

## Next Executable Work

```text
1. Confirm clean worktree and HEAD == origin/main.
2. Record exact SHA and Node/pnpm/Playwright/browser versions.
3. pnpm install --frozen-lockfile
4. Run the named Critical integrity contracts suite.
5. pnpm typecheck
6. pnpm test
7. Confirm all 38 review-added tests are collected and pass.
8. pnpm skin:validate
9. pnpm build and record artifact inventory/hash.
10. Fix any failure; if code changes, restart from step 1.
11. Execute all Batch 11 production Firefox/WebKit items on the same SHA.
12. Commit evidence/report and only then update Batch 11 status.
```

Exact integrity command:

```bash
pnpm exec vitest run \
  src/storage/storageRecoveryFailurePaths.test.ts \
  src/storage/localStorageRecordsAtomicity.test.ts \
  src/storage/localStorageCapacity.test.ts \
  src/storage/storageWriteContract.test.ts \
  src/storage/resetLocalData.test.ts \
  src/app/runtimeIds.test.ts \
  src/app/AppRoot.persistence.test.tsx \
  src/engine/validation/validateDeckEntityIds.test.ts
```

Batch 11 cannot itself promote RC to READY. Real devices, real Safari,
remaining real AT, and real deploy/rollback remain separate evidence.

## CI / Browser Boundaries

Default GitHub CI runs:

```text
frozen install
named Critical integrity contracts suite
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
persisted values are parsed before use and immediately before write
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
optimistic StoredDeck fingerprint != transactional multi-tab CAS
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
true transaction/version model for advertised concurrent multi-tab editing
Editor live validation-panel integration for cross-variant ID errors
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
