# Deck Editor UX and Category Colors

## Purpose

`soro-pon` の一番大事な体験は、対戦だけではなく、ユーザーが気持ちよくデッキ・牌・カテゴリ・役・得点を作れること。

このファイルでは、Deck Editor のUI/UX、カテゴリ色、牌の見た目、役の作り方、得点設定を固定する。

## Core Decision

```text
Deck Editorは難しい設定画面ではなく、デッキを作る体験そのものにする。
```

大事なこと:

- 牌が見やすい
- カテゴリが色で分かる
- 役が作りやすい
- 得点の目安が分かる
- 作った役が本当に成立するかすぐ分かる
- 失敗しても直しやすい

## Category Color System

カテゴリごとに色を指定できるようにする。

```ts
type TileCategory = {
  id: string;
  name: string;
  color: string;
  priority?: number;
  description?: string;
};
```

例:

```text
麦わらの一味: 赤
海軍: 青
四皇: 紫
最悪の世代: 緑
ワノ国: 桃/赤紫
D: 黒
オールマイティ: 金
```

## Tile Visual Rule

牌はカテゴリ色で視認しやすくする。

表示要素:

```text
・外枠: primary category color
・上部帯: primary category color
・カテゴリチップ: secondary categories
・名前: 必ず表示
・画像/emoji/fallbackLabel: 中央
```

イメージ:

```text
┌──────────────┐  ← 外枠がカテゴリ色
│ category bar │  ← 上部帯
│              │
│ image/emoji  │
│              │
├──────────────┤
│ name         │
└──────────────┘
```

## Multiple Category Color Priority

牌が複数カテゴリを持つ場合、表示色を決める必要がある。

固定:

```text
1. tile.primaryCategoryId があればそれを使う
2. なければカテゴリpriorityが最も高いものを使う
3. 同率ならcategories配列の先頭を使う
4. オールマイティは常に専用色を優先してよい
```

Tileに追加したい項目:

```ts
type Tile = {
  id: string;
  name: string;
  categories: string[];
  primaryCategoryId?: string;
  emoji?: string;
  fallbackLabel?: string;
  count: number;
  wildcard?: WildcardRule;
};
```

## Color Accessibility

色だけで判別させない。

必ず併用する:

```text
・カテゴリ名
・カテゴリチップ
・アイコン/emoji
・fallbackLabel
・枠線の太さ/柄
```

理由:

- 色弱対応
- 小さい画面でも分かりやすい
- 画像なしでも遊べる

## Deck Editor Main Layout

Deck Editorはタブ式。

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

`カテゴリ` タブを独立させる。

理由:

- 色設計が重要
- 牌作成より先にカテゴリを作る方が分かりやすい
- 役作成でもカテゴリを使う

## Category Editor

### Goal

カテゴリを作り、色を決める。

### Fields

```text
カテゴリ名
色
説明
表示優先度
アイコン optional
```

### Buttons

```text
[カテゴリ追加]
[保存]
[削除]
[色を自動提案]
[未使用カテゴリを整理]
```

### UX

- 色はプリセットから選べる
- カスタム色も許可
- 似すぎた色は警告
- 未使用カテゴリは警告
- よく使うカテゴリは上に出す

### Color Presets

```text
赤 / 青 / 緑 / 黄 / 紫 / 桃 / 黒 / 白 / 金 / 灰
```

## Tile Editor UX

牌作成は、カードを作る感覚にする。

### Fields

```text
牌名
メインカテゴリ
サブカテゴリ
枚数
emoji/fallbackLabel
local image optional
オールマイティ設定 optional
```

### Buttons

```text
[牌を追加]
[コピー]
[削除]
[カテゴリを追加]
[プレビュー]
[この牌で役を作る]
```

### Live Preview

右側または下部に必ず牌プレビューを出す。

```text
現在のカテゴリ色
実際の牌サイズ
名前の見え方
emoji/fallbackLabel
オールマイティ表示
```

### Batch Creation

大量に牌を作るため、まとめ入力を用意する。

```text
ルフィ, 麦わらの一味, 船長, 3
ゾロ, 麦わらの一味, 剣士, 3
ナミ, 麦わらの一味, 航海士, 3
```

貼り付けから牌を一括作成できるとよい。

## Role Builder UX

役作成は、いきなりJSONを書かせない。

テンプレートから作る。

### Role Templates

```text
指定牌セット
カテゴリn枚
対象からn枚
同じ牌n枚
全部違うカテゴリ
大型役
オールマイティ禁止役
```

### Win Role Builder Flow

