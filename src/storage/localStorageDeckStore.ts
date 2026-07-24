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

type RecoveryKind = 'none' | 'metadata' | 'migration';

type SalvageCandidate = {
  deck: StoredDeck;
  recoveryKind: RecoveryKind;
  originalIndex: number;
};

function preferredDuplicateCandidate(
  current: SalvageCandidate,
  candidate: SalvageCandidate,
): SalvageCandidate {
  if (candidate.deck.source !== current.deck.source) {
    if (candidate.deck.source === 'official') {
      return candidate;
    }
    if (current.deck.source === 'official') {
      return current;
    }
  }
  if (candidate.deck.updatedAtMs !== current.deck.updatedAtMs) {
    return candidate.deck.updatedAtMs > current.deck.updatedAtMs ? candidate : current;
  }
  return candidate.originalIndex < current.originalIndex ? candidate : current;
}

function normalizedSource(raw: unknown): DeckSource {
  return DECK_SOURCES.includes(raw as DeckSource) ? (raw as DeckSource) : 'created';
}

function normalizedUpdatedAt(raw: unknown, now: () => number): number {
  return typeof raw === 'number' && Number.isSafeInteger(raw) && raw >= 0 ? raw : now();
}

function salvageDecks(
  rawDecks: unknown[],
  now: () => number,
): {
  decks: StoredDeck[];
  metadataRecoveredCount: number;
  migratedCount: number;
  droppedCount: number;
  overflowCount: number;
  duplicateCount: number;
} {
  const candidates: SalvageCandidate[] = [];
  let droppedCount = 0;

  rawDecks.forEach((entry, originalIndex) => {
    const direct = storedDeckSchema.safeParse(entry);
    if (direct.success) {
      candidates.push({ deck: direct.data, recoveryKind: 'none', originalIndex });
      return;
    }
    if (entry === null || typeof entry !== 'object') {
      droppedCount += 1;
      return;
    }

    const record = entry as Record<string, unknown>;
    const source = normalizedSource(record['source']);
    const updatedAtMs = normalizedUpdatedAt(record['updatedAtMs'], now);

    // デッキ本体が現行schemaで正常なら、wrapper metadataだけを正規化して救う。
    // ここを飛ばしてlegacy migrationへ回すと、version 1の正常なユーザーデッキまで落ちる。
    const currentDeck = deckProjectSchema.safeParse(record['deck']);
    if (currentDeck.success) {
      candidates.push({
        deck: { deck: currentDeck.data, source, updatedAtMs },
        recoveryKind: 'metadata',
        originalIndex,
      });
      return;
    }

    const migrated = migrateLegacyDeck(record['deck']);
    if (!migrated.ok) {
      droppedCount += 1;
      return;
    }
    const migratedDeck = deckProjectSchema.safeParse(migrated.migrated);
    if (migratedDeck.success) {
      candidates.push({
        deck: { deck: migratedDeck.data, source, updatedAtMs },
        recoveryKind: 'migration',
        originalIndex,
      });
    } else {
      droppedCount += 1;
    }
  });

  const candidateByDeckId = new Map<string, SalvageCandidate>();
  let duplicateCount = 0;
  for (const candidate of candidates) {
    const deckId = candidate.deck.deck.id;
    const current = candidateByDeckId.get(deckId);
    if (current === undefined) {
      candidateByDeckId.set(deckId, candidate);
      continue;
    }
    duplicateCount += 1;
    candidateByDeckId.set(deckId, preferredDuplicateCandidate(current, candidate));
  }
  const uniqueCandidates = [...candidateByDeckId.values()].sort(
    (a, b) => a.originalIndex - b.originalIndex,
  );

  const overflowCount = Math.max(0, uniqueCandidates.length - MAX_STORED_DECKS);
  const selected =
    overflowCount === 0
      ? uniqueCandidates
      : [...uniqueCandidates]
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
    metadataRecoveredCount: selected.filter((candidate) => candidate.recoveryKind === 'metadata')
      .length,
    migratedCount: selected.filter((candidate) => candidate.recoveryKind === 'migration').length,
    droppedCount,
    overflowCount,
    duplicateCount,
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

    const {
      decks,
      metadataRecoveredCount,
      migratedCount,
      droppedCount,
      overflowCount,
      duplicateCount,
    } = salvageDecks(maybeDecks, now);
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
    const migratedSuffix =
      migratedCount > 0 ? ` うち${migratedCount}件は旧形式から自動変換しました。` : '';
    const metadataSuffix =
      metadataRecoveredCount > 0
        ? ` ${metadataRecoveredCount}件はデッキ本体を保持したまま保存メタデータを正規化しました。`
        : '';
    const duplicateSuffix =
      duplicateCount > 0
        ? ` 同じデッキIDの重複${duplicateCount}件は、公式デッキを優先し、同じsource内では更新日時の新しい内容を優先して1件へ統合しました。`
        : '';
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
                duplicateSuffix +
                metadataSuffix +
                migratedSuffix +
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
                  `${overflowCount}件はactive一覧から除外しました。${duplicateSuffix}${metadataSuffix}${migratedSuffix}` +
                  `元データは可能な限りバックアップに退避しています。${backupSuffix}`,
              },
            ]
          : duplicateCount > 0
            ? [
                {
                  code: 'L9008',
                  severity: 'warning',
                  message:
                    `保存データに同じデッキIDが複数あったため、${duplicateCount}件の重複を公式デッキ優先・同じsource内では更新日時優先で統合しました。` +
                    `${metadataSuffix}${migratedSuffix}元データは可能な限りバックアップに退避しています。${backupSuffix}`,
                },
              ]
            : metadataRecoveredCount > 0
              ? [
                  {
                    code: 'L9001',
                    severity: 'warning',
                    message:
                      `保存メタデータに問題があった${metadataRecoveredCount}件のデッキを、デッキ本体を保持したまま正規化しました。` +
                      `${migratedSuffix}元データは可能な限りバックアップに退避しています。${backupSuffix}`,
                  },
                ]
              : migratedCount > 0
                ? [
                    {
                      code: 'L9002',
                      severity: 'warning',
                      message: `${migratedCount}件のデッキを旧形式から自動変換しました。データは保持されています。${backupSuffix}`,
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
            'デッキ内のIDまたはmembershipが重複しているため、既存データを保護して保存を中止しました。',
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
