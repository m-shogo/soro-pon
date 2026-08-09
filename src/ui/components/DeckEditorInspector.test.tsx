// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { validateDeckForUse } from '../../engine/validation/validateDeckForUse';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { DeckEditorInspector } from './DeckEditorInspector';

afterEach(cleanup);

describe('DeckEditorInspector', () => {
  it('編集中デッキの構成と検証を同時に表示する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());
    const validation = validateDeckForUse(deck);
    const totalTileCount = deck.tiles.reduce((total, tile) => total + tile.count, 0);
    const activeVariant = deck.variants.find((variant) => variant.id === deck.activeVariantId);
    const summary = render(<DeckEditorInspector deck={deck} validation={validation} />);

    expect(summary.container.textContent).toContain('構成');
    expect(summary.container.textContent).toContain('検証');

    const composition = screen.getByRole('definition', { name: '' });
    expect(composition).toBeTruthy();

    const metrics = screen.getByLabelText('編集中デッキの構成');
    expect(within(metrics).getByText(String(totalTileCount))).toBeTruthy();
    expect(within(metrics).getByText(String(deck.categories.length))).toBeTruthy();
    expect(within(metrics).getByText(String(activeVariant?.winRoles.length ?? 0))).toBeTruthy();
  });
});