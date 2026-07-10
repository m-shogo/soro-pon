import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../domain/deck';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { validateDeckProject } from '../engine/validation/validateDeckProject';
import { buildMinimalDeck } from '../test-support/builders/deckBuilder';
import {
  buildSameCategoryRoleTemplate,
  buildSameTileRoleTemplate,
  buildScoreBonusTemplate,
  buildSpecialBonusTemplate,
  buildSpecificSetRoleTemplate,
  buildThreeDifferentCategoriesRoleTemplate,
} from './editorTemplates';

function baseDeck(): DeckProject {
  return deckProjectSchema.parse(buildMinimalDeck());
}

function withRole(deck: DeckProject, role: ReturnType<typeof buildSameCategoryRoleTemplate>): DeckProject {
  return {
    ...deck,
    variants: deck.variants.map((v) =>
      v.id === deck.activeVariantId ? { ...v, winRoles: [...v.winRoles, role] } : v,
    ),
  };
}

describe('editorTemplates: winRole生成はrequiredGroups合計ちょうど3', () => {
  it('buildSameCategoryRoleTemplate', () => {
    const role = buildSameCategoryRoleTemplate({ id: 'fruit', name: '果物' }, []);
    const sum = role.requiredGroups.reduce((s, g) => s + g.count, 0);
    expect(sum).toBe(3);
    expect(role.kind).toBe('win_role');
  });

  it('buildThreeDifferentCategoriesRoleTemplate: ちょうど3カテゴリでない場合はnull', () => {
    expect(
      buildThreeDifferentCategoriesRoleTemplate(
        [
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ],
        [],
      ),
    ).toBeNull();
    const role = buildThreeDifferentCategoriesRoleTemplate(
      [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
      ],
      [],
    );
    expect(role).not.toBeNull();
    expect(role!.requiredGroups.reduce((s, g) => s + g.count, 0)).toBe(3);
  });

  it('buildThreeDifferentCategoriesRoleTemplate: 同じカテゴリが重複していたらnull', () => {
    const role = buildThreeDifferentCategoriesRoleTemplate(
      [
        { id: 'a', name: 'A' },
        { id: 'a', name: 'A' },
        { id: 'c', name: 'C' },
      ],
      [],
    );
    expect(role).toBeNull();
  });

  it('buildSameTileRoleTemplate', () => {
    const role = buildSameTileRoleTemplate([]);
    expect(role.requiredGroups.reduce((s, g) => s + g.count, 0)).toBe(3);
    expect(role.requiredGroups[0]?.groupType).toBe('sameTile');
  });

  it('IDは既存リストと衝突しない', () => {
    const role = buildSameCategoryRoleTemplate({ id: 'fruit', name: '果物' }, ['role1', 'role2']);
    expect(['role1', 'role2']).not.toContain(role.id);
  });
});

