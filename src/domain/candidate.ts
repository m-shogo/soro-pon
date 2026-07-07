import type { CandidateGroup, GroupRequirement } from './group';
import type { CategoryId, RoleId, TileId, TileInstanceId } from './ids';

export type CandidateState =
  | 'completed'
  | 'tenpai'
  | 'near'
  | 'bonusOnly'
  | 'invalidButExplainable';

export type WildcardAssignment = {
  id: string;
  wildcardTileInstanceId: TileInstanceId;
  usedAsTileId?: TileId;
  usedAsCategoryId?: CategoryId;
  usedAsTag?: string;
  groupId?: string;
  source: 'auto';
};

export type MissingRequirement = {
  requirementIndex: number;
  requirement: GroupRequirement;
  missingGroupCount: number;
  missingTileCount: number;
  message: string;
};

export type ExplainReason = {
  code: string;
  message: string;
};

export type BlockedReason = {
  code: string;
  message: string;
};

export type HandCandidate = {
  candidateId: string;
  state: CandidateState;
  winRoleId?: RoleId;
  roleKind?: 'win_role' | 'special_bonus' | 'score_bonus';
  groups: CandidateGroup[];
  usedTileInstanceIds: TileInstanceId[];
  missingRequirements: MissingRequirement[];
  wildcardAssignments: WildcardAssignment[];
  basePoints: number;
  bonusPoints: number;
  totalEstimate: number;
  canRon: boolean;
  canTsumo: boolean;
  rankScore: number;
  explainReasons: ExplainReason[];
  blockedReasons: BlockedReason[];
};

export type AnalyzerWarning = {
  code: string;
  message: string;
  capped?: boolean;
};

export type AnalyzeHandResult = {
  candidates: HandCandidate[];
  primaryCandidates: HandCandidate[];
  hiddenCandidateCount: number;
  analyzerWarnings: AnalyzerWarning[];
};

export type WaitContext = 'afterDrawNineTiles' | 'afterDiscardEightTiles' | 'ronCheckNineTiles';

export type WaitAnalysis = {
  context: WaitContext;
  candidateId: string;
  winRoleId?: RoleId;
  incompleteGroupIndex?: number;
  kind: 'tile' | 'category' | 'tag' | 'specificTile';
  tileIds?: TileId[];
  categoryId?: CategoryId;
  tag?: string;
  wildcardCanFill: boolean;
  message: string;
};

export type DiscardImpactResult = {
  tileInstanceId: TileInstanceId;
  breaksCandidateIds: string[];
  keepsCandidateIds: string[];
  removesUnusedTile: boolean;
  resultingWaits: WaitAnalysis[];
  facts: ExplainReason[];
};

// factのみを伝える。best move / correct discard / you should は禁止。
export type BoardInsightKind =
  | 'canWin'
  | 'oneTileAway'
  | 'incompleteGroup'
  | 'discardBreaksCandidate'
  | 'discardKeepsWait'
  | 'wildcardUsedAs'
  | 'bonusOnlyCannotWin'
  | 'actionBlocked'
  | 'analysisCapped';

export type BoardInsight = {
  kind: BoardInsightKind;
  priority: number;
  message: string;
  relatedCandidateId?: string;
  relatedTileInstanceIds?: TileInstanceId[];
};

export type InsightDisplayMode = 'beginner' | 'normal' | 'advanced';
