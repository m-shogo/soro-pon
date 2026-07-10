import type { ScoreBonus, SpecialBonus, WinRole } from '../domain/role';

// デッキエディタの安全テンプレート構築ロジック(純関数)。
// docs/70 §18の推奨点数を使う。UIコンポーネントはこの関数を呼ぶだけで、
// 構造(family/requiredGroups/condition)を自分で組み立てない。
//
// すべてのwinRoleテンプレートは requiredGroups の count 合計がちょうど3になる
// (normalThreeGroupsは3グループぴったりでなければ判定できないため。docs/68, R4010)。
// bonus(special_bonus/score_bonus)は絶対に kind: 'win_role' を持たない別型として構築する。

export type CategoryRef = { id: string; name: string };
export type TileRef = { id: string; name: string };

// 既存IDのみから決定的にIDを作る(グローバル状態を持たない純関数)。
function freshId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  while (existing.includes(`${prefix}${n}`)) {
    n += 1;
  }
  return `${prefix}${n}`;
}

export function buildSameCategoryRoleTemplate(
  category: CategoryRef,
  existingRoleIds: string[],
): WinRole {
  return {
    id: freshId('role', existingRoleIds),
    name: `${category.name}あつめ`,
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 60,
    requiredGroups: [{ groupType: 'sameCategory', categoryId: category.id, count: 3 }],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 50,
    explanation: `${category.name}の3枚グループを3組そろえる。`,
    canTsumo: true,
    canRon: true,
  };
}

// 異なる3カテゴリから1組ずつ。ちょうど3カテゴリでない場合はnull(生成不可)。
export function buildThreeDifferentCategoriesRoleTemplate(
  categories: CategoryRef[],
  existingRoleIds: string[],
): WinRole | null {
  if (categories.length !== 3) {
    return null;
  }
  const ids = new Set(categories.map((c) => c.id));
  if (ids.size !== 3) {
    return null;
  }
  return {
    id: freshId('role', existingRoleIds),
    name: '三色の記憶',
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 80,
    requiredGroups: categories.map((c) => ({
      groupType: 'sameCategory' as const,
      categoryId: c.id,
      count: 1,
    })),
    allowWildcard: true,
    maxWildcards: 1,
    priority: 60,
    explanation: `${categories.map((c) => c.name).join('・')}のグループを1組ずつそろえる。`,
    canTsumo: true,
    canRon: true,
  };
}

export function buildSameTileRoleTemplate(existingRoleIds: string[]): WinRole {
  return {
    id: freshId('role', existingRoleIds),
    name: 'ぞろぞろ',
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 120,
    requiredGroups: [{ groupType: 'sameTile', count: 3 }],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 70,
    explanation: '同じ牌3枚のグループを3組そろえる。',
    canTsumo: true,
    canRon: true,
  };
}

// 指定3枚(distinct) + 同カテゴリ2組。
// 以下のいずれかに該当する場合はnullを返し、呼び出し側(UI)はボタンを無効化する:
//   - 牌が3枚ちょうど選ばれていない
//   - 選ばれた3枚のtileIdが重複している(同じ牌を複数スロットで選択)
//   - カテゴリが選ばれていない
export function buildSpecificSetRoleTemplate(
  input: { tiles: TileRef[]; category: CategoryRef },
  existingRoleIds: string[],
): WinRole | null {
  const { tiles, category } = input;
  if (tiles.length !== 3) {
    return null;
  }
  if (tiles.some((t) => t.id === '')) {
    return null;
  }
  const uniqueIds = new Set(tiles.map((t) => t.id));
  if (uniqueIds.size !== 3) {
    return null;
  }
  if (category.id === '') {
    return null;
  }
  const names = tiles.map((t) => t.name);
  return {
    id: freshId('role', existingRoleIds),
    name: `${names[0]}たちの記憶`,
    kind: 'win_role',
    family: 'specificCollection',
    basePoints: 100,
    requiredGroups: [
      { groupType: 'specificSet', tileIds: tiles.map((t) => t.id), count: 1 },
      { groupType: 'sameCategory', categoryId: category.id, count: 2 },
    ],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 40,
    explanation: `${names.join('・')}の組と、${category.name}グループ2組をそろえる。`,
    canTsumo: true,
    canRon: true,
  };
}

// カテゴリ3枚以上で加点。special_bonusは単体ではあがれない(kind: 'special_bonus')。
export function buildSpecialBonusTemplate(
  category: CategoryRef,
  existingBonusIds: string[],
): SpecialBonus {
  return {
    id: freshId('bonus', existingBonusIds),
    name: `${category.name}あつめボーナス`,
    kind: 'special_bonus',
    points: 20,
    condition: { type: 'countByCategory', categoryId: category.id, minCount: 3 },
    allowWildcard: true,
    maxWildcards: 1,
    explanation: `${category.name}が3枚以上あれば加点。単体ではあがれない。`,
  };
}

// 同じ牌3枚ボーナス。ScoreBonusはRole.kindを持たず、単体ではあがれない。
export function buildScoreBonusTemplate(existingBonusIds: string[]): ScoreBonus {
  return {
    id: freshId('scorebonus', existingBonusIds),
    name: '同じ牌3枚ボーナス',
    type: 'duplicate_tile',
    minCount: 3,
    points: 15,
    maxPoints: 15,
    description: '同じ牌を3枚持っている場合に加点。',
    allowWildcard: false,
  };
}
