# Screen Design Spec

## Purpose

将来的に、対戦画面・Editor画面・結果画面などのデザインをこのrepo内の情報から生成できるようにする。

AIに画面を作らせるときは、このファイルを必ず参照する。

## Design Generation Rule

画面デザインを生成するときは、以下を守る。

- ルールは `docs/02-game-rules.md` を正とする
- データ構造は `docs/03-data-model.md` を正とする
- 共有・画像方針は `docs/04-sharing-and-local-images.md` を正とする
- IP/UGC方針は `docs/05-ip-and-ugc-policy.md` を正とする
- デザイン原則は `docs/06-design-principles.md` を正とする

AIは、見た目を作るためにルールを変えてはいけない。

## Target Device

最初の主要ターゲットはスマホ縦画面。

基準サイズ:

```text
390 x 844
```

対応想定:

- iPhone標準幅
- Android標準幅
- Safe areaあり
- 片手操作しやすいUI

## Global Layout Principles

- 1画面1目的
- 主役を1つに絞る
- 画面上部は状態
- 画面中央は操作対象
- 画面下部は主要アクション
- 重要なボタンは親指で押しやすい位置
- 小さい文字を多用しない

## Common Components

### Tile Card

牌の表示。

```text
┌────────────┐
│            │
│  image     │
│  or emoji  │
│            │
├────────────┤
│ name       │
└────────────┘
```

必須:

- 下部に名前
- 画像があっても名前を消さない
- 選択状態が分かる
- 捨てられる/捨てられない状態が分かる
- 3〜4人戦でも自分の手牌が見やすい

表示優先:

1. local image
2. emoji
3. fallbackLabel
4. name

### Player Mini Panel

相手プレイヤーのミニ表示。

表示するもの:

- プレイヤー名
- CPU / human
- 手牌枚数
- 捨て牌枚数
- 現在ターンかどうか
- テンパイ/危険状態は将来表示

表示しないもの:

- 相手の手牌画像
- 長い説明
- 大きいアバター

### Action Button

主要アクション。

- 引く
- 捨てる
- あがる
- パス
- もう一局

ボタンは大きく、状態を明確にする。

## Match Screen

### Goal

プレイヤーが今やるべきことを迷わない画面。

### Information Priority

1. 自分の手牌
2. 現在の操作状態
3. 引く/捨てる/あがるボタン
4. 相手3人の状態
5. 山・捨て牌
6. 成立候補役
7. 得点

### Layout

```text
┌────────────────────┐
│ Opponent Mini Row   │
│ P2 / P3 / P4        │
├────────────────────┤
│ Round Status        │
│ current turn / deck │
├────────────────────┤
│ Discard / Draw Area │
├────────────────────┤
│ My Hand             │
│ 8 or 9 tiles        │
├────────────────────┤
│ Action Bar          │
│ Draw / Discard / Win│
└────────────────────┘
```

### My Hand

- 通常時8枚
- 引いた後9枚
- 9枚時は「あがる」「捨てる」の判断を促す
- 牌は横スクロールより、できれば2段または3段で見やすくする
- 390px幅で名前が読めること

### State Copy

状態文言は短く。

例:

```text
あなたの番です。1枚引いてください。
9枚になりました。あがるか、1枚捨ててください。
CPU2の捨て牌であがれます。
```

### Match Screen Must Not

- 相手の情報を大きくしすぎない
- 役一覧を常時大きく出さない
- Editor導線を混ぜない
- 共有ボタンを対局中に目立たせない
- 画面下部に小さいボタンを並べすぎない

## Home Screen

### Goal

すぐ始める。

### Layout

```text
soro-pon

[サンプルで遊ぶ]
[デッキを作る]
[JSONを読み込む]
```

最初のHomeに入れないもの:

- ニュース
- ランキング
- 公開ギャラリー
- アカウント
- 実績
- デイリー

## Deck Editor

### Goal

その卓で使うデッキ/ルールセットを作る。

### Information Priority

1. デッキ名
2. 3人戦/4人戦設定
3. 牌一覧
4. 役一覧
5. JSON export/import

### Must Show

- 牌の種類数
- 総牌枚数
- 役数
- 最高得点役
- 3人/4人対応

## Tile Editor

### Goal

牌を作る。

入力順:

1. name
2. emoji
3. fallbackLabel
4. categories
5. count
6. local image

注意:

- categoriesは複数入力できる
- local imageは共有されないと明記する
- 名前は必須
- countは必須

## Role Editor

### Goal

役と得点を作る。

入力順:

1. role name
2. points
3. condition type
4. condition details
5. description

UIで必ず見せる:

- この役が何を要求しているか
- 点数
- 対象カテゴリ/牌
- 条件の自然文プレビュー

例:

```text
森カテゴリを3枚そろえる → 20点
```

## Result Screen

### Goal

何の役で何点だったか分かり、もう一局やりたくなる。

表示するもの:

- 勝者
- 成立役
- 各役の点数
- 合計点
- もう一局
- デッキを編集
- 結果をコピー

## Visual Tone

- 明るく見やすい
- カジュアル
- でも幼すぎない
- 牌の視認性が最優先
- 装飾より情報整理

## Color Direction

最初は色数を絞る。

推奨:

- background: 暖かい白 or 薄いベージュ
- tile: 白/アイボリー
- primary: 青 or 緑
- accent: 黄色/金
- danger: 赤

避ける:

- 多色グラデーション
- 役ごとに派手な色を付けすぎる
- 背景が暗すぎる
- 牌と背景のコントラストが弱い

## Generated Design Deliverables

将来デザイン生成時に作るもの。

- Match screen 390x844
- Home screen 390x844
- Deck Editor 390x844
- Tile Editor 390x844
- Role Editor 390x844
- Result screen 390x844
- Tile component sheet
- Button component sheet
- Player mini panel sheet

## Design Review Checklist

デザインを採用する前に確認する。

- 自分の手牌が主役か
- 8枚/9枚が自然に表示できるか
- 3人戦/4人戦の相手表示が破綻しないか
- 牌の名前が読めるか
- 画像なしでも成立するか
- 画像ありでも名前が消えないか
- 「引く」「捨てる」「あがる」が迷わないか
- 役候補が邪魔をしていないか
- Editor画面が自作しやすいか
- 共有JSONが画像なしであることが説明されているか
