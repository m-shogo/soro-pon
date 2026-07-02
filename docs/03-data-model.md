# Data Model

## Design Principles

- 3〜4人戦を前提にする
- 2人専用構造にしない
- 標準ルールはドンジャラ互換にする
- 将来の拡張ルールに耐えるRuleConfigを持つ
- 牌はカテゴリを複数持てる
- 画像は共有JSONに含めない
- ルールエンジンはUIから分離する
- Zodでimport/export schemaを検証する
- あがり判定用の役と、加点用の特殊役/ボーナスを分ける

## Tile

```ts
type Tile = {
  id: string;
  name: string;
  categories: string[];
  emoji?: string;
  fallbackLabel?: string;
  count: number;
};
```

### Notes

- `categories` は複数可
- `emoji` は画像がない場合の表示
- `fallbackLabel` は絵文字も画像もない場合の短い表示
- `count` は山に入れる枚数

## TileInstance

山・手牌・捨て牌では、定義としてのTileではなくインスタンスを使う。

```ts
type TileInstance = {
  instanceId: string;
  tileId: string;
};
```

## LocalTileOverride

画像や表示名の上書きはローカル専用。

```ts
type LocalTileOverride = {
  tileId: string;
  displayName?: string;
  localImageId?: string;
  emoji?: string;
};
```

これは共有JSONに含めない。

## RuleConfig

標準ルールと将来の拡張ルールを分離するために、RuleConfigを持つ。

MVPでは `BASE_DONJARA_RULE` のみを有効にする。  
ただし、後から14枚手札や2〜14枚役などを入れられるように、型としては拡張可能にする。

```ts
type RuleConfig = {
  id: string;
  name: string;
  handSizeNormal: number;
  handSizeAfterDraw: number;
  winHandSize: number;
  roleSpanMin: number;
  roleSpanMax: number;
  allowRon: boolean;
  allowPon: false;
  allowReach: boolean;
  allowScoreBonus: boolean;
  allowKan: false;
  allowChi: false;
};
```

標準ルール:

```ts
const BASE_DONJARA_RULE: RuleConfig = {
  id: 'base-donjara',
  name: 'ドンジャラ互換',
  handSizeNormal: 8,
  handSizeAfterDraw: 9,
  winHandSize: 9,
  roleSpanMin: 3,
  roleSpanMax: 3,
  allowRon: true,
  allowPon: false,
  allowReach: false,
  allowScoreBonus: true,
  allowKan: false,
  allowChi: false,
};
```

将来拡張候補:

```ts
const EXTENDED_HAND_RULE: RuleConfig = {
  id: 'extended-hand',
  name: '拡張手札',
  handSizeNormal: 13,
  handSizeAfterDraw: 14,
  winHandSize: 14,
  roleSpanMin: 2,
  roleSpanMax: 14,
  allowRon: true,
  allowPon: false,
  allowReach: true,
  allowScoreBonus: true,
  allowKan: false,
  allowChi: false,
};
```

## RoleKind

役候補爆発を防ぐため、役を分類する。

```ts
type RoleKind = 'win_role' | 'special_bonus' | 'score_bonus';
```

- `win_role`: あがり判定に使う。ツモ/ロン対象
- `special_bonus`: 上がった後に加点。ツモ/ロン対象外
- `score_bonus`: 上がった後に加点。ツモ/ロン対象外

## Role

```ts
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

### Notes

- 標準ルールでは `win_role.span = 3`
- 拡張ルールでは `win_role.span = 2〜14` を許可する予定
- `span = 2` の `win_role` はツモ/ロン可能な小型あがり役
- `span = 2` の役でもポンは不可
- `special_bonus` と `score_bonus` はロン候補にしない

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

## RoleCondition

```ts
type RoleCondition =
  | {
      type: 'contains_all';
      tileIds: string[];
    }
  | {
      type: 'same_name_count';
      name: string;
      count: number;
    }
  | {
      type: 'same_category_count';
      category: string;
      count: number;
    }
  | {
      type: 'all_different_categories';
      count: number;
    }
  | {
      type: 'exact_group';
      tileIds: string[];
    }
  | {
      type: 'choose_n_from';
      tileIds: string[];
      choose: number;
    };
