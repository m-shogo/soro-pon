import type {
  AnalyzeHandResult,
  AnalyzerWarning,
  HandCandidate,
  WaitContext,
} from '../../domain/candidate';
import type { DeckProject } from '../../domain/deck';
import type { TileInstance } from '../../domain/tile';
import type { DeckVariant } from '../../domain/variant';
import { ENGINE_LIMITS } from '../engineLimits';
import { matchRole, type RoleMatchResult, type RoleWait } from '../roles/matchRole';
import { evaluateRoleCondition } from '../roles/evaluateRoleCondition';
import { buildDeckIndex, tileDefOf, type DeckIndex } from '../tiles/deckIndex';
import { explainCandidate } from './explainCandidate';
import { rankCandidates } from './rankCandidates';

export type AnalyzeHandInput = {
  deck: DeckProject;
  variant: DeckVariant;
  handTiles: TileInstance[];
  context: WaitContext;
  /** ronCheckNineTiles時: 手牌9枚のうち捨て牌だったinstanceId */
  ronTileInstanceId?: string;
};

// 内部用: 候補ごとの待ち情報(analyzeWaitsが利用)
export type AnalyzedCandidate = {
  candidate: HandCandidate;
  waits: RoleWait[];
};

export function analyzeHandDetailed(input: AnalyzeHandInput): {
  analyzed: AnalyzedCandidate[];
  result: AnalyzeHandResult;
} {
  const { deck, variant, handTiles, context } = input;
  const index = buildDeckIndex(deck);
  const warnings: AnalyzerWarning[] = [];
  const analyzed: AnalyzedCandidate[] = [];

  if (variant.winRoles.length > ENGINE_LIMITS.maxWinRolesPerVariantWarning) {
    warnings.push({
      code: 'P8003',
      message: `win_roleが${variant.winRoles.length}個あり、解析が重くなる可能性があります。`,
    });
  }

  const ruleAllowsWildcard = variant.ruleConfig.allowWildcard;

  // ronの場合、捨て牌がwildcardならデフォルトでロン不可
  const ronBlockedByWildcard = (() => {
    if (context !== 'ronCheckNineTiles' || !input.ronTileInstanceId) {
      return false;
    }
    const ronTile = handTiles.find((t) => t.instanceId === input.ronTileInstanceId);
    if (!ronTile) {
      return false;
    }
    const behavior = tileDefOf(index, ronTile).wildcard;
    return behavior !== undefined && !behavior.canTriggerRonWhenDiscarded;
  })();

  for (const role of variant.winRoles) {
    const match = matchRole({ role, handTiles, index, ruleAllowsWildcard });
    const built = buildCandidate(input, index, role.id, match, ronBlockedByWildcard);
    if (built) {
      analyzed.push(built);
    }
  }

  // 満たしているspecialBonusはbonusOnly候補として出す(単体ではあがれない)
  for (const bonus of variant.specialBonuses) {
    const budget = bonus.allowWildcard && ruleAllowsWildcard ? bonus.maxWildcards : 0;
    const evaluation = evaluateRoleCondition({
      condition: bonus.condition,
      handTiles,
      index,
      wildcardBudget: budget,
      purpose: 'specialBonus',
    });
    if (!evaluation.ok) {
      continue;
    }
    const candidate: HandCandidate = {
      candidateId: `${context}:bonus:${bonus.id}`,
      state: 'bonusOnly',
      winRoleId: bonus.id,
      roleKind: 'special_bonus',
      groups: [],
      usedTileInstanceIds: [],
      missingRequirements: [],
      wildcardAssignments: [],
      basePoints: 0,
      bonusPoints: bonus.points,
      totalEstimate: bonus.points,
      canRon: false,
      canTsumo: false,
      rankScore: 0,
      explainReasons: [],
      blockedReasons: [
        {
          code: 'E7003',
          message: `「${bonus.name}」はボーナスなので、これだけではあがれません。`,
        },
      ],
    };
    candidate.explainReasons = explainCandidate({ candidate, handTiles, index });
    analyzed.push({ candidate, waits: [] });
  }

  let candidates = analyzed.map((a) => a.candidate);
  if (candidates.length > ENGINE_LIMITS.maxCandidateOutput) {
    warnings.push({
      code: 'P8001',
      message: `候補が${candidates.length}件になったため${ENGINE_LIMITS.maxCandidateOutput}件に打ち切りました。`,
      capped: true,
    });
    candidates = rankCandidates(candidates).slice(0, ENGINE_LIMITS.maxCandidateOutput);
  } else {
    candidates = rankCandidates(candidates);
  }

  const primaryCandidates = candidates.slice(0, ENGINE_LIMITS.maxPrimaryCandidates);

  return {
    analyzed,
    result: {
      candidates,
      primaryCandidates,
      hiddenCandidateCount: candidates.length - primaryCandidates.length,
      analyzerWarnings: warnings,
    },
  };
}

