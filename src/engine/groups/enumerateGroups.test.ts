import { describe, expect, it } from 'vitest';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances, makeTestIndex } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { buildDeckIndex, type DeckIndex } from '../tiles/deckIndex';
import { enumerateGroups } from './enumerateGroups';

function animalIndex(): DeckIndex {
  const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
  return buildDeckIndex(deck);
}

const baseInput = {
  allowWildcard: true,
  maxWildcardsPerGroup: 1,
} as const;

describe('enumerateGroups: 自然グループ', () => {
  it('同じ牌3枚はsameTileグループになる', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'lion', 'lion']),
      index: animalIndex(),
    });
    const sameTile = result.groups.find((g) => g.group.groupType === 'sameTile');
    expect(sameTile).toBeDefined();
    expect(sameTile?.group.tileId).toBe('lion');
    expect(sameTile?.wildcardCount).toBe(0);
  });

  it('同カテゴリ3枚はsameCategoryグループになる', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'elephant', 'giraffe']),
      index: animalIndex(),
    });
    const categories = result.groups
      .filter((g) => g.group.groupType === 'sameCategory')
      .map((g) => g.group.categoryId);
    expect(categories).toContain('mammal');
    expect(categories).toContain('savanna');
    // 共通しないカテゴリは含まれない(strongはgiraffeにない)
    expect(categories).not.toContain('strong');
  });

  it('同タグ3枚はsameTagグループになる', () => {
    const index = makeTestIndex([
      { id: 'bat', name: 'コウモリ', categories: ['night'], primaryCategoryId: 'night', fallbackLabel: 'コ', count: 3, tags: ['yoru'] },
      { id: 'owl2', name: 'ヨルフクロウ', categories: ['night'], primaryCategoryId: 'night', fallbackLabel: 'ヨ', count: 3, tags: ['yoru'] },
      { id: 'moth', name: 'ガ', categories: ['night'], primaryCategoryId: 'night', fallbackLabel: 'ガ', count: 3, tags: ['yoru'] },
    ]);
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['bat', 'owl2', 'moth']),
      index,
    });
    const sameTag = result.groups.find((g) => g.group.groupType === 'sameTag');
    expect(sameTag?.group.tag).toBe('yoru');
  });

  it('指定セットはspecificSetグループになる', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'elephant', 'giraffe']),
      index: animalIndex(),
      specificSets: [['lion', 'elephant', 'giraffe']],
    });
    const specific = result.groups.find((g) => g.group.groupType === 'specificSet');
    expect(specific).toBeDefined();
    expect(specific?.group.specificTileIds).toEqual(['lion', 'elephant', 'giraffe']);
  });

  it('freeSetはincludeFreeSet指定時のみ列挙する', () => {
    const hand = makeInstances(['lion', 'penguin', 'bee']);
    const without = enumerateGroups({ ...baseInput, handTiles: hand, index: animalIndex() });
    expect(without.groups.some((g) => g.group.groupType === 'freeSet')).toBe(false);
    const withFree = enumerateGroups({
      ...baseInput,
      handTiles: hand,
      index: animalIndex(),
      includeFreeSet: true,
    });
    expect(withFree.groups.some((g) => g.group.groupType === 'freeSet')).toBe(true);
  });
});

describe('enumerateGroups: wildcard', () => {
  it('wildcardは欠けた1枚を埋め、割当が記録される', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'lion', 'star']),
      index: animalIndex(),
    });
    const sameTile = result.groups.find(
      (g) => g.group.groupType === 'sameTile' && g.wildcardCount === 1,
    );
    expect(sameTile).toBeDefined();
    expect(sameTile?.group.tileId).toBe('lion');
    expect(sameTile?.wildcardAssignments[0]?.usedAsTileId).toBe('lion');
    expect(sameTile?.wildcardAssignments[0]?.wildcardTileInstanceId).toBe('star#1');

    const mammal = result.groups.find(
      (g) => g.group.groupType === 'sameCategory' && g.group.categoryId === 'mammal',
    );
    expect(mammal?.wildcardCount).toBe(1);
    expect(mammal?.wildcardAssignments[0]?.usedAsCategoryId).toBe('mammal');
  });

  it('1グループにwildcard 2枚は使えない', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'star', 'star']),
      index: animalIndex(),
    });
    const mammal = result.groups.find(
      (g) => g.group.groupType === 'sameCategory' && g.group.categoryId === 'mammal',
    );
    expect(mammal).toBeUndefined();
  });

  it('allowWildcard=falseだとwildcard補助グループが出ない', () => {
    const result = enumerateGroups({
      ...baseInput,
      allowWildcard: false,
      handTiles: makeInstances(['lion', 'lion', 'star']),
      index: animalIndex(),
    });
    expect(result.groups.filter((g) => g.wildcardCount > 0)).toHaveLength(0);
  });

  it('specificSetの欠けもwildcardで埋まる', () => {
    const result = enumerateGroups({
      ...baseInput,
      handTiles: makeInstances(['lion', 'elephant', 'star']),
      index: animalIndex(),
      specificSets: [['lion', 'elephant', 'giraffe']],
    });
    const specific = result.groups.find((g) => g.group.groupType === 'specificSet');
    expect(specific?.wildcardCount).toBe(1);
    expect(specific?.wildcardAssignments[0]?.usedAsTileId).toBe('giraffe');
  });
});
