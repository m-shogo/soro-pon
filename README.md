# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用の
ローカルファーストなカスタム牌ゲームです。Vamp-pon世界の「記憶札遊び」
として扱います。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins:
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, NOT executed
Post-Batch-10 integrity reviews:
  product/test/CI/doc fixes committed
  exact-current-SHA verification pending
```

Review records:

```text
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/POST-BATCH-10-INTEGRITY-CONTINUATION.md
```

Historical Batch 10 evidence does not validate the newer product HEAD.
Fresh verification and Batch 11 must use one frozen exact commit and one
production artifact.

## Integrity Hardening Result

The reviews found and fixed real defects in:

```text
corruption recovery and forensic backup
storage read-denial fail-closed behavior
write-boundary schema enforcement
atomic match record/coin/achievement persistence
legacy migration review
same-ID import overwrite confirmation
cross-tab stale import/editor conflict rejection
collision-resistant new deck IDs
variant/role/bonus ID uniqueness
persisted collection bounds and legacy over-limit salvage
missing-entity route recovery
Blob URL/export lifecycle
full local reset completeness and partial-failure truthfulness
error-code ownership, CI visibility, and current-state docs
```

Current persistence guarantees:

```text
read denial:
  L9005 session fallback for display
  mutation/export fails closed; unknown existing bytes are not overwritten

normal write:
  strict schema parse immediately before setItem
  StorageWriteError on contract or browser write failure

match result:
  record + coins + role collection + match-derived achievements
  committed in one validated write

stored limits:
  decks 200
  records 100
  role collection 500
  achievements 100
  recent match keys 20

old over-limit payload:
  raw backup when possible
  deterministic bounded salvage
  L9007 warning

same-ID import:
  unchanged-input confirmation
  unchanged existing-entry fingerprint confirmation

Editor conflict:
  stale draft is rejected and unmounted
```

Targeted integrity tests added across the two reviews: **38 cases**.
They are committed but not yet authoritatively executed against the final
review SHA. No new PASS claim is made.

## Product Core

This is a Donjara-style game, not Mahjong rules.

```text
3 or 4 players
no 2-player mode
no pon / chi / kan
normal hand: 8 tiles
on turn: draw to 9, then discard
win shape: three groups of three
ron: 8 hand tiles + discarded tile
self-draw: 9 tiles after draw
```

The interaction may reference Mahjong table feel, but the rule engine must
not drift into Mahjong rules.

## Official Skins

```text
yorunoshirube
  night desk / paper / black ink / lantern light / memory notebook

cute-pop
  bright / cute / approachable / pop
```

Both skins share one screen/component/layout/focus/hit-area/game-state
implementation. Skin-specific screen copies are forbidden.

## Public Demo / RC Scope

Established historical evidence:

```text
Batch 7:
  Chromium, Firefox, and Playwright WebKit in recorded automated scope.
  Playwright WebKit is not Safari.

Batch 8:
  real VoiceOver + Chrome within recorded traversed/supplemental scope.
  This is not Safari + VoiceOver.

Batch 9:
  Chromium memory-authoritative dev-server soak;
  Firefox/WebKit stability only.

Batch 10:
  production build and local production preview in Chromium.
  A local preview is not a deploy.
```

Still open/unclaimed:

```text
exact-current-SHA install/typecheck/test/skin validation/build
Batch 11 production Firefox/WebKit execution
physical iPhone Safari / iPad / Android
real hosting deployment
rollback of an actually deployed immutable artifact
Safari + VoiceOver
NVDA / JAWS
remaining Batch 8 Result/Cute Pop real-VoiceOver evidence
user-facing backup restore
true transactional multi-tab compare-and-swap
```

RC remains **LIMITED READY**.

## Public Demo Notes

```text
local-first: decks and progress are stored in browser localStorage
imports are strict-validated before play
legacy migration shows changes before persistence
same-ID import requires irreversible-overwrite confirmation
shared deck JSON excludes local/private images and unsafe display fields
no online multiplayer, accounts, billing, or cloud sync
supported official skins: yorunoshirube and cute-pop
reset is visible, irreversible, and reports partial deletion failure
```

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

## Setup / Verification

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Exact-current-SHA release verification:

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
pnpm typecheck
pnpm test
pnpm skin:validate
pnpm build
```

Browser suites where applicable:

```bash
pnpm test:visual
pnpm test:visual:crossbrowser
```

Never report a command as passing unless it ran against the exact reported
SHA. A successful push is not CI success.

## Current Next Work

```text
1. Freeze clean HEAD == origin/main and record exact SHA/tool versions.
2. Run frozen install and the named Critical integrity contracts suite.
3. Run typecheck, all unit tests, skin validation, and production build.
4. Confirm all 38 review-added cases are collected and passing.
5. Fix any failure; every code/test change restarts exact-SHA verification.
6. Execute the complete Batch 11 matrix on the same artifact.
7. Commit evidence/report and only then mark Batch 11 complete.
```

New features or asset generation must not bypass this closure work.

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

Layout:

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Whole-screen `transform: scale()` is forbidden.

## Asset Production

Asset Batches 1-4 are closed. Do not restart generation from an old
roadmap checkpoint.

```text
generate -> generated/candidates -> inspect -> human approval
-> generated/final -> skin.json version bump -> verification
```

Direct generation into final is forbidden.

## Architecture / Operations Boundaries

```text
UI does not implement role/scoring/wildcard rules
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON contains no image/URL/base64/path/html/script/style fields
persisted values are schema-parsed before use and before write
recovery does not crash merely because cleanup failed
```

There is no backend/API. Server rate limiting, distributed tracing, and
server RPS/load are currently not applicable; they become mandatory if
login, sync, multiplayer, uploads, telemetry, marketplace, or an API is
introduced.

## Canonical Documents

```text
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
docs/release/STORAGE-RECOVERY-POLICY.md
docs/OPERATIONS-READINESS.md
docs/TECHNICAL-RISK-REGISTER.md
```
