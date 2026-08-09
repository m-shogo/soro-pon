// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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
    const view = render(<DeckEditorInspector deck={deck} validation={validation} />);

    expect(view.container.textContent).toContain('構成');
    expect(view.container.textContent).toContain('検証');

    const metrics = screen.getByLabelText('編集中デッキの構成');
    const text = metrics.textContent ?? '';
    expect(text).toContain(`牌${totalTileCount}${deck.tiles.length}種`);
    expect(text).toContain(`カテゴリ${deck.categories.length}`);
    expect(text).toContain(`役${activeVariant?.winRoles.length ?? 0}`);
    expect(text).toContain('ボーナス');
  });
});