// UI/CPUが使う公開API
export function analyzeHand(input: AnalyzeHandInput): AnalyzeHandResult {
  return analyzeHandDetailed(input).result;
}

function buildCandidate(
  input: AnalyzeHandInput,
  index: DeckIndex,
  roleId: string,
  match: RoleMatchResult,
  ronBlockedByWildcard: boolean,
): AnalyzedCandidate | null {
  const { variant, handTiles, context } = input;
  const role = variant.winRoles.find((r) => r.id === roleId);
  if (!role || match.kind === 'none') {
    return null;
  }

  const candidateId = `${context}:${roleId}`;
  const base: HandCandidate = {
    candidateId,
    state: 'near',
    winRoleId: roleId,
    roleKind: 'win_role',
    groups: [],
    usedTileInstanceIds: [],
    missingRequirements: [],
    wildcardAssignments: [],
    basePoints: 0,
    bonusPoints: 0,
    totalEstimate: 0,
    canRon: false,
    canTsumo: false,
    rankScore: 0,
    explainReasons: [],
    blockedReasons: [],
  };

  let waits: RoleWait[] = [];

  switch (match.kind) {
    case 'completed': {
      base.state = 'completed';
      base.groups = match.groups;
      base.wildcardAssignments = match.wildcardAssignments;
      base.usedTileInstanceIds = match.groups.flatMap((g) => g.tileInstanceIds);
      base.basePoints = role.basePoints;
      base.totalEstimate = role.basePoints;
      if (context === 'afterDrawNineTiles') {
        base.canTsumo = role.canTsumo;
        if (!role.canTsumo) {
          base.blockedReasons.push({
            code: 'E7003',
            message: `「${role.name}」はツモあがりできない役です。`,
          });
        }
      }
      if (context === 'ronCheckNineTiles') {
        if (ronBlockedByWildcard) {
          base.state = 'invalidButExplainable';
          base.blockedReasons.push({
            code: 'W5006',
            message: '捨てられたwildcardではロンできません。',
          });
        } else if (!role.canRon) {
          base.blockedReasons.push({
            code: 'E7004',
            message: `「${role.name}」はロンあがりできない役です。`,
          });
        } else {
          base.canRon = true;
        }
      }
      break;
    }
    case 'tenpai': {
      base.state = 'tenpai';
      base.groups = match.groups;
      base.wildcardAssignments = match.wildcardAssignments;
      base.usedTileInstanceIds = match.groups.flatMap((g) => g.tileInstanceIds);
      base.basePoints = 0;
      base.totalEstimate = role.basePoints;
      waits = match.waits;
      break;
    }
    case 'near': {
      base.state = 'near';
      base.groups = match.groups;
      base.wildcardAssignments = match.wildcardAssignments;
      base.usedTileInstanceIds = match.groups.flatMap((g) => g.tileInstanceIds);
      base.missingRequirements = match.missingRequirements;
      base.totalEstimate = 0;
      break;
    }
    case 'blocked': {
      base.state = 'invalidButExplainable';
      base.blockedReasons = [match.reason];
      break;
    }
  }

  base.explainReasons = explainCandidate({ candidate: base, role, handTiles, index });
  return { candidate: base, waits };
}
