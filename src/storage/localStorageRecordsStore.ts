import type { ValidationIssue } from '../domain/validation';
import {
  EMPTY_RECORDS,
  MAX_RECENT_MATCH_KEYS,
  MAX_ROLE_COLLECTION_ENTRIES,
  MAX_STORED_ACHIEVEMENTS,
  MAX_STORED_MATCH_RECORDS,
  normalizeRecordsPayload,
  recordsPayloadSchema,
  type MatchRecord,
  type RecordsPayload,
} from '../schemas/storageSchema';
import { safeWrite, StorageWriteError, type KeyValueStorage } from './keyValueStorage';

export const RECORDS_STORAGE_KEY = 'soro-pon.records.v1';
export const RECORDS_BACKUP_KEY = 'soro-pon.records.v1.corrupt-backup';

export const COIN_CAP_PER_MATCH = 500;
export const COIN_PARTICIPATION = 10;

type ReadRecordsResult = {
  records: RecordsPayload;
  issues: ValidationIssue[];
  readFailureCause?: unknown;
};

export type MatchCommitResult = {
  records: RecordsPayload;
  added: boolean;
  newlyUnlockedIds: string[];
  roleCollectionLimitReached: boolean;
};

export type RecordsStore = {
  load(): { records: RecordsPayload; issues: ValidationIssue[] };
  addRecord(record: MatchRecord, matchKey: string, wonRoleKey?: string): RecordsPayload;
  commitMatch(
    record: MatchRecord,
    matchKey: string,
    wonRoleKey: string | undefined,
    resolveAchievementIds: (nextRecords: RecordsPayload) => string[],
  ): MatchCommitResult;
  unlockAchievements(ids: string[]): RecordsPayload;
};

function normalizeOverLimitCollections(raw: unknown): {
  records: RecordsPayload;
  trimmed: string[];
} | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const source = raw as Record<string, unknown>;
  const candidate: Record<string, unknown> = { ...source };
  const trimmed: string[] = [];

  const trimArray = (key: string, max: number, label: string): void => {
    const value = source[key];
    if (Array.isArray(value) && value.length > max) {
      candidate[key] = value.slice(0, max);
      trimmed.push(`${label} ${value.length}件→${max}件`);
    }
  };

  trimArray('records', MAX_STORED_MATCH_RECORDS, '対局履歴');
  trimArray('roleCollection', MAX_ROLE_COLLECTION_ENTRIES, '役コレクション');
  trimArray('achievements', MAX_STORED_ACHIEVEMENTS, '実績');
  trimArray('recentMatchKeys', MAX_RECENT_MATCH_KEYS, '処理済み対局キー');

  if (trimmed.length === 0) {
    return null;
  }
  const parsed = recordsPayloadSchema.safeParse(candidate);
  return parsed.success ? { records: normalizeRecordsPayload(parsed.data), trimmed } : null;
}

