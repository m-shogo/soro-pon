import { describe, expect, it } from 'vitest';
import starterRaw from '../../samples/animal-starter.deck.json';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { storedDecksPayloadSchema } from '../schemas/storageSchema';
import { createMemoryStorage } from './keyValueStorage';
import {
  createLocalStorageDeckStore,
  DECKS_BACKUP_KEY,
  DECKS_STORAGE_KEY,
} from './localStorageDeckStore';

function starterDeck(id: string, name: string) {
  return deckProjectSchema.parse({ ...starterRaw, id, name });
}

describe('duplicate persisted deck ID recovery', () => {
  it('公式sourceを更新日時より優先して1件へ正規化し、rawをbackupする', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 1,
      decks: [
        {
          deck: starterDeck('duplicate-id', '古いcreated'),
          source: 'created',
          updatedAtMs: 100,
        },
        {
          deck: starterDeck('duplicate-id', '新しいcreated'),
          source: 'created',
          updatedAtMs: 200,
        },
        {
          deck: starterDeck('duplicate-id', '公式優先'),
          source: 'official',
          updatedAtMs: 50,
        },
        {
          deck: starterDeck('independent', '独立デッキ'),
          source: 'created',
          updatedAtMs: 1,
        },
      ],
    });
    expect(storedDecksPayloadSchema.safeParse(JSON.parse(raw) as unknown).success).toBe(false);
    storage.setItem(DECKS_STORAGE_KEY, raw);

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toHaveLength(2);
    expect(result.decks.find((entry) => entry.deck.id === 'duplicate-id')?.deck.name).toBe(
      '公式優先',
    );
    expect(result.decks.find((entry) => entry.deck.id === 'independent')?.deck.name).toBe(
      '独立デッキ',
    );
    expect(result.issues[0]?.code).toBe('L9008');
    expect(storage.getItem(DECKS_BACKUP_KEY)).toBe(raw);

    const rewritten = JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? 'null') as unknown;
    expect(storedDecksPayloadSchema.safeParse(rewritten).success).toBe(true);
  });

  it('同sourceなら更新日時の新しいentryを残し、同時刻は元配列順で決める', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 1,
      decks: [
        {
          deck: starterDeck('newest-wins', '古い'),
          source: 'created',
          updatedAtMs: 10,
        },
        {
          deck: starterDeck('newest-wins', '新しい'),
          source: 'created',
          updatedAtMs: 20,
        },
        {
          deck: starterDeck('stable-tie', '先のentry'),
          source: 'imported',
          updatedAtMs: 30,
        },
        {
          deck: starterDeck('stable-tie', '後のentry'),
          source: 'imported',
          updatedAtMs: 30,
        },
      ],
    });
    storage.setItem(DECKS_STORAGE_KEY, raw);

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks.find((entry) => entry.deck.id === 'newest-wins')?.deck.name).toBe('新しい');
    expect(result.decks.find((entry) => entry.deck.id === 'stable-tie')?.deck.name).toBe('先のentry');
    expect(result.issues[0]?.code).toBe('L9008');
  });
});
