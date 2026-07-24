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

function deck(name: string) {
  return deckProjectSchema.parse({ ...starterRaw, name });
}

describe('persisted duplicate deck IDs', () => {
  it('strict payload schemaは同じdeck IDの複数entryを拒否する', () => {
    const first = { deck: deck('古い内容'), source: 'created' as const, updatedAtMs: 10 };
    const second = { deck: deck('新しい内容'), source: 'imported' as const, updatedAtMs: 20 };

    expect(storedDecksPayloadSchema.safeParse({ version: 1, decks: [first, second] }).success).toBe(
      false,
    );
  });

  it('既存の重複payloadは原文を退避し、更新日時の新しい1件へ統合する', () => {
    const storage = createMemoryStorage();
    const raw = JSON.stringify({
      version: 1,
      decks: [
        { deck: deck('古い内容'), source: 'created', updatedAtMs: 10 },
        { deck: deck('新しい内容'), source: 'imported', updatedAtMs: 20 },
      ],
    });
    storage.setItem(DECKS_STORAGE_KEY, raw);

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toHaveLength(1);
    expect(result.decks[0]?.deck.name).toBe('新しい内容');
    expect(result.issues.some((issue) => issue.code === 'L9008')).toBe(true);
    expect(storage.getItem(DECKS_BACKUP_KEY)).toBe(raw);

    const rewritten = JSON.parse(storage.getItem(DECKS_STORAGE_KEY) ?? '{}') as {
      decks?: unknown[];
    };
    expect(rewritten.decks).toHaveLength(1);
  });

  it('更新日時が同じ場合は公式entryを優先する', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      DECKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decks: [
          { deck: deck('ユーザー内容'), source: 'created', updatedAtMs: 10 },
          { deck: deck('公式内容'), source: 'official', updatedAtMs: 10 },
        ],
      }),
    );

    const result = createLocalStorageDeckStore(storage).loadAll();

    expect(result.decks).toHaveLength(1);
    expect(result.decks[0]?.deck.name).toBe('公式内容');
    expect(result.decks[0]?.source).toBe('official');
  });
});
