# Screen Actions and Requirements

## Purpose

各画面に必要な機能、ボタン、押した時の挙動、表示条件、バリデーションを固定する。

AIが実装時に画面を勝手に増やしたり、重要なボタンを抜かしたり、対戦画面に不要な導線を混ぜないようにする。

## Final Gate Alignment

このファイルは `docs/47-mvp-implementation-final-gate.md` と整合する。

固定:

```text
全主要画面は 844x390 landscape-first
portrait は rotate prompt または限定utilityのみ
TOP / Deck / Editor / Result / Collection も横画面を正とする
```

古い `TOP/Editor/Resultは縦画面にも対応` 方針は使わない。

## Global Rules

- 1画面1目的
- 主要アクションは画面下部または右下に置く
- 危険操作は確認を挟む
- JSON共有では画像を含めない
- 既存IP名や既存IP画像を公式UIに出さない
- 全主要画面は横画面前提
- 役候補・特殊役・ボーナスを混同しない
- オールマイティ使用は結果で明示する
- `win_role` だけをロン/ツモ候補にする
- `special_bonus` と `ScoreBonus[]` は上がった後だけ加点する

## Screen List

MVP〜初期版で必要な画面。

```text
1. TOP
2. Deck List
3. Deck Detail
4. Deck Editor
5. Tile Editor
6. Win Role Editor
7. Special Bonus Editor
8. Score Bonus Editor
9. Rule Settings
10. Balance Check
11. Import / Export
12. Match Setup
13. Match Landscape
14. Rule Sheet / Role List Modal
15. Result
16. Collection / Clear Board
17. Rotate Prompt
18. Confirm / Error Dialogs
```

## 1. TOP

### Goal

最短で遊ぶ・作る・読み込む入口。

### Orientation

```text
844x390 landscape-first
```

### Primary Buttons

```text
[すぐ遊ぶ]
[デッキ一覧]
[デッキを作る]
[JSONを読み込む]
```

### Button Behavior

#### すぐ遊ぶ

- 公式サンプルまたは最後に使ったデッキでMatch Setupへ遷移
- デッキがない場合は公式サンプルを作成/読み込み

#### デッキ一覧

- Deck Listへ遷移

#### デッキを作る

- 新規Deck Editorへ遷移

#### JSONを読み込む

- Import画面へ遷移

### Do Not Show

- ランキング
- 公開ギャラリー
- ログイン
- 課金
- デイリー
- ニュース

## 2. Deck List

### Goal

作成済みデッキ、公式サンプル、最近使ったデッキを管理する。

### Orientation

```text
844x390 landscape-first
```

### Display

各デッキカードに表示する。

```text
・デッキ名
・通常版 / 拡張版
・3人/4人対応
・牌種類数
・総牌枚数
・上がり役数
・特殊役数
・ボーナス数
・最終更新日
・バランス警告数
```

### Buttons

```text
[遊ぶ]
[編集]
[コピー]
[拡張版を作成]
[JSON書き出し]
[削除]
[新規作成]
[JSON読み込み]
```

### Button Behavior

- [遊ぶ]: Match Setupへ遷移。致命的エラーがある場合は開始不可
- [編集]: Deck Editorへ遷移
- [コピー]: 同じルール設定のコピーを作成
- [拡張版を作成]: `extended-hand` variantを同じDeckProjectに追加
- [JSON書き出し]: 画像情報を除外してexport
- [削除]: 確認ダイアログ必須

## 3. Deck Detail

### Goal

遊ぶ前にデッキの内容を確認する。

### Orientation

```text
844x390 landscape-first
```

### Display

```text
・デッキ名
・説明
・通常版/拡張版
・対応人数
・ルール概要
・牌一覧サマリ
・上がり役一覧サマリ
・特殊役一覧サマリ
・ボーナス一覧サマリ
・オールマイティ有無
・バランス警告
```

### Buttons

```text
[このデッキで遊ぶ]
[編集]
[コピー]
[拡張版を作成]
[役表を見る]
[JSON書き出し]
[戻る]
```

## 4. Deck Editor

### Goal

デッキ全体を編集する親画面。

### Orientation

```text
844x390 landscape-first
左: タブ/一覧
中央: 編集フォーム
右: 牌プレビュー/警告/ライブテスト
```

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

### Persistent Buttons

```text
[保存]
[プレビュー]
[このデッキで遊ぶ]
[戻る]
```

### Save Behavior

- localStorageへ保存
- エラーがある場合は保存不可またはdraft保存
- 画像はローカル参照としてのみ保存
- 共有JSONには画像を入れない

### Validation Summary

常に画面上部または下部に表示する。

```text
エラー: 2件
警告: 5件
```

### Required Validation

- デッキ名必須
- 牌が1種類以上
- 総牌枚数が最低必要数以上
- supportedPlayerCounts が 3/4 のみ
- 上がり役が1つ以上
- 画像共有禁止フィールドがない

## 5. Tile Editor

