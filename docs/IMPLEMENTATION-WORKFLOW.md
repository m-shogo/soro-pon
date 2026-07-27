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
Residual closure:            docs/qa/POST-BATCH-10-RESIDUAL-CLOSURE.md
Current executable QA:       docs/qa/BATCH-12-REAL-SAFARI-DEVICE-ACCESSIBILITY-MATRIX.md
Storage contract:            docs/release/STORAGE-RECOVERY-POLICY.md
Migration contract:          docs/MIGRATIONS.md
Skin distribution boundary:  docs/SKIN-DISTRIBUTION.md
Operations applicability:    docs/OPERATIONS-READINESS.md
Risk status:                 docs/TECHNICAL-RISK-REGISTER.md
```

## Current Status — 2026-07-27

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
Batch 11 production Firefox/WebKit: COMPLETE on frozen SHA 7548964
Batch 12 real Safari/device/AT: CONDITIONAL on frozen SHA 555c02d
Batch 12 exact-SHA build/CI/Integrity/Python: PASS
Current residual gates: full Safari, physical devices, real AT,
  authorized deploy/rollback
```

Current phase: **Batch 12 real-environment evidence closure**. Do not restart MVP, H1-H11,
asset Batch 5, or any obsolete implementation sequence.

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

## Integrity / Residual Closure Result

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
set-like arrays could cap before dedupe and lose later unique values
write paths lacked final runtime schema validation
unpersisted achievement could be shown as unlocked
missing deck/variant could leave a blank route
silent legacy v0 migration persistence
browser-fragile export Blob URL lifecycle
reset omitted backup keys or hid partial failure
forensic backup had no in-app raw export path
ErrorBoundary emergency reset retained false-success behavior
deck deletion lacked confirmation/restore guidance
danger dialog focused destructive confirmation
dialog message lacked aria-describedby association
MatchSession React identity used a bounded gameplay seed
Editor live diagnostics differed from production boundaries
skin preload rejection/unmount races could leave stale/loading state
skin inheritance exact-limit check was off by one
runtime external-SVG/registry trust checks were incomplete
manifest origin could self-elevate without loader-owned classification
unsafe import diagnostics were unbounded
GitHub Actions used mutable major tags
Python dependency consistency was not checked after install
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
  MatchSession component identity uses matchSessionId

limits:
  decks 200 / records 100 / roles 500 / achievements 100 / recent keys 20
  set-like values dedupe before retention caps
  old/partial payload -> backup + bounded salvage where safe

import/editor:
  visible legacy migration review
  explicit same-ID overwrite review
  bounded unsafe-field diagnostics
  live Editor uses the production integrated validator

reset/recovery/destructive UI:
  active + forensic + skin keys covered
  raw forensic backups export as a versioned bundle
  failed file creation is not reported as success
  partial reset failure stops reload and is shown
  danger dialogs focus cancellation first

skin runtime:
  failed preload returns to ready with previous/fallback skin
  unmount invalidates in-flight requests
  duplicate/future registry rejected
  external SVG rejected under loader-owned origin classification

supply chain:
  Main CI / Integrity actions use immutable commit SHAs
  Python asset CI installs exact top-level pins and runs pip check
```

Batch 12 frozen SHA executed **101 integrity tests across 28 files**, all PASS.

## Next Executable Work

```text
1. Stop every concurrent writer.
2. Confirm clean worktree and HEAD == origin/main.
3. Record exact SHA and Node/pnpm/Playwright/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent locally.
6. Confirm all 101 targeted tests are collected and pass.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build and record artifact inventory/hash.
11. Run Python 3.13 install + pip check + asset fixtures as declared in CI.
12. Fix any failure; if code/test/workflow changes, restart from step 1.
13. Execute the remaining Batch 12 real Safari/device/AT/deploy gates on the
    same SHA/artifact.
14. Commit evidence/report and only then update Batch 12 status.
```

The exact targeted file list is maintained in
`.github/workflows/integrity.yml`; do not maintain a second command list here.

Batch 12 cannot promote RC to READY while full real Safari, physical devices,
real AT, and authorized deploy/rollback remain blocked.

## CI / Browser Boundaries

GitHub workflows now define:

```text
CI:
  immutable action commit SHAs
  frozen install
  recovery-focused named step
  strict typecheck
  full unit suite
  skin validation
  production build
  Python 3.13 exact top-level pins + pip check + asset fixtures

Integrity Contracts:
  immutable action commit SHAs
  28 targeted integrity files
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
manifest self-declaration cannot elevate runtime trust
loader-owned origin classification is not a cryptographic package signature
```

Read the mandatory UI documents in `AGENTS.md` before UI work.
