# Screen Generation Plan

## Purpose

MVP実装前に、全主要画面のデザインを生成し、画面方針を固める。

## Goal

```text
全主要画面を横画面で生成
レビュー
採用デザインをdocsに固定
実装開始
```

## Canonical Design Docs

画面生成時は必ず読む。

```text
docs/10-screen-design-spec.md
docs/11-design-generation-prompt.md
docs/16-match-layout-orientation.md
docs/17-screen-actions-and-requirements.md
docs/22-wildcard-ux-and-mahjong-feel.md
docs/23-deck-editor-ux-and-category-colors.md
docs/29-result-progression-collection.md
docs/30-first-run-and-playtest-loop.md
docs/37-visual-design-direction.md
docs/41-vampon-in-world-game-direction.md
docs/45-vampon-reference-gate.md
docs/46-landscape-first-web-responsive-policy.md
```

## Core Orientation Decision

```text
All main screens: 844x390 landscape-first
Web: responsive scale / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `portrait-first 390x844` 方針は使わない。

## Required Screens

### Landscape-first 844x390

```text
01 TOP
02 Deck List
03 Deck Detail
04 Deck Editor - Overview
05 Category Editor
06 Tile Editor
07 Win Role Editor
08 Special Bonus Editor
09 Score Bonus Editor
10 Rule Settings
11 Balance Check
12 Import / Export
13 Match Setup
14 Result
15 Collection / Role Collection
16 Clear Board
17 Cosmetic / Title Select minimal
18 Rotate Prompt
19 Confirm Dialog
20 Error Dialog
21 Match - Draw Phase
22 Match - Discard Phase
23 Match - Ron Reaction
24 Match - Win Available
25 Match - Menu Overlay
26 Rule Sheet Modal
```

### Component Sheets

```text
27 Tile Component Sheet
28 Button / Action Component Sheet
29 Player Mini Panel Sheet
30 Role Card / Score Breakdown Sheet
31 Category Color Palette Sheet
32 Achievement / Clear Board Tile Sheet
```

## Generation Order

```text
1. Visual System / Component Sheets
2. TOP / Deck List / Deck Detail / Match Setup
3. Deck Editor family
4. Match Landscape family
5. Result / Collection family
6. Dialogs / Rotate Prompt
```

## Batch 1: Visual System

```text
Tile Component Sheet
Button / Action Component Sheet
Player Mini Panel Sheet
Role Card / Score Breakdown Sheet
Category Color Palette Sheet
Achievement / Clear Board Tile Sheet
```

確認ポイント:

```text
Vamp-ponの紙/黒インク/ランタン光がある
牌名が読める
カテゴリ色が分かる
ボタン状態が分かる
横画面UIに流用できる
```

## Batch 2: Entry Screens

```text
TOP
Deck List
Deck Detail
Match Setup
```

横画面構成:

```text
左: 主要アクション
中央: デッキ/札箱/プレビュー
右: 最近の記録/設定/補助
```

## Batch 3: Deck Editor Family

```text
Deck Editor - Overview
Category Editor
Tile Editor
Win Role Editor
Special Bonus Editor
Score Bonus Editor
Rule Settings
Balance Check
Import / Export
```

横画面構成:

```text
左: タブ/一覧
中央: 編集フォーム
右: 牌プレビュー/警告/ライブテスト
```

## Batch 4: Match Landscape Family

```text
Match - Draw Phase
Match - Discard Phase
Match - Ron Reaction
Match - Win Available
Match - Menu Overlay
Rule Sheet Modal
```

横画面構成:

```text
中央: 全員の捨て牌
下: 自分の手牌8〜9枚
左右/上: 相手3人ミニパネル
右: アクションボタン
左または上: 残り枚数/ターン/候補役
```

確認ポイント:

```text
844x390横向きで自分の手牌が読める
相手3人が邪魔しない
全員の捨て牌が見える
直近捨て牌が分かる
押せるボタンだけ目立つ
ロン/あがるが気持ちいい
Vamp-pon世界の夜机/紙札/ランタン光に見える
```

## Batch 5: Result / Collection

```text
Result
Collection / Role Collection
Clear Board
Cosmetic / Title Select minimal
```

横画面構成:

```text
Result: 左=勝者/点数, 中央=役内訳, 右=報酬/次アクション
Collection: 左=フィルタ, 中央=グリッド, 右=詳細
Clear Board: 横長の記憶帳/達成ボード
```

## Batch 6: Utility Screens

```text
Rotate Prompt
Confirm Dialog
Error Dialog
```

確認ポイント:

```text
横画面固定が分かる
短く分かる
操作を邪魔しない
```

## Output Format

各画面生成後に残すもの。

```text
画面名
基準サイズ: 844x390 landscape
目的
情報優先度
ワイヤーフレーム
必要コンポーネント
主要状態
Web responsive注意点
実装注意点
採用/不採用判断
```

## Design Review Checklist

```text
横画面で成立しているか
Vamp-pon世界内の遊びに見えるか
1画面1目的になっているか
牌名が読めるか
カテゴリ色が意味を持っているか
画像なしでも成立するか
主要CTAが押しやすいか
説明が長すぎないか
```

## Final Gate Before Implementation

```text
横画面Component Sheetがある
TOP/Deck/Editor/Match/Result/Collectionの横画面採用案がある
Match横向き画面が破綻していない
Deck Editorが横画面で作りやすそうに見える
動物スターターで画面例が成立している
デザインから実装コンポーネント名に落とせる
Web responsive方針が見える
```

## Final Decision

全画面生成が終わるまでMVP本実装には入らない。

ただし、デザイン生成のための静的HTML/プロトタイプや画像生成prompt作成は進めてよい。
