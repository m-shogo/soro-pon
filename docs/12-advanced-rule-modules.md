# Advanced Rule Modules

## Purpose

`soro-pon` は、標準ルールとしてドンジャラ互換の3〜4人用ルールを持つ。

一方で、将来的にはユーザーがより自由な役・手札構造・ポン・リーチなどを設定できる拡張ルールを入れたい。

このファイルは、拡張ルール案を標準ルールと混同しないためのメモ。

## Decision

拡張ルールは **最初からデータモデルで考慮する**。  
ただし、**MVPの対局UI・CPU・バランスには最初から全部入れない**。

理由:

- 後からデータモデルを変えると手戻りが大きい
- でも最初から全部遊べるようにするとバランスが壊れやすい
- UIが複雑になる
- CPUが難しくなる
- 何が面白いのか検証しにくくなる

したがって、実装順は以下。

1. データモデルに拡張余地を入れる
2. 標準ルールはドンジャラ互換で完成させる
3. 拡張ルールはexperimentalとして個別にON/OFFできるようにする
4. バランス検証後にUIへ出す

## Base Rule: Donjara-compatible

標準ルール。

- 3〜4人用
- 通常手牌8枚
- 自分の番で1枚引くと9枚
- あがり形は3枚セット×3組
- 共通山
- 共通役表
- 役と得点はデッキ定義

この標準ルールは壊さない。

## Proposed Advanced Rule: Extended Hand Mode

将来的に追加したい拡張。

### Concept

麻雀のように、手札上限を広げる。

- 通常手牌13枚
- 自分の番で1枚引くと14枚
- 2〜14枚までの役を作れる
- 14枚全体で1つの役でもよい
- 2枚役 + 12枚役のような組み合わせでもよい

### Example

```text
14枚役:
[全14枚で1つの巨大役]

分割役:
[2枚役] + [12枚役]

別分割:
[3枚役] + [3枚役] + [8枚役]
```

## Proposed Advanced Rule: Variable Role Span

役が要求する枚数を2〜14枚で設定できる。

```ts
type Role = {
  id: string;
  name: string;
  points: number;
  span: number; // 2〜14
  condition: RoleCondition;
};
```

### Notes

- 標準ドンジャラ互換では基本span=3
- 拡張ルールではspan=2〜14を許可する
- UI上は「この役は何枚で成立するか」を必ず表示する

## Proposed Advanced Rule: Pon on One-away Role

1枚で役が完成する場合、ポン可能にする。

例:

```text
10枚役がある
現在9枚そろっている
他プレイヤーが最後の1枚を捨てた
=> ポン可能
```

このポンは、麻雀のポンと完全同一というより、soro-pon独自の「役完成ポン」。

### Risk

- 大型役が強くなりすぎる
- 捨て牌が常に危険になる
- 反応待ちUIが増える
- CPU判断が難しくなる

### Implementation Timing

MVPには入れない。  
ただし、状態設計には以下を考慮する。

- lastDiscard
- discardOwnerId
- reactionCandidates
- canPonForRole
- passReaction

## Proposed Advanced Rule: Duplicate Character Bonus

同じキャラ/同じ牌を多く集めるほど点数に反映する。

例:

```text
同じ牌2枚: +5
同じ牌3枚: +15
同じ牌4枚: +30
```

または、Role側で倍率を持つ。

```ts
type DuplicateBonus = {
  target: 'same_tile' | 'same_name' | 'same_category';
  minCount: number;
  bonusPoints: number;
};
```

### Risk

- 同じ牌を集めるだけが強くなる
- カテゴリ役や大型役の価値が下がる
- 役作成者が点数を盛りすぎやすい

### Suggested Guardrails

- duplicate bonusは上限を持つ
- 役本体の点数とボーナス点を別表示にする
- デッキ編集画面で総合バランス警告を出す

## Proposed Advanced Rule: Reach

リーチあり。

### Concept

あと1枚であがれる状態でリーチ宣言できる。

```text
あと1枚で成立する役がある
=> リーチ可能
```

### Effects Candidate

未決定。候補:

- リーチ宣言で固定ボーナス
- リーチ後は手牌変更制限
- リーチ後にあがると追加点

### Risk

- 役判定が重くなる
- CPU判断が難しくなる
- UIが複雑になる

### Implementation Timing

MVPには入れない。  
ただし、データモデルでは `isReach` を将来的に持てるようにしてよい。

## Explicitly Not Planned

以下は入れない。

- カン
- チー

理由:

- ルールが麻雀寄りに複雑化する
- 初心者に分かりにくい
- UI/CPUが重くなる
- soro-ponの主役である自作役体験からズレやすい

## Balance Assessment

### 面白くなる可能性

- 大型役を作れる
- オタク的な「この14枚で神役」ができる
- 友達に見せたくなる
- JSON共有と相性がよい
- 自作デッキ文化が強くなる

### 壊れやすい点

- 役が大きすぎると毎回同じ狙いになる
- 2枚役が強すぎると小役連打になる
- 14枚役が強すぎるとゲームが長くなる
- ポン可能条件が多すぎるとテンポが止まる
- リーチとポンが同時にあると反応UIが重くなる
- CPUが馬鹿に見えやすい

## Recommendation

最初から遊べるルールとして全部入れない。

ただし、以下は最初から設計に入れる。

- handSizeNormal
- handSizeAfterDraw
- winHandSize
- role span
- role grouping strategy
- reaction window
- duplicate bonus model
- reach-capable state

MVPでは以下に固定。

```ts
const BASE_DONJARA_RULE = {
  handSizeNormal: 8,
  handSizeAfterDraw: 9,
  winHandSize: 9,
  roleSpanMin: 3,
  roleSpanMax: 3,
  allowPon: false,
  allowReach: false,
  allowDuplicateBonus: false,
  allowKan: false,
  allowChi: false,
};
```

将来拡張。

```ts
const EXTENDED_HAND_RULE = {
  handSizeNormal: 13,
  handSizeAfterDraw: 14,
  winHandSize: 14,
  roleSpanMin: 2,
  roleSpanMax: 14,
  allowPon: true,
  allowReach: true,
  allowDuplicateBonus: true,
  allowKan: false,
  allowChi: false,
};
```

## Final Direction

- ドンジャラ互換ルールを標準にする
- 拡張ルールはルールモジュールとして持つ
- 最初の実装では標準ルールだけ遊べるようにする
- データモデルは拡張に耐えるようにする
- UIに出すのは、標準ルールが気持ちよく遊べるようになってから
