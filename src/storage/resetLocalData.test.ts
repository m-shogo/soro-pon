import { describe, expect, it } from 'vitest';
import { DECKS_BACKUP_KEY, DECKS_STORAGE_KEY } from './localStorageDeckStore';
import { RECORDS_BACKUP_KEY, RECORDS_STORAGE_KEY } from './localStorageRecordsStore';
import { SETTINGS_BACKUP_KEY, SETTINGS_STORAGE_KEY } from './localStorageSettingsStore';
import { ALL_LOCAL_DATA_KEYS, resetAllLocalData, SKIN_SELECTION_KEY } from './resetLocalData';

describe('resetAllLocalData', () => {
  it('active data・corrupt backup・skin selectionを全て削除対象に含める', () => {
    expect(new Set(ALL_LOCAL_DATA_KEYS)).toEqual(
      new Set([
        DECKS_STORAGE_KEY,
        DECKS_BACKUP_KEY,
        RECORDS_STORAGE_KEY,
        RECORDS_BACKUP_KEY,
        SETTINGS_STORAGE_KEY,
        SETTINGS_BACKUP_KEY,
        SKIN_SELECTION_KEY,
      ]),
    );
  });

  it('全キー削除成功時は全件をremovedとして返す', () => {
    const result = resetAllLocalData({ removeItem() {} });

    expect(result.failedKeys).toEqual([]);
    expect(result.removedKeys).toEqual([...ALL_LOCAL_DATA_KEYS]);
  });

  it('1件のremove失敗があっても残りを続行し、失敗キーを返す', () => {
    const attempted: string[] = [];
    const failedKey = RECORDS_BACKUP_KEY;

    const result = resetAllLocalData({
      removeItem(key: string) {
        attempted.push(key);
        if (key === failedKey) {
          throw new DOMException('remove denied', 'SecurityError');
        }
      },
    });

    expect(attempted).toEqual([...ALL_LOCAL_DATA_KEYS]);
    expect(result.failedKeys).toEqual([failedKey]);
    expect(result.removedKeys).not.toContain(failedKey);
    expect(result.removedKeys).toHaveLength(ALL_LOCAL_DATA_KEYS.length - 1);
    expect(attempted.at(-1)).toBe(SKIN_SELECTION_KEY);
  });
});
