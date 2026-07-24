import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from './keyValueStorage';
import {
  createLocalStorageRecordsStore,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';

const record = {
  dateMs: 1,
  deckId: 'deck',
  deckName: 'Deck',
  reason: 'draw' as const,
  winnerName: '',
  humanWon: false,
  coinsEarned: 10,
};

function storedPayload() {
  return {
    version: 1 as const,
    coins: 30,
    records: [],
    roleCollection: ['deck:r1', 'deck:r1', 'deck:r2'],
    achievements: ['a1', 'a1', 'a2'],
    totalMatches: 3,
    lastMatchKey: 'match-3',
    recentMatchKeys: ['match-2', 'match-3', 'match-2', 'match-1'],
  };
}

describe('set-like records collections', () => {
  it('role/achievement/recent keyの重複を順序維持で除く', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(storedPayload()));

    const loaded = createLocalStorageRecordsStore(storage).load().records;

    expect(loaded.roleCollection).toEqual(['deck:r1', 'deck:r2']);
    expect(loaded.achievements).toEqual(['a1', 'a2']);
    expect(loaded.recentMatchKeys).toEqual(['match-3', 'match-2', 'match-1']);
  });

  it('正規化後の長さで上限判定するため、重複が新規実績枠を消費しない', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(storedPayload()));
    const store = createLocalStorageRecordsStore(storage);

    const next = store.unlockAchievements(['a3']);

    expect(next.achievements).toEqual(['a1', 'a2', 'a3']);
  });

  it('totalMatchesが保存済み履歴件数より小さい場合は履歴件数まで下限補正する', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      RECORDS_STORAGE_KEY,
      JSON.stringify({
        ...storedPayload(),
        records: [record, { ...record, dateMs: 2 }],
        totalMatches: 0,
      }),
    );

    const loaded = createLocalStorageRecordsStore(storage).load().records;

    expect(loaded.totalMatches).toBe(2);
  });
});
