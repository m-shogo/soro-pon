import type { DeckProject, DeckSource } from '../domain/deck';
import type { ValidationIssue } from '../domain/validation';
import {
  storedDecksPayloadSchema,
  type StoredDeck,
  type StoredDecksPayload,
} from '../schemas/storageSchema';
import type { KeyValueStorage } from './keyValueStorage';

export const DECKS_STORAGE_KEY = 'soro-pon.decks.v1';
export const DECKS_BACKUP_KEY = 'soro-pon.decks.v1.corrupt-backup';

export type LoadDecksResult = {
  decks: StoredDeck[];
  issues: ValidationIssue[];
};

export type DeckStore = {
  loadAll(): LoadDecksResult;
  saveDeck(deck: DeckProject, source: DeckSource): void;
  removeDeck(deckId: string): void;
  /** 共有JSON文字列。ローカルメタ(source/更新時刻/画像)は含まない。 */
  exportDeck(deckId: string): string | null;
};

const EMPTY_PAYLOAD: StoredDecksPayload = { version: 1, decks: [] };

// localStorageのdeck保管庫。読み込みは必ずZod strict parseを通し、
// 破損データはバックアップへ退避して空の状態から回復する(起動を止めない)。
export function createLocalStorageDeckStore(
  storage: KeyValueStorage,
  now: () => number = () => Date.now(),
): DeckStore {
  const readPayload = (): { payload: StoredDecksPayload; issues: ValidationIssue[] } => {
    const raw = storage.getItem(DECKS_STORAGE_KEY);
    if (raw === null) {
      return { payload: EMPTY_PAYLOAD, issues: [] };
    }
    try {
      const parsed = storedDecksPayloadSchema.safeParse(JSON.parse(raw) as unknown);
      if (parsed.success) {
        return { payload: parsed.data, issues: [] };
      }
    } catch {
      // JSONとして壊れている場合も下の回復処理へ
    }
    storage.setItem(DECKS_BACKUP_KEY, raw);
    storage.removeItem(DECKS_STORAGE_KEY);
    return {
      payload: EMPTY_PAYLOAD,
      issues: [
        {
          code: 'L9001',
          severity: 'warning',
          message:
            '保存データが壊れていたため初期化しました。壊れたデータはバックアップに退避しています。',
        },
      ],
    };
  };

  const writePayload = (payload: StoredDecksPayload): void => {
    storage.setItem(DECKS_STORAGE_KEY, JSON.stringify(payload));
  };

  return {
    loadAll(): LoadDecksResult {
      const { payload, issues } = readPayload();
      return { decks: payload.decks, issues };
    },

    saveDeck(deck: DeckProject, source: DeckSource): void {
      const { payload } = readPayload();
      const entry: StoredDeck = { deck, source, updatedAtMs: now() };
      const decks = payload.decks.some((d) => d.deck.id === deck.id)
        ? payload.decks.map((d) => (d.deck.id === deck.id ? entry : d))
        : [...payload.decks, entry];
      writePayload({ version: 1, decks });
    },

    removeDeck(deckId: string): void {
      const { payload } = readPayload();
      writePayload({
        version: 1,
        decks: payload.decks.filter((d) => d.deck.id !== deckId),
      });
    },

    exportDeck(deckId: string): string | null {
      const { payload } = readPayload();
      const entry = payload.decks.find((d) => d.deck.id === deckId);
      if (!entry) {
        return null;
      }
      // DeckProjectそのものだけを書き出す。ローカル状態は共有JSONに入れない。
      return JSON.stringify(entry.deck, null, 2);
    },
  };
}
