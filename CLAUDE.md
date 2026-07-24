# CLAUDE.md

Claude Code向け作業指示。共通の必須ルールは `AGENTS.md` が正本。
このファイルは現在地・実行順・破綻しやすい境界だけを固定する。
Batch履歴の詳細は各matrix/reportへ置き、ここへ複製しない。

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
Current work:
  post-Batch-10 storage/AppRoot integrity changes require fresh
  verification against one exact current SHA
```

古い指示:

```text
MVP Phase 1から開始
engineを作り直す
H1から実装
画像生成前のfoundation phase
次はasset Batch 5
```

これらは実行しない。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
```

Storage/recovery:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/ERROR-CODES.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
```

UI/skin/assetは `AGENTS.md` のmandatory listをすべて読む。

## Immediate Execution Order

```text
1. git status --short
2. git rev-parse HEAD
3. git rev-parse origin/main
4. cleanかつHEAD == origin/mainを確認
5. Node/pnpm/Playwright/browser versionsを記録
6. pnpm install --frozen-lockfile
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build
11. storageRecoveryFailurePaths.test.tsの収集/PASSを確認
12. 同じSHAでBatch 11を全実行
13. report/evidence作成
14. entry docsを証跡に合わせて同期
```

途中でproduct/test codeを変えたら、その前のBatch 11証跡を現行結果に混ぜない。
新SHAでpreflightから再実行する。

## Current Integrity Fixes

Post-Batch-10 reviewで修正済み:

```text
corruption recovery内のraw storage例外
records/settings corrupt raw backup欠落
records/settings recovery issueのUI未通知
実績保存失敗後のfalse unlock表示
missing deck/active variantの永久blank route
cross-browser export Blob URL lifecycle
L9004 error-code collision risk
```

Current behavior:

```text
storage read denial -> L9005 + safe empty/default fallback
bootstrap starter write failure -> L9006
backup creation and active-key cleanup independently guarded
records/settings raw corrupt backup keys
all store issues included in boot Toast
unpersisted achievement/reward is not shown as saved
missing deck/variant returns to safe screen with warning
export anchor attached temporarily; URL revoke deferred
```

Recovery処理中の失敗が回復処理自体の例外停止になってはならない。
`L9004` は既存のlocal-image fallback専用であり、storage accessへ再利用しない。

## UI / Skin Contract

```text
one layout and component system
multiple validated skins
no skin-specific screen copies
shared components before screen-local markup
Design Tokens before raw visual values
asset slots before hardcoded image paths
Component Gallery before broad rollout
layout/hit areas/touch/focus/z-index/state meaning are skin-invariant
skin changes typed allowlisted presentation values only
slice/repeat/mask logic remains in shared renderers
```

Claude Codeは画面ごとにgeneric componentやデザイン規則を発明しない。

## Asset Boundary

Asset pipeline is proven; Batches 1-4 are closed. 古いroadmapのnextだけで生成を
再開しない。明示的task時のみ:

```text
controlled generation
-> deterministic transparency/despill
-> validation
-> generated/candidates
-> real-screen review
-> human approval
-> generated/final
-> skin version bump
-> validation/visual verification
```

Direct final outputは禁止。

## Shared Component Rule

```text
reuse shared component
-> central reusable variant/component
-> semantic token/slot only for a real responsibility
-> Gallery coverage
-> component/visual tests
-> both official skins + fallback verification
-> screen integration
```

Screen-local generic Button/Panel/Dialog/Formは禁止。

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON has no image/URL/base64/path/html/script/style fields
persisted values are parsed before use
normal write failures are translated and visible
recovery cleanup failures are non-throwing and visible
```

## Release Claim Boundary

```text
local production preview != deploy
Playwright WebKit != Safari
simulator/emulation != physical device
AX-tree/DOM inspection != real screen reader
VoiceOver + Chrome != VoiceOver + Safari
not measured = null/not_available, never 0
old SHA PASS != current SHA verification
successful push != CI success
```

RCはreal-device・real-Safari・real-AT・real-deploy/rollbackなしにREADYへ上げない。

## Historical Evidence Scope

```text
Batch 7:
  Chromium + Firefox + Playwright WebKit. WebKit is not Safari.

Batch 8:
  real VoiceOver + Chrome with recorded supplemental boundaries.

Batch 9:
  Chromium memory-authoritative dev-server soak;
  Firefox/WebKit stability only.

Batch 10:
  local production preview in Chromium;
  real devices/deploy/Safari remained blocked.
```

Batch 11はまだ契約であり結果ではない。

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Whole-screen `transform: scale()`禁止。

## Vamp-pon Reference

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

`vamp-pon` repoはread-only。

## Work and Report

```text
small testable changes
one purpose per commit where tooling permits
implementation and contract docs together
push is not proof of CI
never hide unavailable evidence
```

Report exact files/SHA(s), commands actually run, CI status or unavailable,
browser/device/version/SHA scope, affected skins/screens/storage keys,
evidence, remaining risks, and next executable step.
