import type { CategoryId, TileId, TileInstanceId } from './ids';

export type GroupType = 'sameTile' | 'sameCategory' | 'sameTag' | 'specificSet' | 'freeSet';

export type GroupRequirement = {
  groupType: GroupType;
  categoryId?: CategoryId;
  tag?: string;
  tileIds?: TileId[];
  count: number;
};

export type CandidateGroup = {
  groupId: string;
  groupType: GroupType;
  tileInstanceIds: TileInstanceId[];
  categoryId?: CategoryId;
  tag?: string;
  tileId?: TileId;
  specificTileIds?: TileId[];
  isComplete: boolean;
  wildcardAssignmentIds: string[];
};
