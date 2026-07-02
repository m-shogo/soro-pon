# Screen Design Spec

## Purpose

MVP実装前に全主要画面を生成し、採用デザインを固定する。

画面デザイン生成時は、このファイルと `docs/37-visual-design-direction.md` / `docs/38-screen-generation-plan.md` / `docs/46-landscape-first-web-responsive-policy.md` を必ず参照する。

## Design Generation Rule

画面デザインを生成するときは、以下を守る。

- ルールは `docs/02-game-rules.md` を正とする
- データ構造は `docs/03-data-model.md` を正とする
- 共有・画像方針は `docs/04-sharing-and-local-images.md` を正とする
- IP/UGC方針は `docs/05-ip-and-ugc-policy.md` を正とする
- デザイン原則は `docs/06-design-principles.md` を正とする
- ビジュアル方向性は `docs/37-visual-design-direction.md` を正とする
- 生成順は `docs/38-screen-generation-plan.md` を正とする
- 横画面固定方針は `docs/46-landscape-first-web-responsive-policy.md` を正とする

AIは、見た目を作るためにルールを変えてはいけない。

## Target Device and Orientation

```text
All main screens: 844x390 landscape-first
Web: responsive scale / adaptive layout
Portrait: rotate prompt or limited utility only
```

過去の `TOP / Editor / Result / Collection は portrait-first` 方針は使わない。

## Visual Direction

```text
Vamp-pon世界の中で流行っている記憶札遊び
横長の夜机
紙札
黒インク
ランタン光
麻雀/ドンジャラの操作感
カード/デッキビルダーの作りやすさ
クリアボードの収集感
```

見た目の比喩:

```text
Vamp-pon世界の夜の机に、記憶札と対局帳を横長に並べて遊ぶ。
```

避ける方向:

```text
portrait-firstのスマホアプリUI
明るい汎用ボードゲームUI
高級麻雀UI
ソシャゲガチャUI
幼すぎる知育アプリ
情報量が多い管理画面
漫画効果だけのUI
```

## Global Layout Principles

- 横画面で最初に成立させる
- 1画面1目的
- 主役を1つに絞る
- 画面左はナビ/状態
- 画面中央は操作対象
- 画面右は補助/詳細/主要アクション
- 画面下部は手牌や主要操作
- 小さい文字を多用しない
- 画像なしでも破綻させない
- Webでは縮尺・余白・折りたたみで対応する

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

- 紙札として見せる
- 外枠にprimary category color
- 上部帯にprimary category color
- 下部に名前
- 画像があっても名前を消さない
- 選択状態が分かる
- 捨てられる/捨てられない状態が分かる
- オールマイティはランタン光/鈍い金アクセント
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
- Vamp-pon風の札入れ/小アイコン/灯り表現

表示しないもの:

- 相手の手牌画像
- 長い説明
- 大きすぎるアバター

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

## TOP Screen

### Goal

すぐ始める。

### Landscape Layout 844x390

```text
左: title / まず遊ぶ / デッキを作る / JSONを読み込む
中央: 札箱 / 動物スターター / 最近のデッキ
右: 対局帳 / 設定 / 簡単な説明
```

最初のTOPに入れないもの:

- ニュース
- ランキング
- 公開ギャラリー
- アカウント
- デイリー

## Deck List / Deck Detail

### Goal

作ったデッキを選ぶ。通常版/拡張版を迷わず切り替える。

Landscape layout:

```text
左: デッキ一覧
中央: 選択中デッキの詳細
右: 遊ぶ/編集/複製/Export/Delete
```

Must Show:

- デッキ名
- 通常版/拡張版対応
- 総牌枚数
- 役数
- 警告数
- 最終更新

## Deck Editor Family

Deck Editorはこのゲームの主役級機能。

Landscape layout:

```text
左: タブ/カテゴリ/牌一覧
中央: 編集フォーム
右: 牌プレビュー/警告/ライブテスト
```

Tabs:

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
4. 全員の捨て牌
5. 直近の捨て牌
6. 相手3人の状態
7. 山/残り枚数
8. 成立候補役

### Landscape Layout 844x390

```text
┌──────────────────────────────────────────────┐
│ 状態/残り枚数   相手A        相手B       設定 │
│                                              │
│ 相手C     全員の捨て牌 / 最新捨て牌      役候補 │
│                                              │
├──────────────────────────────────────────────┤
│ 自分の手牌8〜9枚                  Actions     │
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

Landscape layout:

```text
左: 勝者/順位/合計点
中央: 上がり役/特殊役/ボーナス/オールマイティ使用
右: コイン/実績/称号/次アクション
```

Actions:

- もう一局
- デッキを調整
- コレクションを見る
- クリアボードを見る
- TOPへ

## Collection / Clear Board

### Goal

また遊ぶ理由を作る。

Landscape layout:

```text
左: フィルタ/カテゴリ
中央: 役コレクション/5x5 Clear Board
右: 詳細/報酬/次に狙う目標
```

Must:

- 未達成/達成済みが分かる
- 次に狙える目標が分かる
- 報酬が強さに見えない

## Visual Tone

- Vamp-pon世界内の遊びに見える
- 紙/黒インク/ランタン光
- 暗いが怖すぎない
- 牌の視認性が最優先
- 装飾より情報整理
- 通常画面は静か
- 見せ場だけ少し派手

## Generated Design Deliverables

詳細な生成リストは `docs/38-screen-generation-plan.md` を正とする。

最低限:

- 横画面Component Sheets
- TOP
- Deck List
- Deck Detail
- Deck Editor family
- Match landscape family
- Result
- Collection
- Dialogs

## Design Review Checklist

- 横画面で成立しているか
- Vamp-pon世界内の遊びに見えるか
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