```

### Notes

- `choose_n_from` は特殊役で使う
- 例: 4キャラのうち3キャラが含まれていたら加点

## DeckDefinition / RuleSet

```ts
type DeckDefinition = {
  version: 1;
  id: string;
  name: string;
  description?: string;
  minPlayers: 3;
  maxPlayers: 4;
  ruleConfig: RuleConfig;
  tiles: Tile[];
  roles: Role[];
  scoreBonuses?: ScoreBonus[];
};
```

## PlayerState

```ts
type PlayerState = {
  id: string;
  name: string;
  type: 'human' | 'cpu';
  hand: TileInstance[];
  discards: TileInstance[];
  score: number;
  isReach?: boolean;
  isWinner?: boolean;
};
```

### Notes

- `isReach` は将来拡張用
- MVPでは常にfalse扱いでよい

## ReactionState

捨て牌へのロン反応を扱うための状態。

```ts
type ReactionState = {
  discardOwnerId: string;
  discardedTile: TileInstance;
  candidatePlayerIds: string[];
  type: 'ron';
};
```

重要:

- reactionはロン用
- ポンは作らない
- カンもチーも作らない
- ロン判定は `win_role` のみ
- `special_bonus` と `score_bonus` はロン判定に使わない

MVPでは未使用でもよいが、MatchStateに後から追加できる設計にする。

## MatchState

```ts
type MatchPhase = 'draw' | 'discard' | 'reaction' | 'result';

type MatchState = {
  deckId: string;
  ruleConfigId: string;
  players: PlayerState[];
  drawPile: TileInstance[];
  currentPlayerIndex: number;
  phase: MatchPhase;
  lastDrawnTile?: TileInstance;
  lastDiscard?: {
    tile: TileInstance;
    ownerPlayerId: string;
  };
  reaction?: ReactionState;
  selectedTileInstanceId?: string;
  winnerPlayerId?: string;
  result?: MatchResult;
};
```

## MatchResult

```ts
type WinMethod = 'tsumo' | 'ron';

type MatchResult = {
  winnerPlayerId: string;
  winMethod: WinMethod;
  sourcePlayerId?: string; // ronの場合の放銃者
  winRoles: Array<{
    roleId: string;
    name: string;
    points: number;
    span: number;
  }>;
  specialBonuses: Array<{
    roleId: string;
    name: string;
    points: number;
    span: number;
  }>;
  scoreBonuses: Array<{
    bonusId: string;
    name: string;
    points: number;
  }>;
  totalPoints: number;
};
```

## Scoring Flow

```text
1. win_role であがり判定
2. あがり成立
3. 手の中に special_bonus が含まれているか判定
4. score_bonus を計算
5. totalPoints を出す
```

## Shared JSON Rule

共有JSONに含めてよいもの。

- deck id
- deck name
- ruleConfig
- tile definitions
- categories
- emoji
- fallbackLabel
- counts
- roles
- role kind
- role span
- role conditions
- points
- score bonus config

共有JSONに含めてはいけないもの。

- image
- imageUrl
- imageBase64
- remoteImage
- localImageId
- blob URL
- file path

## Validation

import時はZod schemaで検証する。

- 必須フィールド欠落はエラー
- unknown field は原則stripまたはエラー
- 画像系フィールドは拒否または除外
- tilesが空ならエラー
- rolesが空なら警告またはエラー
- player count は3または4のみ
- `allowPon` は常に false
- `allowKan` は常に false
- `allowChi` は常に false
- `special_bonus.canTsumo` は false
- `special_bonus.canRon` は false
- `score_bonus.canTsumo` は false
- `score_bonus.canRon` は false
- MVPでは `ruleConfig.id = 'base-donjara'` のみ有効
- 拡張ルールはexperimental扱い
