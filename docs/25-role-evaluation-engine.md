# Role Evaluation Engine

## Purpose

上がり役、特殊役、スコアボーナス、オールマイティの判定順を固定する。

結論:

```text
1. win_roleだけで上がり判定する
2. 最高点のwin_roleを1つ選ぶ
3. その後special_bonusを加点する
4. その後score_bonusを加点する
5. オールマイティは自動で最も得する割当にする
```

## Evaluation Input

```ts
type EvaluateHandInput = {
  hand: TileInstance[];
  discardedTile?: TileInstance;
  winMethod: 'tsumo' | 'ron';
  deckProject: DeckProject;
  variantId: string;
  sourcePlayerId?: string;
};
```

## Evaluation Output

```ts
type EvaluateHandResult = {
  canWin: boolean;
  selectedWinRole?: EvaluatedRole;
  matchedWinRoles: EvaluatedRole[];
  specialBonuses: EvaluatedRole[];
  scoreBonuses: EvaluatedScoreBonus[];
  wildcardAssignments: WildcardAssignment[];
  totalPoints: number;
};
```

## Fixed Evaluation Order

```text
1. variantを取得
2. kind = win_role のみ抽出
3. winMethodに応じてcanTsumo/canRonを確認
4. role.span <= hand size の役だけ評価
5. オールマイティを含めて成立判定
6. 成立したwin_roleをpoints desc, span desc, definition order ascで並べる
7. 先頭をselectedWinRoleにする
8. selectedWinRoleがなければcanWin=false
9. あがり成立後にspecial_bonusを評価
10. score_bonusを評価
11. totalPointsを計算
```

## Role Priority

複数win_roleが成立した場合:

```text
1. pointsが高い
2. spanが大きい
3. variant.roles内の定義順が早い
```

これで固定。

理由:

- 高得点を自動で選ぶ
- 大型役の気持ちよさを優先する
- 同点時も決定的に処理できる

## Role Match Mode

```ts
type RoleMatchMode = 'contains_pattern' | 'exact_hand';

type RoleCoveragePolicy = 'allow_extra_tiles' | 'must_cover_full_hand';
```

### contains_pattern

手札の中に条件を満たす組み合わせが含まれていれば成立。

2〜13枚役の標準。

### exact_hand

手札全体が条件を満たす場合だけ成立。

14枚全体役などで使う。

### allow_extra_tiles

余り牌を許可する。

13枚役では必須。

### must_cover_full_hand

手札全体を役条件で覆う。

14枚役で使う。

## 13-card Role

固定:

```text
13枚役は成立可能
14枚手札の中に13枚分の条件が含まれていれば成立
残り1枚は余り牌として扱う
```

設定:

```ts
{
  span: 13,
  matchMode: 'contains_pattern',
  coveragePolicy: 'allow_extra_tiles'
}
```

## 14-card Role

固定:

```text
14枚役は最大級役
必要なら14枚全体を条件で覆う
```

設定:

```ts
{
  span: 14,
  matchMode: 'exact_hand',
  coveragePolicy: 'must_cover_full_hand'
}
```

## RoleCondition

実装する条件。

```ts
type RoleCondition =
  | { type: 'contains_all'; tileIds: string[] }
  | { type: 'same_tile_count'; count: number }
  | { type: 'same_name_count'; name: string; count: number }
  | { type: 'same_category_count'; category: string; count: number }
  | { type: 'all_different_categories'; count: number }
  | { type: 'exact_group'; tileIds: string[] }
  | { type: 'choose_n_from'; tileIds: string[]; choose: number };
```

### same_tile_count

追加する。

理由:

```text
同じ牌3枚ボーナスを name: ANY ではなく明確に表現できる
```

## Wildcard Assignment

```ts
type WildcardAssignment = {
  wildcardTileInstanceId: string;
  usedAsTileId?: string;
  usedAsCategory?: string;
  roleId: string;
  source: 'auto' | 'manual';
};
```

MVPではsourceは常にautoでよい。

## Wildcard Priority

固定:

```text
1. selectedWinRoleを成立させるために最適化
2. special_bonusを高点順に評価
3. score_bonusには原則使わない
```

重要:

- 捨てられたオールマイティでロンは原則不可
- 1つのroleに使えるオールマイティはmaxWildcardUseまで
- score_bonusにはcountsForScoreBonus=falseなら含めない
- Resultには必ず何として使ったかを表示する

## Wildcard Reuse

MVP固定:

```text
selectedWinRoleで使ったwildcard assignmentはResultに記録する
special_bonusは加点判定用に再評価してよいが、同じwildcardを複数のspecial_bonusに無制限重複表示しない
```

実装方針:

```text
Result表示では、同じwildcard instanceの表示は1回を基本にする
複数bonusへの影響がある場合は詳細にまとめる
```

## Ron Evaluation

ロン判定では以下のみ見る。

```text
kind = win_role
canRon = true
```

見ないもの:

```text
special_bonus
score_bonus
```

捨て牌がオールマイティの場合:

```text
canTriggerRonWhenDiscarded = false ならロン不可
```

## Tsumo Evaluation

ツモ判定では以下のみ見る。

```text
kind = win_role
canTsumo = true
```

## Special Bonus Evaluation

あがり成立後だけ評価する。

```text
canTsumo = false
canRon = false
```

複数成立したら全部加点してよい。

ただし、将来的に上限が必要ならvariant側にmaxSpecialBonusPointsを追加できる。

## Score Bonus Evaluation

あがり成立後だけ評価する。

MVPでは以下を実装する。

```text
duplicate_tile
duplicate_category
```

必ずmaxPointsを推奨する。

## Final Decision

- win_roleだけで上がり判定
- special_bonus/score_bonusは上がった後だけ
- 複数win_roleはpoints desc, span desc, definition order asc
- 13枚役はallow_extra_tiles
- 14枚役はmust_cover_full_hand可能
- オールマイティは自動割当
- 手動割当UIは後回し
- same_tile_countを追加する
