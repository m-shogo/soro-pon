// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameTableLayout, type TableSeat } from './GameTableLayout';
import { PlayerPanel } from './PlayerPanel';
import { TileCard } from './TileCard';

function renderLayout(playerCount: 3 | 4, seats: TableSeat[]) {
  return render(
    <GameTableLayout
      playerCount={playerCount}
      utility={<span>utility</span>}
      center={<span>center</span>}
      seats={seats}
      hand={<button type="button">hand</button>}
      actions={<button type="button">action</button>}
    />,
  );
}

describe('GameTableLayout', () => {
  it('3人戦は左右の相手と自分だけを配置し、空の4人目席を作らない', () => {
    const seats: TableSeat[] = [
      { id: 'cpu1', position: 'left', content: 'left opponent' },
      { id: 'cpu2', position: 'right', content: 'right opponent' },
      { id: 'you', position: 'self', content: 'self player' },
    ];
    const { container } = renderLayout(3, seats);

    expect(screen.getByRole('main', { name: '3人戦の対局卓' })).toBeTruthy();
    expect(container.querySelectorAll('.sp-table-seat')).toHaveLength(3);
    expect(container.querySelector('[data-seat-position="top"]')).toBeNull();
  });

  it('4人戦は左・上・右と自分の4席を配置する', () => {
    const seats: TableSeat[] = [
      { id: 'cpu1', position: 'left', content: 'left opponent' },
      { id: 'cpu2', position: 'top', content: 'top opponent' },
      { id: 'cpu3', position: 'right', content: 'right opponent' },
      { id: 'you', position: 'self', content: 'self player' },
    ];
    const { container } = renderLayout(4, seats);

    expect(screen.getByRole('main', { name: '4人戦の対局卓' })).toBeTruthy();
    expect(container.querySelectorAll('.sp-table-seat')).toHaveLength(4);
    for (const position of ['left', 'top', 'right', 'self']) {
      expect(container.querySelector(`[data-seat-position="${position}"]`)).not.toBeNull();
    }
  });

  it('長いプレイヤー名の完全値と手番・枚数をaccessible nameに保つ', () => {
    const longName = 'とても長い名前の夜明けを待つプレイヤー';
    render(
      <PlayerPanel
        name={longName}
        kind="cpu"
        handCount={1234}
        discardCount={9999}
        active
      />,
    );

    const panel = screen.getByRole('group', {
      name: `相手、${longName}、現在の手番、手牌1234枚、捨て牌9999枚`,
    });
    expect(panel.getAttribute('aria-current')).toBe('true');
    expect(within(panel).getByTitle(longName)).toBeTruthy();
  });

  it('手牌の選択状態と使用不能状態をnative semanticsで伝える', () => {
    render(
      <TileCard
        name="テスト牌"
        fallbackLabel="テ"
        selected
        disabled
      />,
    );

    const tile = screen.getByRole('button', { name: 'テスト牌' });
    expect(tile.getAttribute('aria-pressed')).toBe('true');
    expect((tile as HTMLButtonElement).disabled).toBe(true);
  });
});

