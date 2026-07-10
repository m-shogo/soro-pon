# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用のローカルファーストなカスタム牌ゲームです。

Vamp-pon世界の中で遊ばれている「記憶札遊び」として扱います。

## Current Status

```text
Gameplay MVP phases 1-14: implemented
Multi-skin runtime baseline: implemented / partial
Active work: docs/SKIN-FOUNDATION-HARDENING.md H1 -> H11
Official skins: yorunoshirube / cute-pop
Final PNG/WebP generation: blocked until all P0 gates pass
```

正確な現在地と実装順:

```text
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
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

## Official Skins

```text
yorunoshirube
- 夜の机 / 紙 / 黒インク / ランタン光 / 記憶帳

cute-pop
- 一般向け / 明るい / 可愛い / 親しみやすい / ポップ
```

将来の季節・販売スキンも、同じscreen/component/layout実装を使います。

## First Read for AI Agents

```text
README.md
AGENTS.md
CODEX.md or CLAUDE.md
docs/README.md
docs/MASTER-SPEC.md
docs/IMPLEMENTATION.md
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/GLOSSARY.md
```

仕様の正本:

```text
docs/MASTER-SPEC.md
```

番号付きdocsが衝突する場合は、非番号の現行契約docsを優先します。

## Mandatory UI / Design / Skin Read

画面、コンポーネント、CSS、token、asset、motion、responsive、skin loadingを触る場合は必ず読む。

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

## Current Design Contract

```text
one MatchScreen / one Button / one TileCard implementation
skin-specific screen copies are forbidden
layout, hit areas, touch size, z-index, responsive behavior, and semantic states are skin-invariant
skins change only explicit typed allowlisted presentation values
both official skins work without final images
screen-local generic buttons/panels/dialogs/forms are forbidden
new reusable UI goes through shared components, Gallery, tests, and both skins
```

## Active Hardening Order

```text
H1 typed skin-token allowlist
H2 full contract validator and CI
H3 semantic contrast and Cute Pop fixes
H4 Gallery and user-facing SkinSelector
H5 layered SkinSurface and real nine-slice proof
H6 proven central render modes
H7 shared component and CSS responsibility migration
H8 DOM/accessibility/recovery tests and fixes
H9 Playwright visual regression and five-size QA
H10 installed/paid skin security and atomic loading
H11 persistent match-session idempotency before restore/replay
```

Do not skip directly to image generation.

## Image Generation Boundary

Current hardening work does not generate final images.

```text
build contracts, selectors, shared components, fallbacks, validators, and asset requests
```

Only after all P0 gates pass and the user explicitly starts asset production:

```text
generate/draw
-> generated/candidates
-> preview and screenshot review
-> human approval
-> generated/final
-> manifest update
```

Never generate directly into `final`.

## Existing Skin Baseline

```text
public/assets/ui/soro-pon/SKIN-MANIFEST.json
public/assets/ui/soro-pon/SKIN-CONTRACT.json
public/assets/ui/soro-pon/skins/{base,yorunoshirube,cute-pop}
src/ui/skins/*
SkinProvider runtime switching
basic SkinSurface
initial shared-component integration
```

Preserve and harden this implementation. Do not add a second theme system.

## Shared Component Direction

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

A feature is incomplete when it works in only one skin.

## Design Targets

Yorunoshirube reference:

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/
```

Local path:

```text
/Users/m-shogo/Developer/personal/soro-pon/docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1
```

These are references for composition, spacing, hierarchy, and mood—not automatic runtime assets.

## Layout Policy

```text
844x390 reference
phone landscape = 100svw x 100svh
PC = centered game table + outer support
portrait = rotate prompt or limited utility
```

844x390 is not a fixed canvas. Do not scale the whole screen with `transform: scale()`.

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

## Verification

Current:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Required after H2:

```bash
pnpm skin:validate
```

Component/DOM and Playwright commands are added only after the dependency/ADR decision.

## Coding Boundaries

```text
UI does not judge roles, calculate score, or assign wildcards
engine does not import React/DOM/localStorage/CSS
import uses strict allowlist
shared deck JSON contains no image/URL/base64/path/html/script/style fields
localStorage is schema-parsed before use
skin never accesses engine/game records/network/code execution
```

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
one hardening item completed before the next
```

Report changed files, commit SHA, commands/local results, CI status or unavailable, affected skins/screens, visual proof, remaining risk, and next hardening item.

## Final Decision

Continue the existing multi-skin foundation from H1. The goal is a reusable game UI that can switch between Yorunoshirube, Cute Pop, and future skins without changing game logic, state, layout, hit areas, or accessibility behavior.
