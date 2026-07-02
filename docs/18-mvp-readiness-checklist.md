# MVP Readiness Checklist

## Purpose

実装に入る前に、仕様の抜け・実装時の迷い・AIの暴走ポイントを確認する。

このファイルの目的は、完璧主義で実装を止めることではなく、MVP開始時に最低限迷わない状態を作ること。

## Current Assessment

現時点の設計はかなり固い。

- ルールの軸がある
- 画面構成がある
- 役分類がある
- オールマイティ制約がある
- 横向き対戦画面方針がある
- 画面ごとのボタン仕様がある
- IP/画像共有リスクも抑えている

ただし、実装前に最後に固定したい項目が残っている。

## Must Decide Before MVP Implementation

### 1. Standard Deck Size

まだ固定していない。

候補:

```text
標準総牌枚数: 81枚
1種類あたり基本3枚
```

理由:

- 3枚セット役と相性がよい
- ドンジャラ系の感覚に近い
- 3人/4人どちらでも山が枯れにくい

MVPでは仮固定してよい。

```text
TODO(user decision): 標準総牌枚数を81枚にするか
```

### 2. 3人戦と4人戦の牌数

候補:

```text
同じデッキで3人/4人両対応
```

理由:

- ユーザーがデッキを2個作らなくて済む
- Editorが簡単
- バランス警告だけ分ければよい

### 3. 複数人ロン

他人の捨て牌で複数人がロン可能な場合の扱い。

候補:

```text
席順で捨てた人の次から近いプレイヤーを優先
```

または:

```text
複数人同時ロンを許可
```

MVP推奨:

```text
席順優先で1人だけ
```

理由:

- UIが簡単
- CPU処理が簡単
- テンポが良い

### 4. 複数上がり役成立時

同時に複数の `win_role` が成立する場合。

MVP推奨:

```text
最高点のwin_roleを主役として表示
同時成立役は詳細に表示してもよい
```

ただし、得点合計にするか最大点だけにするかは固定が必要。

推奨:

```text
win_roleは最高点1つ
special_bonusとscore_bonusは加点
```

理由:

- ワンピースドンジャラ系の読みやすさに近い
- 上がり役候補の爆発を抑える
- Resultが分かりやすい

### 5. CPUの最低限ロジック

MVPで強いAIは不要。

必要なのは、馬鹿に見えすぎない最低限。

MVP候補:

```text
1. 自分があがれるならあがる
2. あと1枚の役があるなら関連牌を残す
3. それ以外はランダム寄りに捨てる
4. 明らかにロンされる牌の完全回避は後回し
```

### 6. Storage

MVPではサーバーを使わない。

推奨:

```text
localStorage or IndexedDB
```

方針:

- deck JSONはlocalStorageでも可
- ローカル画像を扱うならIndexedDB寄り
- MVP初期は画像なし/emoji/fallbackLabel中心でもよい

### 7. Official Sample Deck

公式サンプルが必要。

条件:

- 既存IPなし
- 画像なしでも成立
- 絵文字/fallbackLabelで見やすい
- 3人/4人対応
- 上がり役/特殊役/ボーナス/オールマイティを少しずつ含める

候補:

```text
動物スターター
旅行スターター
おやつスターター
```

MVP推奨:

```text
動物スターター
```

理由:

- IPリスクが低い
- カテゴリが作りやすい
- 役が直感的

## Must Not Add Before MVP

以下はまだ入れない。

```text
オンライン対戦
ログイン
公開ギャラリー
ランキング
PWA
課金
アバター
デイリー
実績
フレンド
チャット
観戦
```

## MVP Build Order

実装順。

```text
1. Project setup
2. Type definitions
3. Zod schemas
4. Sample deck
5. Deck validation
6. Match state
7. Draw/discard loop
8. Win role evaluation
9. Tsumo/Ron basic flow
10. Special bonus scoring
11. Score bonus scoring
12. Wildcard evaluation
13. Result model
14. Deck List UI
15. Deck Editor minimal UI
16. Match Setup UI
17. Match Landscape UI
18. Result UI
19. Import/Export
20. Balance Check
```

## MVP Definition of Done

MVP完了条件。

```text
・TOPからサンプルデッキで遊べる
・3人戦/4人戦を開始できる
・人間1人 + CPU2〜3人で進行できる
・ツモ/捨てる/ロン/あがるが動く
・上がり役で勝てる
・特殊役が加点される
・スコアボーナスが加点される
・オールマイティが1役1枚まで使える
・リザルトで点数内訳が分かる
・デッキを作成/編集/保存できる
・JSON export/importができる
・画像は共有JSONに入らない
・縦向き対戦では横向き案内が出る
```

## MVP Testing Checklist

### Rule Tests

```text
・8枚配牌される
・引くと9枚になる
・捨てると8枚に戻る
・上がり役だけでツモ可能
・上がり役だけでロン可能
・特殊役だけでは上がれない
・スコアボーナスだけでは上がれない
・オールマイティが1枚だけ代用できる
・捨てられたオールマイティでロン不可
```

### UI Tests

```text
・横向き対戦画面で手牌が読める
・捨て牌が読める
・直近の捨て牌が分かる
・押せないボタンが押せない
・ロン可能時だけロンボタンが出る
・Resultで内訳が分かる
```

### Import/Export Tests

```text
・JSONを書き出せる
・JSONを読み込める
・画像情報が含まれない
・不正JSONで具体的エラーが出る
```

## Remaining Open Decisions

以下はまだ完全確定ではない。

```text
・標準総牌枚数
・1種類あたりの推奨枚数
・複数人ロンの扱い
・複数win_role成立時の得点方針
・CPUの危険牌回避をMVPに入れるか
・ローカル画像保存をMVP初期から入れるか
```

## Recommendation

今すぐ実装に入るなら、以下で仮固定する。

```text
標準総牌枚数: 81枚
1種類あたり: 3枚推奨
3人/4人: 同じデッキで対応
複数人ロン: 席順優先で1人
複数win_role: 最高点1つを採用
CPU: 最低限の役寄せ + ランダム
保存: まずlocalStorage
画像: MVP初期はemoji/fallbackLabel優先
```

## Final Assessment

完璧に近いが、まだ「最終固定前のTODO」はある。

ただし、現時点で実装に入っても致命的に迷う状態ではない。

次にやるべきことは、上のRemaining Open Decisionsをユーザー判断で固定し、MVP実装プロンプトを更新すること。
