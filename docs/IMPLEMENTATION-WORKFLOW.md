# Soro-pon Implementation Workflow

## Purpose

Current operational view of completed foundations, release state and the next executable work. Detailed history belongs in evidence-backed Batch/review reports; do not duplicate old phase narratives here.

```text
Product/rule truth:          docs/MASTER-SPEC.md
Release/readiness truth:     docs/RELEASE-DEMO-GATES.md
Visual quality lessons:      docs/design/SOROPON-VISUAL-QUALITY-LEARNINGS.md
Interaction UX contract:     docs/design/SOROPON-INTERACTION-UX-CONTRACT.md
Current visual QA flow:      docs/qa/BATCH-14-VISUAL-REVIEW.md
Storage contract:            docs/release/STORAGE-RECOVERY-POLICY.md
Migration contract:          docs/MIGRATIONS.md
Skin distribution boundary:  docs/SKIN-DISTRIBUTION.md
Operations applicability:    docs/OPERATIONS-READINESS.md
Risk status:                 docs/TECHNICAL-RISK-REGISTER.md
```

## Current Status — 2026-08-09

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
Batch 13 table UI/Safari/Cloudflare: CONDITIONAL
Batch 14 authored game UI/UX: COMPLETE
  PR #10 squash-merged to main: 30c6e84393a216ae5f561e955886595d12c89f8f
  Issue #12: CLOSED / completed
  reviewed PR HEAD: f134755fb961b455f751c661c98018233dbd76cb
  Visual Review 31314974844: SUCCESS
  CI 31314974888: SUCCESS
  Integrity 31314974887: SUCCESS
  visual artifact 9038478453
Physical iPhone Safari: KNOWN UNVERIFIED, post-release, non-blocking
Residual release gates: Safari rotation/soak, full Safari+VoiceOver,
  iPad/Android, NVDA/JAWS, Cloudflare Preview/production/rollback/current restore
```

Current phase: **post-Batch-14 mainline**. Start new product work from current `main` with a new explicit objective. Do not restart MVP, H1-H11, asset Batch 5, Batch 13 UI work, or Batch 14 unless a new defect specifically requires it.

## Completed Foundations

```text
strict deck schemas/import/validation
role/wait/scoring/wildcard engine
seeded reducer/CPU/playable 3p+4p flow
Deck Editor / Collection / achievements / records
multi-skin shared UI and H1-H11 hardening
candidate -> review -> final asset pipeline
18 official final assets
board-first 3p/4p match UI and mahjong-like discard rivers
loadout-style deck browse/detail/editor workspace
current-head artifact visual review instead of committed screenshot churn
interaction UX contract for pointer targets/focus/motion/action hierarchy
desktop authored composition + compact 844x390 composition
```

Restore/replay and marketplace/payment are future products, not implied by foundation work.

## Integrity / UX Behavior

```text
storage read denial:
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
  live Editor uses production validator
  editor form targets have shared hooks and 24px+ effective pointer targets
  compact role presets remain visible/scrollable instead of flex-shrinking away

reset/recovery/destructive UI:
  active + forensic + skin keys covered
  raw forensic backups export as a versioned bundle
  failed file creation is not reported as success
  partial reset failure stops reload and is shown
  danger dialogs focus cancellation first
  modal/focus traps are not stacked for reset confirmation

skin runtime:
  failed preload returns to ready with previous/fallback skin
  unmount invalidates in-flight requests
  duplicate/future registry rejected
  external SVG rejected under loader-owned origin classification

supply chain:
  Main CI / Integrity actions use immutable commit SHAs
  Python asset CI installs exact top-level pins and runs pip check
```

## Next Executable Work

For any new code/UI objective:

```text
1. Stop concurrent writers.
2. Confirm clean worktree and start from current origin/main.
3. Record exact SHA and relevant Node/pnpm/Playwright/browser/Python versions.
4. pnpm install --frozen-lockfile
5. Run .github/workflows/integrity.yml equivalent.
6. Run Batch 14 visual quality, review-hygiene and Interaction UX contract guards.
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build
11. Run Python asset fixtures when asset tooling is in scope.
12. If UI/UX changed, run the current-head Batch 14 Visual Review; review the artifact at 844x390 and 1440x900 for both skins and required 3p/4p surfaces.
13. Fix the weakest three visible/interaction problems before adding decoration.
14. If product/test/workflow changes, restart final verification on the new SHA.
15. Keep still-open real Safari/device/AT/deploy gates separate; run them only when in scope.
```

The exact targeted integrity file list lives in `.github/workflows/integrity.yml`; do not maintain a second hardcoded list here.

RC remains `LIMITED READY` while the named residual real-environment/deployment gates remain unresolved. Physical iPhone Safari remains post-release non-blocking under the existing project decision.

## CI / Visual Review Boundaries

```text
Main CI:
  immutable action commit SHAs
  frozen install
  critical integrity step
  Batch 14 visual quality contract
  Batch 14 visual review hygiene contract
  Interaction UX contract
  strict typecheck
  full unit suite
  skin validation
  production build
  Python asset fixtures in separate job

Batch 14 Visual Review:
  captures current changed UI in GitHub Actions
  both skins
  844x390 + 1440x900
  TOP / deck list / detail / editor basic / tile / role
  3p + 4p setup/table
  compact selected-tile/action state
  24px enabled pointer-target floor
  44px frequent match-action floor
  viewport/bounded-overflow/painted-object occlusion checks
  screenshots uploaded as short-lived artifact, not committed baselines
```

A workflow definition is not a PASS result. An older artifact is not approval for changed UI. Playwright WebKit is not Safari. Emulation is not a physical device. Automated accessibility is not real screen-reader evidence.

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

## Git Hygiene

```text
current main contains Batch 14 as one squash feature commit
current review screenshots belong in Actions artifacts
historical evidence remains immutable
retired executable screenshot baselines do not return as current approval
one coherent objective -> one active manual PR
long exploratory commit chains are squash-integrated after approval
closeout docs are synchronized immediately after merge
```
