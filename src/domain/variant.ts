import type { VariantId } from './ids';
import type { ScoreBonus, SpecialBonus, WinRole } from './role';

export type EvaluationMode = 'normalThreeGroups' | 'extendedRoleSpan';

export type NormalRuleConfig = {
  id: string;
  name: string;
  evaluationMode: 'normalThreeGroups';
  supportedPlayerCounts: (3 | 4)[];
  handSizeNormal: 8;
  handSizeAfterDraw: 9;
  winHandSize: 9;
  groupSize: 3;
  groupCount: 3;
  allowRon: boolean;
  allowPon: false;
  allowKan: false;
  allowChi: false;
  allowReach: boolean;
  allowScoreBonus: boolean;
  allowWildcard: boolean;
};

export type ExtendedRuleConfig = {
  id: string;
  name: string;
  evaluationMode: 'extendedRoleSpan';
  supportedPlayerCounts: (3 | 4)[];
  handSizeNormal: 13;
  handSizeAfterDraw: 14;
  winHandSize: 14;
  roleSpanMin: number;
  roleSpanMax: number;
  allowRon: boolean;
  allowPon: false;
  allowKan: false;
  allowChi: false;
  allowReach: boolean;
  allowScoreBonus: boolean;
  allowWildcard: boolean;
};

export type RuleConfig = NormalRuleConfig | ExtendedRuleConfig;

// 検証とUX警告のためのbudget。隠しスコアクランプではない。
export type ScoreBudgetProfile = {
  expectedBaseMin: number;
  expectedBaseMax: number;
  expectedResultMin: number;
  expectedResultMax: number;
  softResultCap: number;
  hardResultCap: number;
  maxSpecialBonusTotal: number;
  maxScoreBonusTotal: number;
};

export type DeckVariant = {
  id: VariantId;
  name: string;
  label: '通常版' | '拡張版';
  isExperimental?: boolean;
  ruleConfig: RuleConfig;
  scoreBudget: ScoreBudgetProfile;
  winRoles: WinRole[];
  specialBonuses: SpecialBonus[];
  scoreBonuses: ScoreBonus[];
  engineStatus?: 'pending';
};
