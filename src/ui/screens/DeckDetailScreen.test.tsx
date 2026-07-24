// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { DeckDetailScreen } from './DeckDetailScreen';

afterEach(cleanup);

describe('DeckDetailScreen deletion safety', () => {
  it('削除ボタンだけでは削除せず、不可逆性を確認後に実行する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());
    const onDelete = vi.fn();

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{ status: 'playable', issues: [] }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'デッキを削除' })).toBeTruthy();
    expect(screen.getByText(/復元する画面もありません/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '削除する' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('やめるを選ぶと削除しない', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());
    const onDelete = vi.fn();

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{ status: 'playable', issues: [] }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '削除' }));
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'デッキを削除' })).toBeNull();
  });
});
