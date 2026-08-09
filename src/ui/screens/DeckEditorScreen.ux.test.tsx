// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { DeckEditorScreen } from './DeckEditorScreen';

afterEach(cleanup);

function renderEditor() {
  const deck = deckProjectSchema.parse(buildMinimalDeck());
  const onSave = vi.fn();
  render(<DeckEditorScreen deck={deck} onSave={onSave} onBack={() => {}} />);
  return { deck, onSave };
}

describe('DeckEditorScreen interaction semantics', () => {
  it('active tabとtabpanelを双方向に関連付ける', () => {
    renderEditor();

    const tab = screen.getByRole('tab', { name: '基本' });
    const panel = screen.getByRole('tabpanel');

    expect(tab.id).toBe('sp-tab-basic');
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('変更がない間は保存を無効化し、編集すると保存可能になる', async () => {
    const user = userEvent.setup();
    const { deck, onSave } = renderEditor();
    const save = screen.getByRole('button', { name: '保存する' }) as HTMLButtonElement;

    expect(save.disabled).toBe(true);

    await user.clear(screen.getByLabelText('デッキ名'));
    await user.type(screen.getByLabelText('デッキ名'), `${deck.name} 改`);

    expect(save.disabled).toBe(false);
    await user.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
