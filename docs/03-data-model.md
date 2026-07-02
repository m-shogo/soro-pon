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
  allowPon: boolean;
  allowReach: boolean;
  allowDuplicateBonus: boolean;
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
  allowPon: false,
  allowReach: false,
  allowDuplicateBonus: false,
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
  allowPon: true,
  allowReach: true,
  allowDuplicateBonus: true,
  allowKan: false,
  allowChi: false,
};
```

## Role

```ts
type Role = {
  id: string;
  name: string;
  points: number;
  span: number;
  condition: RoleCondition;
  description?: string;
  duplicateBonus?: DuplicateBonus;
};
```

### Notes

- 標準ルールでは `span = 3`
- 拡張ルールでは `span = 2〜14` を許可する予定
- `duplicateBonus` は将来拡張用。MVPでは使わない

## DuplicateBonus

同じ牌・同じ名前・同じカテゴリが多いほど点数を加算する将来拡張。

```ts
type DuplicateBonus = {
  target: 'same_tile' | 'same_name' | 'same_category';
  minCount: number;
  bonusPoints: number;
  maxBonusPoints?: number;
};
```

MVPでは無効。

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
    };
```

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

捨て牌への反応を将来扱うための状態。

```ts
type ReactionState = {
  discardOwnerId: string;
  discardedTile: TileInstance;
  candidatePlayerIds: string[];
  type: 'win' | 'pon';
};
```

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
type MatchResult = {
  winnerPlayerId: string;
  roles: Array<{
    roleId: string;
    name: string;
    points: number;
    span: number;
    bonusPoints?: number;
  }>;
  totalPoints: number;
};
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
- role span
- role conditions
- points
- duplicate bonus config

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
- MVPでは `ruleConfig.id = 'base-donjara'` のみ有効
- 拡張ルールはexperimental扱い
