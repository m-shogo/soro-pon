# CODEX.md

Codex向けの作業指示。共通ルールは `AGENTS.md` が正本で、このファイルは
Codex作業時の短い実行順を補足する。

## Current Status — 2026-07-24

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Gate 4 / Gate 5 / historical Gate 6: PASS within recorded scopes
RC status: LIMITED READY
Batch 7: COMPLETE
Batch 8 real VoiceOver + Chrome: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device validation: CONDITIONAL
Batch 11 production Firefox/WebKit: contract defined, not executed
Current work: storage/recovery integrity changes need exact-current-SHA verification
```

「H1から実装」「画像生成前」「次はasset Batch 5」は古い状態。基盤を再実装せず、
`docs/IMPLEMENTATION-WORKFLOW.md` の次の実行順に従う。

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

storage/migration/recoveryを触る場合:

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
```

UI/skin/assetを触る場合は `AGENTS.md` のMandatory UI listをすべて読む。

## Immediate Execution Order

```text
1. HEAD == origin/main、clean、exact SHAを記録
2. pnpm install --frozen-lockfile
3. pnpm typecheck
4. pnpm test
5. pnpm skin:validate
6. pnpm build
7. storageRecoveryFailurePaths.test.tsが実行されたことを確認
8. 同じSHAでBatch 11 matrixを全実行
9. product codeを直したら古いBatch 11証跡を破棄し1から再実行
10. report/evidence後にentry docsを同期
```

実行していないcommandや、別SHAの結果をgreenとして報告しない。

## Current UI / Skin Contract

```text
one stable layout and component implementation
no skin-specific screens
shared generic controls only
layout/hit areas/touch/focus/z-index/state meaning are skin-invariant
assets and slice logic are centralized
external skins use typed allowlisted presentation values only
both official skins preserve fallback behavior
```

Do not implement render behavior independently inside screens.

## Asset Boundary

Asset pipeline is proven and current official finals are complete for the
closed Batches 1-4. Do not start generation merely because an old roadmap
says “next”. Start only from an explicit asset task.

```text
generate -> generated/candidates -> review -> human approval
-> generated/final -> manifest/version update -> verification
```

Direct output to `generated/final` is forbidden.

## Shared Component Rule

```text
reuse existing shared component
-> add central reusable variant/component if necessary
-> add semantic token/slot only for a real responsibility
-> add Gallery coverage
-> add tests
-> verify yorunoshirube + cute-pop + fallback
-> integrate into screen
```

Screen-local generic Button/Panel/Dialog/Form implementations are forbidden.

## Release Claim Boundaries

```text
local production preview != deploy
Playwright WebKit != Safari
simulator/emulation != real device
AX-tree automation != real screen reader
not measured = null/not_available, never 0
old artifact PASS != current HEAD verification
```

RC cannot be promoted from LIMITED READY without explicit evidence for
the remaining real-device, real-Safari, real-AT, and real-deploy scope.

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON contains no image/URL/base64/path/html/script/style fields
read paths schema-parse persisted state before use
recovery code must not throw while trying to recover
```

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Do not scale the full screen as a fixed canvas.

## Vamp-pon Reference

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

Use small testable commits where tooling permits. Report exact changed
files, commit SHA(s), commands actually run, CI status or unavailable,
browser/device scope, affected skins/screens, evidence, remaining risks,
and the next executable step.
