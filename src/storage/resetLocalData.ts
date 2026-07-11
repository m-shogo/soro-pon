import { DECKS_BACKUP_KEY, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import { RECORDS_STORAGE_KEY } from './localStorageRecordsStore';
import { SETTINGS_STORAGE_KEY } from './localStorageSettingsStore';

export const SKIN_SELECTION_KEY = 'soro-pon.skin.v1';

// アプリが使う全localStorageキー。新しいキーを増やしたらここにも追加する。
export const ALL_LOCAL_DATA_KEYS = [
  DECKS_STORAGE_KEY,
  DECKS_BACKUP_KEY,
  RECORDS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SKIN_SELECTION_KEY,
] as const;

// ローカルデータの初期化(P1-4 recovery)。
// 削除は既知キーのみ(localStorage.clear()で他アプリのデータを消さない)。
export function resetAllLocalData(storage: Pick<Storage, 'removeItem'>): void {
  for (const key of ALL_LOCAL_DATA_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      // 1件消せなくても続行する
    }
  }
}
