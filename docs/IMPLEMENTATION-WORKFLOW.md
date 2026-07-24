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
Deep-dive review:            docs/qa/POST-BATCH-10-INTEGRITY-DEEP-DIVE.md
Current executable QA:       docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
Storage contract:            docs/release/STORAGE-RECOVERY-POLICY.md
Migration contract:          docs/MIGRATIONS.md
Skin distribution boundary:  docs/SKIN-DISTRIBUTION.md
Operations applicability:    docs/OPERATIONS-READINESS.md
Risk status:                 docs/TECHNICAL-RISK-REGISTER.md
```

## Current Status — 2026-07-25

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
Review-added integrity tests: 79 committed definitions, unexecuted
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
old/partial payloads lacked bounded salvage
same-ID import silently overwrote an existing deck
stale import/editor/detail state could overwrite or delete newer data
new deck IDs could collide
variant/role/bonus duplicate-ID contract was incomplete
tile membership duplicates could inflate feasibility counts
group fields ignored by the engine could survive persistence
ScoreBonus cap could contradict one award
valid deck body could be lost because wrapper metadata was damaged
one malformed match row could wipe all progress
persisted duplicate deck IDs were ambiguous
write paths lacked final runtime schema validation
unpersisted achievement could be shown as unlocked
missing deck/variant could leave a blank route
silent legacy v0 migration persistence
browser-fragile export Blob URL lifecycle
reset omitted backup keys or hid partial failure
ErrorBoundary emergency reset retained false-success behavior
deck deletion lacked confirmation/restore guidance
danger dialog focused destructive confirmation
dialog message lacked aria-describedby association
skin preload rejection/unmount races could leave stale/loading state
skin inheritance exact-limit check was off by one
runtime external-SVG/registry trust checks were incomplete
unsafe import diagnostics were unbounded
stale Batch 11 baseline and entry/risk/performance/distribution docs
```

Current integrity behavior:

```text
read denial:
  L9005 session fallback for display
  every mutation/export fails closed

write boundary:
  strict payload parse immediately before setItem
  nested deck identity/membership/scoring contracts checked
  stale observed deck mutation rejected

match result:
  record + coins + role collection + match achievements in one write

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20
  old/partial payload -> backup + bounded salvage where safe

import:
  visible legacy migration review
  explicit same-ID overwrite review
  bounded unsafe-field diagnostics

reset/destructive UI:
  active + forensic + skin keys covered
  partial failure stops reload and is shown
  danger dialogs focus cancellation first

skin runtime:
  failed preload returns to ready with previous/fallback skin
  unmount invalidates in-flight requests
  duplicate/future registry rejected
  external SVG rejected at runtime validation
```

Targeted test definitions committed across three reviews: **79**. They are
not release evidence until executed on the exact final SHA.

## Next Executable Work

```text
1. Stop every concurrent writer.
2. Confirm clean worktree and HEAD == origin/main.
3. Record exact SHA and Node/pnpm/Playwright/browser versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent locally.
6. Confirm all 79 review-added tests are collected and pass.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build and record artifact inventory/hash.
11. Fix any failure; if code/test changes, restart from step 1.
12. Execute all Batch 11 production Firefox/WebKit items on the same SHA.
13. Commit evidence/report and only then update Batch 11 status.
```

The exact targeted file list is maintained in
`.github/workflows/integrity.yml`; do not maintain a second command list here.

Batch 11 cannot itself promote RC to READY. Real devices, real Safari,
remaining real AT, installer-owned external-skin trust, and real
deploy/rollback remain separate evidence.

## CI / Browser Boundaries

GitHub workflows now define:

```text
CI:
  frozen install
  recovery-focused named step
  strict typecheck
  full unit suite
  skin validation
  production build

Integrity Contracts:
  23 targeted integrity files
  strict typecheck
```

A workflow definition is not a PASS result. Visual, cross-browser, soak,
physical-device, real-AT, and deploy checks remain separate release gates.

## UI / Skin Rules

```text
one shared screen/component/layout system
no skin-specific screen copies
layout/hit areas/focus/z-index/game meaning are skin-invariant
skins change typed allowlisted presentation values only
generic controls and render/slice behavior stay centralized
both official skins and fallback remain usable
external package official trust cannot come from manifest self-declaration
```

Read the mandatory UI documents in `AGENTS.md` before UI work.
