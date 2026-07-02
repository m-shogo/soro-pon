# Role Taxonomy and Scoring

## Purpose

役候補の爆発、ロン確認の増えすぎ、同じ牌ボーナスの暴走を避けるため、あがり判定と加点を分離する。

## Final Gate Alignment

このファイルは `docs/47-mvp-implementation-final-gate.md` と整合する。

固定:

```text
Role.kind は win_role / special_bonus のみ
score_bonus は Role.kind に入れず ScoreBonus[] で扱う
ロン/ツモ判定の対象は win_role のみ
special_bonus と ScoreBonus[] は上がった後だけ加点
```

## Final Taxonomy

```text
上がり役 = win_role
特殊役 = special_bonus
スコアボーナス = ScoreBonus[]
```

ロン/ツモ判定の対象にするのは、原則として **win_roleだけ**。

## Role Kinds

```ts
type RoleKind = 'win_role' | 'special_bonus';
```

`score_bonus` は `RoleKind` に含めない。

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
13枚役
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
- 役候補を増やさずに、テーマ性や関係性を出せる

### Examples

```text
指定3枚が手の中に含まれている => +80
指定4枚のうち3枚が含まれている => +70
指定5枚のうち3枚が含まれている => +60
```

### Why This Matters

特殊役を上がり判定に入れると、ロン候補が増えすぎる。

```text
悪い例:
特殊役でもロン可能
=> 毎回ロン候補が増える

良い例:
上がり役であがる
=> 手の中に特殊役があれば加点
```

## 3. ScoreBonus

`ScoreBonus` は、役ではなく得点補正。

### Characteristics

- `Role.kind` ではない
- ツモ判定対象ではない
- ロン判定対象ではない
- 単体ではあがれない
- 上がった後に加点される
- 同じ牌/同じ名前/同じカテゴリが多い場合の加点に使う

### Examples

```text
同じ牌3枚 => +30
同じ名前3枚 => +点
同じカテゴリが多い => +点
```

### Guardrails

- 上限を持つ
- 役点とは別表示にする
- これだけで勝ち筋が決まらないようにする
- Deck Editorで強すぎる場合に警告する
- wildcardを含める設定は警告する

## Data Model

### Role

```ts
type RoleKind = 'win_role' | 'special_bonus';

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
  allowWildcard?: boolean;
  maxWildcardUse?: number;
  matchMode?: 'contains_pattern' | 'exact_hand';
  coveragePolicy?: 'allow_extra_tiles' | 'must_cover_full_hand';
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
```

### ScoreBonus

```ts
type ScoreBonus = {
  id: string;
  name: string;
  type: 'duplicate_tile' | 'duplicate_name' | 'duplicate_category';
  minCount: number;
  points: number;
  maxPoints?: number;
  description?: string;
  allowWildcard?: boolean;
};
```

`ScoreBonus` は `DeckVariant.scoreBonuses` に置く。

```ts
type DeckVariant = {
  id: string;
  name: string;
  label: '通常版' | '拡張版';
  ruleConfig: RuleConfig;
  roles: Role[];
  scoreBonuses?: ScoreBonus[];
  isExperimental?: boolean;
};
```

## Scoring Flow

得点計算は以下の順番。

```text
1. win_role であがり判定
2. あがり成立
3. 手の中に special_bonus が含まれているか判定
4. ScoreBonus[] を計算
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

ScoreBonus[]:
  ロン/ツモ判定には使わない
  あがり成立後に加点する
```

## Result Display

Result画面では分けて表示する。

```text
上がり役
・どうぶつ王国 180点

特殊役
・サバンナ三兄弟 +80点

ボーナス
・同じ牌3枚 +30点

合計 290点
```

## Deck Editor Requirements

Deck Editorでは、作るものを分ける。

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
スコアボーナスの上限がありません。
スコアボーナスが上がり役より強くなっています。
```

## Final Rule

- あがり判定は `win_role` のみ
- `special_bonus` は上がった後に加点
- `ScoreBonus[]` は上がった後に加点
- `score_bonus` を `Role.kind` に入れない
- 特殊役をロン候補にしない
- スコアボーナスをロン候補にしない
- ロン候補を増やしすぎない
