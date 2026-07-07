// テスト用の最小deckビルダー。安全テーマ(果物/野菜)のみ使用する。
// 戻り値はplain objectなので、テスト側で自由に改変してからparseできる。

export type PlainDeck = Record<string, unknown>;

export const DEFAULT_TEST_SCORE_BUDGET = {
  expectedBaseMin: 30,
  expectedBaseMax: 130,
  expectedResultMin: 40,
  expectedResultMax: 220,
  softResultCap: 300,
  hardResultCap: 500,
  maxSpecialBonusTotal: 80,
  maxScoreBonusTotal: 60,
} as const;

export function buildTestRuleConfig(): Record<string, unknown> {
  return {
    id: 'test-normal-rule',
    name: 'テスト通常ルール',
    evaluationMode: 'normalThreeGroups',
    supportedPlayerCounts: [3, 4],
    handSizeNormal: 8,
    handSizeAfterDraw: 9,
    winHandSize: 9,
    groupSize: 3,
    groupCount: 3,
    allowRon: true,
    allowPon: false,
    allowKan: false,
    allowChi: false,
    allowReach: false,
    allowScoreBonus: true,
    allowWildcard: true,
  };
}

export function buildTestWinRole(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'win_fruit_three_groups',
    name: 'くだもの畑',
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 60,
    requiredGroups: [{ groupType: 'sameCategory', categoryId: 'fruit', count: 3 }],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 10,
    explanation: '果物の3枚グループを3組そろえる。',
    canTsumo: true,
    canRon: true,
    ...overrides,
  };
}

const FRUIT_TILES = [
  ['apple', 'リンゴ', 'リ'],
  ['banana', 'バナナ', 'バ'],
  ['grape', 'ブドウ', 'ブ'],
  ['peach', 'モモ', 'モ'],
  ['melon', 'メロン', 'メ'],
  ['cherry', 'サクランボ', 'サ'],
] as const;

const VEG_TILES = [
  ['carrot', 'ニンジン', 'ニ'],
  ['tomato', 'トマト', 'ト'],
  ['onion', 'タマネギ', 'タ'],
  ['potato', 'ジャガイモ', 'ジ'],
  ['corn', 'トウモロコシ', 'ウ'],
  ['pumpkin', 'カボチャ', 'カ'],
] as const;

// 12種x3枚=36枚。3人戦(25枚)・4人戦(33枚)どちらも配れる。
export function buildMinimalDeck(overrides: PlainDeck = {}): PlainDeck {
  return {
    version: 1,
    id: 'test-minimal',
    name: 'テスト最小デッキ',
    description: 'テスト用の最小構成デッキ。',
    categories: [
      { id: 'fruit', name: '果物', color: '#EF4444', priority: 80, icon: '🍎' },
      { id: 'veg', name: '野菜', color: '#22C55E', priority: 70, icon: '🥕' },
    ],
    tiles: [
      ...FRUIT_TILES.map(([id, name, label]) => ({
        id,
        name,
        categories: ['fruit'],
        primaryCategoryId: 'fruit',
        fallbackLabel: label,
        count: 3,
      })),
      ...VEG_TILES.map(([id, name, label]) => ({
        id,
        name,
        categories: ['veg'],
        primaryCategoryId: 'veg',
        fallbackLabel: label,
        count: 3,
      })),
    ],
    activeVariantId: 'normal',
    variants: [
      {
        id: 'normal',
        name: '通常版',
        label: '通常版',
        ruleConfig: buildTestRuleConfig(),
        scoreBudget: { ...DEFAULT_TEST_SCORE_BUDGET },
        winRoles: [
          buildTestWinRole(),
          buildTestWinRole({
            id: 'win_veg_three_groups',
            name: 'やさい畑',
            basePoints: 60,
            requiredGroups: [{ groupType: 'sameCategory', categoryId: 'veg', count: 3 }],
            priority: 20,
            explanation: '野菜の3枚グループを3組そろえる。',
          }),
          buildTestWinRole({
            id: 'win_mixed_field',
            name: 'まぜこぜ畑',
            basePoints: 80,
            requiredGroups: [
              { groupType: 'sameCategory', categoryId: 'fruit', count: 1 },
              { groupType: 'sameCategory', categoryId: 'veg', count: 2 },
            ],
            priority: 30,
            explanation: '果物グループ1組と野菜グループ2組をそろえる。',
          }),
        ],
        specialBonuses: [],
        scoreBonuses: [],
      },
    ],
    ...overrides,
  };
}

// wildcard入り(きら星と同等の挙動)テストデッキ
export function buildDeckWithWildcard(overrides: PlainDeck = {}): PlainDeck {
  const deck = buildMinimalDeck();
  const tiles = deck['tiles'] as Record<string, unknown>[];
  const categories = deck['categories'] as Record<string, unknown>[];
  categories.push({
    id: 'wildcard',
    name: 'オールマイティ',
    color: '#F59E0B',
    priority: 999,
    icon: '⭐',
  });
  tiles.push({
    id: 'star',
    name: 'きら星',
    categories: ['wildcard'],
    primaryCategoryId: 'wildcard',
    fallbackLabel: '星',
    count: 3,
    wildcard: {
      kind: 'any_tile',
      maxUsePerRole: 1,
      canCompleteWinRole: true,
      canCompleteSpecialBonus: true,
      canTriggerRonWhenDiscarded: false,
      countsForScoreBonus: false,
    },
  });
  return { ...deck, ...overrides };
}
