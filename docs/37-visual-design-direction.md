# Visual Design Direction

## Purpose

`soro-pon` の画面生成前に、見た目の方向性を固定する。

ゴール:

```text
全画面のデザインを生成してから実装に入る。
```

## Final Direction

```text
カジュアルな卓上ボードゲームUI
+ 麻雀アプリの操作感
+ カード/デッキビルダーの作りやすさ
+ 収集ボードの気持ちよさ
```

一言でいうと:

```text
明るい木のテーブルに、色分けされた牌カードを並べて遊ぶ、分かりやすい自作デッキゲーム。
```

## Design Keywords

```text
明るい
見やすい
触りたくなる
整理されている
少しゲームっぽい
カードを作る楽しさ
麻雀アプリのテンポ
カービィのエアライドのクリアチェッカー的な収集感
```

## What It Is Not

```text
高級麻雀アプリではない
和風麻雀ではない
ソシャゲのガチャUIではない
暗いカードゲームUIではない
子ども向け知育アプリすぎない
情報量が多い管理画面ではない
```

## Visual Tone

### Base Tone

```text
白 / アイボリー / 明るい木目 / 薄いベージュ
```

### Accent Tone

```text
青緑: メイン操作
金/黄色: コイン・達成・オールマイティ
赤: 警告・危険・削除
カテゴリ色: 牌の外枠/帯/チップ
```

### Feeling

```text
紙カード
丸い角
軽い影
やわらかい立体感
清潔なボードゲーム感
```

## Core Visual Metaphor

`soro-pon` は「カード」ではなく「牌」だが、スマホUIではカード状に見せる。

```text
牌 = 小さな角丸カード
カテゴリ = 外枠色 + 上部帯 + チップ
役 = 牌の組み合わせレシピ
デッキ = ルール付きのおもちゃ箱
Result = スコアシート + ごほうび
Clear Board = 収集ボード
```

## Tile Design

牌は最重要コンポーネント。

必須:

```text
外枠にprimary category color
上部に細いcategory bar
中央にemoji / image / fallbackLabel
下部にname
選択時は少し浮く
オールマイティは金色の星アクセント
```

比率:

```text
Match hand tile: 横向き画面で最低44px幅以上
Editor tile preview: 80〜120px程度
Deck detail tile: 56〜72px程度
```

避ける:

```text
牌名が読めない
カテゴリ色が小さすぎる
絵文字だけで名前がない
背景と牌のコントラストが弱い
```

## Category Color Rule

カテゴリ色は、Deck EditorとMatch画面の両方で意味を持つ。

```text
外枠: primaryCategoryIdの色
上部帯: primaryCategoryIdの色
サブカテゴリ: 小さいチップ
オールマイティ: 金色優先
```

色だけに頼らない。

```text
カテゴリ名
チップ
アイコン
枠の太さ
```

## Typography

方針:

```text
太すぎない丸ゴシック系
数字は読みやすく大きく
牌名は短く確実に読める
説明文は小さくしすぎない
```

実装ではsystem fontでよい。

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Motion Direction

MVPでは派手なアニメーションは不要。

入れるなら軽く。

```text
牌選択: 4〜6px浮く
捨て牌: 中央へスライド
あがり: selected role cardが軽く光る
コイン: +coinsがふわっと出る
実績解除: 小さいトースト
```

避ける:

```text
長い演出
連打を邪魔する演出
毎ターンの過剰アニメーション
```

## Screen Family Direction

### TOP / Deck List / Deck Detail

```text
明るい入口
大きいカード
迷わないCTA
```

### Deck Editor

```text
作業台
左/上に状態サマリ
中央に編集対象
右/下にライブプレビュー
カテゴリ色が常に見える
```

### Match Landscape

```text
麻雀アプリの気持ちよさ
自分の手牌が最優先
直近捨て牌が分かる
押せるボタンだけ目立つ
```

### Result

```text
スコアシート + ごほうび
役内訳が読みやすい
コイン加算が気持ちいい
次の導線が明確
```

### Collection / Clear Board

```text
カービィのエアライドのクリアチェッカー的なマス目
埋めたくなる
ただしソシャゲ感は薄く
```

## Layout Orientation

```text
TOP / Deck List / Deck Detail / Editor / Result / Collection: portrait-first 390x844
Match: landscape-first 844x390
Portrait match: rotate prompt
```

## Design Quality Bar

採用条件:

```text
1. 牌名が読める
2. カテゴリ色が一目で分かる
3. 次に押すボタンが分かる
4. 画面ごとの目的が1つに見える
5. 画像なしでも成立する
6. 3人/4人の情報が破綻しない
7. Deck Editorが作りやすそうに見える
8. Resultからもう一局/調整へ行きたくなる
```

## Final Decision

- 明るい卓上ボードゲームUIにする
- 牌は角丸カード状にする
- カテゴリ色を外枠/帯/チップで見せる
- Matchは麻雀アプリのテンポを参考にする
- Editorはカード/デッキビルダーとして作りやすさ優先
- Collectionはクリアボード式の埋める楽しさを出す
- 暗すぎる/幼すぎる/ソシャゲすぎる方向にはしない
