import { describe, expect, it } from 'vitest';
import starterRaw from '../../samples/animal-starter.deck.json';
import type { DeckProject } from '../domain/deck';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import type { MatchRecord, SettingsPayload } from '../schemas/storageSchema';
import { StorageWriteError, createMemoryStorage } from './keyValueStorage';
import { createLocalStorageDeckStore, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import {
  buildMatchRecord,
  createLocalStorageRecordsStore,
  RECORDS_STORAGE_KEY,
} from './localStorageRecordsStore';
import { createLocalStorageSettingsStore, SETTINGS_STORAGE_KEY } from './localStorageSettingsStore';

function starterDeck(): DeckProject {
  return deckProjectSchema.parse(starterRaw);
}

describe('storage write boundary schema enforcement', () => {
  it('schema外deckを保存せず、既存payloadを保持する', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 1);
    store.saveDeck(starterDeck(), 'official');
    const original = storage.getItem(DECKS_STORAGE_KEY);
    const invalid = { ...starterDeck(), id: '' } as DeckProject;

    expect(() => store.saveDeck(invalid, 'created')).toThrow(StorageWriteError);
    expect(storage.getItem(DECKS_STORAGE_KEY)).toBe(original);
  });

  it('nested role IDが重複するdeckをStore直呼びでも保存しない', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 1);
    const originalDeck = starterDeck();
    store.saveDeck(originalDeck, 'official');
    const original = storage.getItem(DECKS_STORAGE_KEY);
    const invalid = structuredClone(originalDeck);
    invalid.variants[0]!.winRoles[1]!.id = invalid.variants[0]!.winRoles[0]!.id;

    expect(() => store.saveDeck(invalid, 'created')).toThrow(StorageWriteError);
    expect(storage.getItem(DECKS_STORAGE_KEY)).toBe(original);
  });

  it('schema外match recordを保存せず、既存recordsを保持する', () => {
    const storage = createMemoryStorage();
    const original = JSON.stringify({
      version: 1,
      coins: 0,
      records: [],
      roleCollection: [],
      achievements: [],
      totalMatches: 0,
      recentMatchKeys: [],
    });
    storage.setItem(RECORDS_STORAGE_KEY, original);
    const store = createLocalStorageRecordsStore(storage);
    const invalid = {
      ...buildMatchRecord({
        dateMs: 1,
        deckId: 'deck',
        deckName: 'Deck',
        reason: 'draw',
        winnerName: '',
        humanWon: false,
      }),
      coinsEarned: -1,
    } as MatchRecord;

    expect(() => store.addRecord(invalid, 'invalid-record')).toThrow(StorageWriteError);
    expect(storage.getItem(RECORDS_STORAGE_KEY)).toBe(original);
  });

  it('schema外settingsを保存せず、既存設定を保持する', () => {
    const storage = createMemoryStorage();
    const original = JSON.stringify({
      version: 1,
      insightMode: 'normal',
      preferredPlayerCount: 3,
    });
    storage.setItem(SETTINGS_STORAGE_KEY, original);
    const store = createLocalStorageSettingsStore(storage);
    const invalid = {
      version: 1,
      insightMode: 'normal',
      preferredPlayerCount: 2,
    } as unknown as SettingsPayload;

    expect(() => store.save(invalid)).toThrow(StorageWriteError);
    expect(storage.getItem(SETTINGS_STORAGE_KEY)).toBe(original);
  });
});
