import { describe, expect, it } from 'vitest';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { loadSampleText } from '../../test-support/fixtures/loadFixture';
import { createTileInstances } from './createTileInstances';

describe('createTileInstances', () => {
  it('countどおりにインスタンスを展開し、IDは決定的', () => {
    const instances = createTileInstances({
      tiles: [
        {
          id: 'apple',
          name: 'リンゴ',
          categories: ['fruit'],
          primaryCategoryId: 'fruit',
          fallbackLabel: 'リ',
          count: 3,
        },
      ],
    });
    expect(instances.map((i) => i.instanceId)).toEqual(['apple#1', 'apple#2', 'apple#3']);
    expect(instances.every((i) => i.location === 'drawPile')).toBe(true);
  });

  it('animal starterは27種x3枚=81インスタンス', () => {
    const deck = deckProjectSchema.parse(JSON.parse(loadSampleText('animal-starter.deck.json')));
    const instances = createTileInstances({ tiles: deck.tiles });
    expect(instances).toHaveLength(81);
    expect(new Set(instances.map((i) => i.instanceId)).size).toBe(81);
  });
});
