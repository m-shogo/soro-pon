# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用のローカルファーストなカスタム牌ゲームです。

Vamp-pon世界の中で遊ばれている「記憶札遊び」として扱います。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Tests at last recorded hardening: 218 green
Current next work: multi-skin design-system foundation
Final PNG generation: later separate reviewed phase
```

現在は、機能追加を先行する段階ではなく、次の基盤を整える段階です。

```text
one stable layout/component system
multiple validated visual skins
shared reusable UI components
safe skin switching
nine-slice and other shared render modes
future paid-skin compatibility
```

公式初期スキン:

```text
yorunoshirube
- 夜の机 / 紙 / 黒インク / ランタン光 / 記憶帳

cute-pop
- 一般向け / 明るい / 可愛い / 親しみやすい / ポップ
```

## Product Core

このアプリは麻雀そのものではありません。ルールはドンジャラ構造です。

```text
3〜4人用
2人戦なし
ポン/チー/カンなし
通常手牌8枚
自分の番で1枚引いて9枚
あがり形は3枚グループ×3組
ロン = 8枚手牌 + 捨て牌 = 9枚
ツモ = 引いた後の9枚
```

UIの卓上感や操作の気持ちよさは麻雀を参考にしますが、ルールは麻雀化しません。

## First Read for AI Agents

作業前に必ず読むこと。

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/GLOSSARY.md
```

仕様の正本:

```text
docs/MASTER-SPEC.md
```

現在地・完了Phase・次の作業:

```text
docs/IMPLEMENTATION-WORKFLOW.md
```

番号付きdocsが衝突する場合は、非番号の現行契約docsを優先します。

## Mandatory UI / Design / Skin Read

画面、コンポーネント、CSS、token、asset、motion、responsiveを触る場合は、プロンプトに書かれていなくても必ず以下を読んでください。

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

## Current Design Contract

```text
one MatchScreen / one Button / one TileCard implementation
skin-specific screen copies are forbidden
layout, hit areas, DOM responsibility, state meaning are skin-invariant
skin changes colors, textures, frames, approved fonts, ornaments, and effects
both official skins work without final images
screen-local generic buttons/panels/dialogs are forbidden
new reusable UI goes through shared components and Component Gallery
```

### Shared render modes

```text
nine-slice-stretch
nine-slice-tile
three-slice-x
three-slice-y
stretch
repeat / repeat-x / repeat-y
cover
contain
overlay
mask
```

Nine-slice is implemented through shared `SkinSurface`-type renderers, not separately inside each screen.

### Shared components

Common UI must use shared components such as:

```text
Button / IconButton
SkinSurface / SkinBackground / SkinOverlay / SkinIcon
PaperPanel
Modal / Dialog
Tabs / Badge / Toast / Tooltip
TileCard / TileRow
RoleCard / ScoreBreakdown
SectionHeader
ValidationIssueList
FormField / TextField / NumberField / SelectField / Toggle
EmptyState / ErrorState
SkinSelector / SkinPreviewCard
```

## Image Generation Boundary

The current skin-system foundation phase does not generate final images.

Current work creates:

```text
skin switching
shared components
asset slots
size/safe-area/render contracts
CSS/SVG fallback
future image lists and generation prompts
candidate/final directories
skin validation
```

Later image production flow:

```text
generate/draw
-> generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update
```

Do not generate directly into `final`.

## Design Targets

Yorunoshirube reference folder:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

Local absolute path:

```text
/Users/m-shogo/Developer/personal/soro-pon/docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1
```

These are references for composition, spacing, hierarchy, and mood. They are not automatically runtime assets.

## Layout Policy

```text
844x390 reference
phone landscape = 100svw x 100svh
PC = centered game table + outer support
portrait = rotate prompt or limited utility
```

844x390 is a design reference, not a fixed canvas. Do not stretch the whole screen with `transform: scale()`.

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

Do not add major dependencies without reviewing:

```text
docs/DEPENDENCY-POLICY.md
docs/ADR.md
```

Normal UI remains HTML/CSS. Three.js is optional only for isolated future effects with fallback and ADR approval.

## Coding Boundaries

```text
UI does not judge roles, calculate score, or assign wildcards
engine does not import React/DOM/localStorage/CSS
import uses strict allowlist
unknown fields are rejected
shared deck JSON contains no image/URL/base64/path/html/script/style fields
localStorage is schema-parsed before use
engine does not directly use Math.random or Date.now
skin never accesses engine/game records/network/code execution
```

## Vamp-pon Reference Policy

When using Vamp-pon world/visual material, read:

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
docs/42-shared-vampon-source-policy.md
docs/45-vampon-reference-gate.md
```

The `vamp-pon` repository is read-only from this project.

## IP / Asset Safety

Official assets and screenshots must not contain:

```text
existing IP art
unlicensed downloads
personal photos
remote hotlinked assets
user-deck images promoted into official UI
text baked into runtime UI images
```

## Commit / Report Policy

```text
one commit per purpose
small testable changes
push after commit
docs and implementation updated together
```

Report:

```text
changed files
commit SHA
implemented scope
verification
remaining scope
next step
```

## Final Decision

The priority is a stable, reusable game UI that can switch between Yorunoshirube, Cute Pop, and future skins without changing game logic, layout, or interaction behavior.