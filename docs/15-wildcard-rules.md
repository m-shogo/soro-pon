# Wildcard Rules

## Purpose

オールマイティ牌を入れる。

ただし、何でも無制限に代用できるとゲームバランスが壊れるため、用途を明確に制限する。

## Terminology

このrepoでは、オールマイティ牌を実装上 `wildcard` と呼ぶ。

UIでは以下の表記を検討する。

```text
オールマイティ
フリー牌
万能牌
```

## Core Rule

オールマイティ牌は、役の不足分を補える牌。

例:

```text
必要: A + B + C
手牌: A + B + オールマイティ
=> オールマイティをCとして扱い、役成立
```

## Default Behavior

標準設定。

```ts
const DEFAULT_WILDCARD_RULE = {
  kind: 'any_tile',
  maxUsePerRole: 1,
  canCompleteWinRole: true,
  canCompleteSpecialBonus: true,
  canTriggerRonWhenDiscarded: false,
  countsForScoreBonus: false,
};
```

## Why These Defaults

### maxUsePerRole: 1

1つの役に複数枚のオールマイティを使えると、役が簡単になりすぎる。

そのため、基本は1役につき1枚まで。

### canCompleteWinRole: true

オールマイティの主目的。  
上がり役の不足分を補える。

### canCompleteSpecialBonus: true

特殊役にも使える。  
ただし特殊役はロン/ツモ判定に使わないため、テンポは壊れにくい。

### canTriggerRonWhenDiscarded: false

捨てられたオールマイティを何にでも使ってロン可能にすると、ロン候補が爆発する。

そのため、デフォルトでは以下。

```text
手牌内のオールマイティ => 代用できる
捨てられたオールマイティ => ロンの万能牌にはしない
```

### countsForScoreBonus: false

同じキャラボーナスにオールマイティを含めると、ボーナスが強くなりすぎる。

そのため、デフォルトではスコアボーナスに含めない。

## Wildcard Kinds

```ts
type WildcardRule = {
  kind: 'any_tile' | 'category_limited' | 'specific_tiles';
  categories?: string[];
  tileIds?: string[];
  maxUsePerRole?: number;
  canCompleteWinRole: boolean;
  canCompleteSpecialBonus: boolean;
  canTriggerRonWhenDiscarded: boolean;
  countsForScoreBonus: boolean;
};
```

### any_tile

どの牌の代わりにもなれる。

```text
最も強い。
基本は枚数を少なくする。
```

### category_limited

指定カテゴリの牌としてだけ使える。

```text
例: 「海軍」カテゴリの代わりだけできる
```

### specific_tiles

指定された牌IDの代わりにだけ使える。

```text
例: A/B/C のどれかとしてだけ使える
```

## Role-side Control

役ごとにオールマイティを許可/禁止できる。

```ts
type Role = {
  allowWildcard?: boolean;
  maxWildcardUse?: number;
};
```

例:

```text
最高点の14枚役ではオールマイティ禁止
通常の3枚役では1枚まで許可
特殊役では1枚まで許可
```

## Ron Rules

ロン判定は `win_role` のみ。

さらに、オールマイティの扱いは以下。

### 自分の手牌にあるオールマイティ

ロン時でも、自分の手牌内のオールマイティは不足分の代用に使える。

```text
自分の手牌: A + オールマイティ
相手の捨て牌: B
必要役: A + B + C
=> オールマイティをCとして使える
```

### 相手が捨てたオールマイティ

デフォルトでは、相手が捨てたオールマイティを万能牌としてロンに使えない。

```text
相手の捨て牌: オールマイティ
=> デフォルトでは、何にでもなるロン牌として扱わない
```

理由:

- ロン候補が増えすぎる
- 捨て牌確認が重くなる
- オールマイティを捨てる行為が危険すぎる

必要になったら `canTriggerRonWhenDiscarded: true` のルールで解放する。

## Special Bonus Rules

特殊役はロン/ツモ判定に使わない。

ただし、上がった後の加点判定ではオールマイティを使える。

```text
上がり役であがった
手の中に A + B + オールマイティ がある
特殊役 A+B+C がある
=> オールマイティをCとして特殊役加点
```

## Score Bonus Rules

同じキャラ/同じ牌ボーナスでは、デフォルトでオールマイティを枚数に含めない。

```text
A + A + オールマイティ
=> 同じAが3枚とは数えない
```

必要なら `countsForScoreBonus: true` で解放できるが、非推奨。

## Balance Risks

### 強すぎるケース

```text
・オールマイティが多すぎる
・1役に複数枚使える
・捨てられたオールマイティでロン可能
・同じキャラボーナスにも含める
・高得点役にも無制限に使える
```

### 推奨制限

```text
・1役につき1枚まで
・デッキ内のオールマイティ枚数は少なめ
・最高点役では禁止も検討
・スコアボーナスには含めない
・捨てられたオールマイティでロン不可を基本にする
```

## Deck Editor Warnings

Deck Editorで出したい警告。

```text
オールマイティ牌が多すぎます。
1つの役に複数枚のオールマイティを使える設定です。
捨てられたオールマイティでロン可能になっています。ロン候補が増えすぎる可能性があります。
オールマイティが同じキャラボーナスに含まれています。得点が強くなりすぎる可能性があります。
最高得点役でオールマイティが許可されています。
```

## Result Display

オールマイティを使った場合、結果画面に明示する。

```text
上がり役
・麦わらの一味セット 21点
  ※ オールマイティを「C」として使用

特殊役
・三船長 +15点

合計 36点
```

## Final Rule

- オールマイティは入れる
- ただし無制限にはしない
- 基本は1役につき1枚まで
- 手牌内のオールマイティは代用可
- 捨てられたオールマイティでロンは原則不可
- 特殊役の加点には使える
- スコアボーナスには原則含めない
- 使用結果はResultで表示する
