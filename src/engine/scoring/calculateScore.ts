import type { AnalyzerWarning, HandCandidate } from '../../domain/candidate';
import type { DeckProject } from '../../domain/deck';
import type { PlayerId } from '../../domain/ids';
import type { EngineError } from '../../domain/match';
import type { ScoreBonus, WinRoleFamily } from '../../domain/role';
import type {
  AppliedScoreBonus,
  AppliedSpecialBonus,
  ResultBreakdown,
  WinMethod,
} from '../../domain/score';
import type { TileInstance } from '../../domain/tile';
import type { DeckVariant } from '../../domain/variant';
import { analyzeHandDetailed } from '../analysis/analyzeHand';
import { evaluateRoleCondition } from '../roles/evaluateRoleCondition';
import { buildDeckIndex, tileDefOf, type DeckIndex } from '../tiles/deckIndex';

export type CalculateScoreInput = {
  deck: DeckProject;
  variant: DeckVariant;
  /** あがり形の9枚(ronは8枚手牌+捨て牌) */
  handTiles: TileInstance[];
  winMethod: WinMethod;
  winnerPlayerId: PlayerId;
  ronTileInstanceId?: string;
};

export type CalculateScoreResult =
  | { ok: true; breakdown: ResultBreakdown }
  | { ok: false; error: EngineError };

// docs/62 §5: groupPattern first, specificCollection second, categoryMajority third
const FAMILY_PRIORITY: Record<WinRoleFamily, number> = {
  groupPattern: 0,
  specificCollection: 1,
  categoryMajority: 2,
  allDifferent: 3,
  allSameCategory: 4,
  customTemplate: 5,
};

// MVPの得点は加算のみ。隠し修正・倍率・クランプはない。
// totalPoints = selectedWinRole.basePoints + specialBonuses + scoreBonuses
export function calculateScore(input: CalculateScoreInput): CalculateScoreResult {
  const { deck, variant, handTiles, winMethod, winnerPlayerId } = input;
  const index = buildDeckIndex(deck);

  const context = winMethod === 'tsumo' ? 'afterDrawNineTiles' : 'ronCheckNineTiles';
  const { result } = analyzeHandDetailed({
    deck,
    variant,
    handTiles,
    context,
    ...(input.ronTileInstanceId !== undefined
      ? { ronTileInstanceId: input.ronTileInstanceId }
      : {}),
  });

  const completedWinCandidates = result.candidates.filter(
    (c) => c.roleKind === 'win_role' && c.state === 'completed',
  );
  const winnable = completedWinCandidates.filter((c) =>
    winMethod === 'tsumo' ? c.canTsumo : c.canRon,
  );

  if (winnable.length === 0) {
    const blocked = result.candidates.find(
      (c) =>
        c.roleKind === 'win_role' &&
        (c.state === 'completed' || c.state === 'invalidButExplainable') &&
        c.blockedReasons.length > 0,
    );
    if (blocked) {
      const reason = blocked.blockedReasons[0]!;
      return {
        ok: false,
        error: {
          code: winMethod === 'tsumo' ? 'E7003' : 'E7004',
          message: reason.message,
        },
      };
    }
    return {
      ok: false,
      error: {
        code: 'E7007',
        message: 'あがれる役がないため得点を計算できません。',
      },
    };
  }

  const selected = selectWinRole(winnable, variant);
  const role = variant.winRoles.find((r) => r.id === selected.winRoleId)!;

  // ボーナスはselectedWinRoleが存在して初めて加点される
  const appliedSpecialBonuses: AppliedSpecialBonus[] = [];
  for (const bonus of variant.specialBonuses) {
    const budget =
      bonus.allowWildcard && variant.ruleConfig.allowWildcard ? bonus.maxWildcards : 0;
    const evaluation = evaluateRoleCondition({
      condition: bonus.condition,
      handTiles,
      index,
      wildcardBudget: budget,
      purpose: 'specialBonus',
    });
    if (evaluation.ok) {
      appliedSpecialBonuses.push({
        bonusId: bonus.id,
        name: bonus.name,
        points: bonus.points,
        explanation: bonus.explanation,
      });
    }
  }

  const appliedScoreBonuses: AppliedScoreBonus[] = variant.ruleConfig.allowScoreBonus
    ? variant.scoreBonuses.flatMap((bonus) => applyScoreBonus(bonus, handTiles, index))
    : [];

  const specialTotal = appliedSpecialBonuses.reduce((sum, b) => sum + b.points, 0);
  const scoreBonusTotal = appliedScoreBonuses.reduce((sum, b) => sum + b.points, 0);
  const totalPoints = role.basePoints + specialTotal + scoreBonusTotal;

  const warnings: AnalyzerWarning[] = [...result.analyzerWarnings];
  if (totalPoints > variant.scoreBudget.hardResultCap) {
    warnings.push({
      code: 'B6005',
      message: `得点${totalPoints}がhardResultCap ${variant.scoreBudget.hardResultCap}を超えています。`,
    });
  } else if (totalPoints > variant.scoreBudget.softResultCap) {
    warnings.push({
      code: 'B6004',
      message: `得点${totalPoints}がsoftResultCap ${variant.scoreBudget.softResultCap}を超えています。`,
    });
  }

  return {
    ok: true,
    breakdown: {
      winnerPlayerId,
      winMethod,
      selectedWinRoleId: role.id,
      selectedWinRoleName: role.name,
      basePoints: role.basePoints,
      groups: selected.groups,
      wildcardAssignments: selected.wildcardAssignments,
      appliedSpecialBonuses,
      appliedScoreBonuses,
      alternativeWinRoleIds: winnable
        .filter((c) => c.candidateId !== selected.candidateId)
        .map((c) => c.winRoleId!)
        .filter((id): id is string => id !== undefined),
      totalPoints,
      warnings,
    },
  };
}

