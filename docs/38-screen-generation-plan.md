# Screen Generation Plan

## Purpose

MVP実装前に、全主要画面のデザインを生成し、画面方針を固める。

## Goal

```text
全画面のデザイン生成
↓
レビュー
↓
採用デザインをdocsに固定
↓
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
```

## Required Screens

### Portrait-first 390x844

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
```

### Landscape-first 844x390

```text
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

デザイン生成はこの順番にする。

```text
1. Visual System / Component Sheets
2. TOP / Deck List / Deck Detail
3. Deck Editor family
4. Match Landscape family
5. Result / Collection family
6. Dialogs / Rotate Prompt
```

理由:

```text
コンポーネントを先に固めると全画面の統一感が出る
Deck Editorは画面数が多いので早めに確認する
Matchは横向きで特殊なので単独で固める
Result/Collectionは継続導線なので最後に磨く
```

## Batch 1: Visual System

生成対象:

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
牌名が読める
カテゴリ色が分かる
オールマイティが分かる
ボタン状態が分かる
Clear Boardのマスを埋めたくなる
```

## Batch 2: Entry Screens

生成対象:

```text
TOP
Deck List
Deck Detail
Match Setup
```

確認ポイント:

```text
すぐ遊べる
動物スターターが分かる
通常版/拡張版の切替が分かる
3人/4人選択が分かる
```

## Batch 3: Deck Editor Family

生成対象:

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

確認ポイント:

```text
カテゴリ色を作りやすい
牌を作りやすい
役をテンプレから作りやすい
得点目安が分かる
テスト手札で確認できる
警告から修正に行ける
```

## Batch 4: Match Landscape Family

生成対象:

```text
Match - Draw Phase
Match - Discard Phase
Match - Ron Reaction
Match - Win Available
Match - Menu Overlay
Rule Sheet Modal
```

確認ポイント:

```text
844x390横向きで自分の手牌が読める
相手3人が邪魔しない
直近捨て牌が分かる
押せるボタンだけ目立つ
ロン/あがるが気持ちいい
```

## Batch 5: Result / Collection

生成対象:

```text
Result
Collection / Role Collection
Clear Board
Cosmetic / Title Select minimal
```

確認ポイント:

```text
勝利/流局が分かる
役内訳が読める
コイン獲得が気持ちいい
称号/実績解除が嬉しい
もう一局/デッキ調整に戻りやすい
Clear Boardを埋めたくなる
```

## Batch 6: Utility Screens

生成対象:

```text
Rotate Prompt
Confirm Dialog
Error Dialog
```

確認ポイント:

```text
短く分かる
操作を邪魔しない
危険操作は確認できる
```

## Output Format

各画面生成後に残すもの。

```text
画面名
基準サイズ
目的
情報優先度
ワイヤーフレーム
必要コンポーネント
主要状態
実装注意点
採用/不採用判断
```

## Design Review Checklist

全画面共通。

```text
1画面1目的になっているか
牌名が読めるか
カテゴリ色が意味を持っているか
画像なしでも成立するか
主要CTAが親指で押せるか
説明が長すぎないか
強さを買うUIに見えないか
既存IP連想の公式UIになっていないか
```

## Final Gate Before Implementation

実装開始前に以下を満たす。

```text
Component Sheetがある
TOP/Deck/Editor/Match/Result/Collectionの採用案がある
Match横向き画面が破綻していない
Deck Editorが作りやすそうに見える
動物スターターで画面例が成立している
デザインから実装コンポーネント名に落とせる
```

## Final Decision

全画面生成が終わるまでMVP本実装には入らない。

ただし、デザイン生成のための静的HTML/プロトタイプや画像生成prompt作成は進めてよい。
