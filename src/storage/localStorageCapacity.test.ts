import { describe, expect, it } from 'vitest';
import starterRaw from '../../samples/animal-starter.deck.json';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import {
  MAX_ROLE_COLLECTION_ENTRIES,
  MAX_STORED_DECKS,
  recordsPayloadSchema,
  storedDecksPayloadSchema,
} from '../schemas/storageSchema';
import { StorageWriteError, createMemoryStorage } from './keyValueStorage';
import { createLocalStorageDeckStore, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import {
  buildMatchRecord,
  createLocalStorageRecordsStore,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';

function starterDeck(id: string) {
  return deckProjectSchema.parse({ ...starterRaw, id });
}

describe('localStorage persisted collection boundaries', () => {
  it('最大件数のdeck payloadへ新規追加せず、既存rawを保持する', () => {
    const storage = createMemoryStorage();
    const payload = {
      version: 1 as const,
      decks: Array.from({ length: MAX_STORED_DECKS }, (_, index) => ({
        deck: starterDeck(`stored-${index}`),
        source: 'created' as const,
        updatedAtMs: index,
      })),
    };
    const raw = JSON.stringify(payload);
    expect(storedDecksPayloadSchema.safeParse(payload).success).toBe(true);
    storage.setItem(DECKS_STORAGE_KEY, raw);

    const store = createLocalStorageDeckStore(storage, () => 9999);
    expect(() => store.saveDeck(starterDeck('overflow'), 'created')).toThrow(StorageWriteError);
    expect(storage.getItem(DECKS_STORAGE_KEY)).toBe(raw);
    expect(store.loadAll().decks).toHaveLength(MAX_STORED_DECKS);
  });

  it('最大件数でも既存deckの更新は許可し、件数を増やさない', () => {
    const storage = createMemoryStorage();
    const payload = {
      version: 1 as const,
      decks: Array.from({ length: MAX_STORED_DECKS }, (_, index) => ({
        deck: starterDeck(`stored-${index}`),
        source: 'created' as const,
        updatedAtMs: index,
      })),
    };
    storage.setItem(DECKS_STORAGE_KEY, JSON.stringify(payload));

    const store = createLocalStorageDeckStore(storage, () => 9999);
    store.saveDeck({ ...starterDeck('stored-0'), name: '更新済み' }, 'created');

    const loaded = store.loadAll().decks;
    expect(loaded).toHaveLength(MAX_STORED_DECKS);
    expect(loaded.find((entry) => entry.deck.id === 'stored-0')?.deck.name).toBe('更新済み');
    expect(loaded.find((entry) => entry.deck.id === 'stored-0')?.updatedAtMs).toBe(9999);
  });

  it('役コレクション上限後も対局とコインは保存し、新しい役キーだけ追加しない', () => {
    const storage = createMemoryStorage();
    const initial = {
      version: 1 as const,
      coins: 0,
      records: [],
      roleCollection: Array.from(
        { length: MAX_ROLE_COLLECTION_ENTRIES },
        (_, index) => `deck:role-${index}`,
      ),
      achievements: [],
      totalMatches: 0,
      recentMatchKeys: [],
    };
    expect(recordsPayloadSchema.safeParse(initial).success).toBe(true);
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(initial));

    const store = createLocalStorageRecordsStore(storage);
    const committed = store.commitMatch(
      buildMatchRecord({
        dateMs: 1,
        deckId: 'deck',
        deckName: 'Deck',
        reason: 'tsumo',
        winnerName: 'あなた',
        humanWon: true,
        selectedWinRoleId: 'new-role',
        selectedWinRoleName: '新しい役',
        totalPoints: 80,
      }),
      'session-cap:tsumo:you',
      'deck:new-role',
      () => ['first-win'],
    );

    expect(committed.added).toBe(true);
    expect(committed.roleCollectionLimitReached).toBe(true);
    expect(committed.records.roleCollection).toHaveLength(MAX_ROLE_COLLECTION_ENTRIES);
    expect(committed.records.roleCollection).not.toContain('deck:new-role');
    expect(committed.records.records).toHaveLength(1);
    expect(committed.records.coins).toBe(80);
    expect(committed.records.achievements).toContain('first-win');
    expect(recordsPayloadSchema.safeParse(committed.records).success).toBe(true);
  });
});
