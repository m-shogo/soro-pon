import type { DeckProject } from '../../domain/deck';
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

/**
 * variant / win role / bonus のIDをdeck全体で一意に保つ。
 *
 * roleCollectionやResult記録はdeckId:roleIdを使い、役family探索もroleIdで行うため、
 * role IDはvariantごとではなくdeck全体で一意でなければならない。
 * special bonusとscore bonusも同じbonus ID namespaceとして扱う。
 */
export function validateDeckEntityIds(deck: DeckProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const variants = new Map<string, SeenEntity>();
  const roles = new Map<string, SeenEntity>();
  const bonuses = new Map<string, SeenEntity>();

  deck.variants.forEach((variant, variantIndex) => {
    recordUniqueId(
      variants,
      variant.id,
      { path: `$.variants[${variantIndex}].id`, label: variant.name },
      'variant',
      issues,
    );

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
    });
  });

  return issues;
}
