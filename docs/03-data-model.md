# Data Model

## Purpose

`soro-pon` のMVP実装で使う主要データ型を固定する。

このファイルは、TypeScript実装・Zod schema・JSON import/export・localStorage・テストの基準になる。

## Design Principles

- 3〜4人戦を前提にする
- 2人専用構造にしない
- 標準ルールはドンジャラ互換にする
- 通常版/拡張版は1つのDeckProject内のvariantとして扱う
- 牌はカテゴリを複数持てる
- カテゴリごとに色を持てる
- 牌の見た目は画像なしでも成立する
- オールマイティ牌を定義できる
- 画像は共有JSONに含めない
- ルールエンジンはUIから分離する
- Zodでimport/export schemaを検証する
- あがり判定用の役と、加点用の特殊役/ボーナスを分ける
- Result後のprogressionを将来拡張できるようにする

## Primitive IDs

実装上はすべて `string` でよいが、意味を分けて扱う。

```ts
type DeckProjectId = string;
type DeckVariantId = string;
type TileId = string;
type TileInstanceId = string;
type CategoryId = string;
type RoleId = string;
type PlayerId = string;
```

## DeckProject

デッキ入口は1つ。

通常版と拡張版は別デッキではなく、同じDeckProject内のvariantとして扱う。

```ts
type DeckProject = {
  version: 1;
  id: DeckProjectId;
  name: string;
  description?: string;
  categories: TileCategory[];
  tiles: Tile[];
  variants: DeckVariant[];
  activeVariantId: DeckVariantId;
  createdAt?: string;
  updatedAt?: string;
};
```

## DeckVariant

```ts
type DeckVariant = {
  id: DeckVariantId;
  name: string;
  label: '通常版' | '拡張版';
  ruleConfig: RuleConfig;
  roles: Role[];
  scoreBonuses?: ScoreBonus[];
  isExperimental?: boolean;
};
```

## TileCategory

カテゴリは色を持つ。

```ts
type TileCategory = {
  id: CategoryId;
  name: string;
  color: string;
  priority?: number;
  icon?: string;
  description?: string;
};
```

表示色の優先順位:

```text
1. tile.primaryCategoryId
2. category.priority が高いもの
3. tile.categories の先頭
4. wildcardは専用色を優先してよい
```

## Tile

```ts
type Tile = {
  id: TileId;
  name: string;
  categories: CategoryId[];
  primaryCategoryId?: CategoryId;
  emoji?: string;
  fallbackLabel?: string;
  count: number;
  wildcard?: WildcardRule;
};
```

### Notes

- `categories` は複数可
- `primaryCategoryId` は牌の外枠/帯の色に使う
- `emoji` は画像がない場合の表示
- `fallbackLabel` は絵文字も画像もない場合の短い表示
- `count` は山に入れる枚数
- `wildcard` がある牌はオールマイティ牌として扱える

## WildcardRule

```ts
type WildcardRule = {
  kind: 'any_tile' | 'category_limited' | 'specific_tiles';
  categories?: CategoryId[];
  tileIds?: TileId[];
  maxUsePerRole?: number;
  canCompleteWinRole: boolean;
  canCompleteSpecialBonus: boolean;
  canTriggerRonWhenDiscarded: boolean;
  countsForScoreBonus: boolean;
};
```

推奨デフォルト:

```ts
const DEFAULT_WILDCARD_RULE: WildcardRule = {
  kind: 'any_tile',
  maxUsePerRole: 1,
  canCompleteWinRole: true,
  canCompleteSpecialBonus: true,
  canTriggerRonWhenDiscarded: false,
  countsForScoreBonus: false,
};
```

## TileInstance

山・手牌・捨て牌では、定義としてのTileではなくインスタンスを使う。

```ts
type TileInstance = {
  instanceId: TileInstanceId;
  tileId: TileId;
};
```

## LocalTileOverride

画像や表示名の上書きはローカル専用。

```ts
type LocalTileOverride = {
  tileId: TileId;
  displayName?: string;
  localImageId?: string;
  emoji?: string;
};
```

これは共有JSONに含めない。

## RuleConfig

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
  allowWildcard: boolean;
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
  roleSpanMax: 9,
  allowRon: true,
  allowPon: false,
  allowReach: false,
  allowScoreBonus: true,
  allowWildcard: true,
  allowKan: false,
  allowChi: false,
};
```

拡張ルール:

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
  allowWildcard: true,
  allowKan: false,
  allowChi: false,
};
```

## RoleKind

```ts
type RoleKind = 'win_role' | 'special_bonus' | 'score_bonus';
```

- `win_role`: あがり判定に使う。ツモ/ロン対象
- `special_bonus`: 上がった後に加点。ツモ/ロン対象外
- `score_bonus`: 上がった後に加点。ツモ/ロン対象外

## Role Match Policy

```ts
type RoleMatchMode = 'contains_pattern' | 'exact_hand';
type RoleCoveragePolicy = 'allow_extra_tiles' | 'must_cover_full_hand';
```

- `contains_pattern`: 手札内に条件が含まれれば成立
- `exact_hand`: 手札全体が条件を満たす場合だけ成立
- `allow_extra_tiles`: 余り牌を許可する
- `must_cover_full_hand`: 手札全体を役条件で覆う

13枚役:

