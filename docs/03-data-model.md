# Data Model

## Design Principles

- 3〜4人戦を前提にする
- 2人専用構造にしない
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

## Role

```ts
type Role = {
  id: string;
  name: string;
  points: number;
  condition: RoleCondition;
  description?: string;
};
```

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
  isWinner?: boolean;
};
```

## MatchState

```ts
type MatchPhase = 'draw' | 'discard' | 'result';

type MatchState = {
  deckId: string;
  players: PlayerState[];
  drawPile: TileInstance[];
  currentPlayerIndex: number;
  phase: MatchPhase;
  lastDrawnTile?: TileInstance;
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
  }>;
  totalPoints: number;
};
```

## Shared JSON Rule

共有JSONに含めてよいもの。

- deck id
- deck name
- tile definitions
- categories
- emoji
- fallbackLabel
- counts
- roles
- role conditions
- points

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
