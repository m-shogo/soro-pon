// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import type { DeckValidationResult } from '../../domain/validation';
import { DeckEditorInspector } from './DeckEditorInspector';

const deck = deckProjectSchema.parse(buildMinimalDeck());

afterEach(cleanup);

function renderInspector(validation: DeckValidationResult) {
  render(<DeckEditorInspector deck={deck} validation={validation} />);
}

describe('DeckEditorInspector adaptive validation rail', () => {
  it('warningだけなら詳細を閉じて件数内訳を常時表示する', () => {
    renderInspector({
      status: 'playableWithWarnings',
      issues: [
        { code: 'WARN_ONE', severity: 'warning', message: '注意1' },
        { code: 'INFO_ONE', severity: 'info', message: '情報1' },
      ],
    });

    const details = screen.getByText('検証詳細').closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(screen.getByLabelText('検証問題の内訳').textContent).toContain('1');

    fireEvent.click(screen.getByText('検証詳細'));
    expect(details.open).toBe(true);
    expect(screen.getByText('注意1')).toBeTruthy();
  });

  it('blockedまたはerrorがある場合は詳細を初期表示する', () => {
    renderInspector({
      status: 'blocked',
      issues: [{ code: 'ERR_ONE', severity: 'error', message: '修正が必要' }],
    });

    const details = screen.getByText('検証詳細').closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(true);
    expect(screen.getByText('修正が必要')).toBeTruthy();
  });

  it('問題なしではdisclosureを出さず、構成statusを残す', () => {
    renderInspector({ status: 'playable', issues: [] });

    expect(screen.getByText('検証: 問題なし')).toBeTruthy();
    expect(screen.queryByText('検証詳細')).toBeNull();
    expect(screen.getByLabelText('編集中デッキの構成')).toBeTruthy();
  });
});