```text
1. 役タイプを選ぶ
2. 対象牌/カテゴリを選ぶ
3. 必要枚数を選ぶ
4. 点数を決める
5. ツモ/ロン可否を確認
6. オールマイティ可否を確認
7. テスト手札で成立確認
8. 保存
```

### Special Bonus Builder Flow

```text
1. 特殊役タイプを選ぶ
2. 対象牌/カテゴリを選ぶ
3. 必要枚数を選ぶ
4. 加点を決める
5. 「これは上がり役ではなく加点です」と表示
6. テスト手札で加点確認
7. 保存
```

### Score Bonus Builder Flow

```text
1. ボーナスタイプを選ぶ
2. 条件を決める
3. 加点と上限を決める
4. オールマイティを含めるか確認
5. テスト手札で加点確認
6. 保存
```

## Role Builder Visual UI

役は牌を並べて作れるようにする。

```text
[空] [空] [空]
```

牌をクリックして追加。

```text
[ルフィ] [ゾロ] [サンジ]
```

カテゴリ役なら色チップで表示。

```text
[麦わらの一味] x 6
```

対象からn枚ならこう。

```text
候補: [ルフィ] [ロー] [キッド] [ゾロ]
必要: 3枚
```

## Scoring UX

得点は自由入力だが、目安を出す。

### Standard Rule Suggested Points

```text
3枚相当の小型役: 30〜90
9枚手札の中型/大型役: 150〜300
特殊役: 30〜150
スコアボーナス: 10〜50
```

### Extended Rule Suggested Points

```text
2枚役: 10〜40
3枚役: 40〜80
4〜6枚役: 70〜130
7〜9枚役: 120〜180
10〜12枚役: 170〜240
13枚役: 220〜280
14枚役: 260〜350
```

### Warnings

```text
2枚役なのに点数が高すぎます
14枚役なのに点数が低すぎます
特殊役の点数が上がり役より高すぎます
スコアボーナスに上限がありません
ロン可能な小型役が多すぎます
```

## Live Test Panel

役作成画面には必ずテストパネルを置く。

### Display

```text
テスト手札
成立する上がり役
加点される特殊役
加点されるボーナス
オールマイティ使用
合計点
```

### Buttons

```text
[ランダム手札生成]
[この役が成立する手札を作る]
[不成立の例を見る]
[Result表示を確認]
```

## Easy Creation Shortcuts

デッキ作りやすさのために、ショートカットを用意する。

```text
カテゴリから役を作る
選択した3牌で特殊役を作る
同じカテゴリの牌を一括追加
通常版から拡張版役を作る
特殊役を上がり役にコピー
上がり役を特殊役にコピー
```

特に重要:

```text
選択した3牌で特殊役を作る
```

ファンデッキでは関係性の3人組を大量に作りたくなるため。

## Deck Health Summary

Editor上部に常に状態を出す。

```text
牌: 27種類 / 81枚
カテゴリ: 12個
上がり役: 8個
特殊役: 14個
ボーナス: 2個
警告: 3件
```

押すとBalance Checkへ移動。

## Beginner / Advanced Modes

最初から全部見せると難しい。

```text
かんたん
詳細
```

### かんたん

- 牌名
- カテゴリ
- 色
- 枚数
- テンプレ役
- 点数目安

### 詳細

- matchMode
- coveragePolicy
- allowWildcard
- maxWildcardUse
- canRon
- canTsumo
- priority
- validation detail

## Import/Export UX

ユーザーに明確に伝える。

```text
画像は共有されません
カテゴリ色・牌名・役・得点は共有されます
ローカル画像は自分の端末だけです
```

共有JSONにはカテゴリ色を含めてよい。

```text
category color は共有OK
local image は共有NG
```

## Must Have for MVP Editor

MVPでも最低限入れる。

```text
カテゴリ色設定
牌プレビュー
役テンプレート
点数目安
バランス警告
テスト手札
JSON import/export
通常版/拡張版切替
```

## Do Not Do

```text
JSON直接編集をメインUIにしない
色だけでカテゴリ判別させない
役作成を自由入力だけにしない
得点を完全放置しない
上がり役と特殊役を同じ画面で混ぜすぎない
対戦中にDeck Editor導線を目立たせすぎない
```

## Final Decision

- Deck Editorはこのゲームの主役級機能
- カテゴリごとに色を持たせる
- 牌の外枠/帯/チップでカテゴリ色を見せる
- 複数カテゴリ時はprimaryCategoryIdを優先する
- 役はテンプレートとビジュアル選択で作る
- 得点には目安と警告を出す
- 役作成時にライブテストを出す
- かんたん/詳細モードを分ける
