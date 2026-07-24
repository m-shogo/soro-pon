import type { DeckProject, DeckSource } from '../domain/deck';
import type { ValidationIssue } from '../domain/validation';
import { migrateLegacyDeck } from '../engine/import/migrateLegacyDeck';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import {
  storedDeckSchema,
  storedDecksPayloadSchema,
  type StoredDeck,
  type StoredDecksPayload,
} from '../schemas/storageSchema';
import { safeWrite, type KeyValueStorage } from './keyValueStorage';

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

const DECK_SOURCES: readonly DeckSource[] = ['official', 'created', 'imported'];

// 個々のdeck entryをできる限り復元する(Gate 6 migration/storage recovery)。
// 目的: outer payloadのstrict parseが1件の壊れた/旧schemaのdeckのせいで
// 失敗した場合、他の正常なdeckまで巻き添えで全消去しない。
// - 通常のstoredDeckSchemaでparseできればそのまま採用
// - deck本体だけmigrateLegacyDeck(version 0 -> 現行)で救えるなら救う
//   (import経路と同じ決定的migrationを再利用する。新しいmigration
//   frameworkは導入しない)
// - それでも壊れているentryは個別に捨てる(全体は道連れにしない)
function salvageDecks(rawDecks: unknown[]): { decks: StoredDeck[]; recoveredCount: number; droppedCount: number } {
  const decks: StoredDeck[] = [];
  let droppedCount = 0;
  let recoveredCount = 0;

  for (const entry of rawDecks) {
    const direct = storedDeckSchema.safeParse(entry);
    if (direct.success) {
      decks.push(direct.data);
      continue;
    }
    if (entry === null || typeof entry !== 'object') {
      droppedCount += 1;
      continue;
    }
    const record = entry as Record<string, unknown>;
    const migrated = migrateLegacyDeck(record['deck']);
    if (!migrated.ok) {
      droppedCount += 1;
      continue;
    }
    const deckParsed = deckProjectSchema.safeParse(migrated.migrated);
    const source = DECK_SOURCES.includes(record['source'] as DeckSource)
      ? (record['source'] as DeckSource)
      : 'created';
    const updatedAtMs =
      typeof record['updatedAtMs'] === 'number' && Number.isFinite(record['updatedAtMs'])
        ? (record['updatedAtMs'] as number)
        : Date.now();
    if (deckParsed.success) {
      decks.push({ deck: deckParsed.data, source, updatedAtMs });
      recoveredCount += 1;
    } else {
      droppedCount += 1;
    }
  }

  return { decks, recoveredCount, droppedCount };
}

