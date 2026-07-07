import { describe, expect, it } from 'vitest';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { makeInstances } from '../../test-support/builders/handBuilder';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { buildDeckIndex, type DeckIndex } from '../tiles/deckIndex';
import { enumerateGroups } from './enumerateGroups';
import { partitionHand } from './partitionHand';

function animalIndex(): DeckIndex {
  const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
  return buildDeckIndex(deck);
}

function partitionsFor(tileIds: string[]) {
  const handTiles = makeInstances(tileIds);
  const index = animalIndex();
  const { groups } = enumerateGroups({
    handTiles,
    index,
    allowWildcard: true,
    maxWildcardsPerGroup: 1,
  });
  return partitionHand({ handTiles, groups });
}

describe('partitionHand', () => {
  it('9枚を3つの完成グループへ分割できる', () => {
    const result = partitionsFor([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'penguin', 'penguin', 'penguin',
    ]);
    expect(result.partitions.length).toBeGreaterThan(0);
    const mammal3 = result.partitions.find((p) =>
      p.groups.every((g) => g.group.groupType === 'sameTile'),
    );
    expect(mammal3).toBeDefined();
  });

  it('全partitionは9インスタンスをちょうど1回ずつ使う', () => {
    const result = partitionsFor([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'zebra',
    ]);
    for (const partition of result.partitions) {
      const ids = partition.groups.flatMap((g) => g.group.tileInstanceIds);
      expect(ids).toHaveLength(9);
      expect(new Set(ids).size).toBe(9);
    }
  });

  it('8枚は完成形にならない', () => {
    const result = partitionsFor([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra',
    ]);
    expect(result.partitions).toHaveLength(0);
  });

  it('10枚は完成形にならない', () => {
    const result = partitionsFor([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'zebra',
      'monkey',
    ]);
    expect(result.partitions).toHaveLength(0);
  });

  it('wildcardが欠けた1枚を埋めた分割ができる', () => {
    const result = partitionsFor([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'star',
    ]);
    expect(result.partitions.length).toBeGreaterThan(0);
    const withWildcard = result.partitions.find((p) => p.wildcardCount === 1);
    expect(withWildcard).toBeDefined();
    // 自然な分割が先に来る(この手はwildcardなしでは分割できないので先頭もwildcard=1)
    expect(result.partitions[0]?.wildcardCount).toBe(1);
  });

  it('partition上限を超えるとP8001警告を返す', () => {
    // 全部mammal + savannaの牌9枚はラベル組合せで分割が多くなる
    const handTiles = makeInstances([
      'lion', 'lion', 'lion',
      'elephant', 'elephant', 'elephant',
      'zebra', 'zebra', 'zebra',
    ]);
    const index = animalIndex();
    const { groups } = enumerateGroups({
      handTiles,
      index,
      allowWildcard: true,
      maxWildcardsPerGroup: 1,
    });
    const result = partitionHand({ handTiles, groups, maxPartitions: 2 });
    expect(result.partitions.length).toBeLessThanOrEqual(2);
    expect(result.warnings.some((w) => w.code === 'P8001' && w.capped)).toBe(true);
  });
});
