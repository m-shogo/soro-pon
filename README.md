# soro-pon

`soro-pon` は、プレイヤーがデッキ・牌・役・得点を自由に作れる、3〜4人用のローカルファーストなカスタム牌ゲームです。

Vamp-pon世界の中で遊ばれている「記憶札遊び」として扱います。

## Current Status

```text
Gameplay MVP phases 1-14: complete
Multi-skin runtime baseline: complete
Skin foundation hardening H1-H11: complete
Official skins: yorunoshirube (9 finals, v4) / cute-pop (9 finals, v5)
Image production pipeline: ready and proven (Codex CLI起点、request 007 closed)
Batch 5 (full-screen integration / automated QA / public demo gate review): complete
  Gate 4 (User Test Ready): PASS
  Gate 5 (Public Demo Ready): PASS, strictly within the validated
    Chromium (Desktop Chrome) browser scope — Safari/Firefox/WebKit/
    real mobile devices are NOT TESTED and NOT claimed supported.
  All Batch 5 QA (including gameplay) was performed by Chromium browser
    automation (Playwright), not by human manual testing or on a real
    device.
  See docs/qa/BATCH-5-MANUAL-QA-REPORT.md for full evidence and decision record.
Batch 6 (Gate 6: Release Candidate hardening): complete
  Gate 6: PASS, within the validated Chromium browser scope.
  RC readiness: LIMITED READY (open items: real screen-reader pass,
    non-Chromium browser verification, longer memory soak test, real
    deploy target — none are Gate 6 blockers, all explicitly tracked).
  Fixed 2 real P1 storage-layer defects found this batch: a single
    corrupted/legacy deck entry could previously wipe a user's entire
    deck list (now salvaged per-deck), and a quota-exceeded save
    previously failed silently with no user feedback (now shown via
    Toast, draft preserved).
  See docs/qa/BATCH-6-GATE-6-REPORT.md for full evidence and decision record.
Batch 7 (Cross-Browser & Screen Reader Acceptance): complete
  Not a new Gate — Gate 6 remains PASS, unchanged. Extends RC readiness's
    verified browser scope from Chromium-only to Chromium + Firefox +
    Playwright WebKit (all three: 0 P0/P1/P2, full functional/visual/
    accessibility parity). "Playwright WebKit" is Playwright's own
    WebKit build, NOT real Safari — real Safari, iOS Safari, and Android
    physical devices remain untested and unclaimed.
  Real macOS VoiceOver acceptance was attempted and BLOCKED (the user
    denied the computer-use browser-access grant needed to drive Safari
    under VoiceOver) — recorded honestly, not claimed as passed. NVDA/
    JAWS were not used (no Windows environment available).
  RC readiness: still LIMITED READY (upgraded in browser-engine scope,
    but real-device and real-screen-reader verification remain open).
  See docs/qa/BATCH-7-CROSS-BROWSER-A11Y-REPORT.md for full evidence and
    decision record.
Batch 8 (macOS VoiceOver Acceptance): CONDITIONAL (attempt 4)
    — was BLOCKED across attempts 1-3, then CONDITIONAL on attempt 4
    after the user granted macOS TCC Accessibility + Automation
    permissions. Targeted the specific Batch 7 open item of real
    screen-reader acceptance. Real Safari is only viewable (not drivable)
    via the available automation tooling, so this used VoiceOver + Chrome
    (a real pairing — VoiceOver does support Chrome; NOT VoiceOver +
    Safari).
  Attempts 1-3 (2026-07-21, BLOCKED): the VoiceOver quickstart dialog,
    then VoiceOver-as-frontmost blocking computer-use, then missing
    macOS Accessibility/Automation trust — none of the 20 flows reached.
  Attempt 4 (2026-07-23, CONDITIONAL): with TCC permissions granted,
    real VoiceOver was driven via osascript System Events (VO+arrow,
    VO+Space, Tab/Escape) and observed via AXFocusedUIElement reads.
    ~12-13 of 20 flows confirmed with genuine real-VoiceOver signal on
    the core screens — TOP (title + all 5 main buttons as named
    AXButtons), JSON import (textarea label "デッキJSON" + validation
    error), Deck Editor (tabs as an AXRadioButton group with counts,
    form fields with correct labels/values), and the unsaved-changes
    dialog (opens with focus on a named button). Zero product defects
    found. Match Setup / Match / Result were reached but could not be
    cleanly traversed under the VoiceOver cursor due to a
    CDP-vs-VoiceOver focus-sync tooling limitation (not a product
    defect). VoiceOver was turned off at session end.
  No product code changed (no defect was found to fix). All existing
    suites remain green, zero regressions.
  RC readiness: unchanged, still LIMITED READY — attempt 4 narrowed the
    screen-reader gap (core screens now have real VoiceOver
    confirmation) but did not close it (game-play screens' real
    screen-reader traversal is still open).
  See docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md for the full
    attempt log (incl. the Attempt 4 section) and decision record.
Current phase: further RC hardening (not yet scoped — see
  "Next Fixed Task" in docs/qa/BATCH-8-VOICEOVER-ACCEPTANCE-REPORT.md)
```

