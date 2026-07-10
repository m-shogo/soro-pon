import type { CategoryId, TileId } from '../../domain/ids';
import type { DeckProject } from '../../domain/deck';
import type { GroupRequirement } from '../../domain/group';
import type { RoleCondition, WinRole } from '../../domain/role';
import type { DeckVariant } from '../../domain/variant';
import type {
  DeckValidationResult,
  DeckValidationStatus,
  ValidationIssue,
} from '../../domain/validation';
import { ENGINE_LIMITS } from '../engineLimits';

export type ValidateDeckProjectInput = {
  deck: DeckProject;
};

type DeckIndex = {
  categoryIds: Set<CategoryId>;
  tileCopiesById: Map<TileId, number>;
  instancesByCategory: Map<CategoryId, number>;
  instancesByTag: Map<string, number>;
  totalInstances: number;
  wildcardInstances: number;
  wildcardCanCompleteWinRole: boolean;
  wildcardCategoryIds: Set<CategoryId>;
};

function buildIndex(deck: DeckProject): DeckIndex {
  const categoryIds = new Set(deck.categories.map((c) => c.id));
  const tileCopiesById = new Map<TileId, number>();
  const instancesByCategory = new Map<CategoryId, number>();
  const instancesByTag = new Map<string, number>();
  let totalInstances = 0;
  let wildcardInstances = 0;
  let wildcardCanCompleteWinRole = false;

  const categoryHasNonWildcard = new Map<CategoryId, boolean>();
  const categoryHasWildcard = new Map<CategoryId, boolean>();

  for (const tile of deck.tiles) {
    tileCopiesById.set(tile.id, (tileCopiesById.get(tile.id) ?? 0) + tile.count);
    totalInstances += tile.count;
    if (tile.wildcard) {
      wildcardInstances += tile.count;
      if (tile.wildcard.canCompleteWinRole) {
        wildcardCanCompleteWinRole = true;
      }
    }
    for (const categoryId of tile.categories) {
      if (tile.wildcard) {
        categoryHasWildcard.set(categoryId, true);
      } else {
        categoryHasNonWildcard.set(categoryId, true);
        instancesByCategory.set(
          categoryId,
          (instancesByCategory.get(categoryId) ?? 0) + tile.count,
        );
      }
    }
    for (const tag of tile.tags ?? []) {
      if (!tile.wildcard) {
        instancesByTag.set(tag, (instancesByTag.get(tag) ?? 0) + tile.count);
      }
    }
  }

  // wildcard牌しか属さないカテゴリはwildcardカテゴリ。通常役のカテゴリには使えない。
  const wildcardCategoryIds = new Set<CategoryId>();
  for (const categoryId of categoryIds) {
    if (categoryHasWildcard.get(categoryId) && !categoryHasNonWildcard.get(categoryId)) {
      wildcardCategoryIds.add(categoryId);
    }
  }

  return {
    categoryIds,
    tileCopiesById,
    instancesByCategory,
    instancesByTag,
    totalInstances,
    wildcardInstances,
    wildcardCanCompleteWinRole,
    wildcardCategoryIds,
  };
}

// 自然成立に必要な牌が「wildcardで置き換え可能な枚数」を差し引いて確保できるか。
function requirementFeasible(
  requirement: GroupRequirement,
  index: DeckIndex,
  wildcardAllowance: number,
): boolean {
  const needTiles = requirement.count * 3 - wildcardAllowance;
  switch (requirement.groupType) {
    case 'sameCategory': {
      const available = requirement.categoryId
        ? (index.instancesByCategory.get(requirement.categoryId) ?? 0)
        : 0;
      return available >= needTiles;
    }
    case 'sameTag': {
      const available = requirement.tag ? (index.instancesByTag.get(requirement.tag) ?? 0) : 0;
      return available >= needTiles;
    }
    case 'sameTile': {
      // floor(copies/3)の合計でsameTileグループを何組作れるか。
      // wildcard 1枚は「2枚+wildcard」の組を1組だけ許す。
      let fullGroups = 0;
      let hasPairForWildcard = false;
      for (const copies of index.tileCopiesById.values()) {
        fullGroups += Math.floor(copies / 3);
        if (copies % 3 >= 2) {
          hasPairForWildcard = true;
        }
      }
      if (fullGroups >= requirement.count) {
        return true;
      }
      return (
        wildcardAllowance > 0 && hasPairForWildcard && fullGroups >= requirement.count - 1
      );
    }
    case 'specificSet': {
      const tileIds = requirement.tileIds ?? [];
      // 同じtileIdがtileIds内で複数回指定された場合、その回数分だけ同時所持が必要。
      // (例: ['apple','apple','banana'] は apple 2枚 + banana 1枚を同時に要求する)
      const neededByTile = new Map<TileId, number>();
      for (const tileId of tileIds) {
        neededByTile.set(tileId, (neededByTile.get(tileId) ?? 0) + requirement.count);
      }
      let missing = 0;
      for (const [tileId, needed] of neededByTile) {
        const copies = index.tileCopiesById.get(tileId) ?? 0;
        if (copies < needed) {
          missing += needed - copies;
        }
      }
      return missing <= wildcardAllowance;
    }
    case 'freeSet': {
      return index.totalInstances >= needTiles;
    }
  }
}

