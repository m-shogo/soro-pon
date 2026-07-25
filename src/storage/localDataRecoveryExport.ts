import { DECKS_BACKUP_KEY } from './localStorageDeckStore';
import { RECORDS_BACKUP_KEY } from './localStorageRecordsStore';
import { SETTINGS_BACKUP_KEY } from './localStorageSettingsStore';

export const RECOVERY_BACKUP_KEYS = [
  DECKS_BACKUP_KEY,
  RECORDS_BACKUP_KEY,
  SETTINGS_BACKUP_KEY,
] as const;

export type RecoveryBackupEntry = {
  key: (typeof RECOVERY_BACKUP_KEYS)[number];
  raw: string | null;
  readError: boolean;
};

export type LocalDataRecoveryBundle = {
  format: 'soro-pon-local-recovery.v1';
  exportedAtMs: number;
  entries: RecoveryBackupEntry[];
};

export type BuildRecoveryBundleResult = {
  bundle: LocalDataRecoveryBundle;
  recoveredCount: number;
  failedKeys: string[];
};

/**
 * 破損退避データは再解釈せずraw文字列のまま回収する。
 * 1キーの読み取り失敗で他キーまで失わないよう独立して読む。
 */
export function buildLocalDataRecoveryBundle(
  storage: Pick<Storage, 'getItem'>,
  exportedAtMs = Date.now(),
): BuildRecoveryBundleResult {
  const failedKeys: string[] = [];
  const entries: RecoveryBackupEntry[] = RECOVERY_BACKUP_KEYS.map((key) => {
    try {
      return { key, raw: storage.getItem(key), readError: false };
    } catch {
      failedKeys.push(key);
      return { key, raw: null, readError: true };
    }
  });

  return {
    bundle: {
      format: 'soro-pon-local-recovery.v1',
      exportedAtMs,
      entries,
    },
    recoveredCount: entries.filter((entry) => entry.raw !== null).length,
    failedKeys,
  };
}

export function serializeLocalDataRecoveryBundle(bundle: LocalDataRecoveryBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
