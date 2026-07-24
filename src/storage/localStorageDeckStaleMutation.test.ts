import { describe, expect, it } from 'vitest';
import starterRaw from '../../samples/animal-starter.deck.json';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import { StorageWriteError, createMemoryStorage } from './keyValueStorage';
import { createLocalStorageDeckStore, DECKS_STORAGE_KEY } from './localStorageDeckStore';

const baseDeck = deckProjectSchema.parse(starterRaw);

describe('stale deck mutation guard', () => {
  it('load後に外部変更されたdeckを古い画面から削除しない', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 10);
    store.saveDeck(baseDeck, 'created');
    store.loadAll();

    const external = {
      version: 1,
      decks: [
        {
          deck: { ...baseDeck, name: '別タブ更新' },
          source: 'created',
          updatedAtMs: 20,
        },
      ],
    };
    storage.setItem(DECKS_STORAGE_KEY, JSON.stringify(external));

    expect(() => store.removeDeck(baseDeck.id)).toThrow(StorageWriteError);
    expect(JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? 'null')).toEqual(external);
  });

  it('load後に外部変更されたdeckへ古い内容を上書きしない', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 10);
    store.saveDeck(baseDeck, 'created');
    store.loadAll();

    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          {
            deck: { ...baseDeck, name: '別タブ更新' },
            source: 'created',
            updatedAtMs: 20,
          },
        ],
      }),
    );

    expect(() => store.saveDeck({ ...baseDeck, name: '古い画面の保存' }, 'created')).toThrow(
      StorageWriteError,
    );
    const current = JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? 'null') as {
      decks: Array<{ deck: { name: string } }>;
    };
    expect(current.decks[0]?.deck.name).toBe('別タブ更新');
  });

  it('観測後に変更がなければ通常どおり削除できる', () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageDeckStore(storage, () => 10);
    store.saveDeck(baseDeck, 'created');
    store.loadAll();

    store.removeDeck(baseDeck.id);

    const current = JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? 'null') as {
      decks: unknown[];
    };
    expect(current.decks).toEqual([]);
  });
});
