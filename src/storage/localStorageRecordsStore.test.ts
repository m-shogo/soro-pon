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
    const next = store.addRecord(
      record,
      'deck:seed1:tsumo:you',
      'official-animal-starter:win_mammal_three_groups',
    );
    expect(next.coins).toBe(120);
    expect(next.records).toHaveLength(1);
    expect(next.roleCollection).toContain('official-animal-starter:win_mammal_three_groups');
    expect(next.totalMatches).toBe(1);
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

  it('記録は100件でtruncateされる(matchKeyは毎回変える)', () => {
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
        `deck:seed${i}:draw:draw`,
      );
    }
    const { records: loaded } = store.load();
    expect(loaded.records).toHaveLength(100);
    expect(loaded.totalMatches).toBe(105);
  });

  describe('冪等性: 同じmatchKeyは二重加算しない', () => {
    it('同じmatchKeyでの連続addRecordはコイン/records/totalMatchesを増やさない', () => {
      const storage = createMemoryStorage();
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1000,
        deckId: 'd',
        deckName: 'D',
        reason: 'tsumo',
        winnerName: 'あなた',
        humanWon: true,
        selectedWinRoleId: 'roleA',
        totalPoints: 80,
      });
      const key = 'd:normal:42:tsumo:you';
      const first = store.addRecord(record, key, 'd:roleA');
      const second = store.addRecord(record, key, 'd:roleA');
      const third = store.addRecord(record, key, 'd:roleA');

      expect(first.coins).toBe(80);
      expect(second.coins).toBe(80);
      expect(third.coins).toBe(80);
      expect(second.records).toHaveLength(1);
      expect(third.records).toHaveLength(1);
      expect(second.totalMatches).toBe(1);
      expect(third.totalMatches).toBe(1);
      expect(second.roleCollection).toEqual(first.roleCollection);
      // 参照ではなく永続化された値としても二重加算されていない
      expect(store.load().records.coins).toBe(80);
    });

    it('異なるmatchKeyなら正しく積み上がる', () => {
      const storage = createMemoryStorage();
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'ron',
        winnerName: 'あなた',
        humanWon: true,
        totalPoints: 50,
      });
      store.addRecord(record, 'd:normal:1:ron:you');
      const after = store.addRecord(record, 'd:normal:2:ron:you');
      expect(after.coins).toBe(100);
      expect(after.records).toHaveLength(2);
      expect(after.totalMatches).toBe(2);
    });

    it('unlockAchievementsを挟んでも直後のmatchKey重複判定は保たれる', () => {
      const storage = createMemoryStorage();
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'tsumo',
        winnerName: 'あなた',
        humanWon: true,
        totalPoints: 60,
      });
      const key = 'd:normal:7:tsumo:you';
      store.addRecord(record, key);
      store.unlockAchievements(['first-win']);
      const again = store.addRecord(record, key);
      expect(again.coins).toBe(60);
      expect(again.records).toHaveLength(1);
      expect(again.achievements).toContain('first-win');
    });
  });

  describe('P2-4: recentMatchKeysによる冪等性', () => {
    it('直近1件でなくても処理済みmatchKeyはno-opになる', () => {
      const storage = createMemoryStorage();
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'draw',
        winnerName: '',
        humanWon: false,
      });
      store.addRecord(record, 'session-a:draw:draw');
      store.addRecord(record, 'session-b:draw:draw');
      // session-aは直近ではないが処理済み -> 二重加算しない
      const after = store.addRecord(record, 'session-a:draw:draw');
      expect(after.totalMatches).toBe(2);
      expect(after.coins).toBe(20);
      expect(after.recentMatchKeys).toEqual(['session-b:draw:draw', 'session-a:draw:draw']);
    });

    it('recentMatchKeysは20件でtruncateされる', () => {
      const storage = createMemoryStorage();
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'draw',
        winnerName: '',
        humanWon: false,
      });
      for (let i = 0; i < 25; i += 1) {
        store.addRecord(record, `session-${i}:draw:draw`);
      }
      const { records } = store.load();
      expect(records.recentMatchKeys).toHaveLength(20);
      expect(records.recentMatchKeys?.[0]).toBe('session-24:draw:draw');
    });

    it('lastMatchKeyのみの旧payloadはrecentMatchKeysへ移行される', () => {
      const storage = createMemoryStorage();
      storage.setItem(
        RECORDS_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          coins: 10,
          records: [],
          roleCollection: [],
          lastMatchKey: 'old-key',
        }),
      );
      const store = createLocalStorageRecordsStore(storage);
      expect(store.load().records.recentMatchKeys).toEqual(['old-key']);
      // 移行後もold-keyはno-op
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'draw',
        winnerName: '',
        humanWon: false,
      });
      expect(store.addRecord(record, 'old-key').coins).toBe(10);
    });
  });

  describe('旧データの正規化', () => {
    it('achievements/totalMatchesを含まない旧payloadは読み込み時に具体値へ正規化される', () => {
      const storage = createMemoryStorage();
      storage.setItem(
        RECORDS_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          coins: 30,
          records: [
            {
              dateMs: 1,
              deckId: 'd',
              deckName: 'D',
              reason: 'draw',
              winnerName: '',
              humanWon: false,
              coinsEarned: 10,
            },
          ],
          roleCollection: [],
        }),
      );
      const store = createLocalStorageRecordsStore(storage);
      const { records, issues } = store.load();
      expect(issues).toEqual([]);
      expect(records.achievements).toEqual([]);
      expect(records.totalMatches).toBe(1);
      expect(records.coins).toBe(30);
    });

    it('正規化後にaddRecordしても壊れず積み上がる', () => {
      const storage = createMemoryStorage();
      storage.setItem(
        RECORDS_STORAGE_KEY,
        JSON.stringify({ version: 1, coins: 0, records: [], roleCollection: [] }),
      );
      const store = createLocalStorageRecordsStore(storage);
      const record = buildMatchRecord({
        dateMs: 1,
        deckId: 'd',
        deckName: 'D',
        reason: 'tsumo',
        winnerName: 'あなた',
        humanWon: true,
        totalPoints: 40,
      });
      const next = store.addRecord(record, 'd:normal:1:tsumo:you');
      expect(next.totalMatches).toBe(1);
      expect(next.coins).toBe(40);
    });
  });
});
