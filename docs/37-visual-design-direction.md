# Visual Design Direction

## Purpose

`soro-pon` の画面生成前に、見た目の方向性を固定する。

ゴール:

```text
全画面のデザインを生成してから実装に入る。
```

## Final Direction

```text
soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
```

単体の漫画風アプリではなく、Vamp-pon世界の机の上で遊ばれている小さな牌ゲームとしてデザインする。

一言でいうと:

```text
夜の机、紙札、黒インク、小さな灯り。
忘れ物や記憶の欠片を札にして、組み合わせて役を作る遊び。
```

詳細な世界観方針は `docs/41-vampon-in-world-game-direction.md` を正とする。

## Design Keywords

```text
夜の机
記憶札
黒インク
手帳
小さな灯り
紙の遊び
静かな魔法
手作りの盤面
麻雀アプリのテンポ
役を作る楽しさ
```

英語キーワード:

```text
night desk
memory cards
ink notebook
lantern glow
paper game
quiet magic
small ritual
warm darkness
handmade board game
```

## What It Is Not

```text
単体の漫画風アプリではない
明るいおもちゃUIではない
高級麻雀アプリではない
和風麻雀ではない
ソシャゲのガチャUIではない
大人向け劇画UIではない
子ども向け知育アプリではない
情報量が多い管理画面ではない
```

## Visual Tone

### Base Tone

```text
生成りの紙
黒インク
深い夜色
古い手帳
暗い木の机
```

### Accent Tone

```text
ランタンの暖色: 重要操作 / 小さな光
鈍い金: 達成 / コイン / 記録印
朱赤: 警告 / ロン / 強い見せ場
カテゴリ色: インク色 / 小さな封蝋 / 付箋色
```

### Feeling

```text
紙札
インクのにじみ
軽い影
手作り感
静かな盤面
勝負どころだけ漫画的
```

## Core Visual Metaphor

```text
tile = 記憶札
category = 記憶の種類
role = 記憶の組み合わせ
wildcard = どんな記憶にも寄り添う灯り/白紙札
discard = 場に置かれた記憶
collection = 見つけた記憶の記録
clear board = 夜の手帳に貼られた達成印
```

## Tile Design

牌は最重要コンポーネント。

必須:

```text
紙札として見せる
外枠にprimary category colorを細く入れる
上部にcategory ink labelを置く
中央にemoji / image / fallbackLabel
下部にname
選択時は少し浮き、灯りが当たる
オールマイティは小さな灯り/白紙札/星印として見せる
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
原色カードゲームっぽくなりすぎる
```

## Category Color Rule

カテゴリ色は、Deck EditorとMatch画面の両方で意味を持つ。

```text
外枠: primaryCategoryIdの色
上部ラベル: primaryCategoryIdの色
サブカテゴリ: 小さいチップ/付箋
オールマイティ: 灯り色/鈍い金を優先
```

色だけに頼らない。

```text
カテゴリ名
チップ
アイコン
枠の太さ
インク模様
```

## Typography

方針:

```text
読みやすいゴシック + 一部だけ手帳/インク見出し
数字は読みやすく大きく
牌名は短く確実に読める
説明文は小さくしすぎない
```

実装ではsystem fontでよい。

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

世界観用の見出しは、後からフォント/画像化を検討してよいが、MVPでは可読性優先。

## Motion Direction

MVPでは派手なアニメーションは不要。

入れるなら軽く。

```text
牌選択: 4〜6px浮き、灯りが当たる
捨て牌: 机にすっと置かれる
最新捨て牌: 小さな集中線/インク強調
あがり: 記憶札が少し光る
コイン/達成: 金貨よりも記録印/灯り粒
実績解除: 手帳に印が押される
```

Three.jsで後から足すなら:

```text
札が少し浮く
小さな灯り粒が舞う
黒インクがにじむ
Resultで記憶札が手帳に貼られる
Clear Boardのマスに灯りがともる
```

避ける:

```text
長い演出
連打を邪魔する演出
毎ターンの過剰アニメーション
常時3Dで動き続ける牌
```

## Screen Family Direction

### TOP / Deck List / Deck Detail

```text
夜の机に置かれた札箱
今日の対局帳
古い手帳から始める入口
```

### Deck Editor

```text
記憶札を作る作業台
インク色を選ぶ
組み合わせを手帳に記録する
カテゴリ色が常に見える
```

### Match Landscape

```text
麻雀アプリの気持ちよさ
中央に場と捨て牌
全員の捨て牌が見える
自分の手牌が最優先
相手3人は札入れ/手帳パネル
直近捨て牌だけ少し漫画的に強調
```

### Result

```text
対局記録
完成した記憶
灯った印
手帳に貼られた達成
```

### Collection / Clear Board

```text
記憶帳
見つけた役の記録
夜の手帳に貼られた達成印
埋めたくなるがソシャゲ感は薄く
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
9. Vamp-pon世界内の遊びとして見える
10. 通常は静か、見せ場だけ少し派手になっている
```

## Final Decision

- soro-ponはVamp-pon世界内で流行っている記憶札遊びとして扱う
- 紙/黒インク/小さな灯り/夜の机/記憶を軸にする
- 単体の漫画風アプリにはしない
- Matchは麻雀アプリのテンポを参考にする
- 捨て牌は全員分見える
- 山は大きく出さず、残り枚数だけ小さく出す
- Editorは記憶札を作る作業台として見せる
- Collectionは記憶帳として見せる
- Three.jsは灯り/札/インク/Result演出の補助に使う
