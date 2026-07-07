import type { CategoryId, RoleId, ScoreBonusId, TileId } from './ids';
import type { GroupRequirement } from './group';

// データのみの条件文法。ユーザー入力からのカスタムJSコードは存在しない。
export type RoleCondition =
  | { type: 'allOf'; conditions: RoleCondition[] }
  | { type: 'anyOf'; conditions: RoleCondition[] }
  | { type: 'countByCategory'; categoryId: CategoryId; minCount: number }
  | { type: 'countByTag'; tag: string; minCount: number }
  | { type: 'countByTileId'; tileId: TileId; minCount: number }
  | { type: 'specificTileSet'; tileIds: TileId[]; allowExtra?: boolean }
  | { type: 'distinctCategories'; minCount: number }
  | { type: 'distinctTileNames'; minCount: number }
  | { type: 'duplicateTile'; minCount: number }
  | { type: 'sameCategorySet'; setSize: number }
  | { type: 'sameTagSet'; tag: string; setSize: number };

export type WinRoleFamily =
  | 'groupPattern'
  | 'categoryMajority'
  | 'specificCollection'
  | 'allDifferent'
  | 'allSameCategory'
  | 'customTemplate';

export type WinRole = {
  id: RoleId;
  name: string;
  kind: 'win_role';
  family: WinRoleFamily;
  basePoints: number;
  requiredGroups: GroupRequirement[];
  wholeHandCondition?: RoleCondition;
  allowWildcard: boolean;
  maxWildcards: number;
  priority: number;
  explanation: string;
  canTsumo: boolean;
  canRon: boolean;
};

export type SpecialBonus = {
  id: RoleId;
  name: string;
  kind: 'special_bonus';
  points: number;
  condition: RoleCondition;
  allowWildcard: boolean;
  maxWildcards: number;
  explanation: string;
};

export type ScoreBonusType = 'duplicate_tile' | 'duplicate_name' | 'duplicate_category';

// ScoreBonus は Role.kind には入れない。単体ではあがれない。
export type ScoreBonus = {
  id: ScoreBonusId;
  name: string;
  type: ScoreBonusType;
  minCount: number;
  points: number;
  maxPoints?: number;
  description?: string;
  allowWildcard?: boolean;
  condition?: RoleCondition;
};
