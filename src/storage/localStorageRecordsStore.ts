import type { ValidationIssue } from '../domain/validation';
import {
  EMPTY_RECORDS,
  recordsPayloadSchema,
  type MatchRecord,
  type RecordsPayload,
} from '../schemas/storageSchema';
import type { KeyValueStorage } from './keyValueStorage';

export const RECORDS_STORAGE_KEY = 'soro-pon.records.v1';

// docs/29: 獲得コイン = totalPoints(上限500)。流局/敗北は参加報酬10。
export const COIN_CAP_PER_MATCH = 500;
export const COIN_PARTICIPATION = 10;

export type RecordsStore = {
  load(): { records: RecordsPayload; issues: ValidationIssue[] };
  addRecord(record: MatchRecord, wonRoleKey?: string): RecordsPayload;
  /** 実績を解放して保存する。既知のIDは重複しない。 */
  unlockAchievements(ids: string[]): RecordsPayload;
};

export function createLocalStorageRecordsStore(storage: KeyValueStorage): RecordsStore {
  const read = (): { records: RecordsPayload; issues: ValidationIssue[] } => {
    const raw = storage.getItem(RECORDS_STORAGE_KEY);
    if (raw === null) {
      return { records: EMPTY_RECORDS, issues: [] };
    }
    try {
      const parsed = recordsPayloadSchema.safeParse(JSON.parse(raw) as unknown);
      if (parsed.success) {
        return { records: parsed.data, issues: [] };
      }
    } catch {
      // 回復処理へ
    }
    storage.removeItem(RECORDS_STORAGE_KEY);
    return {
      records: EMPTY_RECORDS,
      issues: [
        {
          code: 'L9001',
          severity: 'warning',
          message: '対局記録が壊れていたため初期化しました。',
        },
      ],
    };
  };

  const write = (next: RecordsPayload): RecordsPayload => {
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  return {
    load: read,
    addRecord(record: MatchRecord, wonRoleKey?: string): RecordsPayload {
      const { records: current } = read();
      const roleCollection =
        wonRoleKey !== undefined && !current.roleCollection.includes(wonRoleKey)
          ? [...current.roleCollection, wonRoleKey]
          : current.roleCollection;
      return write({
        version: 1,
        coins: current.coins + record.coinsEarned,
        records: [record, ...current.records].slice(0, 100),
        roleCollection,
        achievements: current.achievements ?? [],
        totalMatches: (current.totalMatches ?? 0) + 1,
      });
    },
    unlockAchievements(ids: string[]): RecordsPayload {
      const { records: current } = read();
      const known = new Set(current.achievements ?? []);
      const merged = [...(current.achievements ?? [])];
      for (const id of ids) {
        if (!known.has(id)) {
          known.add(id);
          merged.push(id);
        }
      }
      return write({ ...current, achievements: merged });
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
