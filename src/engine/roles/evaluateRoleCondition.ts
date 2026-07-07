import type { RoleCondition } from '../../domain/role';
import type { TileInstance } from '../../domain/tile';
import { tileDefOf, type DeckIndex } from '../tiles/deckIndex';
import type { WildcardPurpose } from '../wildcards/resolveWildcards';

export type EvaluateConditionInput = {
  condition: RoleCondition;
  handTiles: TileInstance[];
  index: DeckIndex;
  /** この条件評価で使ってよいwildcard枚数(role/bonusのmaxWildcardsと所持数から決める) */
  wildcardBudget: number;
  purpose: WildcardPurpose;
};

export type ConditionEvaluation = {
  ok: boolean;
  wildcardsUsed: number;
};

function eligibleWildcardCount(input: EvaluateConditionInput): number {
  let count = 0;
  for (const instance of input.handTiles) {
    const behavior = tileDefOf(input.index, instance).wildcard;
    if (!behavior) {
      continue;
    }
    const usable =
      input.purpose === 'winRole'
        ? behavior.canCompleteWinRole
        : behavior.canCompleteSpecialBonus;
    if (usable) {
      count += 1;
    }
  }
  return count;
}

function naturalTiles(input: EvaluateConditionInput): TileInstance[] {
  return input.handTiles.filter(
    (instance) => tileDefOf(input.index, instance).wildcard === undefined,
  );
}

// countにwildcardを補填して満たせるかを判定する共通ロジック
function withBudget(
  naturalCount: number,
  minCount: number,
  budget: number,
): ConditionEvaluation {
  if (naturalCount >= minCount) {
    return { ok: true, wildcardsUsed: 0 };
  }
  const missing = minCount - naturalCount;
  if (missing <= budget) {
    return { ok: true, wildcardsUsed: missing };
  }
  return { ok: false, wildcardsUsed: 0 };
}

// データのみのRoleConditionを手牌に対して評価する。
// wholeHandCondition(win_role)とspecialBonus/ScoreBonusのcondition評価に使う。
export function evaluateRoleCondition(input: EvaluateConditionInput): ConditionEvaluation {
  const budget = Math.min(input.wildcardBudget, eligibleWildcardCount(input));
  return evaluate(input, input.condition, budget);
}

function evaluate(
  input: EvaluateConditionInput,
  condition: RoleCondition,
  budget: number,
): ConditionEvaluation {
  const naturals = naturalTiles(input);
  switch (condition.type) {
    case 'allOf': {
      let used = 0;
      for (const child of condition.conditions) {
        const result = evaluate(input, child, budget - used);
        if (!result.ok) {
          return { ok: false, wildcardsUsed: 0 };
        }
        used += result.wildcardsUsed;
      }
      return { ok: true, wildcardsUsed: used };
    }
    case 'anyOf': {
      let best: ConditionEvaluation | null = null;
      for (const child of condition.conditions) {
        const result = evaluate(input, child, budget);
        if (result.ok && (best === null || result.wildcardsUsed < best.wildcardsUsed)) {
          best = result;
        }
      }
      return best ?? { ok: false, wildcardsUsed: 0 };
    }
    case 'countByCategory': {
      const count = naturals.filter((t) =>
        tileDefOf(input.index, t).categories.includes(condition.categoryId),
      ).length;
      return withBudget(count, condition.minCount, budget);
    }
    case 'countByTag': {
      const count = naturals.filter((t) =>
        (tileDefOf(input.index, t).tags ?? []).includes(condition.tag),
      ).length;
      return withBudget(count, condition.minCount, budget);
    }
    case 'countByTileId': {
      const count = naturals.filter((t) => t.tileId === condition.tileId).length;
      return withBudget(count, condition.minCount, budget);
    }
    case 'specificTileSet': {
      const rest = [...condition.tileIds];
      for (const t of naturals) {
        const at = rest.indexOf(t.tileId);
        if (at !== -1) {
          rest.splice(at, 1);
        }
      }
      if (condition.allowExtra === false) {
        // 手牌がセット以外を含まないこと(wildcardは除く)
        const setIds = new Set(condition.tileIds);
        if (naturals.some((t) => !setIds.has(t.tileId))) {
          return { ok: false, wildcardsUsed: 0 };
        }
      }
      return withBudget(condition.tileIds.length - rest.length, condition.tileIds.length, budget);
    }
    case 'distinctCategories': {
      // primaryCategoryIdの種類数で数える(説明可能性優先)
      const distinct = new Set(
        naturals.map((t) => tileDefOf(input.index, t).primaryCategoryId),
      );
      return withBudget(distinct.size, condition.minCount, budget);
    }
    case 'distinctTileNames': {
      const distinct = new Set(naturals.map((t) => tileDefOf(input.index, t).name));
      return withBudget(distinct.size, condition.minCount, budget);
    }
    case 'duplicateTile': {
      const counts = new Map<string, number>();
      for (const t of naturals) {
        counts.set(t.tileId, (counts.get(t.tileId) ?? 0) + 1);
      }
      const max = Math.max(0, ...counts.values());
      if (max === 0) {
        return { ok: false, wildcardsUsed: 0 };
      }
      return withBudget(max, condition.minCount, budget);
    }
    case 'sameCategorySet': {
      const counts = new Map<string, number>();
      for (const t of naturals) {
        for (const categoryId of tileDefOf(input.index, t).categories) {
          counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
        }
      }
      const max = Math.max(0, ...counts.values());
      if (max === 0) {
        return { ok: false, wildcardsUsed: 0 };
      }
      return withBudget(max, condition.setSize, budget);
    }
    case 'sameTagSet': {
      const count = naturals.filter((t) =>
        (tileDefOf(input.index, t).tags ?? []).includes(condition.tag),
      ).length;
      return withBudget(count, condition.setSize, budget);
    }
  }
}
