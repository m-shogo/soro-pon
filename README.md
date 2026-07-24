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
Post-Batch-10 integrity review:
  product/test/CI/doc fixes committed
  exact-current-SHA verification pending
```

Deep review report:
`docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md`.

Historical Batch 10 results do not validate the newer product HEAD.
Fresh verification and Batch 11 evidence must use one frozen exact commit.

## Integrity Review Result

Real defects found and fixed:

```text
corruption recovery could throw while backing up/removing broken data
records/settings corrupt payloads were not preserved
records/settings recovery warnings were discarded by AppRoot
failed achievement persistence could appear as newly unlocked
missing current deck/active variant could leave a blank route
legacy version 0 import migration happened without visible review
export Blob URL lifecycle was browser-fragile
storage error-code collision risk
“All local data” reset omitted records/settings corrupt backups
partial reset failure was swallowed and presented as success
Batch 11 baseline and entry docs were stale
```

Current behavior:

```text
storage read denial -> L9005 + safe empty/default in-memory fallback
bootstrap starter write failure -> L9006
backup creation and active-key cleanup independently best-effort
all store recovery issues appear in boot Toast
unpersisted rewards/achievements are not shown as saved
missing deck/variant returns to a safe screen with warning
legacy migration requires visible review and an unchanged second action
export attaches a temporary anchor and defers Blob URL revocation
reset covers active values, all corrupt backups, and skin selection
partial reset failure stops reload and shows an error
```

New regression tests committed in this review: **12 cases**.

```text
6 storage recovery operation-failure cases
3 AppRoot persistence/migration cases
3 local reset completeness/result cases
```

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
```

RC remains **LIMITED READY**.

## Public Demo Notes

```text
local-first: decks and progress are stored in browser localStorage
imports are strict-validated before play
legacy migration shows changes before persistence
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
pnpm exec vitest run src/storage/storageRecoveryFailurePaths.test.ts
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
2. Run frozen install and all verification commands.
3. Confirm all 12 new cases are collected and passing.
4. Fix any failure; code changes restart exact-SHA verification.
5. Execute the complete Batch 11 matrix on the same artifact.
6. Commit evidence/report and only then mark Batch 11 complete.
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
persisted values are schema-parsed before use
recovery does not crash merely because cleanup failed
```

There is no backend/API. Server rate limiting, distributed tracing, and
server RPS/load are currently not applicable; they become mandatory if
login, sync, multiplayer, uploads, telemetry, marketplace, or an API is
introduced. See `docs/OPERATIONS-READINESS.md`.

## Documentation

Start here:

```text
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/POST-BATCH-10-INTEGRITY-REVIEW.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

Priority when documents disagree:

```text
1. MASTER-SPEC for product/rule truth
2. RELEASE-DEMO-GATES for readiness
3. latest evidence-backed Batch report/matrix for exact scope
4. current non-numbered subsystem contracts
5. IMPLEMENTATION-WORKFLOW for next execution
6. historical/numbered documents
```

Choose the evidence-backed narrower claim, not the more optimistic one.