// selectedWinRoleのtie-break(docs/62 §13 / docs/70 §13):
// 1. 高いbasePoints 2. 少ないwildcard 3. 自然なグループが多い
// 4. family優先度 5. 低いrole.priority 6. deck順
function selectWinRole(winnable: HandCandidate[], variant: DeckVariant): HandCandidate {
  const deckOrder = new Map(variant.winRoles.map((r, i) => [r.id, i]));
  const roleOf = (c: HandCandidate) => variant.winRoles.find((r) => r.id === c.winRoleId)!;
  const sorted = [...winnable].sort((a, b) => {
    if (a.basePoints !== b.basePoints) {
      return b.basePoints - a.basePoints;
    }
    if (a.wildcardAssignments.length !== b.wildcardAssignments.length) {
      return a.wildcardAssignments.length - b.wildcardAssignments.length;
    }
    const naturalA = a.groups.filter((g) => g.wildcardAssignmentIds.length === 0).length;
    const naturalB = b.groups.filter((g) => g.wildcardAssignmentIds.length === 0).length;
    if (naturalA !== naturalB) {
      return naturalB - naturalA;
    }
    const familyA = FAMILY_PRIORITY[roleOf(a).family];
    const familyB = FAMILY_PRIORITY[roleOf(b).family];
    if (familyA !== familyB) {
      return familyA - familyB;
    }
    if (roleOf(a).priority !== roleOf(b).priority) {
      return roleOf(a).priority - roleOf(b).priority;
    }
    return (deckOrder.get(a.winRoleId ?? '') ?? 0) - (deckOrder.get(b.winRoleId ?? '') ?? 0);
  });
  return sorted[0]!;
}

// ScoreBonusは機械的な加点。wildcardはcountsForScoreBonus&&allowWildcardの場合のみ数える。
function applyScoreBonus(
  bonus: ScoreBonus,
  handTiles: TileInstance[],
  index: DeckIndex,
): AppliedScoreBonus[] {
  const countable = handTiles.filter((t) => {
    const behavior = tileDefOf(index, t).wildcard;
    if (!behavior) {
      return true;
    }
    return bonus.allowWildcard === true && behavior.countsForScoreBonus;
  });

  if (bonus.condition) {
    const evaluation = evaluateRoleCondition({
      condition: bonus.condition,
      handTiles,
      index,
      wildcardBudget: 0,
      purpose: 'specialBonus',
    });
    if (!evaluation.ok) {
      return [];
    }
  }

  const counts = new Map<string, number>();
  for (const t of countable) {
    const def = tileDefOf(index, t);
    switch (bonus.type) {
      case 'duplicate_tile':
        counts.set(t.tileId, (counts.get(t.tileId) ?? 0) + 1);
        break;
      case 'duplicate_name':
        counts.set(def.name, (counts.get(def.name) ?? 0) + 1);
        break;
      case 'duplicate_category':
        for (const categoryId of def.categories) {
          counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
        }
        break;
    }
  }

  const matchedCount = [...counts.values()].filter((count) => count >= bonus.minCount).length;
  if (matchedCount === 0) {
    return [];
  }
  const rawPoints = bonus.points * matchedCount;
  const cappedByMaxPoints = bonus.maxPoints !== undefined && rawPoints > bonus.maxPoints;
  const points = cappedByMaxPoints ? bonus.maxPoints! : rawPoints;
  return [
    {
      bonusId: bonus.id,
      name: bonus.name,
      points,
      matchedCount,
      cappedByMaxPoints,
      ...(bonus.description !== undefined ? { description: bonus.description } : {}),
    },
  ];
}
