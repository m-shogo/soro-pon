import type { CategoryId, PlayerId, TileId, TileInstanceId } from './ids';

export type WildcardBehavior = {
  kind: 'any_tile';
  maxUsePerRole: number;
  canCompleteWinRole: boolean;
  canCompleteSpecialBonus: boolean;
  canTriggerRonWhenDiscarded: boolean;
  countsForScoreBonus: boolean;
};

export type TileDefinition = {
  id: TileId;
  name: string;
  categories: CategoryId[];
  primaryCategoryId: CategoryId;
  emoji?: string;
  fallbackLabel: string;
  count: number;
  tags?: string[];
  wildcard?: WildcardBehavior;
};

export type TileLocation = 'drawPile' | 'hand' | 'discard' | 'revealed' | 'removed';

export type TileInstance = {
  instanceId: TileInstanceId;
  tileId: TileId;
  ownerPlayerId?: PlayerId;
  location: TileLocation;
};
