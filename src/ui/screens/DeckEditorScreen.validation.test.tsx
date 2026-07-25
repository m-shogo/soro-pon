// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { DeckEditorScreen } from './DeckEditorScreen';

afterEach(cleanup);

describe('DeckEditorScreen production validation parity', () => {
  it('本番境界でblockするmembership重複を編集中にもV3013として表示する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());
    const firstTile = deck.tiles[0];
    if (firstTile === undefined) {
      throw new Error('test deck has no tiles');
    }
    firstTile.categories = [firstTile.primaryCategoryId, firstTile.primaryCategoryId];

    render(<DeckEditorScreen deck={deck} onSave={() => {}} onBack={() => {}} />);

    expect(screen.getByText(/V3013/)).toBeTruthy();
    expect(screen.getByText(/重複/)).toBeTruthy();
    expect(screen.getByText('要修正(対局不可)')).toBeTruthy();
  });
});