describe('editorTemplates: specificSetテンプレート', () => {
  const tiles = [
    { id: 'lion', name: 'ライオン' },
    { id: 'elephant', name: 'ゾウ' },
    { id: 'giraffe', name: 'キリン' },
  ];
  const category = { id: 'mammal', name: '哺乳類' };

  it('3枚distinct+カテゴリでrequiredGroups合計ちょうど3のwinRoleを生成する', () => {
    const role = buildSpecificSetRoleTemplate({ tiles, category }, []);
    expect(role).not.toBeNull();
    expect(role!.kind).toBe('win_role');
    expect(role!.family).toBe('specificCollection');
    const sum = role!.requiredGroups.reduce((s, g) => s + g.count, 0);
    expect(sum).toBe(3);
    const specificSet = role!.requiredGroups.find((g) => g.groupType === 'specificSet');
    expect(specificSet?.tileIds).toEqual(['lion', 'elephant', 'giraffe']);
  });

  it('重複tileId(同じ牌を複数スロットで選択)はnullを返し生成を拒否する', () => {
    const dup = [tiles[0]!, tiles[0]!, tiles[1]!];
    const role = buildSpecificSetRoleTemplate({ tiles: dup, category }, []);
    expect(role).toBeNull();
  });

  it('未選択スロット(空id)はnullを返す', () => {
    const incomplete = [tiles[0]!, { id: '', name: '' }, tiles[1]!];
    const role = buildSpecificSetRoleTemplate({ tiles: incomplete, category }, []);
    expect(role).toBeNull();
  });

  it('カテゴリ未選択はnullを返す', () => {
    const role = buildSpecificSetRoleTemplate({ tiles, category: { id: '', name: '' } }, []);
    expect(role).toBeNull();
  });

  it('枚数が3でない場合はnullを返す', () => {
    const role = buildSpecificSetRoleTemplate({ tiles: tiles.slice(0, 2), category }, []);
    expect(role).toBeNull();
  });

  it('生成したwinRoleはdeckProjectSchemaを通り、validateDeckProjectでも成立可能と判定される', () => {
    const deck = deckProjectSchema.parse(
      JSON.parse(
        JSON.stringify({
          version: 1,
          id: 'test-specific',
          name: 'テスト',
          categories: [
            { id: 'mammal', name: '哺乳類', color: '#EF4444', priority: 80, icon: '🐾' },
          ],
          tiles: [
            { id: 'lion', name: 'ライオン', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'ラ', count: 3 },
            { id: 'elephant', name: 'ゾウ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'ゾ', count: 3 },
            { id: 'giraffe', name: 'キリン', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'キ', count: 3 },
            { id: 'zebra', name: 'シマウマ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'シ', count: 3 },
            { id: 'monkey', name: 'サル', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'サ', count: 3 },
            { id: 'panda', name: 'パンダ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'パ', count: 3 },
            { id: 'bear', name: 'クマ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'ク', count: 3 },
            { id: 'fox', name: 'キツネ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'ツ', count: 3 },
            { id: 'wolf', name: 'オオカミ', categories: ['mammal'], primaryCategoryId: 'mammal', fallbackLabel: 'オ', count: 3 },
          ],
          activeVariantId: 'normal',
          variants: [
            {
              id: 'normal',
              name: '通常版',
              label: '通常版',
              ruleConfig: {
                id: 'r',
                name: 'r',
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
              },
              scoreBudget: {
                expectedBaseMin: 30,
                expectedBaseMax: 130,
                expectedResultMin: 40,
                expectedResultMax: 220,
                softResultCap: 300,
                hardResultCap: 500,
                maxSpecialBonusTotal: 80,
                maxScoreBonusTotal: 60,
              },
              winRoles: [],
              specialBonuses: [],
              scoreBonuses: [],
            },
          ],
        }),
      ),
    );
    const role = buildSpecificSetRoleTemplate({ tiles, category }, [])!;
    const withNewRole = withRole(deck, role);
    // deckProjectSchemaを再度通す(strict parse)
    expect(() => deckProjectSchema.parse(withNewRole)).not.toThrow();
    const result = validateDeckProject({ deck: withNewRole });
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('未知tileId参照はvalidateDeckProjectでR4003として検出される(エディタの外、import等の防衛線)', () => {
    const deck = baseDeck();
    const role = buildSpecificSetRoleTemplate(
      { tiles: [tiles[0]!, tiles[1]!, { id: 'ghost-tile', name: '幽霊' }], category: { id: 'fruit', name: '果物' } },
      [],
    )!;
    const result = validateDeckProject({ deck: withRole(deck, role) });
    expect(result.issues.some((i) => i.code === 'R4003')).toBe(true);
  });
});

describe('editorTemplates: ボーナスはwinRoleとして扱われない', () => {
  it('special_bonusはkind:special_bonusで、単体ではあがれない構造', () => {
    const bonus = buildSpecialBonusTemplate({ id: 'fruit', name: '果物' }, []);
    expect(bonus.kind).toBe('special_bonus');
    expect('canRon' in bonus).toBe(false);
    expect('canTsumo' in bonus).toBe(false);
    expect('requiredGroups' in bonus).toBe(false);
  });

  it('scoreBonusはkindフィールドを持たずwinRole/special_bonusと別型', () => {
    const bonus = buildScoreBonusTemplate([]);
    expect('kind' in bonus).toBe(false);
    expect('canRon' in bonus).toBe(false);
    expect('requiredGroups' in bonus).toBe(false);
  });

  it('special_bonus/scoreBonusをvariant.winRolesへ混入させるとschemaが拒否する', () => {
    const deck = baseDeck();
    const specialBonus = buildSpecialBonusTemplate({ id: 'fruit', name: '果物' }, []);
    const polluted = {
      ...deck,
      variants: deck.variants.map((v) =>
        v.id === deck.activeVariantId
          ? { ...v, winRoles: [...v.winRoles, specialBonus] }
          : v,
      ),
    };
    expect(() => deckProjectSchema.parse(polluted)).toThrow();
  });

  it('special_bonus/scoreBonusは単体では勝利候補にならない(既存scoring契約の再確認)', () => {
    // このモジュールはUI構築のみを担当し、勝敗判定はengine/scoringが担う。
    // ボーナス単体不可の保証はcalculateScore.test.tsで既に検証済み。
    const bonus = buildSpecialBonusTemplate({ id: 'fruit', name: '果物' }, []);
    expect(bonus.kind).not.toBe('win_role');
  });
});
