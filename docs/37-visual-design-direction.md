# Visual Design Direction

## Purpose

`soro-pon` の画面生成前に、見た目の方向性を固定する。

## Final Direction

```text
soro-pon = Vamp-pon世界の中で流行っている記憶札遊び
```

単体の漫画風アプリではなく、Vamp-pon世界の机の上で遊ばれている小さな牌ゲームとしてデザインする。

一言でいうと:

```text
横長の夜の机、紙札、黒インク、小さな灯り。
忘れ物や記憶の欠片を札にして、組み合わせて役を作る遊び。
```

## Orientation Decision

```text
All main screens = 844x390 landscape-first
Web = responsive scale / adaptive layout
Portrait = rotate prompt or limited utility only
```

過去の `portrait-first 390x844` 方針は使わない。

全画面をまず横画面で成立させる。

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
横長の対局卓
麻雀/ドンジャラの情報配置
全員の捨て牌が見える盤面
```

英語キーワード:

```text
landscape-first
night desk
memory cards
ink notebook
lantern glow
paper game
quiet magic
handmade board game
mahjong-like discard table
```

## What It Is Not

```text
portrait-firstアプリではない
明るい汎用ボードゲームUIではない
白いスマホ管理画面ではない
高級麻雀アプリではない
和風麻雀そのものではない
ソシャゲのガチャUIではない
大人向け劇画UIではない
子ども向け知育アプリではない
漫画効果だけで世界観を作るものではない
```

## Vamp-pon Inheritance

必ず踏襲する。

```text
紙UI
黒インク
ランタン光
夜の机
記憶帳 / 対局帳
静かな通常画面
見せ場だけ少し派手
文字可読性優先
```

Vamp-pon由来の情報を使う場合は、必ず以下を読む。

```text
/Users/m-shogo/Developer/personal/vamp-pon/docs/shared-vampon-master-index.md
/Users/m-shogo/Developer/personal/soro-pon/docs/45-vampon-reference-gate.md
```

## Visual Tone

### Base Tone

```text
生成りの紙
黒インク
深い夜色
古い手帳
暗い木の机
ランタンの暖色
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

横画面での基準:

```text
Match hand tile: 最低44px幅以上
Editor tile preview: 80〜120px程度
Discard tile: 手札より小さくても名前/絵柄が分かる
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

## Screen Family Direction

### TOP / Deck List / Deck Detail

```text
横長の夜机
札箱 / 対局帳 / デッキ札束
左に入口、中央にデッキ、右に最近の記録
```

### Deck Editor

```text
記憶札を作る横長の作業台
左: タブ/カテゴリ/一覧
中央: 編集フォーム
右: 牌プレビュー/警告/ライブテスト
```

### Match Landscape

```text
麻雀アプリの気持ちよさ
中央に場と全員の捨て牌
下に自分の手牌8〜9枚
左右/上に相手3人ミニパネル
右に操作ボタン
直近捨て牌だけ少し漫画的に強調
```

### Result

```text
横長の対局記録
左に順位/点数
中央に役内訳
右に報酬/次アクション
```

### Collection / Clear Board

```text
横長の記憶帳
左にフィルタ
中央にグリッド
右に詳細
Clear Boardは横長の盤面として見せる
```

## Web Responsive Rule

```text
844x390以上: 基準UIを表示
小さい横画面: 縮尺、余白削減、右パネル折りたたみ
縦画面: rotate prompt or limited utility only
```

## Design Quality Bar

採用条件:

```text
1. 横画面で成立している
2. 牌名が読める
3. カテゴリ色が一目で分かる
4. 次に押すボタンが分かる
5. 画面ごとの目的が1つに見える
6. 画像なしでも成立する
7. 3人/4人の情報が破綻しない
8. Deck Editorが作りやすそうに見える
9. Resultからもう一局/調整へ行きたくなる
10. Vamp-pon世界内の遊びとして見える
11. 通常は静か、見せ場だけ少し派手になっている
```

## Final Decision

- soro-ponはVamp-pon世界内で流行っている記憶札遊びとして扱う
- 全主要画面は 844x390 landscape-first
- Webでは横画面UIを responsive scale / adaptive layout でよしなに表示する
- Portrait-firstの画面生成はしない
- 紙/黒インク/小さな灯り/夜の机/記憶を軸にする
- Matchは麻雀アプリのテンポを参考にする
- 捨て牌は全員分見える
- 山は大きく出さず、残り枚数だけ小さく出す
- Editorは横長の記憶札作業台として見せる
- Collectionは横長の記憶帳として見せる
- Three.jsは灯り/札/インク/Result演出の補助に使う
