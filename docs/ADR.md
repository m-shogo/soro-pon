# Architecture Decision Records

## Purpose

This file records major decisions and why they were made.

Use this to understand why the current MVP is shaped this way.

## ADR-001: 3-4 Players Only

Decision:

```text
Soro-pon MVP supports 3-4 players only.
2-player match is not supported.
```

Reason:

```text
The game is intended as a table tile game with discard/reaction rhythm.
2-player rules would require different balance and UX.
```

## ADR-002: normalThreeGroups As MVP Core

Decision:

```text
Normal MVP uses 8 tiles before draw, 9 after draw, and 3 groups x 3 tiles to win.
```

Reason:

```text
This gives a clear Donjara/mahjong-like structure that can be explained, tested, and rendered.
```

Rejected:

```text
count-only normal win roles as the core model
```

## ADR-003: extendedRoleSpan Deferred

Decision:

```text
extendedRoleSpan is schema-reserved but engine pending.
```

Reason:

```text
2-14 tile role spans conflict with normal 3-group evaluation unless separated by mode.
MVP should ship a stable core first.
```

## ADR-004: Group-backed WinRoles

Decision:

```text
Normal MVP winRoles must be group-backed.
```

Reason:

```text
Groups make role explanation, wait calculation, wildcard assignment, discard preview, and scoring understandable.
```

Rejected:

```text
mammal >= 6 as a standalone normal winRole
```

## ADR-005: One selectedWinRole Provides Base Score

Decision:

```text
When multiple winRoles match, one selectedWinRole provides basePoints.
Other winRoles do not stack base score.
```

Reason:

```text
Stacking multiple base win roles makes scores explode and results hard to trust.
```

## ADR-006: scoreBudget Is Validation Budget, Not Hidden Clamp

Decision:

```text
scoreBudget lives on each variant and drives warnings/defaults.
It does not silently clamp player-visible score.
```

Reason:

```text
Silent score clamp would make results feel untrustworthy.
```

## ADR-007: Strict Import Allowlist

Decision:

```text
Shared JSON import is allowlist-based and rejects unknown/unsafe fields.
```

Reason:

```text
Import is the highest-risk boundary for images, URLs, scripts, local state, future fields, and hidden behavior.
```

## ADR-008: Images Are Local-only

Decision:

```text
Shared JSON contains no images or image references.
Images may be local-only in the future and are not exported.
```

Reason:

```text
This avoids privacy leaks, tracking, remote content risk, copyright issues, and broken shared decks.
```

## ADR-009: UI Does Not Own Rules

Decision:

```text
UI renders engine facts and does not calculate role completion, score, ron/tsumo, or wildcard assignment.
```

Reason:

```text
Duplicated rule logic causes inconsistent behavior and hard-to-debug UI bugs.
```

## ADR-010: Facts, Not Best-move Advice

Decision:

```text
InsightEngine shows board facts, not commands.
```

Reason:

```text
Players should feel they made the choice. Over-guidance makes the game feel like it is playing itself.
```

## ADR-011: Engine First, UI Second

Decision:

```text
domain/schema/engine/tests must be built before full Match UI.
```

Reason:

```text
A pretty UI on unstable rules creates expensive rewrites.
```

## ADR-012: Safe Creator Templates

Decision:

```text
Simple creator mode uses safe templates and cannot create broken structural rules.
```

Reason:

```text
Preventing broken deck creation is better than only warning after the deck is broken.
```

## ADR-013: DOM Component Test Layer

Decision:

```text
Add jsdom + @testing-library/react + @testing-library/user-event as devDependencies.
Component tests opt in per-file with "// @vitest-environment jsdom".
Engine/schema/storage tests stay in the default node environment.
```

Reason:

```text
P1-1/P1-3 require testing focus traps, keyboard navigation, aria states, and
skin switching without state loss. These cannot be verified without a DOM.
Testing Library is the de facto standard, tests behavior not implementation,
and adds no runtime dependency.
```

## ADR-014: Playwright Visual Regression

Decision:

```text
Add @playwright/test as a devDependency (Chromium only).
Visual specs live in tests/visual and run with `pnpm test:visual`
against the built app (vite preview). Baselines are committed and
recorded on macOS (darwin suffix). CI does not run visual tests yet;
adding a Linux baseline job is a separate decision when CI-time
font rendering is pinned.
```

Reason:

```text
P1-2 requires screenshot comparison of major screens in both official
skins at five sizes. Playwright is the referenced tool in
docs/SKIN-FOUNDATION-HARDENING.md. Japanese system fonts differ across
OSes, so cross-OS baselines would produce false diffs; local darwin
baselines give deterministic results now without blocking CI.
```

## ADR-015: Tile State Slots Composite Over Base (SHARED_OVERLAY_RECOMMENDED)

Decision:

```text
Decision: SHARED_OVERLAY_RECOMMENDED
tile.face.selected / tile.face.ronAvailable / tile.face.tsumoAvailable は
「base牌面を置き換える別full画像」ではなく「tile.face.base(表)/tile.back.base(裏)の
上へ合成される状態レイヤー」として扱う。
TileCardは常にbase slotのSkinLayerを描き、状態slotは解決できた場合のみ
2枚目のSkinLayerとして上へ重ねる。
状態slot用の新規アート生産は行わない(状態はCSS/DOM stateで既に伝達済み)。
SKIN-CONTRACT.jsonのslot定義・skin.json・manifest schemaは変更しない。
```

Reason (evidence):

```text
1. resolveSkin()/useSkinAsset()にslot間fallbackは存在しない
   (tile.face.selectedが未定義でもtile.face.baseへは落ちない)。
   旧実装(状態ごとにslotを差し替える単一SkinLayer)のまま
   tile.face.baseだけをfinal化すると、牌を選択した瞬間だけ
   面画像が消えてCSS gradientに落ちる統合バグになる。
2. 状態の伝達はすでに画像非依存で成立している:
   CSS(.sp-tile--selected: translateY+lantern border+shadow /
   .sp-tile--win: 強lantern) + aria-pressed + aria-label文言(P1-3)。
3. 状態ごとのfull画像はbase面とほぼ全面重複し、スキン1つあたり
   牌アートを4倍(表3状態+base)にする一方、状態識別性はCSSより悪化しうる。
4. 契約上、状態slotはすべてtransparent:trueで、上乗せ合成と両立する。
   両officialスキンとも牌slotのfinal画像は0のため、置き換え→合成への
   意味変更で影響を受ける既存アセットは存在しない。
```

State priority (slotFor既存実装を維持):

```text
faceDown > ron > tsumo > selected > base
(faceDown時は状態レイヤーなし。ron/tsumoはselectedより優先し同時表示しない)
```

Rejected:

```text
KEEP_SEPARATE(状態ごとの独立full画像): アート量4倍・状態視認性リスク・
  選択瞬間の画像消失バグの原因。
CONTRACT_CHANGE_REQUIRED(overlay専用slotへのmigration): 現契約の
  transparent stretch slotのままで合成が成立するため不要。
BLOCKED_BY_RUNTIME_STATE_MODEL: 該当せず(state modelは単一優先slotで
  合成順が一意に決まる)。
```

## Final Decision

Add new ADR entries when a decision changes architecture, rules, import/security, scoring, or implementation order.
