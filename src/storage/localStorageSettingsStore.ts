import type { ValidationIssue } from '../domain/validation';
import {
  DEFAULT_SETTINGS,
  settingsPayloadSchema,
  type SettingsPayload,
} from '../schemas/storageSchema';
import { safeWrite, type KeyValueStorage } from './keyValueStorage';

export const SETTINGS_STORAGE_KEY = 'soro-pon.settings.v1';

export type SettingsStore = {
  load(): { settings: SettingsPayload; issues: ValidationIssue[] };
  save(settings: SettingsPayload): void;
};

// 設定の読み込みもschema経由。壊れていたらdefaultへ回復する。
export function createLocalStorageSettingsStore(storage: KeyValueStorage): SettingsStore {
  return {
    load() {
      const raw = storage.getItem(SETTINGS_STORAGE_KEY);
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
      storage.removeItem(SETTINGS_STORAGE_KEY);
      return {
        settings: DEFAULT_SETTINGS,
        issues: [
          {
            code: 'L9001',
            severity: 'warning',
            message: '設定データが壊れていたため初期設定に戻しました。',
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
