import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from './keyValueStorage';
import {
  createLocalStorageRecordsStore,
  RECORDS_BACKUP_KEY,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';

const validRecord = {
  dateMs: 100,
  deckId: 'deck-1',
  deckName: 'デッキ',
  reason: 'draw' as const,
  winnerName: '',
  humanWon: false,
  coinsEarned: 10,
};

describe('partial records salvage', () => {
  it('壊れた1履歴があってもコイン・実績・正常履歴を保持する', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 1,
      coins: 345,
      records: [validRecord, { totally: 'broken' }],
      roleCollection: ['deck-1:role-1'],
      achievements: ['achievement-1'],
      totalMatches: 8,
      lastMatchKey: 'match-8',
      recentMatchKeys: ['match-8', 'match-7'],
    });
    storage.setItem(RECORDS_STORAGE_KEY, raw);

    const result = createLocalStorageRecordsStore(storage).load();

    expect(result.records.coins).toBe(345);
    expect(result.records.records).toEqual([validRecord]);
    expect(result.records.roleCollection).toEqual(['deck-1:role-1']);
    expect(result.records.achievements).toEqual(['achievement-1']);
    expect(result.records.totalMatches).toBe(8);
    expect(result.issues[0]?.code).toBe('L9001');
    expect(result.issues[0]?.message).toContain('利用できる進捗を保持');
    expect(storage.getItem(RECORDS_BACKUP_KEY)).toBe(raw);
  });

  it('不正な数値だけを安全値へ戻し、他の進捗は保持する', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      RECORDS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        coins: Number.MAX_SAFE_INTEGER + 100,
        records: [validRecord],
        roleCollection: ['deck-1:role-1'],
        achievements: ['achievement-1'],
        totalMatches: -2,
      }),
    );

    const result = createLocalStorageRecordsStore(storage).load();

    expect(result.records.coins).toBe(0);
    expect(result.records.records).toEqual([validRecord]);
    expect(result.records.achievements).toEqual(['achievement-1']);
    expect(result.records.totalMatches).toBe(1);
  });

  it('未知versionは推測でsalvageせず従来どおりbackupして初期化する', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 99,
      coins: 345,
      records: [validRecord],
      roleCollection: [],
    });
    storage.setItem(RECORDS_STORAGE_KEY, raw);

    const result = createLocalStorageRecordsStore(storage).load();

    expect(result.records.coins).toBe(0);
    expect(result.records.records).toEqual([]);
    expect(result.issues[0]?.message).toContain('初期化');
    expect(storage.getItem(RECORDS_BACKUP_KEY)).toBe(raw);
    expect(storage.getItem(RECORDS_STORAGE_KEY)).toBeNull();
  });
});
