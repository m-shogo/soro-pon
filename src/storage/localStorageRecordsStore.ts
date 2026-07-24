import type { ValidationIssue } from '../domain/validation';
import {
  EMPTY_RECORDS,
  normalizeRecordsPayload,
  recordsPayloadSchema,
  type MatchRecord,
  type RecordsPayload,
} from '../schemas/storageSchema';
import { safeWrite, StorageWriteError, type KeyValueStorage } from './keyValueStorage';

export const RECORDS_STORAGE_KEY = 'soro-pon.records.v1';
export const RECORDS_BACKUP_KEY = 'soro-pon.records.v1.corrupt-backup';

// docs/29: 獲得コイン = totalPoints(上限500)。流局/敗北は参加報酬10。
export const COIN_CAP_PER_MATCH = 500;
export const COIN_PARTICIPATION = 10;

type ReadRecordsResult = {
  records: RecordsPayload;
  issues: ValidationIssue[];
  readFailureCause?: unknown;
};

export type RecordsStore = {
  load(): { records: RecordsPayload; issues: ValidationIssue[] };
  /**
   * matchKeyは1つの対局結果を一意に指す識別子(結果確定イベント単位)。
   * 処理済みmatchKeyならno-op(コイン/records/totalMatchesを増やさない)。
   */
  addRecord(record: MatchRecord, matchKey: string, wonRoleKey?: string): RecordsPayload;
  /** 実績を解放して保存する。既知のIDは重複しない。 */
  unlockAchievements(ids: string[]): RecordsPayload;
};

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
    try {
      const parsed = recordsPayloadSchema.safeParse(JSON.parse(raw) as unknown);
      if (parsed.success) {
        // 旧データのoptionalフィールド欠落を安全なdefaultへ正規化する
        return { records: normalizeRecordsPayload(parsed.data), issues: [] };
      }
    } catch {
      // 回復処理へ
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

  return {
    load() {
      const { records, issues } = read();
      return { records, issues };
    },

    addRecord(record: MatchRecord, matchKey: string, wonRoleKey?: string): RecordsPayload {
      const current = requireReadableRecords();
      // 同じ結果確定イベントを二重記録しない(冪等)。
      // P2-4: 直近1件だけでなく処理済みキー一覧(最大20件)と照合する。
      const recentKeys = current.recentMatchKeys ?? [];
      if (matchKey === current.lastMatchKey || recentKeys.includes(matchKey)) {
        return current;
      }
      const roleCollection =
        wonRoleKey !== undefined && !current.roleCollection.includes(wonRoleKey)
          ? [...current.roleCollection, wonRoleKey]
          : current.roleCollection;
      return write(
        {
          version: 1,
          coins: current.coins + record.coinsEarned,
          records: [record, ...current.records].slice(0, 100),
          roleCollection,
          achievements: current.achievements ?? [],
          totalMatches: (current.totalMatches ?? 0) + 1,
          lastMatchKey: matchKey,
          recentMatchKeys: [matchKey, ...recentKeys].slice(0, 20),
        },
        '対局結果の保存に失敗しました(空き容量が不足している可能性があります)。今回の記録・コイン・役コレクションは保存されていません。',
      );
    },

    unlockAchievements(ids: string[]): RecordsPayload {
      const current = requireReadableRecords();
      const known = new Set(current.achievements ?? []);
      const merged = [...(current.achievements ?? [])];
      for (const id of ids) {
        if (!known.has(id)) {
          known.add(id);
          merged.push(id);
        }
      }
      return write(
        { ...current, achievements: merged },
        '実績の保存に失敗しました(空き容量が不足している可能性があります)。操作自体や、すでに保存済みの対局記録・コインは失われていません。',
      );
    },
  };
}

// Resultから記録を作る補助(coins計算をUIに散らさない)
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
