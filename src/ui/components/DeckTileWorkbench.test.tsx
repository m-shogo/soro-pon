// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CategoryDefinition } from '../../domain/category';
import type { TileDefinition } from '../../domain/tile';
import { DeckTileWorkbench } from './DeckTileWorkbench';

const categories: CategoryDefinition[] = [
  { id: 'cat-a', name: '赤', color: '#ef4444', priority: 50 },
  { id: 'cat-b', name: '青', color: '#3b82f6', priority: 50 },
];

const tiles: TileDefinition[] = [
  {
    id: 'tile-a',
    name: 'ライオン',
    categories: ['cat-a'],
    primaryCategoryId: 'cat-a',
    fallbackLabel: '獅',
    emoji: '🦁',
    count: 3,
  },
  {
    id: 'tile-b',
    name: 'イルカ',
    categories: ['cat-b'],
    primaryCategoryId: 'cat-b',
    fallbackLabel: '海',
    emoji: '🐬',
    count: 2,
  },
];

afterEach(cleanup);

describe('DeckTileWorkbench', () => {
  it('牌そのものを選び、選択中の牌だけ編集する', () => {
    const onUpdateTile = vi.fn();

    render(
      <DeckTileWorkbench
        tiles={tiles}
        categories={categories}
        onAddTile={() => {}}
        onUpdateTile={onUpdateTile}
        onToggleCategory={() => {}}
        onRemoveTile={() => {}}
      />,
    );

    const lion = screen.getByRole('button', { name: 'ライオンを編集' });
    const dolphin = screen.getByRole('button', { name: 'イルカを編集' });
    expect(lion.getAttribute('aria-pressed')).toBe('true');
    expect(dolphin.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('region', { name: 'ライオンの編集' })).toBeTruthy();

    fireEvent.click(dolphin);

    expect(lion.getAttribute('aria-pressed')).toBe('false');
    expect(dolphin.getAttribute('aria-pressed')).toBe('true');
    const editor = screen.getByRole('region', { name: 'イルカの編集' });
    expect(editor).toBeTruthy();
    expect(within(editor).getByDisplayValue('イルカ')).toBeTruthy();

    fireEvent.change(within(editor).getByLabelText('牌名'), { target: { value: '海イルカ' } });
    expect(onUpdateTile).toHaveBeenCalledWith('tile-b', { name: '海イルカ' });
  });

  it('カテゴリ切替と主カテゴリ変更を選択牌へ渡す', () => {
    const onToggleCategory = vi.fn();
    const onUpdateTile = vi.fn();

    render(
      <DeckTileWorkbench
        tiles={tiles}
        categories={categories}
        onAddTile={() => {}}
        onUpdateTile={onUpdateTile}
        onToggleCategory={onToggleCategory}
        onRemoveTile={() => {}}
      />,
    );

    const editor = screen.getByRole('region', { name: 'ライオンの編集' });
    fireEvent.click(within(editor).getByText('青'));
    expect(onToggleCategory).toHaveBeenCalledWith(tiles[0], 'cat-b');
  });

  it('削除後は隣の牌へ選択を移して削除callbackを呼ぶ', () => {
    const onRemoveTile = vi.fn();

    render(
      <DeckTileWorkbench
        tiles={tiles}
        categories={categories}
        onAddTile={() => {}}
        onUpdateTile={() => {}}
        onToggleCategory={() => {}}
        onRemoveTile={onRemoveTile}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'この牌を削除' }));
    expect(onRemoveTile).toHaveBeenCalledWith('tile-a');
  });
});
