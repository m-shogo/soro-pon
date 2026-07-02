# Landscape-first Web Responsive Policy

## Purpose

`soro-pon` の画面設計を、横画面ありきに修正する。

## Core Decision

```text
soro-pon は横画面固定を正とする。
```

全主要画面は、まず横画面 `844x390` を基準に設計する。

過去の `portrait-first` 方針は古い。今後の画面生成・実装・レビューでは使わない。

## Why

`soro-pon` は麻雀/ドンジャラベースの3〜4人対戦ゲームであり、以下の情報を同時に見せる必要がある。

```text
自分の手牌 8〜9枚
全員の捨て牌
相手3人の状態
現在ターン
山/残り枚数
ロン/あがる/捨てる/パス
候補役
```

縦画面に詰めると、牌名・捨て牌・操作ボタンが読みにくくなる。

## Base Canvas

```text
primary: 844x390 landscape
minimum target: iPhone横向き相当
web: responsive scale / adaptive layout
```

## Web Responsive Rule

Webでは端末やブラウザサイズに応じてよしなに対応する。

ただし、正本レイアウトは横画面。

### Wide enough

```text
844x390基準の横画面UIを表示
中央寄せ
必要なら余白に紙/机/暗い背景を出す
```

### Smaller landscape

```text
UIを縮尺する
牌名と主要ボタンを優先
装飾を減らす
右側パネルを折りたたむ
```

### Portrait / too narrow

```text
対戦画面は表示しない
横向き案内を出す
必要ならTOP/設定/ヘルプだけ簡易表示
```

## Screen Direction

### All Main Screens

以下も横画面を第一設計にする。

```text
TOP
Deck List
Deck Detail
Deck Editor
Category Editor
Tile Editor
Role Editor
Rule Settings
Balance Check
Import / Export
Match Setup
Result
Collection
Clear Board
Cosmetic / Title Select
Settings
Dialogs
```

### Match

Matchは完全に横画面前提。

```text
中央: 全員の捨て牌
下: 自分の手牌8〜9枚
左右/上: 相手3人ミニパネル
右: アクションボタン
山: 残り枚数を小さく表示
最新捨て牌: 少し強調
```

### Deck Editor

Deck Editorも横画面第一。

```text
左: タブ/カテゴリ/一覧
中央: 編集フォーム
右: 牌プレビュー/警告/ライブテスト
```

### Result / Collection

Result / Collectionも横画面で情報を整理する。

```text
Result: 左に順位/点数、中央に役内訳、右に報酬/次アクション
Collection: 左にフィルタ、中央にグリッド、右に詳細
Clear Board: 横長の盤面として見せる
```

## Vamp-pon Inheritance Rule

横画面化しても、Vamp-pon踏襲を弱めない。

必須:

```text
紙UI
黒インク
ランタン光
夜の机
記憶帳/対局帳
静かな通常画面
見せ場だけ小さく派手
文字可読性優先
```

禁止:

```text
明るい汎用ボードゲームUIへ戻す
白いスマホアプリUIだけにする
Vamp-ponの紙/インク/灯りを単なる飾りにする
漫画効果だけで世界観を作ったつもりにする
```

## Image Generation Rule

今後の画面画像生成は以下を守る。

```text
全画面を横長で生成する
1画面1枚、または横長アトラスにする
portrait mockは作らない
必要な場合のみ rotate prompt を縦画面として別途作る
Vamp-pon visual rulesを先に読む
```

## Final Decision

- soro-ponは横画面固定を正とする
- 画面生成はまず844x390 landscape
- Webでは横画面UIを基準に responsive scale / adaptive layout でよしなに対応する
- 縦画面は本画面ではなく rotate prompt / 補助表示
- Vamp-pon踏襲を横画面設計の中で強める