### Goal

牌を作る・編集する。

### Fields

```text
name 必須
categories 複数可
emoji 任意
fallbackLabel 任意
count 必須
wildcard 任意
local image 任意
```

### Buttons

```text
[保存]
[キャンセル]
[削除]
[カテゴリ追加]
[画像を設定]
[画像を削除]
[オールマイティにする]
[プレビュー]
```

### Preview Priority

```text
image > emoji > fallbackLabel > name
```

### Local Image Rule

- 共有対象外
- exportされないことを明記

## 6. Win Role Editor

### Goal

あがり判定に使う役を作る。

### Fields

```text
role name 必須
points 必須
span 必須
condition type 必須
condition details 必須
canTsumo
canRon
allowWildcard
maxWildcardUse
説明 任意
```

### Buttons

```text
[保存]
[キャンセル]
[削除]
[条件プレビュー]
[対象牌を選ぶ]
[対象カテゴリを選ぶ]
[テスト判定]
```

### Required Rules

- `kind = win_role`
- `canTsumo` または `canRon` のどちらかはtrue
- 標準ルールではspanは3〜9
- 拡張ルールではspanは2〜14
- 2枚役は低〜中点を推奨
- 特殊役やボーナスとして扱うものをここに入れすぎない

## 7. Special Bonus Editor

### Goal

上がった後に加点される特殊役を作る。

### Fields

```text
bonus name 必須
points 必須
span 必須
condition type 必須
condition details 必須
allowWildcard
maxWildcardUse
説明 任意
```

### Buttons

```text
[保存]
[キャンセル]
[削除]
[対象牌を選ぶ]
[条件プレビュー]
[加点テスト]
```

### Required Rules

- `kind = special_bonus`
- `canTsumo = false`
- `canRon = false`
- ロン候補にしない
- あがり成立後だけ判定する

## 8. Score Bonus Editor

### Goal

同じ牌/同じ名前/同じカテゴリなどの加点を作る。

### Data Rule

`score_bonus` は `Role.kind` に入れず、`ScoreBonus[]` として扱う。

### Fields

```text
bonus name 必須
type 必須
minCount 必須
points 必須
maxPoints 推奨
allowWildcard 非推奨
説明 任意
```

### Buttons

```text
[保存]
[キャンセル]
[削除]
[条件プレビュー]
[加点テスト]
```

### Required Rules

- ロン候補にしない
- ツモ候補にしない
- 上がった後だけ加点する
- maxPoints設定を強く推奨
- オールマイティを含める設定は警告

## 9. Rule Settings

### Goal

通常版/拡張版、ロン、リーチ、オールマイティなどのルール設定を管理する。

### Display

```text
現在のルール: 通常版 / 拡張版
対応人数: 3人 / 4人
手牌: 8 -> 9 または 13 -> 14
role span: 3〜9 または 2〜14
ロン: ON
ポン: OFF固定
カン: OFF固定
チー: OFF固定
リーチ: experimental
オールマイティ: ON/OFF
```

### Buttons

```text
[通常版にする]
[拡張版にする]
[通常版から拡張版を作成]
[ルールを初期値に戻す]
[保存]
```

### Restrictions

- `supportedPlayerCounts` は 3/4 のみ
- 2人戦は作らない
- ポン/カン/チーはONにできない
- MVPでは拡張版の対局UIは後回しでもよい
- experimentalはラベル表示する

## 10. Balance Check

### Goal

ユーザーが壊れたデッキを作った時に警告する。

### Checks

```text
上がり役が少なすぎる
上がり役が多すぎる
ロン可能役が多すぎる
2枚役の点数が高すぎる
特殊役の点数が高すぎる
スコアボーナスの上限がない
オールマイティが多すぎる
最高点役でオールマイティが許可されている
総牌枚数が少なすぎる
3人/4人に対して山が足りない
supportedPlayerCountsが不正
画像共有禁止フィールドがある
```

### Buttons

```text
[自動修正案を見る]
[該当役を編集]
[該当牌を編集]
[警告を無視して保存]
[戻る]
```

## 11. Import / Export

### Goal

画像なしJSONでデッキを共有する。

### Import Buttons

```text
[JSONを貼り付け]
[ファイルを選択]
[読み込む]
[キャンセル]
```

### Export Buttons

```text
[JSONをコピー]
[JSONをダウンロード]
[共有文をコピー]
[戻る]
```

### Required Warnings

```text
画像は共有されません
ローカル画像は自分の端末だけで使われます
既存IP画像や外部画像URLはJSONに含めません
```

### Import Validation

- Zod schema validation
- 画像系フィールドを拒否
- version確認
- ruleConfig確認
- supportedPlayerCounts確認
- 牌数/役数確認
- エラーは具体的に出す

## 12. Match Setup

### Goal

対戦開始前に、使用デッキと人数を確認する。

### Orientation

```text
844x390 landscape-first
```

### Display

