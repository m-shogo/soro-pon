import type { ValidationIssue } from '../domain/validation';
import {
  DEFAULT_SETTINGS,
  settingsPayloadSchema,
  type SettingsPayload,
} from '../schemas/storageSchema';
import { safeWrite, type KeyValueStorage } from './keyValueStorage';

export const SETTINGS_STORAGE_KEY = 'soro-pon.settings.v1';
export const SETTINGS_BACKUP_KEY = 'soro-pon.settings.v1.corrupt-backup';

export type SettingsStore = {
  load(): { settings: SettingsPayload; issues: ValidationIssue[] };
  save(settings: SettingsPayload): void;
};

// 設定の読み込みもschema経由。壊れていたらdefaultへ回復する。
// 保存領域そのものが読み書きを拒否しても、起動処理は例外停止させない。
export function createLocalStorageSettingsStore(storage: KeyValueStorage): SettingsStore {
  return {
    load() {
      let raw: string | null;
      try {
        raw = storage.getItem(SETTINGS_STORAGE_KEY);
      } catch {
        return {
          settings: DEFAULT_SETTINGS,
          issues: [
            {
              code: 'L9005',
              severity: 'warning',
              message:
                'ブラウザの保存領域から設定を読み込めないため、このセッションでは初期設定を使用します。保存領域の設定を確認してください。',
            },
          ],
        };
      }
      if (raw === null) {
        return { settings: DEFAULT_SETTINGS, issues: [] };
      }
      try {
        const parsed = settingsPayloadSchema.safeParse(JSON.parse(raw) as unknown);
        if (parsed.success) {
          return { settings: parsed.data, issues: [] };
        }
      } catch {
        // 回復処理へ
      }

      let backupSaved = true;
      let activeRemoved = true;
      try {
        storage.setItem(SETTINGS_BACKUP_KEY, raw);
      } catch {
        backupSaved = false;
      }
      try {
        storage.removeItem(SETTINGS_STORAGE_KEY);
      } catch {
        activeRemoved = false;
      }
      const failures: string[] = [];
      if (!backupSaved) {
        failures.push('バックアップを保存できませんでした');
      }
      if (!activeRemoved) {
        failures.push('壊れた設定を削除できませんでした');
      }
      const suffix = failures.length > 0 ? ` ただし、${failures.join('。')}。` : '';
      return {
        settings: DEFAULT_SETTINGS,
        issues: [
          {
            code: 'L9001',
            severity: 'warning',
            message: `設定データが壊れていたため初期設定に戻しました。元データは可能な限りバックアップに退避しています。${suffix}`,
          },
        ],
      };
    },

    save(settings: SettingsPayload): void {
      safeWrite(
        () => storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)),
        '設定の保存に失敗しました(空き容量が不足している可能性があります)。',
      );
    },
  };
}
