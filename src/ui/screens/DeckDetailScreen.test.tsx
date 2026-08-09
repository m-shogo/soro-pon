// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { deckProjectSchema } from '../../schemas/deckProjectSchema';
import { buildMinimalDeck } from '../../test-support/builders/deckBuilder';
import { DeckDetailScreen } from './DeckDetailScreen';

afterEach(cleanup);

describe('DeckDetailScreen deletion safety', () => {
  it('表示専用牌をボタンではなく画像として伝える', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{ status: 'playable', issues: [] }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={() => {}}
      />,
    );

    const tileName = deck.tiles[0]?.name;
    expect(tileName).toBeDefined();
    expect(screen.getAllByRole('img', { name: tileName }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: tileName })).toBeNull();
  });

  it('牌セットを主役にした概要と主要CTAを保持する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());
    const totalTileCount = deck.tiles.reduce((total, tile) => total + tile.count, 0);

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{ status: 'playable', issues: [] }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={() => {}}
      />,
    );

    const summary = screen.getByRole('region', { name: 'デッキ概要' });
    expect(summary).toBeTruthy();
    expect(within(summary).getByText(String(totalTileCount))).toBeTruthy();
    expect(within(summary).getByText('対局条件を満たしています')).toBeTruthy();
    expect(screen.getByRole('region', { name: `牌 ${deck.tiles.length}種` })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'このデッキで対局' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'デッキを編集' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'その他のデッキ操作' })).toBeTruthy();
    expect(screen.getAllByText('対局可').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: '牌セット' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '役' })).toBeTruthy();
    expect(screen.queryByText('TILE SET')).toBeNull();
    expect(screen.queryByText('WIN ROLES')).toBeNull();
    expect(screen.queryByText('対局できます')).toBeNull();
  });

  it('注意ありは対局可能のまま状態と検証詳細を明示する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{
          status: 'playableWithWarnings',
          issues: [
            {
              code: 'TEST_WARNING',
              severity: 'warning',
              message: '確認が必要です',
            },
          ],
        }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getAllByText('注意あり').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'このデッキで対局' })).not.toBeDisabled();
    const detailSummary = screen.getByText('検証詳細 1件');
    const details = detailSummary.closest('details');
    expect(details?.open).toBe(false);
  });

  it('使用不可の検証詳細は初期表示し、対局CTAを無効化する', () => {
    const deck = deckProjectSchema.parse(buildMinimalDeck());

    render(
      <DeckDetailScreen
        deck={deck}
        validation={{
          status: 'blocked',
          issues: [
            {
              code: 'TEST_ERROR',
              severity: 'error',
              message: '修正が必要です',
            },
          ],
        }}
        onBack={() => {}}
        onStartSetup={() => {}}
        onEdit={() => {}}
        onExport={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getAllByText('要修正').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'このデッキで対局' })).toBeDisabled();
    const detailSummary = screen.getByText('検証詳細 1件');
    const details = detailSummary.closest('details');
    expect(details?.open).toBe(true);
    expect(screen.getByText('修正が必要です')).toBeTruthy();
  });

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
