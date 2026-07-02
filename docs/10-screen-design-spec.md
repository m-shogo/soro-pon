# Screen Design Spec

## Purpose

MVP実装前に全主要画面を生成し、採用デザインを固定する。

画面デザイン生成時は、このファイルと `docs/37-visual-design-direction.md` / `docs/38-screen-generation-plan.md` を必ず参照する。

## Design Generation Rule

画面デザインを生成するときは、以下を守る。

- ルールは `docs/02-game-rules.md` を正とする
- データ構造は `docs/03-data-model.md` を正とする
- 共有・画像方針は `docs/04-sharing-and-local-images.md` を正とする
- IP/UGC方針は `docs/05-ip-and-ugc-policy.md` を正とする
- デザイン原則は `docs/06-design-principles.md` を正とする
- ビジュアル方向性は `docs/37-visual-design-direction.md` を正とする
- 生成順は `docs/38-screen-generation-plan.md` を正とする

AIは、見た目を作るためにルールを変えてはいけない。

## Target Device and Orientation

```text
TOP / Deck List / Deck Detail / Editor / Result / Collection: portrait-first 390x844
Match: landscape-first 844x390
Portrait match: rotate prompt
```

## Visual Direction

```text
明るい卓上ボードゲームUI
麻雀アプリの操作感
カード/デッキビルダーの作りやすさ
クリアボードの収集感
```

見た目の比喩:

```text
明るい木のテーブルに、色分けされた牌カードを並べて遊ぶ。
```

避ける方向:

```text
暗いカードゲームUI
高級麻雀UI
ソシャゲガチャUI
幼すぎる知育アプリ
情報量が多い管理画面
```

## Global Layout Principles

- 1画面1目的
- 主役を1つに絞る
- 画面上部は状態
- 画面中央は操作対象
- 画面下部は主要アクション
- 重要なボタンは親指で押しやすい位置
- 小さい文字を多用しない
- 画像なしでも破綻させない

## Common Components

### Tile Card

牌の表示。

```text
┌────────────┐
│ category   │ ← top bar / category color
│            │
│ emoji/img  │
│            │
├────────────┤
│ name       │
└────────────┘
```

必須:

- 外枠にprimary category color
- 上部帯にprimary category color
- 下部に名前
- 画像があっても名前を消さない
- 選択状態が分かる
- 捨てられる/捨てられない状態が分かる
- オールマイティは金色アクセント
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

表示しないもの:

- 相手の手牌画像
- 長い説明
- 大きいアバター

### Action Button

主要アクション。

- 引く
- 捨てる
- あがる
- ロン
- パス
- もう一局
- デッキを調整

ボタンは大きく、押せる状態だけ目立たせる。

## Home Screen

### Goal

すぐ始める。

### Portrait Layout 390x844

```text
soro-pon
短い説明

[まず遊ぶ]
[デッキ一覧]
[デッキを作る]
[JSONを読み込む]

動物スターターカード
```

最初のHomeに入れないもの:

- ニュース
- ランキング
- 公開ギャラリー
- アカウント
- デイリー

## Deck List / Deck Detail

### Goal

作ったデッキを選ぶ。通常版/拡張版を迷わず切り替える。

Must Show:

- デッキ名
- 通常版/拡張版対応
- 総牌枚数
- 役数
- 警告数
- 最終更新

Actions:

- 遊ぶ
- 編集
- 複製
- Export
- Delete

## Deck Editor Family

Deck Editorはこのゲームの主役級機能。

### Tabs

```text
基本情報
カテゴリ
牌
上がり役
特殊役
ボーナス
ルール
バランス
共有
```

### Editor Layout

Portrait 390x844では、タブ切替中心。

```text
Header: deck name / save state / warnings
Tab row
Main edit area
Live preview / action area
```

Must:

- カテゴリ色が常に見える
- 牌プレビューがある
- 役テンプレートから作れる
- 点数目安がある
- バランス警告から修正に行ける
- Empty Stateに次の行動がある

## Match Screen

### Goal

プレイヤーが今やるべきことを迷わない画面。

### Orientation

Matchは **landscape-first 844x390**。

Portraitでは対戦UIを無理に詰めず、Rotate Promptを出す。

### Information Priority

1. 自分の手牌
2. 現在の操作状態
3. 引く/捨てる/あがる/ロン/パス
4. 直近の捨て牌
5. 相手3人の状態
6. 山/捨て牌
7. 成立候補役

### Landscape Layout 844x390

```text
┌──────────────────────────────────────────────┐
│ Opponent left   Center discard   Opponent top │
│                                              │
│ Opponent right  Latest discard   Role hint    │
├──────────────────────────────────────────────┤
│ My hand tiles 8〜9                  Actions   │
└──────────────────────────────────────────────┘
```

### My Hand

- 通常時8枚
- 引いた後9枚
- 9枚時は「あがる」「捨てる」の判断を促す
- 横向きで牌名が読めること
- 選択牌は少し浮かせる

### State Copy

状態文言は短く。

```text
あなたの番です。1枚引いてください。
9枚です。あがるか、1枚捨ててください。
ロンできます。
```

### Match Screen Must Not

- portraitに無理やり全情報を詰めない
- 相手の情報を大きくしすぎない
- 役一覧を常時大きく出さない
- Editor導線を混ぜない
- 共有ボタンを対局中に目立たせない
- 画面下部に小さいボタンを並べすぎない

## Result Screen

### Goal

何の役で何点だったか分かり、もう一局やりたくなる。

表示するもの:

- 勝者 / 流局
- ツモ/ロン
- 上がり役
- 特殊役
- スコアボーナス
- オールマイティ使用
- 合計点
- 獲得コイン
- 実績/称号/コレクション進行

Actions:

- もう一局
- デッキを調整
- コレクションを見る
- クリアボードを見る
- TOPへ

## Collection / Clear Board

### Goal

また遊ぶ理由を作る。

Direction:

```text
カービィのエアライドのクリアチェッカー的なマス目
ただしソシャゲ感は薄く
```

Must:

- 未達成/達成済みが分かる
- 次に狙える目標が分かる
- 報酬が強さに見えない

## Visual Tone

- 明るく見やすい
- カジュアル
- でも幼すぎない
- 牌の視認性が最優先
- 装飾より情報整理
- 軽いゲーム感は出す

## Color Direction

推奨:

- background: 暖かい白 / 薄いベージュ / 明るい木目
- tile: 白 / アイボリー
- primary: 青緑
- accent: 黄色 / 金
- danger: 赤
- category: user-defined category colors

避ける:

- 多色グラデーション
- 役ごとに派手な色を付けすぎる
- 背景が暗すぎる
- 牌と背景のコントラストが弱い

## Generated Design Deliverables

詳細な生成リストは `docs/38-screen-generation-plan.md` を正とする。

最低限:

- Component Sheets
- TOP
- Deck List
- Deck Detail
- Deck Editor family
- Match landscape family
- Result
- Collection
- Dialogs

## Design Review Checklist

- 自分の手牌が主役か
- 8枚/9枚が自然に表示できるか
- 3人戦/4人戦の相手表示が破綻しないか
- 牌の名前が読めるか
- カテゴリ色が意味を持っているか
- 画像なしでも成立するか
- 画像ありでも名前が消えないか
- 「引く」「捨てる」「あがる」「ロン」が迷わないか
- 役候補が邪魔をしていないか
- Editor画面が自作しやすいか
- Resultからもう一局/調整へ行きたくなるか
