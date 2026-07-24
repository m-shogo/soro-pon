import { DECKS_BACKUP_KEY, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import { RECORDS_BACKUP_KEY, RECORDS_STORAGE_KEY } from './localStorageRecordsStore';
import { SETTINGS_BACKUP_KEY, SETTINGS_STORAGE_KEY } from './localStorageSettingsStore';

export const SKIN_SELECTION_KEY = 'soro-pon.skin.v1';

// アプリが使う全localStorageキー。新しいactive/backupキーを増やしたら必ず追加する。
// TOPの「全て削除して初期化する」は、この一覧を完全に消す契約。
export const ALL_LOCAL_DATA_KEYS = [
  DECKS_STORAGE_KEY,
  DECKS_BACKUP_KEY,
  RECORDS_STORAGE_KEY,
  RECORDS_BACKUP_KEY,
  SETTINGS_STORAGE_KEY,
  SETTINGS_BACKUP_KEY,
  SKIN_SELECTION_KEY,
] as const;

export type ResetLocalDataResult = {
  removedKeys: string[];
  failedKeys: string[];
};

// ローカルデータの初期化(P1-4 recovery)。
// 削除は既知キーのみ(localStorage.clear()で他アプリのデータを消さない)。
// 各キーを独立して試し、UIが「全削除成功」を誤表示しないよう結果を返す。
export function resetAllLocalData(
  storage: Pick<Storage, 'removeItem'>,
): ResetLocalDataResult {
  const removedKeys: string[] = [];
  const failedKeys: string[] = [];

  for (const key of ALL_LOCAL_DATA_KEYS) {
    try {
      storage.removeItem(key);
      removedKeys.push(key);
    } catch {
      failedKeys.push(key);
    }
  }

  return { removedKeys, failedKeys };
}