function roleNaturallyFeasible(role: WinRole, index: DeckIndex): boolean {
  return role.requiredGroups.every((req) => requirementFeasible(req, index, 0));
}

function roleWildcardFeasible(role: WinRole, index: DeckIndex): boolean {
  if (!role.allowWildcard || role.maxWildcards < 1 || !index.wildcardCanCompleteWinRole) {
    return false;
  }
  if (index.wildcardInstances < 1) {
    return false;
  }
  // MVPはrole全体でwildcard最大1枚。どれか1つのrequirementに割り当てる。
  return role.requiredGroups.some((_, wildcardIndex) =>
    role.requiredGroups.every((req, i) =>
      requirementFeasible(req, index, i === wildcardIndex ? 1 : 0),
    ),
  );
}

function collectConditionRefs(
  condition: RoleCondition,
  refs: { categoryIds: CategoryId[]; tileIds: TileId[] },
): void {
  switch (condition.type) {
    case 'allOf':
    case 'anyOf':
      for (const child of condition.conditions) {
        collectConditionRefs(child, refs);
      }
      return;
    case 'countByCategory':
      refs.categoryIds.push(condition.categoryId);
      return;
    case 'countByTileId':
      refs.tileIds.push(condition.tileId);
      return;
    case 'specificTileSet':
      refs.tileIds.push(...condition.tileIds);
      return;
    default:
      return;
  }
}

