// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CategoryDefinition } from '../../domain/category';
import type { WinRole } from '../../domain/role';
import type { TileDefinition } from '../../domain/tile';
import { DeckRoleWorkbench } from './DeckRoleWorkbench';

const categories: CategoryDefinition[] = [
  { id: 'cat-a', name: '赤', color: '#ef4444', priority: 50 },
  { id: 'cat-b', name: '青', color: '#3b82f6', priority: 50 },
  { id: 'cat-c', name: '緑', color: '#22c55e', priority: 50 },
];

const tiles: TileDefinition[] = [
  { id: 'tile-a', name: 'A', categories: ['cat-a'], primaryCategoryId: 'cat-a', fallbackLabel: 'A', count: 3 },
  { id: 'tile-b', name: 'B', categories: ['cat-b'], primaryCategoryId: 'cat-b', fallbackLabel: 'B', count: 3 },
  { id: 'tile-c', name: 'C', categories: ['cat-c'], primaryCategoryId: 'cat-c', fallbackLabel: 'C', count: 3 },
];

const roles: WinRole[] = [
  {
    id: 'role-a',
    name: '赤そろい',
    kind: 'win_role',
    family: 'allSameCategory',
    basePoints: 60,
    requiredGroups: [],
    allowWildcard: true,
    maxWildcards: 1,
    priority: 10,
    explanation: '赤カテゴリをそろえる',
    canTsumo: true,
    canRon: true,
  },
  {
    id: 'role-b',
    name: '三色',
    kind: 'win_role',
    family: 'groupPattern',
    basePoints: 80,
    requiredGroups: [],
    allowWildcard: false,
    maxWildcards: 0,
    priority: 20,
    explanation: '3カテゴリを1組ずつ',
    canTsumo: true,
    canRon: true,
  },
];

afterEach(cleanup);

function renderWorkbench(overrides: Partial<Parameters<typeof DeckRoleWorkbench>[0]> = {}) {
  const props: Parameters<typeof DeckRoleWorkbench>[0] = {
    categories,
    tiles,
    roles,
    templateCategoryId: 'cat-a',
    onTemplateCategoryChange: vi.fn(),
    onAddRoleFromTemplate: vi.fn(),
    onAddSpecificSetRole: vi.fn(),
    onUpdateRole: vi.fn(),
    onRemoveRole: vi.fn(),
    ...overrides,
  };
  render(<DeckRoleWorkbench {...props} />);
  return props;
}

describe('DeckRoleWorkbench', () => {
  it('役棚から選択し、選択中1役だけ名前/点数を編集する', () => {
    const props = renderWorkbench();
    const first = screen.getByRole('button', { name: '赤そろいを編集' });
    const second = screen.getByRole('button', { name: '三色を編集' });

    expect(first.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(second);
    expect(second.getAttribute('aria-pressed')).toBe('true');

    const editor = screen.getByRole('region', { name: '三色の編集' });
    fireEvent.change(within(editor).getByLabelText('役名'), { target: { value: '三色そろい' } });
    fireEvent.change(within(editor).getByLabelText('点数'), { target: { value: '90' } });

    expect(props.onUpdateRole).toHaveBeenCalledWith('role-b', { name: '三色そろい' });
    expect(props.onUpdateRole).toHaveBeenCalledWith('role-b', { basePoints: 90 });
  });

  it('安全プリセットcallbackを既存builder境界へ渡す', () => {
    const props = renderWorkbench();

    fireEvent.click(screen.getByRole('button', { name: '同カテゴリ3組 60点' }));
    fireEvent.click(screen.getByRole('button', { name: '3カテゴリ1組ずつ 80点' }));
    fireEvent.click(screen.getByRole('button', { name: '同じ牌3枚×3組 120点' }));

    expect(props.onAddRoleFromTemplate).toHaveBeenCalledWith('threeSameCategory', 'cat-a');
    expect(props.onAddRoleFromTemplate).toHaveBeenCalledWith('threeDifferentCategories');
    expect(props.onAddRoleFromTemplate).toHaveBeenCalledWith('threeSameTile');
  });

  it('指定3枚プリセットと削除を選択状態に紐づける', () => {
    const props = renderWorkbench();
    fireEvent.change(screen.getByLabelText('セット牌1'), { target: { value: 'tile-a' } });
    fireEvent.change(screen.getByLabelText('セット牌2'), { target: { value: 'tile-b' } });
    fireEvent.change(screen.getByLabelText('セット牌3'), { target: { value: 'tile-c' } });
    fireEvent.click(screen.getByRole('button', { name: '指定3枚 + 同カテゴリ2組 100点' }));

    expect(props.onAddSpecificSetRole).toHaveBeenCalledWith('cat-a', ['tile-a', 'tile-b', 'tile-c']);

    fireEvent.click(screen.getByRole('button', { name: '三色を編集' }));
    fireEvent.click(screen.getByRole('button', { name: 'この役を削除' }));
    expect(props.onRemoveRole).toHaveBeenCalledWith('role-b');
  });
});
