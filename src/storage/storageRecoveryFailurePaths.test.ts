import { describe, expect, it } from 'vitest';
import {
  createLocalStorageDeckStore,
  DECKS_BACKUP_KEY,
  DECKS_STORAGE_KEY,
} from './localStorageDeckStore';
import {
  createLocalStorageRecordsStore,
  RECORDS_BACKUP_KEY,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';
import {
  createLocalStorageSettingsStore,
  SETTINGS_BACKUP_KEY,
  SETTINGS_STORAGE_KEY,
} from './localStorageSettingsStore';

type Faults = {
  get?: boolean;
  set?: boolean;
  remove?: boolean;
};

function createFaultingStorage(initial: Record<string, string>, faults: Faults = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      if (faults.get) {
        throw new DOMException('storage read denied', 'SecurityError');
      }
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      if (faults.set) {
        throw new DOMException('storage write denied', 'QuotaExceededError');
      }
      map.set(key, value);
    },
    removeItem(key: string): void {
      if (faults.remove) {
        throw new DOMException('storage removal denied', 'SecurityError');
      }
      map.delete(key);
    },
    peek(key: string): string | null {
      return map.get(key) ?? null;
    },
  };
}

describe('storage recovery operation failures', () => {
  it('deck破損時にbackup書き込みが失敗してもloadAllは例外停止しない', () => {
    const storage = createFaultingStorage({ [DECKS_STORAGE_KEY]: '{broken' }, { set: true });

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toEqual([]);
    expect(result.issues[0]?.code).toBe('L9001');
    expect(result.issues[0]?.message).toContain('バックアップを保存できませんでした');
    expect(storage.peek(DECKS_STORAGE_KEY)).toBeNull();
  });

  it('deck破損時にactive key削除が失敗してもbackupを残して回復する', () => {
    const raw = '{broken';
    const storage = createFaultingStorage({ [DECKS_STORAGE_KEY]: raw }, { remove: true });

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toEqual([]);
    expect(result.issues[0]?.message).toContain('壊れた保存データを削除できませんでした');
    expect(storage.peek(DECKS_BACKUP_KEY)).toBe(raw);
    expect(storage.peek(DECKS_STORAGE_KEY)).toBe(raw);
  });

  it('deck storageのgetItem自体が拒否されてもL9004と空payloadへ落とす', () => {
    const storage = createFaultingStorage({}, { get: true });

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toEqual([]);
    expect(result.issues[0]?.code).toBe('L9004');
    expect(result.issues[0]?.message).toContain('保存領域を読み込めない');
  });

  it('壊れたrecordsは原文をbackupしてactive keyを除去する', () => {
    const raw = 'null';
    const storage = createFaultingStorage({ [RECORDS_STORAGE_KEY]: raw });

    const result = createLocalStorageRecordsStore(storage).load();

    expect(result.records.records).toEqual([]);
    expect(result.issues[0]?.code).toBe('L9001');
    expect(storage.peek(RECORDS_BACKUP_KEY)).toBe(raw);
    expect(storage.peek(RECORDS_STORAGE_KEY)).toBeNull();
  });

  it('recordsのbackup・削除が両方失敗しても空記録へ回復する', () => {
    const storage = createFaultingStorage({ [RECORDS_STORAGE_KEY]: 'null' }, { set: true, remove: true });

    const result = createLocalStorageRecordsStore(storage).load();

    expect(result.records.records).toEqual([]);
    expect(result.issues[0]?.message).toContain('バックアップを保存できませんでした');
    expect(result.issues[0]?.message).toContain('壊れた記録を削除できませんでした');
  });

  it('settings storageのgetItem自体が拒否されてもL9004とdefaultへ落とす', () => {
    const storage = createFaultingStorage({}, { get: true });

    const result = createLocalStorageSettingsStore(storage).load();

    expect(result.settings.insightMode).toBe('normal');
    expect(result.issues[0]?.code).toBe('L9004');
    expect(storage.peek(SETTINGS_BACKUP_KEY)).toBeNull();
    expect(storage.peek(SETTINGS_STORAGE_KEY)).toBeNull();
  });
});