export function createLocalStorageRecordsStore(storage: KeyValueStorage): RecordsStore {
  const read = (): ReadRecordsResult => {
    let raw: string | null;
    try {
      raw = storage.getItem(RECORDS_STORAGE_KEY);
    } catch (cause) {
      return {
        records: EMPTY_RECORDS,
        readFailureCause: cause,
        issues: [
          {
            code: 'L9005',
            severity: 'warning',
            message:
              'ブラウザの保存領域から対局記録を読み込めないため、このセッションでは空の記録として扱います。保存領域の設定を確認してください。',
          },
        ],
      };
    }
    if (raw === null) {
      return { records: EMPTY_RECORDS, issues: [] };
    }

    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      json = undefined;
    }

    if (json !== undefined) {
      const parsed = recordsPayloadSchema.safeParse(json);
      if (parsed.success) {
        return { records: normalizeRecordsPayload(parsed.data), issues: [] };
      }

      const normalized = normalizeOverLimitCollections(json);
      if (normalized !== null) {
        let backupSaved = true;
        let normalizedWritten = true;
        try {
          storage.setItem(RECORDS_BACKUP_KEY, raw);
        } catch {
          backupSaved = false;
        }
        try {
          storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(normalized.records));
        } catch {
          normalizedWritten = false;
        }
        const failures: string[] = [];
        if (!backupSaved) {
          failures.push('元データのバックアップを保存できませんでした');
        }
        if (!normalizedWritten) {
          failures.push('正規化した記録を書き戻せませんでした');
        }
        const suffix = failures.length > 0 ? ` ただし、${failures.join('。')}。` : '';
        return {
          records: normalized.records,
          issues: [
            {
              code: 'L9007',
              severity: 'warning',
              message: `以前のバージョンで保存上限を超えた記録を正規化しました(${normalized.trimmed.join('、')})。元データは可能な限りバックアップに退避しています。${suffix}`,
            },
          ],
        };
      }
    }

    let backupSaved = true;
    let activeRemoved = true;
    try {
      storage.setItem(RECORDS_BACKUP_KEY, raw);
    } catch {
      backupSaved = false;
    }
    try {
      storage.removeItem(RECORDS_STORAGE_KEY);
    } catch {
      activeRemoved = false;
    }
    const failures: string[] = [];
    if (!backupSaved) {
      failures.push('バックアップを保存できませんでした');
    }
    if (!activeRemoved) {
      failures.push('壊れた記録を削除できませんでした');
    }
    const suffix = failures.length > 0 ? ` ただし、${failures.join('。')}。` : '';
    return {
      records: EMPTY_RECORDS,
      issues: [
        {
          code: 'L9001',
          severity: 'warning',
          message: `対局記録が壊れていたため初期化しました。元データは可能な限りバックアップに退避しています。${suffix}`,
        },
      ],
    };
  };

  const requireReadableRecords = (): RecordsPayload => {
    const result = read();
    if (result.readFailureCause !== undefined) {
      throw new StorageWriteError(
        '保存済みの対局記録を読み込めないため、既存データを保護する目的で記録・コイン・実績を更新しませんでした。ブラウザの保存領域設定を確認してください。',
        result.readFailureCause,
      );
    }
    return result.records;
  };

  const write = (next: RecordsPayload, failureMessage: string): RecordsPayload => {
    safeWrite(() => storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(next)), failureMessage);
    return next;
  };

  const buildNextMatchRecords = (
    current: RecordsPayload,
    record: MatchRecord,
    matchKey: string,
    wonRoleKey?: string,
  ): { records: RecordsPayload; added: boolean; roleCollectionLimitReached: boolean } => {
    const recentKeys = current.recentMatchKeys ?? [];
    if (matchKey === current.lastMatchKey || recentKeys.includes(matchKey)) {
      return { records: current, added: false, roleCollectionLimitReached: false };
    }

    const isNewRole = wonRoleKey !== undefined && !current.roleCollection.includes(wonRoleKey);
    const roleCollectionLimitReached =
      isNewRole && current.roleCollection.length >= MAX_ROLE_COLLECTION_ENTRIES;
    const roleCollection =
      isNewRole && !roleCollectionLimitReached
        ? [...current.roleCollection, wonRoleKey]
        : current.roleCollection;

    return {
      added: true,
      roleCollectionLimitReached,
      records: {
        version: 1,
        coins: current.coins + record.coinsEarned,
        records: [record, ...current.records].slice(0, MAX_STORED_MATCH_RECORDS),
        roleCollection,
        achievements: current.achievements ?? [],
        totalMatches: (current.totalMatches ?? 0) + 1,
        lastMatchKey: matchKey,
        recentMatchKeys: [matchKey, ...recentKeys].slice(0, MAX_RECENT_MATCH_KEYS),
      },
    };
  };

  const mergeAchievementIds = (
    current: string[],
    requested: string[],
  ): { achievements: string[]; newlyUnlockedIds: string[] } => {
    const known = new Set(current);
    const achievements = [...current];
    const newlyUnlockedIds: string[] = [];
    for (const id of requested) {
      if (known.has(id) || achievements.length >= MAX_STORED_ACHIEVEMENTS) {
        continue;
      }
      known.add(id);
      achievements.push(id);
      newlyUnlockedIds.push(id);
    }
    return { achievements, newlyUnlockedIds };
  };

  const commitMatch = (
    record: MatchRecord,
    matchKey: string,
    wonRoleKey: string | undefined,
    resolveAchievementIds: (nextRecords: RecordsPayload) => string[],
  ): MatchCommitResult => {
    const current = requireReadableRecords();
    const nextMatch = buildNextMatchRecords(current, record, matchKey, wonRoleKey);
    if (!nextMatch.added) {
      return {
        records: current,
        added: false,
        newlyUnlockedIds: [],
        roleCollectionLimitReached: false,
      };
    }

    const merged = mergeAchievementIds(
      nextMatch.records.achievements ?? [],
      resolveAchievementIds(nextMatch.records),
    );
    const records = write(
      { ...nextMatch.records, achievements: merged.achievements },
      '対局結果の保存に失敗しました(空き容量が不足している可能性があります)。今回の記録・コイン・役コレクション・実績は保存されていません。',
    );
    return {
      records,
      added: true,
      newlyUnlockedIds: merged.newlyUnlockedIds,
      roleCollectionLimitReached: nextMatch.roleCollectionLimitReached,
    };
  };

  return {
    load() {
      const { records, issues } = read();
      return { records, issues };
    },

    addRecord(record: MatchRecord, matchKey: string, wonRoleKey?: string): RecordsPayload {
      return commitMatch(record, matchKey, wonRoleKey, () => []).records;
    },

    commitMatch,

    unlockAchievements(ids: string[]): RecordsPayload {
      const current = requireReadableRecords();
      const merged = mergeAchievementIds(current.achievements ?? [], ids);
      return write(
        { ...current, achievements: merged.achievements },
        '実績の保存に失敗しました(空き容量が不足している可能性があります)。操作自体や、すでに保存済みの対局記録・コインは失われていません。',
      );
    },
  };
}

export function buildMatchRecord(input: {
  dateMs: number;
  deckId: string;
  deckName: string;
  reason: 'tsumo' | 'ron' | 'draw';
  winnerName: string;
  humanWon: boolean;
  selectedWinRoleId?: string;
  selectedWinRoleName?: string;
  totalPoints?: number;
}): MatchRecord {
  const coinsEarned =
    input.humanWon && input.totalPoints !== undefined
      ? Math.min(input.totalPoints, COIN_CAP_PER_MATCH)
      : COIN_PARTICIPATION;
  return {
    dateMs: input.dateMs,
    deckId: input.deckId,
    deckName: input.deckName,
    reason: input.reason,
    winnerName: input.winnerName,
    humanWon: input.humanWon,
    ...(input.selectedWinRoleId !== undefined
      ? { selectedWinRoleId: input.selectedWinRoleId }
      : {}),
    ...(input.selectedWinRoleName !== undefined
      ? { selectedWinRoleName: input.selectedWinRoleName }
      : {}),
    ...(input.totalPoints !== undefined ? { totalPoints: input.totalPoints } : {}),
    coinsEarned,
  };
}
