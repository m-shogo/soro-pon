# Extended Role Span and DB Policy

## Purpose

拡張版で2枚役〜14枚役を扱うためのDB/判定方針を固定する。

結論:

```text
拡張版では win_role.span = 2〜14 を許可する。
13枚役も可能。
```

## Why 13-card Roles Are Possible

14枚手札ルールで13枚役を成立させるには、役の考え方を分ける必要がある。

悪い設計:

```text
14枚の手札を、必ず役だけで完全に埋める
```

この場合、13枚役は残り1枚の扱いに困る。

良い設計:

```text
14枚の手札の中に、13枚分の条件を満たす組み合わせが含まれていれば成立
残り1枚は余り牌として許可
```

この設計なら13枚役は自然に成立する。

## Role Span

```ts
type Role = {
  id: string;
  name: string;
  kind: RoleKind;
  points: number;
  span: number; // base: 3 or 9, extended: 2〜14
  condition: RoleCondition;
  description?: string;
  canTsumo: boolean;
  canRon: boolean;
  allowWildcard?: boolean;
  maxWildcardUse?: number;
  matchMode?: RoleMatchMode;
  coveragePolicy?: RoleCoveragePolicy;
};
```

## Match Mode

```ts
type RoleMatchMode =
  | 'contains_pattern'
  | 'exact_hand';
```

### contains_pattern

手札の中に条件を満たす組み合わせが含まれていれば成立。

```text
14枚手札の中に13枚役が含まれている
=> 成立
```

MVP/拡張版の標準はこれ。

### exact_hand

手札全体が条件を満たす場合だけ成立。

```text
14枚役で、14枚全部が条件を満たす
=> 成立
```

14枚全体役や、厳密な大役で使う。

## Coverage Policy

```ts
type RoleCoveragePolicy =
  | 'allow_extra_tiles'
  | 'must_cover_full_hand';
```

### allow_extra_tiles

役に使わない余り牌を許可する。

13枚役ではこれを使う。

### must_cover_full_hand

手札全体を役条件で覆う必要がある。

14枚全体役で使う。

## Recommended Defaults

標準ルール:

```ts
const BASE_ROLE_DEFAULTS = {
  matchMode: 'contains_pattern',
  coveragePolicy: 'allow_extra_tiles',
};
```

拡張ルール:

```ts
const EXTENDED_ROLE_DEFAULTS = {
  matchMode: 'contains_pattern',
  coveragePolicy: 'allow_extra_tiles',
};
```

14枚全体役だけ例外的に:

```ts
{
  matchMode: 'exact_hand',
  coveragePolicy: 'must_cover_full_hand'
}
```

## Span Examples

```text
2枚役: 小型あがり。低点。ツモ/ロン可能。ポンなし。
3枚役: 基本関係役。通常版では特殊役、拡張版では上がり役にもできる。
4枚役: チーム/組織の小型集合。
5枚役: カテゴリ集合。
6枚役: 中型集合。
7枚役: やや重いテーマ役。
8枚役: 大型寄り。
9枚役: 通常版の手札全体相当。
10枚役: 拡張版の大型役。
11枚役: かなり大型。
12枚役: 大型テーマ役。
13枚役: 14枚中13枚を満たす準全体役。余り1枚を許可する。
14枚役: 14枚全体を使う最大級役。
```

## Win Evaluation Rule

MVP/拡張版では以下にする。

```text
1. 現在の手札を取得する
2. kind = win_role のみ評価する
3. role.span が手札枚数以下なら評価対象にする
4. matchMode に従って判定する
5. 複数成立した場合、最高点の win_role を採用する
6. special_bonus / score_bonus は上がり成立後に加点する
```

## Important Guardrails

- 2枚役を高点にしすぎない
- 2枚役はロン可能でもポンは作らない
- 13枚役は余り1枚を許可する
- 14枚役は `must_cover_full_hand` を使ってもよい
- special_bonus と score_bonus はロン候補にしない
- 同じキャラボーナスは `score_bonus` として扱う
- オールマイティは基本1役1枚まで

## DB Extension Safety

将来拡張に耐えるため、DB/JSONでは以下を許可する。

```text
Role.span: 2〜14
Role.matchMode
Role.coveragePolicy
Role.allowWildcard
Role.maxWildcardUse
Role.kind
Role.canTsumo
Role.canRon
```

ただしMVP UIでは全部を複雑に見せない。

Editorでは初期表示を簡単にし、詳細設定として開けるようにする。

## Final Decision

- 2〜14枚役をすべて扱えるようにする
- 13枚役は可能
- 13枚役は `contains_pattern + allow_extra_tiles` として扱う
- 14枚役は必要に応じて `exact_hand + must_cover_full_hand` にできる
- DBはRole spanだけでなく matchMode / coveragePolicy を持てるようにする
