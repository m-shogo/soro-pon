import { describe, expect, it } from 'vitest';
import type { DeckProject } from '../../domain/deck';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { parseDeckImport } from '../import/parseDeckImport';
import { validateDeckEntityIds } from './validateDeckEntityIds';
import { validateDeckForUse } from './validateDeckForUse';

function minimalDeck(): DeckProject {
  return deckProjectSchema.parse(buildMinimalDeck());
}

describe('tile membership integrity', () => {
  it('同じcategory/tagの配列内重複をV3013で拒否する', () => {
    const deck = minimalDeck();
    const tile = deck.tiles[0]!;
    tile.categories = ['fruit', 'fruit'];
    tile.tags = ['red', 'red'];

    const issues = validateDeckEntityIds(deck);

    expect(issues.filter((issue) => issue.code === 'V3013')).toHaveLength(2);
    expect(validateDeckForUse(deck).status).toBe('draft');
  });

  it('重複categoryを枚数の水増しに使わず、成立不可能な役をR4005にする', () => {
    const deck = minimalDeck();
    const fruitTiles = deck.tiles.filter((tile) => tile.primaryCategoryId === 'fruit');

    fruitTiles.slice(0, 2).forEach((tile) => {
      tile.categories = ['fruit', 'fruit'];
    });
    fruitTiles.slice(2).forEach((tile) => {
      tile.categories = ['veg'];
      tile.primaryCategoryId = 'veg';
    });

    const result = validateDeckForUse(deck);

    expect(result.issues.some((issue) => issue.code === 'V3013')).toBe(true);
    expect(result.issues.some((issue) => issue.code === 'R4005')).toBe(true);
  });

  it('重複membershipを含む共有JSONは保存前にimport拒否する', () => {
    const deck = minimalDeck();
    deck.tiles[0]!.categories = ['fruit', 'fruit'];

    const result = parseDeckImport({ rawText: JSON.stringify(deck) });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.code === 'V3013')).toBe(true);
    }
  });
});
