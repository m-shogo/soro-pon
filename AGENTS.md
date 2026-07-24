# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11 (P0/P1/P2): complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Image production pipeline: proven; requests 007-016 and asset Batches 1-4 closed
Gate 4: PASS
Gate 5: PASS within its recorded Chromium demo scope
Gate 6: PASS
RC status: LIMITED READY
Batch 7 cross-browser/dev-server acceptance: COMPLETE
Batch 8 real VoiceOver + Chrome acceptance: CONDITIONAL
Batch 9 extended soak: COMPLETE
Batch 10 production-preview / real-device release validation: CONDITIONAL
Batch 11 production Firefox/WebKit auxiliary validation:
  contract exists in docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md;
  do not claim COMPLETE until execution evidence and a report are committed
Current work: RC integrity/recovery hardening and evidence/doc consistency.
```

「MVP Phase 1から実装開始」「H1から順に実装」「次は公式アセット生産」は
古い現在地です。作業開始時は必ず次を突き合わせてください。

```text
docs/RELEASE-DEMO-GATES.md
docs/qa/BATCH-11-PRODUCTION-CROSS-BROWSER-MATRIX.md
README.md
CLAUDE.md or CODEX.md
```

履歴文書の古いcheckpointを現在地として上書き解釈しないこと。Batchの結果と
検証scopeは、後続Batchが明示的に更新しない限り保持する。

## Read First

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/RELEASE-DEMO-GATES.md
docs/SKIN-FOUNDATION-HARDENING.md
```

仕様の正本は `docs/MASTER-SPEC.md`。release/readinessの正本は
`docs/RELEASE-DEMO-GATES.md` と各Batchのmatrix/report。
番号付きdocsや過去プロンプトと衝突した場合は、現行の非番号契約docsと
最新の証跡付きBatch記録を優先する。

## Mandatory UI / Design / Skin Read

UI、CSS、コンポーネント、asset、motion、responsive、skin loading、画像受入構造を扱う場合は、プロンプトに書かれていなくても必ず読む。

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/UI-COMPONENT-CONTRACT.md
docs/SKIN-AUTHORING-GUIDE.md
docs/DESIGN-IMPLEMENTATION-POLICY.md
docs/ASSET-PIPELINE.md
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

## Current UI Contract

```text
one shared layout/component system
multiple validated skins
no skin-specific screens
layout/hit areas/state meaning are skin-invariant
skin only changes allowlisted and typed presentation values
common buttons/panels/dialogs/forms/tiles are shared components
slice/repeat/mask rendering exists only in shared Skin renderers
both official skins work with CSS/SVG fallback
```

Forbidden:

```text
screen-local generic Button/Panel/Dialog/Form
hardcoded PNG paths
hardcoded visual colors in screens
skin-controlled layout, touch size, z-index, pointer behavior, or game state
CutePopMatchScreen / YorunoshirubeMatchScreen duplication
arbitrary CSS/JS/HTML/external URL/external font in installed skins
external skin overriding any unknown --sp-* token
```

## Hardening Baseline (H1-H11 complete)

```text
H1 token allowlist and typed validation                 complete
H2 skin:validate and CI integration                     complete
H3 semantic contrast and Cute Pop fixes                  complete
H4 SkinSelector and Gallery switching                    complete
H5 layered SkinSurface and real nine-slice proof         complete
H6 proven renderer-mode completion                       complete where necessary
H7 shared-component and CSS responsibility migration      complete
H8 DOM/accessibility/recovery tests and fixes             complete
H9 Playwright visual regression and five-size QA          complete
H10 external/paid skin security and atomic loading        complete
H11 persistent match-session idempotency baseline         complete
```

Detail and exceptions: `docs/SKIN-FOUNDATION-HARDENING.md`。
Foundationを再実装しない。変更時は既存契約を維持する回帰テストを追加する。

## Image Production — Maintenance State

承認済みfinalへ生成物を直接上書きしない。新しいasset作業が明示された場合のみ、
既存pipelineを再利用する。

```text
generate/draw (Codex CLI起点) -> generated/candidates
-> human review -> generated/final -> manifest update
```

Never write generated output directly into `final`。履歴とslot分類は
`docs/ASSET-PRODUCTION-ROADMAP.md` を参照するが、同文書の「next task」が
release current statusより古い場合は、勝手にasset batchを再開しない。

## Release / Recovery Discipline

```text
- local production preview is not a deploy
- Playwright WebKit is not Safari
- simulator/emulation is not a physical-device pass
- automated AX inspection is not a real screen-reader pass
- recovery code must not throw while trying to recover
- unavailable metrics are null/not_available, never 0
- do not promote RC from LIMITED READY without explicit evidence
```

Storage、migration、backup/restore、rollback、compatibilityを触る場合は必ず読む。

```text
docs/release/STORAGE-RECOVERY-POLICY.md
docs/release/CACHE-AND-ROLLBACK-RUNBOOK.md
docs/qa/RELEASE-DEPLOY-ROLLBACK-RUNBOOK.md
docs/release/SOAK-RUNBOOK.md
```

## New Feature Gate

新しいscreen、button、state、componentを追加する場合:

```text
1. reuse shared component
2. add reusable central variant/component if needed
3. add semantic/component token
4. add asset slot only for a new visual responsibility
5. define render/size/safe-area/fallback contract
6. update base + yorunoshirube + cute-pop
7. add Component Gallery coverage
8. add component/visual tests
9. verify required sizes and both skins
10. then integrate the screen
```

A feature is not complete when it works in only one skin.

## Game Architecture Boundaries

```text
UI does not judge roles, calculate score, or assign wildcards
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
import is strict allowlist
shared deck JSON contains no images or executable/display injection fields
```

## Landscape-first

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered game table + outer support
portrait: rotate prompt or limited utility
```

Do not scale the whole UI as a fixed canvas.

## Mandatory Vamp-pon Read

world/character/enemy/stage/item/visual loreを扱う場合:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

`vamp-pon` repositoryはread-only。

## Work and Report

```text
one commit per purpose where tooling permits
small testable changes
push after commit
update docs with implementation
never claim a test that was not executed
```

Report:

```text
changed files
commit SHA(s)
tests/typecheck/build/skin validation actually executed
CI status or unavailable
browser/device/viewport and exact claim scope
affected skins/screens
remaining risks and blocked evidence
next executable step
```
