import { describe, expect, it } from 'vitest';
import { StorageWriteError, createMemoryStorage } from './keyValueStorage';
import {
  buildMatchRecord,
  createLocalStorageRecordsStore,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';

function winningRecord() {
  return buildMatchRecord({
    dateMs: 1000,
    deckId: 'deck',
    deckName: 'Deck',
    reason: 'tsumo',
    winnerName: 'あなた',
    humanWon: true,
    selectedWinRoleId: 'role-a',
    selectedWinRoleName: '役A',
    totalPoints: 120,
  });
}

describe('records match commit atomicity', () => {
  it('記録・コイン・役コレクション・実績を1回のstorage writeで確定する', () => {
    const map = new Map<string, string>();
    let recordWrites = 0;
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === RECORDS_STORAGE_KEY) {
          recordWrites += 1;
        }
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    };
    const store = createLocalStorageRecordsStore(storage);

    const committed = store.commitMatch(
      winningRecord(),
      'session-a:tsumo:you',
      'deck:role-a',
      (next) => {
        expect(next.coins).toBe(120);
        expect(next.totalMatches).toBe(1);
        expect(next.roleCollection).toContain('deck:role-a');
        return ['first-win', 'win-tsumo'];
      },
    );

    expect(committed.added).toBe(true);
    expect(committed.newlyUnlockedIds).toEqual(['first-win', 'win-tsumo']);
    expect(recordWrites).toBe(1);
    const loaded = store.load().records;
    expect(loaded.records).toHaveLength(1);
    expect(loaded.coins).toBe(120);
    expect(loaded.achievements).toEqual(['first-win', 'win-tsumo']);
  });

  it('処理済みmatchKeyはachievement resolverもwriteも再実行しない', () => {
    const map = new Map<string, string>();
    let recordWrites = 0;
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === RECORDS_STORAGE_KEY) {
          recordWrites += 1;
        }
        map.set(key, value);
      },
      removeItem: (key: string) => {
        map.delete(key);
      },
    };
    const store = createLocalStorageRecordsStore(storage);
    const key = 'session-a:tsumo:you';
    store.commitMatch(winningRecord(), key, 'deck:role-a', () => ['first-win']);

    let resolverCalled = false;
    const duplicate = store.commitMatch(winningRecord(), key, 'deck:role-a', () => {
      resolverCalled = true;
      return ['win-tsumo'];
    });

    expect(duplicate.added).toBe(false);
    expect(duplicate.newlyUnlockedIds).toEqual([]);
    expect(resolverCalled).toBe(false);
    expect(recordWrites).toBe(1);
    expect(store.load().records.coins).toBe(120);
  });

  it('storage write失敗時は記録だけ・実績だけの部分保存を残さない', () => {
    const storage = createMemoryStorage();
    const original = JSON.stringify({
      version: 1,
      coins: 10,
      records: [],
      roleCollection: [],
      achievements: [],
      totalMatches: 0,
      recentMatchKeys: [],
    });
    storage.setItem(RECORDS_STORAGE_KEY, original);
    const faultingStorage = {
      getItem: storage.getItem,
      setItem(key: string, value: string) {
        if (key === RECORDS_STORAGE_KEY) {
          throw new DOMException('quota', 'QuotaExceededError');
        }
        storage.setItem(key, value);
      },
      removeItem: storage.removeItem,
    };
    const store = createLocalStorageRecordsStore(faultingStorage);

    expect(() =>
      store.commitMatch(winningRecord(), 'session-b:tsumo:you', 'deck:role-a', () => [
        'first-win',
      ]),
    ).toThrow(StorageWriteError);
    expect(storage.getItem(RECORDS_STORAGE_KEY)).toBe(original);
  });
});
