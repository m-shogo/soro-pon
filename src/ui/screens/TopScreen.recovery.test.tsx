// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DECKS_BACKUP_KEY } from '../../storage/localStorageDeckStore';
import { TopScreen } from './TopScreen';

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

function renderTop(): void {
  render(
    <TopScreen
      onPlayNow={() => {}}
      onDeckList={() => {}}
      onImport={() => {}}
      onCollection={() => {}}
      hasPlayableDeck
      coins={0}
      recentRecords={[]}
    />,
  );
}

function openDataManagement(): void {
  fireEvent.click(screen.getByRole('button', { name: /データ管理/ }));
  expect(screen.getByRole('dialog', { name: 'データ管理' })).toBeTruthy();
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: originalCreateObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: originalRevokeObjectURL,
  });
  window.localStorage.clear();
});

describe('TopScreen recovery export', () => {
  it('退避コピーがない場合はダウンロードせず状態を明示する', () => {
    renderTop();
    openDataManagement();

    fireEvent.click(screen.getByRole('button', { name: /退避データを書き出す/ }));

    expect(screen.getByRole('status').textContent).toContain('退避コピーはありません');
  });

  it('退避コピーをJSONファイルとして書き出し、初期化前の保管を促す', () => {
    window.localStorage.setItem(DECKS_BACKUP_KEY, '{broken-json');
    const createObjectURL = vi.fn(() => 'blob:recovery');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderTop();
    openDataManagement();

    fireEvent.click(screen.getByRole('button', { name: /退避データを書き出す/ }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toContain('退避コピー1件を書き出しました');
    expect(window.localStorage.getItem(DECKS_BACKUP_KEY)).toBe('{broken-json');
  });

  it('ブラウザがファイル生成を拒否した場合は成功扱いせず退避コピーを残す', () => {
    window.localStorage.setItem(DECKS_BACKUP_KEY, 'still-here');
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => {
        throw new Error('download blocked');
      }),
    });
    renderTop();
    openDataManagement();

    fireEvent.click(screen.getByRole('button', { name: /退避データを書き出す/ }));

    expect(screen.getByRole('alert').textContent).toContain('ファイルを作成できませんでした');
    expect(screen.queryByText(/書き出しました/)).toBeNull();
    expect(window.localStorage.getItem(DECKS_BACKUP_KEY)).toBe('still-here');
  });
});
