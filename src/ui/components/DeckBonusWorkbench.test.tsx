// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CategoryDefinition } from '../../domain/category';
import type { ScoreBonus, SpecialBonus } from '../../domain/role';
import { DeckBonusWorkbench } from './DeckBonusWorkbench';

const categories: CategoryDefinition[] = [
  { id: 'cat-a', name: '赤', color: '#ef4444', priority: 50 },
  { id: 'cat-b', name: '青', color: '#3b82f6', priority: 50 },
];

const specialBonuses: SpecialBonus[] = [
  {
    id: 'bonus-special-1',
    name: '赤の記憶',
    kind: 'special_bonus',
    points: 20,
    condition: { type: 'countByCategory', categoryId: 'cat-a', minCount: 3 },
    allowWildcard: true,
    maxWildcards: 1,
    explanation: '赤カテゴリを3枚以上集める',
  },
];

const scoreBonuses: ScoreBonus[] = [
  {
    id: 'bonus-score-1',
    name: '同牌ボーナス',
    type: 'duplicate_tile',
    minCount: 3,
    points: 15,
    maxPoints: 45,
    description: '同じ牌3枚ごとに加点',
  },
];

afterEach(cleanup);

function renderWorkbench(overrides: Partial<Parameters<typeof DeckBonusWorkbench>[0]> = {}) {
  const props: Parameters<typeof DeckBonusWorkbench>[0] = {
    categories,
    specialBonuses,
    scoreBonuses,
    templateCategoryId: 'cat-a',
    onTemplateCategoryChange: vi.fn(),
    onAddSpecialBonus: vi.fn(),
    onAddScoreBonus: vi.fn(),
    onUpdateSpecialBonus: vi.fn(),
    onRemoveSpecialBonus: vi.fn(),
    onUpdateScoreBonus: vi.fn(),
    onRemoveScoreBonus: vi.fn(),
    ...overrides,
  };
  render(<DeckBonusWorkbench {...props} />);
  return props;
}

describe('DeckBonusWorkbench', () => {
  it('Special/Scoreを同じ棚から選び、選択中1件だけ編集する', () => {
    const props = renderWorkbench();

    const specialChoice = screen.getByRole('button', { name: '赤の記憶を編集' });
    const scoreChoice = screen.getByRole('button', { name: '同牌ボーナスを編集' });
    expect(specialChoice.getAttribute('aria-pressed')).toBe('true');
    expect(scoreChoice.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('region', { name: '赤の記憶の編集' })).toBeTruthy();

    fireEvent.click(scoreChoice);

    expect(scoreChoice.getAttribute('aria-pressed')).toBe('true');
    const editor = screen.getByRole('region', { name: '同牌ボーナスの編集' });
    fireEvent.change(within(editor).getByLabelText('スコアボーナス点数'), {
      target: { value: '25' },
    });
    expect(props.onUpdateScoreBonus).toHaveBeenCalledWith('bonus-score-1', { points: 25 });
  });

  it('プリセット追加callbackは既存builder境界へそのまま渡す', () => {
    const props = renderWorkbench();

    fireEvent.click(screen.getByRole('button', { name: 'カテゴリ3枚以上 +20点' }));
    fireEvent.click(screen.getByRole('button', { name: '同じ牌3枚 +15点' }));

    expect(props.onAddSpecialBonus).toHaveBeenCalledWith('cat-a');
    expect(props.onAddScoreBonus).toHaveBeenCalledTimes(1);
  });

  it('選択中の種類に応じて正しい削除callbackを呼ぶ', () => {
    const props = renderWorkbench();

    fireEvent.click(screen.getByRole('button', { name: '同牌ボーナスを編集' }));
    fireEvent.click(screen.getByRole('button', { name: 'このボーナスを削除' }));

    expect(props.onRemoveScoreBonus).toHaveBeenCalledWith('bonus-score-1');
    expect(props.onRemoveSpecialBonus).not.toHaveBeenCalled();
  });
});
