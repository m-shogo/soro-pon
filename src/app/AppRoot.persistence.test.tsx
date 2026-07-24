// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import starterRaw from '../../samples/animal-starter.deck.json';
import { AppRoot } from './AppRoot';
import { DECKS_STORAGE_KEY } from '../storage/localStorageDeckStore';
import { RECORDS_STORAGE_KEY } from '../storage/localStorageRecordsStore';
import { SETTINGS_STORAGE_KEY } from '../storage/localStorageSettingsStore';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function legacyDeckJson(id = 'legacy-review-test'): string {
  const legacy = JSON.parse(JSON.stringify(starterRaw)) as Record<string, unknown>;
  legacy['id'] = id;
  legacy['name'] = '旧形式レビュー確認用';
  legacy['version'] = 0;
  for (const variant of legacy['variants'] as Array<Record<string, unknown>>) {
    delete variant['scoreBudget'];
  }
  return JSON.stringify(legacy);
}

function storedDeckById(id: string): Record<string, unknown> | undefined {
  const raw = window.localStorage.getItem(DECKS_STORAGE_KEY);
  if (raw === null) {
    return undefined;
  }
  const payload = JSON.parse(raw) as {
    decks: Array<{ deck: Record<string, unknown> }>;
  };
  return payload.decks.find((entry) => entry.deck['id'] === id)?.deck;
}

describe('AppRoot persistence integrity', () => {
  it('旧形式importは変換内容の表示だけでは保存せず、同じ入力の2回目で保存する', () => {
    render(<AppRoot />);

    fireEvent.click(screen.getByRole('button', { name: 'JSONを読み込む' }));
    fireEvent.change(screen.getByLabelText('デッキJSON'), {
      target: { value: legacyDeckJson() },
    });
    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));

    expect(screen.getByText(/旧形式 version 0 を version 1 へ変換します/)).toBeTruthy();
    expect(screen.getByText(/variants\[0\]\.scoreBudget にdefaultを適用/)).toBeTruthy();
    expect(storedDeckById('legacy-review-test')).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: '変換して読み込む' }));

    const stored = storedDeckById('legacy-review-test');
    expect(stored?.['version']).toBe(1);
    const variants = stored?.['variants'] as Array<Record<string, unknown>>;
    expect(variants.every((variant) => variant['scoreBudget'] !== undefined)).toBe(true);
  });

  it('変換レビュー後にJSONを変更したら承認を無効化し、再レビューを要求する', () => {
    render(<AppRoot />);

    const raw = legacyDeckJson('legacy-review-edit-test');
    fireEvent.click(screen.getByRole('button', { name: 'JSONを読み込む' }));
    const textarea = screen.getByLabelText('デッキJSON');
    fireEvent.change(textarea, { target: { value: raw } });
    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));
    expect(screen.getByRole('button', { name: '変換して読み込む' })).toBeTruthy();

    fireEvent.change(textarea, { target: { value: `${raw}\n` } });
    expect(screen.getByRole('button', { name: '読み込む' })).toBeTruthy();
    expect(storedDeckById('legacy-review-edit-test')).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));
    expect(screen.getByRole('button', { name: '変換して読み込む' })).toBeTruthy();
    expect(storedDeckById('legacy-review-edit-test')).toBeUndefined();
  });

  it('recordsとsettingsの破損回復noticeを起動時に捨てず表示する', () => {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, 'null');
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, 'null');

    render(<AppRoot />);

    expect(screen.getByText(/対局記録が壊れていたため初期化しました/)).toBeTruthy();
    expect(screen.getByText(/設定データが壊れていたため初期設定に戻しました/)).toBeTruthy();
  });
});
