# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11 (P0/P1/P2): complete
Official skins: yorunoshirube / cute-pop
Image production: 稼働中(request 007 closed)。正本は
  docs/ASSET-PRODUCTION-ROADMAP.md(slot分類・バッチ順・次タスク)
Current next phase: 公式アセット生産バッチ(次タスクはロードマップ参照)
```

「MVP Phase 1から実装開始」「H1から順に実装」は古い状態です。既存実装を壊さず、現在地は `docs/IMPLEMENTATION-WORKFLOW.md` と `docs/ASSET-PRODUCTION-ROADMAP.md` で確認してください。

## Read First

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

仕様の正本は `docs/MASTER-SPEC.md`。現在のUI実装順は `docs/SKIN-FOUNDATION-HARDENING.md`。

番号付きdocsや過去プロンプトと衝突した場合は、現行の非番号契約docsを優先します。

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

## Hardening Order (H1-H11: complete)

```text
H1 token allowlist and typed validation                 complete
H2 skin:validate and CI integration                     complete
H3 semantic contrast and Cute Pop fixes                  complete
H4 SkinSelector and Gallery switching                    complete
H5 layered SkinSurface and real nine-slice proof         complete
H6 proven renderer-mode completion                       complete (only where proven necessary)
H7 shared-component and CSS responsibility migration      complete
H8 DOM/accessibility/recovery tests and fixes             complete
H9 Playwright visual regression and five-size QA          complete (32 cases, 5 sizes, both skins)
H10 external/paid skin security and atomic loading        complete (marketplace/commerce is future scope)
H11 persistent match-session idempotency before restore/replay  complete (restore/replay feature itself is non-MVP)
```

Detail and exceptions: `docs/SKIN-FOUNDATION-HARDENING.md`.
Use small commits. Each item finished tests, docs, commit, and push before the next.

## Image Production — Active

All P0 gates passed. Asset production is the current phase.

```text
generate/draw (Codex CLI起点) -> generated/candidates
-> human review -> generated/final -> manifest update
```

Never write generated output directly into `final`. Current slot
classification, batch order, and the single next task:
`docs/ASSET-PRODUCTION-ROADMAP.md`.

## New Feature Gate

For new screens, buttons, states, or components:

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

When world/character/enemy/stage/item/visual lore is involved:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

```text
one commit per purpose
small testable changes
push after commit
update docs with implementation
```

Report changed files, commit SHA, tests/typecheck/build/skin validation, CI status or unavailable, affected skins/screens, visual proof, remaining risks, and next step.
