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

  it('保存上限より前に重複を除去し、配列後方の一意な値を失わない', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      RECORDS_STORAGE_KEY,
      JSON.stringify({
        ...storedPayload(),
        roleCollection: [...Array.from({ length: 501 }, () => 'deck:duplicate'), 'deck:after-cap'],
        achievements: [...Array.from({ length: 101 }, () => 'a-duplicate'), 'a-after-cap'],
        recentMatchKeys: [...Array.from({ length: 21 }, () => 'match-duplicate'), 'match-after-cap'],
      }),
    );

    const loaded = createLocalStorageRecordsStore(storage).load();

    expect(loaded.records.roleCollection).toEqual(['deck:duplicate', 'deck:after-cap']);
    expect(loaded.records.achievements).toEqual(['a-duplicate', 'a-after-cap']);
    // normalizeRecordsPayload prepends lastMatchKey ('match-3' from storedPayload)
    // to recentMatchKeys by design, so the deduped ['match-duplicate',
    // 'match-after-cap'] is preceded by 'match-3'. The dedupe-before-cap intent
    // still holds: the 21 duplicates collapse to one and the trailing unique
    // 'match-after-cap' survives.
    expect(loaded.records.recentMatchKeys).toEqual([
      'match-3',
      'match-duplicate',
      'match-after-cap',
    ]);
    expect(loaded.issues.some((issue) => issue.code === 'L9007')).toBe(true);
  });
});
