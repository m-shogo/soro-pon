// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopScreen } from './TopScreen';

afterEach(cleanup);

function renderTop() {
  return render(
    <TopScreen
      onPlayNow={() => {}}
      onDeckList={() => {}}
      onImport={() => {}}
      onCollection={() => {}}
      hasPlayableDeck
      coins={12}
      recentRecords={[]}
    />,
  );
}

describe('TopScreen interaction hierarchy', () => {
  it('日常操作から初期化を外し、データ管理の中でのみ提示する', async () => {
    const user = userEvent.setup();
    renderTop();

    expect(screen.getByRole('button', { name: /まず遊ぶ/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /データ管理/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'ローカルデータを初期化…' })).toBeNull();

    await user.click(screen.getByRole('button', { name: /データ管理/ }));

    expect(screen.getByRole('dialog', { name: 'データ管理' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '退避データを書き出す' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ローカルデータを初期化…' })).toBeTruthy();
  });

  it('初期化確認中はデータ管理を閉じ、aria-modal/focus trapを重ねない', async () => {
    const user = userEvent.setup();
    renderTop();

    await user.click(screen.getByRole('button', { name: /データ管理/ }));
    await user.click(screen.getByRole('button', { name: 'ローカルデータを初期化…' }));

    expect(screen.queryByRole('dialog', { name: 'データ管理' })).toBeNull();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: 'ローカルデータの初期化' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '全て削除して初期化する' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'やめる' })).toBeTruthy();
  });

  it('初期化をやめるとデータ管理へ戻り、保守コンテキストを失わない', async () => {
    const user = userEvent.setup();
    renderTop();

    await user.click(screen.getByRole('button', { name: /データ管理/ }));
    await user.click(screen.getByRole('button', { name: 'ローカルデータを初期化…' }));
    await user.click(screen.getByRole('button', { name: 'やめる' }));

    expect(screen.queryByRole('dialog', { name: 'ローカルデータの初期化' })).toBeNull();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: 'データ管理' })).toBeTruthy();
  });
});