function validateVariant(
  variant: DeckVariant,
  index: DeckIndex,
  issues: ValidationIssue[],
): void {
  const path = `$.variants.${variant.id}`;

  if (variant.winRoles.length === 0) {
    issues.push({
      code: 'V3001',
      severity: 'error',
      path,
      message: 'このvariantにはwin_roleがありません。あがれる役を最低1つ追加してください。',
      fixHint: '安全テンプレートから役を追加できます。',
    });
  } else if (variant.winRoles.length <= 2) {
    issues.push({
      code: 'V3005',
      severity: 'warning',
      path,
      message: `win_roleが${variant.winRoles.length}個しかありません。3個以上あると遊びやすくなります。`,
    });
  }

  if (variant.winRoles.length > ENGINE_LIMITS.maxWinRolesPerVariantWarning) {
    issues.push({
      code: 'P8003',
      severity: 'warning',
      path,
      message: `win_roleが${variant.winRoles.length}個あります。解析が重くなる可能性があります。`,
    });
  }

  // 配り切れる牌があるか。最小人数は不足でerror、他の宣言人数は不足でwarning。
  const counts = [...variant.ruleConfig.supportedPlayerCounts].sort((a, b) => a - b);
  for (const playerCount of counts) {
    const needed = playerCount * variant.ruleConfig.handSizeNormal + 1;
    if (index.totalInstances < needed) {
      issues.push({
        code: 'V3002',
        severity: playerCount === counts[0] ? 'error' : 'warning',
        path,
        message: `${playerCount}人戦には最低${needed}枚必要ですが、山が${index.totalInstances}枚しかありません。`,
        fixHint: '牌の種類か枚数を増やしてください。',
      });
    }
  }

  const roleSignatures = new Map<string, { role: WinRole; index: number }[]>();

  variant.winRoles.forEach((role, roleIndex) => {
    const rolePath = `${path}.winRoles[${roleIndex}]`;

    const groupSum = role.requiredGroups.reduce((sum, req) => sum + req.count, 0);
    if (variant.ruleConfig.evaluationMode === 'normalThreeGroups') {
      if (groupSum > variant.ruleConfig.groupCount) {
        issues.push({
          code: 'R4004',
          severity: 'error',
          path: rolePath,
          message: `requiredGroupsの合計${groupSum}がgroupCount ${variant.ruleConfig.groupCount}を超えています。`,
        });
      } else if (groupSum < variant.ruleConfig.groupCount) {
        // あがり形は3グループで全牌を使う。埋まらない役は判定不能なのでブロックする。
        issues.push({
          code: 'R4010',
          severity: 'error',
          path: rolePath,
          message: `「${role.name}」のrequiredGroups合計が${groupSum}グループ分しかありません。通常ルールは3グループちょうど必要です。`,
          fixHint: 'freeSetグループを足して3グループにしてください。',
        });
      }
    }

    // 参照チェック
    for (const req of role.requiredGroups) {
      if (req.categoryId !== undefined) {
        if (!index.categoryIds.has(req.categoryId)) {
          issues.push({
            code: 'R4002',
            severity: 'error',
            path: rolePath,
            message: `存在しないカテゴリ "${req.categoryId}" を参照しています。`,
          });
        } else if (index.wildcardCategoryIds.has(req.categoryId)) {
          issues.push({
            code: 'W5003',
            severity: 'error',
            path: rolePath,
            message: `wildcardカテゴリ "${req.categoryId}" は通常役のカテゴリに使えません。`,
          });
        }
      }
      for (const tileId of req.tileIds ?? []) {
        if (!index.tileCopiesById.has(tileId)) {
          issues.push({
            code: 'R4003',
            severity: 'error',
            path: rolePath,
            message: `存在しない牌 "${tileId}" を参照しています。`,
          });
        }
      }
    }
    if (role.wholeHandCondition) {
      const refs = { categoryIds: [] as CategoryId[], tileIds: [] as TileId[] };
      collectConditionRefs(role.wholeHandCondition, refs);
      for (const categoryId of refs.categoryIds) {
        if (!index.categoryIds.has(categoryId)) {
          issues.push({
            code: 'R4002',
            severity: 'error',
            path: rolePath,
            message: `wholeHandConditionが存在しないカテゴリ "${categoryId}" を参照しています。`,
          });
        }
      }
      for (const tileId of refs.tileIds) {
        if (!index.tileCopiesById.has(tileId)) {
          issues.push({
            code: 'R4003',
            severity: 'error',
            path: rolePath,
            message: `wholeHandConditionが存在しない牌 "${tileId}" を参照しています。`,
          });
        }
      }
    }

    // 実現可能性(参照が正しい場合のみ意味がある)
    const hasBrokenRef = issues.some(
      (issue) =>
        issue.path === rolePath && (issue.code === 'R4002' || issue.code === 'R4003'),
    );
    if (!hasBrokenRef) {
      const natural = roleNaturallyFeasible(role, index);
      if (!natural) {
        const withWildcard = roleWildcardFeasible(role, index);
        if (withWildcard) {
          issues.push({
            code: 'R4006',
            severity: 'warning',
            path: rolePath,
            message: `「${role.name}」はwildcardなしでは成立しません。`,
          });
        } else {
          issues.push({
            code: 'R4005',
            severity: 'error',
            path: rolePath,
            message: `「${role.name}」は牌の枚数から成立不可能です。`,
            fixHint: '必要カテゴリの牌を増やすか、条件をゆるめてください。',
          });
        }
      }
    }

    // 重複役検出
    const signature = JSON.stringify({
      groups: [...role.requiredGroups].sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b)),
      ),
      condition: role.wholeHandCondition ?? null,
    });
    const existing = roleSignatures.get(signature) ?? [];
    existing.push({ role, index: roleIndex });
    roleSignatures.set(signature, existing);

    // 説明の質
    if (role.explanation.length < 10) {
      issues.push({
        code: 'R4009',
        severity: 'warning',
        path: rolePath,
        message: `「${role.name}」の説明が短すぎます。どのグループが必要か書いてください。`,
      });
    }

    // 難易度と点数バランス
    const isHard = role.requiredGroups.some(
      (req) => req.groupType === 'specificSet' || req.groupType === 'sameTile',
    );
    const isEasy =
      !isHard &&
      role.requiredGroups.every(
        (req) =>
          req.groupType === 'freeSet' ||
          (req.groupType === 'sameCategory' &&
            (index.instancesByCategory.get(req.categoryId ?? '') ?? 0) >= 12),
      );
    if (isEasy && role.basePoints > variant.scoreBudget.expectedBaseMax) {
      issues.push({
        code: 'B6002',
        severity: 'warning',
        path: rolePath,
        message: `簡単な役「${role.name}」の点数${role.basePoints}が想定上限${variant.scoreBudget.expectedBaseMax}を超えています。`,
      });
    }
    if (isHard && role.basePoints < variant.scoreBudget.expectedBaseMin) {
      issues.push({
        code: 'B6003',
        severity: 'warning',
        path: rolePath,
        message: `難しい役「${role.name}」の点数${role.basePoints}が想定下限${variant.scoreBudget.expectedBaseMin}を下回っています。`,
      });
    }
  });

  for (const entries of roleSignatures.values()) {
    if (entries.length < 2) {
      continue;
    }
    const points = new Set(entries.map((entry) => entry.role.basePoints));
    const names = entries.map((entry) => `「${entry.role.name}」`).join(' ');
    if (points.size > 1) {
      issues.push({
        code: 'R4008',
        severity: 'warning',
        path,
        message: `${names} は同じ条件なのに点数が違います。`,
      });
    } else {
      issues.push({
        code: 'R4007',
        severity: 'warning',
        path,
        message: `${names} は条件が重複しています。`,
      });
    }
  }

  if (roleSignatures.size >= 1 && variant.winRoles.length - roleSignatures.size >= 2) {
    issues.push({
      code: 'V3006',
      severity: 'warning',
      path,
      message: '似た条件の役が多く、候補表示がうるさくなる可能性があります。',
    });
  }

  // ボーナス予算
  const specialTotal = variant.specialBonuses.reduce((sum, bonus) => sum + bonus.points, 0);
  if (specialTotal > variant.scoreBudget.maxSpecialBonusTotal) {
    issues.push({
      code: 'B6006',
      severity: 'warning',
      path,
      message: `special_bonus合計${specialTotal}が予算${variant.scoreBudget.maxSpecialBonusTotal}を超えています。`,
    });
  }
  const scoreBonusTotal = variant.scoreBonuses.reduce(
    (sum, bonus) => sum + (bonus.maxPoints ?? bonus.points * 3),
    0,
  );
  if (scoreBonusTotal > variant.scoreBudget.maxScoreBonusTotal) {
    issues.push({
      code: 'B6007',
      severity: 'warning',
      path,
      message: `ScoreBonusの最大合計${scoreBonusTotal}が予算${variant.scoreBudget.maxScoreBonusTotal}を超えています。`,
    });
  }
  for (const bonus of variant.scoreBonuses) {
    if (bonus.maxPoints === undefined) {
      issues.push({
        code: 'B6008',
        severity: 'warning',
        path,
        message: `ScoreBonus「${bonus.name}」にmaxPointsがありません。繰り返し加点が無制限になります。`,
      });
    }
  }
  if (variant.specialBonuses.length + variant.scoreBonuses.length > 5) {
    issues.push({
      code: 'B6009',
      severity: 'warning',
      path,
      message: 'ボーナスが多く、結果画面がうるさくなる可能性があります。',
    });
  }

  // 予算超過見込み
  const maxBase = variant.winRoles.reduce((max, role) => Math.max(max, role.basePoints), 0);
  const possibleMax = maxBase + specialTotal + scoreBonusTotal;
  if (possibleMax > variant.scoreBudget.hardResultCap) {
    issues.push({
      code: 'B6005',
      severity: 'warning',
      path,
      message: `理論上の最大得点${possibleMax}がhardResultCap ${variant.scoreBudget.hardResultCap}を超える可能性があります。`,
    });
  } else if (possibleMax > variant.scoreBudget.softResultCap) {
    issues.push({
      code: 'B6004',
      severity: 'warning',
      path,
      message: `理論上の最大得点${possibleMax}がsoftResultCap ${variant.scoreBudget.softResultCap}を超える可能性があります。`,
    });
  }
}

