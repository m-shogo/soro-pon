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
docs/48-responsive-crisp-ui-system.md
docs/49-ui-quality-gate-and-codex-design-rules.md
docs/50-pro-ui-production-quality-checklist.md
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/README.md
```

## Adopted Design Target

画面生成時は、以下の採用画像を参照する。

```text
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/01-top.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/02-deck-list.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/03-deck-detail.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/04-match-setup.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/05-deck-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/06-tile-editor.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/07-match-discard-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/08-match-win-or-ron-phase.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/09-result.png
docs/design-targets/generated/soro-pon-landscape-vampon-ui-v1/10-collection.png
```

参照画像は、色・余白・紙UI・黒インク・ランタン光・横画面の情報密度の基準にする。
画像そのものをruntime素材として直接使うことはしない。

## Core Orientation Decision

```text
All main screens: 844x390 landscape design reference
Phone landscape: 100svw x 100svh
Web: responsive layout / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `portrait-first 390x844` 方針は使わない。

844x390は実寸固定キャンバスではなく、画面密度・情報優先度・比率を揃えるためのデザイン基準にする。
実装時に画面全体を `transform: scale()` で引き伸ばすことは禁止する。

## Crisp Runtime Translation Rule

生成した画面を実装へ落とす時は、以下を守る。

```text
UI枠/アイコン/線/札枠はSVG優先
絵/背景/紙質感/インク汚れは高解像度PNG/WebP
文字は画像に焼き込まずHTML textで描画
重要UI寸法は整数pxへ丸める
紙パネルや手描き縁が必要な箇所だけ9-slice
```

画面生成物はそのままruntime画像にせず、コンポーネント・SVG・CSS・必要最小限のPNG/WebP素材へ分解する。

## UI Quality Rule

画面生成・UI分解・UI実装では、`docs/49-ui-quality-gate-and-codex-design-rules.md` を正とする。

```text
Codexはデザインを発明しない
採用済みデザインターゲット10枚をUI品質基準にする
tokens.css以外へ新しい色を勝手に追加しない
画面ごとの独自ボタン/独自パネルを作らない
UIはprimitives/components経由で実装する
Component Galleryを先に作る
```

## Pro UI Production Quality Rule

画面生成・UI分解・UI実装では、`docs/50-pro-ui-production-quality-checklist.md` も正とする。

```text
主要componentはstate matrixを持つ
motion / animationは意味がある場所だけに使う
typographyは分類とtokensで管理する
touch target / focus-visibleを守る
compact / normal / wide / desktop のdensity modeを考慮する
performance budgetを守る
polish pass checklistを通す
```

## Required Screens

### Landscape-first 844x390 Design Reference

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
33 SVG Frame / Icon Sheet
34 9-slice Paper Panel Sheet
35 Texture / Ink / Lantern Overlay Sheet
36 Component Gallery Reference Sheet
37 State Matrix Sheet
38 Motion / Typography / Density Sheet
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
SVG Frame / Icon Sheet
9-slice Paper Panel Sheet
Texture / Ink / Lantern Overlay Sheet
Component Gallery Reference Sheet
State Matrix Sheet
Motion / Typography / Density Sheet
```

確認ポイント:

```text
Vamp-ponの紙/黒インク/ランタン光がある
牌名が読める
カテゴリ色が分かる
ボタン状態が分かる
横画面UIに流用できる
SVG化できる枠/アイコン/線が分かる
9-sliceにすべき紙パネルが分かる
PNG/WebPにすべき質感素材が分かる
画面ごとの独自部品ではなく共通Component化できる
状態差分/motion/typography/densityが説明できる
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
左/上: 相手3人ミニパネル
右: アクションボタン
左または上: 残り枚数/ターン/候補役
```

確認ポイント:

```text
844x390横向き基準で自分の手牌が読める
スマホ横100svw x 100svhで崩れなさそう
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
基準サイズ: 844x390 landscape design reference
目的
情報優先度
ワイヤーフレーム
必要コンポーネント
主要状態
Web responsive注意点
実装注意点
採用/不採用判断
SVG化する部品
9-slice候補
PNG/WebP素材候補
文字をHTML textにする箇所
整数pxで管理すべきUI寸法
tokensに追加が必要なもの
Component Galleryに追加すべきもの
state matrix
motion / typography / density notes
performance / polish notes
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
画面全体scale前提になっていないか
文字入り画像に頼っていないか
SVG/9-slice/PNG/WebPの分解方針が見えるか
画面ごとの独自デザインを作っていないか
白い汎用WebアプリUIへ寄っていないか
state / motion / typography / densityが説明できるか
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
SVG/9-slice/PNG/WebPの使い分けが見える
Component Galleryで共通部品として確認できる
state matrix / motion / typography / density 方針が見える
```

## Final Decision

全画面生成が終わるまでMVP本実装には入らない。

ただし、デザイン生成のための静的HTML/プロトタイプや画像生成prompt作成は進めてよい。

UI実装の鮮明さ・レスポンシブ・素材形式の判断は `docs/48-responsive-crisp-ui-system.md` を正とする。
UI品質・Codexのデザイン境界・ダサくならないための実装制約は `docs/49-ui-quality-gate-and-codex-design-rules.md` を正とする。
UIの状態・motion・typography・touch target・density・performance・polishは `docs/50-pro-ui-production-quality-checklist.md` を正とする。