// localStorageのdeck保管庫。読み込みは必ずZod strict parseを通し、
// 破損データは可能な限りバックアップへ退避して空の状態から回復する。
// localStorage自体が読み書きを拒否しても、回復処理を例外停止させない。
export function createLocalStorageDeckStore(
  storage: KeyValueStorage,
  now: () => number = () => Date.now(),
): DeckStore {
  const tryBackup = (raw: string): boolean => {
    try {
      storage.setItem(DECKS_BACKUP_KEY, raw);
      return true;
    } catch {
      return false;
    }
  };

  const tryRemoveActive = (): boolean => {
    try {
      storage.removeItem(DECKS_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  };

  const recoveryFailureSuffix = (backupSaved: boolean, activeRemoved: boolean): string => {
    const failures: string[] = [];
    if (!backupSaved) {
      failures.push('バックアップを保存できませんでした');
    }
    if (!activeRemoved) {
      failures.push('壊れた保存データを削除できませんでした');
    }
    return failures.length > 0 ? ` ただし、${failures.join('。')}。` : '';
  };

  const quarantineAndReset = (raw: string, message: string): { payload: StoredDecksPayload; issues: ValidationIssue[] } => {
    const backupSaved = tryBackup(raw);
    const activeRemoved = tryRemoveActive();
    return {
      payload: EMPTY_PAYLOAD,
      issues: [
        {
          code: 'L9001',
          severity: 'warning',
          message: `${message}${recoveryFailureSuffix(backupSaved, activeRemoved)}`,
        },
      ],
    };
  };

  const readPayload = (): { payload: StoredDecksPayload; issues: ValidationIssue[] } => {
    let raw: string | null;
    try {
      raw = storage.getItem(DECKS_STORAGE_KEY);
    } catch {
      return {
        payload: EMPTY_PAYLOAD,
        issues: [
          {
            code: 'L9004',
            severity: 'warning',
            message:
              'ブラウザの保存領域を読み込めないため、デッキを一時的な空の状態で開きました。再読み込みやブラウザ設定の確認後も続く場合、保存機能は利用できません。',
          },
        ],
      };
    }
    if (raw === null) {
      return { payload: EMPTY_PAYLOAD, issues: [] };
    }
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return quarantineAndReset(
        raw,
        '保存データが壊れていたため初期化しました。壊れたデータは可能な限りバックアップに退避しています。',
      );
    }
    const parsed = storedDecksPayloadSchema.safeParse(json);
    if (parsed.success) {
      return { payload: parsed.data, issues: [] };
    }
    // outer shapeがstrict parseを通らなかった場合でも、
    // decks配列自体が存在するなら1件ずつ救済を試みる。
    const maybeDecks =
      json !== null && typeof json === 'object' && Array.isArray((json as Record<string, unknown>)['decks'])
        ? ((json as Record<string, unknown>)['decks'] as unknown[])
        : null;
    if (maybeDecks === null) {
      return quarantineAndReset(
        raw,
        '保存データが壊れていたため初期化しました。壊れたデータは可能な限りバックアップに退避しています。',
      );
    }
    const { decks, recoveredCount, droppedCount } = salvageDecks(maybeDecks);
    if (decks.length === 0 && maybeDecks.length > 0) {
      // 何も救えなかった場合は従来通りの全消去メッセージにする
      return quarantineAndReset(
        raw,
        '保存データが壊れていたため初期化しました。壊れたデータは可能な限りバックアップに退避しています。',
      );
    }

    const backupSaved = tryBackup(raw);
    // outer payload自体はstrict parseを通らなかった(未知フィールド/不正な
    // versionなど)ため、無警告で黙って正規化はしない — 何が起きたかを常に
    // 可視化する。3パターンに分ける:
    // - droppedCount > 0: 実際にdeck entryを失った(L9003)
    // - droppedCount === 0 かつ recoveredCount > 0: 旧形式からの自動変換の
    //   みで、データは失っていない(L9002)
    // - それ以外: outer shapeのみの問題で、deck自体は無事(L9001、既存の
    //   L9001系呼び出し元/テストとの互換を保つ)
    const backupSuffix = backupSaved ? '' : ' ただし、元データのバックアップは保存できませんでした。';
    const issues: ValidationIssue[] =
      droppedCount > 0
        ? [
            {
              code: 'L9003',
              severity: 'warning',
              message:
                `一部のデッキ保存データが壊れていたため、正常な${decks.length}件のみ復元しました` +
                (recoveredCount > 0 ? `(うち${recoveredCount}件は旧形式から自動変換)` : '') +
                `。壊れたデータは可能な限りバックアップに退避しています。${backupSuffix}`,
            },
          ]
        : recoveredCount > 0
          ? [
              {
                code: 'L9002',
                severity: 'warning',
                message: `${recoveredCount}件のデッキを旧形式から自動変換しました。データは保持されています。${backupSuffix}`,
              },
            ]
          : [
              {
                code: 'L9001',
                severity: 'warning',
                message:
                  `保存データの形式に問題があったため正規化しました(デッキの内容は保持されています)。元データは可能な限りバックアップに退避しています。${backupSuffix}`,
              },
            ];
    // 救済結果を書き戻す(ベストエフォート)。失敗しても今回の読み込み結果は
    // そのまま返す — 次回起動時に同じ救済処理を再実行するだけなので安全。
    try {
      storage.setItem(DECKS_STORAGE_KEY, JSON.stringify({ version: 1, decks }));
    } catch {
      // quotaなどで書き戻せなくても、今回のin-memory復元結果は利用できる。
    }
    return { payload: { version: 1, decks }, issues };
  };

  const writePayload = (payload: StoredDecksPayload): void => {
    safeWrite(
      () => storage.setItem(DECKS_STORAGE_KEY, JSON.stringify(payload)),
      '保存に失敗しました(空き容量が不足している可能性があります)。デッキの変更は保存されていません。',
    );
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
