import type { AnalyzerWarning, WildcardAssignment } from './candidate';
import type { CandidateGroup } from './group';
import type { PlayerId, RoleId, ScoreBonusId } from './ids';

export type WinMethod = 'tsumo' | 'ron';

export type AppliedSpecialBonus = {
  bonusId: RoleId;
  name: string;
  points: number;
  explanation: string;
};

export type AppliedScoreBonus = {
  bonusId: ScoreBonusId;
  name: string;
  points: number;
  matchedCount: number;
  cappedByMaxPoints: boolean;
  description?: string;
};

// 信頼できる得点内訳。隠しスコア修正は存在しない。
export type ResultBreakdown = {
  winnerPlayerId: PlayerId;
  winMethod: WinMethod;
  selectedWinRoleId: RoleId;
  selectedWinRoleName: string;
  basePoints: number;
  groups: CandidateGroup[];
  wildcardAssignments: WildcardAssignment[];
  appliedSpecialBonuses: AppliedSpecialBonus[];
  appliedScoreBonuses: AppliedScoreBonus[];
  alternativeWinRoleIds: RoleId[];
  totalPoints: number;
  warnings: AnalyzerWarning[];
};
