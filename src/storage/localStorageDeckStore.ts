import type { DeckProject, DeckSource } from '../domain/deck';
import type { ValidationIssue } from '../domain/validation';
import { migrateLegacyDeck } from '../engine/import/migrateLegacyDeck';
import { validateDeckEntityIds } from '../engine/validation/validateDeckEntityIds';
import { deckProjectSchema } from '../schemas/deckProjectSchema';
import {
  MAX_STORED_DECKS,
  storedDeckSchema,
  storedDecksPayloadSchema,
  type StoredDeck,
  type StoredDecksPayload,
} from '../schemas/storageSchema';
import { safeWrite, StorageWriteError, type KeyValueStorage } from './keyValueStorage';

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

type ReadPayloadResult = {
  payload: StoredDecksPayload;
  issues: ValidationIssue[];
  readFailureCause?: unknown;
};

type SalvageCandidate = {
  deck: StoredDeck;
  recovered: boolean;
  originalIndex: number;
};

function salvageDecks(
  rawDecks: unknown[],
  now: () => number,
): {
  decks: StoredDeck[];
  recoveredCount: number;
  droppedCount: number;
  overflowCount: number;
} {
  const candidates: SalvageCandidate[] = [];
  let droppedCount = 0;

  rawDecks.forEach((entry, originalIndex) => {
    const direct = storedDeckSchema.safeParse(entry);
    if (direct.success) {
      candidates.push({ deck: direct.data, recovered: false, originalIndex });
      return;
    }
    if (entry === null || typeof entry !== 'object') {
      droppedCount += 1;
      return;
    }
    const record = entry as Record<string, unknown>;
    const migrated = migrateLegacyDeck(record['deck']);
    if (!migrated.ok) {
      droppedCount += 1;
      return;
    }
    const deckParsed = deckProjectSchema.safeParse(migrated.migrated);
    const source = DECK_SOURCES.includes(record['source'] as DeckSource)
      ? (record['source'] as DeckSource)
      : 'created';
    const updatedAtMs =
      typeof record['updatedAtMs'] === 'number' && Number.isFinite(record['updatedAtMs'])
        ? (record['updatedAtMs'] as number)
        : now();
    if (deckParsed.success) {
      candidates.push({
        deck: { deck: deckParsed.data, source, updatedAtMs },
        recovered: true,
        originalIndex,
      });
    } else {
      droppedCount += 1;
    }
  });

  const overflowCount = Math.max(0, candidates.length - MAX_STORED_DECKS);
  const selected =
    overflowCount === 0
      ? candidates
      : [...candidates]
          .sort((a, b) => {
            const officialPriority =
              Number(b.deck.source === 'official') - Number(a.deck.source === 'official');
            if (officialPriority !== 0) {
              return officialPriority;
            }
            const updatedPriority = b.deck.updatedAtMs - a.deck.updatedAtMs;
            return updatedPriority !== 0 ? updatedPriority : a.originalIndex - b.originalIndex;
          })
          .slice(0, MAX_STORED_DECKS)
          .sort((a, b) => a.originalIndex - b.originalIndex);

  return {
    decks: selected.map((candidate) => candidate.deck),
    recoveredCount: selected.filter((candidate) => candidate.recovered).length,
    droppedCount,
    overflowCount,
  };
}

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

  const quarantineAndReset = (raw: string, message: string): ReadPayloadResult => {
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

  const readPayload = (): ReadPayloadResult => {
    let raw: string | null;
    try {
      raw = storage.getItem(DECKS_STORAGE_KEY);
    } catch (cause) {
      return {
        payload: EMPTY_PAYLOAD,
        readFailureCause: cause,
        issues: [
          {
            code: 'L9005',
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

    const { decks, recoveredCount, droppedCount, overflowCount } = salvageDecks(maybeDecks, now);
    if (decks.length === 0 && maybeDecks.length > 0) {
      return quarantineAndReset(
        raw,
        '保存データが壊れていたため初期化しました。壊れたデータは可能な限りバックアップに退避しています。',
      );
    }

    const backupSaved = tryBackup(raw);
    const backupSuffix = backupSaved
      ? ''
      : ' ただし、元データのバックアップは保存できませんでした。';
    const recoveredSuffix =
      recoveredCount > 0 ? ` うち${recoveredCount}件は旧形式から自動変換しました。` : '';
    const issues: ValidationIssue[] =
      droppedCount > 0
        ? [
            {
              code: 'L9003',
              severity: 'warning',
              message:
                `一部のデッキ保存データが壊れていたため、正常な${decks.length}件のみ復元しました。` +
                `${droppedCount}件は復旧できませんでした。` +
                (overflowCount > 0
                  ? `さらに保存上限を超えた${overflowCount}件はactive一覧から除外しました。`
                  : '') +
                recoveredSuffix +
                `元データは可能な限りバックアップに退避しています。${backupSuffix}`,
            },
          ]
        : overflowCount > 0
          ? [
              {
                code: 'L9007',
                severity: 'warning',
                message:
                  `デッキ保存数が上限${MAX_STORED_DECKS}件を超えていたため、公式デッキと更新日時の新しいデッキを優先して${decks.length}件へ正規化しました。` +
                  `${overflowCount}件はactive一覧から除外しました。${recoveredSuffix}` +
                  `元データは可能な限りバックアップに退避しています。${backupSuffix}`,
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

    try {
      storage.setItem(DECKS_STORAGE_KEY, JSON.stringify({ version: 1, decks }));
    } catch {
      // 次回loadで同じ救済を再試行する。
    }
    return { payload: { version: 1, decks }, issues };
  };

  const requireReadablePayload = (): StoredDecksPayload => {
    const result = readPayload();
    if (result.readFailureCause !== undefined) {
      throw new StorageWriteError(
        '保存済みデッキを読み込めないため、既存データを保護する目的で操作を中止しました。ブラウザの保存領域設定を確認してください。',
        result.readFailureCause,
      );
    }
    return result.payload;
  };

  const writePayload = (payload: StoredDecksPayload): void => {
    const parsed = storedDecksPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new StorageWriteError(
        'デッキの保存内容が内部契約を満たさないため、既存データを保護して保存を中止しました。',
        parsed.error,
      );
    }
    safeWrite(
      () => storage.setItem(DECKS_STORAGE_KEY, JSON.stringify(parsed.data)),
      '保存に失敗しました(空き容量が不足している可能性があります)。デッキの変更は保存されていません。',
    );
  };

  return {
    loadAll(): LoadDecksResult {
      const { payload, issues } = readPayload();
      return { decks: payload.decks, issues };
    },

    saveDeck(deck: DeckProject, source: DeckSource): void {
      const entityIdIssues = validateDeckEntityIds(deck);
      if (entityIdIssues.length > 0) {
        throw new StorageWriteError(
          entityIdIssues[0]?.message ??
            'デッキ内のIDが重複しているため、既存データを保護して保存を中止しました。',
          entityIdIssues,
        );
      }

      const payload = requireReadablePayload();
      const existing = payload.decks.some((stored) => stored.deck.id === deck.id);
      if (!existing && payload.decks.length >= MAX_STORED_DECKS) {
        throw new StorageWriteError(
          `保存できるデッキは最大${MAX_STORED_DECKS}件です。不要なデッキを削除してから、もう一度保存してください。`,
          new Error('deck storage entry limit reached'),
        );
      }

      const entry: StoredDeck = { deck, source, updatedAtMs: now() };
      const decks = existing
        ? payload.decks.map((stored) => (stored.deck.id === deck.id ? entry : stored))
        : [...payload.decks, entry];
      writePayload({ version: 1, decks });
    },

    removeDeck(deckId: string): void {
      const payload = requireReadablePayload();
      writePayload({
        version: 1,
        decks: payload.decks.filter((d) => d.deck.id !== deckId),
      });
    },

    exportDeck(deckId: string): string | null {
      const payload = requireReadablePayload();
      const entry = payload.decks.find((d) => d.deck.id === deckId);
      if (!entry) {
        return null;
      }
      return JSON.stringify(entry.deck, null, 2);
    },
  };
}