正確な現在地と実装順:

```text
docs/IMPLEMENTATION-WORKFLOW.md
docs/SKIN-FOUNDATION-HARDENING.md
docs/ASSET-PRODUCTION-ROADMAP.md  (slot classification / batches / next task)
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

## Hardening Order (H1-H11: complete)

```text
H1 typed skin-token allowlist                          complete
H2 full contract validator and CI                       complete
H3 semantic contrast and Cute Pop fixes                 complete
H4 Gallery and user-facing SkinSelector                 complete
H5 layered SkinSurface and real nine-slice proof         complete
H6 proven central render modes                          complete (implemented only when proven necessary; no unconditional rollout)
H7 shared component and CSS responsibility migration     complete
H8 DOM/accessibility/recovery tests and fixes            complete
H9 Playwright visual regression and five-size QA         complete (70 cases, 5 sizes, both skins)
H10 installed/paid skin security and atomic loading      complete (marketplace/payment/entitlement remain future scope)
H11 persistent match-session idempotency before restore/replay  complete (restore/replay feature itself remains non-MVP)
```

Details and any documented exceptions: docs/SKIN-FOUNDATION-HARDENING.md.

## Image Generation Status

All P0 gates passed. Image production is active.

```text
Codex CLI起点で画像を生成する(高彩度単色グリーン背景)
-> Python透過(色距離+2段しきい値+despill)
-> 検査
-> generated/candidates(manifest未登録)
-> Gallery/実画面レビュー
-> 人間の承認
-> generated/final(skin.json経由でのみ参照)
```

Never generate directly into `final`. First proof-of-concept cycle (request
007, cute-pop / badge.info.background) is closed. See
docs/ASSET-PRODUCTION-ROADMAP.md for the full slot classification, batch
order, and the single next task.

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

## Public Demo Notes

```text
local-first demo: decks and progress are stored only in this browser's localStorage
imports are validated (schema + unsafe-key rejection) before a deck can be played
locally imported or private images are never included in shared deck JSON
no online multiplayer, no accounts, no billing, no cloud sync
supported skins: yorunoshirube, cute-pop (both official, both complete)
verified browser scope for this demo: Chromium (Desktop Chrome), Firefox, and Playwright WebKit (desktop, engine-level) — real Safari, iOS Safari, and Android physical devices are not tested and not claimed supported
reset path: TOP screen -> "ローカルデータを初期化…" (irreversible, explained in the confirmation dialog)
```

See docs/qa/BATCH-5-MANUAL-QA-REPORT.md for the full QA evidence behind this notice.

## Final Decision

Continue the existing multi-skin foundation from H1. The goal is a reusable game UI that can switch between Yorunoshirube, Cute Pop, and future skins without changing game logic, state, layout, hit areas, or accessibility behavior.
