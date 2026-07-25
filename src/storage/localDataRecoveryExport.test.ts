import { describe, expect, it } from 'vitest';
import { createMemoryStorage } from './keyValueStorage';
import {
  buildLocalDataRecoveryBundle,
  RECOVERY_BACKUP_KEYS,
  serializeLocalDataRecoveryBundle,
} from './localDataRecoveryExport';

describe('local data recovery export', () => {
  it('破損JSONを解釈せずraw文字列のまま保持する', () => {
    const storage = createMemoryStorage();
    storage.setItem(RECOVERY_BACKUP_KEYS[0], '{not-json\nraw');

    const result = buildLocalDataRecoveryBundle(storage, 123456);

    expect(result.recoveredCount).toBe(1);
    expect(result.failedKeys).toEqual([]);
    expect(result.bundle).toEqual({
      format: 'soro-pon-local-recovery.v1',
      exportedAtMs: 123456,
      entries: [
        { key: RECOVERY_BACKUP_KEYS[0], raw: '{not-json\nraw', readError: false },
        { key: RECOVERY_BACKUP_KEYS[1], raw: null, readError: false },
        { key: RECOVERY_BACKUP_KEYS[2], raw: null, readError: false },
      ],
    });
  });

  it('1キーの読み取り失敗でも他の退避コピーを回収する', () => {
    const values = new Map<string, string>([
      [RECOVERY_BACKUP_KEYS[0], 'deck-raw'],
      [RECOVERY_BACKUP_KEYS[2], 'settings-raw'],
    ]);
    const storage = {
      getItem(key: string): string | null {
        if (key === RECOVERY_BACKUP_KEYS[1]) {
          throw new Error('blocked');
        }
        return values.get(key) ?? null;
      },
    };

    const result = buildLocalDataRecoveryBundle(storage, 1);

    expect(result.recoveredCount).toBe(2);
    expect(result.failedKeys).toEqual([RECOVERY_BACKUP_KEYS[1]]);
    expect(result.bundle.entries).toEqual([
      { key: RECOVERY_BACKUP_KEYS[0], raw: 'deck-raw', readError: false },
      { key: RECOVERY_BACKUP_KEYS[1], raw: null, readError: true },
      { key: RECOVERY_BACKUP_KEYS[2], raw: 'settings-raw', readError: false },
    ]);
  });

  it('退避コピーがない場合も安定したversion付きJSONを生成する', () => {
    const result = buildLocalDataRecoveryBundle(createMemoryStorage(), 42);
    const serialized = serializeLocalDataRecoveryBundle(result.bundle);

    expect(result.recoveredCount).toBe(0);
    expect(result.failedKeys).toEqual([]);
    expect(result.bundle.entries.every((entry) => entry.raw === null)).toBe(true);
    expect(serialized.endsWith('\n')).toBe(true);
    expect(JSON.parse(serialized)).toEqual(result.bundle);
  });
});
