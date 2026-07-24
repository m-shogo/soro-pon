import { describe, expect, it } from 'vitest';
import starterRaw from '../../samples/animal-starter.deck.json';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { StorageWriteError } from './keyValueStorage';
import {
  createLocalStorageDeckStore,
  DECKS_BACKUP_KEY,
  DECKS_STORAGE_KEY,
} from './localStorageDeckStore';
import {
  buildMatchRecord,
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

function starterDeck() {
  return deckProjectSchema.parse(starterRaw);
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

  it('deck storageのgetItem自体が拒否されてもL9005と空payloadへ落とす', () => {
    const storage = createFaultingStorage({}, { get: true });
    const result = createLocalStorageDeckStore(storage).loadAll();
    expect(result.decks).toEqual([]);
    expect(result.issues[0]?.code).toBe('L9005');
    expect(result.issues[0]?.message).toContain('保存領域を読み込めない');
  });

  it('deck storageを読めない時はsave/removeを空payload基準で実行せず既存rawを保護する', () => {
    const original = '{"unknown":"existing data"}';
    const storage = createFaultingStorage({ [DECKS_STORAGE_KEY]: original }, { get: true });
    const store = createLocalStorageDeckStore(storage);
    expect(() => store.saveDeck(starterDeck(), 'created')).toThrow(StorageWriteError);
    expect(() => store.removeDeck('official-animal-starter')).toThrow(StorageWriteError);
    expect(storage.peek(DECKS_STORAGE_KEY)).toBe(original);
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
    const storage = createFaultingStorage(
      { [RECORDS_STORAGE_KEY]: 'null' },
      { set: true, remove: true },
    );
    const result = createLocalStorageRecordsStore(storage).load();
    expect(result.records.records).toEqual([]);
    expect(result.issues[0]?.message).toContain('バックアップを保存できませんでした');
    expect(result.issues[0]?.message).toContain('壊れた記録を削除できませんでした');
  });

  it('records storageを読めない時はrecord/achievementを空状態で上書きしない', () => {
    const original = '{"unknown":"existing records"}';
    const storage = createFaultingStorage({ [RECORDS_STORAGE_KEY]: original }, { get: true });
    const store = createLocalStorageRecordsStore(storage);
    const record = buildMatchRecord({
      dateMs: 1,
      deckId: 'deck',
      deckName: 'Deck',
      reason: 'draw',
      winnerName: '',
      humanWon: false,
    });
    expect(() => store.addRecord(record, 'session:draw:draw')).toThrow(StorageWriteError);
    expect(() => store.unlockAchievements(['draw-round'])).toThrow(StorageWriteError);
    expect(storage.peek(RECORDS_STORAGE_KEY)).toBe(original);
  });

  it('settings storageのgetItem自体が拒否されてもL9005とdefaultへ落とす', () => {
    const storage = createFaultingStorage({}, { get: true });
    const result = createLocalStorageSettingsStore(storage).load();
    expect(result.settings.insightMode).toBe('normal');
    expect(result.issues[0]?.code).toBe('L9005');
    expect(storage.peek(SETTINGS_BACKUP_KEY)).toBeNull();
    expect(storage.peek(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('settings storageを読めない時はdefault値で既存rawを上書きしない', () => {
    const original = '{"unknown":"existing settings"}';
    const storage = createFaultingStorage({ [SETTINGS_STORAGE_KEY]: original }, { get: true });
    const store = createLocalStorageSettingsStore(storage);
    expect(() =>
      store.save({ version: 1, insightMode: 'advanced', preferredPlayerCount: 4 }),
    ).toThrow(StorageWriteError);
    expect(storage.peek(SETTINGS_STORAGE_KEY)).toBe(original);
  });
});
