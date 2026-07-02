# Role Taxonomy and Scoring

## Purpose

役候補の爆発、ロン確認の増えすぎ、同じキャラボーナスの暴走を避けるため、役を分類する。

結論:

```text
上がり役 = あがり判定に使う
特殊役 = 上がった後に加点する
スコアボーナス = 上がった後に加点する
```

ロン/ツモ判定の対象にするのは、原則として **上がり役だけ**。

## Role Kinds

```ts
type RoleKind =
  | 'win_role'
  | 'special_bonus'
  | 'score_bonus';
```

## 1. Win Role

`win_role` は、あがるための役。

### Characteristics

- ツモ判定対象
- ロン判定対象
- あがり条件そのもの
- MatchResultの主役
- 対局中の候補表示に出してよい

### Examples

標準ルール:

```text
同じカテゴリ3枚 × 3組
指定3枚セット × 3組
9枚全体で成立する上がり役
```

拡張ルール:

```text
2枚役
3枚役
12枚役
14枚全体役
```

### Guardrails

- `win_role` を増やしすぎるとロン候補が爆発する
- 2枚の `win_role` は低〜中点にする
- 大型 `win_role` はロマン枠として高点でもよい
- `win_role` 数が多すぎる場合はDeck Editorで警告する

## 2. Special Bonus

`special_bonus` は、上がった手の中に含まれていたら加点される特殊役。

### Characteristics

- ツモ判定対象ではない
- ロン判定対象ではない
- 単体ではあがれない
- 上がった後に得点へ加算される
- 役候補を増やさずに、キャラ関係性やテーマ性を出せる

### Examples

```text
指定3キャラが手の中に含まれている => +15
指定4キャラのうち3キャラが含まれている => +6
指定5キャラのうち3キャラが含まれている => +3
```

### Why This Matters

特殊役を上がり判定に入れると、ロン候補が増えすぎる。

そのため特殊役は、上がった後の加点として扱う。

```text
悪い例:
特殊役でもロン可能
=> 毎回ロン候補が増える

良い例:
上がり役であがる
=> 手の中に特殊役があれば加点
```

## 3. Score Bonus

`score_bonus` は、役というより得点補正。

### Characteristics

- ツモ判定対象ではない
- ロン判定対象ではない
- 単体ではあがれない
- 上がった後に加点される
- 同じキャラ/同じ牌/同じカテゴリが多い場合の加点に使う

### Examples

```text
同じ牌3枚 => +5
同じ牌4枚 => +10
同じ名前が多い => +点
同じカテゴリが多い => +点
```

### Guardrails

- 上限を持つ
- 役点とは別表示にする
- これだけで勝ち筋が決まらないようにする
- Deck Editorで強すぎる場合に警告する

## Data Model

```ts
type RoleKind = 'win_role' | 'special_bonus' | 'score_bonus';

type Role = {
  id: string;
  name: string;
  kind: RoleKind;
  points: number;
  span: number;
  condition: RoleCondition;
  description?: string;
  canTsumo: boolean;
  canRon: boolean;
};
```

### Required Rules

```text
kind = win_role:
  canTsumo can be true
  canRon can be true

kind = special_bonus:
  canTsumo must be false
  canRon must be false

kind = score_bonus:
  canTsumo must be false
  canRon must be false
```

## ScoreBonus

同じキャラ/同じ牌が多いほど加点する場合は、RoleではなくScoreBonusとして分けてもよい。

```ts
type ScoreBonus = {
  id: string;
  name: string;
  type: 'duplicate_tile' | 'duplicate_name' | 'duplicate_category';
  minCount: number;
  points: number;
  maxPoints?: number;
  description?: string;
};
```

MVPでは `Role.kind = 'score_bonus'` でもよい。  
将来的に複雑になる場合は `ScoreBonus[]` として分離する。

## Scoring Flow

得点計算は以下の順番。

```text
1. win_role であがり判定
2. あがり成立
3. 手の中に special_bonus が含まれているか判定
4. score_bonus を計算
5. 合計点を出す
```

## Ron/Tsumo Flow

ロン/ツモ判定は `win_role` だけで行う。

```text
ツモ:
  自分の手牌 + 引いた牌
  win_roleが成立するか見る

ロン:
  自分の手牌 + 他人の捨て牌
  win_roleが成立するか見る

special_bonus:
  ロン/ツモ判定には使わない
  あがり成立後に加点する

score_bonus:
  ロン/ツモ判定には使わない
  あがり成立後に加点する
```

## Result Display

Result画面では分けて表示する。

```text
上がり役
・麦わらの一味セット 21点

特殊役
・三船長 +15点

ボーナス
・同じキャラ3枚 +5点

合計 41点
```

## Deck Editor Requirements

Deck Editorでは、役を作るときに種類を選ばせる。

```text
[上がり役]
[特殊役]
[スコアボーナス]
```

説明文:

```text
上がり役: この役であがれる
特殊役: あがった後に加点される
スコアボーナス: 同じ牌が多いなどで加点される
```

## Balance Warnings

Deck Editorで出したい警告。

```text
上がり役が多すぎます。ロン候補が増えてテンポが悪くなる可能性があります。
2枚の上がり役の点数が高すぎます。
特殊役はロン対象ではありません。
同じキャラボーナスの上限がありません。
スコアボーナスが上がり役より強くなっています。
```

## Final Rule

- あがり判定は `win_role` のみ
- `special_bonus` は上がった後に加点
- `score_bonus` は上がった後に加点
- 同じキャラボーナスをロン候補にしない
- 特殊役をロン候補にしない
- ロン候補を増やしすぎない
