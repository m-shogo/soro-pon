# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用の
ローカルファーストなカスタム牌ゲームです。Vamp-pon世界の中で遊ばれている
「記憶札遊び」として扱います。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete
Official skins:
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Gate 4: PASS
Gate 5: PASS within its recorded demo/browser scope
Historical Gate 6: PASS
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit:
  contract defined, NOT yet executed
```

The current product HEAD includes post-Batch-10 storage-recovery fixes.
Historical test and production-preview results do **not** validate that
newer SHA automatically. Fresh typecheck/tests/skin validation/build and
Batch 11 evidence must be produced from one exact current commit.

Canonical status:

```text
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

## Current Integrity Review

A deep review found that ordinary localStorage writes were protected, but
corruption recovery still called raw `getItem()`, `setItem()`, and
`removeItem()`. A compound condition such as corrupted data plus quota or
browser storage denial could make the recovery path itself throw.

Current `main` now includes:

```text
deck/records/settings read denial -> L9004 + safe in-memory fallback
backup creation and active-key removal guarded independently
raw corrupt records/settings backup keys when storage permits
best-effort recovery warnings that name failed cleanup operations
six regression tests for recovery-operation failures
updated storage/release/agent documentation
```

See `docs/release/STORAGE-RECOVERY-POLICY.md`.

## Product Core

This is a Donjara-style game, not Mahjong rules.

```text
3 or 4 players
no 2-player mode
no pon / chi / kan
normal hand: 8 tiles
on turn: draw to 9, then discard
win shape: three groups of three
ron: 8-tile hand + discarded tile
self-draw: 9 tiles after draw
```

The table feel and interaction quality may reference Mahjong, but the rule
engine must not drift into Mahjong rules.

## Official Skins

```text
yorunoshirube
  night desk / paper / black ink / lantern light / memory notebook

cute-pop
  bright / cute / approachable / pop
```

Both skins share one screen, component, layout, focus, hit-area, and game
state implementation. Skin-specific screen copies are forbidden.

## Public Demo / RC Scope

Established evidence:

```text
Batch 7:
  Chromium, Firefox, and Playwright WebKit in the recorded automated scope.
  Playwright WebKit is not Safari.

Batch 8:
  real VoiceOver + Chrome with precise traversed/supplemental boundaries.
  This is not Safari + VoiceOver.

Batch 9:
  Chromium memory-authoritative dev-server soak; Firefox/WebKit stability only.

Batch 10:
  production build and local production preview in Chromium.
  A local preview is not a deploy.
```

Still open and unclaimed:

```text
physical iPhone Safari
physical iPad
physical Android
real hosting deployment
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
Batch 8 Result static-text spoken-output capture
Cute Pop Result under real VoiceOver
Batch 11 production Firefox/WebKit execution
```

RC remains **LIMITED READY**. Do not promote it using simulator,
emulation, AX-tree inspection, Playwright WebKit, or local-preview evidence
as substitutes for the open real environments.

## Public Demo Notes

```text
local-first: decks and progress are stored in this browser's localStorage
imports are validated before play
shared deck JSON excludes local/private images and unsafe display fields
no online multiplayer, accounts, billing, or cloud sync
supported official skins: yorunoshirube and cute-pop
reset path is visible from TOP and is irreversible after confirmation
```

The exact supported browser/device promise must match the artifact being
published and its evidence. Do not copy historical wording into a new
deployment without revalidation.

## Stack

```text
TypeScript
React
Vite
Zod
Vitest
Playwright
CSS
localStorage-first persistence
```

Major dependency additions require review of `docs/DEPENDENCY-POLICY.md`
and an ADR where applicable.

## Setup

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Node and package-manager requirements are defined in `package.json`.

## Verification

CI-equivalent core checks:

```bash
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

Browser suites:

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Extended soak is manual and follows `docs/release/SOAK-RUNBOOK.md`.

Never report these as passing unless they were executed against the exact
reported SHA. A successful push is not CI success.

## Current Next Work

```text
1. Freeze clean HEAD == origin/main and record exact SHA/tool versions.
2. Run install/typecheck/test/skin:validate/build on that SHA.
3. Confirm storageRecoveryFailurePaths.test.ts is collected and passes.
4. Execute all Batch 11 production Firefox/WebKit items on the same SHA.
5. If product code changes, discard/relabel partial evidence and restart.
6. Commit report/evidence and synchronize all entry documents.
```

Batch 11 cannot by itself promote RC to READY because real-device,
real-Safari, real-AT, and real-deploy evidence remains open.

## Design / UI Contract

```text
one shared layout/component system
no skin-specific screens
shared generic controls only
layout/hit areas/touch/focus/z-index/state meaning are skin-invariant
skin changes typed allowlisted presentation values only
asset URLs and rendering modes are centralized
both official skins retain fallback behavior
```

For UI work, read the mandatory list in `AGENTS.md` before editing.

Layout policy:

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

844x390 is not a fixed canvas. Whole-screen `transform: scale()` is
forbidden.

## Asset Production

The production pipeline is proven and asset Batches 1-4 are closed.
Do not restart generation based only on an old roadmap checkpoint.

```text
generate -> generated/candidates -> inspect -> human approval
-> generated/final -> skin.json version bump -> verification
```

Direct generation into `generated/final` is forbidden. Historical slot
classification and approval records live in
`docs/ASSET-PRODUCTION-ROADMAP.md` and `docs/asset-requests/`.

## Architecture Boundaries

```text
UI does not judge roles, calculate score, or assign wildcards
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
import is a strict allowlist
shared deck JSON contains no image/URL/base64/path/html/script/style fields
persisted values are schema-parsed before use
recovery code must not throw while trying to recover
```

## Documentation

Start here:

```text
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
```

Priority when documents disagree:

```text
1. MASTER-SPEC for product/rule truth
2. RELEASE-DEMO-GATES for readiness claims
3. latest evidence-backed Batch matrix/report for its exact scope
4. current non-numbered subsystem contracts
5. IMPLEMENTATION-WORKFLOW for next execution
6. historical/numbered documents
```

Choose the evidence-backed, narrower claim—not the more optimistic one.

## Work / Report Policy

```text
small testable changes
one purpose per commit where tooling permits
implementation and contract docs updated together
never weaken historical evidence scope
report local results separately from CI
```

Every completion report includes exact SHA(s), changed files, commands
actually run, CI status or unavailable, browser/device/version scope,
affected skins/screens/storage keys, evidence, remaining risks, and the
next executable step.
