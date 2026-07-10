# AGENTS.md

このrepoでAIエージェントが作業するときの必須ルール。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Current next phase: multi-skin design-system foundation
Official skins: yorunoshirube / cute-pop
Final image generation: later separate phase
```

「MVP Phase 1から実装開始」は古い状態です。既存実装を壊さず、現在地は `docs/IMPLEMENTATION-WORKFLOW.md` で確認してください。

## Read First

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
```

仕様の正本は `docs/MASTER-SPEC.md`。

番号付きdocsや過去プロンプトと衝突した場合は、現行の非番号契約docsを優先します。

## Mandatory UI / Design / Skin Read

UI、CSS、コンポーネント、asset、motion、responsive、画像受入構造を扱う場合は、プロンプトに書かれていなくても必ず読む。

```text
docs/DESIGN-SYSTEM.md
docs/SKIN-SYSTEM.md
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
skin only changes validated presentation
common buttons/panels/dialogs/forms/tiles are shared components
nine-slice and other image modes are implemented only through shared Skin renderers
both official skins must work with CSS/SVG fallback
```

Forbidden:

```text
screen-local generic Button/Panel/Dialog
hardcoded PNG paths
hardcoded visual colors in screens
skin-controlled layout or click area
CutePopMatchScreen / YorunoshirubeMatchScreen style duplication
arbitrary CSS/JS/external URL in future installed skins
```

## Foundation Image Boundary

Current foundation work does not generate final images.

```text
build contracts, switching, components, fallbacks, validator, asset request lists
future generated output -> candidates
human review -> final
```

Do not invoke image generation or write generated files into `final` unless the task explicitly enters the separate asset-production phase.

## New Feature Gate

For new screens, buttons, states, or components:

```text
1. reuse shared component
2. add reusable variant centrally if needed
3. add semantic/component token
4. add asset slot only for a new visual responsibility
5. define render/size/safe-area/fallback contract
6. update base + yorunoshirube + cute-pop
7. add Component Gallery coverage
8. verify both skins and required sizes
9. then integrate the screen
```

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

Report changed files, commit SHA, tests/typecheck/build, remaining risks, and next step.