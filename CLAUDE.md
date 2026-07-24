# CLAUDE.md

Claude Code向け作業指示。共通の必須ルールは `AGENTS.md` が正本。
このファイルは、現在地・実行順・Claude Codeで破綻しやすい境界を短く固定する。
Batch履歴の詳細は各matrix/reportにあり、ここへ複製しない。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete
Official skins:
  yorunoshirube: 9 finals, v4
  cute-pop: 9 finals, v5
Gate 4: PASS
Gate 5: PASS within recorded demo/browser scope
Historical Gate 6: PASS
RC status: LIMITED READY
Batch 7 cross-browser/dev-server acceptance: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, NOT executed
Current work:
  post-Batch-10 storage/recovery integrity changes require fresh
  verification against one exact current SHA
```

以下は古い指示であり、実行しない。

```text
MVP Phase 1から開始
engineを最初から作り直す
H1から順に実装
画像生成前のfoundation phase
次はasset Batch 5
```

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

Storage/recovery work:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
```

UI/skin/asset workは `AGENTS.md` のMandatory UI / Design / Skin一覧を
すべて読む。

## Immediate Execution Order

現在のコード変更後に必要な検証順:

```text
1. git status --short
2. git rev-parse HEAD
3. git rev-parse origin/main
4. HEAD == origin/main、cleanを確認
5. node / pnpm / Playwright/browser versionsを記録
6. pnpm install --frozen-lockfile
7. pnpm typecheck
8. pnpm test
9. pnpm skin:validate
10. pnpm build
11. storageRecoveryFailurePaths.test.tsが収集・PASSしたことを確認
12. 同じSHAのproduction artifactでBatch 11を全実行
13. report/evidence作成
14. README/AGENTS/CODEX/CLAUDE/docs index/gatesを証跡に合わせて同期
```

途中でproduct/test codeを変更した場合、変更前SHAのBatch 11証跡は現行結果に
混ぜない。新SHAでpreflightから再実行する。

## Current Integrity Fixes

Post-Batch-10 reviewで、通常writeは`safeWrite()`されている一方、corruption
recovery内の`getItem/setItem/removeItem`が生のままである破綻を発見した。

Current main includes:

```text
deck read denial -> L9004 + safe empty in-memory fallback
backup creation and active-key cleanup guarded independently
records/settings corrupt raw backup keys
records/settings read denial -> L9004 + empty/default fallback
six storage-operation failure-path unit tests
truthful best-effort backup/recovery documentation
```

Recovery処理中の失敗が、回復処理自体の例外停止になってはならない。

## Current UI / Skin Contract

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
slice/repeat/mask/render logic stays in shared renderers
```

Claude Codeは画面ごとにデザインやgeneric componentを発明しない。

## Asset Production Boundary

画像生成pipelineは稼働・実証済みで、asset Batches 1-4はclosed。
古いroadmapのnext記述だけを理由に生成を再開しない。明示的なasset task時のみ:

```text
Codex CLI generation with controlled background
-> deterministic transparency/despill processing
-> automated validation
-> generated/candidates
-> Gallery/real-screen review
-> human approval
-> generated/final
-> skin.json version bump
-> skin validation + visual verification
```

固定ルール:

```text
direct generated/final output禁止
candidatesはmanifest未登録
finalはskin.json経由のみ
prompt/parameters/hash/approval recordを保持
既存approval conceptを勝手に差し替えない
```

## Shared Component Rule

```text
reuse shared component
-> central reusable variant/component
-> semantic token or asset slot only when responsibility is real
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
shared deck JSON contains no image/URL/base64/path/html/script/style fields
persisted values are parsed before use
normal write failures are translated and visible
recovery failures remain non-throwing and visible
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

RCは、real-device・real-Safari・real-AT・real-deploy/rollbackの証跡なしに
LIMITED READYからREADYへ上げない。

## Browser / Accessibility Evidence

Historical evidence must retain exact scope:

```text
Batch 7:
  Chromium + Firefox + Playwright WebKit on its recorded environment.
  WebKit is not Safari.

Batch 8:
  real VoiceOver + Chrome, partial/supplemental boundaries recorded.
  Safari+VoiceOver, NVDA, JAWS are not passed.

Batch 9:
  Chromium memory-authoritative dev-server soak.
  Firefox/WebKit stability only.

Batch 10:
  local production preview in Chromium.
  physical devices/deploy/rollback/real Safari remained blocked.
```

Batch 11はまだ結果ではなく契約。`COMPLETE`と書くのはreport/evidence後のみ。

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Whole-screen `transform: scale()`禁止。

## Vamp-pon Reference

World/visual loreを扱う場合:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

`vamp-pon` repositoryはread-only。

## Work and Report

```text
small, testable changes
one purpose per commit where tooling permits
implementation and contract docs together
push is not proof of CI
never hide unavailable evidence
```

Final report must include:

```text
changed files
commit SHA(s)
commands actually run and exact results
CI status or unavailable
browser/device/version/SHA scope
affected skins/screens/storage keys
visual/manual evidence where relevant
remaining defects and blocked evidence
next executable step
```
