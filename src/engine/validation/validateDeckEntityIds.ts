import type { DeckProject } from '../../domain/deck';
import type { GroupRequirement } from '../../domain/group';
import type { ValidationIssue } from '../../domain/validation';

type SeenEntity = {
  path: string;
  label: string;
};

function recordUniqueId(
  seen: Map<string, SeenEntity>,
  id: string,
  current: SeenEntity,
  kind: string,
  issues: ValidationIssue[],
): void {
  const previous = seen.get(id);
  if (previous !== undefined) {
    issues.push({
      code: 'V3010',
      severity: 'error',
      path: current.path,
      message: `${kind}ID "${id}" が重複しています。「${previous.label}」と「${current.label}」に同じIDは使えません。`,
      fixHint: 'それぞれ異なるIDへ変更してください。表示名が同じでもIDは一意である必要があります。',
    });
    return;
  }
  seen.set(id, current);
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }
  return [...duplicates];
}

function ignoredRequirementFields(requirement: GroupRequirement): string[] {
  const fields: string[] = [];
  const allowCategory = requirement.groupType === 'sameCategory';
  const allowTag = requirement.groupType === 'sameTag';
  const allowTileIds = requirement.groupType === 'specificSet';

  if (!allowCategory && requirement.categoryId !== undefined) {
    fields.push('categoryId');
  }
  if (!allowTag && requirement.tag !== undefined) {
    fields.push('tag');
  }
  if (!allowTileIds && requirement.tileIds !== undefined) {
    fields.push('tileIds');
  }
  return fields;
}

/**
 * 永続化・import・対局開始の前に必要なdeck全体のidentity整合性を検証する。
 *
 * roleCollectionやResult記録はdeckId:roleIdを使い、役family探索もroleIdで行うため、
 * role IDはvariantごとではなくdeck全体で一意でなければならない。
 * special bonusとscore bonusも同じbonus ID namespaceとして扱う。
 *
 * tileのcategory/tag membershipは集合として評価される。配列内重複を許すと、
 * 一部の検証処理だけが同じ牌を複数枚分として数えるため明示的に拒否する。
 * groupTypeで使わない余剰フィールドも、保存されてもエンジンが無視するため拒否する。
 */
export function validateDeckEntityIds(deck: DeckProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const variants = new Map<string, SeenEntity>();
  const roles = new Map<string, SeenEntity>();
  const bonuses = new Map<string, SeenEntity>();

  deck.tiles.forEach((tile, tileIndex) => {
    const duplicateCategories = duplicateValues(tile.categories);
    if (duplicateCategories.length > 0) {
      issues.push({
        code: 'V3013',
        severity: 'error',
        path: `$.tiles[${tileIndex}].categories`,
        message: `牌「${tile.name}」のカテゴリ指定が重複しています: ${duplicateCategories.join(', ')}。同じカテゴリは1回だけ指定してください。`,
        fixHint: '重複したカテゴリIDを削除してください。重複しても牌の所属数は増えません。',
      });
    }

    const duplicateTags = duplicateValues(tile.tags ?? []);
    if (duplicateTags.length > 0) {
      issues.push({
        code: 'V3013',
        severity: 'error',
        path: `$.tiles[${tileIndex}].tags`,
        message: `牌「${tile.name}」のタグ指定が重複しています: ${duplicateTags.join(', ')}。同じタグは1回だけ指定してください。`,
        fixHint: '重複したタグを削除してください。重複しても牌の所属数は増えません。',
      });
    }
  });

  deck.variants.forEach((variant, variantIndex) => {
    recordUniqueId(
      variants,
      variant.id,
      { path: `$.variants[${variantIndex}].id`, label: variant.name },
      'variant',
      issues,
    );

    const duplicatePlayerCounts = duplicateValues(
      variant.ruleConfig.supportedPlayerCounts.map(String),
    );
    if (duplicatePlayerCounts.length > 0) {
      issues.push({
        code: 'V3013',
        severity: 'error',
        path: `$.variants[${variantIndex}].ruleConfig.supportedPlayerCounts`,
        message: `対応人数が重複しています: ${duplicatePlayerCounts.join(', ')}。3人・4人はそれぞれ1回だけ指定してください。`,
      });
    }

    variant.winRoles.forEach((role, roleIndex) => {
      recordUniqueId(
        roles,
        role.id,
        {
          path: `$.variants[${variantIndex}].winRoles[${roleIndex}].id`,
          label: role.name,
        },
        '役',
        issues,
      );

      role.requiredGroups.forEach((requirement, requirementIndex) => {
        const ignoredFields = ignoredRequirementFields(requirement);
        if (ignoredFields.length > 0) {
          issues.push({
            code: 'R4011',
            severity: 'error',
            path: `$.variants[${variantIndex}].winRoles[${roleIndex}].requiredGroups[${requirementIndex}]`,
            message: `${requirement.groupType}では ${ignoredFields.join(', ')} を使用しません。保存してもエンジンが無視する曖昧な条件のため削除してください。`,
            fixHint: 'groupTypeに対応する条件フィールドだけを残してください。',
          });
        }
      });
    });

    variant.specialBonuses.forEach((bonus, bonusIndex) => {
      recordUniqueId(
        bonuses,
        bonus.id,
        {
          path: `$.variants[${variantIndex}].specialBonuses[${bonusIndex}].id`,
          label: bonus.name,
        },
        'ボーナス',
        issues,
      );
    });

    variant.scoreBonuses.forEach((bonus, bonusIndex) => {
      recordUniqueId(
        bonuses,
        bonus.id,
        {
          path: `$.variants[${variantIndex}].scoreBonuses[${bonusIndex}].id`,
          label: bonus.name,
        },
        'ボーナス',
        issues,
      );

      if (bonus.maxPoints !== undefined && bonus.maxPoints < bonus.points) {
        issues.push({
          code: 'B6010',
          severity: 'error',
          path: `$.variants[${variantIndex}].scoreBonuses[${bonusIndex}].maxPoints`,
          message: `ScoreBonus「${bonus.name}」のmaxPoints ${bonus.maxPoints}が1回分のpoints ${bonus.points}より小さいため、成立直後から宣言値より低い点数へ切り下がります。`,
          fixHint: 'maxPointsをpoints以上にするか、maxPointsを削除してください。',
        });
      }
    });
  });

  return issues;
}
