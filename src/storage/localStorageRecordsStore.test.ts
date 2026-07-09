import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from './keyValueStorage';
import {
  buildMatchRecord,
  createLocalStorageRecordsStore,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';

describe('localStorageRecordsStore', () => {
  it('勝利記録でコインとrole collectionが増える', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageRecordsStore(storage);
    const record = buildMatchRecord({
      dateMs: 1000,
      deckId: 'official-animal-starter',
      deckName: '動物スターター',
      reason: 'tsumo',
      winnerName: 'あなた',
      humanWon: true,
      selectedWinRoleId: 'win_mammal_three_groups',
      selectedWinRoleName: 'どうぶつ王国',
      totalPoints: 120,
    });
    const next = store.addRecord(record, 'official-animal-starter:win_mammal_three_groups');
    expect(next.coins).toBe(120);
    expect(next.records).toHaveLength(1);
    expect(next.roleCollection).toContain('official-animal-starter:win_mammal_three_groups');
    // roundtrip
    expect(store.load().records.coins).toBe(120);
  });

  it('獲得コインは500でcapされ、流局/敗北は参加報酬10', () => {
    const win = buildMatchRecord({
      dateMs: 1,
      deckId: 'd',
      deckName: 'D',
      reason: 'ron',
      winnerName: 'あなた',
      humanWon: true,
      totalPoints: 900,
    });
    expect(win.coinsEarned).toBe(500);
    const draw = buildMatchRecord({
      dateMs: 2,
      deckId: 'd',
      deckName: 'D',
      reason: 'draw',
      winnerName: '',
      humanWon: false,
    });
    expect(draw.coinsEarned).toBe(10);
  });

  it('壊れた記録はL9001で初期化して回復する', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, '{broken');
    const store = createLocalStorageRecordsStore(storage);
    const { records, issues } = store.load();
    expect(records.coins).toBe(0);
    expect(issues.some((i) => i.code === 'L9001')).toBe(true);
  });

  it('記録は100件でtruncateされる', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageRecordsStore(storage);
    for (let i = 0; i < 105; i++) {
      store.addRecord(
        buildMatchRecord({
          dateMs: i,
          deckId: 'd',
          deckName: 'D',
          reason: 'draw',
          winnerName: '',
          humanWon: false,
        }),
      );
    }
    expect(store.load().records.records).toHaveLength(100);
  });
});
