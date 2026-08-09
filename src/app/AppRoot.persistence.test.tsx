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

function currentDeck(id: string, name: string): Record<string, unknown> {
  const deck = JSON.parse(JSON.stringify(starterRaw)) as Record<string, unknown>;
  deck['id'] = id;
  deck['name'] = name;
  return deck;
}

function seedStoredDeck(deck: Record<string, unknown>, updatedAtMs = 1): void {
  window.localStorage.setItem(
    DECKS_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      decks: [{ deck, source: 'created', updatedAtMs }],
    }),
  );
}

function replaceStoredDeck(id: string, name: string, updatedAtMs = 2): void {
  const raw = window.localStorage.getItem(DECKS_STORAGE_KEY);
  if (raw === null) {
    throw new Error('deck payload missing');
  }
  const payload = JSON.parse(raw) as {
    version: 1;
    decks: Array<{
      deck: Record<string, unknown>;
      source: 'official' | 'created' | 'imported';
      updatedAtMs: number;
    }>;
  };
  const entry = payload.decks.find((stored) => stored.deck['id'] === id);
  if (entry === undefined) {
    throw new Error(`deck missing: ${id}`);
  }
  entry.deck = { ...entry.deck, name };
  entry.updatedAtMs = updatedAtMs;
  window.localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(payload));
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

    fireEvent.click(screen.getByRole('button', { name: /^JSONを読み込む/ }));
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
    fireEvent.click(screen.getByRole('button', { name: /^JSONを読み込む/ }));
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

  it('同じdeck IDのimportは1回目で上書きせず、明示確認後だけ置換する', () => {
    const id = 'existing-import-conflict';
    seedStoredDeck(currentDeck(id, '保存済みデッキ'));
    render(<AppRoot />);

    const incoming = JSON.stringify(currentDeck(id, '読み込んだ更新版'));
    fireEvent.click(screen.getByRole('button', { name: /^JSONを読み込む/ }));
    fireEvent.change(screen.getByLabelText('デッキJSON'), { target: { value: incoming } });
    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));

    expect(screen.getByText(/同じID .* のデッキ「保存済みデッキ」が保存されています/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '上書きして読み込む' })).toBeTruthy();
    expect(storedDeckById(id)?.['name']).toBe('保存済みデッキ');

    fireEvent.click(screen.getByRole('button', { name: '上書きして読み込む' }));
    expect(storedDeckById(id)?.['name']).toBe('読み込んだ更新版');
  });

  it('上書き確認後にJSONを変更したら承認を失効させる', () => {
    const id = 'overwrite-review-edit-test';
    seedStoredDeck(currentDeck(id, '保存済みデッキ'));
    render(<AppRoot />);

    const incoming = JSON.stringify(currentDeck(id, '更新版'));
    fireEvent.click(screen.getByRole('button', { name: /^JSONを読み込む/ }));
    const textarea = screen.getByLabelText('デッキJSON');
    fireEvent.change(textarea, { target: { value: incoming } });
    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));
    expect(screen.getByRole('button', { name: '上書きして読み込む' })).toBeTruthy();

    fireEvent.change(textarea, { target: { value: `${incoming}\n` } });
    expect(screen.getByRole('button', { name: '読み込む' })).toBeTruthy();
    expect(storedDeckById(id)?.['name']).toBe('保存済みデッキ');
  });

  it('上書き確認後に別タブが同じdeckを変更したら確認を無効化し、最新版を保護する', () => {
    const id = 'overwrite-cross-tab-test';
    seedStoredDeck(currentDeck(id, '確認時の保存デッキ'));
    render(<AppRoot />);

    const incoming = JSON.stringify(currentDeck(id, '読み込み予定版'));
    fireEvent.click(screen.getByRole('button', { name: /^JSONを読み込む/ }));
    fireEvent.change(screen.getByLabelText('デッキJSON'), { target: { value: incoming } });
    fireEvent.click(screen.getByRole('button', { name: '読み込む' }));
    expect(screen.getByRole('button', { name: '上書きして読み込む' })).toBeTruthy();

    replaceStoredDeck(id, '別タブ最新版', 2);
    fireEvent.click(screen.getByRole('button', { name: '上書きして読み込む' }));

    expect(storedDeckById(id)?.['name']).toBe('別タブ最新版');
    expect(screen.getByText(/デッキ「別タブ最新版」が保存されています/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '上書きして読み込む' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '上書きして読み込む' }));
    expect(storedDeckById(id)?.['name']).toBe('読み込み予定版');
  });

  it('Editor表示後に別タブが更新したら古いdraftを保存せず一覧へ戻す', () => {
    const id = 'editor-cross-tab-test';
    seedStoredDeck(currentDeck(id, '編集対象デッキ'));
    render(<AppRoot />);

    fireEvent.click(screen.getByRole('button', { name: /^デッキ一覧/ }));
    fireEvent.click(screen.getByRole('button', { name: /編集対象デッキ/ }));
    fireEvent.click(screen.getByRole('button', { name: 'デッキを編集' }));
    fireEvent.change(screen.getByLabelText('デッキ名'), { target: { value: '古いdraft' } });

    replaceStoredDeck(id, '別タブ更新版', 2);
    fireEvent.click(screen.getByRole('button', { name: '保存する' }));

    expect(screen.getByText(/別タブまたは別画面で変更・削除されたため/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'デッキ選択' })).toBeTruthy();
    expect(storedDeckById(id)?.['name']).toBe('別タブ更新版');
  });

  it('recordsとsettingsの破損回復noticeを起動時に捨てず表示する', () => {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, 'null');
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, 'null');

    render(<AppRoot />);

    expect(screen.getByText(/対局記録が壊れていたため初期化しました/)).toBeTruthy();
    expect(screen.getByText(/設定データが壊れていたため初期設定に戻しました/)).toBeTruthy();
  });
});