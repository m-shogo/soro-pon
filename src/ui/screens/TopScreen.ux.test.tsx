// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkinProvider } from '../skins/SkinProvider';
import { TopScreen } from './TopScreen';

afterEach(cleanup);

function renderTop() {
  return render(
    <SkinProvider>
      <TopScreen
        onPlayNow={() => {}}
        onDeckList={() => {}}
        onImport={() => {}}
        onCollection={() => {}}
        hasPlayableDeck
        coins={12}
        recentRecords={[]}
      />
    </SkinProvider>,
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

  it('初期化はデータ管理からさらに不可逆操作の確認へ進む', async () => {
    const user = userEvent.setup();
    renderTop();

    await user.click(screen.getByRole('button', { name: /データ管理/ }));
    await user.click(screen.getByRole('button', { name: 'ローカルデータを初期化…' }));

    expect(screen.getByRole('dialog', { name: 'ローカルデータの初期化' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '全て削除して初期化する' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'やめる' })).toBeTruthy();
  });
});