```text
デッキ名
通常版/拡張版
3人戦/4人戦
CPU人数
上がり役数
特殊役数
ボーナス数
オールマイティ有無
バランス警告
```

### Buttons

```text
[3人で遊ぶ]
[4人で遊ぶ]
[役表を見る]
[デッキを編集]
[開始]
[戻る]
```

### Start Conditions

- 致命的エラーがない
- 人数が3または4
- 人数がsupportedPlayerCountsに含まれている
- 山枚数が足りる
- 上がり役がある
- MVPではbase-donjaraを優先する

## 13. Match Landscape

### Goal

3〜4人対戦を見やすく遊ぶ。

### Orientation

- 横向き前提
- portrait時はRotate Promptへ

### Layout Areas

```text
Top: Opponent top
Left: Opponent left
Right: Opponent right
Center: table / discards / deck / status
Bottom: my hand
Bottom-right: actions
```

### Buttons

```text
[引く]
[捨てる]
[あがる]
[ロン]
[パス]
[役表]
[メニュー]
```

### Button States

- [引く]: 自分のdraw phaseだけ有効
- [捨てる]: discard phaseで牌選択後に有効
- [あがる]: 自分の手牌でwin_role成立時のみ有効
- [ロン]: 他人の捨て牌でwin_role成立時のみ表示/有効
- [パス]: reaction phaseで表示
- [役表]: Rule Sheet Modalを開く
- [メニュー]: 一時停止/中断/設定を開く

### Must Show

```text
・現在の手番
・自分の手牌 8〜9枚
・相手2〜3人の手牌枚数
・直近の捨て牌
・各プレイヤーの捨て牌
・山枚数
・選択中の牌
・ロン/あがり可能状態
```

### Do Not Show Large

- 全役表
- 全特殊役一覧
- 全ボーナス一覧
- デッキ編集ボタン
- JSON共有ボタン

## 14. Rule Sheet / Role List Modal

### Goal

対戦前・対戦中に役表を確認する。

### Tabs

```text
上がり役
特殊役
ボーナス
オールマイティ
ルール
```

### Display Rules

- 上がり役はツモ/ロン対象であることを表示
- 特殊役は加点であることを表示
- ボーナスは加点であることを表示
- オールマイティの制限を表示

## 15. Result

### Goal

何で勝って何点だったか分かる。

### Orientation

```text
844x390 landscape-first
```

### Display

```text
勝者
ツモ/ロン/流局
放銃者（ロン時）
上がり役
特殊役
スコアボーナス
オールマイティ使用
合計点
獲得コイン
コレクション進行
```

### Buttons

```text
[もう一局]
[デッキを調整]
[役表を見る]
[結果をコピー]
[コレクションを見る]
[TOPへ]
```

## 16. Collection / Clear Board

### Goal

集めた役・ボーナス・実績を確認し、もう一度遊ぶ理由を作る。

### Orientation

```text
844x390 landscape-first
```

### Display

```text
Role Collection
ScoreBonus Collection
Result Album Top 10
Clear Board 5x5
称号/見た目報酬
```

## 17. Rotate Prompt

### Goal

縦向きで主要画面に入った時に、横向きを促す。

### Display

```text
そろぽんは横画面で遊びます
端末を横向きにしてください
```

### Buttons

```text
[対戦準備に戻る]
[TOPへ戻る]
```

MVPでは「このまま表示を試す」は不要。

## 18. Confirm / Error Dialogs

### Confirm Dialogs

必要な確認。

```text
デッキ削除
役削除
牌削除
未保存で戻る
警告を無視して保存
対戦を中断
```

### Error Dialogs

表示するエラー。

```text
JSONが読み込めない
画像情報が含まれている
山枚数が足りない
上がり役がない
3人/4人設定が不正
2人戦は未対応
MVPでは拡張ルールを開始できない
```

## Navigation Summary

```text
TOP
  ├─ Deck List
  │   ├─ Deck Detail
  │   │   ├─ Match Setup
  │   │   └─ Deck Editor
  │   ├─ Import / Export
  │   └─ Deck Editor
  ├─ Import
  └─ Match Setup

Deck Editor
  ├─ Tile Editor
  ├─ Win Role Editor
  ├─ Special Bonus Editor
  ├─ Score Bonus Editor
  ├─ Rule Settings
  ├─ Balance Check
  └─ Import / Export

Match Setup
  ├─ Rule Sheet Modal
  └─ Match Landscape

Match Landscape
  ├─ Rule Sheet Modal
  ├─ Result
  └─ Rotate Prompt

Result
  ├─ Match Setup
  ├─ Deck Editor
  ├─ Collection / Clear Board
  └─ TOP
```

## Final Notes

- 画面を増やす時はこのファイルに追加する
- ボタンを追加する時は挙動と表示条件を書く
- 対戦中にEditorやJSON共有を目立たせない
- Editorではバランス警告を重視する
- ResultからDeck Editorへ戻れることは重要
- 横画面固定方針を崩さない
