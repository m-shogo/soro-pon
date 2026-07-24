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

const validDeck = deckProjectSchema.parse(starterRaw);

describe('deck wrapper metadata salvage', () => {
  it('現行deck本体が正常ならsource/updatedAt破損だけで捨てない', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 1,
      decks: [
        {
          deck: validDeck,
          source: 'unknown-source',
          updatedAtMs: 'broken-time',
          unexpected: true,
        },
      ],
    });
    storage.setItem(DECKS_STORAGE_KEY, raw);

    const result = createLocalStorageDeckStore(storage, () => 12345).loadAll();

    expect(result.decks).toHaveLength(1);
    expect(result.decks[0]?.deck.id).toBe(validDeck.id);
    expect(result.decks[0]?.source).toBe('created');
    expect(result.decks[0]?.updatedAtMs).toBe(12345);
    expect(result.issues[0]?.code).toBe('L9001');
    expect(result.issues[0]?.message).toContain('デッキ本体を保持');
    expect(storage.getItem(DECKS_BACKUP_KEY)).toBe(raw);
  });

  it('正規化後payloadはstrict schemaを通り、次回loadでは警告を再発しない', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [{ deck: validDeck, source: null, updatedAtMs: -1 }],
      }),
    );
    const store = createLocalStorageDeckStore(storage, () => 777);

    const first = store.loadAll();
    const rewritten = JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? 'null') as unknown;
    const second = store.loadAll();

    expect(first.decks).toHaveLength(1);
    expect(storedDecksPayloadSchema.safeParse(rewritten).success).toBe(true);
    expect(second.decks).toHaveLength(1);
    expect(second.issues).toEqual([]);
  });
});
