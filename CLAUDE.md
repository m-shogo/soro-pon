# CLAUDE.md

Claude Code向けの作業指示。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Multi-skin runtime baseline: implemented
Skin foundation hardening H1-H11: implemented
  (H6 render-mode追加は必要性が証明されたときのみ / visual regressionはローカル実行のみ)
All P0 gates: passed
Official skins: yorunoshirube / cute-pop
Current next phase: アセット生産(candidates -> 人のレビュー -> final)を
  明示タスクとして開始可能。着手前にdocs/ASSET-PIPELINE.mdと
  docs/SKIN-DISTRIBUTION.mdを読むこと
```

過去の「Phase 1開始」「まずengineから」「H1から順に」は現在地ではありません。既存機能を壊さず、`docs/IMPLEMENTATION-WORKFLOW.md` と `docs/SKIN-FOUNDATION-HARDENING.md` の残項目・ゲートを確認して進めてください。

## Read First

```text
README.md
AGENTS.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
```

## Mandatory UI / Design / Skin Read

UI、CSS、token、component、asset、motion、responsive、skin loadingを扱う場合は必ず読む。

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

## Hardening Order

Do not skip ahead or combine all work into one change.

```text
H1 explicit typed skin-token allowlist
H2 full contract validator and pnpm skin:validate / CI
H3 semantic contrast and Cute Pop correction
H4 user-facing and Gallery SkinSelector
H5 layered SkinSurface and real nine-slice proof
H6 additional renderer modes only with tests and examples
H7 shared component and CSS responsibility migration
H8 DOM/accessibility/recovery tests and implementation
H9 Playwright visual regression and five-size QA
H10 installed/paid skin trust, versioned preload, atomic switching
H11 persistent matchSessionId idempotency before replay/restore
```

Each H item must finish tests, docs, commit, and push before moving on.

## Current Skin Rules

```text
yorunoshirube and cute-pop use the same screens and DOM responsibility
layout, hit areas, touch size, z-index, responsive behavior, focus, state meaning are immutable
skins change only explicit allowlisted typed presentation values
nine-slice/three-slice/repeat/cover/contain/overlay/mask use shared renderers
installed/paid skins cannot execute arbitrary CSS, JS, HTML, URLs, SVG by default, or external fonts
```

## Image Generation Boundary

During the current hardening phase:

```text
do not invoke image generation
do not create final PNG/WebP
do not write generated output into generated/final
build fallbacks, contracts, validators, shared components, and candidates workflow
```

Only after all P0 gates pass and an explicit asset-production task begins:

```text
generated output -> generated/candidates
preview and screenshot review
human approval
-> generated/final
```

## Shared Component Rule

Do not add screen-local generic controls. Use or extend centrally:

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

Review `docs/DEPENDENCY-POLICY.md` and add ADR before major dependencies, including DOM-test and visual-regression tools.

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
commands and local results
CI status or unavailable
skin/screen impact
screenshots/manual QA where relevant
remaining risks
next hardening item
```
