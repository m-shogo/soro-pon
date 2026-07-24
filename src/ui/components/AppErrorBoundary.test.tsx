// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { ALL_LOCAL_DATA_KEYS } from '../../storage/resetLocalData';
import { executeEmergencyReset } from './AppErrorBoundary';

describe('AppErrorBoundary emergency reset', () => {
  it('全キー削除成功時だけreloadする', () => {
    const removed: string[] = [];
    const reload = vi.fn();

    const result = executeEmergencyReset(
      {
        removeItem(key: string) {
          removed.push(key);
        },
      },
      reload,
    );

    expect(removed).toEqual([...ALL_LOCAL_DATA_KEYS]);
    expect(result.failedKeys).toEqual([]);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('1件でも削除に失敗したら成功扱いでreloadしない', () => {
    const failedKey = ALL_LOCAL_DATA_KEYS[2]!;
    const reload = vi.fn();

    const result = executeEmergencyReset(
      {
        removeItem(key: string) {
          if (key === failedKey) {
            throw new DOMException('remove denied', 'SecurityError');
          }
        },
      },
      reload,
    );

    expect(result.failedKeys).toEqual([failedKey]);
    expect(reload).not.toHaveBeenCalled();
  });
});