```ts
{
  span: 13,
  matchMode: 'contains_pattern',
  coveragePolicy: 'allow_extra_tiles'
}
```

14枚役:

```ts
{
  span: 14,
  matchMode: 'exact_hand',
  coveragePolicy: 'must_cover_full_hand'
}
```

## Role

```ts
type Role = {
  id: RoleId;
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
  matchMode?: RoleMatchMode;
  coveragePolicy?: RoleCoveragePolicy;
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

## RoleCondition

```ts
type RoleCondition =
  | { type: 'contains_all'; tileIds: TileId[] }
  | { type: 'same_tile_count'; count: number }
  | { type: 'same_name_count'; name: string; count: number }
  | { type: 'same_category_count'; category: CategoryId; count: number }
  | { type: 'all_different_categories'; count: number }
  | { type: 'exact_group'; tileIds: TileId[] }
  | { type: 'choose_n_from'; tileIds: TileId[]; choose: number };
```

## ScoreBonus

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

## WildcardAssignment

```ts
type WildcardAssignment = {
  wildcardTileInstanceId: TileInstanceId;
  usedAsTileId?: TileId;
  usedAsCategory?: CategoryId;
  roleId: RoleId;
  source: 'auto' | 'manual';
};
```

MVPでは `source: 'auto'` のみでよい。

## PlayerState

```ts
type PlayerState = {
  id: PlayerId;
  name: string;
  type: 'human' | 'cpu';
  hand: TileInstance[];
  discards: TileInstance[];
  score: number;
  isReach?: boolean;
  isWinner?: boolean;
};
```

## MatchState

```ts
type MatchPhase = 'setup' | 'draw' | 'discard' | 'reaction' | 'result';

type ReactionState = {
  discardOwnerId: PlayerId;
  discardedTile: TileInstance;
  candidatePlayerId?: PlayerId;
  type: 'ron';
};

type MatchState = {
  deckProjectId: DeckProjectId;
  variantId: DeckVariantId;
  ruleConfigId: string;
  players: PlayerState[];
  drawPile: TileInstance[];
  currentPlayerIndex: number;
  phase: MatchPhase;
  lastDrawnTile?: TileInstance;
  lastDiscard?: {
    tile: TileInstance;
    ownerPlayerId: PlayerId;
  };
  reaction?: ReactionState;
  selectedTileInstanceId?: TileInstanceId;
  result?: MatchResult;
};
```

## MatchResult

```ts
type WinMethod = 'tsumo' | 'ron' | 'draw';

type PaymentRecord = {
  fromPlayerId?: PlayerId;
  toPlayerId: PlayerId;
  points: number;
  reason: 'win' | 'tsumo' | 'ron' | 'bonus' | 'system';
};

type EvaluatedRoleSummary = {
  roleId: RoleId;
  name: string;
  points: number;
  span: number;
};

type MatchResult = {
  resultType: 'win' | 'draw';
  winnerPlayerId?: PlayerId;
  winMethod: WinMethod;
  sourcePlayerId?: PlayerId;
  selectedWinRole?: EvaluatedRoleSummary;
  matchedWinRoles: Array<EvaluatedRoleSummary & { selected: boolean }>;
  specialBonuses: EvaluatedRoleSummary[];
  scoreBonuses: Array<{
    bonusId: string;
    name: string;
    points: number;
  }>;
  wildcardAssignments: WildcardAssignment[];
  totalPoints: number;
  earnedCoins: number;
  paymentRecords: PaymentRecord[];
};
```

## Progression

```ts
type PlayerProgress = {
  version: 1;
  coins: number;
  unlockedTitleIds: string[];
  selectedTitleId?: string;
  unlockedCosmeticIds: string[];
  achievementStates: AchievementState[];
  roleCollection: RoleCollectionEntry[];
  resultAlbum: ResultAlbumEntry[];
};

type AchievementState = {
  achievementId: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
};

type RoleCollectionEntry = {
  roleId: RoleId;
  roleName: string;
  kind: RoleKind;
  deckProjectId: DeckProjectId;
  variantId: DeckVariantId;
  firstAchievedAt: string;
  bestPoints: number;
  usedWildcard: boolean;
};

type ResultAlbumEntry = {
  id: string;
  createdAt: string;
  deckProjectId: DeckProjectId;
  variantId: DeckVariantId;
  totalPoints: number;
  selectedWinRoleName?: string;
  specialBonusNames: string[];
  scoreBonusNames: string[];
};
```

## ValidationIssue

```ts
type ValidationIssue = {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  path?: string;
  relatedId?: string;
  actionLabel?: string;
};
```

## Scoring Flow

```text
1. win_role であがり判定
2. オールマイティが必要なら自動割当
3. 複数win_role成立時は points desc, span desc, definition order asc
4. selectedWinRoleを1つ採用
5. あがり成立後にspecial_bonusを判定
6. score_bonusを計算
7. wildcardAssignmentsを記録
8. totalPointsを出す
9. earnedCoinsを出す
10. MatchResultを保存する
```

## Shared JSON Rule

共有JSONに含めてよいもの。

- deck id
- deck name
- description
- category definitions
- category colors
- ruleConfig
- tile definitions
- wildcard rule
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
- external asset URL

## Final Decision

このデータモデルをMVP実装の正とする。

実装時に型を変更したい場合は、先にこのファイルとZod schema仕様を更新する。
