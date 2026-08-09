// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CategoryDefinition } from '../../domain/category';
import type { TileDefinition } from '../../domain/tile';
import { DeckCategoryWorkbench } from './DeckCategoryWorkbench';

const categories: CategoryDefinition[] = [
  { id: 'cat-a', name: '哺乳類', color: '#ef4444', priority: 50, icon: '🐾' },
  { id: 'cat-b', name: '鳥', color: '#3b82f6', priority: 40, icon: '🪶' },
];

const tiles: TileDefinition[] = [
  {
    id: 'tile-a',
    name: 'ライオン',
    categories: ['cat-a'],
    primaryCategoryId: 'cat-a',
    fallbackLabel: '獅',
    count: 3,
  },
  {
    id: 'tile-b',
    name: 'ワシ',
    categories: ['cat-b'],
    primaryCategoryId: 'cat-b',
    fallbackLabel: '鷲',
    count: 2,
  },
];

afterEach(cleanup);

describe('DeckCategoryWorkbench', () => {
  it('カテゴリ見本を選び、選択中カテゴリだけ編集する', () => {
    const onUpdateCategory = vi.fn();

    render(
      <DeckCategoryWorkbench
        categories={categories}
        tiles={tiles}
        onAddCategory={() => {}}
        onUpdateCategory={onUpdateCategory}
        onRemoveCategory={() => {}}
      />,
    );

    const mammal = screen.getByRole('button', { name: '哺乳類を編集' });
    const bird = screen.getByRole('button', { name: '鳥を編集' });
    expect(mammal.getAttribute('aria-pressed')).toBe('true');
    expect(bird.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(bird);
    expect(screen.getByRole('region', { name: '鳥の編集' })).toBeTruthy();

    const editor = screen.getByRole('region', { name: '鳥の編集' });
    fireEvent.change(within(editor).getByLabelText('カテゴリ名'), {
      target: { value: '空の鳥' },
    });
    expect(onUpdateCategory).toHaveBeenCalledWith('cat-b', { name: '空の鳥' });
  });

  it('使用牌数をカテゴリごとに表示する', () => {
    render(
      <DeckCategoryWorkbench
        categories={categories}
        tiles={tiles}
        onAddCategory={() => {}}
        onUpdateCategory={() => {}}
        onRemoveCategory={() => {}}
      />,
    );

    const mammal = screen.getByRole('button', { name: '哺乳類を編集' });
    expect(within(mammal).getByText('使用牌 1種')).toBeTruthy();
  });

  it('削除callbackを選択カテゴリへ渡す', () => {
    const onRemoveCategory = vi.fn();

    render(
      <DeckCategoryWorkbench
        categories={categories}
        tiles={tiles}
        onAddCategory={() => {}}
        onUpdateCategory={() => {}}
        onRemoveCategory={onRemoveCategory}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'このカテゴリを削除' }));
    expect(onRemoveCategory).toHaveBeenCalledWith('cat-a');
  });
});