// deckの参照整合・実現可能性・バランスを検証する。
// deckの挙動を黙って書き換えない。scoreも黙って変えない。
export function validateDeckProject(input: ValidateDeckProjectInput): DeckValidationResult {
  const { deck } = input;
  const issues: ValidationIssue[] = [];
  const index = buildIndex(deck);

  // ID重複
  const seenCategoryIds = new Set<string>();
  for (const category of deck.categories) {
    if (seenCategoryIds.has(category.id)) {
      issues.push({
        code: 'V3010',
        severity: 'error',
        path: `$.categories.${category.id}`,
        message: `カテゴリID "${category.id}" が重複しています。`,
      });
    }
    seenCategoryIds.add(category.id);
  }
  const seenTileIds = new Set<string>();
  const seenTileNames = new Map<string, string>();
  for (const tile of deck.tiles) {
    if (seenTileIds.has(tile.id)) {
      issues.push({
        code: 'V3010',
        severity: 'error',
        path: `$.tiles.${tile.id}`,
        message: `牌ID "${tile.id}" が重複しています。`,
      });
    }
    seenTileIds.add(tile.id);
    const existingId = seenTileNames.get(tile.name);
    if (existingId !== undefined && existingId !== tile.id) {
      issues.push({
        code: 'V3011',
        severity: 'warning',
        path: `$.tiles.${tile.id}`,
        message: `牌名「${tile.name}」が複数の牌で使われています。表示が紛らわしくなります。`,
      });
    }
    seenTileNames.set(tile.name, tile.id);

    // 牌のカテゴリ参照
    for (const categoryId of [...tile.categories, tile.primaryCategoryId]) {
      if (!index.categoryIds.has(categoryId)) {
        issues.push({
          code: 'V3012',
          severity: 'error',
          path: `$.tiles.${tile.id}`,
          message: `牌「${tile.name}」が存在しないカテゴリ "${categoryId}" を参照しています。`,
        });
      }
    }
    if (!tile.categories.includes(tile.primaryCategoryId)) {
      issues.push({
        code: 'V3012',
        severity: 'error',
        path: `$.tiles.${tile.id}`,
        message: `牌「${tile.name}」のprimaryCategoryIdがcategoriesに含まれていません。`,
      });
    }
  }

  // active variant
  const activeVariant = deck.variants.find((variant) => variant.id === deck.activeVariantId);
  if (!activeVariant) {
    issues.push({
      code: 'V3003',
      severity: 'error',
      path: '$.activeVariantId',
      message: `activeVariantId "${deck.activeVariantId}" が存在しません。`,
    });
    return { status: 'blocked', issues };
  }

  if (activeVariant.ruleConfig.evaluationMode !== 'normalThreeGroups') {
    issues.push({
      code: 'E7008',
      severity: 'error',
      path: `$.variants.${activeVariant.id}`,
      message: '拡張ルール(extendedRoleSpan)のエンジンは未対応です。通常版を選んでください。',
    });
    return { status: 'blocked', issues };
  }

  // wildcard比率
  if (index.totalInstances > 0) {
    const ratio = index.wildcardInstances / index.totalInstances;
    if (ratio > 0.15) {
      issues.push({
        code: 'W5002',
        severity: 'error',
        message: `wildcardが山の${Math.round(ratio * 100)}%を占めています(上限15%)。`,
      });
    } else if (ratio > 0.1) {
      issues.push({
        code: 'W5001',
        severity: 'warning',
        message: `wildcardが山の${Math.round(ratio * 100)}%を占めています。役の個性が薄れる可能性があります。`,
      });
    }
  }

  // カテゴリの大きさ
  const usedCategoryIds = new Set<CategoryId>();
  for (const role of activeVariant.winRoles) {
    for (const req of role.requiredGroups) {
      if (req.categoryId) {
        usedCategoryIds.add(req.categoryId);
      }
    }
    if (role.wholeHandCondition) {
      const refs = { categoryIds: [] as CategoryId[], tileIds: [] as TileId[] };
      collectConditionRefs(role.wholeHandCondition, refs);
      refs.categoryIds.forEach((id) => usedCategoryIds.add(id));
    }
  }
  for (const bonus of activeVariant.specialBonuses) {
    const refs = { categoryIds: [] as CategoryId[], tileIds: [] as TileId[] };
    collectConditionRefs(bonus.condition, refs);
    refs.categoryIds.forEach((id) => usedCategoryIds.add(id));
  }

  for (const category of deck.categories) {
    if (index.wildcardCategoryIds.has(category.id)) {
      continue;
    }
    const instances = index.instancesByCategory.get(category.id) ?? 0;
    if (instances > 0 && instances < 3) {
      issues.push({
        code: 'V3007',
        severity: 'warning',
        path: `$.categories.${category.id}`,
        message: `カテゴリ「${category.name}」は${instances}枚しかなく、自然に3枚グループを作れません。`,
      });
    }
    if (index.totalInstances > 0 && instances / index.totalInstances > 0.6) {
      issues.push({
        code: 'V3008',
        severity: 'warning',
        path: `$.categories.${category.id}`,
        message: `カテゴリ「${category.name}」が山の大半を占めています。役が簡単になりすぎる可能性があります。`,
      });
    }
    if (!usedCategoryIds.has(category.id)) {
      issues.push({
        code: 'V3009',
        severity: 'info',
        path: `$.categories.${category.id}`,
        message: `カテゴリ「${category.name}」はどの役にも使われていません。`,
      });
    }
  }

  validateVariant(activeVariant, index, issues);

  const status = statusFromIssues(issues);
  return { status, issues };
}

function statusFromIssues(issues: ValidationIssue[]): DeckValidationStatus {
  if (issues.some((issue) => issue.severity === 'error')) {
    return 'draft';
  }
  if (issues.some((issue) => issue.severity === 'warning')) {
    return 'playableWithWarnings';
  }
  return 'playable';
}
