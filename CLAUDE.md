# CLAUDE.md

Claude Code向けの作業指示。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Current next phase: multi-skin design-system foundation
Official skins: yorunoshirube / cute-pop
Final image generation: later separate reviewed phase
```

過去の「Phase 1開始」「まずengineから」は現在地ではありません。既存機能を壊さず、`docs/IMPLEMENTATION-WORKFLOW.md` の最新状態から進めてください。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
```

## Mandatory UI / Design / Skin Read

UI、CSS、token、component、asset、motion、responsiveを扱う場合は必ず読む。

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

Claude Codeは画面ごとにデザインを発明しません。

```text
one layout and component system
multiple validated skins
no skin-specific screen copies
shared components before screen-local markup
Design Tokens before raw visual values
asset slots before hardcoded image paths
Component Gallery before broad screen rollout
```

## Current Skin Rules

```text
yorunoshirube and cute-pop use the same screens and DOM responsibility
layout, hit areas, tile ratio, responsive behavior, focus, state meaning are immutable
skins change validated colors/textures/frames/approved fonts/effects only
nine-slice/three-slice/repeat/cover/contain/overlay/mask use shared Skin renderers
installed/paid skins cannot execute arbitrary CSS, JS, HTML, URLs, or fonts
```

## Image Generation Boundary

During the current foundation phase:

```text
do not invoke image generation
do not put generated images in final
build CSS/SVG fallback for both official skins
record asset slots, geometry contracts, asset requests, and future prompts
```

Later explicit asset production:

```text
generated output -> candidates
preview and screenshot review
human approval
-> final
```

## Shared Component Rule

Do not add screen-local generic controls.

Use or extend centrally:

```text
Button / IconButton
SkinSurface / SkinBackground / SkinOverlay / SkinIcon
PaperPanel
Modal / Dialog
Tabs / Badge / Toast / Tooltip
TileCard / TileRow
SectionHeader
ValidationIssueList
shared form fields
EmptyState / ErrorState
SkinSelector / SkinPreviewCard
```

Every reusable variant/state goes into Component Gallery and is checked in both official skins.

## Architecture Boundary

```text
UI does not implement role/scoring/wildcard logic
engine does not import React/DOM/localStorage/CSS
skin does not access engine/schema/storage/records/network
shared deck JSON does not contain images/URLs/executable display data
```

## Orientation

```text
844x390 reference
phone landscape: 100svw x 100svh
PC: centered table + outer support
portrait: rotate prompt or limited utility
```

Do not use whole-screen `transform: scale()`.

## Stack

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

Review `docs/DEPENDENCY-POLICY.md` and add ADR before major dependencies.

## Vamp-pon Reference

When using world/visual lore:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only.

## Work and Report

Use small, testable commits and push each completed purpose.

Report:

```text
changed files
commit SHA
implementation scope
tests/typecheck/build
screenshots/manual QA where relevant
remaining scope and risks
next step
```